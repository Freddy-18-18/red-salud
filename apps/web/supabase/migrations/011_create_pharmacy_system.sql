-- Sistema de Gestión de Farmacia
-- Migración completa para todas las tablas necesarias del módulo de farmacia

-- Tabla de inventario de medicamentos
CREATE TABLE IF NOT EXISTS farmacia_inventario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(100),
  principio_activo VARCHAR(200),
  presentacion VARCHAR(100), -- comprimidos, jarabe, inyectable, etc.
  concentracion VARCHAR(50), -- 500mg, 20mg/ml, etc.
  laboratorio VARCHAR(100),
  lote VARCHAR(50),
  fecha_vencimiento DATE NOT NULL,
  fecha_fabricacion DATE,
  stock_actual INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 0,
  precio_costo DECIMAL(10,2),
  precio_venta DECIMAL(10,2) NOT NULL,
  precio_venta_con_iva DECIMAL(10,2),
  iva_porcentaje DECIMAL(5,2) DEFAULT 16.00,
  requiere_receta BOOLEAN DEFAULT false,
  controlado BOOLEAN DEFAULT false,
  estado VARCHAR(20) DEFAULT 'activo', -- activo, inactivo, agotado, vencido
  ubicacion VARCHAR(100), -- pasillo, estante, etc.
  proveedor_id UUID,
  farmacia_id UUID REFERENCES profiles(id), -- farmacia que maneja este producto
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS farmacia_proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(200) NOT NULL,
  razon_social VARCHAR(200),
  rif VARCHAR(20) UNIQUE,
  telefono VARCHAR(20),
  email VARCHAR(200),
  direccion TEXT,
  contacto_principal VARCHAR(100),
  telefono_contacto VARCHAR(20),
  email_contacto VARCHAR(200),
  plazo_pago INTEGER DEFAULT 30, -- días
  estado VARCHAR(20) DEFAULT 'activo', -- activo, inactivo
  notas TEXT,
  farmacia_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de recetas médicas
CREATE TABLE IF NOT EXISTS farmacia_recetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_receta VARCHAR(50) UNIQUE,
  paciente_id UUID REFERENCES profiles(id),
  medico_id UUID REFERENCES profiles(id),
  cedula_paciente VARCHAR(20),
  nombre_paciente VARCHAR(200),
  cedula_medico VARCHAR(20),
  nombre_medico VARCHAR(200),
  especialidad_medico VARCHAR(100),
  mpps_medico VARCHAR(50),
  fecha_emision DATE NOT NULL,
  fecha_vencimiento DATE,
  diagnostico TEXT,
  medicamentos JSONB, -- array de medicamentos prescritos
  indicaciones TEXT,
  estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, procesada, dispensada, cancelada, vencida
  prioridad VARCHAR(20) DEFAULT 'normal', -- normal, urgente, cronico
  observaciones TEXT,
  procesada_por UUID REFERENCES profiles(id), -- farmaceutico que procesó
  fecha_procesamiento TIMESTAMP WITH TIME ZONE,
  total DECIMAL(10,2) DEFAULT 0,
  farmacia_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS farmacia_ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_factura VARCHAR(50) UNIQUE,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cliente_id UUID REFERENCES profiles(id), -- puede ser null para clientes genéricos
  nombre_cliente VARCHAR(200),
  cedula_cliente VARCHAR(20),
  telefono_cliente VARCHAR(20),
  email_cliente VARCHAR(200),
  productos JSONB NOT NULL, -- array de productos vendidos
  subtotal DECIMAL(10,2) NOT NULL,
  descuento DECIMAL(10,2) DEFAULT 0,
  iva DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  metodo_pago VARCHAR(30) NOT NULL, -- efectivo, tarjeta, transferencia, punto_venta
  referencia_pago VARCHAR(100), -- número de referencia o aprobación
  estado VARCHAR(20) DEFAULT 'completada', -- completada, pendiente, cancelada, devuelta
  notas TEXT,
  procesada_por UUID REFERENCES profiles(id) NOT NULL,
  receta_id UUID REFERENCES farmacia_recetas(id), -- si aplica
  farmacia_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de entregas a domicilio
