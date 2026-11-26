import { v4 as uuidv4 } from "uuid";
import type database from "../Database";

type Database = typeof database;
type User = Database["users"][number];

export default function UsersDao(db: Database) {
  const findUserByCredentials = (username: string, password: string) =>
    db.users.find(
      (user) => user.username === username && user.password === password,
    );

  const findUserByUsername = (username: string) =>
    db.users.find((user) => user.username === username);

  const createUser = (user: Partial<User>) => {
    const newUser: User = {
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      email: "",
      role: "STUDENT",
      loginId: "",
      section: "",
      lastActivity: "",
      totalActivity: "",
      ...user,
      _id: uuidv4(),
    };
    db.users = [...db.users, newUser];
    return newUser;
  };

  const findUserById = (userId: string) =>
    db.users.find((user) => user._id === userId);

  const updateUser = (userId: string, user: Partial<User>) =>
    (db.users = db.users.map((u) =>
      u._id === userId ? { ...u, ...user, _id: u._id } : u,
    ));

  const findUsersForCourse = (courseId: string) =>
    db.users.filter((user) =>
      db.enrollments.some((e) => e.course === courseId && e.user === user._id),
    );

  const deleteUser = (userId: string) => {
    db.users = db.users.filter((u) => u._id !== userId);
    db.enrollments = db.enrollments.filter((e) => e.user !== userId);
  };

  return {
    findUsersForCourse,
    deleteUser,
    findUserByCredentials,
    findUserByUsername,
    createUser,
    findUserById,
    updateUser,
  };
}
