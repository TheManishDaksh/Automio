import { db } from "@repo/db";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";
import bcrypt from 'bcrypt';

interface User {
    username?: string,
    id?: number,
    password?: string,
    email?: string
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

        const accessToken = generateAccessToken({ id: user.id, email: user.email });
        const refreshToken = generateRefreshToken({ id: user.id });
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

const login = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    if (
        [username, password, email].some((space) => space.trim() === "")
    ) {
        return res.status(400).send("All fields are necessary");
    }
    try {
        const user = await db.orm.public.User.first({
            email: email
        })
        if (!user) {
            return res.status(400).send("user does not exist with this name or username or email");
        }
        const verifyPassword = await bcrypt.compare(password, user.password);
        if (!verifyPassword) {
            return res.status(411).send("Password is not matching in login")
        }
        const accessToken = generateAccessToken({ id: user.id, email: user.email });
        const refreshToken = generateRefreshToken({ id: user.id });
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

// these two routes are for the user that has been forget his password and unable to login his account
// forgetPasswors and resetPassword

const forgetPassword = async (req: Request, res: Response) => {
    const { username, email } = req.body;

    if (!username && !email) {
        return res.status(400).send({
            message: "At least one field is mandatory email or username"
        })
    }
    try {
         const user = email
            ? await db.orm.public.User.first({ email })
            : await db.orm.public.User.first({ username });
        // suggestion - do email verification here by resend otp method

        if (!user) {
            return res.status(400).send({
                message: "user does not found"
            })
        }
        res.status(200).json({
            message : "user found",
            user:
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send("something went wrong in db during finding user in reset-password")
    }
}

const resetPassword = async(req: Request, res: Response)=>{
    const { email, newPassword } = req.body;
    if(!newPassword && !email){
        return res.status(400).send("Both fields are required");
    }
    //do zod or any kind of verification
    try {
        const user = await db.orm.public.User.first({email});
        if(!user){
            return res.status(400).send("user does not found with this email")
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const uppdatePassword = await db.orm.public.User.where({email}).update({password:hashedPassword});

        return res.status(200).send("password updated");
    } catch (error) {
        console.log(error);
        return res.status(400).send("something went wrong during updating password")
    }
}

// in case user is logged in and want to change his password
const changePassword = async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).send({ message: "Both fields are required" });
    }

    try {
        const userId = req.user.id; // set by your auth middleware

        const user = await db.orm.public.User.first({ id: userId });
        if (!user) {
            return res.status(404).send({ message: "user not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).send({ message: "old password is incorrect" });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await db.orm.public.User.where({ id: userId }).update({ password: hashedNewPassword });

        return res.status(200).send({ message: "password updated" });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "something went wrong during updating password" });
    }
};

const me = async (req: Request, res: Response) => {
    try {
        const user = await db.orm.public.User.first({ id: req.user!.id });

        if (!user) {
            return res.status(404).send({ message: "user not found" });
        }
        return res.status(200).send({ success: true, user: user });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "something went wrong while fetching user" });
    }
};
// auth-middleware 