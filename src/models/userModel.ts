import mongoose, { Document, Schema } from 'mongoose';
import type { IPost } from './postModel';

export interface IUser extends Document {
  email: string;
  password: string;
  verified: boolean;
  verificationCode: string | undefined;
  forgotPasswordCode: string | undefined;
  verificationCodeValidation: number | undefined;
  forgotPasswordCodeValidation: number | undefined;
  createdAt: Date;
  updatedAt: Date;
  posts?: IPost[];
}

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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'userId',
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
