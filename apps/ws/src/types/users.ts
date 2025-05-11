import { WebSocket } from "ws";

export interface IUser {
    userId: string;
    roomIds: string[];
    ws: WebSocket;
}