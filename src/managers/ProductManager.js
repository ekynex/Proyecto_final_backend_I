import ErrorManager from "./ErrorManager.js";
import { isValidID } from "../config/mongoose.config.js";
import ProductModel from "../models/product.model.js";
import { convertToBoolean } from "../utils/converter.js";

export default class ProductManager {
    #productModel;
    #socketServer;

    constructor(socketServer) {
        this.#productModel = ProductModel;
        this.#socketServer = socketServer;
    }

    async #findOneById(id) {
        if (!isValidID(id)) {
            throw new ErrorManager("ID inválido", 400);
        }

        const product = await this.#productModel.findById(id);

        if (!product) {
            throw new ErrorManager("ID no encontrado", 400);
        }

        return product;
    }

    async getAll(params) {
        try {
            const $and = [];
            const limit = parseInt(params?.limit) || 10;
            const page = parseInt(params?.page) || 1;
    
            if (params?.title) {
                $and.push({ title: { $regex: params.title, $options: "i" } });
            }
    
            if (params?.query) {
                $and.push({
                    $or: [
                        { category: { $regex: params.query, $options: "i" } },
                        { status: params.query === "true" },
                    ],
                });
            }
    
            const filters = $and.length > 0 ? { $and } : undefined;
            console.log("Filters:", filters);
            console.log("Result:", result.docs);

    
            const sort = {
                asc: { price: 1 },
                desc: { price: -1 },
            };
    
            const paginationOptions = {
                limit,
                page,
                sort: sort[params?.sort] ?? {},
                lean: true,
            };
    
            console.log("Filters:", filters);
            console.log("Pagination Options:", paginationOptions);
    
            const result = await this.#productModel.paginate(filters, paginationOptions);
    
            const prevLink = result.hasPrevPage
                ? `/products?limit=${paginationOptions.limit}&page=${result.prevPage}`
                : null;
            const nextLink = result.hasNextPage
                ? `/products?limit=${paginationOptions.limit}&page=${result.nextPage}`
                : null;
    
            return {
                status: "success",
                payload: result.docs,
                totalPages: result.totalPages,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                page: result.page,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                prevLink,
                nextLink,
            };
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

    async insertOne(data, filename) {
        try {
            const product = await this.#productModel.create({
                ...data,
                status: convertToBoolean(data.status),
                thumbnail: filename ?? "image-not-found.jpg" 
            });

            this.#socketServer.emit("cart-updated", { cart });
            return product;

        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }    

    async updateOneById(id, data) {
        try {
            const product = await this.#findOneById(id);
            const newValues = {
                ...product,
                ...data,
                status: data.status ? convertToBoolean(data.status) : product.status,
            };
        
            product.set(newValues);
            await product.save();

            return product;
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }

    async deleteOneById(id) {
        try {
            const product = await this.#findOneById(id);
            await product.deleteOne();
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }
};