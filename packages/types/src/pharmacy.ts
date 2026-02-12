import { z } from 'zod';

// ============================================================================
// CORE ENUMS
// ============================================================================

export enum Currency {
  VES = 'VES', // Bolívares
  USD = 'USD', // Dólares
  EUR = 'EUR', // Euros
}

export enum ProductType {
  MEDICINE = 'medicine',
  SUPPLY = 'supply',
  FOOD = 'food',
  COSMETIC = 'cosmetic',
  EQUIPMENT = 'equipment',
}

export enum ProductCategory {
  ANALGESIC = 'analgesic',
  ANTIBIOTIC = 'antibiotic',
  ANTIHYPERTENSIVE = 'antihypertensive',
  DIABETES = 'diabetes',
  CARDIOVASCULAR = 'cardiovascular',
  VITAMINS = 'vitamins',
  DERMATOLOGY = 'dermatology',
  RESPIRATORY = 'respiratory',
  GASTROINTESTINAL = 'gastrointestinal',
  PSYCHOTROPIC = 'psychotropic',
  CONTROLLED = 'controlled',
  OTHER = 'other',
}

export enum InventoryZone {
  AVAILABLE = 'available',
  QUARANTINE = 'quarantine',
  REJECTED = 'rejected',
  APPROVED = 'approved',
  DAMAGED = 'damaged',
}

export enum PharmacyPaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  PAGO_MOVIL = 'pago_movil',
  ZELLE = 'zelle',
  BIOPAGO = 'biopago',
  CRYPTO = 'crypto',
  TRANSFER = 'transfer',
  MIXED = 'mixed',
  EFECTIVO_DIVISAS = 'efectivo_divisas',
  TARJETA_INTERNACIONAL = 'tarjeta_internacional',
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum UserRole {
  CASHIER = 'cashier',
  PHARMACIST = 'pharmacist',
  MANAGER = 'manager',
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
}

export enum TransactionType {
  SALE = 'sale',
  PURCHASE = 'purchase',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  RETURN = 'return',
}

export enum ReportType {
  X_CUT = 'x_cut',
  Z_REPORT = 'z_report',
  SALES = 'sales',
  INVENTORY = 'inventory',
  PROFITABILITY = 'profitability',
  PSYCHOTROPIC = 'psychotropic',
}

// ============================================================================
// PRODUCT SCHEMAS
// ============================================================================

export const productSchema = z.object({
  id: z.string().uuid(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  name: z.string().min(1, 'Product name is required'),
  generic_name: z.string().optional(),
  active_ingredient: z.string().optional(),
  description: z.string().optional(),
  product_type: z.nativeEnum(ProductType),
  category: z.nativeEnum(ProductCategory),
  manufacturer: z.string().optional(),
  brand: z.string().optional(),

  // Pricing
  cost_price_usd: z.number().min(0),
  cost_price_ves: z.number().min(0),
  sale_price_usd: z.number().min(0),
  sale_price_ves: z.number().min(0),
  wholesale_price_usd: z.number().optional(),
  wholesale_price_ves: z.number().optional(),

  // Tax
  iva_rate: z.number().min(0).max(1).default(0.16),
  iva_exempt: z.boolean().default(false),

  // Inventory
  min_stock: z.number().min(0).default(10),
  max_stock: z.number().min(0).default(100),
  reorder_point: z.number().min(0).default(20),

  // Units
  unit_type: z.enum(['unit', 'box', 'blister', 'pack', 'bottle', 'tube']),
  units_per_box: z.number().min(1).default(1),
  allow_fractional_sale: z.boolean().default(false),

  // Control flags
  requires_prescription: z.boolean().default(false),
  controlled_substance: z.boolean().default(false),
  psychotropic: z.boolean().default(false),
  refrigerated: z.boolean().default(false),

  // Metadata
  image_url: z.string().url().optional(),
  tags: z.array(z.string()).default([]),

  // Tracking
  created_at: z.date(),
  updated_at: z.date(),
  created_by: z.string().uuid(),
});

export type Product = z.infer<typeof productSchema>;

// ============================================================================
// BATCH/LOT SCHEMA
// ============================================================================

export const batchSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),

  lot_number: z.string().min(1, 'Lot number is required'),
  expiry_date: z.date(),
  manufacturing_date: z.date().optional(),

  warehouse_id: z.string().uuid(),
  location: z.string().optional(), // e.g., "A-12-3" (Aisle-Shelf-Position)
  zone: z.nativeEnum(InventoryZone).default(InventoryZone.AVAILABLE),

  quantity: z.number().min(0),
  original_quantity: z.number().min(0),

  received_at: z.date(),
  supplier_id: z.string().uuid().optional(),

  created_at: z.date(),
  updated_at: z.date(),
});

export type Batch = z.infer<typeof batchSchema>;

// ============================================================================
// WAREHOUSE SCHEMA
// ============================================================================

export const warehouseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Warehouse name is required'),
  code: z.string().min(1, 'Warehouse code is required'),
  type: z.enum(['store', 'backroom', 'quarantine', 'central']),
  address: z.string().optional(),
  phone: z.string().optional(),

  is_active: z.boolean().default(true),

  created_at: z.date(),
  updated_at: z.date(),
});

export type Warehouse = z.infer<typeof warehouseSchema>;

// ============================================================================
// SUPPLIER SCHEMA
// ============================================================================

export const supplierSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Supplier name is required'),
  rif: z.string().optional(),
  contact_person: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),

  payment_terms: z.string().optional(),
  credit_limit: z.number().min(0).optional(),
  balance: z.number().min(0).default(0),

  is_active: z.boolean().default(true),

  created_at: z.date(),
  updated_at: z.date(),
});

export type Supplier = z.infer<typeof supplierSchema>;

// ============================================================================
// PURCHASE ORDER SCHEMA
// ============================================================================

export const purchaseOrderItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().min(1),
  unit_price_usd: z.number().min(0),
  unit_price_ves: z.number().min(0),
  lot_number: z.string().optional(),
  expiry_date: z.date().optional(),
});

export const purchaseOrderSchema = z.object({
  id: z.string().uuid(),
  order_number: z.string().min(1),
  supplier_id: z.string().uuid(),
  warehouse_id: z.string().uuid(),

  items: z.array(purchaseOrderItemSchema),

  subtotal_usd: z.number().min(0),
  subtotal_ves: z.number().min(0),
  iva_usd: z.number().min(0).default(0),
  iva_ves: z.number().min(0).default(0),
  total_usd: z.number().min(0),
  total_ves: z.number().min(0),

  status: z.enum(['draft', 'sent', 'received', 'cancelled']),

  expected_date: z.date().optional(),
  received_at: z.date().optional(),

  notes: z.string().optional(),

  created_at: z.date(),
  updated_at: z.date(),
  created_by: z.string().uuid(),
});

export type PurchaseOrder = z.infer<typeof purchaseOrderSchema>;

// ============================================================================
// PATIENT SCHEMA
// ============================================================================

export const patientSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  ci: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  date_of_birth: z.date().optional(),
  blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  allergies: z.array(z.string()).default([]),
  chronic_conditions: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),

  address: z.string().optional(),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),

  created_at: z.date(),
  updated_at: z.date(),
});

export type Patient = z.infer<typeof patientSchema>;

// ============================================================================
// INVOICE/SALE SCHEMA
// ============================================================================

