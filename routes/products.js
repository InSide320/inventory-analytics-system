import express from "express";
import requireRole from "../middleware/requireRole.js";
import {EUserRoles} from "../enum/EUserRoles.js";
import {
    createProduct,
    deleteProduct,
    getByIdProductByWarehouse,
    getByIdWarehouseProduct,
    getProducts,
    updateProduct
} from "../controllers/productController.js";
import {renderNewProductPage} from "../controllers/warehouseController.js";

const router = express.Router();

export default function () {
    router.get('/', requireRole([EUserRoles.ADMIN, EUserRoles.MANAGER, EUserRoles.STAFF]), getProducts);

    router.get('/new', requireRole([EUserRoles.ADMIN]), renderNewProductPage);

    router.post('/', requireRole([EUserRoles.ADMIN]), createProduct);

    router.get('/:id', requireRole([EUserRoles.ADMIN, EUserRoles.MANAGER, EUserRoles.STAFF]), getByIdWarehouseProduct);

    router.get('/:id/edit', requireRole([EUserRoles.ADMIN, EUserRoles.MANAGER]), getByIdProductByWarehouse);

    router.post('/:id', requireRole([EUserRoles.ADMIN, EUserRoles.MANAGER]), updateProduct);

    router.post('/:id/delete', requireRole([EUserRoles.ADMIN]), deleteProduct);

    return router;
}