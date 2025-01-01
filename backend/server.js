import express from 'express';
import authRoutes from './routes/auth_routes.js';
import userRoutes from './routes/user_routes.js';
import connectMongoDB from './db/connectMongoDB.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);


app.listen(PORT, () => {
    console.log("Server is running on port ", PORT);
    connectMongoDB();
});
