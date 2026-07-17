import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { apiLimiter } from "./middleware/rateLimiter";
import authRoutes from "./routes/authRoutes";
import coachRoutes from "./routes/coachRoutes";
import clientRoutes from "./routes/clientRoutes";

const app = express();

// 1. Security headers (helmet first — before everything else)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
      },
    },
    xFrameOptions: { action: "deny" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

// 2. CORS must be before the rate limiter.
//    When the rate limiter sends a 429, CORS headers must already be set
//    otherwise the browser swallows the response and the user sees nothing.
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = process.env.CLIENT_URL || "http://localhost:3000";
      // Allow server-to-server requests (no origin) and the configured client
      if (!origin || origin === allowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// 3. General rate limiter (after CORS so 429 responses carry CORS headers)
app.use(apiLimiter);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/client", clientRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "PulseCheck API Running",
  });
});

export default app;