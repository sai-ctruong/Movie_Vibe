import mongoose, { Schema, Document } from 'mongoose';

interface ChatMessage {
  userId: mongoose.Types.ObjectId;
  message: string;
  timestamp: Date;
}

export interface IWatchParty extends Document {
  roomCode: string;
  hostUserId: mongoose.Types.ObjectId;
  movieId: mongoose.Types.ObjectId;
  participants: {
    userId: mongoose.Types.ObjectId;
    joinedAt: Date;
  }[];
  currentTimestamp: number;
  isPlaying: boolean;
  chatMessages: ChatMessage[];
  createdAt: Date;
  endedAt?: Date;
}

const WatchPartySchema = new Schema<IWatchParty>(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    hostUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    movieId: {
      type: Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    participants: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    currentTimestamp: {
      type: Number,
      default: 0,
    },
    isPlaying: {
      type: Boolean,
      default: false,
    },
    chatMessages: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    endedAt: Date,
  },
  {
    timestamps: true,
  }
);

export const WatchParty = mongoose.model<IWatchParty>('WatchParty', WatchPartySchema);
