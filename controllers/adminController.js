import userSchema from "../models/userSchema.js";
import mongoose from "mongoose";

export const getDashboard = async (req, res) => {
    try {
        let users = await userSchema.find({role: {$in: ["staff", "admin", "viewer", "manager"]}})
            .select('role username email createdAt');

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
    } catch (error) {
        console.error('Error fetching users:', error);
        res.render('admin-dashboard', {
            users: [],
            error: 'Не вдалося завантажити користувачів'
        });
    }
};

export const updateUserRole = async (req, res) => {
    const {id} = req.params;
    const {role} = req.body;

    if (!['staff', 'admin', 'viewer', 'manager'].includes(role)) {
        return returnWithError(res, 'Недопустима роль');
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return returnWithError(res, 'Невірний ID користувача');
    }

    try {
        const user = await userSchema.findById(id);
        if (!user) return returnWithError(res, 'Користувача не знайдено');

        user.role = role;
        await user.save();

        res.redirect('/admin-dashboard');
    } catch (error) {
        console.error('Error updating user role:', error);
        return returnWithError(res, 'Не вдалося оновити роль користувача');
    }
};

const returnWithError = async (res, errorMessage) => {
    try {
        let users = await userSchema.find({role: {$in: ["staff", "admin", "viewer", "manager"]}})
            .select('role username email createdAt');

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

        return res.render('admin-dashboard', {
            users,
            error: errorMessage
        });
    } catch (e) {
        console.error('Secondary error while rendering:', e);
        return res.render('admin-dashboard', {
            users: [],
            error: 'Серверна помилка'
        });
    }
};
