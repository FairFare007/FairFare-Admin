import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Mail, Lock, User, FileText, ArrowRight, CheckCircle, AlertCircle, Loader2, Search, Clock, XCircle } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AuthScreen = () => {
  const [mode, setMode] = useState("login"); // "login" | "request" | "status" | "forgot"
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [noAccountError, setNoAccountError] = useState(false);
  const [success, setSuccess] = useState("");
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Request form state
  const [reqEmail, setReqEmail] = useState("");
  const [reqName, setReqName] = useState("");
  const [reqReason, setReqReason] = useState("");
  const [submittedRequestId, setSubmittedRequestId] = useState("");

  // Status check state
  const [statusEmail, setStatusEmail] = useState("");
  const [statusRequestId, setStatusRequestId] = useState("");
  const [statusResult, setStatusResult] = useState(null);
  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });
      authLogin(res.data.token, res.data.admin);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAccess = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmittedRequestId("");
    setIsLoading(true);
    try {
      const res = await api.post("/auth/access-requests", {
        email: reqEmail,
        name: reqName,
        reason: reqReason,
      });
      setSuccess(res.data.message);
      setSubmittedRequestId(res.data.requestId);
      setReqEmail("");
      setReqName("");
      setReqReason("");
    } catch (err) {
      if (err.response?.data?.code === "NO_USER_ACCOUNT") {
        setNoAccountError(true);
      }
      setError(err.response?.data?.error || "Failed to submit request.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    setError("");
    setStatusResult(null);
    setIsLoading(true);
    try {
      const res = await api.post("/auth/access-requests/status", {
        email: statusEmail,
        requestId: statusRequestId,
      });
      setStatusResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to check status.");
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setNoAccountError(false);
    setSuccess("");
    setSubmittedRequestId("");
    if (newMode !== "status") setStatusResult(null);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: forgotEmail });
      setSuccess(res.data.message);
      setForgotEmail("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to process request.");
    } finally {
      setIsLoading(false);
    }
  };

  const StatusDisplay = ({ result }) => {
    const statusConfig = {
      pending: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: Clock, label: "Pending Review" },
      approved: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle, label: "Approved" },
      rejected: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: XCircle, label: "Rejected" },
    };

    const config = statusConfig[result.status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-xl ${config.bg} ${config.border} border mt-4`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
            <p className="text-xs text-slate-500">{result.name}</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">{result.message}</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          <span>Submitted: {new Date(result.submittedAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(result.updatedAt).toLocaleDateString()}</span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #6366f1, transparent)" }}
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }}
        />
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, 15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="relative rounded-2xl border border-white/10 p-8"
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 0 60px rgba(99, 102, 241, 0.1), 0 25px 50px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-1">FairFare Admin</h1>
            <p className="text-slate-400 text-sm">
              {mode === "login" ? "Welcome back, Administrator" :
               mode === "request" ? "Request Admin Privileges" :
               mode === "status" ? "Check Your Request Status" :
               "Reset Your Password"}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex rounded-xl p-1 mb-6 overflow-x-auto no-scrollbar"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          >
            {[
              { key: "login", label: "Login" },
              { key: "request", label: "Request" },
              { key: "status", label: "Status" },
              { key: "forgot", label: "Forgot" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => switchMode(tab.key)}
                className={`flex-1 min-w-[70px] py-2.5 text-xs font-medium rounded-lg transition-all duration-300 ${mode === tab.key
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                    : "text-slate-400 hover:text-slate-300"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-3 mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
                {noAccountError && (
                  <motion.a
                    href="https://fair-fare-phi.vercel.app/signup"
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-red-500 text-white font-semibold text-xs hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                  >
                    <User className="w-3.5 h-3.5" />
                    Create FairFare Account
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.a>
                )}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-2 mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <p className="text-emerald-400 text-sm font-medium">{success}</p>
                </div>
                {submittedRequestId && (
                  <div className="mt-2 p-3 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                    <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-1">Your Tracking ID</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-mono font-bold text-white leading-none">{submittedRequestId}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(submittedRequestId);
                          // Optional: show a small toast or change icon
                        }}
                        className="p-1.5 hover:bg-emerald-500/30 rounded-md transition-colors text-emerald-400"
                        title="Copy to clipboard"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-emerald-400/70 mt-1">Please save this ID to check your status later.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {mode === "login" && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                      placeholder="admin@fairfare.app"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-60 text-sm"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    boxShadow: "0 4px 20px rgba(99, 102, 241, 0.3)",
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Login to Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}

            {mode === "request" && (
              <motion.form
                key="request"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleRequestAccess}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={reqName}
                      onChange={(e) => setReqName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={reqEmail}
                      onChange={(e) => setReqEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Reason for Access</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <textarea
                      required
                      value={reqReason}
                      onChange={(e) => setReqReason(e.target.value)}
                      rows="3"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none text-sm"
                      placeholder="Why do you need admin access?"
                    />
                  </div>
                </div>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-60 text-sm"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    boxShadow: "0 4px 20px rgba(99, 102, 241, 0.3)",
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Submit Request
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}

            {mode === "status" && (
              <motion.form
                key="status"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleCheckStatus}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Your Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={statusEmail}
                      onChange={(e) => setStatusEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Request ID</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={statusRequestId}
                      onChange={(e) => setStatusRequestId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm font-mono"
                      placeholder="FF-XXXXX"
                    />
                  </div>
                </div>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-60 text-sm"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    boxShadow: "0 4px 20px rgba(99, 102, 241, 0.3)",
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Check Status
                    </>
                  )}
                </motion.button>

                {statusResult && <StatusDisplay result={statusResult} />}
              </motion.form>
            )}

            {mode === "forgot" && (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleForgotPassword}
                className="space-y-4"
              >
                <div>
                  <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                    Enter your registered email address and we'll send you a temporary password to regain access.
                  </p>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                      placeholder="admin@fairfare.app"
                    />
                  </div>
                </div>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-60 text-sm"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    boxShadow: "0 4px 20px rgba(245, 158, 11, 0.3)",
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Send Temporary Password
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-4 decoration-slate-700 decoration-1"
                  >
                    Back to Login
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 mt-6">
            Secure admin portal • FairFare © 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthScreen;