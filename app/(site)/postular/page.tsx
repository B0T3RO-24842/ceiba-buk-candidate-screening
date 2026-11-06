import FormularioPostulacion from "@/components/FormularioPostulacion";
import { VACANTES } from "@/lib/vacantes";
import type { VacantePublica } from "@/types/candidato";

export const metadata = {
  title: "Formulario de postulación",
  description:
    "Interfaz de postulación de ScreenFlow: completa tu preentrevista y envía tu hoja de vida de forma segura.",
};

export default function PostularPage() {
  const vacantes: VacantePublica[] = VACANTES.map(
    ({ id, nombre, descripcion, preguntas }) => ({
      id,
      nombre,
      descripcion,
      preguntas: preguntas.map(
        ({ id: preguntaId, texto, tipo, obligatoria, opciones }) => ({
          id: preguntaId,
          texto,
          tipo,
          obligatoria,
          ...(opciones ? { opciones } : {})
        })
      )
    })
  );

  return <FormularioPostulacion vacantes={vacantes} />;
}
