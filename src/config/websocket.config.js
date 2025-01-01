import { Server } from "socket.io";

export const config = (httpServer) => {

    const socketServer = new Server(httpServer);

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

        socket.on("insert-product", (data) => {
            listaDeProductos.push(data);
            console.log("Producto agregado:", data);
            socketServer.emit("products-list", { products: listaDeProductos }); 
        });

        socket.on("cart-updated", (data) => {
            console.log("Carrito actualizado:", data.cart);
        });
  
        socket.on("delete-product", (data) => {
            const index = listaDeProductos.findIndex((prod) => prod.id === data.id);
            if (index > -1) {
                listaDeProductos.splice(index, 1);
                console.log("Producto eliminado:", data);
                socketServer.emit("products-list", { products: listaDeProductos });
            }
        });

        socket.on("delete-cart", (data) => {
            console.log("Carrito vaciado:", data);
            socket.emit("cart-cleared", { message: "Carrito vaciado exitosamente" });
        });
    
        socket.on("disconnect", () => {
            console.log("Se desconectó un cliente");
        });

        console.log("Emitiendo lista de productos:", listaDeProductos);
        socket.emit("products-list", { products: listaDeProductos });
        socket.emit("error-message", { message: "Ocurrió un error al procesar tu solicitud" });

    });
    
};