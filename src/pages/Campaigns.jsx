import React, { useState } from 'react';
import { Mail, Bell, Send } from 'lucide-react';

const Campaigns = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800">Campaign Manager</h2>
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveTab('email')} className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'email' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
          <Mail size={16} /> Email Blasts
        </button>
        <button onClick={() => setActiveTab('notification')} className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'notification' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
          <Bell size={16} /> Push Notifications
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">Draft New {activeTab === 'email' ? 'Email' : 'Notification'}</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
              <select className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                <option>All Users (12,450)</option>
                <option>Active Users (Last 30 days)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject / Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Campaign Title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Content Body</label>
              <textarea rows={activeTab === 'email' ? 10 : 3} value={body} onChange={(e) => setBody(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Write your content here..."></textarea>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Save Draft</button>
              <button className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"><Send size={16} /> Run Campaign</button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Past {activeTab === 'email' ? 'Emails' : 'Notifications'}</h3>
           <div className="space-y-4">
             {[1, 2, 3].map((i) => (
               <div key={i} className="pb-4 border-b border-slate-50 last:border-0">
                 <p className="font-semibold text-slate-800 text-sm truncate">{activeTab === 'email' ? "Update on FairFare Privacy Policy" : "Don't forget to log expenses"}</p>
                 <div className="flex justify-between items-center mt-2">
                   <span className="text-xs text-slate-400">Oct {10+i}, 2025</span>
                   <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Sent</span>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;