import { Server } from "socket.io";
import mongoose from "mongoose";
import ProductModel from "../models/product.model.js";

export const config = (httpServer) => {

    const socketServer = new Server(httpServer, {
        cors: {
            origin: "*", 
        },
    });

    let listaDeProductos = [];

    const fetchProductsFromAPI = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/products");
            const data = await response.json();
            listaDeProductos = data.payload || []; 
        } catch (error) {
            console.error("Error al cargar los productos desde la API:", error);
        }
    };

    fetchProductsFromAPI();
 
    socketServer.on("connection", (socket) => {
        console.log("Conexión establecida", socket.id);

        socket.emit("products-list", { products: listaDeProductos });

        socket.on("insert-product", async (data) => {
            try {
                const newProduct = await ProductModel.create(data);
                console.log("Producto agregado:", newProduct);        
               
                const updatedProducts = await ProductModel.find({});
                listaDeProductos = updatedProducts;
        
                socketServer.emit("products-list", { products: listaDeProductos });
            } catch (error) {
                console.error("Error al agregar el producto:", error);
            }
        });                        

        socket.on("cart-updated", (data) => {
            console.log("Carrito actualizado:", data.cart);
        });
  
        socket.on("delete-product", async (data) => {
            try {                
                const id = new mongoose.Types.ObjectId(data.id.trim());        
                const result = await ProductModel.findByIdAndDelete(id);
        
                if (!result) {
                    console.error("Producto no encontrado");
                    socket.emit("error-message", { message: "Producto no encontrado" });
                } else {
                    console.log("Producto eliminado:", result);
                    listaDeProductos = listaDeProductos.filter(prod => prod._id.toString() !== id.toString());                    
              
                    socketServer.emit("products-list", { products: listaDeProductos });
                }
                
            } catch (error) {
                console.error("Error al eliminar producto:", error.message);
                socket.emit("error-message", { message: "Error al eliminar producto: ID no válido" });
            }
        });                    

        socket.on("delete-cart", (data) => {
            console.log("Carrito vaciado:", data);
            socket.emit("cart-cleared", { message: "Carrito vaciado exitosamente" });
        });
    
        socket.on("disconnect", () => {
            console.log("Se desconectó un cliente");
        });

        //console.log("Emitiendo lista de productos:", listaDeProductos);
        socket.emit("products-list", { products: listaDeProductos });
        socket.emit("error-message", { message: "Ocurrió un error al procesar tu solicitud" });

    });
    
    return socketServer;
};