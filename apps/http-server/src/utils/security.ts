import { compare, hash } from "bcrypt";
import { JWT_SECRET, IJwtPayload } from "@repo/schema/jwt";
import { sign, verify } from "jsonwebtoken";

export class Security {
    public static async hashValue(value: string) {
        return await hash(value, 10);
    }
    public static async compareHash(value: string, hashValue: string) {
        return await compare(value, hashValue);
    }
    public static signToken(payload: IJwtPayload) {
        const token = sign(payload, JWT_SECRET, {
            expiresIn: "1h",
        });
        return token;
    }
    public static verifyToken(token: string): IJwtPayload | null {
        try {
            const payload = verify(token, JWT_SECRET) as IJwtPayload;
            return payload;
        } catch (error) {
            return null;
        }
    }
}
