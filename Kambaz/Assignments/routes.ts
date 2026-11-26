import type { Express, Request, Response } from "express";
import type database from "../Database";
import AssignmentsDao from "./dao";

export default function AssignmentRoutes(app: Express, db: typeof database) {
  const dao = AssignmentsDao(db);
  const findAssignmentsForCourse = (
    req: Request<{ courseId: string }>,
    res: Response,
  ) => {
    res.json(dao.findAssignmentsForCourse(req.params.courseId));
  };
  const createAssignmentForCourse = (
    req: Request<{ courseId: string }>,
    res: Response,
  ) => {
    res.json(
      dao.createAssignment({ ...req.body, course: req.params.courseId }),
    );
  };
  const updateAssignment = (
    req: Request<{ assignmentId: string }>,
    res: Response,
  ) => {
    const saved = dao.updateAssignment(req.params.assignmentId, req.body);
    if (!saved) {
      res.status(404).json({ message: "Assignment not found" });
      return;
    }
    res.json(saved);
  };
  const deleteAssignment = (
    req: Request<{ assignmentId: string }>,
    res: Response,
  ) => {
    dao.deleteAssignment(req.params.assignmentId);
    res.sendStatus(200);
  };
  app.get("/api/courses/:courseId/assignments", findAssignmentsForCourse);
  app.post("/api/courses/:courseId/assignments", createAssignmentForCourse);
  app.put("/api/assignments/:assignmentId", updateAssignment);
  app.delete("/api/assignments/:assignmentId", deleteAssignment);
}
