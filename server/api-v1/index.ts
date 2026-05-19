import express from "express";
import chatRouter from "./chat";
import completionRouter from "./completion";
import providersRouter from "./providers";

const apiV1Router = express.Router();

// Mount routers under /llm prefix
apiV1Router.use("/llm/chat", chatRouter);
apiV1Router.use("/llm/completion", completionRouter);
apiV1Router.use("/providers", providersRouter);

export default apiV1Router;
