import { WebSocket, WebSocketServer } from "ws";
import { v4 as uuid } from "uuid";
import { pub, redis, sub } from "./rediesClient";
import { verify } from "jsonwebtoken";
import { IJwtPayload, JWT_SECRET } from "@repo/schema/jwt";
import { IClient } from "@repo/schema/ws";
import { IUser } from "@ws/types/users";
import { IRedisMessage } from "@ws/types/redis";

export class WsClient {
    private wss: WebSocketServer;
    private users: Map<string, IUser>;

    constructor(port: number = 8080) {
        this.wss = new WebSocketServer({ port });
        this.users = new Map<string, IUser>();
        sub.subscribe("ws");
    }

    public initliaze() {
        this.wss.on("connection", (ws, req) => {
            const url = req.url;
            if (!url) {
                ws.close();
                return;
            }

            const queryParams = new URLSearchParams(url.split("?")[1]);
            const token = queryParams.get("token") ?? false;
            if (!token) {
                ws.close();
                return;
            }
            const userId = this.verifyToken(token);

            if (!userId) {
                ws.close();
                return;
            }
            const connectionId = uuid();
            redis.setex(`ws:user:${userId.id}`, 3600, connectionId);
            redis.hset(`ws:connection:${connectionId}`, {
                userId: userId.id,
                ip: req.socket.remoteAddress,
                userAgent: req.headers["user-agent"],
                connectedAt: new Date().toISOString(),
            });
            redis.expire(`ws:connection:${connectionId}`, 3600);
            this.users.set(`user:${userId.id}`, {
                userId: userId.id,
                roomIds: [],
                ws: ws,
            });

            ws.on("error", (err) => {
                console.error("WebSocket error:", err);
                ws.close();
            });

            ws.on("message", (message) => {
                console.log("Received message:", message);
                const data: IClient = JSON.parse(message.toString());
                if (data.type === "join-room") {
                    this.joinRoom(data, ws);
                }
                if (data.type === "chat") {
                    this.sendMessage(data, ws);
                }
            });

            ws.on("close", () => {
                console.log("WebSocket connection closed");
            });
        });
    }

    private verifyToken(token: string): IJwtPayload | false {
        if (!token) {
            return false;
        }

        const decoded = verify(token, JWT_SECRET);

        if (!decoded) {
            return false;
        }

        const payload = decoded as IJwtPayload;

        if (!payload) {
            return false;
        }

        return payload;
    }

    private async joinRoom(data: IClient, ws: WebSocket) {
        const roomId = data.payload.roomId;
        if (!roomId) {
            ws.close();
            return;
        }
        const user = this.users.get(`user:${roomId}`);
        if (!user) {
            ws.close();
            return;
        }
        const room = await redis.hgetall(`ws:room:${roomId}`);
        if (!room) {
            ws.close();
            return;
        }
        user.roomIds.push(roomId);
        redis.hset(`ws:room:${roomId}`, {
            userId: user.userId,
            ws: ws,
        });
    }

    private async sendMessage(data: IClient, ws: WebSocket) {
        const roomId = data.payload.roomId;
        if (!roomId) {
            ws.close();
            return;
        }
        this.users.forEach((user) => {
            if (user.roomIds.includes(roomId)) {
                const publishData: IRedisMessage = {
                    type: "chat",
                    payload: {
                        userId: data.payload.userId,
                        roomId: roomId,
                        message: data.payload.message,
                    },
                };
                pub.publish("ws", JSON.stringify(publishData));
                sub.on("message", (channel, message) => {
                    if (channel === "ws") {
                        const subData: IRedisMessage = JSON.parse(
                            message.toString()
                        );
                        if (data.type === "chat") {
                            user.ws.send(
                                JSON.stringify({
                                    type: "chat",
                                    payload: {
                                        userId: subData.payload.userId,
                                        roomId: subData.payload.roomId,
                                        message: subData.payload.message,
                                    },
                                })
                            );
                        }
                    }
                });
            }
        });
    }
}
