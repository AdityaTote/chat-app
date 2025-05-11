import { env } from "./lib/config/env";

export const JWT_SECRET = env.JWT_SECRET

export interface IJwtPayload {
    id: string;
}