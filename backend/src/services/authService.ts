import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";


export const registerUser = async (data : {
    name: string;
    email: string;
    password: string;
    role: "COACH" | "CLIENT";
}) => {
    if (!data.name || data.name.trim() === "") {
        throw new Error("Name is required");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        throw new Error("Invalid email format");
    }
    if (!data.password || data.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
    }
    if (data.role !== "COACH" && data.role !== "CLIENT") {
        throw new Error("Invalid role selection");
    }

    const existing = await prisma.user.findUnique({
        where: {
            email: data.email
        }
    });
    if (existing) {
        throw new Error("User already registered");
    }

    const hashedpassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedpassword,
            role: data.role,
    
        },
    });
    return user;
};


export const loginUser = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({where: {email } });
    if(!user) {
        throw new Error("Invalid email or password");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
        throw new Error ("invalid email or password");
    }

    return user;
};