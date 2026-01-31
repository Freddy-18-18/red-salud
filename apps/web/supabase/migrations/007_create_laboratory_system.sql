-- Sistema de Laboratorio Clínico
-- Gestión de órdenes, resultados y análisis de laboratorio

-- Catálogo de tipos de exámenes de laboratorio
CREATE TABLE IF NOT EXISTS lab_test_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo CHARACTER VARYING(50) UNIQUE NOT NULL,
  nombre CHARACTER VARYING(255) NOT NULL,
  categoria CHARACTER VARYING(100), -- Hematología, Química Sanguínea, Urianálisis, etc.
  descripcion TEXT,
  preparacion_requerida TEXT, -- Instrucciones de preparación (ayuno, etc.)
  tiempo_entrega_horas INTEGER DEFAULT 24,
  requiere_ayuno BOOLEAN DEFAULT FALSE,
  precio_referencia NUMERIC(10,2),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE lab_test_types IS 'Catálogo de tipos de exámenes de laboratorio disponibles';

-- Órdenes de laboratorio
CREATE TABLE IF NOT EXISTS lab_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  medico_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  laboratorio_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  medical_record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,
  numero_orden CHARACTER VARYING(50) UNIQUE NOT NULL,
  fecha_orden DATE DEFAULT CURRENT_DATE,
  fecha_muestra TIMESTAMPTZ, -- Fecha de toma de muestra
  fecha_entrega_estimada DATE,
  diagnostico_presuntivo TEXT,
  indicaciones_clinicas TEXT,
  status CHARACTER VARYING(50) DEFAULT 'pendiente' CHECK (
    status IN ('pendiente', 'muestra_tomada', 'en_proceso', 'completada', 'cancelada', 'rechazada')
  ),
  prioridad CHARACTER VARYING(20) DEFAULT 'normal' CHECK (
    prioridad IN ('normal', 'urgente', 'stat')
  ),
  requiere_ayuno BOOLEAN DEFAULT FALSE,
  instrucciones_paciente TEXT,
  notas_internas TEXT,
  costo_total NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE lab_orders IS 'Órdenes de laboratorio solicitadas por médicos';
COMMENT ON COLUMN lab_orders.status IS 'Estado: pendiente, muestra_tomada, en_proceso, completada, cancelada, rechazada';
COMMENT ON COLUMN lab_orders.prioridad IS 'Prioridad: normal, urgente, stat (inmediato)';

-- Exámenes incluidos en cada orden
CREATE TABLE IF NOT EXISTS lab_order_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
  test_type_id UUID NOT NULL REFERENCES lab_test_types(id) ON DELETE RESTRICT,
  status CHARACTER VARYING(50) DEFAULT 'pendiente' CHECK (
    status IN ('pendiente', 'en_proceso', 'completado', 'cancelado')
  ),
  resultado_disponible BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE lab_order_tests IS 'Exámenes específicos incluidos en cada orden';

-- Resultados de laboratorio
CREATE TABLE IF NOT EXISTS lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
  test_type_id UUID NOT NULL REFERENCES lab_test_types(id) ON DELETE RESTRICT,
  fecha_resultado TIMESTAMPTZ DEFAULT NOW(),
  resultado_pdf_url TEXT, -- URL del PDF completo
  observaciones_generales TEXT,
  validado_por UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Profesional que validó
  fecha_validacion TIMESTAMPTZ,
  notificado_paciente BOOLEAN DEFAULT FALSE,
  fecha_notificacion TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE lab_results IS 'Resultados generales de exámenes de laboratorio';

-- Valores individuales de cada resultado
CREATE TABLE IF NOT EXISTS lab_result_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES lab_results(id) ON DELETE CASCADE,
  parametro CHARACTER VARYING(255) NOT NULL,
  valor CHARACTER VARYING(255),
  unidad CHARACTER VARYING(50),
  rango_referencia CHARACTER VARYING(255),
  valor_minimo NUMERIC,
  valor_maximo NUMERIC,
  es_anormal BOOLEAN DEFAULT FALSE,
  nivel_alerta CHARACTER VARYING(20) CHECK (
    nivel_alerta IS NULL OR nivel_alerta IN ('normal', 'bajo', 'alto', 'critico')
  ),
  notas TEXT,
  orden INTEGER DEFAULT 0, -- Para ordenar los parámetros
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE lab_result_values IS 'Valores individuales de cada parámetro analizado';
COMMENT ON COLUMN lab_result_values.nivel_alerta IS 'Nivel de alerta: normal, bajo, alto, critico';

