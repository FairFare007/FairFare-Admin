import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import api from "../services/api";
import { Search, Lock, User as UserIcon, Mail, Calendar, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChangePasswordModal from "../components/Users/ChangePasswordModal";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setPage(1);
            fetchUsers(1);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    useEffect(() => {
        fetchUsers(page);
    }, [page]);

    const fetchUsers = async (currentPage = 1) => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 10,
                search: searchTerm
            };

            const res = await api.get("/users", { params });
            setUsers(res.data.users || []);
            setTotalPages(res.data.totalPages || 1);
            setTotalUsers(res.data.totalUsers || 0);
        } catch (error) {
            console.error("Error fetching users:", error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = (user) => {
        setSelectedUser(user);
        setIsPasswordModalOpen(true);
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">User Management</h2>
                    <p className="text-slate-400">View and manage registered users.</p>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="glass-card rounded-xl overflow-hidden shadow-lg border border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/50 border-b border-white/5 text-slate-400 text-sm">
                                <th className="p-4 font-medium">User</th>
                                <th className="p-4 font-medium hidden md:table-cell">Email</th>
                                <th className="p-4 font-medium hidden sm:table-cell">Joined</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-500">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-500">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 overflow-hidden">
                                                    {user.profilePhotoUrl ? (
                                                        <img src={user.profilePhotoUrl} alt={user.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserIcon size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-200">{user.username}</p>
                                                    <p className="text-xs text-slate-500 md:hidden">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="p-4 hidden sm:table-cell text-slate-400 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleChangePassword(user)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm border border-white/5 transition-colors group-hover:border-indigo-500/30"
                                            >
                                                <Shield size={14} className="text-indigo-400" />
                                                Change Password
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer / Pagination */}
                <div className="p-4 border-t border-white/5 bg-slate-900/30 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Showing <span className="font-medium text-slate-300">{users.length}</span> of <span className="font-medium text-slate-300">{totalUsers}</span> users
                    </p>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-slate-400">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {selectedUser && (
                <ChangePasswordModal
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                    user={selectedUser}
                    onSuccess={() => {
                        // Optional: Refresh user list if needed, usually not required for password change
                    }}
                />
            )}
        </Layout>
    );
};

export default Users;
