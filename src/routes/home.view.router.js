import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
    try {
        res.render("home", { title: "Inicio" });
    } catch (error) {
        res.status(500).send(`<h1>Error</h1><h3>${error.message}</h3>`);
    }
});

router.get("/cart", (req, res) => {
    res.render("cart", { title: "Carrito" });
});

router.get("/realTimeProducts", (req, res) => {
    res.render("realTimeProducts", { title: "Productos en Tiempo Real" });
});


export default router;