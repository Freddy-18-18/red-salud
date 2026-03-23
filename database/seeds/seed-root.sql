-- ============================================================================
-- PHARMACY ERP/POS SYSTEM - SEED DATA
-- ============================================================================
-- This script populates the database with initial data for testing and demo
-- ============================================================================

-- ============================================================================
-- WAREHOUSES
-- ============================================================================

INSERT INTO warehouses (id, name, code, type, address, phone, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Farmacia Principal', 'FP-001', 'store', 'Av. Principal, Centro, Caracas', '+58-212-555-0101', true),
('550e8400-e29b-41d4-a716-446655440002', 'Bodega Central', 'BC-001', 'central', 'Zona Industrial, Caracas', '+58-212-555-0102', true),
('550e8400-e29b-41d4-a716-446655440003', 'Farmacia Este', 'FE-001', 'store', 'Av. Los Próceres, Caracas', '+58-212-555-0103', true);

-- ============================================================================
-- USERS
-- ============================================================================

-- Note: These users need to be created in auth.users first, then referenced here
-- For demo purposes, we'll use placeholder UUIDs that match auth.users

INSERT INTO pharmacy_users (id, email, first_name, last_name, phone, role, is_active) VALUES
('admin-001', 'admin@redsalud.com', 'Carlos', 'García', '+58-414-123-4567', 'admin', true),
('manager-001', 'manager@redsalud.com', 'María', 'Rodríguez', '+58-414-234-5678', 'manager', true),
('pharmacist-001', 'pharmacist@redsalud.com', 'Ana', 'Martínez', '+58-414-345-6789', 'pharmacist', true),
('cashier-001', 'cashier@redsalud.com', 'Luis', 'Pérez', '+58-414-456-7890', 'cashier', true),
('supervisor-001', 'supervisor@redsalud.com', 'Pedro', 'Sánchez', '+58-414-567-8901', 'supervisor', true);

-- ============================================================================
-- SUPPLIERS
-- ============================================================================

INSERT INTO suppliers (id, name, rif, contact_person, email, phone, address, payment_terms, credit_limit, balance, is_active) VALUES
('sup-001', 'Laboratorios Pfizer Venezuela', 'J-12345678-9', 'Carlos Méndez', 'carlos.mendez@pfizer.com', '+58-212-111-1111', 'Av. Urdaneta, Caracas', 'NET 30', 500000, 0, true),
('sup-002', 'Novartis Venezuela', 'J-23456789-0', 'Ana López', 'ana.lopez@novartis.com', '+58-212-222-2222', 'Av. Francisco de Miranda, Caracas', 'NET 45', 300000, 0, true),
('sup-003', 'Farmaquímica del Caribe', 'J-34567890-1', 'Roberto Díaz', 'roberto.diaz@farmaquimica.com', '+58-212-333-3333', 'Zona Industrial, Valencia', 'NET 30', 200000, 0, true),
('sup-004', 'Distribuidora Nacional', 'J-45678901-2', 'Carmen Silva', 'carmen.silva@distnacional.com', '+58-212-444-4444', 'Centro, Maracaibo', 'NET 15', 150000, 0, true);

-- ============================================================================
-- PRODUCTS
-- ============================================================================

INSERT INTO products (id, sku, barcode, name, generic_name, active_ingredient, description, product_type, category, manufacturer, brand, cost_price_usd, cost_price_ves, sale_price_usd, sale_price_ves, wholesale_price_usd, wholesale_price_ves, iva_rate, iva_exempt, min_stock, max_stock, reorder_point, unit_type, units_per_box, allow_fractional_sale, requires_prescription, controlled_substance, psychotropic, refrigerated, tags, created_by) VALUES
-- Analgesics
('prod-001', 'PAR500', '7501234561234', 'Paracetamol 500mg', 'Paracetamol', 'Paracetamol', 'Analgésico y antipirético', 'medicine', 'analgesic', 'Laboratorios Venezuela', 'Genérico', 0.05, 2.50, 0.12, 6.00, 0.08, 4.00, 0.16, false, 20, 100, 30, 'unit', 20, true, false, false, false, false, '{"analgesic", "pain", "fever"}', 'admin-001'),
('prod-002', 'PAR1000', '7501234561235', 'Paracetamol 1g', 'Paracetamol', 'Paracetamol', 'Analgésico potente', 'medicine', 'analgesic', 'Laboratorios Venezuela', 'Genérico', 0.08, 4.00, 0.20, 10.00, 0.15, 7.50, 0.16, false, 15, 80, 25, 'unit', 20, true, false, false, false, false, '{"analgesic", "pain", "fever"}', 'admin-001'),
('prod-003', 'IBU400', '7501234561236', 'Ibuprofeno 400mg', 'Ibuprofeno', 'Ibuprofeno', 'Analgésico antiinflamatorio', 'medicine', 'analgesic', 'Laboratorios Venezuela', 'Genérico', 0.10, 5.00, 0.25, 12.50, 0.20, 10.00, 0.16, false, 15, 75, 25, 'unit', 20, true, false, false, false, false, '{"analgesic", "anti-inflammatory", "pain"}', 'admin-001'),

-- Antibiotics
('prod-004', 'AMO500', '7501234561237', 'Amoxicilina 500mg', 'Amoxicilina', 'Amoxicilina', 'Antibiótico de amplio espectro', 'medicine', 'antibiotic', 'Pfizer', 'Amoxil', 0.15, 7.50, 0.35, 17.50, 0.28, 14.00, 0.16, false, 10, 50, 15, 'unit', 20, false, true, false, false, false, '{"antibiotic", "infection"}', 'admin-001'),
('prod-005', 'AZI500', '7501234561238', 'Azitromicina 500mg', 'Azitromicina', 'Azitromicina', 'Antibiótico macrólido', 'medicine', 'antibiotic', 'Pfizer', 'Zithromax', 0.25, 12.50, 0.60, 30.00, 0.48, 24.00, 0.16, false, 8, 40, 12, 'unit', 6, false, true, false, false, false, '{"antibiotic", "infection"}', 'admin-001'),

-- Antihypertensives
('prod-006', 'LOS50', '7501234561239', 'Losartán 50mg', 'Losartán', 'Losartán', 'Antihipertensivo', 'medicine', 'antihypertensive', 'Novartis', 'Cozaar', 0.20, 10.00, 0.45, 22.50, 0.36, 18.00, 0.16, false, 20, 100, 30, 'unit', 30, false, true, false, false, false, '{"antihypertensive", "blood pressure"}', 'admin-001'),
('prod-007', 'ENAL10', '7501234561240', 'Enalapril 10mg', 'Enalapril', 'Enalapril', 'Antihipertensivo IECA', 'medicine', 'antihypertensive', 'Laboratorios Venezuela', 'Genérico', 0.12, 6.00, 0.30, 15.00, 0.24, 12.00, 0.16, false, 20, 100, 30, 'unit', 30, false, true, false, false, false, '{"antihypertensive", "blood pressure"}', 'admin-001'),

-- Diabetes
('prod-008', 'MET850', '7501234561241', 'Metformina 850mg', 'Metformina', 'Metformina', 'Antidiabético oral', 'medicine', 'diabetes', 'Novartis', 'Glucophage', 0.08, 4.00, 0.20, 10.00, 0.16, 8.00, 0.16, false, 30, 150, 50, 'unit', 60, false, true, false, false, false, '{"diabetes", "blood sugar"}', 'admin-001'),
('prod-009', 'GLIP5', '7501234561242', 'Glibenclamida 5mg', 'Glibenclamida', 'Glibenclamida', 'Antidiabético sulfonilurea', 'medicine', 'diabetes', 'Laboratorios Venezuela', 'Genérico', 0.10, 5.00, 0.25, 12.50, 0.20, 10.00, 0.16, false, 25, 125, 40, 'unit', 60, false, true, false, false, false, '{"diabetes", "blood sugar"}', 'admin-001'),

-- Cardiovascular
('prod-010', 'ATOR20', '7501234561243', 'Atorvastatina 20mg', 'Atorvastatina', 'Atorvastatina', 'Estatina para colesterol', 'medicine', 'cardiovascular', 'Pfizer', 'Lipitor', 0.35, 17.50, 0.80, 40.00, 0.64, 32.00, 0.16, false, 15, 75, 25, 'unit', 30, false, true, false, false, false, '{"cardiovascular", "cholesterol"}', 'admin-001'),
('prod-011', 'ASPI100', '7501234561244', 'Aspirina 100mg', 'Ácido Acetilsalicílico', 'Ácido Acetilsalicílico', 'Antiagregante plaquetario', 'medicine', 'cardiovascular', 'Bayer', 'Aspirina Cardio', 0.05, 2.50, 0.15, 7.50, 0.12, 6.00, 0.16, false, 50, 200, 75, 'unit', 100, true, false, false, false, false, '{"cardiovascular", "blood thinner"}', 'admin-001'),

-- Vitamins
('prod-012', 'VITC500', '7501234561245', 'Vitamina C 500mg', 'Ácido Ascórbico', 'Ácido Ascórbico', 'Suplemento vitamínico', 'supply', 'vitamins', 'Laboratorios Venezuela', 'Genérico', 0.03, 1.50, 0.08, 4.00, 0.06, 3.00, 0.16, false, 30, 150, 50, 'unit', 100, true, false, false, false, false, '{"vitamins", "supplement"}', 'admin-001'),
('prod-013', 'MULTI', '7501234561246', 'Multivitamínico', 'Multivitamínico', 'Vitaminas A, B, C, D, E', 'Suplemento completo', 'supply', 'vitamins', 'Novartis', 'Centrum', 0.25, 12.50, 0.60, 30.00, 0.48, 24.00, 0.16, false, 20, 100, 35, 'unit', 60, false, false, false, false, false, '{"vitamins", "supplement"}', 'admin-001'),

-- Dermatology
('prod-014', 'CREM1', '7501234561247', 'Hidratante Facial', 'Crema Hidratante', 'Glicerina', 'Cuidado de piel', 'cosmetic', 'dermatology', 'Laboratorios Venezuela', 'Genérico', 0.15, 7.50, 0.40, 20.00, 0.32, 16.00, 0.16, false, 10, 50, 15, 'unit', 1, false, false, false, false, false, '{"skin", "moisturizer"}', 'admin-001'),
('prod-015', 'ACNE', '7501234561248', 'Gel Anti-Acné', 'Benzoyl Peroxide', 'Benzoyl Peroxide', 'Tratamiento acné', 'cosmetic', 'dermatology', 'Laboratorios Venezuela', 'Genérico', 0.20, 10.00, 0.50, 25.00, 0.40, 20.00, 0.16, false, 8, 40, 12, 'unit', 1, false, false, false, false, false, '{"skin", "acne"}', 'admin-001'),

-- Respiratory
('prod-016', 'SALB', '7501234561249', 'Salbutamol 100mcg', 'Salbutamol', 'Salbutamol Sulfato', 'Broncodilatador', 'medicine', 'respiratory', 'Laboratorios Venezuela', 'Genérico', 0.30, 15.00, 0.70, 35.00, 0.56, 28.00, 0.16, false, 10, 50, 15, 'unit', 1, false, true, false, false, false, '{"respiratory", "asthma"}', 'admin-001'),
('prod-017', 'FLUT', '7501234561250', 'Fluticasona 250mcg', 'Fluticasona', 'Fluticasona Propionato', 'Corticoide inhalado', 'medicine', 'respiratory', 'Pfizer', 'Flovent', 0.45, 22.50, 1.00, 50.00, 0.80, 40.00, 0.16, false, 8, 40, 12, 'unit', 1, false, true, false, false, false, '{"respiratory", "asthma"}', 'admin-001'),

-- Gastrointestinal
('prod-018', 'OME20', '7501234561251', 'Omeprazol 20mg', 'Omeprazol', 'Omeprazol', 'Inhibidor de bomba de protones', 'medicine', 'gastrointestinal', 'Laboratorios Venezuela', 'Genérico', 0.08, 4.00, 0.20, 10.00, 0.16, 8.00, 0.16, false, 25, 125, 40, 'unit', 30, false, true, false, false, false, '{"gastrointestinal", "acid reflux"}', 'admin-001'),
('prod-019', 'RAN150', '7501234561252', 'Ranitidina 150mg', 'Ranitidina', 'Ranitidina', 'Antiulceroso', 'medicine', 'gastrointestinal', 'Laboratorios Venezuela', 'Genérico', 0.06, 3.00, 0.15, 7.50, 0.12, 6.00, 0.16, false, 25, 125, 40, 'unit', 30, false, true, false, false, false, '{"gastrointestinal", "acid reflux"}', 'admin-001'),

-- Controlled Substances (Psychotropic)
('prod-020', 'DIAZ10', '7501234561253', 'Diazepam 10mg', 'Diazepam', 'Diazepam', 'Benzodiacepina', 'medicine', 'psychotropic', 'Laboratorios Venezuela', 'Genérico', 0.15, 7.50, 0.40, 20.00, 0.32, 16.00, 0.16, false, 5, 25, 8, 'unit', 30, false, true, false, true, true, '{"psychotropic", "anxiolytic"}', 'admin-001');

-- ============================================================================
-- BATCHES (Inventory with FEFO tracking)
-- ============================================================================

INSERT INTO batches (id, product_id, lot_number, expiry_date, manufacturing_date, warehouse_id, location, zone, quantity, original_quantity, received_at, supplier_id) VALUES
-- Paracetamol batches
('batch-001', 'prod-001', 'LOT-2024-001', '2025-12-31', '2024-01-15', '550e8400-e29b-41d4-a716-446655440001', 'A-01-01', 'available', 50, 100, '2024-01-20', 'sup-001'),
('batch-002', 'prod-001', 'LOT-2024-002', '2026-06-30', '2024-06-01', '550e8400-e29b-41d4-a716-446655440001', 'A-01-02', 'available', 80, 100, '2024-06-15', 'sup-001'),
('batch-003', 'prod-001', 'LOT-2024-003', '2025-03-15', '2024-03-01', '550e8400-e29b-41d4-a716-446655440002', 'B-01-01', 'available', 60, 100, '2024-03-10', 'sup-001'),

-- Ibuprofeno batches
('batch-004', 'prod-003', 'LOT-2024-004', '2025-09-30', '2024-01-20', '550e8400-e29b-41d4-a716-446655440001', 'A-02-01', 'available', 45, 100, '2024-01-25', 'sup-001'),
('batch-005', 'prod-003', 'LOT-2024-005', '2026-03-31', '2024-07-01', '550e8400-e29b-41d4-a716-446655440001', 'A-02-02', 'available', 70, 100, '2024-07-10', 'sup-001'),

-- Amoxicilina batches
('batch-006', 'prod-004', 'LOT-2024-006', '2025-08-15', '2024-02-01', '550e8400-e29b-41d4-a716-446655440001', 'A-03-01', 'available', 30, 50, '2024-02-15', 'sup-001'),
('batch-007', 'prod-004', 'LOT-2024-007', '2026-02-28', '2024-08-01', '550e8400-e29b-41d4-a716-446655440003', 'A-03-01', 'available', 40, 50, '2024-08-15', 'sup-001'),

-- Losartán batches
('batch-008', 'prod-006', 'LOT-2024-008', '2025-11-30', '2024-01-10', '550e8400-e29b-41d4-a716-446655440001', 'A-04-01', 'available', 55, 100, '2024-01-20', 'sup-002'),
('batch-009', 'prod-006', 'LOT-2024-009', '2026-05-31', '2024-05-01', '550e8400-e29b-41d4-a716-446655440001', 'A-04-02', 'available', 75, 100, '2024-05-15', 'sup-002'),

-- Metformina batches
('batch-010', 'prod-008', 'LOT-2024-010', '2025-10-31', '2024-01-05', '550e8400-e29b-41d4-a716-446655440001', 'A-05-01', 'available', 65, 100, '2024-01-15', 'sup-002'),
('batch-011', 'prod-008', 'LOT-2024-011', '2026-04-30', '2024-04-01', '550e8400-e29b-41d4-a716-446655440002', 'B-05-01', 'available', 85, 100, '2024-04-15', 'sup-002'),

-- Diazepam (Controlled Substance)
('batch-012', 'prod-020', 'LOT-CTRL-001', '2025-07-31', '2024-01-01', '550e8400-e29b-41d4-a716-446655440001', 'C-01-01', 'available', 10, 20, '2024-01-10', 'sup-001');

-- ============================================================================
-- PATIENTS
-- ============================================================================

INSERT INTO patients (id, first_name, last_name, ci, phone, email, date_of_birth, blood_type, allergies, chronic_conditions, medications, address, emergency_contact, emergency_phone) VALUES
('pat-001', 'Juan', 'González', 'V-12345678', '+58-414-111-1111', 'juan.gonzalez@email.com', '1980-05-15', 'O+', '{"Penicilina"}', '{"Hipertensión", "Diabetes Tipo 2"}', '{"Losartán 50mg", "Metformina 850mg"}', 'Av. Bolívar, Caracas', 'María González', '+58-414-222-2222'),
('pat-002', 'María', 'Rodríguez', 'V-23456789', '+58-414-333-3333', 'maria.rodriguez@email.com', '1975-08-20', 'A-', '{}', '{"Asma"}', '{"Salbutamol 100mcg"}', 'Av. Libertador, Caracas', 'Carlos Rodríguez', '+58-414-444-4444'),
('pat-003', 'Carlos', 'Mendoza', 'V-34567890', '+58-414-555-5555', 'carlos.mendoza@email.com', '1990-03-10', 'B+', '{"Sulfonamidas"}', '{}', '{}', 'Av. Urdaneta, Caracas', 'Ana Mendoza', '+58-414-666-6666'),
('pat-004', 'Ana', 'Silva', 'V-45678901', '+58-414-777-7777', 'ana.silva@email.com', '1985-11-25', 'AB+', '{}', '{"Hipertensión"}', '{"Enalapril 10mg"}', 'Av. Francisco de Miranda, Caracas', 'Pedro Silva', '+58-414-888-8888'),
('pat-005', 'Pedro', 'López', 'V-56789012', '+58-414-999-9999', 'pedro.lopez@email.com', '1978-07-30', 'O-', '{"Aspirina"}', '{"Diabetes Tipo 2"}', '{"Metformina 850mg", "Glibenclamida 5mg"}', 'Av. Los Próceres, Caracas', 'Carmen López', '+58-414-000-0000');

-- ============================================================================
-- LOYALTY PROGRAMS
-- ============================================================================

INSERT INTO loyalty_programs (id, name, type, description, points_per_currency, redemption_value, max_redemption_percentage, eligible_categories, eligible_products, requires_prescription, is_active) VALUES
('loyal-001', 'Pfizer Rewards', 'manufacturer', 'Programa de fidelización Pfizer', 10.0, 0.01, 0.30, '{}', '{}', false, true),
('loyal-002', 'Novartis Plus', 'manufacturer', 'Programa de fidelización Novartis', 10.0, 0.01, 0.30, '{}', '{}', false, true),
('loyal-003', 'Red Salud VIP', 'pharmacy', 'Programa de fidelización de la farmacia', 5.0, 0.02, 0.50, '{"medicine", "supply"}', '{}', false, true);

-- ============================================================================
-- SERVICES
-- ============================================================================

INSERT INTO services (id, name, code, description, price_usd, price_ves, duration_minutes, requires_appointment, requires_prescription, is_active) VALUES
('serv-001', 'Toma de Presión Arterial', 'TAE-001', 'Medición de presión arterial', 0.50, 25.00, 5, false, false, true),
('serv-002', 'Toma de Glucosa', 'TAE-002', 'Medición de glucosa en sangre', 1.00, 50.00, 5, false, false, true),
('serv-003', 'Consulta Farmacéutica', 'CONS-001', 'Consulta con farmacéutico', 2.00, 100.00, 15, true, false, true),
('serv-004', 'Vacunación Influenza', 'VAC-001', 'Vacuna contra la influenza', 5.00, 250.00, 10, true, true, true),
('serv-005', 'Prueba de Embarazo', 'LAB-001', 'Prueba rápida de embarazo', 1.50, 75.00, 5, false, false, true);

-- ============================================================================
-- DELIVERY ZONES
-- ============================================================================

INSERT INTO delivery_zones (id, name, description, base_fee_usd, base_fee_ves, fee_per_km_usd, fee_per_km_ves, is_active) VALUES
('zone-001', 'Centro', 'Zona centro de la ciudad', 2.00, 100.00, 0.50, 25.00, true),
('zone-002', 'Norte', 'Zona norte de la ciudad', 3.00, 150.00, 0.60, 30.00, true),
('zone-003', 'Sur', 'Zona sur de la ciudad', 3.00, 150.00, 0.60, 30.00, true),
('zone-004', 'Este', 'Zona este de la ciudad', 2.50, 125.00, 0.55, 27.50, true),
('zone-005', 'Oeste', 'Zona oeste de la ciudad', 2.50, 125.00, 0.55, 27.50, true);

-- ============================================================================
-- DISCOUNTS
-- ============================================================================

INSERT INTO discounts (id, name, description, discount_type, value, applicable_to, applicable_ids, start_date, end_date, days_of_week, start_time, end_time, min_quantity, max_quantity, max_discount_percentage, max_discount_amount_usd, max_discount_amount_ves, is_active) VALUES
('disc-001', 'Descuento Martes', 'Descuento los martes', 'percentage', 10.0, 'order', '{}', NULL, NULL, '{"Martes"}', '00:00', '23:59', NULL, NULL, NULL, NULL, NULL, true),
('disc-002', 'Compra 3 Lleva 4', 'Promo volumen', 'fixed_amount', 0.50, 'product', '{"prod-001"}', NULL, NULL, '{}', NULL, NULL, 3, 100, NULL, NULL, NULL, true),
('disc-003', 'Descuento Adultos Mayores', 'Descuento tercera edad', 'percentage', 15.0, 'customer', '{}', NULL, NULL, '{}', NULL, NULL, NULL, NULL, 20.0, 5.00, 250.00, true);

-- ============================================================================
-- COMBOS
-- ============================================================================

INSERT INTO combos (id, name, description, discount_percentage, is_active) VALUES
('combo-001', 'Kit Anti-Gripal', 'Paracetamol + Vitamina C', 15.0, true),
('combo-002', 'Kit Diabetes', 'Metformina + Glucómetro', 10.0, true),
('combo-003', 'Kit Cardiovascular', 'Atorvastatina + Aspirina', 12.0, true);

INSERT INTO combo_items (id, combo_id, product_id, quantity) VALUES
('ci-001', 'combo-001', 'prod-001', 1),
('ci-002', 'combo-001', 'prod-012', 1),
('ci-003', 'combo-002', 'prod-008', 1),
('ci-004', 'combo-003', 'prod-010', 1),
('ci-005', 'combo-003', 'prod-011', 1);

-- ============================================================================
-- SMS TEMPLATES
-- ============================================================================

INSERT INTO sms_templates (id, name, type, template, is_active) VALUES
('sms-001', 'Confirmación de Pedido', 'order_confirmation', 'Hola {name}, tu pedido #{order_number} ha sido confirmado. Total: {total}. Gracias por tu compra.', true),
('sms-002', 'Actualización de Delivery', 'delivery_update', 'Hola {name}, tu pedido #{order_number} está {status}. Llegará en aproximadamente {estimated_time}.', true),
('sms-005', 'Puntos de Fidelización', 'loyalty_points', 'Hola {name}, has ganado {points} puntos en tu última compra. Balance actual: {balance}.', true);

-- ============================================================================
-- PETTY CASH ACCOUNTS
-- ============================================================================

INSERT INTO petty_cash_accounts (id, name, warehouse_id, balance_usd, balance_ves, is_active) VALUES
('petty-001', 'Caja Chica Principal', '550e8400-e29b-41d4-a716-446655440001', 100.00, 5000.00, true),
('petty-002', 'Caja Chica Este', '550e8400-e29b-41d4-a716-446655440003', 50.00, 2500.00, true);

-- ============================================================================
-- SAMPLE INVOICES (for testing)
-- ============================================================================

-- Note: Invoice numbers will be generated by the application
-- These are just examples of what the data structure looks like

-- ============================================================================
-- COMMIT
-- ============================================================================

-- All seed data inserted successfully
-- Run this script with: psql -U postgres -d your_database -f seed.sql
