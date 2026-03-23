export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Red Salud — Consultorio Médico</h1>
        <p className="text-lg text-gray-600">Espacio de trabajo para profesionales de salud - consultas, agenda, pacientes</p>
        <div className="flex gap-4 justify-center mt-8">
          <a href="/auth/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Iniciar Sesión
          </a>
        </div>
      </div>
    </main>
  );
}