CREATE TABLE IF NOT EXISTS farmacia_entregas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id UUID REFERENCES farmacia_ventas(id),
  cliente_id UUID REFERENCES profiles(id),
  nombre_cliente VARCHAR(200) NOT NULL,
  cedula_cliente VARCHAR(20),
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(200),
  direccion_entrega TEXT NOT NULL,
  referencia_direccion TEXT,
  coordenadas JSONB, -- latitud, longitud
  fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_programada TIMESTAMP WITH TIME ZONE,
  fecha_entrega TIMESTAMP WITH TIME ZONE,
  estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, en_ruta, entregada, cancelada, fallida
  costo_entrega DECIMAL(10,2) DEFAULT 0,
  notas TEXT,
  asignado_a UUID REFERENCES profiles(id), -- repartidor
  vehiculo VARCHAR(50),
  tiempo_estimado INTEGER, -- minutos
  distancia_estimada DECIMAL(5,2), -- km
  tracking_code VARCHAR(50) UNIQUE,
  firma_cliente TEXT, -- base64 de firma digital
  fotos_entrega JSONB, -- array de URLs de fotos
  farmacia_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pedidos a proveedores
CREATE TABLE IF NOT EXISTS farmacia_pedidos_proveedor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_pedido VARCHAR(50) UNIQUE,
  proveedor_id UUID REFERENCES farmacia_proveedores(id) NOT NULL,
  fecha_pedido TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_esperada TIMESTAMP WITH TIME ZONE,
  fecha_recepcion TIMESTAMP WITH TIME ZONE,
  estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, aprobado, enviado, recibido, cancelado
  productos JSONB NOT NULL, -- array de productos solicitados
  subtotal DECIMAL(10,2) NOT NULL,
  descuento DECIMAL(10,2) DEFAULT 0,
  iva DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  notas TEXT,
  solicitado_por UUID REFERENCES profiles(id) NOT NULL,
  aprobado_por UUID REFERENCES profiles(id),
  recibido_por UUID REFERENCES profiles(id),
  farmacia_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de alertas del sistema
CREATE TABLE IF NOT EXISTS farmacia_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50) NOT NULL, -- stock_bajo, vencimiento, pedido_pendiente, etc.
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  prioridad VARCHAR(20) DEFAULT 'media', -- baja, media, alta, critica
  estado VARCHAR(20) DEFAULT 'activa', -- activa, resuelta, descartada
  entidad_id UUID, -- ID del elemento relacionado (medicamento, receta, etc.)
  entidad_tipo VARCHAR(50), -- inventario, receta, venta, etc.
  datos JSONB, -- información adicional
  resuelta_por UUID REFERENCES profiles(id),
  fecha_resolucion TIMESTAMP WITH TIME ZONE,
  fecha_vencimiento TIMESTAMP WITH TIME ZONE, -- para alertas temporales
  farmacia_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de fidelización de clientes
CREATE TABLE IF NOT EXISTS farmacia_fidelizacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES profiles(id) NOT NULL,
  puntos_acumulados INTEGER DEFAULT 0,
  puntos_gastados INTEGER DEFAULT 0,
  puntos_disponibles INTEGER DEFAULT 0,
  nivel VARCHAR(20) DEFAULT 'bronce', -- bronce, plata, oro, platino
  fecha_ultima_compra TIMESTAMP WITH TIME ZONE,
  total_compras DECIMAL(10,2) DEFAULT 0,
  numero_compras INTEGER DEFAULT 0,
  beneficios_activos JSONB, -- array de beneficios disponibles
  estado VARCHAR(20) DEFAULT 'activo', -- activo, suspendido, inactivo
  farmacia_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración de precios y descuentos
CREATE TABLE IF NOT EXISTS farmacia_precios_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50) NOT NULL, -- precio_base, descuento, promocion
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  aplicable_a VARCHAR(50), -- medicamento, categoria, cliente, general
  entidad_id UUID, -- ID del medicamento o categoria si aplica
  porcentaje DECIMAL(5,2), -- para descuentos porcentuales
  monto_fijo DECIMAL(10,2), -- para descuentos fijos
  condiciones JSONB, -- condiciones de aplicación
  fecha_inicio TIMESTAMP WITH TIME ZONE,
  fecha_fin TIMESTAMP WITH TIME ZONE,
  activo BOOLEAN DEFAULT true,
  prioridad INTEGER DEFAULT 0, -- orden de aplicación
  farmacia_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_inventario_farmacia ON farmacia_inventario(farmacia_id);
