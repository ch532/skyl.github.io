import { 
  users, 
  navigationHistory, 
  bookmarks, 
  appSettings,
  posts,
  comments,
  userProfile,
  categories,
  userActivity,
  type User, 
  type InsertUser,
  type NavigationHistory,
  type InsertHistory,
  type Bookmark,
  type InsertBookmark,
  type AppSettings,
  type InsertSettings,
  type Post,
  type InsertPost,
  type Comment,
  type InsertComment,
  type UserProfile,
  type InsertUserProfile,
  type Category,
  type InsertCategory,
  type UserActivity,
  type InsertUserActivity
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  addToHistory(history: InsertHistory): Promise<NavigationHistory>;
  getHistory(userId?: number, limit?: number): Promise<NavigationHistory[]>;
  
  addBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  getBookmarks(userId?: number): Promise<Bookmark[]>;
  removeBookmark(id: number): Promise<boolean>;
  
  getSettings(userId?: number): Promise<AppSettings | undefined>;
  updateSettings(settings: InsertSettings): Promise<AppSettings>;
  
  // Posts
  createPost(post: InsertPost): Promise<Post>;
  getPosts(limit?: number, userId?: number): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post>;
  deletePost(id: number): Promise<boolean>;
  likePost(postId: number, userId: number): Promise<void>;
  
  // Comments
  createComment(comment: InsertComment): Promise<Comment>;
  getComments(postId: number): Promise<Comment[]>;
  deleteComment(id: number): Promise<boolean>;
  
  // User Profile
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // Categories
  createCategory(category: InsertCategory): Promise<Category>;
  getCategories(): Promise<Category[]>;
  
  // User Activity
  logActivity(activity: InsertUserActivity): Promise<UserActivity>;
  getUserActivity(userId: number, limit?: number): Promise<UserActivity[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private history: Map<number, NavigationHistory>;
  private bookmarks: Map<number, Bookmark>;
  private settings: Map<number, AppSettings>;
  private currentId: number;
  private historyId: number;
  private bookmarkId: number;
  private settingsId: number;

  constructor() {
    this.users = new Map();
    this.history = new Map();
    this.bookmarks = new Map();
    this.settings = new Map();
    this.currentId = 1;
    this.historyId = 1;
    this.bookmarkId = 1;
    this.settingsId = 1;
    
    // Initialize with default guest user
    this.createUser({ username: "guest", password: "guest" });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async addToHistory(insertHistory: InsertHistory): Promise<NavigationHistory> {
    const id = this.historyId++;
    const history: NavigationHistory = {
      id,
      ...insertHistory,
      userId: insertHistory.userId ?? null,
      visitedAt: new Date(),
    };
    this.history.set(id, history);
    return history;
  }

  async getHistory(userId?: number, limit: number = 50): Promise<NavigationHistory[]> {
    const allHistory = Array.from(this.history.values());
    const filtered = userId 
      ? allHistory.filter(h => h.userId === userId)
      : allHistory;
    
    return filtered
      .sort((a, b) => b.visitedAt.getTime() - a.visitedAt.getTime())
      .slice(0, limit);
  }

  async addBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.bookmarkId++;
    const bookmark: Bookmark = {
      id,
      ...insertBookmark,
      userId: insertBookmark.userId ?? null,
      createdAt: new Date(),
    };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }

  async getBookmarks(userId?: number): Promise<Bookmark[]> {
    const allBookmarks = Array.from(this.bookmarks.values());
    const filtered = userId 
      ? allBookmarks.filter(b => b.userId === userId)
      : allBookmarks;
    
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async removeBookmark(id: number): Promise<boolean> {
    return this.bookmarks.delete(id);
  }

  async getSettings(userId?: number): Promise<AppSettings | undefined> {
    return Array.from(this.settings.values()).find(s => s.userId === (userId ?? null));
  }

  async updateSettings(insertSettings: InsertSettings): Promise<AppSettings> {
    const existing = await this.getSettings(insertSettings.userId ?? undefined);
    if (existing) {
      const updated = { ...existing, ...insertSettings, userId: insertSettings.userId ?? null };
      this.settings.set(existing.id, updated);
      return updated;
    } else {
      const id = this.settingsId++;
      const settings: AppSettings = {
        id,
        ...insertSettings,
        userId: insertSettings.userId ?? null,
        notificationsEnabled: insertSettings.notificationsEnabled ?? true,
        offlineMode: insertSettings.offlineMode ?? false,
        theme: insertSettings.theme ?? "light",
      };
      this.settings.set(id, settings);
      return settings;
    }
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async addToHistory(insertHistory: InsertHistory): Promise<NavigationHistory> {
    const [history] = await db
      .insert(navigationHistory)
      .values(insertHistory)
      .returning();
    return history;
  }

  async getHistory(userId?: number, limit: number = 50): Promise<NavigationHistory[]> {
    const query = db.select().from(navigationHistory);
    
    if (userId) {
      return await query
        .where(eq(navigationHistory.userId, userId))
        .orderBy(desc(navigationHistory.visitedAt))
        .limit(limit);
    }
    
    return await query
      .orderBy(desc(navigationHistory.visitedAt))
      .limit(limit);
  }

  async addBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const [bookmark] = await db
      .insert(bookmarks)
      .values(insertBookmark)
      .returning();
    return bookmark;
  }

  async getBookmarks(userId?: number): Promise<Bookmark[]> {
    const query = db.select().from(bookmarks);
    
    if (userId) {
      return await query
        .where(eq(bookmarks.userId, userId))
        .orderBy(desc(bookmarks.createdAt));
    }
    
    return await query.orderBy(desc(bookmarks.createdAt));
  }

  async removeBookmark(id: number): Promise<boolean> {
    const result = await db.delete(bookmarks).where(eq(bookmarks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getSettings(userId?: number): Promise<AppSettings | undefined> {
    if (!userId) return undefined;
    
    const [settings] = await db.select().from(appSettings).where(eq(appSettings.userId, userId));
    return settings || undefined;
  }

  async updateSettings(insertSettings: InsertSettings): Promise<AppSettings> {
    const userId = insertSettings.userId;
    if (!userId) {
      throw new Error("User ID is required for settings");
    }

    const existing = await this.getSettings(userId);
    
    if (existing) {
      const [updated] = await db
        .update(appSettings)
        .set(insertSettings)
        .where(eq(appSettings.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(appSettings)
        .values(insertSettings)
        .returning();
      return created;
    }
  }

  // Posts
  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(insertPost)
      .returning();
    return post;
  }

  async getPosts(limit: number = 20, userId?: number): Promise<Post[]> {
    const query = db.select().from(posts);
    
    if (userId) {
      return await query
        .where(eq(posts.userId, userId))
        .orderBy(desc(posts.createdAt))
        .limit(limit);
    }
    
    return await query
      .where(eq(posts.isPublished, true))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async updatePost(id: number, updatePost: Partial<InsertPost>): Promise<Post> {
    const [post] = await db
      .update(posts)
      .set({ ...updatePost, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return post;
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async likePost(postId: number, userId: number): Promise<void> {
    const currentPost = await this.getPost(postId);
    const newLikes = (currentPost?.likes || 0) + 1;
    
    await db
      .update(posts)
      .set({ likes: newLikes })
      .where(eq(posts.id, postId));
    
    await this.logActivity({
      userId,
      action: "like",
      targetId: postId,
      targetType: "post",
      metadata: JSON.stringify({ postId })
    });
  }

  // Comments
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
    return comment;
  }

  async getComments(postId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
  }

  async deleteComment(id: number): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // User Profile
  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const [profile] = await db
      .insert(userProfile)
      .values(insertProfile)
      .returning();
    return profile;
  }

  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, userId));
    return profile || undefined;
  }

  async updateUserProfile(userId: number, updateProfile: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [profile] = await db
      .update(userProfile)
      .set(updateProfile)
      .where(eq(userProfile.userId, userId))
      .returning();
    return profile;
  }

  // Categories
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  // User Activity
  async logActivity(insertActivity: InsertUserActivity): Promise<UserActivity> {
    const [activity] = await db
      .insert(userActivity)
      .values(insertActivity)
      .returning();
    return activity;
  }

  async getUserActivity(userId: number, limit: number = 20): Promise<UserActivity[]> {
    return await db
      .select()
      .from(userActivity)
      .where(eq(userActivity.userId, userId))
      .orderBy(desc(userActivity.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
