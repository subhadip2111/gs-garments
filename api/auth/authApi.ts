import axios from "axios";

export const saveSocialLoginUserData = async (user: any) => {
    const response = await axios.post(`${process.env.VITE_BACKEND_URL}/auth/social-login`, user);
    return response.data;
}

export const updateProfileDetails = async (user: any, token: string) => {
    const response = await axios.patch(`${process.env.VITE_BACKEND_URL}/auth/profile/${user.id}`, user, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
}

export const getProfileDetails = async (token: string) => {
    const response = await axios.get(`${process.env.VITE_BACKEND_URL}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
}