import { db } from "@repo/db";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";
import bcrypt from 'bcrypt';

interface User {
    username? : string,
    id? : number,
    password? : string,
    email? : string
}

const { ACCESSTOKEN_SECRET, REFRESHTOKEN_SECRET } = process.env;
if (!ACCESSTOKEN_SECRET || !REFRESHTOKEN_SECRET) {
  throw new Error("Token secrets are missing from env");
}

const generateAccessToken = (user: User) =>
  jwt.sign({ id: user.id, email: user.email }, ACCESSTOKEN_SECRET, {
    expiresIn: "15m",
  });

const generateRefreshToken = (user: User) =>
  jwt.sign({ id: user.id }, REFRESHTOKEN_SECRET, { expiresIn: "7d" });

const signupUser = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    if (
        [username, email, password].some((field) => field.trim() === "")
    ) {
        return res.status(400).send("All fields are necessary");
    }

    try {
        const findUser = await db.orm.public.User.where({
            username: username,
            email: email
        })
        if (findUser) {
            return res.status(300).send("user already exist with this name or username or email");
        }
    } catch (error) {
        return res.status(404).send(error + "something wrong with db finding user");
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await db.orm.public.User.create({
            username: username,
            email: email,
            password: hashedPassword
        })
        if (!user) {
      return res.status(500).send("Could not create user");
    }

    const accessToken = generateAccessToken({id: user.id, email: user.email});
    const refreshToken = generateRefreshToken({id: user.id});
    return res.status(201).json({
      success: true,
      data: { id: user.id, username: user.username, email: user.email },
      accessToken,
      refreshToken,
      message: "User created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Something went wrong during signup");
  }
};

const login = async(req: Request, res: Response)=>{
    const { username, email, password} = req.body;
    if(
        [username, password, email].some((space)=> space.trim()==="")
    ){
        return res.status(400).send("All fields are necessary");
    }
    try {
        const user = await db.orm.public.User.first({
            email : email
        })
        if (!user) {
            return res.status(400).send("user does not exist with this name or username or email");
        }
        const verifyPassword =  await bcrypt.compare(password, user.password);
        if(!verifyPassword){
            return res.status(411).send("Password is not matching in login")
        }
        const accessToken = generateAccessToken({id: user.id, email: user.email});
        const refreshToken = generateRefreshToken({id: user.id});
        return res.status(200).json({
      success: true,
      data: { id: user.id, username: user.username, email: user.email },
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Something went wrong during login");
  }
};


// reset-password,me