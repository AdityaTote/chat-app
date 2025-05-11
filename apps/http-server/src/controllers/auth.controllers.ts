import { Request, Response } from "express";
import { userSignupSchema } from "@repo/schema/user";
import { UserService } from "@http-server/services/user.service";
import { Security } from "@http-server/utils/security";

export class AuthController {
    public static async signup(req: Request, res: Response) {
        const inputData = userSignupSchema.safeParse(req.body);
        if (!inputData.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid input data",
                details: inputData.error.format(),
            });
        }
        const { email, password } = inputData.data;
        // check for existing user
        const existingUser = await UserService.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }
        // hash password
        const hashedPassword = await Security.hashValue(password);

        const user = await UserService.createUser(inputData.data);

        const token = Security.signToken({
            id: user.
        })


    }
}
