import express, { Request, Response, NextFunction, json } from "express";
import userRouter from "./routers/user";
import cors from "cors";

const app = express(); // express 객체 받아옴

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("Hi! This is my first express server");
}); // HTTP GET method 정의
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use(json());
app.use("/user", userRouter);

app.listen("8000", () => {
  console.log(`
    #############################################
        🛡️ Server listening on port: 8000 🛡️
    #############################################    
    `);
});
