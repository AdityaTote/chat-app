import { WsClient } from "./lib/wsServer";

const wsServer = new WsClient(8000);
wsServer.initliaze();
console.log("WebSocket server started on ws://localhost:8080");
