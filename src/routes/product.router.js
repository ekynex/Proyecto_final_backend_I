import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";
import uploader from "../utils/uploader.js";

const router = Router();
const productManager = new ProductManager();

router.get("/", async (req, res) => {
    try {
        const { limit, page, sort, query } = req.query;

        const products = await productManager.getAll({ limit, page, sort, query });

        res.status(200).json(products);
    } catch (error) {
    
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const product = await productManager.getOneById(req.params.id);
        res.status(200).json({ status: "success", payload: product });
    } catch (error) {
        res.status(error.code).json({ status: "error", message: error.message });
    }
});

router.post("/", uploader.single("file"), async (req, res) => {
    try {
        const product = await productManager.insertOne(req.body, req.file?.filename); 
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const product = await productManager.updateOneById(req.params.id, req.body);
        res.status(200).json({ status: "success", payload: product });
    } catch (error) {
        res.status(error.code).json({ status: "error", message: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await productManager.deleteOneById(req.params.id);
        res.status(200).json({ status: "success" });
    } catch (error) {
        res.status(error.code).json({ status: "error", message: error.message });
    }
});

export default router;