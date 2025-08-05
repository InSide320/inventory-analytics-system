import express from "express";
import {getAnalytics} from "../controllers/analyticController.js";

const router = express.Router();

export default function () {
    router.get('/', getAnalytics)

    return router;
}