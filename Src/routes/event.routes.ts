import express from 'express';
import {
  createEvent,
  rsvpEvent,
  getEvents,
  getAttendees,
  editEvent,
  getEventById,
} from '../controllers/event.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management endpoints
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: A list of events
 */
router.get('/', getEvents);

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               maxAttendees:
 *                 type: number
 *               image:
 *                 type: string
 *                 description: Base64 encoded image (data:image/jpeg;base64,...)
 *     responses:
 *       201:
 *         description: Event created
 */
router.post('/', createEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Edit an event
 *     tags: [Events]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               maxAttendees:
 *                 type: number
 *               image:
 *                 type: string
 *                 description: Base64 encoded image (data:image/jpeg;base64,...)
 *     responses:
 *       200:
 *         description: Event updated successfully
 */
router.put('/:id', editEvent);

/**
 * @swagger
 * /api/events/{id}/rsvp:
 *   post:
 *     summary: RSVP to an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: RSVP successful
 */
router.post('/:id/rsvp', protect, rsvpEvent);

/**
 * @swagger
 * /api/events/{id}/attendees:
 *   get:
 *     summary: Get attendees of an event
 *     tags: [Events]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of attendees
 */
router.get('/:id/attendees', getAttendees);

// Get a single event by ID
/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get a single event by ID
 *     tags: [Events]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 */
router.get('/:id', getEventById);

export default router;
