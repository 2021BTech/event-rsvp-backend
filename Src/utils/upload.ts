import multer from "multer";
import { storage } from "./cloudinary";

const upload = multer({ storage });

export default upload;
