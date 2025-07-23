import {Schema, model} from 'mongoose';

const productSchema = new Schema({
    name: {type: String, required: true},
    sku: {type: String, required: true, unique: true},
    category: {type: String},
    price: {type: Number, default: 0},
    quantity: {type: Number, default: 0},
    lowStockThreshold: {type: Number, default: 5},
}, {timestamps: true});

export default model('Product', productSchema);
