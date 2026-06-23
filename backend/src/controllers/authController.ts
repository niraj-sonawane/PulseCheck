import { Request, Response } from "express";
import { registerUser } from "../services/authService";
import { generateToken } from "../services/tokenService";

const cookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});


export const register = async (req: Request, res: Response) => {
    try {
        const user = await registerUser(req.body);
        const token = generateToken(user.id);

        res
        .cookie("token", token, cookieOptions())
        .status(201)
        .json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
        
    } catch (error: any) {
        res.status(400).json({ message: error.message || "Registration failed"});

    }
};