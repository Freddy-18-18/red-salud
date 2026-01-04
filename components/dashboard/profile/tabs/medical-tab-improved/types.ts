export interface MedicalFormData {
  sexoBiologico?: string;
  tipoSangre?: string;
  donanteSangre?: string;
  peso?: string;
  altura?: string;
  presionSistolica?: string;
  presionDiastolica?: string;
  fuma?: string;
  consumeAlcohol?: string;
  actividadFisica?: string;
  donanteOrganos?: string;
  embarazada?: boolean;
  lactancia?: boolean;
  alergias?: string;
  alergiasAlimentarias?: string;
  otrasAlergias?: string;
  condicionesCronicas?: string;
  medicamentosActuales?: string;
}

export interface IMCData {
  value: number | null;
  categoria: string;
}
