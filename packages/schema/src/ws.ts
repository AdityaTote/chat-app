interface IPayload {
    userId: string;
    roomId?: string;
    message?: string;
}

export interface IClient {
    type: "join-room" | "chat";
    payload: IPayload;
}

