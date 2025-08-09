import { Request, Response } from 'express';
import Event from '../models/event.model';
import User from '../models/user.model';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';
import { sendEmail } from '../utils/mailer';


// Create a new event
export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, description, date, maxAttendees } = req.body;

    if (!title || !description || !date || !maxAttendees || !req.body.location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const imageUrl = (req.file as any)?.path || null;

    // Parse location (JSON string if sent as form-data stringified)
    const location = typeof req.body.location === 'string'
      ? JSON.parse(req.body.location)
      : req.body.location;

    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      maxAttendees: Number(maxAttendees),
      image: imageUrl,
      location: {
        address: location.address,
        lat: Number(location.lat),
        lng: Number(location.lng),
      },
    });

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    console.error("Create Event Error:", error);
    res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};




// Update (edit) an existing event
export const editEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const { title, description, date, maxAttendees, image } = req.body;
    const location = typeof req.body.location === 'string'
      ? JSON.parse(req.body.location)
      : req.body.location;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Update fields if present
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = new Date(date);
    if (maxAttendees) event.maxAttendees = Number(maxAttendees);
    if (image) event.image = image;

    if (location) {
      event.location = {
        address: location.address,
        lat: Number(location.lat),
        lng: Number(location.lng),
      };
    }

    if (req.file) {
      event.image = (req.file as any).path;
    }

    await event.save();

    res.status(200).json({ message: 'Event updated successfully', event });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: 'Failed to update event' });
  }
};




// Get event by ID
export const getEventById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event" });
  }
};



// Get all events
export const getEvents = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const events = await Event.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ date: 1 });

    const total = await Event.countDocuments();
    res.json({
      events,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch events' });
  }
};

// RSVP to an event
export const rsvpEvent = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const { status } = req.body;

  const allowedStatuses = ["Going", "Maybe", "Can't Go"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid RSVP status" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const existing = event.attendees.find((a) => a.email === user.email);
    if (existing) return res.status(400).json({ message: "Already RSVPd" });

    if (event.attendees.length >= event.maxAttendees && status === "Going") {
      return res.status(400).json({ message: "Event is full" });
    }

    const attendeeId = status === "Going" ? new mongoose.Types.ObjectId().toString() : undefined;

    const newAttendee = {
      name: user.name,
      email: user.email,
      status,
      _id: attendeeId, // optional: to match MongoDB format
    };

    event.attendees.push(newAttendee);
    await event.save();

    // Build email content
    const subject = `RSVP Confirmation - ${event.title}`;
    const html = `
      <p>Hi ${user.name},</p>
      <p>You have successfully RSVPd as <strong>${status}</strong> for the event <strong>${event.title}</strong>.</p>
      ${
        status === "Going"
          ? `<p>Your Attendee ID: <strong>${attendeeId}</strong></p>`
          : ""
      }
      <p>Event Date: ${event.date.toDateString()}</p>
      <p>Location: ${event.location.address}</p>
      <br/>
      <p>Thanks,<br/>Event RSVP Team</p>
    `;

    await sendEmail(user.email, subject, html);

    res.status(200).json({ message: "RSVP successful", event });
  } catch (err) {
    console.error("RSVP error:", err);
    res.status(500).json({ message: "RSVP failed" });
  }
};





// Get attendees of an event
export const getAttendees = async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const total = event.attendees.length;
    const attendees = event.attendees.slice((page - 1) * limit, page * limit);

    res.json({
      attendees,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch attendees' });
  }
};


//getRsvpStatus

export const getRSVPSummary = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.query; // optional filter (e.g., ?status=Going)
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const allowedStatuses = ["Going", "Maybe", "Can't Go"];

  try {
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    let filtered = event.attendees;

    // Optional filter by RSVP status
    if (status && typeof status === "string") {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid RSVP status" });
      }
      filtered = filtered.filter((a) => a.status === status);
    }

    // Paginate filtered attendees
    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    // Summary counts for all statuses (regardless of filter)
    const summary = {
      going: event.attendees.filter((a) => a.status === "Going").length,
      maybe: event.attendees.filter((a) => a.status === "Maybe").length,
      cantGo: event.attendees.filter((a) => a.status === "Can't Go").length,
    };

    res.status(200).json({
      summary,
      attendees: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      statusFilter: status || "All",
    });
  } catch (err) {
    console.error("RSVP Summary error:", err);
    res.status(500).json({ message: "Failed to get RSVP summary" });
  }
};
