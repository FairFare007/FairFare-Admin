import { useState } from "react";
import {
  Key,
  Search,
  CheckCircle,
  RefreshCw,
  Send,
  Copy,
  AlertCircle,
} from "lucide-react";
import { INITIAL_PASSWORD_REQUESTS } from "../data/mockData";

const PasswordReset = () => {
  const [requests, setRequests] = useState(INITIAL_PASSWORD_REQUESTS);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case "Reset Sent":
        return "bg-teal-100 text-teal-700";
      case "Urgent":
        return "bg-red-100 text-red-700";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  const generatePass = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let pass = "";
    for (let i = 0; i < 4; i++)
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    pass += "-";
    for (let i = 0; i < 3; i++)
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    setNewPassword(pass);
  };

  // --- NEW: Handle selecting a user ---
  const handleSelectUser = (req) => {
    setSelectedUser(req);
    // If this user already has a resetPassword saved, load it into the input
    // Otherwise, clear the input
    if (req.resetPassword) {
      setNewPassword(req.resetPassword);
    } else {
      setNewPassword("");
    }
  };

  const handleReset = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setRequests((prev) =>
        prev.map((req) => {
          if (req.id === selectedUser.id) {
            return {
              ...req,
              status: "Reset Sent",
              issue: "Waiting for user change",
              lastAction: "Reset by Admin just now",
              // --- NEW: Save the password to the user object ---
              resetPassword: newPassword,
            };
          }
          return req;
        })
      );

      setToast(
        `Password reset to ${newPassword}. User marked as 'Reset Sent'.`
      );
      setIsProcessing(false);
      setSelectedUser(null);
      setNewPassword("");
      setTimeout(() => setToast(null), 5000);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">
          Password Recovery & Tickets
        </h2>
        {toast && (
          <div className="w-full md:w-auto bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 animate-bounce-short">
            <CheckCircle size={16} /> {toast}
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6 h-auto md:h-[600px]">
        {/* List Section */}
        <div className="w-full md:w-1/3 h-64 md:h-full bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col order-2 md:order-1">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-700">
              Requests ({requests.length})
            </h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {requests.map((req) => (
              <div
                key={req.id}
                // --- UPDATED: Allow clicking even if status is Reset Sent ---
                onClick={() => handleSelectUser(req)}
                // --- UPDATED: Removed opacity-60 and cursor-default logic ---
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedUser?.id === req.id
                    ? "bg-indigo-50 border-indigo-200 shadow-sm"
                    : "bg-white border-transparent hover:bg-slate-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-slate-800">
                    {req.name}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                      req.status
                    )}`}
                  >
                    {req.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{req.email}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    {req.status === "Reset Sent" ? (
                      <CheckCircle size={12} />
                    ) : (
                      <AlertCircle size={12} />
                    )}
                    {req.issue}
                  </p>
                  {/* Optional indicator that a password is saved */}
                  {req.resetPassword && (
                    <span className="text-[10px] text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded">
                      Pass Saved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Section */}
        <div className="w-full md:flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8 flex flex-col justify-center items-center order-1 md:order-2 min-h-[400px]">
          {selectedUser ? (
            <div className="w-full max-w-md space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="text-indigo-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  {/* Change title based on context */}
                  {selectedUser.resetPassword
                    ? "Update Password"
                    : "Reset Password"}{" "}
                  for {selectedUser.name}
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  {selectedUser.resetPassword
                    ? "A password was already generated. You can modify it below."
                    : "This will invalidate their old session immediately."}
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {selectedUser.resetPassword
                    ? "Current Generated Password"
                    : "New Password"}
                </label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Click Generate..."
                    className="flex-1 text-lg font-mono tracking-wide px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    onClick={generatePass}
                    className="px-4 py-3 sm:py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
                  >
                    {newPassword ? "Regenerate" : "Generate"}
                  </button>
                </div>
                {newPassword && (
                  <div className="flex justify-end mt-2">
                    <button className="text-xs text-indigo-600 flex items-center gap-1 hover:underline">
                      <Copy size={12} /> Copy to clipboard
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleReset}
                disabled={!newPassword || isProcessing}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex justify-center items-center gap-2 ${
                  !newPassword || isProcessing
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200"
                }`}
              >
                {isProcessing ? (
                  <RefreshCw className="animate-spin" />
                ) : (
                  <>
                    <Send size={18} />{" "}
                    {selectedUser.resetPassword
                      ? "Update Password"
                      : "Reset, Notify & Update Status"}
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center text-slate-400">
              <Search size={48} className="mx-auto mb-4 opacity-20" />
              <p className="hidden md:block">
                Select a user request from the left to take action.
              </p>
              <p className="md:hidden">
                Select a user request from the list below to take action.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
