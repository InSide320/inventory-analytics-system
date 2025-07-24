import {Schema, model} from 'mongoose';

const userSchema = new Schema({
    email: {type: String, required: true},
    password: {type: String, required: true, trim: true},
    username: {type: String, trim: true},
    role: {
        type: String,
        enum: ['admin', "manager", "staff", "viewer"],
        default: 'viewer'
    },
    resetToken: {type: String},
    resetExpires: {type: Date}
}, {
    timestamps: true,
    optimisticConcurrency: true
});

export default model('User', userSchema);
