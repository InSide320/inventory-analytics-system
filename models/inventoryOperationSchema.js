import {Schema, model} from 'mongoose';
import {ETypeOperations} from "../enum/ETypeOperations.js";

const inventoryOperationSchema = new Schema({
    productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true},
    userId: {type: Schema.Types.ObjectId, ref: 'User'},
    operationType: {
        type: String,
        enum: ETypeOperations,
        required: true
    },
    quantity: {type: Number, required: true},
    note: {type: String},
    fromWarehouseId: {type: Schema.Types.ObjectId, ref: 'Warehouse'},
    toWarehouseId: {type: Schema.Types.ObjectId, ref: 'Warehouse'},
}, {timestamps: true, optimisticConcurrency: true});

export default model('InventoryOperation', inventoryOperationSchema);
