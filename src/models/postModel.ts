import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the Post document
interface IPost extends Document {
  title: string;
  description: string;
  userId: mongoose.Types.ObjectId;
}

// Define the schema for the Post model
const postSchema: Schema<IPost> = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
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
  }
);

// Create and export the Post model
const Post = mongoose.model<IPost>('Post', postSchema);

export default Post;
