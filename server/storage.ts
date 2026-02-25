import {
  type User, type InsertUser,
  type HeroBanner, type InsertHeroBanner,
  type Course, type InsertCourse,
  type MockTest, type InsertMockTest,
  type MockSubmission, type InsertMockSubmission,
  type Class, type InsertClass,
  type Resource, type InsertResource,
  type Notice, type InsertNotice,
  type TeamMember, type InsertTeamMember,
  type Enrollment, type InsertEnrollment,
  type SiteSetting,
  users, heroBanners, courses, mockTests, mockSubmissions, classes, resources, notices, teamMembers, enrollments, siteSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWhatsapp(whatsapp: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  bulkUpdateUsersByYear(hscYear: string, sscYear: string, data: Partial<User>): Promise<number>;

  getHeroBanners(): Promise<HeroBanner[]>;
  getAllHeroBanners(): Promise<HeroBanner[]>;
  createHeroBanner(data: InsertHeroBanner): Promise<HeroBanner>;

  getLatestCourses(limit: number): Promise<Course[]>;
  getAllCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(data: InsertCourse): Promise<Course>;

  getLatestMockTests(limit: number): Promise<MockTest[]>;
  getAllMockTests(): Promise<MockTest[]>;
  getMockTest(id: number): Promise<MockTest | undefined>;
  createMockTest(data: InsertMockTest): Promise<MockTest>;

  getLatestClasses(limit: number, offset?: number): Promise<{ items: Class[], total: number }>;
  getAllClasses(): Promise<Class[]>;
  createClass(data: InsertClass): Promise<Class>;

  getLatestResources(limit: number): Promise<Resource[]>;
  getAllResources(): Promise<Resource[]>;
  createResource(data: InsertResource): Promise<Resource>;

  getLatestNotices(limit: number): Promise<Notice[]>;
  getAllNotices(): Promise<Notice[]>;
  createNotice(data: InsertNotice): Promise<Notice>;

  getTeamMembers(): Promise<TeamMember[]>;
  getAllTeamMembers(): Promise<TeamMember[]>;
  createTeamMember(data: InsertTeamMember): Promise<TeamMember>;

  createSubmission(data: InsertMockSubmission): Promise<MockSubmission>;
  getSubmission(id: number): Promise<MockSubmission | undefined>;
  getUserSubmissions(userId: number): Promise<MockSubmission[]>;
  getSubmissionsByMockTestId(mockTestId: number): Promise<any[]>;
  updateSubmission(id: number, data: Partial<MockSubmission>): Promise<MockSubmission | undefined>;

  updateCourse(id: number, data: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;

  updateMockTest(id: number, data: Partial<MockTest>): Promise<MockTest | undefined>;
  deleteMockTest(id: number): Promise<boolean>;

  updateClass(id: number, data: Partial<Class>): Promise<Class | undefined>;
  deleteClass(id: number): Promise<boolean>;

  updateResource(id: number, data: Partial<Resource>): Promise<Resource | undefined>;
  deleteResource(id: number): Promise<boolean>;

  updateNotice(id: number, data: Partial<Notice>): Promise<Notice | undefined>;
  deleteNotice(id: number): Promise<boolean>;

  updateHeroBanner(id: number, data: Partial<HeroBanner>): Promise<HeroBanner | undefined>;
  deleteHeroBanner(id: number): Promise<boolean>;

  updateTeamMember(id: number, data: Partial<TeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: number): Promise<boolean>;

  createEnrollment(data: InsertEnrollment): Promise<Enrollment>;
  getUserEnrollments(userId: number): Promise<Enrollment[]>;
  getEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined>;
  updateEnrollment(id: number, data: Partial<Enrollment>): Promise<Enrollment | undefined>;
  getEnrollmentsByCourseId(courseId: number): Promise<Enrollment[]>;
  getAllEnrollments(): Promise<Enrollment[]>;

  getSetting(key: string): Promise<SiteSetting | undefined>;
  setSetting(key: string, value: any): Promise<SiteSetting>;

  getStats(): Promise<Record<string, number>>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByWhatsapp(whatsapp: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.whatsapp, whatsapp));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async bulkUpdateUsersByYear(hscYear: string, sscYear: string, data: Partial<User>): Promise<number> {
    const conditions = [];
    if (hscYear) conditions.push(eq(users.hscYear, hscYear));
    if (sscYear) conditions.push(eq(users.sscYear, sscYear));
    if (conditions.length === 0) return 0;
    const result = await db.update(users).set(data).where(and(...conditions)).returning();
    return result.length;
  }

  async getHeroBanners(): Promise<HeroBanner[]> {
    return db.select().from(heroBanners).where(eq(heroBanners.isVisible, true)).orderBy(heroBanners.sortOrder);
  }

  async getAllHeroBanners(): Promise<HeroBanner[]> {
    return db.select().from(heroBanners).orderBy(heroBanners.sortOrder);
  }

  async createHeroBanner(data: InsertHeroBanner): Promise<HeroBanner> {
    const [banner] = await db.insert(heroBanners).values(data).returning();
    return banner;
  }

  async getLatestCourses(limit: number): Promise<Course[]> {
    return db.select().from(courses).where(eq(courses.isVisible, true)).orderBy(desc(courses.createdAt)).limit(limit);
  }

  async getAllCourses(): Promise<Course[]> {
    return db.select().from(courses).orderBy(desc(courses.createdAt));
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(data: InsertCourse): Promise<Course> {
    const [course] = await db.insert(courses).values(data).returning();
    return course;
  }

  async getLatestMockTests(limit: number): Promise<MockTest[]> {
    return db.select().from(mockTests).where(eq(mockTests.isVisible, true)).orderBy(desc(mockTests.createdAt)).limit(limit);
  }

  async getAllMockTests(): Promise<MockTest[]> {
    return db.select().from(mockTests).orderBy(desc(mockTests.createdAt));
  }

  async getMockTest(id: number): Promise<MockTest | undefined> {
    const [test] = await db.select().from(mockTests).where(eq(mockTests.id, id));
    return test;
  }

  async createMockTest(data: InsertMockTest): Promise<MockTest> {
    const [test] = await db.insert(mockTests).values(data).returning();
    return test;
  }

  async getLatestClasses(limit: number, offset: number = 0): Promise<{ items: Class[], total: number }> {
    const [totalCount] = await db.select({ count: count() }).from(classes).where(eq(classes.isVisible, true));
    const items = await db.select().from(classes).where(eq(classes.isVisible, true)).orderBy(desc(classes.createdAt)).limit(limit).offset(offset);
    return { items, total: Number(totalCount.count) };
  }

  async getAllClasses(): Promise<Class[]> {
    return db.select().from(classes).orderBy(desc(classes.createdAt));
  }

  async createClass(data: InsertClass): Promise<Class> {
    const [cls] = await db.insert(classes).values(data).returning();
    return cls;
  }

  async getLatestResources(limit: number): Promise<Resource[]> {
    return db.select().from(resources).where(eq(resources.isVisible, true)).orderBy(desc(resources.createdAt)).limit(limit);
  }

  async getAllResources(): Promise<Resource[]> {
    return db.select().from(resources).orderBy(desc(resources.createdAt));
  }

  async createResource(data: InsertResource): Promise<Resource> {
    const [resource] = await db.insert(resources).values(data).returning();
    return resource;
  }

  async getLatestNotices(limit: number): Promise<Notice[]> {
    return db.select().from(notices).where(eq(notices.isVisible, true)).orderBy(desc(notices.createdAt)).limit(limit);
  }

  async getAllNotices(): Promise<Notice[]> {
    return db.select().from(notices).orderBy(desc(notices.createdAt));
  }

  async createNotice(data: InsertNotice): Promise<Notice> {
    const [notice] = await db.insert(notices).values(data).returning();
    return notice;
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    return db.select().from(teamMembers).where(eq(teamMembers.isVisible, true)).orderBy(teamMembers.sortOrder);
  }

  async getAllTeamMembers(): Promise<TeamMember[]> {
    return db.select().from(teamMembers).orderBy(teamMembers.sortOrder);
  }

  async createTeamMember(data: InsertTeamMember): Promise<TeamMember> {
    const [member] = await db.insert(teamMembers).values(data).returning();
    return member;
  }

  async updateCourse(id: number, data: Partial<Course>): Promise<Course | undefined> {
    const [course] = await db.update(courses).set(data).where(eq(courses.id, id)).returning();
    return course;
  }

  async deleteCourse(id: number): Promise<boolean> {
    const result = await db.delete(courses).where(eq(courses.id, id));
    return true;
  }

  async updateMockTest(id: number, data: Partial<MockTest>): Promise<MockTest | undefined> {
    const [test] = await db.update(mockTests).set(data).where(eq(mockTests.id, id)).returning();
    return test;
  }

  async deleteMockTest(id: number): Promise<boolean> {
    await db.delete(mockSubmissions).where(eq(mockSubmissions.mockTestId, id));
    await db.delete(mockTests).where(eq(mockTests.id, id));
    return true;
  }

  async updateClass(id: number, data: Partial<Class>): Promise<Class | undefined> {
    const [cls] = await db.update(classes).set(data).where(eq(classes.id, id)).returning();
    return cls;
  }

  async deleteClass(id: number): Promise<boolean> {
    await db.delete(classes).where(eq(classes.id, id));
    return true;
  }

  async updateResource(id: number, data: Partial<Resource>): Promise<Resource | undefined> {
    const [resource] = await db.update(resources).set(data).where(eq(resources.id, id)).returning();
    return resource;
  }

  async deleteResource(id: number): Promise<boolean> {
    await db.delete(resources).where(eq(resources.id, id));
    return true;
  }

  async updateNotice(id: number, data: Partial<Notice>): Promise<Notice | undefined> {
    const [notice] = await db.update(notices).set(data).where(eq(notices.id, id)).returning();
    return notice;
  }

  async deleteNotice(id: number): Promise<boolean> {
    await db.delete(notices).where(eq(notices.id, id));
    return true;
  }

  async updateHeroBanner(id: number, data: Partial<HeroBanner>): Promise<HeroBanner | undefined> {
    const [banner] = await db.update(heroBanners).set(data).where(eq(heroBanners.id, id)).returning();
    return banner;
  }

  async deleteHeroBanner(id: number): Promise<boolean> {
    await db.delete(heroBanners).where(eq(heroBanners.id, id));
    return true;
  }

  async updateTeamMember(id: number, data: Partial<TeamMember>): Promise<TeamMember | undefined> {
    const [member] = await db.update(teamMembers).set(data).where(eq(teamMembers.id, id)).returning();
    return member;
  }

  async deleteTeamMember(id: number): Promise<boolean> {
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
    return true;
  }

  async createSubmission(data: InsertMockSubmission): Promise<MockSubmission> {
    const [sub] = await db.insert(mockSubmissions).values(data).returning();
    return sub;
  }

  async getSubmission(id: number): Promise<MockSubmission | undefined> {
    const [sub] = await db.select().from(mockSubmissions).where(eq(mockSubmissions.id, id));
    return sub;
  }

  async getUserSubmissions(userId: number): Promise<MockSubmission[]> {
    return db.select().from(mockSubmissions).where(eq(mockSubmissions.userId, userId)).orderBy(desc(mockSubmissions.startedAt));
  }

  async getSubmissionsByMockTestId(mockTestId: number): Promise<any[]> {
    const rows = await db
      .select({
        id: mockSubmissions.id,
        mockTestId: mockSubmissions.mockTestId,
        userId: mockSubmissions.userId,
        totalMarks: mockSubmissions.totalMarks,
        engPMarks: mockSubmissions.engPMarks,
        engOMarks: mockSubmissions.engOMarks,
        asMarks: mockSubmissions.asMarks,
        psMarks: mockSubmissions.psMarks,
        netMarks: mockSubmissions.netMarks,
        passed: mockSubmissions.passed,
        isSubmitted: mockSubmissions.isSubmitted,
        submittedAt: mockSubmissions.submittedAt,
        startedAt: mockSubmissions.startedAt,
        username: users.username,
        fullName: users.fullName,
        whatsapp: users.whatsapp,
      })
      .from(mockSubmissions)
      .innerJoin(users, eq(mockSubmissions.userId, users.id))
      .where(eq(mockSubmissions.mockTestId, mockTestId))
      .orderBy(desc(mockSubmissions.submittedAt));
    return rows;
  }

  async updateSubmission(id: number, data: Partial<MockSubmission>): Promise<MockSubmission | undefined> {
    const [sub] = await db.update(mockSubmissions).set(data).where(eq(mockSubmissions.id, id)).returning();
    return sub;
  }

  async createEnrollment(data: InsertEnrollment): Promise<Enrollment> {
    const [enrollment] = await db.insert(enrollments).values(data).returning();
    return enrollment;
  }

  async getUserEnrollments(userId: number): Promise<Enrollment[]> {
    return db.select().from(enrollments).where(eq(enrollments.userId, userId)).orderBy(desc(enrollments.createdAt));
  }

  async getEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined> {
    const [enrollment] = await db.select().from(enrollments).where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)));
    return enrollment;
  }

  async updateEnrollment(id: number, data: Partial<Enrollment>): Promise<Enrollment | undefined> {
    const [updated] = await db.update(enrollments).set(data).where(eq(enrollments.id, id)).returning();
    return updated;
  }

  async getEnrollmentsByCourseId(courseId: number): Promise<Enrollment[]> {
    return db.select().from(enrollments).where(eq(enrollments.courseId, courseId)).orderBy(desc(enrollments.createdAt));
  }

  async getAllEnrollments(): Promise<Enrollment[]> {
    return db.select().from(enrollments).orderBy(desc(enrollments.createdAt));
  }

  async getSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting;
  }

  async setSetting(key: string, value: any): Promise<SiteSetting> {
    const existing = await this.getSetting(key);
    if (existing) {
      const [updated] = await db.update(siteSettings).set({ value }).where(eq(siteSettings.key, key)).returning();
      return updated;
    }
    const [setting] = await db.insert(siteSettings).values({ key, value }).returning();
    return setting;
  }

  async getStats(): Promise<Record<string, number>> {
    const [[userCount], [courseCount], [testCount], [classCount], [resourceCount], [noticeCount]] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(courses),
      db.select({ count: count() }).from(mockTests),
      db.select({ count: count() }).from(classes),
      db.select({ count: count() }).from(resources),
      db.select({ count: count() }).from(notices),
    ]);
    return {
      users: userCount.count,
      courses: courseCount.count,
      mockTests: testCount.count,
      classes: classCount.count,
      resources: resourceCount.count,
      notices: noticeCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