export const invoiceItemSchema = z.object({
  product_id: z.string().uuid(),
  batch_id: z.string().uuid().optional(),
  product_name: z.string(),
  generic_name: z.string().optional(),
  quantity: z.number().min(0.01),
  unit_type: z.enum(['unit', 'box', 'blister', 'pack', 'bottle', 'tube']),

  unit_price_usd: z.number().min(0),
  unit_price_ves: z.number().min(0),
  subtotal_usd: z.number().min(0),
  subtotal_ves: z.number().min(0),

  discount_usd: z.number().min(0).default(0),
  discount_ves: z.number().min(0).default(0),

  iva_rate: z.number().min(0).max(1),
  iva_usd: z.number().min(0).default(0),
  iva_ves: z.number().min(0).default(0),

  total_usd: z.number().min(0),
  total_ves: z.number().min(0),
});

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;

export const paymentSchema = z.object({
  method: z.nativeEnum(PharmacyPaymentMethod),
  amount_usd: z.number().min(0),
  amount_ves: z.number().min(0),
  reference: z.string().optional(),
});

export type Payment = z.infer<typeof paymentSchema>;

export const invoiceSchema = z.object({
  id: z.string().uuid(),
  invoice_number: z.string().min(1),

  // Customer
  patient_id: z.string().uuid().optional(),
  customer_name: z.string().optional(),
  customer_ci: z.string().optional(),

  // Items
  items: z.array(invoiceItemSchema),

  // Totals
  subtotal_usd: z.number().min(0),
  subtotal_ves: z.number().min(0),
  iva_usd: z.number().min(0).default(0),
  iva_ves: z.number().min(0).default(0),
  discount_usd: z.number().min(0).default(0),
  discount_ves: z.number().min(0).default(0),
  total_usd: z.number().min(0),
  total_ves: z.number().min(0),

  // Payments
  payments: z.array(paymentSchema),
  change_usd: z.number().min(0).default(0),
  change_ves: z.number().min(0).default(0),

  // Status
  status: z.nativeEnum(InvoiceStatus).default(InvoiceStatus.DRAFT),

  // Fiscal
  fiscal_control_number: z.string().optional(),
  seniat_invoice_number: z.string().optional(),

  // Metadata
  notes: z.string().optional(),
  cashier_id: z.string().uuid(),
  warehouse_id: z.string().uuid(),

  created_at: z.date(),
  updated_at: z.date(),
});

export type Invoice = z.infer<typeof invoiceSchema>;

// ============================================================================
// EXCHANGE RATE SCHEMA
// ============================================================================

export const exchangeRateSchema = z.object({
  id: z.string().uuid(),
  from_currency: z.nativeEnum(Currency),
  to_currency: z.nativeEnum(Currency),
  rate: z.number().min(0),

  source: z.enum(['manual', 'bcv', 'local']),
  last_updated: z.date(),

  created_at: z.date(),
  updated_at: z.date(),
});

export type ExchangeRate = z.infer<typeof exchangeRateSchema>;

// ============================================================================
// USER SCHEMA
// ============================================================================

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.nativeEnum(UserRole),

  permissions: z.array(z.string()).default([]),

  warehouse_id: z.string().uuid().optional(),

  is_active: z.boolean().default(true),

  created_at: z.date(),
  updated_at: z.date(),
});

export type User = z.infer<typeof userSchema>;

// ============================================================================
// AUDIT LOG SCHEMA
// ============================================================================

export const auditLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  action: z.string(),
  entity_type: z.string(),
  entity_id: z.string().optional(),
  changes: z.record(z.any()).optional(),
  ip_address: z.string().optional(),

  created_at: z.date(),
});

export type AuditLog = z.infer<typeof auditLogSchema>;

// ============================================================================
// INVENTORY ALERT SCHEMA
// ============================================================================

export const inventoryAlertSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['low_stock', 'expiry_warning', 'expired', 'overstock']),
  product_id: z.string().uuid(),
  warehouse_id: z.string().uuid(),

  message: z.string(),
  severity: z.enum(['info', 'warning', 'critical']),

  is_resolved: z.boolean().default(false),
  resolved_at: z.date().optional(),
  resolved_by: z.string().uuid().optional(),

  created_at: z.date(),
});

export type InventoryAlert = z.infer<typeof inventoryAlertSchema>;

// ============================================================================
// DRUG INTERACTION SCHEMA
// ============================================================================

export const drugInteractionSchema = z.object({
  id: z.string().uuid(),
  active_ingredient_1: z.string(),
  active_ingredient_2: z.string(),

  severity: z.enum(['minor', 'moderate', 'major', 'contraindicated']),
  description: z.string(),
  recommendation: z.string().optional(),

  created_at: z.date(),
});

export type DrugInteraction = z.infer<typeof drugInteractionSchema>;

// ============================================================================
// PHARMACOVIGILANCE SCHEMA
// ============================================================================

export const adverseReactionSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),

  product_id: z.string().uuid(),
  product_name: z.string(),
  batch_number: z.string().optional(),

  reaction_type: z.string(),
  severity: z.enum(['mild', 'moderate', 'severe', 'life_threatening']),
  description: z.string(),

  onset_date: z.date(),

  reporter_name: z.string(),
  reporter_role: z.enum(['patient', 'pharmacist', 'doctor', 'other']),

  status: z.enum(['pending', 'investigating', 'confirmed', 'rejected']),

  created_at: z.date(),
  updated_at: z.date(),
});

export type AdverseReaction = z.infer<typeof adverseReactionSchema>;

// ============================================================================
// REPORT SCHEMA
// ============================================================================

export const reportSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(ReportType),

  title: z.string(),
  parameters: z.record(z.any()).optional(),

  generated_by: z.string().uuid(),
  warehouse_id: z.string().uuid().optional(),

  start_date: z.date().optional(),
  end_date: z.date().optional(),

  data: z.record(z.any()).optional(),

  created_at: z.date(),
});

export type Report = z.infer<typeof reportSchema>;

// ============================================================================
// DASHBOARD METRICS SCHEMA
// ============================================================================

export const pharmacyDashboardMetricsSchema = z.object({
  // Sales
  today_sales_usd: z.number(),
  today_sales_ves: z.number(),
  today_transactions: z.number(),
  average_ticket_usd: z.number(),
  average_ticket_ves: z.number(),

  // Inventory
  total_products: z.number(),
  low_stock_count: z.number(),
  expiring_soon_count: z.number(),
  expired_count: z.number(),

  // Top Products
  top_selling_products: z.array(z.object({
    product_id: z.string().uuid(),
    product_name: z.string(),
    quantity_sold: z.number(),
    revenue_usd: z.number(),
  })),

  // Alerts
  critical_alerts: z.number(),
  warning_alerts: z.number(),

  // Exchange Rate
  current_exchange_rate: z.number(),

  generated_at: z.date(),
});

export type PharmacyDashboardMetrics = z.infer<typeof pharmacyDashboardMetricsSchema>;

// ============================================================================
// LOYALTY PROGRAM SCHEMAS
// ============================================================================

export enum LoyaltyProgramType {
  PFIZER = 'pfizer',
  NOVARTIS = 'novartis',
  ENFABEBE = 'enfabebe',
  ORBISFARMA = 'orbisfarma',
  CIRCULO_SALUD = 'circulo_salud',
  BAYER = 'bayer',
  GSK = 'gsk',
  ROCHE = 'roche',
  SANOFI = 'sanofi',
  ABBOTT = 'abbott',
  CUSTOM = 'custom',
}

