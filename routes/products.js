import express from "express";
import Product from "../models/productSchema.js";
import Warehouse from "../models/warehouseSchema.js";
import WarehouseProduct from "../models/warehouseProductSchema.js";
import requireRole from "../middleware/requireRole.js";
import {EUserRoles} from "../enum/EUserRoles.js";

const router = express.Router();

export default function () {
    router.get('/', requireRole([EUserRoles.ADMIN, EUserRoles.MANAGER, EUserRoles.STAFF]), async (req, res) => {
        try {
            const warehouseProducts = await WarehouseProduct.find()
                .populate('productId')
                .populate('warehouseId');
            const grouped = warehouseProducts.map((item) => ({
                product: item.productId,
                warehouse: item.warehouseId,
                quantity: item.quantity
            }));
            res.render('products/products', {groupedProducts: grouped});
        } catch (err) {
            console.error(err);
            res.status(500).render('products/products', {
                groupedProducts: [],
                error: 'Помилка при завантаженні продуктів',
            });
        }
    });

    router.get('/new', requireRole([EUserRoles.ADMIN]), async (req, res) => {
        const warehouses = await Warehouse.find();
        res.render('products/new-product', {warehouses});
    });

    router.post('/', requireRole([EUserRoles.ADMIN]), async (req, res) => {
        const {
            name, sku, category, price, status,
            warehouseId, initialQuantity
        } = req.body;
        const product = await Product.create({
            name,
            sku: sku?.trim(),
            category,
            price,
            warehouseId,
            status
        });

        await WarehouseProduct.create({
            productId: product._id,
            warehouseId,
            quantity: parseInt(initialQuantity, 10) || 0,
        });

        res.redirect('/products');
    });

    router.get('/:id', requireRole([EUserRoles.ADMIN, EUserRoles.MANAGER, EUserRoles.STAFF]), async (req, res) => {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send('Product not found');
        res.render('products/product', {product});
    });

    router.get('/:id/edit', requireRole([EUserRoles.ADMIN, EUserRoles.MANAGER]), async (req, res) => {
        const product = await Product.findById(req.params.id);
        const warehouses = await Warehouse.find();
        if (!product) return res.status(404).send('Product not found');
        res.render('products/new-product', {product, warehouses});
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

    router.post('/:id/delete', requireRole([EUserRoles.ADMIN]), async (req, res) => {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/products');
    });
    return router;
}