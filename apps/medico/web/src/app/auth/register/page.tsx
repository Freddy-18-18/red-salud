import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterMedicoPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 py-8 px-4">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </main>
  );
}
