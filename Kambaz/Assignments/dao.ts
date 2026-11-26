import { v4 as uuidv4 } from "uuid";
import type database from "../Database";

type Database = typeof database;
type Assignment = Database["assignments"][number] & { until?: string };

export default function AssignmentsDao(db: Database) {
  const findAssignmentsForCourse = (courseId: string) =>
    db.assignments.filter((assignment) => assignment.course === courseId);

  const createAssignment = (assignment: Omit<Assignment, "_id">) => {
    const created = { ...assignment, _id: uuidv4() };
    db.assignments = [...db.assignments, created];
    return created;
  };

  const updateAssignment = (
    assignmentId: string,
    updates: Partial<Assignment>,
  ) => {
    const assignment = db.assignments.find((item) => item._id === assignmentId);
    if (!assignment) return;
    Object.assign(assignment, updates, {
      _id: assignmentId,
      course: assignment.course,
    });
    return assignment;
  };

  const deleteAssignment = (assignmentId: string) => {
    db.assignments = db.assignments.filter((item) => item._id !== assignmentId);
  };

  return {
    findAssignmentsForCourse,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  };
}
