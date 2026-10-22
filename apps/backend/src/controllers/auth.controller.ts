import { db } from "@repo/db";
import type { Request, Response } from "express";

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
        const user = await db.orm.public.User.create({
            username: username,
            email: email,
            password: password
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
        res.status(404).send(error + "something wrong with db creating user in signup function")
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
        const findUser = await db.orm.public.User.where({
            username: username,
            email: email,
            password: password
        })
        if (!findUser) {
            return res.status(400).send("user does not exist with this name or username or email");
        }
        // sign jwt here for token and process further 
    } catch (error) {
        res.status(404).send(error + "something wrong with db finding user");
    }
}
// create login, reset-password,me, generate access token, refresh token