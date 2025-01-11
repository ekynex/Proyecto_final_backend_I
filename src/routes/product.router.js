import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";
import uploader from "../utils/uploader.js";

export default (socketServer) => {
  const router = Router();
  const productManager = new ProductManager();

  router.get("/", async (req, res) => {
    try {
      const { limit, page, sort, query } = req.query;
      const products = await productManager.getAll({
        limit,
        page,
        sort,
        query,
      });
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
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

  router.get("/details/:id", async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await productManager.getOneById(productId);

      if (!product) {
        return res
          .status(404)
          .render("error404", { title: "Producto no encontrado" });
      }

      res.render("productDetail", { product }); // Renderiza la vista con los detalles del producto
    } catch (error) {
      res
        .status(error.code || 500)
        .render("error404", { title: "Error Interno del Servidor" });
    }
  });

  router.post("/", uploader.single("file"), async (req, res) => {
    try {
      const product = await productManager.insertOne(
        req.body,
        req.file?.filename
      );
    } catch (error) {
      res
        .status(error.code || 500)
        .json({ status: "error", message: error.message });
    }
  });

  router.put("/:id", async (req, res) => {
    try {
      const product = await productManager.updateOneById(
        req.params.id,
        req.body
      );
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

  return router;
};
