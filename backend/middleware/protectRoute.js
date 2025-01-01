import User from '../models/user.js';
import jwt from 'jsonwebtoken';

export const protectRoute = async (req, res, next) => {
    try {
        console.log("Cookies: ", req.cookies);
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized: No Token Provided",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded: ", decoded);

        if (!decoded) {
            return res.status(401).json({
                message: "Unauthorized: Invalid Token",
            });
        }

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        req.user = user;

        next();

    } catch (error) {
        console.log("Error on protectRoute middleware: ", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};