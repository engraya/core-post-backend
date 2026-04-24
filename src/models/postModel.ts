import mongoose, { Document, Schema } from 'mongoose';

/** Blog post: title, body, and author reference. */
export interface IPost extends Document {
  title: string;
  description: string;
  userId: mongoose.Types.ObjectId;
}

/** Post collection with created/updated timestamps. */
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
    id: false,
    timestamps: true,
  },
);

/** Speeds up “posts by user” listings ordered by recency. */
postSchema.index({ userId: 1, createdAt: -1 });

/** Registered `Post` model. */
const Post = mongoose.model<IPost>('Post', postSchema);

export default Post;
