import express from "express";
import Product from "../models/productSchema.js";

const router = express.Router();

export default function () {
    router.get('/', async (req, res) => {
        const products = await Product.find();

        const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2);
        const lowStock = products.filter(p => p.quantity <= 5);
        const byCategory = {};

        products.forEach(p => {
            if (!byCategory[p.category]) byCategory[p.category] = {count: 0, total: 0};
            byCategory[p.category].count += 1;
            byCategory[p.category].total += p.quantity;
        });

        res.render('product-analytics', {
            totalValue,
            lowStock,
            byCategory,
        });
    })

    return router;
}