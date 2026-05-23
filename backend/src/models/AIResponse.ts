import mongoose, { Schema, Document } from 'mongoose';

export interface IAIResponse extends Document {
  type: 'code_generation' | 'code_review' | 'suggestion' | 'question_answer';
  prompt: string;
  response: string;
  language?: string;
  user: mongoose.Types.ObjectId;
  server?: mongoose.Types.ObjectId;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const aiResponseSchema = new Schema<IAIResponse>(
  {
    type: {
      type: String,
      enum: ['code_generation', 'code_review', 'suggestion', 'question_answer'],
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
    language: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    server: {
      type: Schema.Types.ObjectId,
      ref: 'Server',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

export const AIResponse = mongoose.model<IAIResponse>('AIResponse', aiResponseSchema);
