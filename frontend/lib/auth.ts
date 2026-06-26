import { api } from "./api";

export const registerUser = async (data: {
    name: string;
    email: string;
    password: string;
    role: "COACH" | "CLIENT";

}) => {
    const res = await api.post("/auth/register", data);
    return res.data.user;
};

export const loginUser = async (data: { email: string; password: string }) => {
    const res = await api.post("/auth/login", data);
    return res.data.user;
};

export const getCurrentUser = async () => {
    const res = await api.get("/auth/me");
    return res.data.user;
}

export const logoutUser = async () => {
    await api.post("/auth/logout");

};