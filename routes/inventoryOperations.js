import express from "express";
import requireRole from "../middleware/requireRole.js";
import {EUserRoles} from "../enum/EUserRoles.js";
import {getInventoryOperations, manageInventoryOperations} from "../controllers/inventoryOperationsController.js";

const router = express.Router();

export default function () {
    router.get('/new/:productId', requireRole([EUserRoles.ADMIN, EUserRoles.MANAGER]), getInventoryOperations);

    router.post('/new/:productId', requireRole([EUserRoles.ADMIN, EUserRoles.MANAGER]), manageInventoryOperations)

    return router;
}