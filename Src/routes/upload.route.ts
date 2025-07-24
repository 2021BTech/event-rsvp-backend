import express from 'express';
import { createEvent, editEvent } from "../controllers/event.controller";
import upload from "../utils/upload"; 

const router = express.Router();

router.post("/", upload.single("image"), createEvent);
router.put("/:id", upload.single("image"), editEvent);

export default router;
