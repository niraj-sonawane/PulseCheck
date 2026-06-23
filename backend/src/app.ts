import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import testRoutes from "./routes/test.routes";

const app = express();

app.use(express.json());
app.use("/api/tests", testRoutes);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "PulseCheck API Running",
  });
});

export default app;