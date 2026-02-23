export const handleApiError = (error: any) => {
    if (error.response && error.response.status === 401) {
        return "Unauthorized";
    }
    return error.message;
}