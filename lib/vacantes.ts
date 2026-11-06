import type { VacanteConfig } from "@/types/candidato";

export const VACANTES: VacanteConfig[] = [
  {
    id: "DEV-JAVA-SR",
    nombre: "Desarrollador Java Senior",
    descripcion:
      "Buscamos un perfil con experiencia comprobada construyendo servicios con Java y Spring Boot, cómodo con bases de datos relacionales y trabajo híbrido en Bogotá.",
    preguntas: [
      {
        id: "exp-java",
        texto: "¿Cuentas con al menos 3 años de experiencia profesional desarrollando con Java?",
        tipo: "sino",
        obligatoria: true,
        peso: 25,
        respuestaAprobatoria: true
      },
      {
        id: "spring-boot",
        texto: "¿Has construido y desplegado servicios con Spring Boot en producción?",
        tipo: "sino",
        obligatoria: true,
        peso: 25,
        respuestaAprobatoria: true
      },
      {
        id: "nivel-sql",
        texto: "¿Cuál es tu nivel de dominio de SQL?",
        tipo: "lista",
        obligatoria: false,
        peso: 20,
        opciones: ["Básico", "Intermedio", "Avanzado", "Experto"],
        opcionesAprobatorias: ["Avanzado", "Experto"]
      },
      {
        id: "proyectos-liderados",
        texto: "¿Cuántos proyectos profesionales has liderado técnicamente?",
        tipo: "numero",
        obligatoria: false,
        peso: 15,
        minimo: 2
      },
      {
        id: "modalidad-hibrida",
        texto: "¿Tienes disponibilidad para trabajar en modalidad híbrida en Bogotá?",
        tipo: "sino",
        obligatoria: false,
        peso: 15,
        respuestaAprobatoria: true
      }
    ]
  },
  {
    id: "DOC-MATEMATICAS",
    nombre: "Docente de Matemáticas",
    descripcion:
      "Buscamos docentes para acompañar procesos de aprendizaje en matemáticas, con experiencia en aula y manejo de herramientas digitales para la enseñanza.",
    preguntas: [
      {
        id: "titulo-docencia",
        texto: "¿Cuentas con formación o título relacionado con docencia o matemáticas?",
        tipo: "sino",
        obligatoria: true,
        peso: 25,
        respuestaAprobatoria: true
      },
      {
        id: "experiencia-aula",
        texto: "¿Cuántos años de experiencia tienes enseñando matemáticas?",
        tipo: "numero",
        obligatoria: true,
        peso: 25,
        minimo: 2
      },
      {
        id: "nivel-educativo",
        texto: "¿En qué nivel educativo tienes mayor experiencia?",
        tipo: "lista",
        obligatoria: false,
        peso: 20,
        opciones: ["Primaria", "Secundaria", "Media", "Universitaria"],
        opcionesAprobatorias: ["Secundaria", "Media"]
      },
      {
        id: "herramientas-digitales",
        texto: "¿Cuál es tu dominio de herramientas digitales para enseñar?",
        tipo: "lista",
        obligatoria: false,
        peso: 15,
        opciones: ["Ninguna", "Básicas", "Intermedias", "Avanzadas"],
        opcionesAprobatorias: ["Intermedias", "Avanzadas"]
      },
      {
        id: "disponibilidad-viajar",
        texto: "¿Tienes disponibilidad para desplazarte entre sedes?",
        tipo: "sino",
        obligatoria: false,
        peso: 15,
        respuestaAprobatoria: true
      }
    ]
  }
];

export function obtenerVacante(id: string): VacanteConfig | undefined {
  return VACANTES.find((vacante) => vacante.id === id);
}
