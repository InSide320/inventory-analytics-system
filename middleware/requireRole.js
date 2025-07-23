export default function requireRole(role) {
    return (req, res, next) => {
        if (!req.session.email) {
            return res.redirect('/auth/login');
        }

        if (req.session.role !== role) {
            return res.status(403).send('Access denied');
        }
        next();
    };
}