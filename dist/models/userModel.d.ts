import mongoose, { Document } from 'mongoose';
interface IUser extends Document {
    email: string;
    password: string;
    verified: boolean;
    verificationCode: string | undefined;
    forgotPasswordCode: string | undefined;
    verificationCodeValidation: Number | undefined;
    forgotPasswordCodeValidation: Number | undefined;
    createdAt: Date;
    updatedAt: Date;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default User;
