import express from "express";
import WarehouseProduct from "../models/warehouseProductSchema.js";

const router = express.Router();

export default function () {
    router.get('/', async (req, res) => {
        try {
            const warehouseProducts = await WarehouseProduct.find()
                .populate('productId')
                .populate('warehouseId');
            const validItems = warehouseProducts.filter(
                wp => wp.productId && wp.warehouseId
            );

            // Загальна вартість всіх запасів
            const totalValue = validItems.reduce((sum, item) =>
                sum + (item.productId.price || 0) * item.quantity, 0
            ).toFixed(2);

            // Загальна кількість товарів по категоріях
            const byCategory = {};
            validItems.forEach(item => {
                const cat = item.productId.category || 'Unknown';
                if (!byCategory[cat]) byCategory[cat] = { count: 0, total: 0 };
                byCategory[cat].count += 1;
                byCategory[cat].total += item.quantity;
            });

            // Сума товарів по складах (в штуках)
            const stockByWarehouse = {};
            // Сума по вартості товарів на кожному складі
            const valueByWarehouse = {};
            // Товари з низьким запасом по складах
            const lowStockByWarehouse = {};

            validItems.forEach(item => {
                const warehouse = item.warehouseId.name;
                const product = item.productId;
                const quantity = item.quantity;

                // Сумарна кількість
                stockByWarehouse[warehouse] = (stockByWarehouse[warehouse] || 0) + quantity;

                // Сумарна вартість
                valueByWarehouse[warehouse] = (valueByWarehouse[warehouse] || 0) + (product.price || 0) * quantity;

                // Поріг запасу
                const threshold = product.lowStockThreshold ?? 5; // За замовчуванням 5
                if (quantity <= threshold) {
                    if (!lowStockByWarehouse[warehouse]) lowStockByWarehouse[warehouse] = [];
                    lowStockByWarehouse[warehouse].push({
                        name: product.name,
                        sku: product.sku,
                        quantity,
                        threshold
                    });
                }
            });

            res.render('products/product-analytics', {
                totalValue,
                byCategory,
                stockByWarehouse,
                valueByWarehouse,
                lowStockByWarehouse
            });
        } catch (err) {
            console.error(err);
            res.status(500).render('products/products', {
                groupedProducts: [],
                error: 'Помилка при завантаженні продуктів',
            });
        }
    })

    return router;
}