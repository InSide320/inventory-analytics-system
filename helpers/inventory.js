import WarehouseProduct from "../models/warehouseProductSchema.js";
import Warehouses from "../models/warehouseSchema.js";
import InventoryOperation from "../models/inventoryOperationSchema.js";

export async function findWarehouseProduct(productId, excludeWarehouseId) {
    const warehouseProducts = await WarehouseProduct.find({productId})
        .populate('productId')
        .populate('warehouseId');

    const source = warehouseProducts.find(wp => wp.warehouseId._id.toString() !== excludeWarehouseId);
    return {warehouseProducts, source};
}

export async function handleQuantityOperation(op, quantity, source, productId, toWarehouseId) {
    switch (op) {
        case 'received':
            source.quantity += quantity;
            break;
        case 'removed':
        case 'written_off':
        case 'serviced':
            if (source.quantity < quantity) {
                throw new Error("Недостатньо товару на складі");
            }
            source.quantity -= quantity;
            break;
        case 'moved':
            if (source.quantity < quantity) {
                throw new Error("Недостатньо товару на складі для переміщення");
            }
            source.quantity -= quantity;

            let target = await WarehouseProduct.findOne({productId, warehouseId: toWarehouseId});
            if (!target) {
                target = new WarehouseProduct({productId, warehouseId: toWarehouseId, quantity: 0});
            }
            target.quantity += quantity;
            await target.save();
            break;
        default:
            throw new Error("Невідомий тип операції");
    }

    await source.save();

    if (source.quantity === 0) {
        const other = await WarehouseProduct.find({
            productId,
            _id: {$ne: source._id},
            quantity: {$gt: 0}
        });

        if (other.length > 0) {
            await WarehouseProduct.findByIdAndDelete(source._id);
        } else {
            await source.productId.updateOne({status: 'inactive'});
        }
    }

    return source;
}

export async function logInventoryOperation({source, userId, operationType, quantity, note, toWarehouseId}) {
    const toWarehouse = toWarehouseId
        ? (await Warehouses.findById(toWarehouseId)).name
        : null;

    return InventoryOperation.create({
        productId: source.productId._id,
        userId,
        operationType,
        quantity,
        note: note?.trim(),
        fromLocation: source.warehouseId.name,
        toLocation: toWarehouse
    });
}
