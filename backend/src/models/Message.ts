import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  channel: mongoose.Types.ObjectId;
  server: mongoose.Types.ObjectId;
  reactions: Map<string, mongoose.Types.ObjectId[]>;
  edited: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
    },
    server: {
      type: Schema.Types.ObjectId,
      ref: 'Server',
      required: true,
    },
    reactions: {
      type: Map,
      of: [Schema.Types.ObjectId],
      default: new Map(),
    },
    edited: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model<IMessage>('Message', messageSchema);
