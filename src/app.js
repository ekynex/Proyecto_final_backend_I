import express from 'express';
import { config as configHandlebars } from "./config/handlebars.config.js";
import { config as configWebsocket } from "./config/websocket.config.js";
import { connectDB } from "./config/mongoose.config.js";
import routerViewHome from './routes/home.view.router.js'

import productRouter from "./routes/product.router.js";
import cartRouter from "./routes/cart.router.js";

const app = express();

connectDB();

const PORT = 8080;

app.use("/api/public", express.static("./src/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

configHandlebars(app);

const httpServer = app.listen(PORT, () => {
    console.log(`Ejecutándose en http://localhost:${PORT}`);
});

const socketServer = configWebsocket(httpServer);

app.use("/api/products", productRouter(socketServer));
app.use("/api/carts", cartRouter(socketServer));
app.use("/", routerViewHome);

app.use("*", (req, res) => {
    res.status(404).render("error404", { title: "Error 404" });
});

configWebsocket(httpServer);