export const loyaltyProgramSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  program_type: z.nativeEnum(LoyaltyProgramType),
  description: z.string().optional(),

  // Points system
  points_per_currency: z.number().min(0).default(1), // Points per USD/VES spent
  points_value_usd: z.number().min(0).default(0.01), // Value of 1 point in USD
  points_value_ves: z.number().min(0).default(0.1), // Value of 1 point in VES

  // Redemption
  min_points_to_redeem: z.number().min(0).default(100),
  max_redemption_percent: z.number().min(0).max(100).default(50), // Max % of invoice payable with points

  // Eligible products (empty = all products)
  eligible_product_ids: z.array(z.string().uuid()).default([]),
  eligible_categories: z.array(z.nativeEnum(ProductCategory)).default([]),

  // Special conditions
  requires_prescription: z.boolean().default(false), // Only prescription products
  min_purchase_amount_usd: z.number().min(0).default(0),
  min_purchase_amount_ves: z.number().min(0).default(0),

  is_active: z.boolean().default(true),

  created_at: z.date(),
  updated_at: z.date(),
});

export type LoyaltyProgram = z.infer<typeof loyaltyProgramSchema>;

export const loyaltyPointsSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  program_id: z.string().uuid(),

  points_balance: z.number().min(0).default(0),
  points_earned: z.number().min(0).default(0),
  points_redeemed: z.number().min(0).default(0),

  last_transaction_date: z.date().optional(),

  created_at: z.date(),
  updated_at: z.date(),
});

export type LoyaltyPoints = z.infer<typeof loyaltyPointsSchema>;

export const loyaltyTransactionSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  program_id: z.string().uuid(),
  invoice_id: z.string().uuid().optional(),

  type: z.enum(['earned', 'redeemed', 'expired', 'adjusted']),
  points: z.number(),
  balance_after: z.number(),

  reference: z.string().optional(),
  notes: z.string().optional(),

  created_at: z.date(),
});

export type LoyaltyTransaction = z.infer<typeof loyaltyTransactionSchema>;

// ============================================================================
// SERVICE SALES SCHEMAS
// ============================================================================

export enum ServiceType {
  TAE = 'tae', // Toma de Análisis Estadístico
  LABORATORY_TEST = 'laboratory_test',
  VACCINATION = 'vaccination',
  BLOOD_PRESSURE = 'blood_pressure',
  GLUCOSE_TEST = 'glucose_test',
  CHOLESTEROL_TEST = 'cholesterol_test',
  INJECTION = 'injection',
  WOUND_CARE = 'wound_care',
  HEALTH_CHECKUP = 'health_checkup',
  MEDICAL_CONSULTATION = 'medical_consultation',
  PAYMENT_SERVICE = 'payment_service', // Pago de servicios (luz, agua, etc.)
  OTHER = 'other',
}

export const serviceSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(1),
  service_type: z.nativeEnum(ServiceType),
  description: z.string().optional(),

  // Pricing
  cost_price_usd: z.number().min(0),
  cost_price_ves: z.number().min(0),
  sale_price_usd: z.number().min(0),
  sale_price_ves: z.number().min(0),

  // Duration
  duration_minutes: z.number().min(0).optional(),

  // Requirements
  requires_prescription: z.boolean().default(false),
  requires_appointment: z.boolean().default(true),

  // Metadata
  is_active: z.boolean().default(true),

  created_at: z.date(),
  updated_at: z.date(),
});

export type Service = z.infer<typeof serviceSchema>;

export const serviceInvoiceItemSchema = z.object({
  id: z.string().uuid(),
  invoice_id: z.string().uuid(),
  service_id: z.string().uuid(),
  service_name: z.string(),

  quantity: z.number().min(1).default(1),

  unit_price_usd: z.number().min(0),
  unit_price_ves: z.number().min(0),
  subtotal_usd: z.number().min(0),
  subtotal_ves: z.number().min(0),

  discount_usd: z.number().min(0).default(0),
  discount_ves: z.number().min(0).default(0),

  iva_rate: z.number().min(0).max(1).default(0),
  iva_usd: z.number().min(0).default(0),
  iva_ves: z.number().min(0).default(0),

  total_usd: z.number().min(0),
  total_ves: z.number().min(0),

  // Service-specific
  performed_by: z.string().uuid().optional(), // User who performed the service
  performed_at: z.date().optional(),
  notes: z.string().optional(),
});

export type ServiceInvoiceItem = z.infer<typeof serviceInvoiceItemSchema>;

// ============================================================================
// SPECIAL ORDER SCHEMAS
// ============================================================================

export const specialOrderSchema = z.object({
  id: z.string().uuid(),
  order_number: z.string().min(1),

  // Customer
  patient_id: z.string().uuid(),
  customer_name: z.string(),
  customer_phone: z.string(),

  // Items
  items: z.array(z.object({
    product_id: z.string().uuid(),
    product_name: z.string(),
    quantity: z.number().min(1),
    unit_price_usd: z.number().min(0),
    unit_price_ves: z.number().min(0),
    subtotal_usd: z.number().min(0),
    subtotal_ves: z.number().min(0),
  })),

  // Totals
  subtotal_usd: z.number().min(0),
  subtotal_ves: z.number().min(0),
  iva_usd: z.number().min(0).default(0),
  iva_ves: z.number().min(0).default(0),
  total_usd: z.number().min(0),
  total_ves: z.number().min(0),

  // Advance payment
  advance_payment_percent: z.number().min(0).max(100).default(30),
  advance_payment_usd: z.number().min(0),
  advance_payment_ves: z.number().min(0),
  remaining_usd: z.number().min(0),
  remaining_ves: z.number().min(0),

  // Status
  status: z.enum(['pending', 'confirmed', 'ordered', 'received', 'completed', 'cancelled']),

  // Dates
  estimated_delivery_date: z.date().optional(),
  actual_delivery_date: z.date().optional(),

  // Payment
  advance_payment_method: z.nativeEnum(PharmacyPaymentMethod).optional(),
  balance_payment_method: z.nativeEnum(PharmacyPaymentMethod).optional(),

  // Notes
  notes: z.string().optional(),

  // Tracking
  warehouse_id: z.string().uuid(),
  created_by: z.string().uuid(),

  created_at: z.date(),
  updated_at: z.date(),
});

export type SpecialOrder = z.infer<typeof specialOrderSchema>;

// ============================================================================
// COMMERCIAL STRATEGY SCHEMAS
// ============================================================================

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  BUY_X_GET_Y = 'buy_x_get_y',
}

export enum DiscountScope {
  PRODUCT = 'product',
  CATEGORY = 'category',
  BRAND = 'brand',
  ORDER = 'order',
  CUSTOMER = 'customer',
  WAREHOUSE = 'warehouse',
}

export enum DiscountTrigger {
  TIME_BASED = 'time_based', // Days/hours
  VOLUME_BASED = 'volume_based', // Quantity threshold
  CUSTOMER_TYPE = 'customer_type',
  PROMOTIONAL = 'promotional',
}

export const discountSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),

  // Type and scope
  discount_type: z.nativeEnum(DiscountType),
  discount_scope: z.nativeEnum(DiscountScope),

  // Value
  discount_percent: z.number().min(0).max(100).optional(),
  discount_amount_usd: z.number().min(0).optional(),
  discount_amount_ves: z.number().min(0).optional(),

  // Buy X Get Y
  buy_quantity: z.number().min(1).optional(),
  get_quantity: z.number().min(1).optional(),
  get_discount_percent: z.number().min(0).max(100).optional(),

  // Applicability
  applicable_product_ids: z.array(z.string().uuid()).default([]),
  applicable_categories: z.array(z.nativeEnum(ProductCategory)).default([]),
  applicable_brands: z.array(z.string()).default([]),

  // Warehouse-specific
  warehouse_ids: z.array(z.string().uuid()).default([]), // Empty = all warehouses

  // Trigger conditions
  trigger_type: z.nativeEnum(DiscountTrigger),

  // Time-based
  days_of_week: z.array(z.number().min(0).max(6)).default([]),
  hours_start: z.number().min(0).max(23).optional(),
  hours_end: z.number().min(0).max(23).optional(),

  // Volume-based
  min_quantity: z.number().min(0).optional(),
  min_amount_usd: z.number().min(0).optional(),
  min_amount_ves: z.number().min(0).optional(),

  // Stacking
  can_combine: z.boolean().default(false),
  max_discount_percent: z.number().min(0).max(100).optional(),

  // Validity
  valid_from: z.date().optional(),
  valid_until: z.date().optional(),

  is_active: z.boolean().default(true),

  created_at: z.date(),
  updated_at: z.date(),
});

