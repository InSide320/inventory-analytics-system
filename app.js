import express from "express";
import morgan from 'morgan';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import createSessionMiddleware from './db/session.js';
import path from "path";
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Setups
app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static(path.join(__dirname, 'assets')));
// app.use(bodyParser.urlencoded({extended: false}));
app.use(express.urlencoded({ extended: false }));


app.use(createSessionMiddleware());
app.use(morgan('tiny', {
    skip: req => req.url.startsWith('/.well-known')
}));
app.use(methodOverride('_method'));

app.use((req, res, next) => {
    res.locals.username = req.session?.username || null;
    res.locals.email = req.session?.email || null;
    res.locals.role = req.session?.role || null;
    next();
});

export default app;