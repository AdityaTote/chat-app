import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { config } from "dotenv";

config();

export const env = createEnv({
    server: {
        PORT: z.coerce.number().default(3001),
        FRONTEND_URL: z.string().default("http://localhost:3000"),
        
    },
    runtimeEnv: process.env,
});
