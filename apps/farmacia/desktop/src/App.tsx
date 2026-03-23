import { Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-3xl font-bold">Red Salud — Farmacia Desktop</h1>
    </div>
  );
}

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center">Iniciar Sesión</h1>
      </div>
    </div>
  );
}
