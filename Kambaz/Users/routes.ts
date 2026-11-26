import type { Express, Request, Response } from "express";
import type database from "../Database";
import UsersDao from "./dao";
import EnrollmentsDao from "../Enrollments/dao";

declare module "express-session" {
  interface SessionData {
    currentUser?: (typeof database.users)[number];
  }
}

export default function UserRoutes(app: Express, db: typeof database) {
  const dao = UsersDao(db);
  const enrollments = EnrollmentsDao(db);
  const actorFor = (req: Request) =>
    dao.findUserById(req.session.currentUser?._id ?? "");
  const publicUser = ({ password, ...user }: (typeof db.users)[number]) => user;

  const signin = (req: Request, res: Response) => {
    const { username, password } = req.body;
    const currentUser = dao.findUserByCredentials(username, password);
    if (!currentUser) {
      res.status(401).json({ message: "Unable to login. Try again later." });
      return;
    }
    req.session.currentUser = currentUser;
    res.json(currentUser);
  };

  const signup = (req: Request, res: Response) => {
    const user = dao.findUserByUsername(req.body.username);
    if (user) {
      res.status(400).json({ message: "Username already in use" });
      return;
    }
    const currentUser = dao.createUser({ ...req.body, role: "STUDENT" });
    req.session.currentUser = currentUser;
    res.json(currentUser);
  };

  const updateUser = (req: Request<{ userId: string }>, res: Response) => {
    const { userId } = req.params;
    const actor = actorFor(req);
    if (!actor) {
      res.sendStatus(401);
      return;
    }
    if (actor._id !== userId && actor.role !== "FACULTY") {
      res.sendStatus(403);
      return;
    }
    const existing = dao.findUserById(userId);
    if (!existing) {
      res.sendStatus(404);
      return;
    }
    const updates = { ...req.body };
    // Only faculty may change another user's role; nobody changes their own role here.
    if (actor._id === userId) delete updates.role;
    if (
      updates.username &&
      updates.username !== existing.username &&
      dao.findUserByUsername(updates.username)
    ) {
      res.status(400).json({ message: "Username already in use" });
      return;
    }
    dao.updateUser(userId, updates);
    const updatedUser = dao.findUserById(userId)!;
    if (actor._id === userId) {
      req.session.currentUser = updatedUser;
      res.json(updatedUser);
    } else res.json(publicUser(updatedUser));
  };

  const profile = (req: Request, res: Response) => {
    const currentUser = actorFor(req);
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    req.session.currentUser = currentUser;
    res.json(currentUser);
  };

  const findUsersForCourse = (
    req: Request<{ courseId: string }>,
    res: Response,
  ) => {
    if (!actorFor(req)) {
      res.sendStatus(401);
      return;
    }
    res.json(dao.findUsersForCourse(req.params.courseId).map(publicUser));
  };
  const createUserForCourse = (
    req: Request<{ courseId: string }>,
    res: Response,
  ) => {
    const actor = actorFor(req);
    if (!actor) {
      res.sendStatus(401);
      return;
    }
    if (actor.role !== "FACULTY") {
      res.sendStatus(403);
      return;
    }
    const { courseId } = req.params;
    if (!db.courses.some((c) => c._id === courseId)) {
      res.sendStatus(404);
      return;
    }
    const { username, password, firstName, lastName } = req.body;
    if (
      ![username, password, firstName, lastName].every(
        (v) => typeof v === "string" && v.trim(),
      )
    ) {
      res
        .status(400)
        .json({ message: "Name, username and password are required" });
      return;
    }
    if (dao.findUserByUsername(username)) {
      res.status(400).json({ message: "Username already in use" });
      return;
    }
    const created = dao.createUser(req.body);
    enrollments.enrollUserInCourse(created._id, courseId);
    res.json(publicUser(created));
  };
  const deleteUser = (req: Request<{ userId: string }>, res: Response) => {
    const actor = actorFor(req);
    if (!actor) {
      res.sendStatus(401);
      return;
    }
    if (actor.role !== "FACULTY" || actor._id === req.params.userId) {
      res.sendStatus(403);
      return;
    }
    if (!dao.findUserById(req.params.userId)) {
      res.sendStatus(404);
      return;
    }
    dao.deleteUser(req.params.userId);
    res.sendStatus(200);
  };

  const signout = (req: Request, res: Response) => {
    req.session.destroy((error) => {
      if (error) {
        res.status(500).json({ message: "Unable to sign out" });
        return;
      }
      res.sendStatus(200);
    });
  };

  app.get("/api/courses/:courseId/users", findUsersForCourse);
  app.post("/api/courses/:courseId/users", createUserForCourse);
  app.delete("/api/users/:userId", deleteUser);
  app.post("/api/users/signin", signin);
  app.post("/api/users/signup", signup);
  app.put("/api/users/:userId", updateUser);
  app.get("/api/users/profile", profile);
  app.post("/api/users/signout", signout);
}
