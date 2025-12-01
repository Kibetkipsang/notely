import {type Request, type Response} from 'express'
import {PrismaClient} from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()
const client = new PrismaClient();


export const register = async (req:Request, res: Response): Promise<Response | void> => {
    try{
        // get body content
        const {firstName, lastName, userName, emailAddress, password} = req.body
        if(!firstName || !lastName || !userName || !emailAddress || !password){
            return res.status(400).json({
                message: "All fields are required."
            })
        }
        // hash password
        const passwordHash = await bcrypt.hash(password, 10)
        // save user to database
        const user = await client.user.create({
            data: {
                firstName: firstName,
                lastName: lastName,
                userName,
                emailAddress,
                password: passwordHash
            }
        });
        return res.status(200).json({
            message: "User created successfully."
        })
    }catch(err){
        return res.status(500).json({
            message: "Something went wrong. Please try again later."
        })
    }
}

export const login = async (req: Request, res: Response) => {
    try{
        const {identifier, password} = req.body
        // find user with the identifier
        const user = await client.user.findFirst({
            where: {
                OR: [{userName: identifier}, {emailAddress: identifier}]
            }
        })
        console.log(user)

        if(!user){
            return res.status(400).json({
                success: false,
                message: "Wrong Login Credentials."
            });
        }

        // compare password
        const passMatch = await bcrypt.compare(password, user.password)
        if(!passMatch){
            return res.status(400).json({
                message: "Wrong Login Credentials."
            })
        }

        const payload = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            userName: user.userName,
            emailAddress: user.emailAddress
        }

        // generate tokens and save it as a cookie
        const token = jwt.sign(payload, process.env.SECRET_KEY!, {
            expiresIn: "2h"
        });

        res.cookie("authToken", token, {
      httpOnly: true, // Prevents client-side JS from reading the cookie
      secure: process.env.NODE_ENV === "production", // false for localhost
      sameSite: "lax", // Allows cross-origin requests
      maxAge: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
      path: "/", // Available to all routes
      // domain: "localhost" // Optional: explicitly set domain
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: payload,
      token: token, // Also send token in response body
    });

    }catch(err){
        res.status(500).json({
            message: "Something went wrong. Please try again later."
        })
    }
}

export const logout = async (_req: Request, res: Response) => {
  try {
    res.clearCookie("authToken").status(200).json({
      message: "logged out successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "something went wrong",
    });
  }
};