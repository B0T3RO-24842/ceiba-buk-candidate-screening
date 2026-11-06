import { ImageResponse } from "next/og";

export const alt = "ScreenFlow · CEIBA BUK Candidate Screening";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#faf8f2",
          padding: "64px",
          fontFamily: "sans-serif",
          color: "#111111",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "18px",
                background: "#e8c200",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: 900,
              }}
            >
              SF
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "34px", fontWeight: 900, letterSpacing: "-1px" }}>
                ScreenFlow
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  letterSpacing: "3px",
                  color: "#5f5b52",
                }}
              >
                CEIBA · BUK
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              border: "2px solid #e7e1d2",
              borderRadius: "999px",
              padding: "10px 18px",
              fontSize: "16px",
              fontWeight: 700,
              color: "#6b5700",
              background: "#fff6cc",
            }}
          >
            Proyecto académico aprobado
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "68px",
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: "-2px",
            }}
          >
            <div style={{ display: "flex" }}>Conecta LinkedIn</div>
            <div style={{ display: "flex" }}>con BUK sin fricción.</div>
          </div>
          <div style={{ fontSize: "26px", color: "#5f5b52", lineHeight: 1.35 }}>
            Middleware de tamizaje automatizado de talento.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {["LinkedIn", "ScreenFlow", "BUK"].map((paso, indice) => (
            <div key={paso} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 24px",
                  borderRadius: "14px",
                  background: indice === 1 ? "#111111" : "#ffffff",
                  color: indice === 1 ? "#e8c200" : "#111111",
                  border: "2px solid #e7e1d2",
                  fontSize: "20px",
                  fontWeight: 800,
                }}
              >
                {paso}
              </div>
              {indice < 2 && (
                <div style={{ display: "flex", fontSize: "28px", color: "#b89a00" }}>
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
