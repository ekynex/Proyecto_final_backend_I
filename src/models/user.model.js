import { Schema, model } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "El nombre es obligatorio"],
    },
    age: {
        type: Number,
        required: [ true, "La edad es obligatoria" ],
        min: [ 0, "La edad debe ser un valor positivo" ],
    },
    email: {
        type: String,
        required: [ true, "El email es obligatorio" ],
        lowercase: true,
        trim: true,
        unique: true,
        validate: {
            validator: async function (email) {
                const countDocuments = await this.model("users").countDocuments({
                    _id: { $ne: this._id },
                    email, // Atributo de verificación de duplicado
                });
                return countDocuments === 0;
            },
            message: "El email ya está registrado",
        },
    },
}, {
    timestamps: true,
    versionKey: false,
});

const UserModel = model("users", userSchema);

export default UserModel;