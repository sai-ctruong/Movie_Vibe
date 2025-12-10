import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  preferences: {
    favoriteGenres: string[];
    language: string;
    notificationSettings: {
      email: boolean;
      push: boolean;
      optimalTimes: string[];
    };
  };
  subscription: {
    plan: 'free' | 'premium';
    startDate: Date;
    endDate?: Date;
  };
  churnRisk?: {
    score: number;
    lastCalculated: Date;
    factors: string[];
  };
  lastActive: Date;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    preferences: {
      favoriteGenres: {
        type: [String],
        default: [],
      },
      language: {
        type: String,
        default: 'en',
      },
      notificationSettings: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
        optimalTimes: {
          type: [String],
          default: ['19:00', '21:00'],
        },
      },
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free',
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: Date,
    },
    churnRisk: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      lastCalculated: Date,
      factors: [String],
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance (email already has unique: true, no need for separate index)
UserSchema.index({ role: 1 });
UserSchema.index({ 'subscription.plan': 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
