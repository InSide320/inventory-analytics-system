import {Schema, model} from 'mongoose';

const warehouseProductSchema = new Schema({
    productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true},
    warehouseId: {type: Schema.Types.ObjectId, ref: 'Warehouse', required: true},
    quantity: {type: Number, required: true, min: [0, 'Price must be more then 0'], default: 0},
}, {timestamps: true});

warehouseProductSchema.index({productId: 1, warehouseId: 1}, {unique: true});

export default model('WarehouseProduct', warehouseProductSchema);
