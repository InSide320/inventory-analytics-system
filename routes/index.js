import express from "express";

const router = express.Router();

export default function () {
    router.get('/', (req, res) => {
        res.render('main', {title: 'Home'});
    })
    return router;
}