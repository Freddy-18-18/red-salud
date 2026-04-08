// ============================================================================
// CLINICAL TEMPLATE LIBRARY — Pre-built SOAP templates per specialty
// Doctors can browse and install these into their custom templates.
// ============================================================================

export interface LibraryClinicalTemplate {
  name: string;
  description?: string;
  type: 'initial_visit' | 'follow_up' | 'emergency' | 'procedure' | 'referral';
  category: 'soap' | 'progress_note' | 'referral' | 'discharge' | 'custom';
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  default_vitals: string[];
  default_icd_codes: string[];
  tags: string[];
}

const TYPE_LABELS: Record<LibraryClinicalTemplate['type'], string> = {
  initial_visit: 'Primera consulta',
  follow_up: 'Control',
  emergency: 'Emergencia',
  procedure: 'Procedimiento',
  referral: 'Referencia',
};

export { TYPE_LABELS };

export const TEMPLATE_LIBRARY: Record<string, LibraryClinicalTemplate[]> = {
  // ── Cardiologia ────────────────────────────────────────────────────────
  cardiologia: [
    {
      name: 'Consulta por Dolor Toracico',
      description: 'Evaluacion inicial de dolor toracico agudo o cronico',
      type: 'initial_visit',
      category: 'soap',
      subjective:
        'Paciente de {{edad}} anos, {{sexo}}, refiere dolor toracico de {{duracion}} de evolucion, localizado en {{localizacion}}, de caracter {{tipo_dolor}}, irradiado a {{irradiacion}}, asociado a {{sintomas_asociados}}. Niega/refiere disnea, palpitaciones, sincope. Factores de riesgo cardiovascular: {{factores_riesgo}}. Antecedentes: {{antecedentes}}.',
      objective:
        'PA: {{ta}} mmHg, FC: {{fc}} lpm, FR: {{fr}} rpm, SpO2: {{spo2}}%. Paciente {{estado_general}}. Cuello: ingurgitacion yugular {{iy}}. Torax: {{auscultacion_pulmonar}}. Cardiovascular: ruidos cardiacos {{ruidos_cardiacos}}. No soplos / Soplo {{soplo}}. Pulsos perifericos {{pulsos}}. No edema / Edema {{edema}}. Abdomen: {{abdomen}}.',
      assessment:
        '{{diagnostico_principal}} ({{codigo_icd11}}). Diagnosticos diferenciales: {{diferenciales}}. Riesgo cardiovascular estimado: {{riesgo}}.',
      plan: '1. {{estudios_solicitados}}\n2. {{tratamiento}}\n3. Control en {{seguimiento}}.\n4. Signos de alarma: dolor toracico severo, disnea subita, sincope. Acudir a emergencias si se presentan.',
      default_vitals: ['Presion arterial', 'Frecuencia cardiaca', 'Frecuencia respiratoria', 'Saturacion O2'],
      default_icd_codes: ['BA80', 'BA81', 'BA41'],
      tags: ['dolor toracico', 'cardiovascular', 'urgencia'],
    },
    {
      name: 'Control de Hipertension',
      description: 'Seguimiento de paciente con HTA en tratamiento',
      type: 'follow_up',
      category: 'soap',
      subjective:
        'Paciente con diagnostico de HTA desde {{tiempo_diagnostico}}, en tratamiento con {{medicacion_actual}}. Refiere adherencia {{adherencia}} al tratamiento. Sintomas actuales: {{sintomas}}. Ultimo control de PA en casa: {{pa_domicilio}}. Dieta: {{dieta}}. Actividad fisica: {{actividad_fisica}}.',
      objective:
        'PA: {{ta}} mmHg (sentado), {{ta_pie}} mmHg (de pie). FC: {{fc}} lpm. Peso: {{peso}} kg. IMC: {{imc}}. Fondo de ojo: {{fondo_ojo}}. Cardiovascular: {{cardiovascular}}. Pulsos perifericos: {{pulsos}}. Edema: {{edema}}.',
      assessment:
        'Hipertension arterial {{grado}} (BA00). Control actual: {{control}}. Dano de organo blanco: {{dano_organo}}.',
      plan: '1. Laboratorio: perfil lipidico, glicemia, creatinina, electrolitos, orina\n2. Ajuste terapeutico: {{ajuste}}\n3. Recomendaciones: dieta hiposodica, ejercicio 150 min/semana, control de peso\n4. Proximo control en {{seguimiento}}.',
      default_vitals: ['Presion arterial', 'Frecuencia cardiaca', 'Peso', 'IMC'],
      default_icd_codes: ['BA00', 'BA01', 'BA02'],
      tags: ['hipertension', 'control', 'cronico'],
    },
    {
      name: 'Control de Insuficiencia Cardiaca',
      description: 'Seguimiento de IC cronica en tratamiento',
      type: 'follow_up',
      category: 'soap',
      subjective:
        'Paciente con IC {{etiologia}}, FEVI {{fevi}}%, NYHA clase {{nyha}}. Tratamiento actual: {{medicacion}}. Sintomas: disnea {{disnea}}, ortopnea {{ortopnea}}, DPN {{dpn}}, edema {{edema_ref}}. Peso diario: {{control_peso}}. Restriccion hidrica: {{restriccion_hidrica}}.',
      objective:
        'PA: {{ta}} mmHg. FC: {{fc}} lpm. FR: {{fr}} rpm. SpO2: {{spo2}}%. Peso: {{peso}} kg (cambio: {{cambio_peso}}). IY: {{iy}}. Pulmon: {{auscultacion_pulmonar}}. CV: {{cardiovascular}}. Hepatomegalia: {{hepatomegalia}}. Edema MMII: {{edema_mmii}}.',
      assessment:
        'Insuficiencia cardiaca {{tipo}} (BD10-BD1Z). Clase funcional NYHA {{nyha}}. Estado de congestion: {{congestion}}. FEVI ultimo eco: {{fevi}}%.',
      plan: '1. Ajuste de diureticos: {{diureticos}}\n2. Titulacion de {{farmaco}}: {{dosis}}\n3. Laboratorio: BNP, funcion renal, electrolitos\n4. Eco de control si corresponde\n5. Control en {{seguimiento}}.',
      default_vitals: ['Presion arterial', 'Frecuencia cardiaca', 'Frecuencia respiratoria', 'Saturacion O2', 'Peso'],
      default_icd_codes: ['BD10', 'BD11', 'BD1Z'],
      tags: ['insuficiencia cardiaca', 'control', 'cronico'],
    },
  ],

  // ── Pediatria ──────────────────────────────────────────────────────────
  pediatria: [
    {
      name: 'Control de Nino Sano',
      description: 'Evaluacion de crecimiento y desarrollo por edad',
      type: 'follow_up',
      category: 'soap',
      subjective:
        'Lactante/Preescolar/Escolar de {{edad}}, {{sexo}}. Madre refiere: alimentacion {{alimentacion}}, sueno {{sueno}}, deposiciones {{deposiciones}}, desarrollo {{hitos_desarrollo}}. Vacunacion: {{vacunacion}}. Antecedentes perinatales: {{perinatales}}. Alergias: {{alergias}}.',
      objective:
        'Peso: {{peso}} kg (P{{percentil_peso}}). Talla: {{talla}} cm (P{{percentil_talla}}). PC: {{pc}} cm (P{{percentil_pc}}). IMC: {{imc}} (P{{percentil_imc}}). Temp: {{temp}} C. Estado general: {{estado_general}}. Piel: {{piel}}. Ojos: {{ojos}}. Oidos: {{oidos}}. Orofaringe: {{orofaringe}}. Cardiopulmonar: {{cardiopulmonar}}. Abdomen: {{abdomen}}. Genitales: {{genitales}}. Neurologico: {{neurologico}}. Desarrollo psicomotor: {{desarrollo}}.',
      assessment:
        'Nino {{estado_nutricional}} con desarrollo {{desarrollo_eval}}. {{diagnosticos_adicionales}}.',
      plan: '1. Vacunas pendientes: {{vacunas}}\n2. Suplementacion: {{suplementos}}\n3. Alimentacion: {{indicaciones_alimentacion}}\n4. Estimulacion del desarrollo: {{estimulacion}}\n5. Proximo control en {{seguimiento}}.',
      default_vitals: ['Peso', 'Talla', 'IMC', 'Temperatura'],
      default_icd_codes: ['QA00', 'QA0Z'],
      tags: ['pediatria', 'nino sano', 'crecimiento', 'desarrollo'],
    },
    {
      name: 'Consulta por Fiebre',
      description: 'Evaluacion de sindrome febril en pediatria',
      type: 'initial_visit',
      category: 'soap',
      subjective:
        'Paciente de {{edad}}, con fiebre de {{duracion}} de evolucion, temperatura maxima {{temp_max}} C, {{patron_fiebre}}. Asociado a: {{sintomas_asociados}}. Medicacion antipiretica: {{antipiretico}} cada {{frecuencia}}h, con respuesta {{respuesta}}. Contacto epidemiologico: {{contacto}}. Vacunacion: {{vacunacion}}.',
      objective:
        'Temp: {{temp}} C. FC: {{fc}} lpm. FR: {{fr}} rpm. Peso: {{peso}} kg. Estado general: {{estado_general}}. Hidratacion: {{hidratacion}}. Piel: {{piel}}. Orofaringe: {{orofaringe}}. Otoscopia: {{otoscopia}}. Ganglios: {{ganglios}}. Pulmonar: {{pulmonar}}. Abdominal: {{abdomen}}. Signos meningeos: {{meningeos}}.',
      assessment:
        '{{diagnostico}} ({{codigo_icd11}}). Diagnosticos diferenciales: {{diferenciales}}.',
      plan: '1. Estudios: {{estudios}}\n2. Tratamiento: {{tratamiento}}\n3. Antipiretico: {{antipiretico_indicado}} {{dosis}} cada {{frecuencia}}h si T > 38.5C\n4. Hidratacion oral abundante\n5. Signos de alarma: {{signos_alarma}}\n6. Control en {{seguimiento}}.',
      default_vitals: ['Temperatura', 'Frecuencia cardiaca', 'Frecuencia respiratoria', 'Peso'],
      default_icd_codes: ['MG20', 'CA40', '1A00-1A0Z'],
      tags: ['fiebre', 'infeccion', 'pediatria'],
    },
    {
      name: 'Consulta por Diarrea Aguda',
      description: 'Evaluacion y manejo de gastroenteritis aguda pediatrica',
      type: 'initial_visit',
      category: 'soap',
      subjective:
        'Paciente de {{edad}}, presenta deposiciones liquidas/semiliquidas desde hace {{duracion}}, {{frecuencia}} episodios/dia, {{caracteristicas}} (moco/sangre/fetidez). Asociado a: vomitos {{vomitos}}, fiebre {{fiebre}}, dolor abdominal {{dolor}}. Tolerancia oral: {{tolerancia}}. Diuresis: {{diuresis}}. Contacto epidemiologico: {{contacto}}.',
      objective:
        'Peso: {{peso}} kg (peso previo: {{peso_previo}} kg, perdida: {{perdida_peso}}%). Temp: {{temp}} C. FC: {{fc}} lpm. Hidratacion: {{hidratacion}} (mucosas {{mucosas}}, llanto {{llanto}}, fontanela {{fontanela}}, pliegue {{pliegue}}, llenado capilar {{llenado_capilar}}). Abdomen: {{abdomen}}.',
      assessment:
        'Gastroenteritis aguda, deshidratacion {{grado}} (DA90). {{diagnosticos_adicionales}}.',
      plan: '1. Rehidratacion: {{rehidratacion}}\n2. Alimentacion: continuar lactancia/dieta habitual, evitar jugos\n3. Zinc: 10-20 mg/dia por 10-14 dias\n4. {{tratamiento_adicional}}\n5. Signos de alarma: vomitos incoercibles, sangre en heces, somnolencia, no tolera liquidos\n6. Control en {{seguimiento}}.',
      default_vitals: ['Peso', 'Temperatura', 'Frecuencia cardiaca'],
      default_icd_codes: ['DA90', 'DA93', '1A00'],
      tags: ['diarrea', 'gastroenteritis', 'deshidratacion', 'pediatria'],
    },
  ],

  // ── Medicina Interna ───────────────────────────────────────────────────
  'medicina-interna': [
    {
      name: 'Evaluacion Inicial de Diabetes Tipo 2',
      description: 'Primera consulta de paciente diabetico',
      type: 'initial_visit',
      category: 'soap',
      subjective:
        'Paciente de {{edad}} anos, {{sexo}}, referido por {{motivo_referencia}}. Diagnostico de DM2 desde {{tiempo_diagnostico}}. Tratamiento actual: {{medicacion}}. Sintomas: poliuria {{poliuria}}, polidipsia {{polidipsia}}, polifagia {{polifagia}}, perdida de peso {{perdida_peso}}. Automonitoreo glicemico: {{automonitoreo}}. Dieta: {{dieta}}. Actividad fisica: {{actividad}}. Tabaquismo: {{tabaquismo}}. Complicaciones conocidas: {{complicaciones}}.',
      objective:
        'PA: {{ta}} mmHg. FC: {{fc}} lpm. Peso: {{peso}} kg. Talla: {{talla}} cm. IMC: {{imc}}. Circunferencia abdominal: {{cintura}} cm. Piel: acantosis {{acantosis}}. Tiroides: {{tiroides}}. Cardiovascular: {{cardiovascular}}. Pulsos pedios: {{pulsos}}. Sensibilidad MMII (monofilamento): {{monofilamento}}. Fondo de ojo: {{fondo_ojo}}. Pies: {{pies}}.',
      assessment:
        'Diabetes mellitus tipo 2 (5A11). HbA1c: {{hba1c}}%. Control actual: {{control}}. Complicaciones: {{complicaciones_eval}}. Riesgo cardiovascular: {{riesgo_cv}}.',
      plan: '1. Laboratorio: HbA1c, perfil lipidico, creatinina, microalbuminuria, TSH\n2. Interconsultas: oftalmologia, nutricion, podologia\n3. Ajuste terapeutico: {{ajuste}}\n4. Metas: HbA1c < 7%, PA < 140/90, LDL < 100\n5. Educacion diabetologica\n6. Control en {{seguimiento}}.',
      default_vitals: ['Presion arterial', 'Frecuencia cardiaca', 'Peso', 'Talla', 'IMC', 'Glucemia capilar'],
      default_icd_codes: ['5A11', '5A10', 'BA00'],
      tags: ['diabetes', 'endocrino', 'cronico'],
    },
    {
      name: 'Consulta por Infeccion Urinaria',
      description: 'Evaluacion de IVU baja o pielonefritis',
      type: 'initial_visit',
      category: 'soap',
      subjective:
        'Paciente de {{edad}} anos, {{sexo}}, refiere disuria, polaquiuria y urgencia miccional de {{duracion}} de evolucion. {{hematuria}}. Fiebre: {{fiebre}}. Dolor lumbar: {{dolor_lumbar}}. Flujo vaginal/uretral: {{flujo}}. Antecedentes: IVU previas {{ivu_previas}}, litiasis {{litiasis}}, embarazo {{embarazo}}. Antibioticos recientes: {{atb_previos}}.',
      objective:
        'Temp: {{temp}} C. PA: {{ta}} mmHg. FC: {{fc}} lpm. Abdomen: {{abdomen}}. Punos percusion lumbar: {{pppl}}. Genitourinario: {{genitourinario}}.',
      assessment:
        '{{diagnostico}} ({{codigo_icd11}}). {{complicaciones}}.',
      plan: '1. Urocultivo + antibiograma (tomar ANTES del antibiotico)\n2. Examen de orina\n3. Antibiotico empirico: {{antibiotico}} por {{duracion_atb}} dias\n4. Analgesico urinario si necesario\n5. Hidratacion abundante\n6. Control con resultado de urocultivo en {{seguimiento}}.',
      default_vitals: ['Temperatura', 'Presion arterial', 'Frecuencia cardiaca'],
      default_icd_codes: ['GC08', 'GC00', 'GC01'],
      tags: ['infeccion urinaria', 'IVU', 'antibiotico'],
    },
    {
      name: 'Evaluacion Pre-operatoria',
      description: 'Riesgo quirurgico y evaluacion pre-anestesica',
      type: 'initial_visit',
      category: 'soap',
      subjective:
        'Paciente de {{edad}} anos programado para {{cirugia}} el {{fecha_cirugia}}. Antecedentes: {{antecedentes_medicos}}. Quirurgicos previos: {{cirugia_previas}}. Medicacion habitual: {{medicacion}}. Alergias: {{alergias}}. Capacidad funcional: {{mets}} METs. Tabaquismo: {{tabaquismo}}. Etilismo: {{etilismo}}.',
      objective:
        'PA: {{ta}} mmHg. FC: {{fc}} lpm. FR: {{fr}} rpm. SpO2: {{spo2}}%. Peso: {{peso}} kg. Talla: {{talla}} cm. IMC: {{imc}}. Via aerea: Mallampati {{mallampati}}. Cardiovascular: {{cardiovascular}}. Pulmonar: {{pulmonar}}. Abdomen: {{abdomen}}. Neurologico: {{neurologico}}.',
      assessment:
        'Riesgo ASA {{asa}}. Riesgo cardiaco (Lee): {{lee}} puntos ({{riesgo_lee}}%). Capacidad funcional: {{mets}} METs. {{diagnosticos}}.',
      plan: '1. Laboratorio: hemograma, glicemia, creatinina, coagulacion, grupo sanguineo\n2. ECG de 12 derivaciones\n3. Rx de torax si > 50 anos o patologia pulmonar\n4. Ajuste de medicacion perioperatoria: {{ajustes}}\n5. APTO / NO APTO para {{cirugia}} bajo {{anestesia}}.\n6. Riesgo quirurgico: {{riesgo_final}}.',
      default_vitals: ['Presion arterial', 'Frecuencia cardiaca', 'Frecuencia respiratoria', 'Saturacion O2', 'Peso', 'Talla', 'IMC'],
      default_icd_codes: ['QC60', 'QC6Y'],
      tags: ['preoperatorio', 'riesgo quirurgico', 'evaluacion'],
    },
  ],

  // ── Traumatologia ──────────────────────────────────────────────────────
  traumatologia: [
    {
      name: 'Consulta por Dolor de Rodilla',
      description: 'Evaluacion inicial de gonalgia aguda o cronica',
      type: 'initial_visit',
      category: 'soap',
      subjective:
        'Paciente de {{edad}} anos, {{sexo}}, refiere dolor en rodilla {{lateralidad}} de {{duracion}} de evolucion. Mecanismo: {{mecanismo}}. Localizacion: {{localizacion}}. Caracteristicas: {{caracteristicas}}. Bloqueo articular: {{bloqueo}}. Inestabilidad: {{inestabilidad}}. Derrame: {{derrame}}. Limitacion funcional: {{limitacion}}. Tratamientos previos: {{tratamientos}}.',
      objective:
        'Marcha: {{marcha}}. Rodilla {{lateralidad}}: derrame {{derrame_exam}}, rubor {{rubor}}, calor {{calor}}. ROM: extension {{extension}}, flexion {{flexion}}. Ligamentos: LCA (Lachman {{lachman}}, cajon anterior {{cajon_ant}}), LCP (cajon posterior {{cajon_post}}), LLI (valgo {{valgo}}), LLE (varo {{varo}}). Meniscos: McMurray {{mcmurray}}, Apley {{apley}}. Rotula: aprehension {{aprehension}}, cepillo {{cepillo}}.',
      assessment:
        '{{diagnostico}} ({{codigo_icd11}}). Diagnosticos diferenciales: {{diferenciales}}.',
      plan: '1. Imagenes: {{imagenes}}\n2. Tratamiento: {{tratamiento}}\n3. Fisioterapia: {{fisioterapia}}\n4. Control en {{seguimiento}}.',
      default_vitals: ['Dolor (EVA)'],
      default_icd_codes: ['FA00', 'FA02', 'FB56'],
      tags: ['rodilla', 'traumatologia', 'dolor articular'],
    },
    {
      name: 'Evaluacion de Fractura',
      description: 'Valoracion inicial de fractura de miembros',
      type: 'emergency',
      category: 'soap',
      subjective:
        'Paciente de {{edad}} anos, {{sexo}}, con antecedente de trauma en {{region}} hace {{tiempo}}. Mecanismo: {{mecanismo}}. Dolor intenso (EVA {{eva}}/10). Impotencia funcional: {{impotencia}}. Deformidad: {{deformidad}}. Parestesias: {{parestesias}}. Antecedentes: {{antecedentes}}.',
      objective:
        'PA: {{ta}} mmHg. FC: {{fc}} lpm. Region afectada: {{region_exam}}. Deformidad: {{deformidad_exam}}. Edema: {{edema}}. Equimosis: {{equimosis}}. Crepitacion: {{crepitacion}}. Estado neurovascular distal: pulso {{pulso}}, sensibilidad {{sensibilidad}}, llenado capilar {{llenado}}, movilidad distal {{movilidad_distal}}. Lesiones asociadas: {{lesiones_asociadas}}.',
      assessment:
        'Fractura de {{hueso}} tipo {{clasificacion}} ({{codigo_icd11}}). Estado neurovascular: {{neurovascular}}. {{diagnosticos_adicionales}}.',
      plan: '1. Inmovilizacion: {{inmovilizacion}}\n2. Imagenes: {{imagenes}}\n3. Analgesicos: {{analgesicos}}\n4. Profilaxis antitromboembolica: {{profilaxis}}\n5. Valorar tratamiento quirurgico: {{quirurgico}}\n6. Control en {{seguimiento}}.',
      default_vitals: ['Presion arterial', 'Frecuencia cardiaca', 'Dolor (EVA)'],
      default_icd_codes: ['FB70', 'FB71', 'NA90'],
      tags: ['fractura', 'trauma', 'emergencia'],
    },
    {
      name: 'Control Post-quirurgico',
      description: 'Seguimiento post-operatorio en traumatologia',
      type: 'follow_up',
      category: 'soap',
      subjective:
        'Paciente post-operado de {{cirugia}} el {{fecha_cirugia}} ({{dias_po}} dias PO). Dolor: EVA {{eva}}/10. Medicacion actual: {{medicacion}}. Deambulacion: {{deambulacion}}. Rehabilitacion: {{rehabilitacion}}. Complicaciones: {{complicaciones}}.',
      objective:
        'Herida quirurgica: {{herida}}. Edema: {{edema}}. Equimosis: {{equimosis}}. ROM: {{rom}}. Fuerza muscular: {{fuerza}}. Estado neurovascular distal: {{neurovascular}}. Radiografia de control: {{rx_control}}.',
      assessment:
        'Postoperatorio dia {{dias_po}} de {{cirugia}}. Evolucion: {{evolucion}}. {{complicaciones_eval}}.',
      plan: '1. Cuidado de herida: {{herida_indicaciones}}\n2. Analgesia: {{analgesia}}\n3. Fisioterapia: {{fisioterapia}}\n4. Carga: {{carga}}\n5. Proximo control: {{seguimiento}} con Rx.\n6. Signos de alarma: fiebre, aumento del dolor, secrecion purulenta.',
      default_vitals: ['Temperatura', 'Dolor (EVA)'],
      default_icd_codes: ['QC30', 'QC40'],
      tags: ['postoperatorio', 'control', 'cirugia'],
    },
  ],

  // ── Dermatologia ───────────────────────────────────────────────────────
  dermatologia: [
    {
      name: 'Consulta por Lesion Cutanea',
      description: 'Evaluacion de lesion dermatologica sospechosa',
      type: 'initial_visit',
      category: 'soap',
      subjective:
        'Paciente de {{edad}} anos, {{sexo}}, consulta por lesion en {{localizacion}} de {{duracion}} de evolucion. Cambios recientes: {{cambios}} (tamano, color, forma, sangrado, prurito). Exposicion solar: {{exposicion_solar}}. Antecedentes de cancer de piel: {{antecedentes_cancer}}. Fototipo: {{fototipo}}.',
      objective:
        'Lesion: tipo {{tipo_lesion}}, tamano {{tamano}} mm, color {{color}}, bordes {{bordes}}, simetria {{simetria}}. ABCDE: A({{asimetria}}), B({{bordes_eval}}), C({{color_eval}}), D({{diametro}}mm), E({{evolucion}}). Dermatoscopia: {{dermatoscopia}}. Ganglios regionales: {{ganglios}}.',
      assessment:
        '{{diagnostico}} ({{codigo_icd11}}). Sospecha de malignidad: {{sospecha}}.',
      plan: '1. {{conducta}} (biopsia excisional/incisional/observacion)\n2. Estudio histopatologico si biopsia\n3. Fotoproteccion SPF 50+\n4. Autoexamen cutaneo mensual\n5. Control en {{seguimiento}}.',
      default_vitals: [],
      default_icd_codes: ['EK90', 'EK80', '2C30'],
      tags: ['lesion cutanea', 'dermatoscopia', 'biopsia'],
    },
    {
      name: 'Consulta por Dermatitis',
      description: 'Evaluacion de dermatitis atopica o de contacto',
      type: 'initial_visit',
      category: 'soap',
      subjective:
        'Paciente de {{edad}} anos, {{sexo}}, refiere lesiones cutaneas pruriginosas en {{localizacion}} de {{duracion}} de evolucion. Prurito: {{intensidad_prurito}} (leve/moderado/severo). Factores desencadenantes: {{desencadenantes}}. Antecedentes de atopia: asma {{asma}}, rinitis {{rinitis}}, DA previa {{da_previa}}. Tratamientos previos: {{tratamientos}}.',
      objective:
        'Localizacion: {{localizacion_exam}}. Lesiones elementales: {{lesiones}} (eritema, papulas, vesiculas, costras, liquenificacion, excoriaciones). Extension: {{extension}}% SC. SCORAD/EASI: {{score}}. Sobreinfeccion: {{sobreinfeccion}}.',
      assessment:
        'Dermatitis {{tipo}} (EA80/EA85). Severidad: {{severidad}}. {{complicaciones}}.',
      plan: '1. Emolientes: {{emolientes}} 2-3 veces/dia\n2. Corticoide topico: {{corticoide}} por {{duracion_tto}} dias\n3. Antihistaminico oral si prurito intenso: {{antihistaminico}}\n4. Antibiotico topico si sobreinfeccion\n5. Evitar: {{evitar}}\n6. Control en {{seguimiento}}.',
      default_vitals: [],
      default_icd_codes: ['EA80', 'EA85', 'EK00'],
      tags: ['dermatitis', 'atopia', 'prurito'],
    },
    {
      name: 'Control de Acne',
      description: 'Seguimiento de paciente con acne en tratamiento',
      type: 'follow_up',
      category: 'soap',
      subjective:
        'Paciente de {{edad}} anos con acne {{tipo}} en tratamiento desde {{inicio_tto}}. Medicacion actual: {{medicacion}}. Adherencia: {{adherencia}}. Mejoria percibida: {{mejoria}}. Efectos adversos: {{efectos_adversos}}. En mujeres: ACO {{aco}}, ciclo menstrual {{ciclo}}, posibilidad de embarazo {{embarazo}}.',
      objective:
        'Lesiones no inflamatorias: comedones abiertos {{ca}}, comedones cerrados {{cc}}. Lesiones inflamatorias: papulas {{papulas}}, pustulas {{pustulas}}, nodulos {{nodulos}}. Localizacion: {{localizacion}}. Cicatrices: {{cicatrices}}. PIH: {{pih}}. Grado (GEA): {{gea}}.',
      assessment:
        'Acne vulgar grado {{grado}} (ED80). Respuesta al tratamiento: {{respuesta}}. {{complicaciones}}.',
      plan: '1. Ajuste de tratamiento: {{ajuste}}\n2. Laboratorio si isotretinoina: {{laboratorio}}\n3. Cuidado facial: {{cuidado}}\n4. Fotoproteccion SPF 50+\n5. Control en {{seguimiento}}.',
      default_vitals: [],
      default_icd_codes: ['ED80', 'ED81'],
      tags: ['acne', 'control', 'dermatologia'],
    },
  ],

  // ── Ginecologia ────────────────────────────────────────────────────────
  ginecologia: [
    {
      name: 'Control Prenatal',
      description: 'Consulta de seguimiento de embarazo',
      type: 'follow_up',
      category: 'soap',
      subjective:
        'Gestante de {{edad}} anos, G{{gestaciones}}P{{partos}}A{{abortos}}C{{cesareas}}, EG: {{eg}} semanas por FUR/eco. Sintomas actuales: {{sintomas}}. Movimientos fetales: {{movimientos}}. Contracciones: {{contracciones}}. Perdida de liquido o sangrado: {{perdidas}}. Medicacion: {{medicacion}}.',
      objective:
        'PA: {{ta}} mmHg. Peso: {{peso}} kg (ganancia total: {{ganancia}} kg). AU: {{au}} cm. FCF: {{fcf}} lpm. Presentacion: {{presentacion}}. Edema: {{edema}}. Especuloscopia/tacto vaginal (si indicado): {{tv}}.',
      assessment:
        'Embarazo de {{eg}} semanas, {{riesgo}} riesgo. {{diagnosticos_adicionales}}.',
      plan: '1. Estudios pendientes: {{estudios}}\n2. Suplementacion: {{suplementos}}\n3. Vacunacion: {{vacunas}}\n4. Indicaciones: {{indicaciones}}\n5. Signos de alarma: sangrado, perdida de liquido, cefalea intensa, edema generalizado, disminucion de movimientos fetales\n6. Proximo control: {{seguimiento}}.',
      default_vitals: ['Presion arterial', 'Peso'],
      default_icd_codes: ['JA00-JA0Z', 'JA60'],
      tags: ['prenatal', 'embarazo', 'obstetricia'],
    },
    {
      name: 'Consulta Ginecologica General',
      description: 'Primera consulta o control ginecologico anual',
      type: 'initial_visit',
      category: 'soap',
      subjective:
        'Paciente de {{edad}} anos, G{{gestaciones}}P{{partos}}A{{abortos}}C{{cesareas}}. Menarquia: {{menarquia}} anos. FUR: {{fur}}. Ciclos: {{ciclos}} (regular/irregular). Metodo anticonceptivo: {{mac}}. Ultimo PAP: {{ultimo_pap}}. Ultima mamografia: {{ultima_mamografia}}. Sintomas: {{sintomas}}. Flujo vaginal: {{flujo}}. Dispareunia: {{dispareunia}}.',
      objective:
        'PA: {{ta}} mmHg. Peso: {{peso}} kg. Mamas: {{mamas}}. Abdomen: {{abdomen}}. Especuloscopia: cuello {{cuello}}, flujo {{flujo_exam}}. Tacto vaginal: utero {{utero}}, anexos {{anexos}}. PAP: tomado Si/No.',
      assessment:
        '{{diagnosticos}}. Tamizaje cervical: {{tamizaje}}.',
      plan: '1. Citologia cervical (si corresponde)\n2. Eco transvaginal: {{eco}}\n3. Mamografia (si > 40 anos): {{mamografia}}\n4. Laboratorio: {{laboratorio}}\n5. Anticoncepcion: {{anticoncepcion}}\n6. Control en {{seguimiento}}.',
      default_vitals: ['Presion arterial', 'Peso'],
      default_icd_codes: ['GA00', 'GA10', 'GC70'],
      tags: ['ginecologia', 'tamizaje', 'preventivo'],
    },
    {
      name: 'Consulta por Sangrado Uterino Anormal',
      description: 'Evaluacion de SUA segun clasificacion PALM-COEIN',
      type: 'initial_visit',
      category: 'soap',
      subjective:
        'Paciente de {{edad}} anos, refiere sangrado uterino {{patron}} de {{duracion}} de evolucion. Cantidad: {{cantidad}} (toallas/dia). Duracion del sangrado: {{duracion_sangrado}} dias. Dolor: {{dolor}}. FUR: {{fur}}. MAC: {{mac}}. Medicacion: {{medicacion}}. Antecedentes: {{antecedentes}}.',
      objective:
        'PA: {{ta}} mmHg. FC: {{fc}} lpm. Palidez: {{palidez}}. Abdomen: {{abdomen}}. Especuloscopia: cuello {{cuello}}, sangrado activo {{sangrado}}. Tacto vaginal: utero {{utero}} (tamano, posicion), anexos {{anexos}}.',
      assessment:
        'Sangrado uterino anormal (GA20). Clasificacion PALM-COEIN: {{palm_coein}}. Anemia: {{anemia}}.',
      plan: '1. Laboratorio: hemograma, ferritina, TSH, coagulacion, beta-HCG\n2. Eco transvaginal: {{eco}}\n3. Biopsia endometrial si > 45 anos o factores de riesgo\n4. Tratamiento: {{tratamiento}}\n5. Suplemento de hierro si anemia\n6. Control en {{seguimiento}}.',
      default_vitals: ['Presion arterial', 'Frecuencia cardiaca'],
      default_icd_codes: ['GA20', 'GA21', 'GA24'],
      tags: ['SUA', 'sangrado', 'ginecologia'],
    },
  ],

  // ── Neurologia ─────────────────────────────────────────────────────────
  neurologia: [
    {
      name: 'Consulta por Cefalea',
      description: 'Evaluacion inicial de cefalea primaria o secundaria',
      type: 'initial_visit',
      category: 'soap',
      subjective:
        'Paciente de {{edad}} anos, {{sexo}}, refiere cefalea de {{duracion}} de evolucion. Localizacion: {{localizacion}}. Caracter: {{caracter}} (pulsatil/opresivo/lancinante). Intensidad: EVA {{eva}}/10. Frecuencia: {{frecuencia}} episodios/{{periodo}}. Duracion de cada episodio: {{duracion_episodio}}. Aura: {{aura}}. Sintomas asociados: nauseas {{nauseas}}, fotofobia {{fotofobia}}, fonofobia {{fonofobia}}. Desencadenantes: {{desencadenantes}}. Medicacion analgesica: {{analgesicos}} ({{frecuencia_uso}}/mes).',
      objective:
        'PA: {{ta}} mmHg. Neurologico: pares craneales {{pares_craneales}}. Fondo de ojo: {{fondo_ojo}}. Motor: {{motor}}. Sensibilidad: {{sensibilidad}}. Reflejos: {{reflejos}}. Coordinacion: {{coordinacion}}. Signos meningeos: {{meningeos}}. Rigidez cervical: {{rigidez}}.',
      assessment:
        '{{diagnostico}} ({{codigo_icd11}}). Banderas rojas: {{banderas_rojas}}.',
      plan: '1. {{estudios}} (RMN cerebral si banderas rojas)\n2. Diario de cefalea\n3. Tratamiento agudo: {{tratamiento_agudo}}\n4. Profilaxis (si > 4 episodios/mes): {{profilaxis}}\n5. Medidas no farmacologicas: {{medidas}}\n6. Control en {{seguimiento}}.',
      default_vitals: ['Presion arterial', 'Dolor (EVA)'],
      default_icd_codes: ['8A80', '8A84', '8A8Z'],
      tags: ['cefalea', 'migrana', 'neurologia'],
    },
    {
      name: 'Control de Epilepsia',
      description: 'Seguimiento de paciente epileptico en tratamiento',
      type: 'follow_up',
      category: 'soap',
      subjective:
        'Paciente con epilepsia tipo {{tipo_epilepsia}} diagnosticada en {{fecha_dx}}. FAE actual: {{fae}} (dosis: {{dosis}}). Adherencia: {{adherencia}}. Crisis desde ultimo control: {{crisis_numero}} (tipo: {{tipo_crisis}}, duracion: {{duracion_crisis}}). Efectos adversos de FAE: {{efectos_adversos}}. Ultimo EEG: {{ultimo_eeg}}. Conduccion vehicular: {{conduccion}}.',
      objective:
        'Estado general: {{estado_general}}. Neurologico: {{neurologico_exam}}. Cognitivo: {{cognitivo}}. Coordinacion: {{coordinacion}}. Nivel serico de FAE: {{nivel_serico}}.',
      assessment:
        'Epilepsia {{tipo_epilepsia}} (8A60-8A6Z). Control de crisis: {{control}}. Efectos adversos: {{ea_eval}}.',
      plan: '1. Ajuste de FAE: {{ajuste}}\n2. Nivel serico de FAE: {{nivel_indicacion}}\n3. EEG de control: {{eeg}}\n4. Laboratorio: hemograma, hepatico\n5. Precauciones: {{precauciones}}\n6. Control en {{seguimiento}}.',
      default_vitals: ['Presion arterial'],
      default_icd_codes: ['8A60', '8A61', '8A6Z'],
      tags: ['epilepsia', 'FAE', 'control', 'neurologia'],
    },
    {
      name: 'Evaluacion de Deterioro Cognitivo',
      description: 'Tamizaje y evaluacion inicial de demencia',
      type: 'initial_visit',
      category: 'soap',
      subjective:
        'Paciente de {{edad}} anos, {{sexo}}, traido por {{acompanante}} quien refiere {{sintomas_cognitivos}} de {{duracion}} de evolucion. Afectacion de: memoria {{memoria}}, orientacion {{orientacion}}, lenguaje {{lenguaje}}, funciones ejecutivas {{ejecutivas}}. Cambios conductuales: {{conducta}}. AVD basicas: {{avd_basicas}}. AVD instrumentales: {{avd_instrumentales}}. Antecedentes: HTA {{hta}}, DM {{dm}}, depresion {{depresion}}, ACV {{acv}}.',
      objective:
        'Estado general: {{estado_general}}. PA: {{ta}} mmHg. MMSE: {{mmse}}/30. MoCA: {{moca}}/30. Test de reloj: {{reloj}}. Pares craneales: {{pares_craneales}}. Motor: {{motor}}. Marcha: {{marcha}}. Reflejos primitivos: {{primitivos}}. Signos extrapiramidales: {{extrapiramidales}}.',
      assessment:
        'Deterioro cognitivo {{grado}} (8A00-8A0Z). Probable etiologia: {{etiologia}}. Diagnosticos diferenciales: {{diferenciales}}.',
      plan: '1. Laboratorio: hemograma, TSH, B12, acido folico, VDRL, HIV, calcio, hepatico, renal\n2. RMN cerebral con volumetria hipocampal\n3. Evaluacion neuropsicologica formal\n4. Tratamiento: {{tratamiento}}\n5. Recomendaciones al cuidador\n6. Control en {{seguimiento}}.',
      default_vitals: ['Presion arterial'],
      default_icd_codes: ['8A00', '8A01', '8A03'],
      tags: ['demencia', 'deterioro cognitivo', 'neurologia'],
    },
  ],

  // ── Oftalmologia ───────────────────────────────────────────────────────
  oftalmologia: [
    {
      name: 'Consulta Oftalmologica General',
      description: 'Evaluacion oftalmologica integral inicial',
      type: 'initial_visit',
      category: 'soap',
      subjective:
        'Paciente de {{edad}} anos, {{sexo}}, consulta por {{motivo_consulta}} de {{duracion}} de evolucion. Ojo afectado: {{ojo}}. Vision borrosa: {{vision_borrosa}}. Dolor ocular: {{dolor}}. Ojo rojo: {{ojo_rojo}}. Secrecion: {{secrecion}}. Fotofobia: {{fotofobia}}. Uso de lentes: {{lentes}}. Ultimo examen oftalmologico: {{ultimo_examen}}. Antecedentes oculares: {{antecedentes_oculares}}. Antecedentes sistemicos: DM {{dm}}, HTA {{hta}}, {{otros}}.',
      objective:
        'AV sc: OD {{av_od_sc}}, OI {{av_oi_sc}}. AV cc: OD {{av_od_cc}}, OI {{av_oi_cc}}. Refraccion: OD {{refraccion_od}}, OI {{refraccion_oi}}. Motilidad ocular: {{motilidad}}. Cover test: {{cover_test}}. BMC: parpados {{parpados}}, conjuntiva {{conjuntiva}}, cornea {{cornea}}, CA {{ca}}, iris {{iris}}, cristalino {{cristalino}}. PIO: OD {{pio_od}} mmHg, OI {{pio_oi}} mmHg. Fondo de ojo: OD {{fo_od}}, OI {{fo_oi}}.',
      assessment:
        '{{diagnostico_od}} OD ({{codigo_od}}). {{diagnostico_oi}} OI ({{codigo_oi}}).',
      plan: '1. {{estudios}}\n2. Tratamiento: {{tratamiento}}\n3. Correccion optica: {{correccion}}\n4. Control en {{seguimiento}}.',
      default_vitals: [],
      default_icd_codes: ['9A00', '9B10', '9C40'],
      tags: ['oftalmologia', 'agudeza visual', 'examen ocular'],
    },
    {
      name: 'Control de Glaucoma',
      description: 'Seguimiento de glaucoma en tratamiento',
      type: 'follow_up',
      category: 'soap',
      subjective:
        'Paciente con glaucoma tipo {{tipo_glaucoma}} diagnosticado en {{fecha_dx}}. Tratamiento actual: {{medicacion}}. Adherencia: {{adherencia}}. Efectos adversos: {{efectos_adversos}}. Cambios en vision: {{cambios_vision}}. Ultimo campo visual: {{ultimo_cv}}.',
      objective:
        'AV cc: OD {{av_od}}, OI {{av_oi}}. PIO: OD {{pio_od}} mmHg, OI {{pio_oi}} mmHg (meta: < {{pio_meta}} mmHg). Gonioscopia: {{gonioscopia}}. Excavacion: OD {{excavacion_od}}, OI {{excavacion_oi}}. OCT CFNR: OD {{oct_od}}, OI {{oct_oi}}. Campo visual: OD (MD {{md_od}} dB), OI (MD {{md_oi}} dB).',
      assessment:
        'Glaucoma {{tipo}} (9C61). PIO: {{control_pio}}. Progresion: {{progresion}}.',
      plan: '1. Ajuste de tratamiento: {{ajuste}}\n2. Campo visual de control: {{cv}}\n3. OCT de control: {{oct}}\n4. Evaluar laser/cirugia si: {{indicacion_qx}}\n5. Proximo control: {{seguimiento}}.',
      default_vitals: [],
      default_icd_codes: ['9C61', '9C60', '9C6Z'],
      tags: ['glaucoma', 'PIO', 'campo visual', 'control'],
    },
    {
      name: 'Control de Retinopatia Diabetica',
      description: 'Seguimiento de fondo de ojo en paciente diabetico',
      type: 'follow_up',
      category: 'soap',
      subjective:
        'Paciente diabetico tipo {{tipo_dm}} desde {{tiempo_dm}}. HbA1c ultimo: {{hba1c}}%. Control metabolico: {{control_metabolico}}. Cambios en la vision: {{cambios_vision}}. Tratamiento ocular actual: {{tratamiento_ocular}}. Medicacion sistemica: {{medicacion}}.',
      objective:
        'AV cc: OD {{av_od}}, OI {{av_oi}}. PIO: OD {{pio_od}}, OI {{pio_oi}} mmHg. BMC: rubeosis iridis {{rubeosis}}. FO con dilatacion: OD {{fo_od}}, OI {{fo_oi}}. Microaneurismas: {{microaneurismas}}. Hemorragias: {{hemorragias}}. Exudados: {{exudados}}. Neovasos: {{neovasos}}. OCT macular: OD {{oct_od}}, OI {{oct_oi}}.',
      assessment:
        'Retinopatia diabetica {{clasificacion}} (9B71). Edema macular: {{edema}}. Indicacion de tratamiento: {{indicacion}}.',
      plan: '1. Anti-VEGF intravitREO si edema macular: {{anti_vegf}}\n2. Fotocoagulacion: {{fotocoagulacion}}\n3. Coordinacion con endocrinologia (meta HbA1c < 7%)\n4. Proximo control: {{seguimiento}}.',
      default_vitals: ['Glucemia capilar'],
      default_icd_codes: ['9B71', '9B70'],
      tags: ['retinopatia', 'diabetes', 'fondo de ojo'],
    },
  ],

  // ── Odontologia ────────────────────────────────────────────────────────
  odontologia: [
    {
      name: 'Primera Consulta Odontologica',
      description: 'Historia clinica y examen dental completo',
      type: 'initial_visit',
      category: 'soap',
      subjective:
        'Paciente de {{edad}} anos, {{sexo}}, acude por {{motivo_consulta}}. Dolor dental: {{dolor}} (localizacion: {{localizacion_dolor}}, intensidad: EVA {{eva}}/10, desencadenantes: {{desencadenantes}}). Sangrado de encias: {{sangrado_encias}}. Sensibilidad: {{sensibilidad}}. Halitosis: {{halitosis}}. Habitos: bruxismo {{bruxismo}}, tabaquismo {{tabaquismo}}. Ultimo control dental: {{ultimo_control}}.',
      objective:
        'Examen extraoral: ATM {{atm}}, ganglios {{ganglios}}, simetria facial {{simetria}}. Examen intraoral: mucosa {{mucosa}}, lengua {{lengua}}, paladar {{paladar}}, piso de boca {{piso_boca}}, encias {{encias}}. Odontograma: {{odontograma}}. Indice de placa: {{indice_placa}}. Indice gingival: {{indice_gingival}}. Oclusion: {{oclusion}}. Radiografias: {{radiografias}}.',
      assessment:
        '{{diagnosticos}}. Plan de tratamiento integral requerido: {{plan_integral}}.',
      plan: '1. Fase higienica: {{fase_higienica}}\n2. Fase correctiva: {{fase_correctiva}}\n3. Fase rehabilitadora: {{fase_rehabilitadora}}\n4. Presupuesto estimado: {{presupuesto}}\n5. Proximo turno: {{proximo_turno}}.',
      default_vitals: ['Presion arterial', 'Dolor (EVA)'],
      default_icd_codes: ['DA0Z', 'DA08', 'DA09'],
      tags: ['odontologia', 'primera consulta', 'odontograma'],
    },
    {
      name: 'Nota de Procedimiento Endodontico',
      description: 'Registro de tratamiento de conducto',
      type: 'procedure',
      category: 'soap',
      subjective:
        'Paciente acude para endodoncia de pieza {{pieza_dental}}. Diagnostico pulpar: {{diagnostico_pulpar}} (pulpitis irreversible/necrosis pulpar). Diagnostico periapical: {{diagnostico_periapical}}. Dolor actual: EVA {{eva}}/10.',
      objective:
        'Pieza {{pieza_dental}}: test de vitalidad {{vitalidad}}, percusion {{percusion}}, palpacion {{palpacion}}. Radiografia periapical: {{rx_periapical}}. Conductometria: {{conductometria}}. Tecnica: {{tecnica}} (rotatoria/reciprocante). Lima maestra: {{lima_maestra}}. Irrigacion: {{irrigacion}}. Obturacion: {{obturacion}} (gutapercha + cemento). Radiografia final: {{rx_final}}.',
      assessment:
        'Endodoncia de pieza {{pieza_dental}} completada. {{observaciones}}.',
      plan: '1. Analgesico: {{analgesico}} cada {{frecuencia}}h por {{dias}} dias\n2. Antibiotico (si indicado): {{antibiotico}}\n3. Evitar masticar del lado tratado por 48h\n4. Restauracion definitiva: {{restauracion}}\n5. Control en {{seguimiento}}.',
      default_vitals: ['Presion arterial', 'Dolor (EVA)'],
      default_icd_codes: ['DA03', 'DA04', 'DA05'],
      tags: ['endodoncia', 'conducto', 'procedimiento'],
    },
    {
      name: 'Control Periodontal',
      description: 'Seguimiento de paciente con enfermedad periodontal',
      type: 'follow_up',
      category: 'soap',
      subjective:
        'Paciente con enfermedad periodontal estadio {{estadio}}, grado {{grado}}, en tratamiento desde {{inicio_tto}}. Ultimo RAR: {{ultimo_rar}}. Sangrado al cepillado: {{sangrado}}. Movilidad dental percibida: {{movilidad}}. Tecnica de cepillado: {{tecnica_cepillado}}. Uso de interdental: {{interdental}}. Tabaquismo: {{tabaquismo}}.',
      objective:
        'Indice de placa: {{indice_placa}}%. BOP: {{bop}}%. Sondaje periodontal (sitios > 4mm): {{sondaje}}. Recesiones: {{recesiones}}. Movilidad: {{movilidad_exam}}. Supuracion: {{supuracion}}. Radiografias: {{radiografias}}.',
      assessment:
        'Enfermedad periodontal estadio {{estadio}} grado {{grado}} (EE40-EE4Z). Respuesta al tratamiento: {{respuesta}}.',
      plan: '1. {{tratamiento}} (RAR/cirugia/mantenimiento)\n2. Refuerzo de higiene oral: {{refuerzo}}\n3. Reevaluacion en {{seguimiento}}\n4. Profilaxis programada cada {{frecuencia_profilaxis}} meses.',
      default_vitals: [],
      default_icd_codes: ['EE40', 'EE41', 'EE4Z'],
      tags: ['periodoncia', 'sondaje', 'control'],
    },
  ],
};

