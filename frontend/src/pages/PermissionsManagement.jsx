import React, { useState, useEffect } from "react";
import { Shield, ShieldCheck, UserPlus, Trash2, Key, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp, UserCheck, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout/Layout";

const ALL_PERMISSIONS = [
    { key: "manage_users", label: "Manage Users", description: "Change user passwords and basic info" },
    { key: "manage_tickets", label: "Manage Tickets", description: "Assign, update, and resolve support tickets" },
    { key: "send_campaigns", label: "Send Campaigns", description: "Send bulk emails and push notifications" },
    { key: "manage_access_requests", label: "Manage Access", description: "Approve or reject new admin applications" },
    { key: "manage_permissions", label: "Manage Permissions", description: "Grant/revoke rights for other admins" },
];

const PermissionsManagement = () => {
    const { admin: currentAdmin } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("admins"); // 'admins' or 'requests'
    const [expandingAdmin, setExpandingAdmin] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [adminsRes, requestsRes] = await Promise.all([
                api.get("/auth/permissions/admins"),
                api.get("/auth/permissions/requests")
            ]);
            setAdmins(adminsRes.data);
            setRequests(requestsRes.data);
        } catch (error) {
            console.error("Failed to fetch permissions data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTogglePermission = async (adminId, permissionKey, currentPermissions) => {
        let newPermissions;
        if (currentPermissions.includes(permissionKey)) {
            newPermissions = currentPermissions.filter(p => p !== permissionKey);
        } else {
            newPermissions = [...currentPermissions, permissionKey];
        }

        try {
            await api.patch(`/auth/permissions/admins/${adminId}`, { permissions: newPermissions });
            setAdmins(admins.map(a => a._id === adminId ? { ...a, permissions: newPermissions } : a));
        } catch (error) {
            alert(error.response?.data?.error || "Failed to update permissions.");
        }
    };

    const handlePromote = async (adminId, name) => {
        if (!window.confirm(`Are you sure you want to promote ${name} to Superadmin? They will have full access.`)) return;
        try {
            await api.patch(`/auth/permissions/admins/${adminId}/promote`);
            setAdmins(admins.map(a => a._id === adminId ? { ...a, role: "superadmin" } : a));
        } catch (error) {
            alert(error.response?.data?.error || "Failed to promote admin.");
        }
    };

    const handleDemote = async (adminId, name) => {
        if (!window.confirm(`Are you sure you want to demote ${name} to regular Admin?`)) return;
        try {
            await api.patch(`/auth/permissions/admins/${adminId}/demote`);
            setAdmins(admins.map(a => a._id === adminId ? { ...a, role: "admin" } : a));
        } catch (error) {
            alert(error.response?.data?.error || "Failed to demote admin.");
        }
    };

    const handleProcessRequest = async (requestId, action) => {
        try {
            await api.patch(`/auth/permissions/requests/${requestId}/${action}`);
            fetchData(); // Refresh both to see updated permissions/status
        } catch (error) {
            alert(error.response?.data?.error || `Failed to ${action} request.`);
        }
    };

    return (
        <Layout>
            <div className="p-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Permissions Control</h1>
                        <p className="text-slate-400">Manage admin access, roles, and review permission requests.</p>
                    </div>
                    
                    <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5 self-start">
                        <button 
                            onClick={() => setActiveTab("admins")}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "admins" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                        >
                            Administrators
                        </button>
                        <button 
                            onClick={() => setActiveTab("requests")}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "requests" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                        >
                            Requests
                            {requests.filter(r => r.status === "pending").length > 0 && (
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            )}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === "admins" ? (
                            <motion.div 
                                key="admins"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                {admins.map((admin) => (
                                    <div 
                                        key={admin._id}
                                        className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all"
                                    >
                                        <div className="p-5 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${admin.role === "superadmin" ? "bg-indigo-500/20 text-indigo-400" : "bg-blue-500/10 text-blue-400"}`}>
                                                    {admin.role === "superadmin" ? <Shield size={24} /> : <UserCheck size={24} />}
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold flex items-center gap-2">
                                                        {admin.name}
                                                        {admin.role === "superadmin" && (
                                                            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">Superadmin</span>
                                                        )}
                                                        {admin._id === currentAdmin._id && (
                                                            <span className="text-[10px] bg-white/10 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">You</span>
                                                        )}
                                                    </h3>
                                                    <p className="text-slate-500 text-sm">{admin.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Promotion/Demotion only for Superadmins */}
                                                {currentAdmin.role === "superadmin" && admin._id !== currentAdmin._id && (
                                                    admin.role === "admin" ? (
                                                        <button 
                                                            onClick={() => handlePromote(admin._id, admin.name)}
                                                            className="p-2.5 rounded-xl bg-slate-800 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-all"
                                                            title="Promote to Superadmin"
                                                        >
                                                            <Shield size={18} />
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleDemote(admin._id, admin.name)}
                                                            className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                                                            title="Demote to Admin"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )
                                                )}

                                                <button 
                                                    onClick={() => setExpandingAdmin(expandingAdmin === admin._id ? null : admin._id)}
                                                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-all"
                                                >
                                                    {expandingAdmin === admin._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {expandingAdmin === admin._id && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-white/5 bg-black/20"
                                                >
                                                    <div className="p-6">
                                                        {admin.role === "superadmin" ? (
                                                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center gap-3">
                                                                <ShieldCheck size={20} className="text-indigo-400" />
                                                                <p className="text-slate-300 text-sm">
                                                                    Superadmins have all permissions. Specific permissions cannot be toggled.
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Granular Permissions</p>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    {ALL_PERMISSIONS.map((perm) => (
                                                                        <button
                                                                            key={perm.key}
                                                                            onClick={() => handleTogglePermission(admin._id, perm.key, admin.permissions || [])}
                                                                            className={`flex items-start gap-3 p-3 rounded-2xl border transition-all text-left ${
                                                                                admin.permissions?.includes(perm.key)
                                                                                    ? "bg-blue-600/10 border-blue-500/30 ring-1 ring-blue-500/20"
                                                                                    : "bg-slate-800/30 border-white/5 hover:border-white/10"
                                                                            }`}
                                                                        >
                                                                            <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border ${
                                                                                admin.permissions?.includes(perm.key)
                                                                                    ? "bg-blue-600 border-blue-600 text-white"
                                                                                    : "bg-slate-800 border-white/10"
                                                                            }`}>
                                                                                {admin.permissions?.includes(perm.key) && <CheckCircle2 size={12} />}
                                                                            </div>
                                                                            <div>
                                                                                <p className={`text-sm font-bold ${admin.permissions?.includes(perm.key) ? "text-white" : "text-slate-400"}`}>
                                                                                    {perm.label}
                                                                                </p>
                                                                                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{perm.description}</p>
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="requests"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                {requests.length === 0 ? (
                                    <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-white/5">
                                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                                            <Clock size={32} />
                                        </div>
                                        <p className="text-slate-500">No pending permission requests.</p>
                                    </div>
                                ) : (
                                    requests.map((req) => (
                                        <div 
                                            key={req._id}
                                            className={`bg-slate-900/40 border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                                                req.status === "pending" ? "border-amber-500/20" : "border-white/5"
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                    req.status === "approved" ? "bg-green-500/10 text-green-400" :
                                                    req.status === "rejected" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                                                }`}>
                                                    {req.status === "approved" ? <CheckCircle2 size={24} /> :
                                                     req.status === "rejected" ? <XCircle size={24} /> : <Key size={24} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-white font-bold">{req.admin?.name || "Unknown"}</h3>
                                                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                            {req.permission}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-400 text-sm italic mt-1 bg-black/20 p-2 rounded-lg border border-white/5 ring-inset">
                                                        "{req.reason}"
                                                    </p>
                                                    <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-widest">
                                                        Requested {new Date(req.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {req.status === "pending" ? (
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => handleProcessRequest(req._id, "reject")}
                                                        className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold transition-all flex items-center gap-2 border border-red-500/20"
                                                    >
                                                        <XCircle size={16} />
                                                        Reject
                                                    </button>
                                                    <button 
                                                        onClick={() => handleProcessRequest(req._id, "approve")}
                                                        className="px-4 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-bold transition-all flex items-center gap-2 border border-green-500/20"
                                                    >
                                                        <CheckCircle2 size={16} />
                                                        Approve
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-right">
                                                    <p className={`text-sm font-bold capitalize ${req.status === "approved" ? "text-green-400" : "text-red-400"}`}>
                                                        {req.status}
                                                    </p>
                                                    <p className="text-slate-500 text-[10px]">
                                                        By {req.reviewedBy?.name || "Superadmin"}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </Layout>
    );
};

export default PermissionsManagement;
