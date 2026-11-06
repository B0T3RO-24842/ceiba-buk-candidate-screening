import http from "node:http";

const PORT = Number(process.env.MOCK_BUK_PORT || 4000);
const MAX_CV_BYTES = 5 * 1024 * 1024;
const MAX_BODY_BYTES = 10 * 1024 * 1024;
const startedAt = new Date().toISOString();

const registros = new Map();
let contador = 0;

function responder(res, status, body) {
  const contenido = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(contenido),
  });
  res.end(contenido);
}

function maskEmail(email) {
  const [usuario, dominio] = String(email ?? "").split("@");
  if (!usuario || !dominio) return "***";
  return `${usuario.slice(0, 1)}***@${dominio}`;
}

function resumen(payload) {
  return {
    email: payload.email,
    nombre: payload.nombre,
    primer_apellido: payload.primer_apellido,
    segundo_apellido: payload.segundo_apellido ?? null,
    celular: payload.celular,
    pais: payload.pais,
    ciudad: payload.ciudad,
    habeasData: payload.habeasData,
    acepta_tratamiento_datos: payload.acepta_tratamiento_datos ?? null,
    cargo: payload.cargo,
    origen: payload.origen,
    referrer: payload.referrer,
    cv: payload.cv
      ? {
          nombre_archivo: payload.cv.nombre_archivo,
          tipo_mime: payload.cv.tipo_mime,
          tamano_bytes: payload.cv.tamano_bytes,
          tiene_base64: Boolean(payload.cv.contenido_base64),
          base64_length: payload.cv.contenido_base64?.length ?? 0,
          referencia: payload.cv.referencia ?? null,
        }
      : null,
    fecha_postulacion: payload.fecha_postulacion ?? null,
    linkedin: payload.linkedin ?? null,
  };
}

function validarPayload(payload) {
  const errores = {};

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, errores: { payload: "El cuerpo debe ser un objeto JSON." } };
  }

  for (const campo of ["email", "nombre", "primer_apellido", "celular", "pais", "ciudad"]) {
    if (typeof payload[campo] !== "string" || !payload[campo].trim()) {
      errores[campo] = `El campo ${campo} es obligatorio.`;
    }
  }

  if (!payload.cargo || typeof payload.cargo !== "object" || !payload.cargo.id || !payload.cargo.nombre) {
    errores.cargo = "El cargo debe incluir id y nombre.";
  }

  if (payload.habeasData !== true) {
    errores.habeasData = "El campo habeasData debe ser true.";
  }

  if (payload.origen !== "LinkedIn") {
    errores.origen = 'El origen debe ser "LinkedIn".';
  }

  if (payload.referrer !== "Importadores Curriculum") {
    errores.referrer = 'El referrer debe ser "Importadores Curriculum".';
  }

  const cv = payload.cv;
  if (!cv || typeof cv !== "object") {
    errores.cv = "El CV es obligatorio.";
  } else if (typeof cv.contenido_base64 === "string" && cv.contenido_base64.trim()) {
    const buffer = Buffer.from(cv.contenido_base64, "base64");
    if (buffer.length === 0) errores.cv = "El CV en Base64 está vacío.";
    else if (buffer.length > MAX_CV_BYTES) errores.cv = "El CV supera el límite de 5 MB.";
    else if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
      errores.cv = "El CV no tiene firma PDF válida (%PDF-).";
    }
  } else if (typeof cv.referencia === "string" && cv.referencia.trim()) {
    // La referencia se acepta para el simulador; BUK producción puede exigir Base64.
  } else {
    errores.cv = "El CV debe incluir contenido_base64 o referencia.";
  }

  return { ok: Object.keys(errores).length === 0, errores };
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "GET" && url.pathname === "/health") {
    return responder(res, 200, {
      ok: true,
      service: "mock-buk",
      startedAt,
      now: new Date().toISOString(),
    });
  }

  if (req.method !== "POST" || url.pathname !== "/api/v1/applicants") {
    return responder(res, 404, {
      ok: false,
      error: "Ruta no encontrada. Usa POST /api/v1/applicants.",
    });
  }

  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ") || auth.slice(7).trim().length === 0) {
    return responder(res, 401, {
      ok: false,
      error: "Falta Authorization: Bearer <token>.",
    });
  }

  const contentLength = Number(req.headers["content-length"] || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return responder(res, 413, { ok: false, error: "El cuerpo supera 10 MB." });
  }

  let body = "";
  let excedido = false;

  req.on("data", (chunk) => {
    if (excedido) return;
    body += chunk;
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
      excedido = true;
      responder(res, 413, { ok: false, error: "El cuerpo supera 10 MB." });
      req.destroy();
    }
  });

  req.on("end", () => {
    if (excedido) return;

    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      return responder(res, 400, { ok: false, error: "JSON inválido." });
    }

    const validacion = validarPayload(payload);
    if (!validacion.ok) {
      console.warn(`[mock-buk] Payload rechazado: ${Object.keys(validacion.errores).join(", ")}`);
      return responder(res, 422, {
        ok: false,
        errores: validacion.errores,
        recibido: resumen(payload),
      });
    }

    const existente = registros.get(payload.email);
    const id = existente?.id ?? `BUK-${Date.now().toString(36).toUpperCase()}-${String(++contador).padStart(3, "0")}`;
    const duplicado = Boolean(existente);

    registros.set(payload.email, { id, payload });

    console.log(
      `[mock-buk] POST ${url.pathname} | ${maskEmail(payload.email)} | ${payload.cargo.id} | ${payload.origen}/${payload.referrer} | CV ${payload.cv.tamano_bytes ?? 0} B | id ${id}${duplicado ? " (actualizado)" : ""}`,
    );

    return responder(res, 200, {
      ok: true,
      id,
      duplicado,
      message: duplicado
        ? "El postulante ya existía; se actualizó el registro."
        : "Postulante registrado en la vacante.",
      recibido: resumen(payload),
      traza: {
        endpoint: url.pathname,
        metodo: req.method,
        autorizacion: `Bearer ***${auth.slice(-4)}`,
        contentLength: Buffer.byteLength(body),
        recibidoEn: new Date().toISOString(),
      },
    });
  });
});

server.listen(PORT, () => {
  console.log(`[mock-buk] Escuchando en http://localhost:${PORT}`);
  console.log(`[mock-buk] POST http://localhost:${PORT}/api/v1/applicants`);
  console.log(`[mock-buk] GET  http://localhost:${PORT}/health`);
});

process.on("SIGINT", () => {
  console.log("\n[mock-buk] Detenido.");
  server.close(() => process.exit(0));
});
