import { db } from "@repo/db";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import 'dotenv/config';
import bcrypt from 'bcrypt';

interface User {
    username : String,
    id : String,
    password : String,
    email : String
}

const {ACCESSTOKEN_SECRET, REFRESHTOKEN_SECRET} = process.env;

const generateAccessToken = (user:User)=>{
    return jwt.sign({
        id : user.id,
        email : user.email,
        password : user.password
    },ACCESSTOKEN_SECRET || "madsd47934", // fix this later
{expiresIn : "24h"})
}

const generateRefreshToken = (user: User)=>{
    return jwt.sign({
        id : user.id
    }, REFRESHTOKEN_SECRET || "manihdf84356",{ // fix this later
        expiresIn : "24h"
    }) 
}

const generateRefreshAndAccessToken = async(userId : string)=>{
    const user = await db.orm.public.Action.first({id : userId})
}

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
            email: email,
            password: password
        })
        if (findUser) {
            return res.status(300).send("user already exist with this name or username or email");
        }
    } catch (error) {
        res.status(404).send(error + "something wrong with db finding user");
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await db.orm.public.User.create({
            username: username,
            email: email,
            password: hashedPassword
        })
        if (!user) {
            res.status(404).send("something is wrong with creating user in signup function");
        }
        // suggestion :create token here so user dont have to login after signup
        return res.status(200).json({
            success : true,
            data : {
                id : user.id,
                username : user.username,
                email : user.email
            },
            message : "User created successfully"
        })
    } catch (error) {
        return res.status(404).send(error + "something wrong with db creating user in signup function")
    }
}

const login = async(req: Request, res: Response)=>{
    const { username, email, password} = req.body;
    if(
        [username, password, email].some((space)=> space.trim()==="")
    ){
        return res.status(400).send("All fields are necessary");
    }
    try {
        const user = await db.orm.public.User.first({
            email
        })
        if (!user) {
            return res.status(400).send("user does not exist with this name or username or email");
        }
        const verifyPassword =  await bcrypt.compare(password, user.password);
        if(!verifyPassword){
            return res.status(411).send("Password is not matching in login")
        }
        // env is not loading
        // create another fucntions called generate access token & refresh token then call the function here with payload.

    } catch (error) {
        res.status(404).send(error + "something wrong with db finding user");
    }
}
// reset-password,me, generate access token, refresh token