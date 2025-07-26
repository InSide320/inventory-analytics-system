import express from "express";
import requireRole from "../middleware/requireRole.js";
import {EUserRoles} from "../enum/EUserRoles.js";
import Product from "../models/productSchema.js";
import {ETypeOperations} from "../enum/ETypeOperations.js";
import InventoryOperation from "../models/inventoryOperationSchema.js";

const router = express.Router();

export default function () {
    router.get('/new/:productId', requireRole([EUserRoles.ADMIN, EUserRoles.MANAGER]), async (req, res) => {
        const product = await Product.findById(req.params.productId);
        if (!product) return res.status(404).send("Product not found");

        res.render("products/inventoryOperations", {product});
    });

    router.post('/', requireRole([EUserRoles.ADMIN, EUserRoles.MANAGER]), async (req, res) => {
        const {productId, operationType, quantity, note, fromLocation, toLocation} = req.body;
        const userId = req.session.userId;
        console.log(userId);
        const product = await Product.findById(productId);
        if (!product) return res.status(404).send('Product not found');

        try {
            // let updatedFields = {};
            switch (operationType) {
                case ETypeOperations.RECEIVED:
                    product.quantity += Number(quantity);
                    break;
                case ETypeOperations.REMOVED:
                    if (product.quantity < Number(quantity)) return res.status(400).send('Недостатньо товару на складі');
                    product.quantity -= Number(quantity);
                    break;
                case ETypeOperations.SERVICED:
                    console.log(`Serviced operation for product ${product.name}`);
                    break;
                case ETypeOperations.MOVED:
                    if (product.quantity < Number(quantity)) return res.status(400).send('Недостатньо товару на складі для переміщення');
                    product.location = toLocation || product.location;
                    break;
                case ETypeOperations.WRITTEN_OFF:
                    if (product.quantity < Number(quantity)) return res.status(400).send('Недостатньо товару на складі для списання');
                    product.quantity -= Number(quantity);
                    break;
                default:
                    return res.status(400).send("Невідомий тип операції");
            }

            await product.save();

            await InventoryOperation.create({
                productId: product._id,
                userId: userId,
                operationType: operationType,
                quantity: Number(quantity),
                note: note?.trim(),
                fromLocation: fromLocation?.trim(),
                toLocation: toLocation?.trim(),
            })
            res.redirect(`/products/${productId}`);
        } catch (err) {
            console.error(err);
            return res.status(500).send('Error processing operation');
        }
    })
    return router;
}