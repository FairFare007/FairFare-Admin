import { useState } from "react";
import {
  User,
  Mail,
  AtSign,
  Save,
  Edit2,
  Shield,
  Key,
  CheckCircle,
  AlertCircle,
  Camera,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // Add this line

const AdminProfile = () => {
  const navigate = useNavigate();
  // --- State: Profile Data ---
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Shashank Srivastava",
    email: "admin@fairfare.app",
    username: "@fairfare_master",
    role: "Admin",
    joinDate: "Nov 2025",
  });

  // --- State: Password Management ---
  const [passData, setPassData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }

  // --- Handlers ---
  const handleSaveProfile = () => {
    // Simulate API save
    setIsEditing(false);
    showNotification("success", "Profile details updated successfully.");
  };

  const handleForgotPassword = () => {
    showNotification("success", `Recovery link sent to ${profile.email}`);
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdatePassword = () => {
    // 1. Basic empty check
    if (!passData.current || !passData.new || !passData.confirm) {
      showNotification("error", "Please fill in all password fields.");
      return;
    }

    // 2. Check if passwords match
    if (passData.new !== passData.confirm) {
      showNotification("error", "New passwords do not match.");
      return;
    }

    // 3. Check for minimum 6 characters (The warning you requested)
    if (passData.new.length < 6) {
      showNotification("error", "Password must be at least 6 characters.");
      return;
    }

    // --- SUCCESS SCENARIO ---

    // Simulate API call / Clear inputs
    setPassData({ current: "", new: "", confirm: "" });

    // Show success message
    showNotification("success", "Password updated! Logging out...");

    // Wait 2 seconds for user to read message, then redirect
    setTimeout(() => {
      // Optional: Clear auth tokens here (e.g., localStorage.removeItem('token'))
      navigate("/login");
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
      {/* Header & Notification Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Admin Profile</h2>
          <p className="text-slate-500 text-sm">
            Manage your personal details and FairFare account settings.
          </p>
        </div>
        {notification && (
          <div
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 animate-bounce-short ${
              notification.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {notification.message}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <User size={18} className="text-indigo-600" /> Personal
                Information
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                  isEditing
                    ? "bg-slate-200 text-slate-700 border-slate-300"
                    : "bg-white text-indigo-600 border-indigo-100 hover:border-indigo-300"
                }`}
              >
                {isEditing ? (
                  "Cancel Edit"
                ) : (
                  <>
                    <Edit2 size={12} /> Edit Details
                  </>
                )}
              </button>
            </div>

            <div className="p-8">
              {/* Avatar Section */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative group cursor-pointer">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl font-bold border-4 border-white shadow-md">
                    {profile.name.charAt(0)}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={20} />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800">
                    {profile.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                      {profile.role}
                    </span>
                    <span className="text-slate-400 text-xs">
                      Member since {profile.joinDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Full Name
                  </label>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                      isEditing
                        ? "bg-white border-indigo-300 ring-2 ring-indigo-50"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <User size={18} className="text-slate-400 shrink-0" />
                    <input
                      disabled={!isEditing}
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                      className="bg-transparent w-full outline-none text-slate-700 font-medium disabled:text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Email Address
                  </label>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                      isEditing
                        ? "bg-white border-indigo-300 ring-2 ring-indigo-50"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <Mail size={18} className="text-slate-400 shrink-0" />
                    <input
                      disabled={!isEditing}
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                      className="bg-transparent w-full outline-none text-slate-700 font-medium disabled:text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                    FairFare Username
                    <span className="text-indigo-500 normal-case font-normal text-[10px] bg-indigo-50 px-2 rounded-full">
                      Visible to users
                    </span>
                  </label>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                      isEditing
                        ? "bg-white border-indigo-300 ring-2 ring-indigo-50"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <AtSign size={18} className="text-slate-400 shrink-0" />
                    <input
                      disabled={!isEditing}
                      value={profile.username}
                      onChange={(e) =>
                        setProfile({ ...profile, username: e.target.value })
                      }
                      className="bg-transparent w-full outline-none text-slate-700 font-medium disabled:text-slate-500"
                    />
                  </div>
                  <p className="text-xs text-slate-400 pl-1">
                    This is your unique handle within the FairFare ecosystem.
                  </p>
                </div>
              </div>

              {isEditing && (
                <div className="mt-8 flex justify-end animate-fade-in">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-indigo-200"
                  >
                    <Save size={18} /> Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Security & Password */}
        <div className="lg:col-span-1 space-y-6">
          {/* Change Password Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Shield size={18} className="text-indigo-600" /> Security
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-lg font-bold text-slate-500 mb-1.5">
                  Change Password
                </label>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Key
                    size={16}
                    className="absolute left-3 top-3 text-slate-400"
                  />
                  <input
                    type="password"
                    value={passData.current}
                    onChange={(e) =>
                      setPassData({ ...passData, current: e.target.value })
                    }
                    // Convert className to backticks ` `
                    className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors ${
                      passData.new.length > 0 && passData.new.length < 6
                        ? "border-red-500"
                        : "border-slate-200"
                    }`}
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Key
                    size={16}
                    className="absolute left-3 top-3 text-slate-400"
                  />
                  <input
                    type="password"
                    value={passData.confirm}
                    onChange={(e) =>
                      setPassData({ ...passData, confirm: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdatePassword}
                className="w-full mt-2 bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Update Password
              </button>
            </div>
          </div>

          {/* Forgot Password / Trouble Card */}
          <div className="bg-orange-50 rounded-xl border border-orange-100 p-6">
            <h4 className="font-bold text-orange-800 text-sm mb-2">
              Trouble signing in?
            </h4>
            <p className="text-xs text-orange-700/80 mb-4">
              If you cannot remember your current password to make changes, we
              can send a reset link to your registered email.
            </p>
            <button
              onClick={handleForgotPassword}
              className="w-full bg-white border border-orange-200 text-orange-700 hover:bg-orange-100 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Send Recovery Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