CREATE INDEX idx_inventario_categoria ON farmacia_inventario(categoria);
CREATE INDEX idx_inventario_estado ON farmacia_inventario(estado);
CREATE INDEX idx_inventario_fecha_vencimiento ON farmacia_inventario(fecha_vencimiento);
CREATE INDEX idx_inventario_stock ON farmacia_inventario(stock_actual, stock_minimo);

CREATE INDEX idx_proveedores_farmacia ON farmacia_proveedores(farmacia_id);
CREATE INDEX idx_proveedores_estado ON farmacia_proveedores(estado);

CREATE INDEX idx_recetas_farmacia ON farmacia_recetas(farmacia_id);
CREATE INDEX idx_recetas_paciente ON farmacia_recetas(paciente_id);
CREATE INDEX idx_recetas_medico ON farmacia_recetas(medico_id);
CREATE INDEX idx_recetas_estado ON farmacia_recetas(estado);
CREATE INDEX idx_recetas_fecha_vencimiento ON farmacia_recetas(fecha_vencimiento);

CREATE INDEX idx_ventas_farmacia ON farmacia_ventas(farmacia_id);
CREATE INDEX idx_ventas_cliente ON farmacia_ventas(cliente_id);
CREATE INDEX idx_ventas_fecha ON farmacia_ventas(fecha);
CREATE INDEX idx_ventas_estado ON farmacia_ventas(estado);

CREATE INDEX idx_entregas_farmacia ON farmacia_entregas(farmacia_id);
CREATE INDEX idx_entregas_venta ON farmacia_entregas(venta_id);
CREATE INDEX idx_entregas_estado ON farmacia_entregas(estado);
CREATE INDEX idx_entregas_fecha_programada ON farmacia_entregas(fecha_programada);

CREATE INDEX idx_pedidos_proveedor_farmacia ON farmacia_pedidos_proveedor(farmacia_id);
CREATE INDEX idx_pedidos_proveedor_proveedor ON farmacia_pedidos_proveedor(proveedor_id);
CREATE INDEX idx_pedidos_proveedor_estado ON farmacia_pedidos_proveedor(estado);

CREATE INDEX idx_alertas_farmacia ON farmacia_alertas(farmacia_id);
CREATE INDEX idx_alertas_tipo ON farmacia_alertas(tipo);
CREATE INDEX idx_alertas_prioridad ON farmacia_alertas(prioridad);
CREATE INDEX idx_alertas_estado ON farmacia_alertas(estado);

CREATE INDEX idx_fidelizacion_cliente ON farmacia_fidelizacion(cliente_id);
CREATE INDEX idx_fidelizacion_farmacia ON farmacia_fidelizacion(farmacia_id);
CREATE INDEX idx_fidelizacion_nivel ON farmacia_fidelizacion(nivel);

CREATE INDEX idx_precios_config_farmacia ON farmacia_precios_config(farmacia_id);
CREATE INDEX idx_precios_config_tipo ON farmacia_precios_config(tipo);
CREATE INDEX idx_precios_config_activo ON farmacia_precios_config(activo);

-- Funciones útiles
CREATE OR REPLACE FUNCTION actualizar_stock_inventario()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar estado basado en stock
  IF NEW.stock_actual <= 0 THEN
    NEW.estado = 'agotado';
  ELSIF NEW.stock_actual <= NEW.stock_minimo THEN
    NEW.estado = 'stock_bajo';
  ELSE
    NEW.estado = 'activo';
  END IF;

  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estado del inventario
CREATE TRIGGER trigger_actualizar_stock_inventario
  BEFORE UPDATE ON farmacia_inventario
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_stock_inventario();

