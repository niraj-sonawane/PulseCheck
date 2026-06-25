import { Request, Response } from "express";
import { generateToken } from "../services/tokenService";
import { registerUser, loginUser } from "../services/authService";
import { prisma } from "../config/prisma";
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

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await loginUser(email, password);
        const token = generateToken(user.id);

        res
        .cookie("token", token, cookieOptions())
        .status(200)
        .json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message || "Login failed" });
    }
};
export const me = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to load user" });
  }
};

export const logout = async (req: Request, res: Response) => {
  res
    .clearCookie("token", cookieOptions())
    .status(200)
    .json({ message: "Logged out" });
};