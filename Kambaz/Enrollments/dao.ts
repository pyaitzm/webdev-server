import { v4 as uuidv4 } from "uuid";
import type database from "../Database";

export default function EnrollmentsDao(db: typeof database) {
  function enrollUserInCourse(userId: string, courseId: string) {
    if (
      !db.enrollments.some((e) => e.user === userId && e.course === courseId)
    ) {
      db.enrollments.push({ _id: uuidv4(), user: userId, course: courseId });
    }
  }
  function unenrollUserFromCourse(userId: string, courseId: string) {
    db.enrollments = db.enrollments.filter(
      (e) => !(e.user === userId && e.course === courseId),
    );
  }
  return { enrollUserInCourse, unenrollUserFromCourse };
}
