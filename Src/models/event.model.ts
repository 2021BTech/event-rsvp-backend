import mongoose, { Schema, Document } from "mongoose";
import { Attendee } from "../types/event.types";

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  maxAttendees: number;
  attendees: Attendee[];
  image?: string;
  location: {
    address: string;
    lat?: number;
    lng?: number;
  };
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
  image: String,
  location: {
    address: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number },
  },
});

export default mongoose.model<IEvent>("Event", eventSchema);
