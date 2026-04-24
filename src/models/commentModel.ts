import mongoose, { Document, Schema } from 'mongoose';

/** Comment on a post, authored by a user. */
export interface IComment extends Document {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  body: string;
}

/** Comment document with `postId` and `userId` refs. */
const commentSchema = new Schema<IComment>(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    body: {
      type: String,
      required: [true, 'Comment body is required'],
      trim: true,
      maxlength: [2000, 'Comment must not exceed 2000 characters'],
    },
  },
  {
    id: false,
    timestamps: true,
  },
);

/** List comments for a post in reverse chronological order. */
commentSchema.index({ postId: 1, createdAt: -1 });

/** Registered `Comment` model. */
const Comment = mongoose.model<IComment>('Comment', commentSchema);

export default Comment;
