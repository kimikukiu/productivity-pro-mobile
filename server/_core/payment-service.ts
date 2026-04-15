/**
 * Payment & Token Management Service
 * Handles payment processing and automatic token generation
 */

import { z } from "zod";

const PaymentSchema = z.object({
  email: z.string().email(),
  planId: z.enum(["weekly", "monthly", "yearly"]),
  amount: z.number(),
  currency: z.string().default("USD"),
  paymentMethod: z.enum(["monero", "crypto"]).default("monero"),
});

export type Payment = z.infer<typeof PaymentSchema>;

const SUBSCRIPTION_PLANS = {
  weekly: { days: 7, price: 30 },
  monthly: { days: 30, price: 300 },
  yearly: { days: 365, price: 1000 },
};

export class PaymentService {
  private payments: Map<string, Payment & { token: string; expiryDate: string }> =
    new Map();

  generateAccessToken(email: string, planId: string): {
    token: string;
    expiryDate: string;
    planId: string;
  } {
    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
    if (!plan) {
      throw new Error("Invalid plan");
    }

    // Generate unique token
    const token = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.days);

    // Store payment record
    this.payments.set(token, {
      email,
      planId: planId as "weekly" | "monthly" | "yearly",
      amount: plan.price,
      currency: "USD",
      paymentMethod: "monero",
      token,
      expiryDate: expiryDate.toISOString(),
    });

    return {
      token,
      expiryDate: expiryDate.toISOString(),
      planId,
    };
  }

  generateAdminToken(password: string): string | null {
    const ADMIN_PASSWORD = "#AllOfThem-3301";
    if (password !== ADMIN_PASSWORD) {
      return null;
    }

    // Admin token never expires
    const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return token;
  }

  validateToken(token: string): {
    valid: boolean;
    role: "admin" | "subscriber" | null;
    email?: string;
    planId?: string;
    expiryDate?: string;
  } {
    if (token.startsWith("admin_")) {
      return { valid: true, role: "admin" };
    }

    if (token.startsWith("sub_")) {
      const payment = this.payments.get(token);
      if (!payment) {
        return { valid: false, role: null };
      }

      const now = new Date();
      const expiry = new Date(payment.expiryDate);

      if (now > expiry) {
        return { valid: false, role: null };
      }

      return {
        valid: true,
        role: "subscriber",
        email: payment.email,
        planId: payment.planId,
        expiryDate: payment.expiryDate,
      };
    }

    return { valid: false, role: null };
  }

  getPaymentStatus(token: string): {
    status: "active" | "expired" | "invalid";
    details?: any;
  } {
    const validation = this.validateToken(token);

    if (!validation.valid) {
      return { status: "invalid" };
    }

    if (validation.role === "admin") {
      return { status: "active", details: { role: "admin" } };
    }

    const payment = this.payments.get(token);
    if (!payment) {
      return { status: "invalid" };
    }

    const now = new Date();
    const expiry = new Date(payment.expiryDate);

    if (now > expiry) {
      return { status: "expired", details: payment };
    }

    return { status: "active", details: payment };
  }

  renewSubscription(token: string, planId: string): {
    newToken: string;
    expiryDate: string;
  } | null {
    const payment = this.payments.get(token);
    if (!payment || !payment.email) {
      return null;
    }

    // Remove old token
    this.payments.delete(token);

    // Generate new token
    const result = this.generateAccessToken(payment.email, planId);
    return {
      newToken: result.token,
      expiryDate: result.expiryDate,
    };
  }

  getAllPayments(): Array<Payment & { token: string; expiryDate: string }> {
    return Array.from(this.payments.values());
  }

  getPaymentsByEmail(email: string): Array<Payment & { token: string; expiryDate: string }> {
    return Array.from(this.payments.values()).filter((p) => p.email === email);
  }

  cancelSubscription(token: string): boolean {
    return this.payments.delete(token);
  }

  getMoneroAddress(): string {
    return "48Y2Eo1QJFt2581MsA3tBXcqtEMTDope7N7zJ8bHxAeCV8nQKwVV";
  }
}

export const paymentService = new PaymentService();
