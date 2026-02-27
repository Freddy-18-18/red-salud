import type {
  LoyaltyProgram,
  LoyaltyPoints,
  LoyaltyTransaction,
  Invoice,
  Product,
} from '@red-salud/types';

export class LoyaltyManager {
  /**
   * Calculate points earned from a purchase
   */
  static calculatePointsEarned(
    program: LoyaltyProgram,
    invoice: Invoice,
    products: Product[]
  ): number {
    let eligibleAmountUsd = 0;
    let eligibleAmountVes = 0;

    for (const item of invoice.items) {
      const product = products.find(p => p.id === item.product_id);
      if (!product) continue;

      // Check if product is eligible
      const isEligible = this.isProductEligible(program, product);
      if (!isEligible) continue;

      // Check if prescription requirement is met
      if (program.requires_prescription && !product.requires_prescription) {
        continue;
      }

      eligibleAmountUsd += item.subtotal_usd;
      eligibleAmountVes += item.subtotal_ves;
    }

    // Check minimum purchase amount
    if (program.min_purchase_amount_usd > 0 && eligibleAmountUsd < program.min_purchase_amount_usd) {
      return 0;
    }
    if (program.min_purchase_amount_ves > 0 && eligibleAmountVes < program.min_purchase_amount_ves) {
      return 0;
    }

    // Calculate points based on USD amount (primary)
    return Math.floor(eligibleAmountUsd * program.points_per_currency);
  }

  /**
   * Check if a product is eligible for a loyalty program
   */
  static isProductEligible(program: LoyaltyProgram, product: Product): boolean {
    // If no restrictions, all products are eligible
    if (
      program.eligible_product_ids.length === 0 &&
      program.eligible_categories.length === 0
    ) {
      return true;
    }

    // Check if product is in eligible products list
    if (program.eligible_product_ids.length > 0) {
      return program.eligible_product_ids.includes(product.id);
    }

    // Check if product category is eligible
    if (program.eligible_categories.length > 0) {
      return program.eligible_categories.includes(product.category);
    }

    return false;
  }

  /**
   * Calculate redemption value in USD
   */
  static calculateRedemptionValue(
    points: number,
    program: LoyaltyProgram
  ): { usd: number; ves: number } {
    const usd = points * program.points_value_usd;
    const ves = points * program.points_value_ves;
    return { usd, ves };
  }

  /**
   * Calculate maximum points that can be redeemed for an invoice
   */
  static calculateMaxRedeemablePoints(
    invoiceTotalUsd: number,
    invoiceTotalVes: number,
    program: LoyaltyProgram
  ): number {
    const maxRedeemableUsd = invoiceTotalUsd * (program.max_redemption_percent / 100);
    const maxRedeemableVes = invoiceTotalVes * (program.max_redemption_percent / 100);

    const maxPointsFromUsd = Math.ceil(maxRedeemableUsd / program.points_value_usd);
    const maxPointsFromVes = Math.ceil(maxRedeemableVes / program.points_value_ves);

    return Math.min(maxPointsFromUsd, maxPointsFromVes);
  }

  /**
   * Create a loyalty transaction
   */
  static createTransaction(
    patientId: string,
    programId: string,
    type: 'earned' | 'redeemed' | 'expired' | 'adjusted',
    points: number,
    balanceAfter: number,
    invoiceId?: string,
    reference?: string,
    notes?: string
  ): Omit<LoyaltyTransaction, 'id' | 'created_at'> {
    return {
      patient_id: patientId,
      program_id: programId,
      invoice_id: invoiceId,
      type,
      points,
      balance_after: balanceAfter,
      reference,
      notes,
    };
  }

  /**
   * Get or create loyalty points for a patient in a program
   */
  static getOrCreatePoints(
    patientId: string,
    programId: string,
    existingPoints?: LoyaltyPoints
  ): LoyaltyPoints {
    if (existingPoints) {
      return existingPoints;
    }

    return {
      id: crypto.randomUUID(),
      patient_id: patientId,
      program_id: programId,
      points_balance: 0,
      points_earned: 0,
      points_redeemed: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Update points balance after earning
   */
  static updatePointsAfterEarning(
    points: LoyaltyPoints,
    earnedPoints: number
  ): LoyaltyPoints {
    return {
      ...points,
      points_balance: points.points_balance + earnedPoints,
      points_earned: points.points_earned + earnedPoints,
      last_transaction_date: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Update points balance after redemption
   */
  static updatePointsAfterRedemption(
    points: LoyaltyPoints,
    redeemedPoints: number
  ): LoyaltyPoints {
    return {
      ...points,
      points_balance: Math.max(0, points.points_balance - redeemedPoints),
      points_redeemed: points.points_redeemed + redeemedPoints,
      last_transaction_date: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Check if patient has enough points to redeem
   */
  static canRedeemPoints(
    points: LoyaltyPoints,
    program: LoyaltyProgram,
    pointsToRedeem: number
  ): boolean {
    if (points.points_balance < pointsToRedeem) {
      return false;
    }

    if (pointsToRedeem < program.min_points_to_redeem) {
      return false;
    }

    return true;
  }

  /**
   * Get available loyalty programs for a product
   */
  static getAvailableProgramsForProduct(
    programs: LoyaltyProgram[],
    product: Product
  ): LoyaltyProgram[] {
    return programs.filter(program =>
      program.is_active && this.isProductEligible(program, product)
    );
  }

  /**
   * Calculate total loyalty discount for an invoice
   */
  static calculateLoyaltyDiscount(
    invoiceTotalUsd: number,
    invoiceTotalVes: number,
    pointsToRedeem: number,
    program: LoyaltyProgram
  ): { discountUsd: number; discountVes: number } {
    const maxRedeemable = this.calculateMaxRedeemablePoints(
      invoiceTotalUsd,
      invoiceTotalVes,
      program
    );

    const actualPointsToRedeem = Math.min(pointsToRedeem, maxRedeemable);
    const value = this.calculateRedemptionValue(actualPointsToRedeem, program);

    return {
      discountUsd: value.usd,
      discountVes: value.ves,
    };
  }
}
