import nodemailer, { SendMailOptions, Transporter } from "nodemailer";
import { envConfig } from "../../config/env.config";
import { logDebug, logError } from "../utils/logger";
import { generateOTP } from "../utils/generator";
import { GatewayTimeoutError } from "../utils/custom-errors";

interface EmailServiceResponse {
    success: boolean;
    messageId?: string;
}

/**
 * Thin wrapper around Nodemailer.
 *
 * Configure SMTP credentials in your `.env` file:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, FROM_EMAIL
 *
 * For local development you can use:
 *   - Ethereal (https://ethereal.email) — fake SMTP, emails are never delivered
 *   - Mailpit (https://mailpit.axllent.org) — local SMTP server with a web UI
 */
class EmailService {
    private transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: envConfig.SMTP_HOST,
            port: envConfig.SMTP_PORT,
            secure: envConfig.SMTP_PORT === 465,
            auth: envConfig.SMTP_USER
                ? { user: envConfig.SMTP_USER, pass: envConfig.SMTP_PASSWORD }
                : undefined,
            connectionTimeout: envConfig.EMAIL_TIMEOUT,
            greetingTimeout: envConfig.EMAIL_TIMEOUT,
            socketTimeout: envConfig.EMAIL_TIMEOUT,
        });
    }

    // ---------------------------------------------------------------------------
    // Connection
    // ---------------------------------------------------------------------------

    /**
     * Verify SMTP connectivity — call once at server startup.
     * A failed verification is non-fatal; it only logs a warning.
     */
    async verifyConnection(): Promise<void> {
        try {
            await this.transporter.verify();
            logDebug("✅ Email service ready");
        } catch (error) {
            logError(error, "EmailService — SMTP verification failed");
        }
    }

    // ---------------------------------------------------------------------------
    // Core send
    // ---------------------------------------------------------------------------

    private async sendMail(
        to: string,
        subject: string,
        html: string,
    ): Promise<EmailServiceResponse> {
        const options: SendMailOptions = {
            from: `"App Support" <${envConfig.FROM_EMAIL}>`,
            to,
            subject,
            html,
        };

        try {
            const info = await this.transporter.sendMail(options);
            logDebug(`📧 Email sent: ${info.messageId}`);

            const preview = nodemailer.getTestMessageUrl(info);
            if (preview) logDebug(`🔗 Preview URL: ${preview}`);

            return { success: true, messageId: info.messageId };
        } catch (error) {
            if ((error as Error).message.includes("Timeout")) {
                throw new GatewayTimeoutError("Email delivery timed out.", null, { cause: error });
            }
            const err = new Error("Email delivery failed.");
            (err as any).cause = error;
            throw err;
        }
    }

    // ---------------------------------------------------------------------------
    // Templates
    // ---------------------------------------------------------------------------

    /** Send an OTP / email-verification code. */
    async sendVerificationEmail(
        to: string,
        code: string,
        userName?: string,
    ): Promise<EmailServiceResponse> {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Email Verification</h2>
                <p>Hello ${userName ?? "there"},</p>
                <p>Use the code below to verify your email address:</p>
                <h1 style="letter-spacing: 6px; text-align: center;">${code}</h1>
                <p>This code expires in 15 minutes.</p>
                <p>If you did not request this, you can safely ignore this email.</p>
            </div>
        `;
        return this.sendMail(to, "Verify Your Email Address", html);
    }

    /** Send a password-reset link. */
    async sendPasswordResetEmail(
        to: string,
        resetUrl: string,
        userName?: string,
    ): Promise<EmailServiceResponse> {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Password Reset</h2>
                <p>Hello ${userName ?? "there"},</p>
                <p>Click the link below to reset your password (valid for 1 hour):</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <p>If you did not request a password reset, please ignore this email.</p>
            </div>
        `;
        return this.sendMail(to, "Password Reset Request", html);
    }

    /** Send a welcome email after successful registration. */
    async sendWelcomeEmail(to: string, userName: string): Promise<EmailServiceResponse> {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome aboard, ${userName}!</h2>
                <p>Your account has been created successfully. We are glad to have you.</p>
                <p>If you have any questions, feel free to reach out to our support team.</p>
            </div>
        `;
        return this.sendMail(to, "Welcome!", html);
    }

    /** Generate and send a verification OTP to the given address. */
    async sendOTP(to: string, userName: string): Promise<string> {
        const otp = generateOTP();
        await this.sendVerificationEmail(to, otp, userName);
        return otp;
    }
}

export const emailService = new EmailService();
