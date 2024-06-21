import { NextFunction, Request, Response } from 'express'
import AuthService from '../routes/auth/auth-service'

const authService = new AuthService()

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }

    try {
        const decoded = authService.verifyJwt(token);
        (req as any).user = decoded;
        
        next();
    } catch (ex) {
        res.status(400).send('Invalid token.');
    }
};
