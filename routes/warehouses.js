import express from "express";
import Warehouse from "../models/warehouseSchema.js";
import requireRole from "../middleware/requireRole.js";
import {EUserRoles} from "../enum/EUserRoles.js";
import {
    renderNewWarehousePage,
    renderWarehousesListPage,
    createWarehouse,
    renderWarehouseById, renderEditWarehouse, updateWarehouse, deleteWarehouse
} from "../controllers/warehouseController.js";
import {deleteProduct} from "../controllers/productController.js";

const router = express.Router();

export default function () {
    router.get('/', requireRole([EUserRoles.ADMIN]), renderWarehousesListPage);

    router.get('/new', requireRole([EUserRoles.ADMIN]), renderNewWarehousePage);

    router.post('/new', requireRole([EUserRoles.ADMIN]), createWarehouse);

    router.get('/:id', requireRole([EUserRoles.ADMIN]), renderWarehouseById);

    router.get('/:id/edit', requireRole([EUserRoles.ADMIN]), renderEditWarehouse);

    router.post('/:id/edit', requireRole([EUserRoles.ADMIN]), updateWarehouse);

    router.post('/:id/delete', requireRole([EUserRoles.ADMIN]), deleteWarehouse);

    return router;
}