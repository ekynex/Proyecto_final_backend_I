import { Server } from "socket.io";

export const config = (httpServer) => {

    const socketServer = new Server(httpServer);
 
    socketServer.on("connection", (socket) => {
        console.log("Conexión establecida", socket.id);
     
        socket.on("disconnect", () => {
            console.log("Se desconecto un cliente"); 
        });
    });
};