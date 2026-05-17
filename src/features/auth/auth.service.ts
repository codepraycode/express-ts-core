import { authRepository } from "./auth.repository";
import { AuthUtils } from "./auth.utils";
import { LoginDto, RegisterDto } from "./auth.types";

/**
 * Business-logic layer for authentication.
 * Issues JWTs; delegates DB operations to {@link AuthRepository}.
 */
export class AuthService {
    /** Register a new user and return a signed JWT. */
    async register(dto: RegisterDto) {
        const user = await authRepository.createUser(dto);
        const token = AuthUtils.signJwt({ id: user.id, email: user.email, role: user.role });
        return { user, token };
    }

    /** Validate credentials and return a signed JWT. */
    async login(dto: LoginDto) {
        const user = await authRepository.validateCredentials(dto);
        const token = AuthUtils.signJwt({ id: user.id, email: user.email, role: user.role });
        return { user, token };
    }

    /** Return the currently authenticated user's profile. */
    async me(userId: string) {
        return authRepository.findById(userId);
    }
}

export const authService = new AuthService();
