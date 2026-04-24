import mongoose, { Document, Schema } from 'mongoose';
import type { IPost } from './postModel';

/** Application user: credentials, email verification, optional profile fields, and virtual `posts`. */
export interface IUser extends Document {
  email: string;
  password: string;
  displayName: string;
  avatarUrl?: string;
  verified: boolean;
  verificationCode: string | undefined;
  forgotPasswordCode: string | undefined;
  verificationCodeValidation: number | undefined;
  forgotPasswordCodeValidation: number | undefined;
  createdAt: Date;
  updatedAt: Date;
  posts?: IPost[];
}

/** Mongoose shape: sensitive fields are `select: false` by default. */
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: [true, 'Email must be unique'],
      minlength: [5, 'Email must have 5 characters'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be 8 characters in length'],
      trim: true,
      select: false,
    },
    displayName: {
      type: String,
      default: '',
      trim: true,
      maxlength: [60, 'Display name must not exceed 60 characters'],
    },
    avatarUrl: {
      type: String,
      trim: true,
      maxlength: [2048, 'Avatar URL must not exceed 2048 characters'],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeValidation: {
      type: Number,
      select: false,
    },
    forgotPasswordCode: {
      type: String,
      select: false,
    },
    forgotPasswordCodeValidation: {
      type: Number,
      select: false,
    },
  },
  {
    /** Avoid `_id` and `id` both in JSON; keep Mongo’s `_id` only (`id` is a Mongoose virtual duplicate). */
    id: false,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/** Reverse populate: user’s blog posts (used when listing users with posts). */
userSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'userId',
});

/** Registered `User` model. */
const User = mongoose.model<IUser>('User', userSchema);

export default User;
