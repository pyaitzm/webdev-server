import "dotenv/config";
import session, { type SessionOptions } from "express-session";
import cors from "cors";
import express from "express";
import Hello from "./Hello";
import Lab5 from "./Lab5/index";
import db from "./Kambaz/Database";
import CourseRoutes from "./Kambaz/Courses/routes";
import UserRoutes from "./Kambaz/Users/routes";

import ModuleRoutes from "./Kambaz/Modules/routes";

import AssignmentRoutes from "./Kambaz/Assignments/routes";

import EnrollmentRoutes from "./Kambaz/Enrollments/routes";

const app = express();

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  }),
);

const sessionOptions: SessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false,
  saveUninitialized: false,
};
if (process.env.SERVER_ENV !== "development") {
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
  };
}
app.use(session(sessionOptions));

app.use(express.json());

UserRoutes(app, db);
CourseRoutes(app, db);
EnrollmentRoutes(app, db);
ModuleRoutes(app, db);
AssignmentRoutes(app, db);
Lab5(app);
Hello(app);

app.listen(process.env.PORT || 4000);
