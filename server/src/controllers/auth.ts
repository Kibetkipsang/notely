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

export const login = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { identifier, password } = req.body;

    console.log('=== LOGIN START ===');
    console.log('Login attempt for:', identifier);

    // Find user by username or email
    const user = await client.user.findFirst({
      where: {
        OR: [{ userName: identifier }, { emailAddress: identifier }]
      }
    });

    if (!user) {
      console.log('User not found');
      return res.status(400).json({
        success: false,
        message: 'Wrong Login Credentials.'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(400).json({
        success: false,
        message: 'Wrong Login Credentials.'
      });
    }

    // Payload for JWT
    const payload = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      emailAddress: user.emailAddress
    };

    // Sign JWT
    const token = jwt.sign(payload, process.env.SECRET_KEY!, { expiresIn: '2h' });

    console.log('Token generated (first 20 chars):', token.substring(0, 20) + '...');

    // Set cookie with proper settings for localhost
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: false,         
      sameSite: 'lax',        
      maxAge: 2 * 60 * 60 * 1000,
      path: '/'
    });

    console.log('Cookie set in response');

    // Respond with payload
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: payload,
      token
    });

    console.log('=== LOGIN COMPLETE ===');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
};

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