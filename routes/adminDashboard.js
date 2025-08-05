import express from 'express';
import requireRole from "../middleware/requireRole.js";
import {getDashboard, updateUserRole} from "../controllers/adminController.js";

const router = express.Router();

export default function () {
    router.get('/', requireRole("admin"), getDashboard);
    router.post('/users/:id/update-role', requireRole('admin'), updateUserRole);

    return router;
}