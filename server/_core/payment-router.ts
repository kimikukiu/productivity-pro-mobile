/**
 * Payment Router
 * tRPC endpoints for payment processing and token management
 */

import { z } from "zod";
import { publicProcedure, router } from "./trpc";
import { paymentService } from "./payment-service";

export const paymentRouter = router({
  generateAdminToken: publicProcedure
    .input(z.object({ password: z.string() }))
    .mutation(({ input }) => {
      const token = paymentService.generateAdminToken(input.password);
      if (!token) {
        throw new Error("Invalid admin password");
      }
      return {
        success: true,
        token,
        role: "admin",
        message: "Admin token generated",
      };
    }),

  generateSubscriberToken: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        planId: z.enum(["trial", "weekly", "monthly", "yearly"]),
      })
    )
    .mutation(({ input }) => {
      const result = paymentService.generateAccessToken(
        input.email,
        input.planId
      );
      return {
        success: true,
        token: result.token,
        expiryDate: result.expiryDate,
        planId: result.planId,
        role: "subscriber",
        message: "Subscriber token generated",
      };
    }),

  validateToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(({ input }) => {
      const validation = paymentService.validateToken(input.token);
      return validation;
    }),

  getPaymentStatus: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(({ input }) => {
      const status = paymentService.getPaymentStatus(input.token);
      return status;
    }),

  renewSubscription: publicProcedure
    .input(
      z.object({
        token: z.string(),
        planId: z.enum(["trial", "weekly", "monthly", "yearly"]),
      })
    )
    .mutation(({ input }) => {
      const result = paymentService.renewSubscription(
        input.token,
        input.planId
      );
      if (!result) {
        throw new Error("Subscription renewal failed");
      }
      return {
        success: true,
        newToken: result.newToken,
        expiryDate: result.expiryDate,
        message: "Subscription renewed",
      };
    }),

  cancelSubscription: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(({ input }) => {
      const cancelled = paymentService.cancelSubscription(input.token);
      return {
        success: cancelled,
        message: cancelled ? "Subscription cancelled" : "Cancellation failed",
      };
    }),

  getMoneroAddress: publicProcedure.query(() => {
    return {
      address: paymentService.getMoneroAddress(),
      currency: "Monero (XMR)",
      description: "Payment address for subscriptions",
    };
  }),

  getAllPayments: publicProcedure.query(() => {
    return paymentService.getAllPayments();
  }),

  getPaymentsByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(({ input }) => {
      return paymentService.getPaymentsByEmail(input.email);
    }),
});
