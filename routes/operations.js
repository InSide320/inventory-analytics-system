import express from "express";

const router = express.Router();

export default function () {
    router.get('/', (req, res) => {
        if (!req.session.email) return res.redirect('/auth/login');

        res.render('operations', {title: 'Operations'});
    })
    return router;
}