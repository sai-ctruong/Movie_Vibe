import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  movieId: mongoose.Types.ObjectId;
  rating: number;
  text?: string;
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  moderation: {
    flagged: boolean;
    reason?: string;
    autoRejected: boolean;
  };
  helpfulVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    movieId: {
      type: Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      maxlength: 2000,
    },
    sentiment: {
      score: {
        type: Number,
        default: 0,
        min: -1,
        max: 1,
      },
      label: {
        type: String,
        enum: ['positive', 'negative', 'neutral'],
        default: 'neutral',
      },
    },
    moderation: {
      flagged: {
        type: Boolean,
        default: false,
      },
      reason: String,
      autoRejected: {
        type: Boolean,
        default: false,
      },
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one review per user per movie
ReviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });
ReviewSchema.index({ movieId: 1, createdAt: -1 });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
