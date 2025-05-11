import { db } from "@repo/db/db";
import { users } from "@repo/db/user";
import { eq } from "@repo/db/core";
import { UserCreationData } from "@repo/schema/infered";
export class UserService {
    public static async getUserById(id: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, id),
        });
        return user;
    }

    public static async getUserByEmail(email: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });
        return user;
    }

    public static async createUser(data: UserCreationData) {
        const now = new Date();
        const user = await db
            .insert(users)
            .values({
                ...data,
                createdAt: now,
                updatedAt: now,
            })
            .returning();
        return user;
    }

    public static async updateUser(
        id: string,
        data: Partial<UserCreationData>
    ) {
        const now = new Date();
        const user = await db
            .update(users)
            .set({
                ...data,
                updatedAt: now,
            })
            .where(eq(users.id, id))
            .returning();
        return user;
    }

    public static async deleteUser(id: string) {
        const user = await db.delete(users).where(eq(users.id, id)).returning();
        return user;
    }

    public static async getAllUsers() {
        const usersList = await db.query.users.findMany();
        return usersList;
    }
}
