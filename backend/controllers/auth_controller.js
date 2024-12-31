import express from 'express';
import User from '../models/user.js';
import bcrypt from 'bcryptjs'
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js';

export const signUp = async (req, res) => {
    try {
        const { username, fullName, password, email } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format",
            });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                message: "Username already exists",
            });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                message: "Email already exists",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            fullName,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            console.log("New user: ", newUser);
            res.status(201).json({
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
            });
        } else {
            res.status(400).json({
                message: "Invalid user data",
            });
        }

    } catch (error) {
        console.log("Error on sign up controller: ", error);
        res.status(500).json({
            message: "Internal Server Error.",
        });
    }
};

export const logIn = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("body: ", req.body);
        const user = await User.findOne({ username });
        console.log("User: ", user);
        const isPasswordValid = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordValid) {
            return res.status(400).json({
                message: "Invalid username or password",
            });
        }

        generateTokenAndSetCookie(user._id, res);

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
        });

    } catch (error) {
        console.log("Error on login controller: ", error);
        res.status(500).json({
            message: "Internal Server Error.",
        });
    }
};

export const logOut = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.json({
            message: "Logged out successfully",
        });
    } catch (error) {
        console.log("Error on logout controller: ", error);
        res.status(500).json({
            message: "Internal Server Error.",
        });
    }
};
