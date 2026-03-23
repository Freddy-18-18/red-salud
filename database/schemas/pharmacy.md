# Pharmacy Domain

Tables for the pharmacy ERP/POS system: inventory management, products, invoicing, deliveries, loyalty programs, and controlled substance tracking.

## Core Tables (v2 -- `20250210000000`)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `pharmacy_users` | Pharmacy staff accounts | `id`, `email`, `first_name`, `last_name`, `role` |
| `products` | Product/medication catalog | `id`, `sku`, `barcode`, `name`, `generic_name`, `active_ingredient`, `cost_price_usd`, `sale_price_usd` |
| `batches` | Inventory batches with FEFO tracking | `id`, `product_id`, `lot_number`, `expiry_date`, `warehouse_id`, `quantity` |
| `suppliers` | Pharmaceutical suppliers | `id`, `name`, `rif`, `contact_person`, `payment_terms`, `credit_limit` |
| `warehouses` | Physical storage locations | `id`, `name`, `code`, `type`, `address` |

## Invoicing & POS

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `invoices` | Sales invoices | `id`, `invoice_number`, `patient_id`, `total_usd`, `total_ves`, `payment_method` |
| `invoice_items` | Line items in an invoice | `id`, `invoice_id`, `product_id`, `batch_id`, `quantity`, `unit_price` |
| `purchase_orders` | Orders to suppliers | `id`, `supplier_id`, `status`, `total` |
| `purchase_order_items` | Line items in a purchase order | `id`, `order_id`, `product_id`, `quantity`, `price` |

## Inventory

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `inventory_movements` | Stock movement audit trail | `id`, `product_id`, `batch_id`, `movement_type`, `quantity`, `reason` |
| `alerts` | Stock/expiry alerts | `id`, `product_id`, `alert_type`, `message`, `resolved` |
| `settings` | Pharmacy-wide configuration | `key`, `value` |
| `clinic_inventory` | Clinic-level inventory (shared with dental) | `id`, `product_name`, `quantity`, `reorder_point` |
| `inventory_scan_log` | Barcode scan audit log | `id`, `product_id`, `scanned_at`, `action` |

## Deliveries

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `deliveries` | Delivery records | `id`, `invoice_id`, `status`, `address`, `delivered_at` |
| `delivery_zones` | Delivery zone definitions with pricing | `id`, `name`, `base_fee_usd`, `fee_per_km_usd` |
| `delivery_orders` | Delivery order tracking | `id`, `patient_id`, `zone_id`, `status`, `tracking_code` |
| `customer_deliveries` | Customer-facing delivery status | `id`, `customer_id`, `order_id`, `status` |

## Loyalty & Discounts

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `loyalty_programs` | Loyalty program definitions | `id`, `name`, `type`, `points_per_currency`, `redemption_value` |
| `loyalty_points` | Point balances per patient/program | `patient_id`, `program_id`, `balance` |
| `loyalty_transactions` | Point earn/redeem history | `id`, `patient_id`, `program_id`, `points`, `type` |
| `discounts` | Active discount rules | `id`, `name`, `discount_type`, `value`, `applicable_to` |
| `combos` | Product combo/bundle definitions | `id`, `name`, `discount_percentage` |
| `combo_items` | Products in a combo | `combo_id`, `product_id`, `quantity` |

## Services & Finance

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `services` | In-pharmacy services (blood pressure, vaccines) | `id`, `name`, `code`, `price_usd`, `duration_minutes` |
| `petty_cash_accounts` | Petty cash registers | `id`, `name`, `warehouse_id`, `balance_usd` |
| `petty_cash_transactions` | Cash inflows/outflows | `id`, `account_id`, `amount`, `type`, `description` |
| `sms_templates` | SMS notification templates | `id`, `name`, `type`, `template` |
| `sms_messages` | Sent SMS messages | `id`, `template_id`, `recipient`, `sent_at` |

## Legacy Tables (v1 -- `011_create_pharmacy_system.sql`)

| Table | Purpose |
|-------|---------|
| `farmacia_inventario` | Original pharmacy inventory (superseded by `products`/`batches`) |
| `farmacia_proveedores` | Original suppliers (superseded by `suppliers`) |
| `farmacia_recetas` | Original prescriptions |
| `farmacia_ventas` | Original sales |
| `farmacia_entregas` | Original deliveries |
| `farmacia_pedidos_proveedor` | Original supplier orders |
| `farmacia_alertas` | Original alerts |
| `farmacia_fidelizacion` | Original loyalty |
| `farmacia_precios_config` | Original pricing config |
| `pharmacy_details` | Pharmacy location details |

## Patients (Pharmacy context)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `patients` | Pharmacy patient records | `id`, `first_name`, `last_name`, `ci`, `blood_type`, `allergies`, `chronic_conditions` |
| `offline_patients` | Offline-created patient records pending sync | `id`, `data`, `synced` |
| `adverse_reactions` | Reported adverse drug reactions | `id`, `patient_id`, `product_id`, `reaction`, `severity` |
| `consultations` | In-pharmacy consultations | `id`, `patient_id`, `pharmacist_id`, `notes` |
| `consignments` | Consignment stock agreements | `id`, `supplier_id`, `status` |
| `consignment_items` | Items in a consignment | `consignment_id`, `product_id`, `quantity` |
| `special_orders` | Special/back-ordered items | `id`, `patient_id`, `product_id`, `status` |

## Migrations

- `011_create_pharmacy_system.sql` (v1 legacy)
- `20250201000000_pharmacy_core_tables.sql` (v2 core)
- `20250201000001_prescriptions_tables.sql`
- `20250201000002_add_pharmacy_details.sql`
- `20250210000000_create_pharmacy_tables.sql`
- `20250215000001_customer_deliveries.sql`
