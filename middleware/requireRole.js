import {accessDenied} from "../controllers/errorController.js";

export default function requireRole(roles) {
    return (req, res, next) => {
        if (!req.session?.email) {
            return res.redirect('/auth/login');
        }

        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(req.session.role)) {
            accessDenied(req, res);
            return;
        }

        next();
    };
}
