export default function requireRole(roles) {
    return (req, res, next) => {
        if (!req.session?.email) {
            return res.redirect('/auth/login');
        }

        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(req.session.role)) {
            return res.status(403).send('Access denied');
        }

        next();
    };
}
