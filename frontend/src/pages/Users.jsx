import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import api from "../services/api";
import { Search, User as UserIcon, Mail, Calendar, Shield } from "lucide-react";
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
    const [expandedUserId, setExpandedUserId] = useState(null);

    const FAIRFARE_URL = "https://fair-fare-phi.vercel.app";

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

    const handleChangePassword = (e, user) => {
        e.stopPropagation();
        setSelectedUser(user);
        setIsPasswordModalOpen(true);
    };

    const toggleExpand = (userId) => {
        setExpandedUserId(expandedUserId === userId ? null : userId);
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
                                <th className="p-4 font-medium hidden md:table-cell">Email / Status</th>
                                <th className="p-4 font-medium hidden sm:table-cell text-center">Joined</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm sm:text-base">
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
                                    <React.Fragment key={user._id}>
                                        <tr 
                                            onClick={() => toggleExpand(user._id)}
                                            className={`hover:bg-white/5 transition-colors cursor-pointer group ${expandedUserId === user._id ? "bg-white/5" : ""}`}
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <a 
                                                        href={`${FAIRFARE_URL}/public-profile/${user._id}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-10 h-10 shrink-0 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 overflow-hidden hover:border-indigo-500 transition-colors"
                                                    >
                                                        {user.profilePhotoUrl ? (
                                                            <img src={user.profilePhotoUrl} alt={user.username} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <UserIcon size={20} />
                                                        )}
                                                    </a>
                                                    <div className="min-w-0">
                                                        <a 
                                                            href={`${FAIRFARE_URL}/public-profile/${user._id}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="font-semibold text-slate-200 hover:text-indigo-400 transition-colors block truncate"
                                                        >
                                                            {user.username}
                                                        </a>
                                                        <p className="text-xs text-slate-500 mt-0.5 truncate md:hidden">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 hidden md:table-cell text-slate-400">
                                                <div className="flex items-center gap-2">
                                                    {user.email?.toLowerCase().endsWith("@fairfare.com") ? (
                                                        <>
                                                            <Mail size={14} className="shrink-0" />
                                                            <span className="truncate">{user.email}</span>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold mb-0.5">
                                                                Last {user.lastActive ? "Active" : "Updated"}
                                                            </span>
                                                            <div className="flex items-center gap-2 text-slate-300">
                                                                <Calendar size={14} className="shrink-0" />
                                                                <span className="text-xs whitespace-nowrap">
                                                                    {new Date(user.lastActive || user.updatedAt).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 hidden sm:table-cell text-slate-400 text-center">
                                                <div className="inline-flex items-center gap-2 text-xs">
                                                    <Calendar size={14} />
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={(e) => handleChangePassword(e, user)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-white/5 transition-colors group-hover:border-indigo-500/30 whitespace-nowrap"
                                                >
                                                    <Shield size={14} className="text-indigo-400" />
                                                    <span className="hidden sm:inline">Change Password</span>
                                                    <span className="sm:hidden">PW</span>
                                                </button>
                                            </td>
                                        </tr>
                                        {/* Expandable Mobile Detail View */}
                                        {expandedUserId === user._id && (
                                            <tr className="bg-slate-900/40 sm:hidden">
                                                <td colSpan="3" className="p-4">
                                                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                                                        <div className="col-span-2">
                                                            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Email ID</p>
                                                            <div className="flex items-center gap-2 text-slate-200 bg-white/5 p-2 rounded-lg border border-white/5">
                                                                <Mail size={14} className="text-indigo-400" />
                                                                <span className="truncate text-xs">{user.email}</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Last Seen</p>
                                                            <div className="flex items-center gap-2 text-slate-300 text-xs bg-white/5 p-2 rounded-lg border border-white/5">
                                                                <Calendar size={14} className="text-indigo-400" />
                                                                {user.lastActive || user.updatedAt ? new Date(user.lastActive || user.updatedAt).toLocaleString() : 'Never'}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Joined Date</p>
                                                            <div className="flex items-center gap-2 text-slate-300 text-xs bg-white/5 p-2 rounded-lg border border-white/5">
                                                                <Calendar size={14} className="text-indigo-400" />
                                                                {new Date(user.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        {/* Expandable Desktop Detail View (Hidden) - Just in case we want details there too */}
                                        {expandedUserId === user._id && (
                                            <tr className="bg-slate-900/40 hidden sm:table-row md:hidden">
                                                <td colSpan="4" className="p-4">
                                                    <div className="flex justify-between items-center animate-in slide-in-from-top-1">
                                                        <div className="flex items-center gap-6">
                                                            <div>
                                                                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Email</p>
                                                                <p className="text-sm text-slate-300">{user.email}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Last Active</p>
                                                                <p className="text-sm text-slate-300">{new Date(user.lastActive || user.updatedAt).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
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