export type Discount = z.infer<typeof discountSchema>;

export const comboSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),

  // Products in combo
  items: z.array(z.object({
    product_id: z.string().uuid(),
    product_name: z.string(),
    quantity: z.number().min(1),
  })),

  // Pricing
  regular_price_usd: z.number().min(0),
  regular_price_ves: z.number().min(0),
  combo_price_usd: z.number().min(0),
  combo_price_ves: z.number().min(0),
  discount_percent: z.number().min(0).max(100),

  // Limits
  max_per_customer: z.number().min(0).optional(),

  is_active: z.boolean().default(true),

  created_at: z.date(),
  updated_at: z.date(),
});

export type Combo = z.infer<typeof comboSchema>;

// ============================================================================
// CONSULTATION SERVICE SCHEMAS
// ============================================================================

export const consultationSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),

  // Consultation details
  consultation_type: z.enum(['general', 'specialist', 'follow_up']),
  reason: z.string(),
  symptoms: z.array(z.string()).default([]),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),

  // Vital signs
  blood_pressure_systolic: z.number().optional(),
  blood_pressure_diastolic: z.number().optional(),
  heart_rate: z.number().optional(),
  temperature: z.number().optional(),
  weight: z.number().optional(),
  height: z.number().optional(),

  // Medications prescribed
  prescribed_medications: z.array(z.object({
    product_id: z.string().uuid(),
    product_name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string(),
  })).default([]),

  // Follow-up
  follow_up_date: z.date().optional(),
  follow_up_notes: z.string().optional(),

  // Consultation fee
  fee_usd: z.number().min(0).optional(),
  fee_ves: z.number().min(0).optional(),

  // Staff
  consulted_by: z.string().uuid(), // Pharmacist/Doctor ID
  warehouse_id: z.string().uuid(),

  notes: z.string().optional(),

  created_at: z.date(),
  updated_at: z.date(),
});

export type Consultation = z.infer<typeof consultationSchema>;

// ============================================================================
// HOME DELIVERY SCHEMAS
// ============================================================================

export const deliveryZoneSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  area: z.string().optional(),

  // Coverage
  postal_codes: z.array(z.string()).default([]),
  neighborhoods: z.array(z.string()).default([]),

  // Pricing
  base_fee_usd: z.number().min(0).default(0),
  base_fee_ves: z.number().min(0).default(0),
  fee_per_km_usd: z.number().min(0).default(0),
  fee_per_km_ves: z.number().min(0).default(0),

  // Service level
  estimated_time_minutes: z.number().min(0).default(30),
  max_time_minutes: z.number().min(0).default(60),

  is_active: z.boolean().default(true),

  created_at: z.date(),
  updated_at: z.date(),
});

export type DeliveryZone = z.infer<typeof deliveryZoneSchema>;

export const deliveryOrderSchema = z.object({
  id: z.string().uuid(),
  order_number: z.string().min(1),

  // Customer
  patient_id: z.string().uuid(),
  customer_name: z.string(),
  customer_phone: z.string(),
  delivery_address: z.string(),

  // Delivery zone
  delivery_zone_id: z.string().uuid(),

  // Items (linked to invoice)
  invoice_id: z.string().uuid(),

  // Delivery fee
  delivery_fee_usd: z.number().min(0),
  delivery_fee_ves: z.number().min(0),

  // Timing
  requested_time: z.date().optional(),
  estimated_delivery_time: z.date(),
  actual_delivery_time: z.date().optional(),

  // Status
  status: z.enum(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']),

  // Delivery person
  delivered_by: z.string().uuid().optional(),

  // Tracking
  tracking_notes: z.array(z.object({
    timestamp: z.date(),
    note: z.string(),
    user_id: z.string().uuid(),
  })).default([]),

  // Commission
  delivery_commission_percent: z.number().min(0).max(100).default(10),
  delivery_commission_usd: z.number().min(0).default(0),
  delivery_commission_ves: z.number().min(0).default(0),

  warehouse_id: z.string().uuid(),
  created_by: z.string().uuid(),

  created_at: z.date(),
  updated_at: z.date(),
});

export type DeliveryOrder = z.infer<typeof deliveryOrderSchema>;

// ============================================================================
// CONSIGNMENT SALES SCHEMAS
// ============================================================================

export const consignmentSchema = z.object({
  id: z.string().uuid(),
  consignment_number: z.string().min(1),

  // Supplier
  supplier_id: z.string().uuid(),
  supplier_name: z.string(),

  // Products
  items: z.array(z.object({
    product_id: z.string().uuid(),
    product_name: z.string(),
    batch_id: z.string().uuid(),
    lot_number: z.string(),
    quantity_consigned: z.number().min(0),
    quantity_sold: z.number().min(0),
    quantity_returned: z.number().min(0),
    unit_cost_usd: z.number().min(0),
    unit_cost_ves: z.number().min(0),
    unit_price_usd: z.number().min(0),
    unit_price_ves: z.number().min(0),
  })),

  // Totals
  total_value_usd: z.number().min(0),
  total_value_ves: z.number().min(0),
  total_sold_usd: z.number().min(0),
  total_sold_ves: z.number().min(0),

  // Agreement
  consignment_percent: z.number().min(0).max(100), // Commission % to pay supplier
  payment_terms_days: z.number().min(0).default(30),

  // Status
  status: z.enum(['active', 'completed', 'cancelled']),

  // Dates
  start_date: z.date(),
  end_date: z.date().optional(),

  // Warehouse
  warehouse_id: z.string().uuid(),

  notes: z.string().optional(),

  created_at: z.date(),
  updated_at: z.date(),
});

export type Consignment = z.infer<typeof consignmentSchema>;

// ============================================================================
// PETTY CASH SCHEMAS
// ============================================================================

export const pettyCashSchema = z.object({
  id: z.string().uuid(),
  warehouse_id: z.string().uuid(),
  name: z.string().min(1),

  // Balance
  initial_balance_usd: z.number().min(0),
  initial_balance_ves: z.number().min(0),
  current_balance_usd: z.number().min(0),
  current_balance_ves: z.number().min(0),

  // Limits
  max_balance_usd: z.number().min(0).optional(),
  max_balance_ves: z.number().min(0).optional(),

  // Responsible person
  custodian_id: z.string().uuid(),

  is_active: z.boolean().default(true),

  created_at: z.date(),
  updated_at: z.date(),
});

export type PettyCash = z.infer<typeof pettyCashSchema>;

export const pettyCashTransactionSchema = z.object({
  id: z.string().uuid(),
  petty_cash_id: z.string().uuid(),

  type: z.enum(['deposit', 'withdrawal', 'replenishment']),

  amount_usd: z.number().min(0),
  amount_ves: z.number().min(0),

  // Balance after transaction
  balance_after_usd: z.number().min(0),
  balance_after_ves: z.number().min(0),

  // Details
  description: z.string(),
  category: z.enum(['supplies', 'transport', 'food', 'miscellaneous', 'replenishment', 'other']),
  receipt_number: z.string().optional(),

  // Approval
  approved_by: z.string().uuid().optional(),

  // Tracking
  created_by: z.string().uuid(),

  created_at: z.date(),
});

export type PettyCashTransaction = z.infer<typeof pettyCashTransactionSchema>;

// ============================================================================
// SMS NOTIFICATION SCHEMAS
// ============================================================================

export enum SMSTemplateType {
  ORDER_CONFIRMATION = 'order_confirmation',
  DELIVERY_UPDATE = 'delivery_update',
  PRESCRIPTION_READY = 'prescription_ready',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  LOYALTY_POINTS = 'loyalty_points',
  PROMOTION = 'promotion',
  LOW_STOCK_ALERT = 'low_stock_alert',
  CUSTOM = 'custom',
}

export const smsTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  template_type: z.nativeEnum(SMSTemplateType),

  content: z.string(), // Template with placeholders like {customer_name}, {order_number}

  // Variables used in template
  variables: z.array(z.string()).default([]),

  is_active: z.boolean().default(true),

  created_at: z.date(),
  updated_at: z.date(),
});