-- Función para generar alertas automáticas
CREATE OR REPLACE FUNCTION generar_alertas_automaticas()
RETURNS VOID AS $$
BEGIN
  -- Alertas de stock bajo
  INSERT INTO farmacia_alertas (tipo, titulo, descripcion, prioridad, entidad_id, entidad_tipo, datos, farmacia_id)
  SELECT
    'stock_bajo',
    'Stock bajo: ' || nombre,
    'El producto ' || nombre || ' tiene stock bajo (' || stock_actual || ' unidades)',
    'alta',
    id,
    'inventario',
    jsonb_build_object('stock_actual', stock_actual, 'stock_minimo', stock_minimo),
    farmacia_id
  FROM farmacia_inventario
  WHERE estado = 'stock_bajo'
  AND NOT EXISTS (
    SELECT 1 FROM farmacia_alertas
    WHERE entidad_id = farmacia_inventario.id
    AND tipo = 'stock_bajo'
    AND estado = 'activa'
  );

  -- Alertas de productos próximos a vencer (30 días)
  INSERT INTO farmacia_alertas (tipo, titulo, descripcion, prioridad, entidad_id, entidad_tipo, datos, farmacia_id, fecha_vencimiento)
  SELECT
    'vencimiento',
    'Producto próximo a vencer: ' || nombre,
    'El producto ' || nombre || ' vence el ' || fecha_vencimiento::text,
    CASE WHEN fecha_vencimiento <= CURRENT_DATE + INTERVAL '7 days' THEN 'critica'
         WHEN fecha_vencimiento <= CURRENT_DATE + INTERVAL '15 days' THEN 'alta'
         ELSE 'media' END,
    id,
    'inventario',
    jsonb_build_object('fecha_vencimiento', fecha_vencimiento, 'dias_restantes', (fecha_vencimiento - CURRENT_DATE)),
    farmacia_id,
    fecha_vencimiento
  FROM farmacia_inventario
  WHERE fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days'
  AND estado = 'activo'
  AND NOT EXISTS (
    SELECT 1 FROM farmacia_alertas
    WHERE entidad_id = farmacia_inventario.id
    AND tipo = 'vencimiento'
    AND estado = 'activa'
  );
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar fidelización después de una venta
CREATE OR REPLACE FUNCTION actualizar_fidelizacion_venta()
RETURNS TRIGGER AS $$
DECLARE
  puntos_ganados INTEGER;
BEGIN
  -- Solo para ventas completadas
  IF NEW.estado = 'completada' THEN
    -- Calcular puntos (1 punto por cada 10 Bs de compra)
    puntos_ganados := FLOOR(NEW.total / 10);

    -- Actualizar o crear registro de fidelización
    INSERT INTO farmacia_fidelizacion (cliente_id, puntos_acumulados, puntos_disponibles, fecha_ultima_compra, total_compras, numero_compras, farmacia_id)
    VALUES (NEW.cliente_id, puntos_ganados, puntos_ganados, NEW.fecha, NEW.total, 1, NEW.farmacia_id)
    ON CONFLICT (cliente_id)
    DO UPDATE SET
      puntos_acumulados = farmacia_fidelizacion.puntos_acumulados + puntos_ganados,
      puntos_disponibles = farmacia_fidelizacion.puntos_disponibles + puntos_ganados,
      fecha_ultima_compra = NEW.fecha,
      total_compras = farmacia_fidelizacion.total_compras + NEW.total,
      numero_compras = farmacia_fidelizacion.numero_compras + 1,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para fidelización
CREATE TRIGGER trigger_actualizar_fidelizacion
  AFTER INSERT ON farmacia_ventas
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fidelizacion_venta();

-- Políticas de seguridad RLS
ALTER TABLE farmacia_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmacia_proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmacia_recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmacia_ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmacia_entregas ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmacia_pedidos_proveedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmacia_alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmacia_fidelizacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmacia_precios_config ENABLE ROW LEVEL SECURITY;

