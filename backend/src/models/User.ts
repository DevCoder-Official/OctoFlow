import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  avatar?: string;
  githubId: string;
  githubUsername: string;
  githubAccessToken: string;
  bio?: string;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  servers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    githubId: {
      type: String,
      required: true,
      unique: true,
    },
    githubUsername: {
      type: String,
      required: true,
    },
    githubAccessToken: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: '',
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    servers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Server',
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
