export interface PacientePerfil {
  id: string;
  nombre: string | null;
}

export interface CitaCore {
  id: string;
  tipo: string;
  fecha: string; // ISO
}

export interface SesionTelemedicinaCore {
  id: string;
  estado: string;
}
