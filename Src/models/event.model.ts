import mongoose, { Schema, Document } from 'mongoose';
import { Attendee } from '../types/event.types';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  maxAttendees: number;
  attendees: Attendee[];
}

const attendeeSchema = new Schema<Attendee>({
  name: String,
  email: String,
  timestamp: { type: Date, default: Date.now },
});

const eventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  maxAttendees: Number,
  attendees: [attendeeSchema],
});

export default mongoose.model<IEvent>('Event', eventSchema);
