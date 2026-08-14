export const requireAuth = (req, res, next) => {
    if (!req.session?.userId) {
        return res.status(401).json({
            message: "Vous devez être connecté"
        });
    }

    next();
};