import path from "node:path";
import { existsSync } from "node:fs";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const FRONTEND_DIST_DIR = path.resolve(
  process.cwd(),
  "artifacts/psis/dist/public",
);

function setupProductionFrontend(app: Express): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  if (!existsSync(FRONTEND_DIST_DIR)) {
    logger.warn(
      { frontendDistDir: FRONTEND_DIST_DIR },
      "Frontend build not found; static serving disabled",
    );
    return;
  }

  const basePath = process.env.BASE_PATH ?? "/";
  const staticMount =
    basePath === "/" ? "" : basePath.replace(/\/$/, "");

  app.use(staticMount || "/", express.static(FRONTEND_DIST_DIR, { index: false }));

  app.get(`${staticMount}/*splat`, (req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }

    res.sendFile(path.join(FRONTEND_DIST_DIR, "index.html"), (err) => {
      if (err) {
        next(err);
      }
    });
  });
}

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);
setupProductionFrontend(app);

export default app;
