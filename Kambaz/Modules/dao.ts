import { v4 as uuidv4 } from "uuid";
import type database from "../Database";

type Database = typeof database;
type CourseModule = Database["modules"][number];

export default function ModulesDao(db: Database) {
  function findModulesForCourse(courseId: string) {
    return db.modules.filter((module) => module.course === courseId);
  }

  function createModule(
    module: Pick<CourseModule, "name" | "course"> & Partial<CourseModule>,
  ) {
    const newModule = {
      description: "",
      lessons: [],
      ...module,
      _id: uuidv4(),
    };
    db.modules = [...db.modules, newModule];
    return newModule;
  }

  function deleteModule(moduleId: string) {
    db.modules = db.modules.filter((module) => module._id !== moduleId);
  }

  function updateModule(
    moduleId: string,
    moduleUpdates: Partial<CourseModule>,
  ) {
    const module = db.modules.find((module) => module._id === moduleId);
    if (!module) return;
    Object.assign(module, moduleUpdates, {
      _id: moduleId,
      course: module.course,
    });
    return module;
  }

  return { findModulesForCourse, createModule, deleteModule, updateModule };
}
