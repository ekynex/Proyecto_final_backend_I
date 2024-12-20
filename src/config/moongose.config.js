import { connect, Types } from "mongoose";

// Conecta con la base de datos MongoDB
export const connectDB = async () => {
    const URL = "mongodb+srv://TomasMatias:mongoDB1234@cluster0.es4ua.mongodb.net/proyecto_final_backend?retryWrites=true&w=majority&appName=Cluster0";

    try {
        await connect(URL);
        console.log("Conectado a MongoDB");
    } catch (error) {
        console.log("Error al conectar con MongoDB", error.message);
    }
};

// Verifica que un ID sea válido con el formato de ObjectId de MongoDB
export const isValidID = (id) => {
    return Types.ObjectId.isValid(id);
};