import type { Express, Request, Response } from "express";
import type database from "../Database";
import CoursesDao from "./dao";
import EnrollmentsDao from "../Enrollments/dao";

export default function CourseRoutes(app: Express, db: typeof database) {
  const dao = CoursesDao(db);
  const enrollmentsDao = EnrollmentsDao(db);

  const findAllCourses = (req: Request, res: Response) => {
    res.json(dao.findAllCourses());
  };
  const findCoursesForEnrolledUser = (
    req: Request<{ userId: string }>,
    res: Response,
  ) => {
    let { userId } = req.params;
    if (userId === "current") {
      const currentUser = req.session.currentUser;
      if (!currentUser || !db.users.some((u) => u._id === currentUser._id)) {
        res.sendStatus(401);
        return;
      }
      userId = currentUser._id;
    }
    res.json(dao.findCoursesForEnrolledUser(userId));
  };
  const createCourse = (req: Request, res: Response) => {
    const currentUser = req.session.currentUser;
    if (!currentUser || !db.users.some((u) => u._id === currentUser._id)) {
      res.sendStatus(401);
      return;
    }
    const newCourse = dao.createCourse(req.body);
    enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
    res.json(newCourse);
  };
  const deleteCourse = (req: Request<{ courseId: string }>, res: Response) => {
    dao.deleteCourse(req.params.courseId);
    res.sendStatus(200);
  };
  const updateCourse = (req: Request<{ courseId: string }>, res: Response) => {
    const saved = dao.updateCourse(req.params.courseId, req.body);
    if (!saved) {
      res.sendStatus(404);
      return;
    }
    res.json(saved);
  };
  app.get("/api/courses", findAllCourses);
  app.get("/api/users/:userId/courses", findCoursesForEnrolledUser);
  app.post("/api/users/current/courses", createCourse);
  app.delete("/api/courses/:courseId", deleteCourse);
  app.put("/api/courses/:courseId", updateCourse);
}
