// Tipos básicos para Agora
export enum RtcRole {
  PUBLISHER = 1,
  SUBSCRIBER = 2,
}

export enum RtmRole {
  Rtm_User = 1,
}

// Funciones placeholder - requieren implementación completa con agora-token
export function generateRTCToken(
  appId: string,
  appCertificate: string,
  channelName: string,
  uid: number
): string {
  // TODO: Implementar con agora-token cuando esté disponible
  console.warn("generateRTCToken: Implementación placeholder");
  return `rtc_token_${appId}_${channelName}_${uid}`;
}

export function generateRTMToken(
  appId: string,
  appCertificate: string,
  userId: string
): string {
  // TODO: Implementar con agora-token cuando esté disponible
  console.warn("generateRTMToken: Implementación placeholder");
  return `rtm_token_${appId}_${userId}`;
}

// Interfaz para configuración de sesión
export interface SessionConfig {
  appId: string;
  appCertificate: string;
  channelName: string;
  uid: number;
  expirationInSeconds?: number;
}

// Funciones adicionales que pueden ser requeridas
export function generateSessionTokens(
  config: SessionConfig,
  role: RtcRole = RtcRole.PUBLISHER
) {
  const expiration = config.expirationInSeconds || 3600;
  const expiresAt = new Date(Date.now() + expiration * 1000);

  return {
    rtcToken: generateRTCToken(
      config.appId,
      config.appCertificate,
      config.channelName,
      config.uid
    ),
    rtmToken: generateRTMToken(
      config.appId,
      config.appCertificate,
      config.uid.toString()
    ),
    expiresAt,
  };
}

export function getAgoraConfigFromEnv() {
  return {
    appId: process.env.NEXT_PUBLIC_AGORA_APP_ID || "",
    appCertificate: process.env.AGORA_APP_CERTIFICATE || "",
  };
}
