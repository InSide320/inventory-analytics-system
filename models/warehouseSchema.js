import { Schema, model } from 'mongoose';

const warehouseSchema = new Schema({
    name: { type: String, required: true, unique: true },
    location: { type: String },
}, { timestamps: true });

export default model('Warehouse', warehouseSchema);
