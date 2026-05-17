import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { AuthUtils } from "../utils/auth.utils";
import { ForbiddenError, UnauthorizedError } from "../utils/custom-errors";
import { JwtUserPayload } from "../features/auth/auth.types";

// ---------------------------------------------------------------------------
// Type augmentation — adds `req.user` to Express's Request interface
// ---------------------------------------------------------------------------

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

// ---------------------------------------------------------------------------
// authenticate — JWT guard
// ---------------------------------------------------------------------------

/**
 * Verifies the `Authorization: Bearer <token>` header.
 * On success, attaches the decoded payload to `req.user`.
 *
 * @example
 * router.get("/me", authenticate, controller.me);
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Authentication required. Missing or malformed token."));
  }

  try {
    const token = authHeader.split(" ")[1];
    req.user = AuthUtils.verifyJwt(token);
    next();
  } catch (err: any) {
    const message =
      err.name === "TokenExpiredError" ? "Token has expired." : "Invalid token.";
    next(new UnauthorizedError(message));
  }
};

// ---------------------------------------------------------------------------
// authorize — RBAC guard
// ---------------------------------------------------------------------------

/**
 * Role-based access control guard.
 * Must be used **after** {@link authenticate}.
 *
 * @param roles - One or more {@link Role} values allowed to access the route.
 *
 * @example
 * router.delete("/:id", authenticate, authorize("ADMIN"), controller.delete);
 */
export const authorize =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required."));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError("You do not have permission to perform this action."));
    }

    next();
  };
