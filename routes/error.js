import express from "express";
import {notFound} from '../controllers/errorController.js';

const router = express.Router();

router.use(notFound)

export default router;
