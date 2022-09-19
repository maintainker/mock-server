// import { NextFunction, Request, Response } from "express"

import { Router } from "express";
import { sign, verifyAccess, verifyRefresh } from "../../shared/encrypt";
const crypto = import("node:crypto");
interface User {
  userId: string;
  password: string;
  name: string;
  age?: number;
  hobby: string[];
}
const database: User[] = [
  {
    userId: "tjfdudghks",
    password:
      "4e2555bf3e7921657bbf85579f0b3e084617e8f12e25f416db733f38901e1d55",
    name: "설영환",
    age: 35,
    hobby: ["등산", "헬스", "맛집탐방", "여행"],
  },
];

const userRouter = Router();

/** 유저정보 가져오기 */
userRouter.get("/", (req, res) => {
  const access = req.headers["authorization"];
  if (!access) {
    return res.status(401).send("인증되지 않은 유저입니다.");
  }
  const verify = verifyAccess(access) as any;
  if (verify === null)
    return res.status(401).send("access 토큰이 만료되었습니다.");

  const user = database[verify.id];

  return res.status(200).send({
    name: user.name,
    age: user.age,
    hobby: user.hobby,
  });
});

/** 토큰 재발급 */
userRouter.get("/token", (req, res) => {
  const refresh = req.headers["refresh"] as string;
  if (!req.headers["refresh"])
    return res.status(401).send("비정상적인 토큰입니다.");
  const verify = verifyRefresh(refresh) as any;
  if (!verify) res.status(401).send("refresh 토큰이 만료되었습니다.");
  const token = sign(verify.id);
  console.log(verify);
  return res.status(200).send(token);
});

/** 로그인 */
userRouter.post("/login", async (req, res) => {
  const { createHash } = await crypto;
  if (!req.body?.userId) {
    return res.status(400).send("아이디는 필수값입니다.");
  }
  if (!req.body?.password) {
    return res.status(400).send("비밀번호는 필수값입니다.");
  }
  const encryptedPw = createHash("sha256")
    .update(req.body.password)
    .digest("hex");
  const userIdx = database.findIndex((el) => el.userId === req.body.userId);
  if (userIdx < 0) {
    return res.status(200).send("잘못된 아이디이거나 없는 회원입니다.");
  }
  if (encryptedPw !== database[userIdx].password) {
    return res.status(200).send("잘못된 비밀번호입니다.");
  }
  const token = sign(userIdx);
  return res.status(200).send({
    ...token,
  });
});

/** 회원가입 */
userRouter.post("/", async (req, res) => {
  const { createHash } = await crypto;
  if (req.body?.userId) {
    return res.status(400).send("아이디는 필수값입니다.");
  }
  if (!req.body?.password) {
    return res.status(400).send("비밀번호는 필수값입니다.");
  }
  if (!req.body?.name) {
    return res.status(400).send("이름은 필수값입니다.");
  }
  if (database.findIndex((el) => el.userId === req.body.userId) >= 0) {
    return res.status(200).send("이미 가입된 회원입니다.");
  }
  const newUser: User = {
    userId: req.body.userId,
    password: createHash("sha256").update(req.body.password).digest("hex"),
    name: req.body.name,
    hobby: [],
  };
  database.push(newUser);
  return res.status(201).send("success");
});

userRouter.patch("/", async (req, res) => {
  const { createHash } = await crypto;
  const access = req.headers["authorization"];
  if (!access) {
    return res.status(401).send("인증되지 않은 유저입니다.");
  }
  const verify = verifyAccess(access) as any;

  if (verify === null)
    return res.status(401).send("access 토큰이 만료되었습니다.");
  if (req.body.hobby && !Array.isArray(req.body.hobby)) {
    return res.status(400).send("hobby의 타입이 잘못되었습니다.");
  }
  database[verify.id] = {
    ...database[verify.id],
    password: req.body.password
      ? createHash("sha256").update(req.body.password).digest("hex")
      : database[verify.id].password,
    name: req.body.name ? req.body.name : database[verify.id].name,
    age: req.body.age ? req.body.age : database[verify.id].age,
    hobby: req.body.hobby ? [...req.body.hobby] : database[verify.id].hobby,
  };

  return res.status(201).send("success");
});

export default userRouter;
