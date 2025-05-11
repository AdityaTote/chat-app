import z from "zod";

export const userSignupSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" }),
    name: z.string().min(1, { message: "Name is required" }),
    username: z.string().min(1, { message: "Username is required" }),
    age: z
        .number()
        .min(1, { message: "Age must be at least 1" })
        .max(120, { message: "Age cannot exceed 120" }),
});