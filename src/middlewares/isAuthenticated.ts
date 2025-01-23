const jwt = require('jsonwebtoken');
import { Response, Request, NextFunction } from "express";


const isAuthenticated = (req : Request, res : Response, next : NextFunction) => {
    let token;
    if(req.headers.client === 'not-browser') {
        token = req.headers.authorization;
    } else {
        token = req.cookies['Authorization']
    }

    if (!token) {
        return res.status(403).json({ success: false, message: 'Unauthorized!' });
    }
    try {
        const userToken = token.split(' ')[1]
        const jwtVerified  =jwt.verify(userToken, process.env.JWT_SECRET)
        if(jwtVerified) {
            // @ts-ignore
            req.user = jwtVerified;
            next();
        } else {
            throw new Error('Error in the token')
        }
        
    } catch (error) {
        console.log(error)
    }
}

export default isAuthenticated;