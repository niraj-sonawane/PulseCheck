import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";


export const registerUser = async (data : {
    name: string;
    email: string;
    password: string;
    role: "COACH" | "CLIENT";

}) => {
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