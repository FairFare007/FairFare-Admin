import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import NotificationCampaigns from "./NotificationCampaigns";
import EmailCampaigns from "./EmailCampaigns";
import { Bell, Mail } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "email", label: "Email", icon: Mail },
];

const Campaigns = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "notifications";

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Campaigns
        </h2>
        <p className="text-slate-400">
          Reach your users through notifications and email
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 mb-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === tab.id
                ? "text-white"
                : "text-slate-400 hover:text-slate-200"
              }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className={`absolute inset-0 rounded-xl ${tab.id === "notifications"
                    ? "bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border border-blue-500/30"
                    : "bg-gradient-to-r from-purple-600/20 to-pink-500/20 border border-purple-500/30"
                  }`}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <tab.icon size={18} className="relative z-10" />
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "notifications" ? (
          <NotificationCampaigns />
        ) : (
          <EmailCampaigns />
        )}
      </motion.div>
    </Layout>
  );
};

export default Campaigns;
