/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from "crypto";
import { envConfig } from "../config/env.config";
import { sign, verify, decode } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { promisify } from "util";
import { JwtUserPayload } from "../features/auth/auth.types";

/**
 * Stateless authentication utilities.
 *
 * All methods are pure/static to encourage testability.
 * No DB coupling — data access lives in repositories.
 */
export class AuthUtils {
  // ---------------------------------------------------------------------------
  // JWT
  // ---------------------------------------------------------------------------

  /**
   * Sign a JWT with the application secret.
   * @param payload - Data to encode (user id, email, role).
   * @param expiresIn - Override default expiry from env.
   */
  static signJwt(payload: JwtUserPayload, expiresIn?: string): string {
    return sign(payload, envConfig.JWT_SECRET, {
      expiresIn: expiresIn ?? envConfig.JWT_EXPIRES_IN,
    });
  }

  /**
   * Verify and decode a JWT.
   * Throws if the token is expired or has an invalid signature.
   */
  static verifyJwt(token: string): JwtUserPayload {
    return verify(token, envConfig.JWT_SECRET) as JwtUserPayload;
  }

  /**
   * Decode a JWT without verifying the signature.
   * Use only for non-security-critical reads (e.g., logging).
   */
  static decodeToken(token: string): any {
    return decode(token);
  }

  // ---------------------------------------------------------------------------
  // Password hashing
  // ---------------------------------------------------------------------------

  /**
   * Hash a plain-text password using bcrypt (cost factor 12).
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  /**
   * Compare a plain-text password against a bcrypt hash.
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // ---------------------------------------------------------------------------
  // HMAC signatures
  // ---------------------------------------------------------------------------

  /**
   * Create an HMAC-SHA256 signature from arbitrary data.
   * Useful for generating verifiable tokens (e.g., email verification links).
   */
  static createSignature(data: string, secret: string = envConfig.JWT_SECRET): string {
    return crypto.createHmac("sha256", secret).update(data).digest("hex");
  }

  /**
   * Timing-safe comparison of two HMAC signatures.
   */
  static verifySignature(expected: string, received: string): boolean {
    if (expected.length !== received.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
  }

  // ---------------------------------------------------------------------------
  // Password-reset tokens
  // ---------------------------------------------------------------------------

  /**
   * Generate a signed, short-lived password-reset token.
   * The current password hash is included in the signing secret so the token
   * is automatically invalidated once the password changes.
   */
  static generateResetToken(email: string, currentPasswordHash: string): string {
    const secret = envConfig.JWT_SECRET + currentPasswordHash;
    return sign({ email, purpose: "password_reset" }, secret, { expiresIn: "1h" });
  }

  /**
   * Verify a password-reset token.
   */
  static verifyResetToken(token: string, currentPasswordHash: string): { email: string } {
    const secret = envConfig.JWT_SECRET + currentPasswordHash;
    const decoded: any = verify(token, secret);
    if (decoded.purpose !== "password_reset") {
      throw new Error("Invalid reset token purpose.");
    }
    return decoded;
  }

  // ---------------------------------------------------------------------------
  // Session helpers
  // ---------------------------------------------------------------------------

  /**
   * Persist session and set the auth cookie.
   */
  static async saveSession(req: Request, res: Response, token: string): Promise<void> {
    const save = promisify(req.session.save.bind(req.session));
    await save();

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: envConfig.NODE_ENV === "production",
      sameSite: envConfig.NODE_ENV === "production" ? "none" : "lax",
    });
  }

  /**
   * Destroy the current session.
   */
  static async destroySession(req: Request): Promise<void> {
    const destroy = promisify(req.session.destroy.bind(req.session));
    await destroy();
  }
}
