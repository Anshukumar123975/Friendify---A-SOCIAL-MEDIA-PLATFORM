import jwt from 'jsonwebtoken';
import { User } from '../models/user.models.js';

// Middleware to verify JWT and attach user to req.user
export const authenticateUser = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log(token);
    if (!token) {
        return res.status(401).json({ message: 'No token provided.' });
    }

    try {
        const JWT_SECRET = "anshu";  // Make sure this matches the key used during JWT signing
        console.log(JWT_SECRET);
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("Decoded token:", decoded);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found.' });
        }
        req.user = user;  // Set user information in request object
        next();  // Proceed to the next middleware/handler
    } catch (error) {
        console.error('Token verification error:', error); 
        return res.status(401).json({ message: 'Invalid token.' });
    }
};
