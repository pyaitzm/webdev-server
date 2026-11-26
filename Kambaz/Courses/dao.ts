import { v4 as uuidv4 } from "uuid";
import type database from "../Database";

type Database = typeof database;
type Course = Database["courses"][number];

export default function CoursesDao(db: Database) {
  function findAllCourses() {
    return db.courses;
  }
  function findCoursesForEnrolledUser(userId: string) {
    return db.courses.filter((course) =>
      db.enrollments.some((e) => e.user === userId && e.course === course._id),
    );
  }
  function createCourse(course: Course) {
    const newCourse = { ...course, _id: uuidv4() };
    db.courses = [...db.courses, newCourse];
    return newCourse;
  }
  function deleteCourse(courseId: string) {
    db.courses = db.courses.filter((course) => course._id !== courseId);
    db.enrollments = db.enrollments.filter((e) => e.course !== courseId);
  }
  function updateCourse(courseId: string, courseUpdates: Partial<Course>) {
    const course = db.courses.find((c) => c._id === courseId);
    if (!course) return;
    Object.assign(course, courseUpdates, { _id: courseId });
    return course;
  }
  return {
    findAllCourses,
    findCoursesForEnrolledUser,
    createCourse,
    deleteCourse,
    updateCourse,
  };
}
