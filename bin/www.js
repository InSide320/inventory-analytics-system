import config from 'config';
import app from '../app.js';
import connectDB from '../db/db.js';
import errorRoutes from '../routes/error.js';
import indexRouter from '../routes/index.js';
import authRouter from '../routes/auth.js';
import productsRouter from '../routes/products.js';
import adminDashboardRouter from '../routes/adminDashboard.js';
import inventoryOperations from '../routes/inventoryOperations.js';
import warehousesRouter from '../routes/warehouses.js';

const PORT = config.get('port');


(async () => {
    try {
        await connectDB();
        console.log('Database connected successfully');

        app.use((req, res, next) => {
            console.log(`${req.method} ${req.url}`);
            next();
        });

        // use routes
        app.use("/", indexRouter());
        app.use("/auth", authRouter());
        app.use("/products", productsRouter());
        app.use("/inventory", inventoryOperations());
        app.use("/warehouses", warehousesRouter());
        app.use("/admin-dashboard", adminDashboardRouter());

        app.use(errorRoutes);

        app.listen(PORT, () => {
            console.log(`Server started http://localhost:${PORT}`)
        });
    } catch (err) {
        console.error('Error during server startup:', err);
        process.exit(1);
    }
})();
