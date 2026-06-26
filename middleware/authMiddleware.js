const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

    try {

        const authHeader = req.header("Authorization");

            if (!authHeader) {
                return res.status(401).json({ message: "No token" });
            }

            // Expect 'Bearer <token>'
            const parts = authHeader.split(" ");

            if (parts.length !== 2 || parts[0] !== "Bearer") {
                return res.status(401).json({ message: "Invalid token format" });
            }

            const token = parts[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = decoded.user;

            next();

    } catch (error) {

        res.status(401).json({
            message: "Invalid token"
        });
    }
};

module.exports = authMiddleware;