import SimuladorLinkedIn from "@/components/SimuladorLinkedIn";

export const metadata = {
  title: "Simulador LinkedIn → BUK",
  description:
    "Prueba el flujo completo de ScreenFlow: recibe una postulación simulada de LinkedIn, valida los datos y regístrala en el Mock BUK.",
};

export default function SimuladorPage() {
  return <SimuladorLinkedIn />;
}
