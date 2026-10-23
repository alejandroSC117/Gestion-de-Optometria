import { getAuth } from "@clerk/express";
import type { Request, RequestHandler } from "express";

export type AuthenticatedRequest = Request & { clerkUserId: string };

export const requireAuth: RequestHandler = (req, res, next) => {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  (req as AuthenticatedRequest).clerkUserId = userId;
  next();
};

export function authenticatedUserId(req: Request): string {
  const userId = (req as AuthenticatedRequest).clerkUserId;
  if (!userId) throw new Error("Authenticated route is missing Clerk user identity");
  return userId;
}
