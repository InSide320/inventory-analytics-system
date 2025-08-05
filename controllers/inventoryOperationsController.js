import WarehouseProductSchema from "../models/warehouseProductSchema.js";
import Warehouses from "../models/warehouseSchema.js";
import {findWarehouseProduct, handleQuantityOperation, logInventoryOperation} from "../helpers/inventory.js";


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
        const {warehouseProducts, source} = await findWarehouseProduct(productId, toWarehouseId);
        const warehouses = await Warehouses.find().select("id name");

        if (!source) {
            return res.status(400).render("products/inventoryOperations", {
                product: warehouseProducts[0].productId,
                warehouseProducts,
                warehouses,
                error: "Не можна перенести на той самий склад"
            });
        }

        try {
            const updated = await handleQuantityOperation(operationType, Number(quantity), source, productId, toWarehouseId);
            await logInventoryOperation({
                source: updated,
                userId,
                operationType,
                quantity: Number(quantity),
                note,
                toWarehouseId
            });

            return res.redirect(`/products/${updated.productId._id}`);
        } catch (opError) {
            return res.status(400).render("products/inventoryOperations", {
                product: warehouseProducts[0].productId,
                warehouseProducts,
                warehouses,
                error: opError.message
            });
        }

    } catch (err) {
        console.error(err);
        res.status(500).send('Error processing operation');
    }
};
