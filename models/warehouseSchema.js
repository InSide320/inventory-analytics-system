import {Schema, model} from 'mongoose';

const warehouseSchema = new Schema({
    name: {type: String, required: true, unique: true, trim: true, uppercase: true},
    location: {type: String, trim: true},
}, {timestamps: true});

export default model('Warehouse', warehouseSchema);
