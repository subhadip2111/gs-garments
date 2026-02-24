import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./Toast";
import { adminLogin } from "@/api/auth/authApi";
import { setCurrentUser, setToken, setUser } from "@/store/authSlice";
import { useAppDispatch } from "@/store";

function AdminLogin() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
  const { showToast } = useToast();
    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.email || !form.password) {
            return setError("All fields are required");
        }

        if (form.password.length < 6) {
            return setError("Password must be at least 6 characters");
        }





        try {
            setLoading(true);
            const adminResponse = await adminLogin(form.email, form.password);
            if (adminResponse.user) {
                console.log("adminResponse", adminResponse.user)
                dispatch(setUser(adminResponse.user));
                navigate("/admin/dashboard");
                showToast("Login successfully", "success");
                const tokens = {
                    accessToken: adminResponse.accessToken,
                    refreshToken: adminResponse.refreshToken
                };
                console.log("tokens", tokens)
                dispatch(setToken(tokens));
            }



        } catch (err) {
            setError(err.message || "Something went wrong");
            showToast(err.message || "Something went wrong", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    Login In  GS Garments
                </h2>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email            </label>
                        <input
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="[EMAIL_ADDRESS]"
                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>




                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition"
                    >
                        {loading ? "Creating..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;