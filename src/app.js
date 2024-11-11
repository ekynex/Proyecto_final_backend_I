import express from 'express';

import routerCart from './routes/cart.router.js';
import routerProducts from './routes/product.router.js'

const app = express();
const PORT = 8080;

app.use("/api/public", express.static("./src/public"));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use("/api/cart", routerCart);
app.use("/api/products", routerProducts);

app.listen(PORT, () => {
    console.log(`Ejecutándose en http://localhost:${PORT}`);
});