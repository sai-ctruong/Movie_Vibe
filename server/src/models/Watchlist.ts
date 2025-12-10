import mongoose, { Schema, Document } from 'mongoose';

export interface IWatchlist extends Document {
  userId: mongoose.Types.ObjectId;
  movieId: mongoose.Types.ObjectId;
  addedAt: Date;
}

const WatchlistSchema = new Schema<IWatchlist>({
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
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for unique user-movie combination
WatchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });
WatchlistSchema.index({ userId: 1, addedAt: -1 });

export const Watchlist = mongoose.model<IWatchlist>('Watchlist', WatchlistSchema);
