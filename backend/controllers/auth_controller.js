import express from 'express';

export const signUp = async (req, res) => {
    res.json({
        data: "You hit the signup endpoint"
    });
};

export const logIn = async (req, res) => {
    res.json({
        data: "You hit the login endpoint"
    });
};

export const logOut = async (req, res) => {
    res.json({
        data: "You hit the logout endpoint"
    });
};