export type SMSTemplate = z.infer<typeof smsTemplateSchema>;

export const smsMessageSchema = z.object({
  id: z.string().uuid(),
  template_id: z.string().uuid(),

  // Recipient
  patient_id: z.string().uuid().optional(),
  phone_number: z.string(),

  // Content
  message: z.string(),

  // Status
  status: z.enum(['pending', 'sent', 'delivered', 'failed']),

  // Related entity
  related_entity_type: z.string().optional(), // 'order', 'delivery', 'appointment', etc.
  related_entity_id: z.string().uuid().optional(),

  // Delivery tracking
  sent_at: z.date().optional(),
  delivered_at: z.date().optional(),
  error_message: z.string().optional(),

  // Cost
  cost_usd: z.number().min(0).optional(),

  // Tracking
  created_by: z.string().uuid(),

  created_at: z.date(),
  updated_at: z.date(),
});

export type SMSMessage = z.infer<typeof smsMessageSchema>;

// ============================================================================
// BACKUP AND SECURITY SCHEMAS (UNYCOP GUARDIAN)
// ============================================================================

export enum BackupFrequency {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum BackupStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential',
}

export enum EncryptionAlgorithm {
  AES256 = 'aes256',
  AES128 = 'aes128',
}

export const backupConfigSchema = z.object({
  id: z.string().uuid(),
  warehouse_id: z.string().uuid(),

  // Schedule
  frequency: z.nativeEnum(BackupFrequency),
  backup_time: z.string().optional(), // HH:MM format
  day_of_week: z.number().min(0).max(6).optional(), // 0 = Sunday

  // Type
  backup_type: z.nativeEnum(BackupType),

  // Storage
  local_path: z.string().optional(),
  cloud_provider: z.enum(['aws', 'gcp', 'azure', 'supabase', 'none']),
  cloud_bucket: z.string().optional(),
  cloud_region: z.string().optional(),

  // Retention
  retention_days: z.number().min(1).default(30),
  max_backups: z.number().min(1).default(10),

  // Encryption
  encryption_enabled: z.boolean().default(true),
  encryption_algorithm: z.nativeEnum(EncryptionAlgorithm).default(EncryptionAlgorithm.AES256),

  // Compression
  compression_enabled: z.boolean().default(true),

  // Notifications
  notify_on_success: z.boolean().default(false),
  notify_on_failure: z.boolean().default(true),
  notification_email: z.string().email().optional(),

  is_active: z.boolean().default(true),

  created_at: z.date(),
  updated_at: z.date(),
});

export type BackupConfig = z.infer<typeof backupConfigSchema>;

export const backupLogSchema = z.object({
  id: z.string().uuid(),
  config_id: z.string().uuid(),
  warehouse_id: z.string().uuid(),

  // Status
  status: z.nativeEnum(BackupStatus),
  backup_type: z.nativeEnum(BackupType),

  // Timing
  started_at: z.date(),
  completed_at: z.date().optional(),
  duration_seconds: z.number().optional(),

  // Size
  size_bytes: z.number().min(0).optional(),
  size_compressed_bytes: z.number().min(0).optional(),

  // Location
  local_path: z.string().optional(),
  cloud_path: z.string().optional(),

  // Details
  tables_backed_up: z.array(z.string()).optional(),
  records_count: z.number().optional(),
  error_message: z.string().optional(),

  // Verification
  verified: z.boolean().default(false),
  verification_date: z.date().optional(),

  created_at: z.date(),
});

export type BackupLog = z.infer<typeof backupLogSchema>;

export const encryptionKeySchema = z.object({
  id: z.string().uuid(),
  key_name: z.string().min(1),

  // Key details
  algorithm: z.nativeEnum(EncryptionAlgorithm),
  key_hash: z.string(), // Hash of the encrypted key
  salt: z.string(),

  // Usage
  purpose: z.enum(['backup', 'data_at_rest', 'transmission']),

  // Rotation
  created_at: z.date(),
  expires_at: z.date().optional(),
  last_rotated_at: z.date().optional(),
  rotation_frequency_days: z.number().min(30).default(90),

  is_active: z.boolean().default(true),

  created_by: z.string().uuid(),
});

export type EncryptionKey = z.infer<typeof encryptionKeySchema>;

export enum LOPDAuditEventType {
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  DATA_DELETION = 'data_deletion',
  DATA_EXPORT = 'data_export',
  SYSTEM_ACCESS = 'system_access',
  BACKUP_ACCESS = 'backup_access',
  KEY_ACCESS = 'key_access',
}

export const lopdAuditLogSchema = z.object({
  id: z.string().uuid(),

  // Event
  event_type: z.nativeEnum(LOPDAuditEventType),
  action: z.string(),

  // User
  user_id: z.string().uuid(),
  user_name: z.string(),
  user_role: z.nativeEnum(UserRole),

  // Data
  entity_type: z.string(),
  entity_id: z.string().uuid().optional(),
  data_category: z.enum(['personal', 'health', 'financial', 'contact', 'other']),

  // Details
  description: z.string(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),

  // Location
  warehouse_id: z.string().uuid().optional(),

  // Timestamp
  created_at: z.date(),
});

export type LOPDAuditLog = z.infer<typeof lopdAuditLogSchema>;

export const lopdComplianceReportSchema = z.object({
  id: z.string().uuid(),
  report_number: z.string().min(1),

  // Period
  period_start: z.date(),
  period_end: z.date(),

  // Statistics
  total_events: z.number(),
  events_by_type: z.record(z.number()),
  events_by_user: z.array(z.object({
    user_id: z.string().uuid(),
    user_name: z.string(),
    event_count: z.number(),
  })),

  // Compliance
  data_access_count: z.number(),
  data_modification_count: z.number(),
  data_deletion_count: z.number(),
  unauthorized_attempts: z.number(),

  // Backup compliance
  backup_success_rate: z.number().min(0).max(100),
  last_successful_backup: z.date().optional(),
  backup_failures: z.number(),

  // Encryption compliance
  encryption_enabled: z.boolean(),
  keys_rotated: z.boolean(),
  last_key_rotation: z.date().optional(),

  // Findings
  findings: z.array(z.object({
    severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
    category: z.string(),
    description: z.string(),
    recommendation: z.string().optional(),
  })),

  // Approval
  generated_by: z.string().uuid(),
  reviewed_by: z.string().uuid().optional(),
  review_date: z.date().optional(),
  notes: z.string().optional(),

  created_at: z.date(),
  updated_at: z.date(),
});

export type LOPDComplianceReport = z.infer<typeof lopdComplianceReportSchema>;

