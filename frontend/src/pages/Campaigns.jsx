import React, { useState } from "react";
import {
  Mail,
  Bell,
  Send,
  X,
  CheckCircle,
  Users,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const Campaigns = () => {
  const [activeTab, setActiveTab] = useState("email");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // New State for Popup and Processing
  const [isSending, setIsSending] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [campaignStats, setCampaignStats] = useState({
    sent: 0,
    failed: 0,
    type: "",
  });

  const handleRunCampaign = () => {
    // Basic validation
    if (!title || !body) return;

    setIsSending(true);

    // Simulate API call delay
    setTimeout(() => {
      const totalUsers = 12450;
      let sentCount, failedCount;

      if (activeTab === "notification") {
        // Simulate some failures for notifications (e.g. permissions disabled)
        // Randomly succeed between 85% and 95%
        const successRate = 0.85 + Math.random() * 0.1;
        sentCount = Math.floor(totalUsers * successRate);
        failedCount = totalUsers - sentCount;
      } else {
        // Email usually has a "Sent" status immediately for the batch
        sentCount = totalUsers;
        failedCount = 0;
      }

      setCampaignStats({
        sent: sentCount,
        failed: failedCount,
        type: activeTab,
      });

      setIsSending(false);
      setShowPopup(true);

      // Optional: Reset form
      setTitle("");
      setBody("");
    }, 2000);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <h2 className="text-2xl font-bold text-slate-800">Campaign Manager</h2>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("email")}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === "email"
              ? "bg-white shadow-sm text-indigo-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Mail size={16} /> Email Blasts
        </button>
        <button
          onClick={() => setActiveTab("notification")}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === "notification"
              ? "bg-white shadow-sm text-indigo-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Bell size={16} /> Push Notifications
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Section */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            Draft New {activeTab === "email" ? "Email" : "Notification"}
          </h3>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Target Audience
              </label>
              <select className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                <option>All Users (12,450)</option>
                <option>Active Users (Last 30 days)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subject / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Campaign Title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Content Body
              </label>
              <textarea
                rows={activeTab === "email" ? 10 : 3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Write your content here..."
              ></textarea>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">
                Save Draft
              </button>

              <button
                onClick={handleRunCampaign}
                disabled={isSending || !title || !body}
                className={`px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  isSending || !title || !body
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-indigo-700"
                }`}
              >
                {isSending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {isSending ? "Running..." : "Run Campaign"}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar History */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
            Past {activeTab === "email" ? "Emails" : "Notifications"}
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="pb-4 border-b border-slate-50 last:border-0"
              >
                <p className="font-semibold text-slate-800 text-sm truncate">
                  {activeTab === "email"
                    ? "Update on FairFare Privacy Policy"
                    : "Don't forget to log expenses"}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-400">
                    Oct {10 + i}, 2025
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Sent
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RESULT POPUP MODAL */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">Campaign Complete!</h3>
                <p className="text-indigo-100 text-sm mt-1">
                  Your {campaignStats.type} campaign has been processed.
                </p>
              </div>
              <button
                onClick={closePopup}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Success Stat */}
              <div className="flex items-center p-4 bg-green-50 border border-green-100 rounded-xl">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-4 shrink-0">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-green-800 font-medium">
                    Successfully Delivered
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {campaignStats.sent.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-700">Recipients</p>
                </div>
              </div>

              {/* Failure Stat (Only shown if there are failures or it's a notification) */}
              {campaignStats.type === "notification" && (
                <div className="flex items-center p-4 bg-red-50 border border-red-100 rounded-xl">
                  <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <AlertTriangle className="text-red-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-red-800 font-medium">
                      Delivery Failed
                    </p>
                    <p className="text-2xl font-bold text-red-900">
                      {campaignStats.failed.toLocaleString()}
                    </p>
                    <p className="text-xs text-red-700">
                      Devices unreachable / Opted out
                    </p>
                  </div>
                </div>
              )}

              {/* Email Specific Message if no errors */}
              {campaignStats.type === "email" && (
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <p className="text-sm text-slate-500">
                    Emails have been queued and sent to the selected audience
                    list.
                  </p>
                </div>
              )}

              <button
                onClick={closePopup}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
