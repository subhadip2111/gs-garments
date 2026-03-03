import { getApiClient } from "./authApi";

export const getHomeConfig = async () => {
    try {
        const response = await getApiClient().get(`/banners`);
        return response.data;
    } catch (error) {
        console.log(error);
        return error;
    }

}