/**
 * Returns library templates for the given specialty slug.
 * Matches by inclusion (e.g., "odontologia-general" matches "odontologia").
 */
export function getLibraryTemplatesForSpecialty(specialtySlug: string): LibraryClinicalTemplate[] {
  // Direct match
  if (TEMPLATE_LIBRARY[specialtySlug]) {
    return TEMPLATE_LIBRARY[specialtySlug];
  }

  // Partial match
  for (const [key, templates] of Object.entries(TEMPLATE_LIBRARY)) {
    if (specialtySlug.includes(key) || key.includes(specialtySlug)) {
      return templates;
    }
  }

  return [];
}

/**
 * Returns all templates across all specialties.
 */
export function getAllLibraryTemplates(): Array<LibraryClinicalTemplate & { specialty: string }> {
  const all: Array<LibraryClinicalTemplate & { specialty: string }> = [];
  for (const [specialty, templates] of Object.entries(TEMPLATE_LIBRARY)) {
    for (const tpl of templates) {
      all.push({ ...tpl, specialty });
    }
  }
  return all;
}

/**
 * Returns all specialty keys that have library templates.
 */
export function getSpecialtiesWithLibraryTemplates(): string[] {
  return Object.keys(TEMPLATE_LIBRARY);
}

/**
 * Common placeholders for template fields.
 */
