import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const navigationHistory = pgTable("navigation_history", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  visitedAt: timestamp("visited_at").defaultNow().notNull(),
  userId: integer("user_id"),
});

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: integer("user_id"),
});

export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  offlineMode: boolean("offline_mode").default(false),
  theme: text("theme").default("light"),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  tags: text("tags").array(),
  likes: integer("likes").default(0),
  views: integer("views").default(0),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProfile = pgTable("user_profile", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatar: text("avatar"),
  website: text("website"),
  location: text("location"),
  followers: integer("followers").default(0),
  following: integer("following").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  color: text("color").default("#3B82F6"),
  icon: text("icon").default("folder"),
});

export const userActivity = pgTable("user_activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  targetId: integer("target_id"),
  targetType: text("target_type"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertHistorySchema = createInsertSchema(navigationHistory).pick({
  url: true,
  title: true,
  userId: true,
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).pick({
  url: true,
  title: true,
  userId: true,
});

export const insertSettingsSchema = createInsertSchema(appSettings).pick({
  userId: true,
  notificationsEnabled: true,
  offlineMode: true,
  theme: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  userId: true,
  title: true,
  content: true,
  imageUrl: true,
  tags: true,
  isPublished: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  postId: true,
  userId: true,
  content: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfile).pick({
  userId: true,
  displayName: true,
  bio: true,
  avatar: true,
  website: true,
  location: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  description: true,
  color: true,
  icon: true,
});

export const insertUserActivitySchema = createInsertSchema(userActivity).pick({
  userId: true,
  action: true,
  targetId: true,
  targetType: true,
  metadata: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type NavigationHistory = typeof navigationHistory.$inferSelect;
export type InsertHistory = z.infer<typeof insertHistorySchema>;
export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type AppSettings = typeof appSettings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type UserProfile = typeof userProfile.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type UserActivity = typeof userActivity.$inferSelect;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;
