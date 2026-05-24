import jwt from "jsonwebtoken";

const getUser = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.decode(token);
        return decoded;
    } catch {
        return null;
    }
};