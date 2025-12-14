import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import i18n from "i18n";
import connectDB from "./db.js";
import complaintRoutes from "./app/routes/complaint.routes.js";
import authRoutes from "./app/routes/auth.routes.js"; // ✅ NEW
import { detectLanguage } from "./config/i18n.js";
//import studentRoutes from "./routes/studentRoutes.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

const app = express();

// Configure i18n
i18n.configure({
  locales: ['en', 'es', 'fr', 'de', 'hi', 'ar'],
  defaultLocale: 'en',
  directory: path.join(__dirname, 'locales'),
  objectNotation: true,
  updateFiles: false,
  syncFiles: false
});

app.use(express.json());
app.use(cors());
app.use(i18n.init);
app.use(detectLanguage);
app.use(express.static(path.join(__dirname)));

// Routes
app.use('/api/complaints', complaintRoutes);
app.use('/api/auth',  authRoutes);

// Static HTML pages
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, "register.html")));
app.get("/view_complaints", (req, res) => res.sendFile(path.join(__dirname, "view_complaints.html")));
app.get("/user_complaints", (req, res) => res.sendFile(path.join(__dirname, "user_complaints.html")));

app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Complaint Management System is running",
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
