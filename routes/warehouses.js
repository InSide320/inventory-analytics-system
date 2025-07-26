import express from "express";
import Warehouse from "../models/warehouseSchema.js";
import requireRole from "../middleware/requireRole.js";
import {EUserRoles} from "../enum/EUserRoles.js";

const router = express.Router();

export default function () {
    router.get('/', requireRole([EUserRoles.ADMIN]), async (req, res) => {
        const warehouses = await Warehouse.find();
        res.render('store/warehouses', {warehouses});
    });

    router.get('/new', requireRole([EUserRoles.ADMIN]), (req, res) => {
        res.render('store/new-warehouse');
    });

    router.post('/new', requireRole([EUserRoles.ADMIN]), async (req, res) => {
        const {name, location} = req.body;
        try {
            await Warehouse.create({name, location});
            res.redirect('/warehouses');
        } catch (err) {
            if (err.code === 11000) {
                const message = 'Назва складу вже існує.';

                return res.status(400).render('store/new-warehouse', {
                    warehouse: {name, location},
                    error: message,
                    isEdit: typeof warehouse !== 'undefined' && typeof warehouse._id !== 'undefined'
                });
            }

            console.error(err);
            res.status(500).send('Внутрішня помилка сервера');
        }

    });

    router.get('/:id', requireRole([EUserRoles.ADMIN]), async (req, res) => {
        const warehouse = await Warehouse.findById(req.params.id);
        if (!warehouse) return res.status(404).send('Product not found');
        res.render('store/new-warehouse', {warehouse: warehouse});
    });

    router.get('/:id/edit', requireRole([EUserRoles.ADMIN]), async (req, res) => {
        const warehouse = await Warehouse.findById(req.params.id);
        if (!warehouse) return res.status(404).send('Product not found');
        res.render('store/new-warehouse', {warehouse});
    });

    router.post('/:id/edit', requireRole([EUserRoles.ADMIN]), async (req, res) => {
        try {
            const product = await Warehouse.findById(req.params.id);
            if (!product) {
                return res.status(404).send('Product not found');
            }
            product.name = req.body.name;
            product.location = req.body.location;

            await product.save();
            res.redirect('/warehouses');
        } catch (err) {
            if (err.code === 11000) {
                const message = 'Така назва складу вже існує.';
                return res.status(400).render('store/new-warehouse', {
                    warehouse: req.body,
                    error: message
                });
            }
            console.error(err);
            res.status(500).send('Внутрішня помилка сервера');
        }
    });

    router.post('/:id/delete', requireRole([EUserRoles.ADMIN]), async (req, res) => {
        await Warehouse.findByIdAndDelete(req.params.id);
        res.redirect('/warehouses');
    });
    return router;
}