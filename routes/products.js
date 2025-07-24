import express from "express";
import Product from "../models/productSchema.js";
import requireRole from "../middleware/requireRole.js";
import {EUserRoles} from "../enum/EUserRoles.js";

const router = express.Router();

export default function () {
    router.get('/', requireRole([EUserRoles.ADMIN, EUserRoles.MANAGER]), async (req, res) => {
        const products = await Product.find();
        res.render('products', {products});
    });

    router.get('/new', requireRole([EUserRoles.ADMIN, EUserRoles.MANAGER]), (req, res) => {
        res.render('new-product');
    });


    router.post('/', requireRole([EUserRoles.ADMIN, EUserRoles.MANAGER]), async (req, res) => {
        await Product.create(req.body);
        res.redirect('/products');
    });

    router.get('/:id/edit', requireRole([EUserRoles.ADMIN, EUserRoles.MANAGER]), async (req, res) => {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send('Product not found');
        res.render('new-product', {product});
    });

    router.post('/:id', requireRole([EUserRoles.ADMIN, EUserRoles.MANAGER]), async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).send('Product not found');
            }
            product.name = req.body.name;
            product.sku = req.body.sku?.trim();
            product.category = req.body.category;
            product.price = req.body.price;
            product.quantity = req.body.quantity;
            product.location = req.body.location;
            product.status = req.body.status;

            await product.save();
            res.redirect('/products');
        } catch (err) {
            if (err.code === 11000) {
                const message = 'SKU вже існує. Виберіть інший.';
                return res.status(400).render('new-product', {
                    product: req.body,
                    error: message
                });
            }
            console.error(err);
            res.status(500).send('Внутрішня помилка сервера');
        }
    });

    router.post('/:id/delete', requireRole([EUserRoles.ADMIN, EUserRoles.MANAGER]), async (req, res) => {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/products');
    });
    return router;
}