import { Server } from "socket.io";
import mongoose from "mongoose";
import ProductModel from "../models/product.model.js";

export const config = (httpServer) => {
    const socketServer = new Server(httpServer, {
        cors: {
            origin: "*",
        },
    });

    socketServer.on("connection", async (socket) => {
        console.log("Nuevo cliente conectado:", socket.id);

        try {
            // Emitir la lista de productos actualizada al conectar un cliente
            const updatedProducts = await ProductModel.find({});
            socket.emit("products-list", { products: updatedProducts });
        } catch (error) {
            console.error("Error al cargar productos:", error.message);
            socket.emit("error-message", { message: "Error al cargar la lista de productos" });
        }

        // Evento para agregar un producto
        socket.on("insert-product", async (data) => {
            try {
                const newProduct = await ProductModel.create(data);
                console.log("Producto agregado:", newProduct);

                const updatedProducts = await ProductModel.find({});
                socketServer.emit("products-list", { products: updatedProducts });
            } catch (error) {
                console.error("Error al agregar producto:", error);
                socket.emit("error-message", { message: "Error al agregar producto" });
            }
        });

        // Evento para eliminar un producto
        socket.on("delete-product", async (data) => {
            try {
                const id = new mongoose.Types.ObjectId(data.id.trim());
                const result = await ProductModel.findByIdAndDelete(id);

                if (!result) {
                    console.error("Producto no encontrado");
                    socket.emit("error-message", { message: "Producto no encontrado" });
                } else {
                    console.log("Producto eliminado:", result);
                    const updatedProducts = await ProductModel.find({});
                    socketServer.emit("products-list", { products: updatedProducts });
                }
            } catch (error) {
                console.error("Error al eliminar producto:", error.message);
                socket.emit("error-message", { message: "Error al eliminar producto" });
            }
        });

        socket.on("disconnect", () => {
            console.log("Cliente desconectado:", socket.id);
        });
    });

    return socketServer;
};
