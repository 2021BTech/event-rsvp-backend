import { Request, Response } from 'express';
import User from '../models/user.model';
import Event from '../models/event.model';

// GET /admin/users?page=1&limit=10
export const getAllUsers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().select('-password').skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  res.json({
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: users,
  });
};

// GET /admin/events?page=1&limit=10
export const getAllEventsWithRSVPs = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    Event.find().skip(skip).limit(limit),
    Event.countDocuments(),
  ]);

  res.json({
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: events,
  });
};

// DELETE /admin/users/:id
export const deleteUser = async (req: Request, res: Response) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
};

// DELETE /admin/events/:id
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete event' });
  }
};
