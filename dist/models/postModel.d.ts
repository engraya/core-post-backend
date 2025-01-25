import mongoose, { Document } from 'mongoose';
interface IPost extends Document {
    title: string;
    description: string;
    userId: mongoose.Types.ObjectId;
}
declare const Post: mongoose.Model<IPost, {}, {}, {}, mongoose.Document<unknown, {}, IPost> & IPost & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Post;
