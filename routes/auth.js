import express from 'express';
import {
    forgotPassword,
    getForgotPassword,
    getLogin,
    getRegistration,
    getToken,
    login,
    logout,
    registration,
    updatePassword
} from "../controllers/authController.js";

const router = express.Router();

export default function () {

    router.get('/login', getLogin);

    router.post('/login', login);

    router.get('/registration', getRegistration);

    router.post('/registration', registration);

    router.get('/logout', logout);

    router.get('/forgot-password', getForgotPassword);

    router.post('/forgot-password', forgotPassword);

    router.get('/reset-password/:token', getToken);

    router.post('/reset-password/:token', updatePassword);

    return router;
}