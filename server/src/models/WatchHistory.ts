import mongoose, { Schema, Document } from 'mongoose';

export interface IWatchHistory extends Document {
  userId: mongoose.Types.ObjectId;
  movieId: mongoose.Types.ObjectId;
  progress: number;
  lastWatchedAt: Date;
  watchTime: number;
  completed: boolean;
  device: string;
  qualitySettings: {
    selectedQuality: string;
    adjustments: {
      timestamp: number;
      from: string;
      to: string;
      reason: 'manual' | 'auto' | 'buffering';
    }[];
  };
}

const WatchHistorySchema = new Schema<IWatchHistory>(
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
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
    watchTime: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    device: {
      type: String,
      default: 'web',
    },
    qualitySettings: {
      selectedQuality: {
        type: String,
        default: 'auto',
      },
      adjustments: [
        {
          timestamp: Number,
          from: String,
          to: String,
          reason: {
            type: String,
            enum: ['manual', 'auto', 'buffering'],
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique user-movie combination
WatchHistorySchema.index({ userId: 1, movieId: 1 }, { unique: true });
WatchHistorySchema.index({ userId: 1, lastWatchedAt: -1 });

export const WatchHistory = mongoose.model<IWatchHistory>('WatchHistory', WatchHistorySchema);
