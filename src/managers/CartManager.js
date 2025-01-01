import ErrorManager from "./ErrorManager.js";
import { isValidID } from "../config/mongoose.config.js";
import CartModel from "../models/cart.model.js";
import mongoose from "mongoose";

export default class CartManager {
    #cartModel;
    #socketServer;

    constructor(socketServer) {
        this.#cartModel = CartModel;
        this.#socketServer = socketServer;
    }

    async #findOneById(id) {
        if (!isValidID(id)) {
            throw new ErrorManager("ID inválido", 400);
        }
    
        const objectId = new mongoose.Types.ObjectId(id);    
        const cart = await this.#cartModel.findById(objectId).populate("products.product");
    
        if (!cart) {
            throw new ErrorManager("ID no encontrado", 404);
        }
    
        return cart;
    }    

    async getAll(params) {
        try {
            const paginationOptions = {
                limit: parseInt(params?.limit) || 10,
                page: parseInt(params?.page) || 1,
                populate: "products.product",
                lean: true,
            };

            return await this.#cartModel.paginate({}, paginationOptions);
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }

    async getOneById(id) {
        try {
            return await this.#findOneById(id);
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }

    async insertOne(data) {
        try {
            const cart = await this.#cartModel.create(data);
            return cart;
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }

    async addOneProduct(id, productId) {
        try {
            const cart = await this.#findOneById(id);
    
            const objectProductId = new mongoose.Types.ObjectId(productId); 
    
            const productIndex = cart.products.findIndex(
                (item) => item.product.toString() === objectProductId.toString()
            );         
    
            if (productIndex >= 0) {
                cart.products[productIndex].quantity++;
            } else {
                cart.products.push({ product: objectProductId, quantity: 1 });
            }
    
            await cart.save();    

            this.#socketServer.emit("cart-updated", { cart });
            return cart;
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }    

    async updateCart(id, products) {
        try {
            const cart = await this.#findOneById(id);
    
            if (!Array.isArray(products)) {
                throw new ErrorManager("El formato de productos es inválido", 400);
            }
    
            for (const product of products) {
                const productExists = await ProductModel.findById(product.product);
                if (!productExists) {
                    throw new ErrorManager(`El producto con ID ${product.product} no existe`, 404);
                }
            }

            cart.products = products.map(item => ({
                product: item.product,
                quantity: item.quantity,
            }));
    
            await cart.save();
            return cart;
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }    

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            if (quantity <= 0) {
                throw new ErrorManager("La cantidad debe ser mayor a 0", 400);
            }
    
            const cart = await this.#findOneById(cartId);
    
            const productIndex = cart.products.findIndex(
                item => item.product.toString() === productId
            );
    
            if (productIndex < 0) {
                throw new ErrorManager("El producto no existe en el carrito", 404);
            }
    
            cart.products[productIndex].quantity = quantity;
    
            await cart.save();
            return cart;
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }    
    
    async deleteOneProduct(id, productId) {
        try {
            const cart = await this.#findOneById(id);     
    
            const objectProductId = new mongoose.Types.ObjectId(productId);  
    
            const productIndex = cart.products.findIndex(
                (item) => item.product._id.toString() === objectProductId.toString()
            );     
    
            if (productIndex < 0) {
                throw new ErrorManager("El producto no existe en el carrito", 404);
            }
    
            cart.products.splice(productIndex, 1);
            await cart.save();
    
            return cart;
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }             

    async deleteOneById(id) {
        try {
            await this.#cartModel.findByIdAndDelete(id);
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }

    async removeAllProductsById(id, socketServer){
        try {
            const cart = await this.#findOneById(id);

            cart.products = [];
            await cart.save();

            socketServer.emit("cart-cleared", { cartId: id });
            return cart;
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }

    async updateCart(id, products) {
        try {
            const cart = await this.#findOneById(id);

            if (!Array.isArray(products)) {
                throw new ErrorManager("El formato de productos es inválido", 400);
            }

            cart.products = products.map((item) => ({
                product: item.product,
                quantity: item.quantity,
            }));

            await cart.save();

            return cart;
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }

    async updateProductQuantity(id, productId, quantity) {
        try {
            const cart = await this.#findOneById(id);

            const productIndex = cart.products.findIndex((item) => item.product.toString() === productId);

            if (productIndex < 0) {
                throw new ErrorManager("El producto no existe en el carrito", 404);
            }

            if (quantity <= 0) {
                throw new ErrorManager("La cantidad debe ser mayor a 0", 400);
            }

            cart.products[productIndex].quantity = quantity;

            await cart.save();

            return cart;
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }
}
