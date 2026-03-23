import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-white p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  );
}
