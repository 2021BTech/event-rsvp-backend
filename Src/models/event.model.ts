import mongoose, { Schema, Document } from "mongoose";
import { Attendee } from "../types/event.types";


export enum RSVPStatus {
  GOING = "Going",
  MAYBE = "Maybe",
  CANT_GO = "Can't Go"
}

export interface Rsvp {
  userId: string;
  eventId: string;
  status: RSVPStatus;
}

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
  status: {
      type: String,
      enum: Object.values(RSVPStatus),
      default: RSVPStatus.GOING,
    },
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
});

const eventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  maxAttendees: Number,
  attendees: [attendeeSchema],
  image: String,
 location: {
  address: { type: String, required: true, default: "" },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
},
});

export default mongoose.model<IEvent>("Event", eventSchema);
