import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({ 
  dest: uploadDir,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve uploaded files statically
  app.use("/uploads", express.static(uploadDir));

  app.get(api.recordings.list.path, async (req, res) => {
    const recordings = await storage.getRecordings();
    res.json(recordings);
  });

  app.get(api.recordings.get.path, async (req, res) => {
    const recording = await storage.getRecording(Number(req.params.id));
    if (!recording) {
      return res.status(404).json({ message: "Recording not found" });
    }
    res.json(recording);
  });

  app.post(api.recordings.upload.path, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Rename file to include extension if possible, or just keep it
      // For simplicity, we'll keep the multer generated filename but store mime type
      
      const recording = await storage.createRecording({
        title: req.body.title || "Untitled Recording",
        filePath: `/uploads/${req.file.filename}`,
        mimeType: req.file.mimetype,
        size: req.file.size,
        duration: req.body.duration ? parseInt(req.body.duration) : null,
        quality: req.body.quality || "1080p",
        hasWebcam: req.body.hasWebcam === "true" ? 1 : 0,
      });

      res.status(201).json(recording);
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Failed to process upload" });
    }
  });

  app.delete(api.recordings.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const recording = await storage.getRecording(id);
    
    if (!recording) {
      return res.status(404).json({ message: "Recording not found" });
    }

    // Attempt to delete the file
    try {
      const filename = path.basename(recording.filePath);
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.error("Failed to delete file:", e);
      // Continue to delete DB record even if file deletion fails
    }

    await storage.deleteRecording(id);
    res.status(204).send();
  });

  return httpServer;
}