// ============================================================================
// E-PRESCRIPTION SCHEMAS (RECETAS ELECTRÓNICAS)
// ============================================================================

export enum PrescriptionStatus {
  VALID = 'valid',
  EXPIRED = 'expired',
  DISPENSED = 'dispensed',
  CANCELLED = 'cancelled',
  INVALID = 'invalid',
}

export enum DigitalSignatureAlgorithm {
  RSA = 'rsa',
  ECDSA = 'ecdsa',
}

export const ePrescriptionSchema = z.object({
  id: z.string().uuid(),
  prescription_number: z.string().min(1),

  // Patient
  patient_id: z.string().uuid(),
  patient_name: z.string(),
  patient_ci: z.string(),

  // Prescriber
  prescriber_id: z.string().uuid(),
  prescriber_name: z.string(),
  prescriber_license: z.string(),

  // Prescription details
  prescription_date: z.date(),
  expiry_date: z.date(),

  // Medications
  medications: z.array(z.object({
    product_id: z.string().uuid(),
    product_name: z.string(),
    generic_name: z.string().optional(),
    quantity: z.number().min(1),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string(),
  })),

  // Status
  status: z.nativeEnum(PrescriptionStatus),

  // Validation
  validated_at: z.date().optional(),
  validated_by: z.string().uuid().optional(),
  validation_message: z.string().optional(),

  // Dispensing
  dispensed_at: z.date().optional(),
  dispensed_by: z.string().uuid().optional(),
  dispensed_warehouse_id: z.string().uuid().optional(),

  // Digital signature
  signature_data: z.string().optional(),
  signature_algorithm: z.nativeEnum(DigitalSignatureAlgorithm).optional(),
  signed_at: z.date().optional(),

  // SENIAT integration
  seniat_prescription_id: z.string().optional(),
  seniat_synced_at: z.date().optional(),

  // Notes
  notes: z.string().optional(),

  // Tracking
  created_by: z.string().uuid(),
  warehouse_id: z.string().uuid(),

  created_at: z.date(),
  updated_at: z.date(),
});

export type EPrescription = z.infer<typeof ePrescriptionSchema>;

export const digitalSignatureSchema = z.object({
  id: z.string().uuid(),
  prescription_id: z.string().uuid(),

  // Signature details
  algorithm: z.nativeEnum(DigitalSignatureAlgorithm),
  signature_data: z.string(),
  public_key: z.string(),

  // Signer
  signed_by: z.string().uuid(),
  signed_by_name: z.string(),
  signed_by_role: z.nativeEnum(UserRole),

  // Timestamp
  signed_at: z.date(),

  // Verification
  verified: z.boolean().default(false),
  verified_at: z.date().optional(),
  verification_result: z.string().optional(),

  created_at: z.date(),
});

export type DigitalSignature = z.infer<typeof digitalSignatureSchema>;

export const prescriptionValidationSchema = z.object({
  id: z.string().uuid(),
  prescription_id: z.string().uuid(),

  // Validation results
  is_valid: z.boolean(),
  validation_date: z.date(),
  validation_message: z.string().optional(),

  // Checks performed
  checks: z.object({
    signature_valid: z.boolean(),
    not_expired: z.boolean(),
    not_dispensed: z.boolean(),
    prescriber_authorized: z.boolean(),
    patient_exists: z.boolean(),
  }),

  // SENIAT validation
  seniat_valid: z.boolean().optional(),
  seniat_response: z.string().optional(),

  // Validator
  validated_by: z.string().uuid(),
  validated_by_name: z.string(),

  created_at: z.date(),
});

export type PrescriptionValidation = z.infer<typeof prescriptionValidationSchema>;

// ============================================================================
// BARCODE AND LABEL SCHEMAS (CÓDIGOS DE BARRAS/ETIQUETAS)
// ============================================================================

export enum BarcodeType {
  EAN13 = 'ean13',
  CODE128 = 'code128',
  CODE39 = 'code39',
  QR = 'qr',
  UPC = 'upc',
}

export enum LabelSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  CUSTOM = 'custom',
}

export const labelTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),

  // Layout
  label_size: z.nativeEnum(LabelSize),
  width_mm: z.number().min(10).optional(),
  height_mm: z.number().min(10).optional(),

  // Barcode
  barcode_type: z.nativeEnum(BarcodeType),
  show_barcode: z.boolean().default(true),
  barcode_position: z.enum(['top', 'bottom', 'left', 'right', 'center']).default('bottom'),

  // Content
  show_product_name: z.boolean().default(true),
  show_price: z.boolean().default(true),
  show_expiry_date: z.boolean().default(true),
  show_batch_number: z.boolean().default(false),
  show_sku: z.boolean().default(false),

  // Price display
  price_currency: z.enum(['USD', 'VES', 'BOTH']).default('BOTH'),
  show_iva: z.boolean().default(false),

  // Styling
  font_size: z.number().min(8).max(24).default(12),
  font_family: z.string().default('Arial'),
  border_width: z.number().min(0).max(5).default(1),
  margin: z.number().min(0).max(10).default(2),

  // Custom fields
  custom_fields: z.array(z.object({
    name: z.string(),
    position: z.enum(['top_left', 'top_right', 'bottom_left', 'bottom_right']),
    value: z.string(),
  })).default([]),

  is_default: z.boolean().default(false),
  is_active: z.boolean().default(true),

  warehouse_id: z.string().uuid().optional(),
  created_by: z.string().uuid(),

  created_at: z.date(),
  updated_at: z.date(),
});

export type LabelTemplate = z.infer<typeof labelTemplateSchema>;

export const barcodeGenerationSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  product_name: z.string(),
  barcode: z.string(),
  barcode_type: z.nativeEnum(BarcodeType),

  // Generation details
  generated_at: z.date(),
  generated_by: z.string().uuid(),
  warehouse_id: z.string().uuid(),

  // Usage
  print_count: z.number().min(0).default(0),
  last_printed_at: z.date().optional(),
  last_printed_by: z.string().uuid().optional(),

  created_at: z.date(),
});

export type BarcodeGeneration = z.infer<typeof barcodeGenerationSchema>;

export const labelPrintJobSchema = z.object({
  id: z.string().uuid(),
  job_number: z.string().min(1),

  // Products
  items: z.array(z.object({
    product_id: z.string().uuid(),
    product_name: z.string(),
    barcode: z.string(),
    quantity: z.number().min(1),
    template_id: z.string().uuid().optional(),
  })),

  // Printer
  printer_name: z.string().optional(),
  printer_ip: z.string().optional(),

  // Status
  status: z.enum(['pending', 'printing', 'completed', 'failed']),
  started_at: z.date().optional(),
  completed_at: z.date().optional(),
  error_message: z.string().optional(),

  // Stats
  total_items: z.number(),
  printed_items: z.number().min(0).default(0),
  failed_items: z.number().min(0).default(0),

  // Tracking
  created_by: z.string().uuid(),
  warehouse_id: z.string().uuid(),

  created_at: z.date(),
  updated_at: z.date(),
});

export type LabelPrintJob = z.infer<typeof labelPrintJobSchema>;

// ============================================================================
// MOBILE ANALYTICS SCHEMAS (UNYCOP MOBILE)
// ============================================================================

export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  AREA = 'area',
}

export enum TimeRange {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom',
}

