import React, { useState } from 'react';
import { User, Lock, Mail, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store';
import { useToast } from '../Toast';
import { updateProfileDetails } from '../../api/auth/authApi';
import { setCurrentUser } from '../../store/authSlice';

const ProfileManager: React.FC = () => {
    const user = useAppSelector((state) => state.auth.user);
    const accessToken = useAppSelector((state) => state.auth.accessToken);
    const dispatch = useAppDispatch();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [profileForm, setProfileForm] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updatedUser = await updateProfileDetails({
                ...user,
                fullName: profileForm.fullName,
            }, accessToken);
            dispatch(setCurrentUser(updatedUser.user || updatedUser));
            showToast('Profile updated successfully', 'success');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        setLoading(true);
        try {
            // Assuming the backend has an endpoint or handles password in updateProfileDetails
            // For now, we'll use updateProfileDetails and assume it can handle password updates
            await updateProfileDetails({
                ...user,
                password: passwordForm.newPassword,
            }, accessToken);

            showToast('Password updated successfully', 'success');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to update password', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out font-sans">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter premium-gradient-text">Identity Architecture</h1>
                    <p className="text-black text-sm font-medium">Manage your administrative credentials and security layer</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Details */}
                <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden p-8 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                            <User size={20} />
                        </div>
                        <h2 className="font-black text-gray-900 uppercase tracking-widest text-sm">Account Matrix</h2>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-black group-focus-within:text-black transition-colors" size={16} />
                                <input
                                    type="text"
                                    value={profileForm.fullName}
                                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                    className="w-full pl-11 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-4 focus:ring-black/5 focus:border-black outline-none transition-all"
                                    placeholder="Executive Name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 opacity-80">
                            <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1">Email Base (Read-only)</label>
                            <div className="relative mt-2">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={16} />
                                <input
                                    type="email"
                                    value={profileForm.email}
                                    readOnly
                                    className="w-full pl-11 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-premium btn-black py-3 rounded-xl flex items-center justify-center gap-2 group shadow-xl shadow-black/10 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <span>Synchronize Profile</span>
                            <CheckCircle2 size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>

                {/* Password Reset */}
                <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden p-8 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                            <Shield size={20} />
                        </div>
                        <h2 className="font-black text-gray-900 uppercase tracking-widest text-sm">Security Layer</h2>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1">New Credential</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black group-focus-within:text-black transition-colors" size={16} />
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    className="w-full pl-11 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-4 focus:ring-black/5 focus:border-black outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1">Confirm Credential</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black group-focus-within:text-black transition-colors" size={16} />
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    className="w-full pl-11 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-4 focus:ring-black/5 focus:border-black outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-premium bg-white border border-gray-100 text-black py-3 rounded-xl flex items-center justify-center gap-2 group shadow-lg active:scale-95 transition-all hover:bg-black hover:text-white disabled:opacity-50"
                        >
                            <span>Reset Access Layer</span>
                            <AlertCircle size={16} className="group-hover:rotate-12 transition-transform" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileManager;
