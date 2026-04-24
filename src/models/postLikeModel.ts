import mongoose, { Document, Schema } from 'mongoose';

/** One row per (user, post) like. */
export interface IPostLike extends Document {
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
}

/** Simple join collection for post likes. */
const postLikeSchema = new Schema<IPostLike>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
  },
  {
    id: false,
    timestamps: true,
  },
);

/** Prevents double-like; second index supports counting likes per post. */
postLikeSchema.index({ userId: 1, postId: 1 }, { unique: true });
postLikeSchema.index({ postId: 1 });

/** Registered `PostLike` model. */
const PostLike = mongoose.model<IPostLike>('PostLike', postLikeSchema);

export default PostLike;
