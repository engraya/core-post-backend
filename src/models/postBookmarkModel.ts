import mongoose, { Document, Schema } from 'mongoose';

/** One row per (user, post) save-for-later. */
export interface IPostBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
}

/** Join collection for bookmarks. */
const postBookmarkSchema = new Schema<IPostBookmark>(
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

/** Unique bookmark; user-scoped list ordered by time saved. */
postBookmarkSchema.index({ userId: 1, postId: 1 }, { unique: true });
postBookmarkSchema.index({ userId: 1, createdAt: -1 });

/** Registered `PostBookmark` model. */
const PostBookmark = mongoose.model<IPostBookmark>('PostBookmark', postBookmarkSchema);

export default PostBookmark;