-- Historial de cambios de estado
CREATE TABLE IF NOT EXISTS lab_order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
  status_anterior CHARACTER VARYING(50),
  status_nuevo CHARACTER VARYING(50) NOT NULL,
  comentario TEXT,
  cambiado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE lab_order_status_history IS 'Historial de cambios de estado de órdenes';

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_lab_orders_paciente ON lab_orders(paciente_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_medico ON lab_orders(medico_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_laboratorio ON lab_orders(laboratorio_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON lab_orders(status);
CREATE INDEX IF NOT EXISTS idx_lab_orders_fecha ON lab_orders(fecha_orden DESC);
CREATE INDEX IF NOT EXISTS idx_lab_orders_numero ON lab_orders(numero_orden);
CREATE INDEX IF NOT EXISTS idx_lab_order_tests_order ON lab_order_tests(order_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_order ON lab_results(order_id);
CREATE INDEX IF NOT EXISTS idx_lab_result_values_result ON lab_result_values(result_id);
CREATE INDEX IF NOT EXISTS idx_lab_result_values_anormal ON lab_result_values(es_anormal) WHERE es_anormal = TRUE;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_lab_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lab_orders_updated_at
  BEFORE UPDATE ON lab_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_lab_timestamp();

CREATE TRIGGER lab_results_updated_at
  BEFORE UPDATE ON lab_results
  FOR EACH ROW
  EXECUTE FUNCTION update_lab_timestamp();

CREATE TRIGGER lab_test_types_updated_at
  BEFORE UPDATE ON lab_test_types
  FOR EACH ROW
  EXECUTE FUNCTION update_lab_timestamp();

-- Trigger para registrar cambios de estado
CREATE OR REPLACE FUNCTION log_lab_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO lab_order_status_history (
      order_id,
      status_anterior,
      status_nuevo,
      cambiado_por
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lab_order_status_change
  AFTER UPDATE ON lab_orders
  FOR EACH ROW
  EXECUTE FUNCTION log_lab_order_status_change();

-- Función para generar número de orden único
CREATE OR REPLACE FUNCTION generate_lab_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    new_number := 'LAB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    SELECT EXISTS(SELECT 1 FROM lab_orders WHERE numero_orden = new_number) INTO exists_check;
    
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE lab_test_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_order_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_result_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_order_status_history ENABLE ROW LEVEL SECURITY;

-- Políticas para lab_test_types (catálogo público)
CREATE POLICY "Anyone can view active test types" ON lab_test_types
  FOR SELECT USING (activo = TRUE);

-- Políticas para lab_orders
CREATE POLICY "Patients can view their orders" ON lab_orders
  FOR SELECT USING (auth.uid() = paciente_id);

CREATE POLICY "Doctors can view their orders" ON lab_orders
  FOR SELECT USING (auth.uid() = medico_id);

CREATE POLICY "Labs can view their orders" ON lab_orders
  FOR SELECT USING (auth.uid() = laboratorio_id);

CREATE POLICY "Doctors can create orders" ON lab_orders
  FOR INSERT WITH CHECK (auth.uid() = medico_id);

CREATE POLICY "Authorized users can update orders" ON lab_orders
  FOR UPDATE USING (
    auth.uid() = medico_id OR 
    auth.uid() = laboratorio_id OR
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Políticas para lab_order_tests
CREATE POLICY "Users can view tests from their orders" ON lab_order_tests
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM lab_orders 
      WHERE paciente_id = auth.uid() 
        OR medico_id = auth.uid() 
        OR laboratorio_id = auth.uid()
    )
  );

-- Políticas para lab_results
CREATE POLICY "Users can view results from their orders" ON lab_results
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM lab_orders 
      WHERE paciente_id = auth.uid() 
        OR medico_id = auth.uid() 
        OR laboratorio_id = auth.uid()
    )
  );

CREATE POLICY "Labs can create results" ON lab_results
  FOR INSERT WITH CHECK (
    order_id IN (SELECT id FROM lab_orders WHERE laboratorio_id = auth.uid())
  );

CREATE POLICY "Labs can update results" ON lab_results
  FOR UPDATE USING (
    order_id IN (SELECT id FROM lab_orders WHERE laboratorio_id = auth.uid())
  );

-- Políticas para lab_result_values
CREATE POLICY "Users can view result values" ON lab_result_values
  FOR SELECT USING (
    result_id IN (
      SELECT lr.id FROM lab_results lr
      JOIN lab_orders lo ON lr.order_id = lo.id
      WHERE lo.paciente_id = auth.uid() 
        OR lo.medico_id = auth.uid() 
        OR lo.laboratorio_id = auth.uid()
    )
  );

-- Políticas para lab_order_status_history
CREATE POLICY "Users can view status history" ON lab_order_status_history
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM lab_orders 
      WHERE paciente_id = auth.uid() 
        OR medico_id = auth.uid() 
        OR laboratorio_id = auth.uid()
    )
  );
