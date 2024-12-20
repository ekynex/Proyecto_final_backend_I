import ErrorManager from "./ErrorManager";
import { isValidID } from "../config/moongose.config";
import UserModel from "../models/user.model";

export default class UserManager {
    #userModel;

    constructor() {
        this.#userModel = UserModel;
    }

    async #findOneById(id) {
        if (!isValidID(id)) {
            throw new ErrorManager("ID inválido", 400);
        }

        const user = await this.#userModel.findById(id);

        if (!user) {
            throw new ErrorManager("ID no encontrado", 400);
        }

        return user;
    }

    async getAll() {
        try {
            return await this.#userModel.find();
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
            const user = await this.#userModel.create(data);
            return user;
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }

    async updateOneById(id, data) {
        try {
            const user = await this.#findOneById(id);
            const emailExisting = await this.#userModel.findOne({ _id: { $ne: id }, email: data.email });

            if (emailExisting) {
                throw new ErrorManager("El email ya está registrado", 409);
            }

            const newValues = { ...user, ...data };
            user.set(newValues);
            user.save();

            return user;
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }

    async deleteOneById(id) {
        try {
            const user = await this.#findOneById(id);
            await user.deleteOne();
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }

}