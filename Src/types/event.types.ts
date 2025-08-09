import { RSVPStatus } from "../models/event.model";

export interface Attendee {
  name: string;
  email: string;
  status?: RSVPStatus
  timestamp?: Date;
    _id?: string;
}
