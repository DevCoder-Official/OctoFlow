import mongoose, { Schema, Document } from 'mongoose';

export interface IRepository extends Document {
  repoName: string;
  owner: string;
  url: string;
  description?: string;
  language?: string;
  stars: number;
  forks: number;
  sharedBy: mongoose.Types.ObjectId;
  server?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const repositorySchema = new Schema<IRepository>(
  {
    repoName: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    language: {
      type: String,
    },
    stars: {
      type: Number,
      default: 0,
    },
    forks: {
      type: Number,
      default: 0,
    },
    sharedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    server: {
      type: Schema.Types.ObjectId,
      ref: 'Server',
    },
  },
  { timestamps: true }
);

export const Repository = mongoose.model<IRepository>('Repository', repositorySchema);
