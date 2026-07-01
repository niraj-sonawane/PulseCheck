import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import coachRoutes from "./routes/coachRoutes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/coach", coachRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "PulseCheck API Running",
  });
});

export default app;