-- Políticas: Farmacias solo pueden acceder a sus propios datos
CREATE POLICY "Farmacias pueden gestionar su inventario"
  ON farmacia_inventario FOR ALL
  TO authenticated
  USING (farmacia_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Farmacias pueden gestionar sus proveedores"
  ON farmacia_proveedores FOR ALL
  TO authenticated
  USING (farmacia_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Farmacias pueden gestionar sus recetas"
  ON farmacia_recetas FOR ALL
  TO authenticated
  USING (farmacia_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Farmacias pueden gestionar sus ventas"
  ON farmacia_ventas FOR ALL
  TO authenticated
  USING (farmacia_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Farmacias pueden gestionar sus entregas"
  ON farmacia_entregas FOR ALL
  TO authenticated
  USING (farmacia_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Farmacias pueden gestionar sus pedidos"
  ON farmacia_pedidos_proveedor FOR ALL
  TO authenticated
  USING (farmacia_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Farmacias pueden gestionar sus alertas"
  ON farmacia_alertas FOR ALL
  TO authenticated
  USING (farmacia_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Farmacias pueden gestionar fidelización"
  ON farmacia_fidelizacion FOR ALL
  TO authenticated
  USING (farmacia_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Farmacias pueden gestionar precios"
  ON farmacia_precios_config FOR ALL
  TO authenticated
  USING (farmacia_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Políticas adicionales para pacientes y médicos
CREATE POLICY "Pacientes pueden ver sus recetas"
  ON farmacia_recetas FOR SELECT
  TO authenticated
  USING (paciente_id = auth.uid());

CREATE POLICY "Médicos pueden ver sus recetas emitidas"
  ON farmacia_recetas FOR SELECT
  TO authenticated
  USING (medico_id = auth.uid());

CREATE POLICY "Pacientes pueden ver su fidelización"
  ON farmacia_fidelizacion FOR SELECT
  TO authenticated
  USING (cliente_id = auth.uid());

-- Insertar datos de ejemplo para desarrollo
INSERT INTO farmacia_inventario (nombre, descripcion, categoria, presentacion, concentracion, laboratorio, fecha_vencimiento, stock_actual, stock_minimo, precio_venta, requiere_receta, farmacia_id) VALUES
('Paracetamol 500mg', 'Analgésico y antipirético', 'Analgésicos', 'Comprimidos', '500mg', 'Farmacéutica ABC', '2025-12-31', 150, 20, 2.50, false, (SELECT id FROM profiles WHERE role = 'farmacia' LIMIT 1)),
('Amoxicilina 500mg', 'Antibiótico de amplio espectro', 'Antibióticos', 'Cápsulas', '500mg', 'Laboratorios XYZ', '2024-08-15', 8, 15, 8.75, true, (SELECT id FROM profiles WHERE role = 'farmacia' LIMIT 1)),
('Ibuprofeno 400mg', 'Antiinflamatorio no esteroideo', 'Antiinflamatorios', 'Comprimidos', '400mg', 'Farmacéutica ABC', '2025-06-20', 0, 10, 3.25, false, (SELECT id FROM profiles WHERE role = 'farmacia' LIMIT 1)),
('Omeprazol 20mg', 'Inhibidor de la bomba de protones', 'Gastrointestinales', 'Cápsulas', '20mg', 'Laboratorios DEF', '2024-03-10', 45, 12, 5.50, false, (SELECT id FROM profiles WHERE role = 'farmacia' LIMIT 1)),
('Vitamina C 1000mg', 'Suplemento vitamínico', 'Vitaminas', 'Comprimidos efervescentes', '1000mg', 'NutriLabs', '2025-09-15', 75, 25, 4.00, false, (SELECT id FROM profiles WHERE role = 'farmacia' LIMIT 1))
ON CONFLICT DO NOTHING;

INSERT INTO farmacia_proveedores (nombre, rif, telefono, email, direccion, contacto_principal, telefono_contacto, farmacia_id) VALUES
('Farmacéutica ABC', 'J-12345678-9', '0212-555-0101', 'ventas@farmabc.com', 'Caracas, Venezuela', 'María López', '0414-123-4567', (SELECT id FROM profiles WHERE role = 'farmacia' LIMIT 1)),
('Laboratorios XYZ', 'J-87654321-0', '0212-555-0202', 'info@labxyz.com', 'Valencia, Venezuela', 'Carlos Rodríguez', '0416-987-6543', (SELECT id FROM profiles WHERE role = 'farmacia' LIMIT 1))
ON CONFLICT (rif) DO NOTHING;