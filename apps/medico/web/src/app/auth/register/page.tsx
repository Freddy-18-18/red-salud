import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterMedicoPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-white py-8 px-4">
      <div className="w-full max-w-2xl">
        <RegisterForm />
      </div>
    </main>
  );
}
