import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { AuthRequest } from '../middleware/auth';
import { sendEmail } from '../utils/mailer';

const JWT_SECRET = process.env.JWT_SECRET!;

// Register a new user
export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const allowedRoles = ['user', 'admin'];
    const finalRole = allowedRoles.includes(role) ? role : 'user';

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: finalRole });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    // Send welcome email
    await sendEmail(
      email,
      'Welcome to EventFlow RSVP!🎉',
      `<h3>Hi ${name},</h3>
       <p>Thanks for registering with us. We're excited to have you onboard!</p>
       <p><strong>Next Steps:</strong> Visit your dashboard and start RSVPing!</p>`
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
};




// Login an existing user
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: (user as any).name, 
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
};


// Get current user details
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

