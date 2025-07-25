import {model, Schema} from 'mongoose';
import {nanoid} from 'nanoid';
import {EProductStatus} from "../enum/EProductStatus.js";
import {EProductCategory} from "../enum/EProductCategory.js";

const productSchema = new Schema({
    name: {type: String, required: true, trim: true},
    sku: {type: String, trim: true, uppercase: true, unique: true},
    category: {type: String, required: true, enum: EProductCategory},
    price: {type: Number, min: 0, default: 0},
    lowStockThreshold: {type: Number, default: 5},
    warehouseId: {type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, trim: true},
    status: {
        type: String,
        enum: EProductStatus,
        default: 'active'
    },
    images: {
        type: [String],
        default: [],
        validate: {
            validator: (arr) => arr.every((url) => typeof url === 'string' && url.startsWith('http')),
            message: props => `${props.value} is not a valid image URL!`
        }
    }
}, {timestamps: true, optimisticConcurrency: true});

productSchema.pre('save', function (next) {
    if (!this.sku) {
        const base = this.name.replace(/\s+/g, '-').toUpperCase().slice(0, 10);
        this.sku = `${base}-${nanoid(5).toUpperCase()}`;
    }
    next();
})

export default model('Product', productSchema);