export const mobileReportSchema = z.object({
  id: z.string().uuid(),
  report_number: z.string().min(1),
  report_name: z.string().min(1),

  // Period
  time_range: z.nativeEnum(TimeRange),
  start_date: z.date(),
  end_date: z.date(),

  // Data
  sales_data: z.array(z.object({
    date: z.date(),
    sales_usd: z.number(),
    sales_ves: z.number(),
    transactions: z.number(),
  })),

  // Comparisons
  comparison_year: z.number().optional(),
  comparison_data: z.array(z.object({
    year: z.number(),
    sales_usd: z.number(),
    sales_ves: z.number(),
    transactions: z.number(),
  })).optional(),

  // Metrics
  total_sales_usd: z.number(),
  total_sales_ves: z.number(),
  total_transactions: z.number(),
  average_ticket_usd: z.number(),
  average_ticket_ves: z.number(),
  growth_rate: z.number().optional(),

  // Charts
  charts: z.array(z.object({
    chart_type: z.nativeEnum(ChartType),
    title: z.string(),
    data: z.array(z.any()),
    config: z.record(z.any()).optional(),
  })),

  // Export
  export_format: z.enum(['json', 'csv', 'pdf']).optional(),
  export_path: z.string().optional(),

  // Metadata
  generated_by: z.string().uuid(),
  warehouse_id: z.string().uuid().optional(),
  is_cached: z.boolean().default(false),
  cache_expiry: z.date().optional(),

  created_at: z.date(),
  updated_at: z.date(),
});

export type MobileReport = z.infer<typeof mobileReportSchema>;

export const chartDataSchema = z.object({
  id: z.string().uuid(),
  report_id: z.string().uuid(),
  chart_type: z.nativeEnum(ChartType),
  title: z.string(),
  data: z.array(z.any()),
  config: z.record(z.any()).optional(),
  created_at: z.date(),
});

export type PharmacyChartData = z.infer<typeof chartDataSchema>;

// ============================================================================
// SYSTEM UPDATE SCHEMAS (UNYCOP UPDATE)
// ============================================================================

export enum UpdateStatus {
  PENDING = 'pending',
  AVAILABLE = 'available',
  DOWNLOADING = 'downloading',
  INSTALLING = 'installing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back',
}

export enum UpdateChannel {
  STABLE = 'stable',
  BETA = 'beta',
  ALPHA = 'alpha',
}

export const systemVersionSchema = z.object({
  id: z.string().uuid(),
  version: z.string().min(1),
  version_number: z.string(), // e.g., "1.0.0"
  channel: z.nativeEnum(UpdateChannel),
  release_date: z.date(),
  changelog: z.string().optional(),
  download_url: z.string().optional(),
  file_size: z.number().optional(),
  checksum: z.string().optional(),
  is_latest: z.boolean().default(false),
  is_critical: z.boolean().default(false),
  created_at: z.date(),
});

export type SystemVersion = z.infer<typeof systemVersionSchema>;

export const updateLogSchema = z.object({
  id: z.string().uuid(),
  version_id: z.string().uuid(),
  version: z.string(),
  status: z.nativeEnum(UpdateStatus),
  started_at: z.date(),
  completed_at: z.date().optional(),
  error_message: z.string().optional(),
  rollback_available: z.boolean().default(false),
  rollback_date: z.date().optional(),
  created_at: z.date(),
});

export type UpdateLog = z.infer<typeof updateLogSchema>;

// ============================================================================
// TOPUP SCHEMAS (RECARGAS AUTOMÁTICAS)
// ============================================================================

export enum TopupOperator {
  MOVISTAR = 'movistar',
  DIGITEL = 'digitel',
  CANTV = 'cantv',
}

export enum TopupStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export const topupOperatorSchema = z.object({
  id: z.string().uuid(),
  name: z.nativeEnum(TopupOperator),
  display_name: z.string(),
  commission_percent: z.number().min(0).max(20),
  min_amount_usd: z.number().min(1),
  max_amount_usd: z.number().max(100),
  is_active: z.boolean().default(true),
  created_at: z.date(),
});

export type TopupOperatorSchema = z.infer<typeof topupOperatorSchema>;

export const topupTransactionSchema = z.object({
  id: z.string().uuid(),
  operator_id: z.string().uuid(),
  phone_number: z.string(),
  amount_usd: z.number().min(0),
  amount_ves: z.number().min(0),
  commission_usd: z.number().min(0).default(0),
  total_usd: z.number().min(0),
  status: z.nativeEnum(TopupStatus),
  reference: z.string().optional(),
  error_message: z.string().optional(),
  processed_at: z.date().optional(),
  created_by: z.string().uuid(),
  warehouse_id: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type TopupTransaction = z.infer<typeof topupTransactionSchema>;

// ============================================================================
// E-COMMERCE SCHEMAS (UNYCOP WEB)
// ============================================================================

export enum OnlineOrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  READY = 'ready',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export const onlineOrderSchema = z.object({
  id: z.string().uuid(),
  order_number: z.string().min(1),

  // Customer
  customer_id: z.string().uuid(),
  customer_name: z.string(),
  customer_email: z.string().email(),
  customer_phone: z.string(),
  shipping_address: z.string(),

  // Items
  items: z.array(z.object({
    product_id: z.string().uuid(),
    product_name: z.string(),
    quantity: z.number().min(1),
    unit_price_usd: z.number().min(0),
    unit_price_ves: z.number().min(0),
    subtotal_usd: z.number().min(0),
    subtotal_ves: z.number().min(0),
  })),

  // Totals
  subtotal_usd: z.number().min(0),
  subtotal_ves: z.number().min(0),
  iva_usd: z.number().min(0).default(0),
  iva_ves: z.number().min(0).default(0),
  delivery_fee_usd: z.number().min(0).default(0),
  delivery_fee_ves: z.number().min(0).default(0),
  total_usd: z.number().min(0),
  total_ves: z.number().min(0),

  // Status
  status: z.nativeEnum(OnlineOrderStatus),

  // Payment
  payment_method: z.nativeEnum(PharmacyPaymentMethod),
  payment_reference: z.string().optional(),
  paid_at: z.date().optional(),

  // Timing
  created_at: z.date(),
  confirmed_at: z.date().optional(),
  delivered_at: z.date().optional(),

  // Tracking
  warehouse_id: z.string().uuid(),
  notes: z.string().optional(),
});

export type OnlineOrder = z.infer<typeof onlineOrderSchema>;

// ============================================================================
// FORMS SCHEMAS (GESTIÓN DE FORMULARIOS)
// ============================================================================

export const formTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),

  // Fields
  fields: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['text', 'number', 'email', 'date', 'select', 'checkbox', 'textarea', 'signature']),
    label: z.string(),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(),
    validation: z.string().optional(),
  })),

  // Settings
  is_active: z.boolean().default(true),
  require_signature: z.boolean().default(false),

  // Metadata
  created_by: z.string().uuid(),
  warehouse_id: z.string().uuid().optional(),

  created_at: z.date(),
  updated_at: z.date(),
});

export type FormTemplate = z.infer<typeof formTemplateSchema>;

export const formSubmissionSchema = z.object({
  id: z.string().uuid(),
  template_id: z.string().uuid(),
  template_name: z.string(),

  // Data
  data: z.record(z.any()),
  signature_data: z.string().optional(),

  // Status
  status: z.enum(['draft', 'submitted', 'reviewed', 'approved', 'rejected']),

  // Review
  reviewed_by: z.string().uuid().optional(),
  reviewed_at: z.date().optional(),
  review_notes: z.string().optional(),

  // Tracking
  submitted_by: z.string().uuid(),
  warehouse_id: z.string().uuid().optional(),

  created_at: z.date(),
  updated_at: z.date(),
});

export type FormSubmission = z.infer<typeof formSubmissionSchema>;

// ============================================================================
// BANKING SCHEMAS (MÓDULO DE BANCOS - VISORUS)
// ============================================================================

