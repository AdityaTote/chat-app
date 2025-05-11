import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { config } from "dotenv";

config();

export const env = createEnv({
    server: {
        JWT_SECRET: z.string().default("secret"),
    },
    runtimeEnv: process.env,
});
