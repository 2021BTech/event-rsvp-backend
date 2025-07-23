import { Request, Response } from 'express';
import Event from '../models/event.model';
import { AuthRequest } from '../middleware/auth';


// Create a new event
export const createEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.create(req.body);
    res.status(200).json(event);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: 'Unknown error occurred' });
    }
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
import User from '../models/user.model';

export const rsvpEvent = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const already = event.attendees.find((a) => a.email === user.email);
    if (already) return res.status(400).json({ message: 'Already RSVPd' });

    if (event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }

    event.attendees.push({ name: user.name, email: user.email });
    await event.save();

    res.status(200).json({ message: 'RSVP successful', event });
  } catch (err) {
    res.status(500).json({ message: 'RSVP failed' });
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