export const COMMON_PLACEHOLDERS: Array<{ key: string; label: string; category: string }> = [
  // Paciente
  { key: 'edad', label: 'Edad', category: 'Paciente' },
  { key: 'sexo', label: 'Sexo', category: 'Paciente' },
  { key: 'peso', label: 'Peso (kg)', category: 'Paciente' },
  { key: 'talla', label: 'Talla (cm)', category: 'Paciente' },
  { key: 'imc', label: 'IMC', category: 'Paciente' },
  { key: 'antecedentes', label: 'Antecedentes', category: 'Paciente' },
  { key: 'alergias', label: 'Alergias', category: 'Paciente' },
  // Signos vitales
  { key: 'ta', label: 'Presion arterial', category: 'Signos Vitales' },
  { key: 'fc', label: 'Frecuencia cardiaca', category: 'Signos Vitales' },
  { key: 'fr', label: 'Frecuencia respiratoria', category: 'Signos Vitales' },
  { key: 'temp', label: 'Temperatura', category: 'Signos Vitales' },
  { key: 'spo2', label: 'Saturacion O2', category: 'Signos Vitales' },
  { key: 'glucemia', label: 'Glucemia capilar', category: 'Signos Vitales' },
  // Consulta
  { key: 'motivo_consulta', label: 'Motivo de consulta', category: 'Consulta' },
  { key: 'duracion', label: 'Duracion', category: 'Consulta' },
  { key: 'diagnostico_principal', label: 'Diagnostico principal', category: 'Consulta' },
  { key: 'codigo_icd11', label: 'Codigo ICD-11', category: 'Consulta' },
  { key: 'diferenciales', label: 'Diagnosticos diferenciales', category: 'Consulta' },
  { key: 'tratamiento', label: 'Tratamiento', category: 'Consulta' },
  { key: 'seguimiento', label: 'Seguimiento', category: 'Consulta' },
  { key: 'estudios_solicitados', label: 'Estudios solicitados', category: 'Consulta' },
  // Medicacion
  { key: 'medicacion', label: 'Medicacion actual', category: 'Medicacion' },
  { key: 'dosis', label: 'Dosis', category: 'Medicacion' },
  { key: 'frecuencia', label: 'Frecuencia', category: 'Medicacion' },
];
