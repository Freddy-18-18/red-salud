import { ICD11Demo } from "@/components/dashboard/medico/demos/icd11-demo";

export const metadata = {
  title: "Demo ICD-11 API | Red Salud",
  description: "Demostración de la integración con la API oficial de ICD-11 de la OMS",
};

export default function ICD11DemoPage() {
  return <ICD11Demo />;
}
