import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';

export const metadata = {
  title: 'Configura tu Consultorio | Red Salud',
  description: 'Completa tu perfil medico y configura tu consultorio digital',
};

export default function CompleteProfilePage() {
  return <OnboardingWizard />;
}
