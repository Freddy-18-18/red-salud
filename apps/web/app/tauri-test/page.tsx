'use client';

import { useEffect, useState } from 'react';
import { tauriApiService } from '@/lib/services/tauri-api-service';
import { Button } from "@red-salud/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@red-salud/ui";
import { Alert, AlertDescription } from "@red-salud/ui";

export default function TauriTestPage() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [testResults, setTestResults] = useState<Array<{ test: string; result: string; status: 'success' | 'error' }>>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setIsDesktop(tauriApiService.isDesktop());
  }, []);

  const addResult = (test: string, result: string, status: 'success' | 'error') => {
    setTestResults(prev => [...prev, { test, result, status }]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Verificar entorno
      addResult('Entorno', isDesktop ? 'Desktop (Tauri)' : 'Web (Browser)', 'success');

      // Test 2: Guardar datos offline
      await tauriApiService.saveOfflineData('test_key', { message: 'Hello Tauri', timestamp: Date.now() });
      addResult('Guardar datos offline', 'Datos guardados correctamente', 'success');

      // Test 3: Leer datos offline
      const data = await tauriApiService.getOfflineData('test_key');
      addResult('Leer datos offline', JSON.stringify(data), 'success');

      // Test 4: Verificar conectividad
      const isOnline = await tauriApiService.checkConnectivity();
      addResult('Conectividad', isOnline ? 'En línea ✅' : 'Sin conexión ❌', 'success');

      // Test 5: Obtener configuración de Supabase
      const config = await tauriApiService.getSupabaseConfig();
      addResult('Configuración Supabase', `URL: ${config.url.substring(0, 30)}...`, 'success');

      // Test 6: Eliminar datos offline
      await tauriApiService.deleteOfflineData('test_key');
      addResult('Eliminar datos offline', 'Datos eliminados correctamente', 'success');

      addResult('Resumen', '✅ Todos los tests pasaron correctamente', 'success');
    } catch (error) {
      addResult('Error', `❌ ${error}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  if (!isDesktop) {
    return (
      <div className="container mx-auto p-8">
        <Alert variant="destructive">
          <AlertDescription>
            ⚠️ No estás en la aplicación desktop de Tauri.
            <br />
            <br />
            Para probar las funcionalidades de Tauri, ejecuta:
            <br />
            <code className="bg-black text-white px-2 py-1 rounded mt-2 inline-block">
              npm run tauri:dev
            </code>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Tauri Integration Test</CardTitle>
          <CardDescription>
            Prueba las funcionalidades de integración entre Next.js y Tauri
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              size="lg"
            >
              {isRunning ? 'Ejecutando tests...' : 'Ejecutar Tests'}
            </Button>
            
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isDesktop ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-muted-foreground">
                {isDesktop ? 'Desktop Mode' : 'Web Mode'}
              </span>
            </div>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-2 mt-6">
              <h3 className="font-semibold text-lg">Resultados:</h3>
              {testResults.map((result, i) => (
                <Card key={i} className={result.status === 'error' ? 'border-red-500' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">
                        {result.status === 'success' ? '✅' : '❌'}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{result.test}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {result.result}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📊 Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium">Plataforma:</dt>
              <dd className="text-muted-foreground">{isDesktop ? 'Tauri Desktop' : 'Web Browser'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">User Agent:</dt>
              <dd className="text-muted-foreground text-sm">{navigator.userAgent.substring(0, 50)}...</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Online:</dt>
              <dd className="text-muted-foreground">{navigator.onLine ? 'Sí' : 'No'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
