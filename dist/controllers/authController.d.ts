import { Request, Response } from 'express';
export declare const register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const logout: (_req: Request, res: Response) => Promise<void>;
export declare const sendVerificationCode: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyVerificationCode: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const changePassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const sendForgotPasswordCode: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyForgotPasswordCode: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
