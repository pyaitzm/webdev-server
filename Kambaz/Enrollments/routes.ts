import type { Express, Request, Response } from "express";
import type database from "../Database";
import EnrollmentsDao from "./dao";
import UsersDao from "../Users/dao";

export default function EnrollmentRoutes(app: Express, db: typeof database) {
  const dao = EnrollmentsDao(db);
  const users = UsersDao(db);
  const changeEnrollment = (
    req: Request<{ userId?: string; courseId: string }>,
    res: Response,
  ) => {
    const actor = users.findUserById(req.session.currentUser?._id ?? "");
    if (!actor) {
      res.sendStatus(401);
      return;
    }
    const userId =
      !req.params.userId || req.params.userId === "current"
        ? actor._id
        : req.params.userId;
    const { courseId } = req.params;
    if (userId !== actor._id && actor.role !== "FACULTY") {
      res.sendStatus(403);
      return;
    }
    if (
      !users.findUserById(userId) ||
      !db.courses.some((c) => c._id === courseId)
    ) {
      res.sendStatus(404);
      return;
    }
    if (req.method === "POST") dao.enrollUserInCourse(userId, courseId);
    else dao.unenrollUserFromCourse(userId, courseId);
    res.sendStatus(200);
  };
  app.post("/api/users/:userId/courses/:courseId", changeEnrollment);
  app.delete("/api/users/:userId/courses/:courseId", changeEnrollment);
  // Retain the previous URL contract.
  app.post("/api/users/current/courses/:courseId/enroll", changeEnrollment);
  app.delete("/api/users/current/courses/:courseId/enroll", changeEnrollment);
}
