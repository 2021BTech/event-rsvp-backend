import express from 'express';
import {
  createEvent,
  rsvpEvent,
  getEvents,
  getAttendees,
  editEvent,
  getEventById,
  getRSVPSummary,
} from '../controllers/event.controller';
import { protect } from '../middleware/auth';
import upload from '../utils/upload'; 

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
 *         multipart/form-data:
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
 *                 type: integer
 *               location:
 *                 type: string
 *                 description: JSON string with address, lat, lng
 *                 example: '{"address": "Lekki Phase 1", "lat": 6.43, "lng": 3.45}'
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Event created
 */
router.post('/', upload.single('image'), createEvent);

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
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *                 type: integer
 *               location:
 *                 type: string
 *                 description: JSON string with address, lat, lng
 *                 example: '{"address": "Lekki Phase 1", "lat": 6.43, "lng": 3.45}'
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Event updated successfully
 */

router.put('/:id', upload.single('image'), editEvent);

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 description: RSVP status
 *                 enum: ["Going", "Maybe", "Can't Go"]
 *             example:
 *               status: "Going"
 *     responses:
 *       200:
 *         description: RSVP successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: RSVP successful
 *                 event:
 *                   $ref: '#/components/schemas/Event'
 *                 attendeeID:
 *                   type: string
 *                   description: Only returned if RSVP status is "Going"
 *                   example: "64e70b2df342bf5c5f7e5aa3"
 *       400:
 *         description: Invalid RSVP status or event full
 *       404:
 *         description: User or event not found
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

/**
 * @swagger
 * /api/events/{id}/rsvp-summary:
 *   get:
 *     summary: Get RSVP summary and (optionally) a paginated list of attendees by status
 *     tags: [Events]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["Going", "Maybe", "Can't Go"]
 *         description: Filter attendees by RSVP status
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for attendees list
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Items per page for attendees list
 *     responses:
 *       200:
 *         description: RSVP summary with optional paginated attendees
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     going:
 *                       type: integer
 *                       example: 25
 *                     maybe:
 *                       type: integer
 *                       example: 7
 *                     cantGo:
 *                       type: integer
 *                       example: 3
 *                 attendees:
 *                   type: array
 *                   description: Paginated attendees (filtered by status if provided)
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Jane Doe"
 *                       email:
 *                         type: string
 *                         example: "jane@example.com"
 *                       status:
 *                         type: string
 *                         enum: ["Going", "Maybe", "Can't Go"]
 *                         example: "Maybe"
 *                 total:
 *                   type: integer
 *                   description: Total attendees after filter (if any)
 *                   example: 7
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 statusFilter:
 *                   type: string
 *                   description: Applied status filter or "All"
 *                   example: "Maybe"
 *       404:
 *         description: Event not found
 */
router.get('/:id/rsvp-summary', getRSVPSummary);

export default router;
