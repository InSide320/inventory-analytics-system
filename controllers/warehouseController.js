import Warehouse from "../models/warehouseSchema.js";

async function fetchWarehouses() {
    return await Warehouse.find();
}

export const renderNewProductPage = async (req, res) => {
    try {
        const warehouses = await fetchWarehouses();
        res.render('products/new-product', { warehouses });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading new product page');
    }
};

export const renderWarehousesListPage = async (req, res) => {
    try {
        const warehouses = await fetchWarehouses();
        res.render('store/warehouses', { warehouses });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading warehouses list');
    }
};

export const renderNewWarehousePage = (req, res) => {
    res.render('store/new-warehouse');
}

export const createWarehouse = async (req, res) => {
    const {name, location} = req.body;
    try {
        await Warehouse.create({name, location});
        res.redirect('/warehouses');
    } catch (err) {
        if (err.code === 11000) {
            const message = 'Назва складу вже існує.';

            return res.status(400).render('store/new-warehouse', {
                warehouse: {name, location},
                error: message,
                isEdit: typeof warehouse !== 'undefined' && typeof warehouse._id !== 'undefined'
            });
        }

        console.error(err);
        res.status(500).send('Внутрішня помилка сервера');
    }
}

export const renderWarehouseById = async (req, res) => {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) return res.status(404).send('Product not found');
    res.render('store/new-warehouse', {warehouse: warehouse});
}

export const renderEditWarehouse = async (req, res) => {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) return res.status(404).send('Product not found');
    res.render('store/new-warehouse', {warehouse});
}

export const updateWarehouse = async (req, res) => {
    try {
        const product = await Warehouse.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        product.name = req.body.name;
        product.location = req.body.location;

        await product.save();
        res.redirect('/warehouses');
    } catch (err) {
        if (err.code === 11000) {
            const message = 'Така назва складу вже існує.';
            return res.status(400).render('store/new-warehouse', {
                warehouse: req.body,
                error: message
            });
        }
        console.error(err);
        res.status(500).send('Внутрішня помилка сервера');
    }
}

export const deleteWarehouse = async (req, res) => {
    await Warehouse.findByIdAndDelete(req.params.id);
    res.redirect('/warehouses');
}