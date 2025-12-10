import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'new_content' | 're_engagement' | 'recommendation' | 'system';
  title: string;
  message: string;
  data?: {
    movieId?: string;
    actionUrl?: string;
  };
  scheduledFor: Date;
  sentAt?: Date;
  readAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['new_content', 're_engagement', 'recommendation', 'system'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      movieId: String,
      actionUrl: String,
    },
    scheduledFor: {
      type: Date,
      default: Date.now,
    },
    sentAt: Date,
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, readAt: 1 });
NotificationSchema.index({ scheduledFor: 1, sentAt: 1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
