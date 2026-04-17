import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  title: string;
  description: string;
  userId: mongoose.Types.ObjectId;
}

const postSchema: Schema<IPost> = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

postSchema.index({ userId: 1, createdAt: -1 });

const Post = mongoose.model<IPost>('Post', postSchema);

export default Post;
