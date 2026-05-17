import { JwtPayload } from "jsonwebtoken";
import { Role } from "@prisma/client";

// ---------------------------------------------------------------------------
// JWT payload
// ---------------------------------------------------------------------------

export interface JwtUserPayload extends JwtPayload {
    id: string;
    email: string;
    role: Role;
}

// ---------------------------------------------------------------------------
// Request DTOs
// ---------------------------------------------------------------------------

export interface RegisterDto {
    name: string;
    email: string;
    password: string;
}

export interface LoginDto {
    email: string;
    password: string;
}
