import { PatientDetail } from '@/components/patients/patient-detail';

interface PageProps {
  params: Promise<{ patientId: string }>;
}

export default async function PatientDetailPage({ params }: PageProps) {
  const { patientId } = await params;
  return <PatientDetail patientId={patientId} />;
}
