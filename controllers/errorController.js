export const notFound = (req, res) => {
    res.status(404).render('404');
}

export const accessDenied = (req, res) => {
    res.status(403).render('403');
}
