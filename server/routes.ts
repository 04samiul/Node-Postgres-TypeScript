import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL_REST?.trim();
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim();

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const supabase = (supabaseUrl && isValidUrl(supabaseUrl) && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const upload = multer({ storage: multer.memoryStorage() });

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}

function generateUsername(
  hscGroup: string,
  hscYear: string,
  hscRoll: string,
): string {
  const groupLetter =
    hscGroup === "Business Studies" ? "B" : hscGroup === "Science" ? "S" : "H";
  const yearSuffix = hscYear.slice(-2);
  return `${groupLetter}${yearSuffix}${hscRoll}`;
}

function parseBDTime(dateStr: string): Date | null {
  if (!dateStr) return null;
  if (
    dateStr.includes("T") &&
    !dateStr.includes("+") &&
    !dateStr.includes("Z")
  ) {
    const utcDate = new Date(dateStr + "+06:00");
    return isNaN(utcDate.getTime()) ? null : utcDate;
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function formatBDTime(date: Date): string {
  return date.toLocaleString("en-US", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: (process.env.SMTP_SECURE || "true") === "true",
  family: 4,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

transporter
  .verify()
  .then(() => {
    console.log("SMTP email service connected successfully");
  })
  .catch((err) => {
    console.error("SMTP email service error:", err.message);
  });

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  setupAuth(app);

  // ======= AUTH ROUTES =======
  app.post("/api/register", async (req, res) => {
    try {
      const {
        fullName,
        whatsapp,
        email,
        hscRoll,
        hscReg,
        hscYear,
        hscGroup,
        hscBoard,
        sscRoll,
        sscReg,
        sscYear,
        sscGroup,
        sscBoard,
        password,
      } = req.body;

      if (
        !fullName ||
        !whatsapp ||
        !email ||
        !hscRoll ||
        !hscReg ||
        !hscYear ||
        !hscGroup ||
        !hscBoard ||
        !sscRoll ||
        !sscReg ||
        !sscYear ||
        !sscGroup ||
        !sscBoard ||
        !password
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existingWhatsapp = await storage.getUserByWhatsapp(whatsapp);
      if (existingWhatsapp) {
        return res
          .status(400)
          .json({ message: "WhatsApp number already registered" });
      }

      const username = generateUsername(hscGroup, hscYear, hscRoll);
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({
          message: "An account with these HSC credentials already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      let isSecondTimer = false;
      let isRestricted = false;
      try {
        const timerSetting = await storage.getSetting("timer_rules");
        const rules: Array<{
          hscYear: string;
          sscYear: string;
          status: string;
        }> = (timerSetting?.value as any) || [];
        let bestMatch: { specificity: number; status: string } | null = null;
        for (const rule of rules) {
          if (!rule.hscYear && !rule.sscYear) continue;
          const hscMatch = rule.hscYear ? rule.hscYear === hscYear : true;
          const sscMatch = rule.sscYear ? rule.sscYear === sscYear : true;
          if (!hscMatch || !sscMatch) continue;
          const specificity = (rule.hscYear ? 1 : 0) + (rule.sscYear ? 1 : 0);
          if (!bestMatch || specificity > bestMatch.specificity) {
            bestMatch = { specificity, status: rule.status };
          }
        }
        if (bestMatch) {
          isSecondTimer = bestMatch.status === "2nd_timer";
        }
      } catch (_e) {}

      const user = await storage.createUser({
        username,
        password: hashedPassword,
        fullName,
        email,
        whatsapp,
        hscRoll,
        hscReg,
        hscYear,
        hscGroup,
        hscBoard,
        sscRoll,
        sscReg,
        sscYear,
        sscGroup,
        sscBoard,
        role: "student",
        isPremium: false,
        isRestricted: isRestricted,
        isSecondTimer: isSecondTimer,
      });

      req.session.userId = user.id;

      try {
        await transporter.sendMail({
          from: `"Crack-CU" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "Welcome to Crack-CU!",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
              <p style="font-size: 16px;">Hi! <strong>${fullName}</strong>,</p>
              <p>Your registration on <strong>Crack-CU</strong> is complete.</p>
              <p>Here are your account details:</p>
              <p><strong>Username:</strong> <strong  style="color: #eb202a;">${username}</strong></p>
              <p><strong>You're:</strong> <strong>${isSecondTimer ? "2nd Timer" : "1st Timer"}</strong></p>
              <p>Please save this information for future access.</p>
              <br/>
              <p>If you face any issues, contact us via WhatsApp.</p>
              <p>WhatsApp: <a href="https://wa.me/8801522132809" style="color: #eb202a; font-weight: bold;">+8801522132809</a></p>
              <br/>
              <p>We're ready when you are.</p>
              <br/>
              <p>Regards,<br/><strong>Crack-CU Team</strong><br/>Don't Just Study, Crack It!</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send welcome email:", emailErr);
      }

      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser, username });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { identifier, password, loginType } = req.body;

      let user;
      if (loginType === "whatsapp") {
        user = await storage.getUserByWhatsapp(identifier);
      } else {
        user = await storage.getUserByUsername(identifier);
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.isRestricted) {
        return res.status(403).json({
          message: "Your account has been restricted. Contact support.",
        });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;

      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Login failed" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/user", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  // ======= PUBLIC ROUTES =======
  app.get("/api/hero-banners", async (_req, res) => {
    const banners = await storage.getHeroBanners();
    res.json(banners);
  });

  app.get("/api/courses", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 100;
    const courses = await storage.getLatestCourses(limit);
    res.json(courses);
  });

  app.get("/api/mock-tests", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 100;
    const mockTests = await storage.getLatestMockTests(limit);
    const sanitized = mockTests.map(({ questions, ...rest }) => rest);
    res.json(sanitized);
  });

  app.get("/api/classes", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 100;
    const classItems = await storage.getLatestClasses(limit);
    res.json(classItems);
  });

  app.get("/api/resources", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 100;
    const resourceItems = await storage.getLatestResources(limit);
    res.json(resourceItems);
  });

  app.get("/api/notices", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 100;
    const noticeItems = await storage.getLatestNotices(limit);
    res.json(noticeItems);
  });

  app.get("/api/team-members", async (_req, res) => {
    const members = await storage.getTeamMembers();
    res.json(members);
  });

  // ======= CONTACT =======
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      await transporter.sendMail({
        from: `"Crack-CU Contact" <${process.env.SMTP_USER}>`,
        replyTo: `"${name}" <${email}>`,
        to: process.env.SMTP_USER || "crackcu.info@gmail.com",
        subject: subject || "Contact Form Message",
        html: `<h3>New Contact Form Message</h3><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Subject:</strong> ${subject || "N/A"}</p><p><strong>Message:</strong></p><p>${message}</p>`,
      });
      res.json({ message: "Message sent successfully" });
    } catch (error: any) {
      console.error("Contact form error:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // ======= AUTHENTICATED USER ROUTES =======
  app.get("/api/mock-tests/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const test = await storage.getMockTest(id);
      if (!test || !test.isVisible)
        return res.status(404).json({ message: "Mock test not found" });
      const publishDate = new Date(test.publishTime);
      if (publishDate.getTime() > Date.now()) {
        return res
          .status(403)
          .json({ message: "This mock test hasn't started yet" });
      }
      if (test.access === "paid") {
        const user = await storage.getUser(req.session.userId!);
        if (!user?.isPremium) {
          return res.status(403).json({
            message: "This is a premium mock test. Upgrade to access it.",
          });
        }
      }
      res.json(test);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/my-submissions", requireAuth, async (req, res) => {
    const submissions = await storage.getUserSubmissions(req.session.userId!);
    const allTests = await storage.getAllMockTests();
    const testMap = new Map(allTests.map((t) => [t.id, t.title]));
    const enriched = submissions.map((s) => ({
      ...s,
      mockTestTitle: testMap.get(s.mockTestId) || `Mock #${s.mockTestId}`,
    }));
    res.json(enriched);
  });

  app.get(
    "/api/my-submissions/:submissionId/review",
    requireAuth,
    async (req, res) => {
      try {
        const submissionId = parseInt(req.params.submissionId);
        const submissions = await storage.getUserSubmissions(
          req.session.userId!,
        );
        const submission = submissions.find((s) => s.id === submissionId);
        if (!submission)
          return res.status(404).json({ message: "Submission not found" });
        if (!submission.isSubmitted)
          return res
            .status(400)
            .json({ message: "Submission not yet completed" });

        const test = await storage.getMockTest(submission.mockTestId);
        if (!test)
          return res.status(404).json({ message: "Mock test not found" });

        res.json({
          submission,
          mockTest: {
            id: test.id,
            title: test.title,
            questions: test.questions,
          },
        });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  app.patch("/api/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const {
        fullName,
        email,
        hscRoll,
        hscReg,
        hscGroup,
        hscBoard,
        sscRoll,
        sscReg,
        sscGroup,
        sscBoard,
      } = req.body;
      const updateData: any = {};
      if (fullName !== undefined) updateData.fullName = fullName;
      if (email !== undefined) updateData.email = email;
      if (hscRoll !== undefined) updateData.hscRoll = hscRoll;
      if (hscReg !== undefined) updateData.hscReg = hscReg;
      if (hscGroup !== undefined) updateData.hscGroup = hscGroup;
      if (hscBoard !== undefined) updateData.hscBoard = hscBoard;
      if (sscRoll !== undefined) updateData.sscRoll = sscRoll;
      if (sscReg !== undefined) updateData.sscReg = sscReg;
      if (sscGroup !== undefined) updateData.sscGroup = sscGroup;
      if (sscBoard !== undefined) updateData.sscBoard = sscBoard;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      const updated = await storage.updateUser(userId, updateData);
      if (!updated) return res.status(404).json({ message: "User not found" });
      const { password: _, ...safeUser } = updated;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/my-enrollments", requireAuth, async (req, res) => {
    const enrollmentList = await storage.getUserEnrollments(
      req.session.userId!,
    );
    const allCourses = await storage.getAllCourses();
    const enriched = enrollmentList.map((e) => {
      const course = allCourses.find((c) => c.id === e.courseId);
      return { ...e, courseTitle: course?.title || "" };
    });
    res.json(enriched);
  });

  app.post("/api/enroll/:courseId", requireAuth, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const course = await storage.getCourse(courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });
      if (course.access === "paid") {
        const user = await storage.getUser(req.session.userId!);
        if (!user?.isPremium) {
          return res.status(403).json({
            message: "This is a premium course. Upgrade to access it.",
          });
        }
      }
      const existing = await storage.getEnrollment(
        req.session.userId!,
        courseId,
      );
      if (existing && existing.status !== "declined") {
        return res.status(400).json({
          message:
            existing.status === "approved"
              ? "Already enrolled"
              : "Enrollment request already pending",
        });
      }
      let enrollment;
      if (existing && existing.status === "declined") {
        enrollment = await storage.updateEnrollment(existing.id, {
          status: "pending",
        });
      } else {
        enrollment = await storage.createEnrollment({
          userId: req.session.userId!,
          courseId,
          status: "pending",
        });
      }

      const user = await storage.getUser(req.session.userId!);
      if (user) {
        try {
          await transporter.sendMail({
            from: `"Crack-CU" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER || "crackcu.info@gmail.com",
            subject: `New Enrollment Request - ${course.title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                <p>Hi!</p>
                <p><strong>${user.username}</strong>, wants to enroll in <strong>${course.title}</strong></p>
                <br/>
                <p><strong>User Details:</strong></p>
                <table style="border-collapse: collapse; width: 100%;">
                  <tr><td style="padding: 6px 12px; border: 1px solid #e5e7eb;"><strong>Full Name</strong></td><td style="padding: 6px 12px; border: 1px solid #e5e7eb;">${user.fullName}</td></tr>
                  <tr><td style="padding: 6px 12px; border: 1px solid #e5e7eb;"><strong>Username</strong></td><td style="padding: 6px 12px; border: 1px solid #e5e7eb;">${user.username}</td></tr>
                  <tr><td style="padding: 6px 12px; border: 1px solid #e5e7eb;"><strong>Email</strong></td><td style="padding: 6px 12px; border: 1px solid #e5e7eb;">${user.email}</td></tr>
                  <tr><td style="padding: 6px 12px; border: 1px solid #e5e7eb;"><strong>HSC Roll</strong></td><td style="padding: 6px 12px; border: 1px solid #e5e7eb;">${user.hscRoll}</td></tr>
                  <tr><td style="padding: 6px 12px; border: 1px solid #e5e7eb;"><strong>HSC Reg</strong></td><td style="padding: 6px 12px; border: 1px solid #e5e7eb;">${user.hscReg}</td></tr>
                  <tr><td style="padding: 6px 12px; border: 1px solid #e5e7eb;"><strong>HSC Year</strong></td><td style="padding: 6px 12px; border: 1px solid #e5e7eb;">${user.hscYear}</td></tr>
                  <tr><td style="padding: 6px 12px; border: 1px solid #e5e7eb;"><strong>HSC Group</strong></td><td style="padding: 6px 12px; border: 1px solid #e5e7eb;">${user.hscGroup}</td></tr>
                  <tr><td style="padding: 6px 12px; border: 1px solid #e5e7eb;"><strong>HSC Board</strong></td><td style="padding: 6px 12px; border: 1px solid #e5e7eb;">${user.hscBoard}</td></tr>
                  <tr><td style="padding: 6px 12px; border: 1px solid #e5e7eb;"><strong>SSC Roll</strong></td><td style="padding: 6px 12px; border: 1px solid #e5e7eb;">${user.sscRoll}</td></tr>
                  <tr><td style="padding: 6px 12px; border: 1px solid #e5e7eb;"><strong>SSC Reg</strong></td><td style="padding: 6px 12px; border: 1px solid #e5e7eb;">${user.sscReg}</td></tr>
                  <tr><td style="padding: 6px 12px; border: 1px solid #e5e7eb;"><strong>SSC Year</strong></td><td style="padding: 6px 12px; border: 1px solid #e5e7eb;">${user.sscYear}</td></tr>
                  <tr><td style="padding: 6px 12px; border: 1px solid #e5e7eb;"><strong>SSC Group</strong></td><td style="padding: 6px 12px; border: 1px solid #e5e7eb;">${user.sscGroup}</td></tr>
                  <tr><td style="padding: 6px 12px; border: 1px solid #e5e7eb;"><strong>SSC Board</strong></td><td style="padding: 6px 12px; border: 1px solid #e5e7eb;">${user.sscBoard}</td></tr>
                </table>
                <br/>
                <p><strong>User WhatsApp Number:</strong> <a href="https://wa.me/${user.whatsapp?.replace(/\D/g, "")}">${user.whatsapp}</a></p>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error(
            "Failed to send enrollment notification email:",
            emailErr,
          );
        }
      }

      res.json(enrollment);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Enrollment failed" });
    }
  });

  // ======= MOCK TEST SUBMISSION & GRADING =======
  app.post("/api/mock-tests/:id/submit", requireAuth, async (req, res) => {
    try {
      const mockTestId = parseInt(req.params.id);
      const userId = req.session.userId!;
      const { answers } = req.body;

      if (!answers || typeof answers !== "object") {
        return res.status(400).json({ message: "Answers are required" });
      }

      const test = await storage.getMockTest(mockTestId);
      if (!test)
        return res.status(404).json({ message: "Mock test not found" });

      const questions = Array.isArray(test.questions)
        ? (test.questions as any[])
        : [];
      if (questions.length === 0) {
        return res
          .status(400)
          .json({ message: "This mock test has no questions" });
      }

      const validSections = ["EngP", "EngO", "AS", "PS"];
      for (const [qId, ans] of Object.entries(answers)) {
        if (
          ans !== null &&
          ans !== -1 &&
          (typeof ans !== "number" || ans < 0 || ans > 3)
        ) {
          return res
            .status(400)
            .json({ message: `Invalid answer for question ${qId}` });
        }
      }

      const submittingUser = await storage.getUser(userId);
      const isSecondTimer = submittingUser?.isSecondTimer ?? false;

      const existingSubs = await storage.getUserSubmissions(userId);
      const prevSubmissions = existingSubs.filter(
        (s) => s.mockTestId === mockTestId && s.isSubmitted,
      );
      const attemptNumber = prevSubmissions.length + 1;

      // Grading rules:
      // EngP: +2 correct, -0.5 wrong | EngO: +1 correct, -0.25 wrong
      // English pass mark: 13 (applied to EngP+EngO total)
      // AS: +2 correct, -0.5 wrong, pass 10
      // PS: +2 correct, -0.5 wrong, pass 10
      // Overall pass: 40
      // 2nd timer penalty: -3 (based on user's isSecondTimer flag)

      const markingRules: Record<
        string,
        { correct: number; wrong: number; pass: number }
      > = {
        EngP: { correct: 2, wrong: -0.5, pass: 13 },
        EngO: { correct: 1, wrong: -0.25, pass: 0 },
        AS: { correct: 2, wrong: -0.5, pass: 10 },
        PS: { correct: 2, wrong: -0.5, pass: 10 },
      };

      let engPMarks = 0,
        engOMarks = 0,
        asMarks = 0,
        psMarks = 0;

      for (const q of questions) {
        const userAnswer = answers[String(q.id)];
        const section = q.section as string;
        const rules = markingRules[section];
        if (!rules) continue;

        if (
          userAnswer === undefined ||
          userAnswer === null ||
          userAnswer === -1
        ) {
          continue;
        }

        const isCorrect = userAnswer === q.correctAnswer;
        const mark = isCorrect ? rules.correct : rules.wrong;

        if (section === "EngP") engPMarks += mark;
        else if (section === "EngO") engOMarks += mark;
        else if (section === "AS") asMarks += mark;
        else if (section === "PS") psMarks += mark;
      }

      let totalMarks = engPMarks + engOMarks + asMarks + psMarks;
      let netMarks = totalMarks;

      if (isSecondTimer) {
        netMarks -= 3;
      }

      const englishTotal = engPMarks + engOMarks;
      const passedEnglish = englishTotal >= 13;
      const passedAS = asMarks >= markingRules.AS.pass;
      const passedPS = psMarks >= markingRules.PS.pass;
      const passedOverall = netMarks >= 40;
      const passed = passedEnglish && passedAS && passedPS && passedOverall;

      const submission = await storage.createSubmission({
        mockTestId,
        userId,
        answers,
        totalMarks,
        engPMarks,
        engOMarks,
        asMarks,
        psMarks,
        netMarks,
        passed,
        isSubmitted: true,
        submittedAt: new Date(),
      });

      // Send email notification
      try {
        const user = await storage.getUser(userId);
        if (user?.email) {
          const statusColor = passed ? "#059669" : "#eb202a";
          const statusText = passed ? "PASSED" : "NOT PASSED";
          await transporter.sendMail({
            from: `"Crack-CU" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: `Mock Test Result: ${test.title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #eb202a;">Crack-CU Mock Test Result</h2>
                <p>Hi ${user.fullName},</p>
                <p>You have submitted <strong>${test.title}</strong>. Here are your results:</p>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                  <tr style="background: #f3f4f6;"><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>English Passage (EngP)</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">${engPMarks.toFixed(2)}</td></tr>
                  <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>English Other (EngO)</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">${engOMarks.toFixed(2)}</td></tr>
                  <tr style="background: #e0f2fe;"><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>English Total (EngP+EngO)</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">${englishTotal.toFixed(2)} ${passedEnglish ? "(Pass)" : "(Fail, need 13)"}</td></tr>
                  <tr style="background: #f3f4f6;"><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Analytical Skill (AS)</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">${asMarks.toFixed(2)} ${passedAS ? "(Pass)" : "(Fail, need 10)"}</td></tr>
                  <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Problem Solving (PS)</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">${psMarks.toFixed(2)} ${passedPS ? "(Pass)" : "(Fail, need 10)"}</td></tr>
                  <tr style="background: #f3f4f6;"><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Total Marks</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">${totalMarks.toFixed(2)}</td></tr>
                  ${isSecondTimer ? `<tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>2nd Timer Penalty</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">-3</td></tr>` : ""}
                  <tr style="background: #1f2937; color: white;"><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Net Marks</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">${netMarks.toFixed(2)}</td></tr>
                </table>
                <p style="font-size: 18px; font-weight: bold; color: ${statusColor};">Status: ${statusText}</p>
                <p style="color: #6b7280; font-size: 14px;">${isSecondTimer ? "2nd Timer" : "1st Timer"} | Attempt #${attemptNumber} | Submitted at: ${formatBDTime(new Date())} (BST)</p>
                <hr style="margin: 20px 0;" />
                <p style="color: #6b7280; font-size: 12px;">Don't Just Study, Crack It! - Crack-CU</p>
              </div>
            `,
          });
        }
      } catch (emailErr) {
        console.error("Failed to send submission email:", emailErr);
      }

      res.json(submission);
    } catch (error: any) {
      console.error("Submission error:", error);
      res.status(500).json({ message: error.message || "Submission failed" });
    }
  });

  // ======= ADMIN ROUTES =======
  app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    const allUsers = await storage.getAllUsers();
    const safeUsers = allUsers.map(({ password, ...rest }) => rest);
    res.json(safeUsers);
  });

  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { role, isPremium, isRestricted, isSecondTimer, hscYear, sscYear } =
        req.body;
      const updateData: any = {};
      if (role !== undefined) updateData.role = role;
      if (isPremium !== undefined) updateData.isPremium = isPremium;
      if (isRestricted !== undefined) updateData.isRestricted = isRestricted;
      if (isSecondTimer !== undefined) updateData.isSecondTimer = isSecondTimer;
      if (hscYear !== undefined) updateData.hscYear = hscYear;
      if (sscYear !== undefined) updateData.sscYear = sscYear;

      const previousUser = await storage.getUser(id);
      const updated = await storage.updateUser(id, updateData);
      if (!updated) return res.status(404).json({ message: "User not found" });

      if (isPremium === true && previousUser && !previousUser.isPremium) {
        try {
          await transporter.sendMail({
            from: `"Crack-CU" <${process.env.SMTP_USER}>`,
            to: updated.email,
            subject: "Congratulations! You're Now a Premium Member - Crack-CU",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #eb202a, #c41820); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Premium!</h1>
                </div>
                <div style="padding: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                  <p style="font-size: 16px;">Hi <strong>${updated.fullName}</strong>,</p>
                  <p>Congratulations! Your account has been upgraded to <strong style="color: #eb202a;">Premium</strong>.</p>
                  <p>You now have access to:</p>
                  <ul style="padding-left: 20px; line-height: 1.8;">
                    <li>All premium mock tests</li>
                    <li>Exclusive study resources</li>
                    <li>Premium video classes</li>
                    <li>Premium courses</li>
                  </ul>
                  <p style="margin-top: 20px; padding: 12px; background: #fef3c7; border-radius: 6px; text-align: center; font-weight: bold; color: #92400e;">
                    Don't Just Study, Crack It!
                  </p>
                  <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
                  <p style="color: #6b7280; font-size: 12px; text-align: center;">Crack-CU - Chittagong University Admission Prep</p>
                </div>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error("Failed to send premium email:", emailErr);
        }
      }

      const { password: _, ...safeUser } = updated;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post(
    "/api/admin/users/:id/reset-password",
    requireAdmin,
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
          return res
            .status(400)
            .json({ message: "Password must be at least 6 characters" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updated = await storage.updateUser(id, {
          password: hashedPassword,
        });
        if (!updated)
          return res.status(404).json({ message: "User not found" });
        res.json({ message: "Password reset successfully" });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  app.get("/api/admin/timer-rules", requireAdmin, async (_req, res) => {
    try {
      const setting = await storage.getSetting("timer_rules");
      res.json(setting?.value || []);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/bulk-assign", requireAdmin, async (req, res) => {
    try {
      const { hscYear, sscYear, action } = req.body;
      if (!hscYear && !sscYear) {
        return res.status(400).json({
          message: "At least one year filter (HSC or SSC) is required",
        });
      }
      if (
        !action ||
        !["1st_timer", "2nd_timer", "restricted"].includes(action)
      ) {
        return res.status(400).json({
          message:
            "Invalid action. Must be 1st_timer, 2nd_timer, or restricted",
        });
      }

      const updateData: any = {};
      if (action === "1st_timer") {
        updateData.isSecondTimer = false;
        updateData.isRestricted = false;
      } else if (action === "2nd_timer") {
        updateData.isSecondTimer = true;
        updateData.isRestricted = false;
      } else if (action === "restricted") {
        updateData.isRestricted = true;
      }

      const count = await storage.bulkUpdateUsersByYear(
        hscYear || "",
        sscYear || "",
        updateData,
      );

      if (action === "1st_timer" || action === "2nd_timer") {
        const existingSetting = await storage.getSetting("timer_rules");
        const rules: Array<{
          hscYear: string;
          sscYear: string;
          status: string;
        }> = (existingSetting?.value as any) || [];
        const filteredRules = rules.filter((r: any) => {
          if (hscYear && sscYear)
            return !(r.hscYear === hscYear && r.sscYear === sscYear);
          if (hscYear) return !(r.hscYear === hscYear && !r.sscYear);
          return !(r.sscYear === sscYear && !r.hscYear);
        });
        filteredRules.push({
          hscYear: hscYear || "",
          sscYear: sscYear || "",
          status: action,
        });
        await storage.setSetting("timer_rules", filteredRules);
      }

      res.json({
        message: `Successfully updated ${count} user(s). Rule saved for future registrations.`,
        count,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/enrollments", requireAdmin, async (req, res) => {
    try {
      const courseId = req.query.courseId
        ? parseInt(req.query.courseId as string)
        : undefined;
      let enrollmentList;
      if (courseId) {
        enrollmentList = await storage.getEnrollmentsByCourseId(courseId);
      } else {
        enrollmentList = await storage.getAllEnrollments();
      }
      const allUsers = await storage.getAllUsers();
      const allCourses = await storage.getAllCourses();
      const enriched = enrollmentList.map((e) => {
        const u = allUsers.find((u) => u.id === e.userId);
        const c = allCourses.find((c) => c.id === e.courseId);
        return {
          ...e,
          userName: u?.username || "",
          userFullName: u?.fullName || "",
          userWhatsapp: u?.whatsapp || "",
          userEmail: u?.email || "",
          courseTitle: c?.title || "",
        };
      });
      res.json(enriched);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/enrollments/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (!["approved", "declined"].includes(status)) {
        return res
          .status(400)
          .json({ message: "Status must be approved or declined" });
      }
      const updated = await storage.updateEnrollment(id, { status });
      if (!updated)
        return res.status(404).json({ message: "Enrollment not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/courses", requireAdmin, async (_req, res) => {
    res.json(await storage.getAllCourses());
  });

  app.post("/api/admin/courses", requireAdmin, async (req, res) => {
    try {
      const data = { ...req.body, createdBy: req.session.userId };
      if (data.price !== undefined) data.price = Number(data.price);
      if (data.offerPrice !== undefined)
        data.offerPrice = data.offerPrice ? Number(data.offerPrice) : null;
      if (data.lastDate !== undefined)
        data.lastDate = data.lastDate ? new Date(data.lastDate) : null;
      if (data.isVisible === undefined) data.isVisible = true;
      const course = await storage.createCourse(data);
      res.json(course);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ======= COURSES CRUD =======
  app.get("/api/admin/mock-tests", requireAdmin, async (_req, res) => {
    res.json(await storage.getAllMockTests());
  });

  app.patch("/api/admin/courses/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const {
        title,
        description,
        bannerImage,
        lastDate,
        price,
        offerPrice,
        access,
        isVisible,
      } = req.body;
      const data: Record<string, any> = {};
      if (title !== undefined) data.title = title;
      if (description !== undefined) data.description = description;
      if (bannerImage !== undefined) data.bannerImage = bannerImage || null;
      if (lastDate !== undefined)
        data.lastDate = lastDate ? new Date(lastDate) : null;
      if (price !== undefined) data.price = Number(price);
      if (offerPrice !== undefined)
        data.offerPrice =
          offerPrice === "" || offerPrice === null ? null : Number(offerPrice);
      if (access !== undefined) data.access = access;
      if (isVisible !== undefined) data.isVisible = isVisible;
      const updated = await storage.updateCourse(id, data);
      if (!updated)
        return res.status(404).json({ message: "Course not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/courses/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCourse(id);
      res.json({ message: "Deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ======= MOCK TESTS CRUD =======
  function mergeImageAssignments(
    questions: any[],
    imageAssignments?: any[],
  ): any[] {
    if (
      !imageAssignments ||
      !Array.isArray(imageAssignments) ||
      imageAssignments.length === 0
    )
      return questions;
    const imageMap = new Map<number, string>();
    for (const a of imageAssignments) {
      if (a.questionId != null && a.imageUrl) {
        imageMap.set(Number(a.questionId), a.imageUrl);
      }
    }
    return questions.map((q: any) => {
      const img = imageMap.get(Number(q.id));
      if (img) return { ...q, image: img };
      return q;
    });
  }

  app.post("/api/admin/mock-tests", requireAdmin, async (req, res) => {
    try {
      const { imageAssignments, ...rest } = req.body;
      const data = { ...rest, createdBy: req.session.userId };
      if (data.duration) data.duration = Number(data.duration);
      if (data.publishTime) {
        const parsed = parseBDTime(data.publishTime);
        if (!parsed)
          return res.status(400).json({ message: "Invalid publish time" });
        data.publishTime = parsed;
      } else {
        return res.status(400).json({ message: "Publish time is required" });
      }
      if (!data.questions) data.questions = [];
      data.questions = mergeImageAssignments(data.questions, imageAssignments);
      if (data.isVisible === undefined) data.isVisible = true;
      const test = await storage.createMockTest(data);
      res.json(test);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/mock-tests/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const {
        title,
        tag,
        publishTime,
        duration,
        questions,
        access,
        isVisible,
        imageAssignments,
      } = req.body;
      const data: Record<string, any> = {};
      if (title !== undefined) data.title = title;
      if (tag !== undefined) data.tag = tag;
      if (publishTime) {
        const parsed = parseBDTime(publishTime);
        if (!parsed)
          return res.status(400).json({ message: "Invalid publish time" });
        data.publishTime = parsed;
      }
      if (duration !== undefined) data.duration = Number(duration);
      if (questions !== undefined) {
        data.questions = mergeImageAssignments(questions, imageAssignments);
      } else if (
        imageAssignments &&
        Array.isArray(imageAssignments) &&
        imageAssignments.length > 0
      ) {
        const existing = await storage.getMockTest(id);
        if (existing && Array.isArray(existing.questions)) {
          data.questions = mergeImageAssignments(
            existing.questions as any[],
            imageAssignments,
          );
        }
      }
      if (access !== undefined) data.access = access;
      if (isVisible !== undefined) data.isVisible = isVisible;
      const updated = await storage.updateMockTest(id, data);
      if (!updated)
        return res.status(404).json({ message: "Mock test not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/mock-tests/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMockTest(id);
      res.json({ message: "Deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ======= MOCK SUBMISSIONS (Admin) =======
  app.get(
    "/api/admin/mock-tests/:id/submissions",
    requireAdmin,
    async (req, res) => {
      try {
        const mockTestId = parseInt(req.params.id);
        const submissions =
          await storage.getSubmissionsByMockTestId(mockTestId);
        res.json(submissions);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  // ======= CLASSES CRUD =======
  app.get("/api/admin/classes", requireAdmin, async (_req, res) => {
    res.json(await storage.getAllClasses());
  });

  app.post("/api/admin/classes", requireAdmin, async (req, res) => {
    try {
      const data = { ...req.body, createdBy: req.session.userId };
      if (data.isVisible === undefined) data.isVisible = true;
      const cls = await storage.createClass(data);
      res.json(cls);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/classes/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const {
        title,
        videoUrl,
        tag,
        description,
        thumbnail,
        access,
        isVisible,
      } = req.body;
      const data: Record<string, any> = {};
      if (title !== undefined) data.title = title;
      if (videoUrl !== undefined) data.videoUrl = videoUrl;
      if (tag !== undefined) data.tag = tag;
      if (description !== undefined) data.description = description;
      if (thumbnail !== undefined) data.thumbnail = thumbnail || null;
      if (access !== undefined) data.access = access;
      if (isVisible !== undefined) data.isVisible = isVisible;
      const updated = await storage.updateClass(id, data);
      if (!updated) return res.status(404).json({ message: "Class not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/classes/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteClass(id);
      res.json({ message: "Deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ======= RESOURCES CRUD =======
  app.get("/api/admin/resources", requireAdmin, async (_req, res) => {
    res.json(await storage.getAllResources());
  });

  app.post("/api/admin/resources", requireAdmin, async (req, res) => {
    try {
      const data = { ...req.body, createdBy: req.session.userId };
      if (data.isVisible === undefined) data.isVisible = true;
      const resource = await storage.createResource(data);
      res.json(resource);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/resources/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateResource(id, req.body);
      if (!updated)
        return res.status(404).json({ message: "Resource not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/resources/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteResource(id);
      res.json({ message: "Deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ======= NOTICES CRUD =======
  app.get("/api/admin/notices", requireAdmin, async (_req, res) => {
    res.json(await storage.getAllNotices());
  });

  app.post("/api/admin/notices", requireAdmin, async (req, res) => {
    try {
      const data = { ...req.body, createdBy: req.session.userId };
      if (data.isVisible === undefined) data.isVisible = true;
      if (data.date !== undefined)
        data.date = data.date ? new Date(data.date) : null;
      const notice = await storage.createNotice(data);
      res.json(notice);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/notices/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const body = { ...req.body };
      if (body.date) body.date = new Date(body.date);
      const updated = await storage.updateNotice(id, body);
      if (!updated)
        return res.status(404).json({ message: "Notice not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/notices/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNotice(id);
      res.json({ message: "Deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ======= BANNERS CRUD =======
  app.get("/api/admin/banners", requireAdmin, async (_req, res) => {
    res.json(await storage.getAllHeroBanners());
  });

  app.post("/api/admin/banners", requireAdmin, async (req, res) => {
    try {
      const data = req.body;
      if (data.sortOrder !== undefined) data.sortOrder = Number(data.sortOrder);
      if (data.isVisible === undefined) data.isVisible = true;
      const banner = await storage.createHeroBanner(data);
      res.json(banner);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/banners/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = { ...req.body };
      if (data.sortOrder !== undefined) data.sortOrder = Number(data.sortOrder);
      const updated = await storage.updateHeroBanner(id, data);
      if (!updated)
        return res.status(404).json({ message: "Banner not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/banners/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid banner ID" });
      }
      await storage.deleteHeroBanner(id);
      res.json({ message: "Deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ======= TEAM CRUD =======
  app.get("/api/admin/team", requireAdmin, async (_req, res) => {
    res.json(await storage.getAllTeamMembers());
  });

  app.post("/api/admin/team", requireAdmin, async (req, res) => {
    try {
      const data = req.body;
      if (data.sortOrder !== undefined) data.sortOrder = Number(data.sortOrder);
      if (data.isVisible === undefined) data.isVisible = true;
      const member = await storage.createTeamMember(data);
      res.json(member);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/team/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = { ...req.body };
      if (data.sortOrder !== undefined) data.sortOrder = Number(data.sortOrder);
      const updated = await storage.updateTeamMember(id, data);
      if (!updated)
        return res.status(404).json({ message: "Team member not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/team/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTeamMember(id);
      res.json({ message: "Deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ======= UPLOADS =======
  app.post("/api/uploads/request-url", requireAdmin, upload.single("file"), async (req, res) => {
    try {
      if (!supabase) {
        return res.status(500).json({ message: "Supabase storage not configured. Please check SUPABASE_URL_REST and SUPABASE_ANON_KEY." });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const file = req.file;
      const bucketName = process.env.SUPABASE_BUCKET || "Uploads";
      const fileName = `${Date.now()}-${file.originalname}`;
      
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      throw bucketsError;
    }
    
    const bucketExists = buckets.some(b => b.name === bucketName);
    if (!bucketExists) {
      console.log(`Bucket "${bucketName}" not found. Please create it manually in Supabase dashboard and set it to Public.`);
      throw new Error(`Bucket "${bucketName}" not found. Please create a PUBLIC bucket named "${bucketName}" in your Supabase storage dashboard.`);
    }

    const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      res.json({ objectPath: publicUrl });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ message: error.message || "Upload failed" });
    }
  });

  return httpServer;
}
