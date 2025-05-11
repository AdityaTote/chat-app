import express from "express";
import cors from "cors";
import { env } from "./lib/config/env";
import { authRouter } from "@http-server/routes";

const app = express();
const PORT = env.PORT || 3001;

// middlewares
app.use(
    cors({
        origin: env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.get("/health-check", (req, res) => {
    res.send({
        status: "ok",
        message: "Server is running",
    });
});
app.use("/api/auth", authRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