export const bankAccountSchema = z.object({
  id: z.string().uuid(),
  account_name: z.string().min(1),
  account_number: z.string().min(1),
  bank_name: z.string(),
  account_type: z.enum(['checking', 'savings', 'credit']),
  currency: z.nativeEnum(Currency),
  balance_usd: z.number().min(0),
  balance_ves: z.number().min(0),
  is_active: z.boolean().default(true),
  created_at: z.date(),
  updated_at: z.date(),
});

export type BankAccount = z.infer<typeof bankAccountSchema>;

export const bankTransactionSchema = z.object({
  id: z.string().uuid(),
  account_id: z.string().uuid(),
  transaction_type: z.enum(['debit', 'credit', 'transfer']),
  amount_usd: z.number(),
  amount_ves: z.number(),
  description: z.string(),
  reference: z.string().optional(),
  transaction_date: z.date(),
  reconciled: z.boolean().default(false),
  created_at: z.date(),
});

export type BankTransaction = z.infer<typeof bankTransactionSchema>;

export const reconciliationSchema = z.object({
  id: z.string().uuid(),
  account_id: z.string().uuid(),
  period_start: z.date(),
  period_end: z.date(),
  opening_balance_usd: z.number(),
  opening_balance_ves: z.number(),
  closing_balance_usd: z.number(),
  closing_balance_ves: z.number(),
  transactions_count: z.number(),
  discrepancies: z.array(z.object({
    transaction_id: z.string(),
    amount_usd: z.number(),
    amount_ves: z.number(),
    description: z.string(),
  })).default([]),
  reconciled_by: z.string().uuid(),
  reconciled_at: z.date(),
  created_at: z.date(),
});

export type Reconciliation = z.infer<typeof reconciliationSchema>;

// ============================================================================
// ADVANCED FINANCE SCHEMAS (MÓDULO DE FINANZAS AVANZADO - VISORUS)
// ============================================================================

export const financialProjectionSchema = z.object({
  id: z.string().uuid(),
  projection_type: z.enum(['revenue', 'expenses', 'profit', 'cash_flow']),
  period_start: z.date(),
  period_end: z.date(),
  projected_values: z.array(z.object({
    date: z.date(),
    value_usd: z.number(),
    value_ves: z.number(),
  })),
  actual_values: z.array(z.object({
    date: z.date(),
    value_usd: z.number(),
    value_ves: z.number(),
  })).optional(),
  variance: z.number().optional(),
  confidence_level: z.number().min(0).max(100),
  created_by: z.string().uuid(),
  created_at: z.date(),
});

export type FinancialProjection = z.infer<typeof financialProjectionSchema>;

export const kpiSchema = z.object({
  id: z.string().uuid(),
  kpi_name: z.string(),
  kpi_type: z.enum(['revenue', 'profit', 'margin', 'growth', 'efficiency', 'inventory']),
  value: z.number(),
  target: z.number(),
  unit: z.string().optional(),
  period_start: z.date(),
  period_end: z.date(),
  warehouse_id: z.string().uuid().optional(),
  created_at: z.date(),
});

export type KPI = z.infer<typeof kpiSchema>;

// ============================================================================
// EXPENSE SCHEMAS (MÓDULO DE GASTOS - VISORUS)
// ============================================================================

export const expenseSchema = z.object({
  id: z.string().uuid(),
  expense_type: z.enum(['operational', 'administrative', 'personnel', 'utilities', 'rent', 'supplies', 'other']),
  category: z.string(),
  description: z.string(),
  amount_usd: z.number(),
  amount_ves: z.number(),
  expense_date: z.date(),
  approved_by: z.string().uuid().optional(),
  approved_at: z.date().optional(),
  status: z.enum(['pending', 'approved', 'rejected']),
  warehouse_id: z.string().uuid(),
  created_by: z.string().uuid(),
  created_at: z.date(),
});

export type Expense = z.infer<typeof expenseSchema>;

export const creditorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  rif: z.string().optional(),
  contact_person: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  credit_limit: z.number().min(0).optional(),
  balance: z.number().min(0).default(0),
  is_active: z.boolean().default(true),
  created_at: z.date(),
});

export type Creditor = z.infer<typeof creditorSchema>;

// ============================================================================
// PRODUCTION SCHEMAS (MÓDULO DE PRODUCCIÓN - VISORUS)
// ============================================================================

export const productionOrderSchema = z.object({
  id: z.string().uuid(),
  order_number: z.string().min(1),
  product_id: z.string().uuid(),
  product_name: z.string(),
  quantity: z.number().min(1),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  started_at: z.date().optional(),
  completed_at: z.date().optional(),
  ingredients: z.array(z.object({
    product_id: z.string().uuid(),
    product_name: z.string(),
    quantity: z.number().min(1),
    cost_usd: z.number().min(0),
  })),
  total_cost_usd: z.number().min(0),
  warehouse_id: z.string().uuid(),
  created_by: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type ProductionOrder = z.infer<typeof productionOrderSchema>;

// ============================================================================
// PAYROLL SCHEMAS (MÓDULO DE NÓMINAS Y RH - VISORUS)
// ============================================================================

export const employeeSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  ci: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  position: z.string(),
  department: z.string(),
  salary_usd: z.number().min(0),
  salary_ves: z.number().min(0),
  hire_date: z.date(),
  is_active: z.boolean().default(true),
  warehouse_id: z.string().uuid().optional(),
  created_at: z.date(),
});

export type Employee = z.infer<typeof employeeSchema>;

export const payrollRecordSchema = z.object({
  id: z.string().uuid(),
  employee_id: z.string().uuid(),
  period_start: z.date(),
  period_end: z.date(),
  gross_salary_usd: z.number(),
  gross_salary_ves: z.number(),
  deductions_usd: z.number().default(0),
  deductions_ves: z.number().default(0),
  net_salary_usd: z.number(),
  net_salary_ves: z.number(),
  hours_worked: z.number(),
  overtime_hours: z.number().default(0),
  generated_at: z.date(),
  warehouse_id: z.string().uuid(),
});

export type PayrollRecord = z.infer<typeof payrollRecordSchema>;

// ============================================================================
// FLEET SCHEMAS (CONTROL DE FLOTILLAS - VISORUS)
// ============================================================================

export const vehicleSchema = z.object({
  id: z.string().uuid(),
  license_plate: z.string().min(1),
  make: z.string(),
  model: z.string(),
  year: z.number().min(2000).max(new Date().getFullYear() + 1),
  type: z.enum(['car', 'truck', 'van', 'motorcycle']),
  status: z.enum(['active', 'maintenance', 'inactive']),
  odometer: z.number().min(0),
  fuel_type: z.enum(['gasoline', 'diesel', 'electric', 'hybrid']),
  warehouse_id: z.string().uuid(),
  created_at: z.date(),
});

export type Vehicle = z.infer<typeof vehicleSchema>;

export const driverSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  ci: z.string(),
  phone: z.string(),
  license_number: z.string(),
  license_expiry: z.date(),
  is_active: z.boolean().default(true),
  created_at: z.date(),
});

export type Driver = z.infer<typeof driverSchema>;

export const maintenanceRecordSchema = z.object({
  id: z.string().uuid(),
  vehicle_id: z.string().uuid(),
  maintenance_type: z.enum(['routine', 'repair', 'inspection']),
  description: z.string(),
  cost_usd: z.number().min(0),
  performed_at: z.date(),
  performed_by: z.string(),
  odometer: z.number().min(0),
  created_at: z.date(),
});

export type MaintenanceRecord = z.infer<typeof maintenanceRecordSchema>;
