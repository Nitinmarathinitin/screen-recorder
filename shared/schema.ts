import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const recordings = pgTable("recordings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  filePath: text("file_path").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  duration: integer("duration"), // in seconds
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertRecordingSchema = createInsertSchema(recordings).omit({ 
  id: true, 
  createdAt: true 
});

// === EXPLICIT API CONTRACT TYPES ===
export type Recording = typeof recordings.$inferSelect;
export type InsertRecording = z.infer<typeof insertRecordingSchema>;

export type CreateRecordingRequest = InsertRecording;
export type UpdateRecordingRequest = Partial<InsertRecording>;

export type RecordingResponse = Recording;
export type RecordingsListResponse = Recording[];
