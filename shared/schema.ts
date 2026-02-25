import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  serial,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============ USERS ============
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp").notNull().unique(),
  role: text("role").notNull().default("student"),
  isPremium: boolean("is_premium").notNull().default(false),
  isRestricted: boolean("is_restricted").notNull().default(false),
  isSecondTimer: boolean("is_second_timer").notNull().default(false),
  hscRoll: text("hsc_roll").notNull(),
  hscReg: text("hsc_reg").notNull(),
  hscYear: text("hsc_year").notNull(),
  hscGroup: text("hsc_group").notNull(),
  hscBoard: text("hsc_board").notNull(),
  sscRoll: text("ssc_roll").notNull(),
  sscReg: text("ssc_reg").notNull(),
  sscYear: text("ssc_year").notNull(),
  sscGroup: text("ssc_group").notNull(),
  sscBoard: text("ssc_board").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ============ HERO BANNERS ============
export const heroBanners = pgTable("hero_banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  isVisible: boolean("is_visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertHeroBannerSchema = createInsertSchema(heroBanners).omit({
  id: true,
  createdAt: true,
});

export type InsertHeroBanner = z.infer<typeof insertHeroBannerSchema>;
export type HeroBanner = typeof heroBanners.$inferSelect;

// ============ COURSES ============
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  bannerImage: text("banner_image"),
  lastDate: timestamp("last_date"),
  price: real("price").notNull().default(0),
  offerPrice: real("offer_price"),
  access: text("access").notNull().default("all"),
  isVisible: boolean("is_visible").notNull().default(true),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// ============ MOCK TESTS ============
export const mockTests = pgTable("mock_tests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  tag: text("tag").notNull(),
  publishTime: timestamp("publish_time").notNull(),
  duration: integer("duration").notNull().default(60),
  questions: jsonb("questions").notNull(),
  access: text("access").notNull().default("all"),
  isVisible: boolean("is_visible").notNull().default(true),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMockTestSchema = createInsertSchema(mockTests).omit({
  id: true,
  createdAt: true,
});

export type InsertMockTest = z.infer<typeof insertMockTestSchema>;
export type MockTest = typeof mockTests.$inferSelect;

// ============ MOCK SUBMISSIONS ============
export const mockSubmissions = pgTable("mock_submissions", {
  id: serial("id").primaryKey(),
  mockTestId: integer("mock_test_id").notNull(),
  userId: integer("user_id").notNull(),
  answers: jsonb("answers").notNull(),
  totalMarks: real("total_marks"),
  engPMarks: real("engp_marks"),
  engOMarks: real("engo_marks"),
  asMarks: real("as_marks"),
  psMarks: real("ps_marks"),
  netMarks: real("net_marks"),
  passed: boolean("passed"),
  isSubmitted: boolean("is_submitted").notNull().default(false),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  submittedAt: timestamp("submitted_at"),
});

export const insertMockSubmissionSchema = createInsertSchema(mockSubmissions).omit({
  id: true,
  startedAt: true,
});

export type InsertMockSubmission = z.infer<typeof insertMockSubmissionSchema>;
export type MockSubmission = typeof mockSubmissions.$inferSelect;

// ============ CLASSES ============
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  videoUrl: text("video_url").notNull(),
  tag: text("tag").notNull(),
  access: text("access").notNull().default("all"),
  isVisible: boolean("is_visible").notNull().default(true),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
});

export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classes.$inferSelect;

// ============ RESOURCES ============
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  tag: text("tag").notNull(),
  access: text("access").notNull().default("all"),
  isVisible: boolean("is_visible").notNull().default(true),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
});

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

// ============ NOTICES ============
export const notices = pgTable("notices", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tag: text("tag").notNull(),
  url: text("url"),
  date: timestamp("date"),
  isVisible: boolean("is_visible").notNull().default(true),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNoticeSchema = createInsertSchema(notices).omit({
  id: true,
  createdAt: true,
});

export type InsertNotice = z.infer<typeof insertNoticeSchema>;
export type Notice = typeof notices.$inferSelect;

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

// ============ TEAM MEMBERS ============
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  post: text("post").notNull(),
  photo: text("photo"),
  description: text("description"),
  socials: jsonb("socials"),
  sortOrder: integer("sort_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
});

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

// ============ SITE SETTINGS ============
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
  id: true,
});

export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;

// ============ ENROLLMENTS ============
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  createdAt: true,
});

export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;

// ============ RELATIONS ============
export const usersRelations = relations(users, ({ many }) => ({
  submissions: many(mockSubmissions),
  enrollments: many(enrollments),
}));

export const mockTestsRelations = relations(mockTests, ({ many }) => ({
  submissions: many(mockSubmissions),
}));

export const mockSubmissionsRelations = relations(mockSubmissions, ({ one }) => ({
  user: one(users, { fields: [mockSubmissions.userId], references: [users.id] }),
  mockTest: one(mockTests, { fields: [mockSubmissions.mockTestId], references: [mockTests.id] }),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  enrollments: many(enrollments),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, { fields: [enrollments.userId], references: [users.id] }),
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
}));

// ============ QUESTION TYPE ============
export interface MockQuestion {
  id: number;
  passage: string | null;
  section: "EngP" | "EngO" | "AS" | "PS";
  question: string;
  image: string | null;
  options: string[];
  correctAnswer: number;
}

// Bangladesh education boards
export const BANGLADESH_BOARDS = [
  "Dhaka",
  "Rajshahi",
  "Chittagong",
  "Comilla",
  "Jessore",
  "Sylhet",
  "Dinajpur",
  "Barisal",
  "Mymensingh",
  "Madrasah",
  "Technical",
] as const;

export const HSC_GROUPS = ["Business Studies", "Science", "Humanities"] as const;

export const MOCK_TAGS = ["CU Mock", "English", "Analytical Skill", "Problem Solving"] as const;
export const CLASS_TAGS = ["English", "Analytical Skill", "Problem Solving"] as const;
export const RESOURCE_TAGS = ["CU QB", "English", "Analytical Skill", "Problem Solving"] as const;
export const NOTICE_TAGS = ["Admission", "CU Notice", "Crack-CU Notice"] as const;

export const ACCESS_LEVELS = ["all", "signin", "paid"] as const;
export const USER_ROLES = ["student", "mentor", "moderator", "admin"] as const;
