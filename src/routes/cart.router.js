import { Router } from "express";
import CartManager from "../managers/CartManager.js";

const router = Router();
const cartManager = new CartManager();

router.get("/", async (req, res) => {
    try {
        const carts = await cartManager.getAll(req.query);
        res.status(200).json({ status: "success", payload: carts });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const cart = await cartManager.getOneById(req.params.id);
        res.status(200).json({ status: "success", payload: cart });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const cart = await cartManager.insertOne(req.body);
        res.status(201).json({ status: "success", payload: cart });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const cart = await cartManager.updateCart(req.params.id, req.body.products);
        res.status(200).json({ status: "success", payload: cart });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.put("/:id/products/:productId", async (req, res) => {
    console.log("Ruta PUT ejecutada");
    try {
        const { id, productId } = req.params;
        const updatedCart = await cartManager.addOneProduct(id, productId);
        res.status(200).json({ status: "success", payload: updatedCart });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            status: "error",
            message: error.message,
        });
    }
});

router.delete("/:id/products/:productId", async (req, res) => {
    try {
        const cart = await cartManager.deleteOneProduct(req.params.id, req.params.productId);
        res.status(200).json({ status: "success", payload: cart });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const cart = await cartManager.removeAllProductsById(req.params.id);
        res.status(200).json({ status: "success", payload: cart });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.delete("/delete/:id", async (req, res) => {
    try {
        await cartManager.deleteOneById(req.params.id);
        res.status(200).json({ status: "success", message: "Carrito eliminado exitosamente" });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

export default router;
