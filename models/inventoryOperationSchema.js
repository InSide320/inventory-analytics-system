import {Schema, model} from 'mongoose';

const inventoryOperationSchema = new Schema({
    productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true},
    userId: {type: Schema.Types.ObjectId, ref: 'User'},
    type: {type: String, enum: ['in', 'out', 'return'], required: true},
    quantity: {type: Number, required: true},
    note: {type: String},
}, {timestamps: true});

export default model('InventoryOperation', inventoryOperationSchema);
