import express from 'express';
import userSchema from '../models/userSchema.js';
import requireRole from "../middleware/requireRole.js";
import mongoose from "mongoose";

const router = express.Router();

export default function () {
    router.get('/', requireRole("admin"),async (req, res) => {
        try {
            let users = await userSchema.find({role: {$in: ["staff", "admin", "viewer", "manager"]}}).select('role username email createdAt');
            users = users.map(user => ({
                ...user.toObject(),
                createdAtFormatted: new Date(user.createdAt).toLocaleDateString('uk-UA', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                })
            }));
            res.render('admin-dashboard', {users});
        }catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    router.post('/users/:id/update-role', requireRole('admin'), async (req, res) => {
        const {id} = req.params;
        const {role} = req.body;
        if (!['staff', 'admin', 'viewer', 'manager'].includes(role)) return res.status(400).send('Invalid role');
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send('Invalid user ID');
        }
        try {
            const user = await userSchema.findById(id);
            if (!user) return res.status(404).send('User not found');
            user.role = role;
            await user.save();
            res.redirect('/admin-dashboard');
        } catch (error) {
            console.error('Error updating user role:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    return router;
}