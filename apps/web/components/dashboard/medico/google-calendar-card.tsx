/**
 * Google Calendar Integration Card
 * Allows doctors to connect/disconnect and sync with Google Calendar
 */

'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@red-salud/ui';
import { Calendar, RefreshCw, Link as LinkIcon, Unlink, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useGoogleCalendar } from '@/hooks/use-google-calendar';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function GoogleCalendarCard() {
  const {
    status,
    loading,
    error,
    connect,
    disconnect,
    syncNow,
    syncing,
    lastSyncResult,
  } = useGoogleCalendar();

  const [disconnecting, setDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (!confirm('¿Estás seguro de que deseas desconectar Google Calendar? Las citas existentes no se eliminarán, pero dejarán de sincronizarse.')) {
      return;
    }

    try {
      setDisconnecting(true);
      await disconnect();
      toast.success('Google Calendar desconectado correctamente');
    } catch (err) {
      toast.error('Error al desconectar Google Calendar');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSync = async () => {
    try {
      await syncNow();
      toast.success('Sincronización completada');
    } catch (err) {
      toast.error('Error al sincronizar con Google Calendar');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Google Calendar
              {status.connected && (
                <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Conectado
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-2">
              {status.connected
                ? 'Sincroniza automáticamente tus citas con Google Calendar'
                : 'Conecta tu Google Calendar para sincronizar tus citas automáticamente'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!status.connected ? (
          <div className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Las citas se crean automáticamente en Google Calendar
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Los cambios se sincronizan en ambas direcciones
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Tus eventos externos aparecen como tiempo bloqueado
              </p>
            </div>

            <Button
              onClick={connect}
              className="w-full"
              size="lg"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Conectar Google Calendar
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Connection Info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Calendario:</span>
                <span className="font-medium">{status.calendar_id}</span>
              </div>
              {status.last_sync_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Última sincronización:</span>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(status.last_sync_at), { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Stats */}
            {status.stats && (
              <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {status.stats.synced_appointments}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Citas sincronizadas
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {status.stats.imported_events}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Eventos importados
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">
                    {status.stats.pending_syncs}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Pendientes
                  </div>
                </div>
              </div>
            )}

            {/* Last Sync Result */}
            {lastSyncResult && (
              <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
                <div className="font-medium">Última sincronización:</div>
                {lastSyncResult.to_google && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">→ Google Calendar:</span>
                    <span>
                      {lastSyncResult.to_google.synced} actualizadas
                      {lastSyncResult.to_google.errors.length > 0 && (
                        <span className="text-destructive ml-1">
                          ({lastSyncResult.to_google.errors.length} errores)
                        </span>
                      )}
                    </span>
                  </div>
                )}
                {lastSyncResult.from_google && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">← Google Calendar:</span>
                    <span>
                      {lastSyncResult.from_google.imported} importados
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleSync}
                disabled={syncing}
                variant="outline"
                className="flex-1"
              >
                {syncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sincronizar ahora
                  </>
                )}
              </Button>

              <Button
                onClick={handleDisconnect}
                disabled={disconnecting}
                variant="outline"
                className="text-destructive hover:text-destructive"
              >
                {disconnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Unlink className="h-4 w-4" />
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              La sincronización se realiza automáticamente al crear o modificar citas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
