import z from "zod";
import { userSignupSchema } from "./user";

export type UserCreationData = z.infer<typeof userSignupSchema>;