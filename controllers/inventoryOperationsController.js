import WarehouseProductSchema from "../models/warehouseProductSchema.js";
import Warehouses from "../models/warehouseSchema.js";
import {ETypeOperations} from "../enum/ETypeOperations.js";
import InventoryOperation from "../models/inventoryOperationSchema.js";
import Product from "../models/productSchema.js";


export const getInventoryOperations = async (req, res) => {
    try {
        const warehouseProducts = await WarehouseProductSchema.find({
            productId: req.params.productId
        })
            .populate('productId')
            .populate('warehouseId');
        const product = warehouseProducts[0];
        console.log(product)
        if (!warehouseProducts || warehouseProducts.length === 0) {
            return res.status(404).send("Продукт не знайдено на жодному складі");
        }

        const warehouses = await Warehouses.find().select("id name");
        res.render("products/inventoryOperations", {
            product: product.productId,
            warehouseProducts,
            warehouses,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Внутрішня помилка сервера");
    }
};

export const manageInventoryOperations = async (req, res) => {
    const {productId, operationType, quantity, note, toWarehouseId} = req.body;
    const userId = req.session.userId;

    try {
        const warehouseProducts = await WarehouseProductSchema.find({productId})
            .populate('productId')
            .populate('warehouseId');

        if (!warehouseProducts || warehouseProducts.length === 0) {
            return res.status(404).send('Продукт на складах не знайдено');
        }

        const warehouses = await Warehouses.find().select("id name");

        const sourceWarehouseProduct =
            warehouseProducts.find(wp => wp.warehouseId._id.toString() !== toWarehouseId);
        if (!sourceWarehouseProduct) {
            return res.status(400).render("products/inventoryOperations", {
                product: warehouseProducts[0].productId,
                warehouseProducts,
                warehouses,
                error: "Не можна перенести на той самий склад"
            });
        }

        switch (operationType) {
            case ETypeOperations.RECEIVED:
                sourceWarehouseProduct.quantity += Number(quantity);
                break;
            case ETypeOperations.REMOVED:
            case ETypeOperations.WRITTEN_OFF:
            case ETypeOperations.SERVICED:
                if (sourceWarehouseProduct.quantity < Number(quantity)) {
                    return res.status(400).render("products/inventoryOperations", {
                        product: warehouseProducts[0].productId,
                        warehouseProducts,
                        warehouses,
                        error: "Недостатньо товару на складі"
                    });
                }
                sourceWarehouseProduct.quantity -= Number(quantity);
                break;
            case ETypeOperations.MOVED: {
                if (sourceWarehouseProduct.quantity < Number(quantity)) {
                    return res.status(400).render("products/inventoryOperations", {
                        product: warehouseProducts[0].productId,
                        warehouseProducts,
                        warehouses,
                        error: "Недостатньо товару на складі для переміщення"
                    });
                }

                sourceWarehouseProduct.quantity -= Number(quantity);

                let targetWarehouseProduct = await WarehouseProductSchema.findOne({
                    warehouseId: toWarehouseId,
                    productId: productId
                });

                if (!targetWarehouseProduct) {
                    targetWarehouseProduct = new WarehouseProductSchema({
                        warehouseId: toWarehouseId,
                        productId: productId,
                        quantity: 0
                    });
                }

                targetWarehouseProduct.quantity += Number(quantity);
                await targetWarehouseProduct.save();
                break;
            }
            default:
                return res.status(400).render("products/inventoryOperations", {
                    product: warehouseProducts[0].productId,
                    warehouseProducts,
                    warehouses,
                    error: "Невідомий тип операції"
                });
        }

        await sourceWarehouseProduct.save();
        if (sourceWarehouseProduct.quantity === 0) {
            const otherStocks = await WarehouseProductSchema.find({
                productId: productId,
                _id: {$ne: sourceWarehouseProduct._id},
                quantity: {$gt: 0}
            });

            if (otherStocks.length > 0) {
                await WarehouseProductSchema.findByIdAndDelete(sourceWarehouseProduct._id);
            } else {
                await sourceWarehouseProduct.productId.updateOne({status: 'inactive'});
            }
        }

        await InventoryOperation.create({
            productId: sourceWarehouseProduct.productId._id,
            userId,
            operationType,
            quantity: Number(quantity),
            note: note?.trim(),
            fromLocation: sourceWarehouseProduct.warehouseId.name,
            toLocation: toWarehouseId ? (await Warehouses.findById(toWarehouseId)).name : null,
        });

        const remaining = await WarehouseProductSchema.find({productId: productId});
        if (remaining.length === 0) {
            await Product.findByIdAndUpdate({_id: productId}, {status: 'inactive'});
        }

        res.redirect(`/products/${sourceWarehouseProduct._id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error processing operation');
    }
}