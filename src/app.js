import express from 'express';
import { config as configHandlebars } from "./config/handlebars.config.js";//proyecto 2
import { config as configWebsocket } from "./config/websocket.config.js";//proyecto 2

import routerCart from './routes/cart.router.js';
import routerProducts from './routes/product.router.js'
import routerViewHome from './routes/home.view.router.js'

const app = express();
const PORT = 8080;

app.use("/api/public", express.static("./src/public"));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

configHandlebars(app);//proyecto 2

app.use("/api/cart", routerCart);
app.use("/api/products", routerProducts);
app.use("/", routerViewHome);

//proyecto 2
app.use("*", (req, res) => {
    res.status(404).render("error404", { title: "Error 404" });
});

//proyecto 2
const httpServer = app.listen(PORT, () => {
    console.log(`Ejecutándose en http://localhost:${PORT}`);
});

//proyecto 2
configWebsocket(httpServer);