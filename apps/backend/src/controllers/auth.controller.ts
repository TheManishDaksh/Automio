import { db } from "@repo/db";
import type { Request, Response } from "express";

const signupUser = async(req:Request, res:Response)=>{
    const { username, email, password} = req.body;
    if(
        [username,email, password].some((field)=>field.trim()==="")
    ){
        throw new Error("all options are mandatory");
    }

    const findUser = await db.orm.public.User
}

// create login, signup, reset-password,me, generate access token, refresh token