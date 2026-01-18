import { useState } from 'react';
import {  
  CheckCircle, 
  Search, 
  MoreVertical, 
  Filter, 
  Download, 
  AlertTriangle, 
  XCircle, 
  Clock 
} from 'lucide-react';

// --- MOCK DATA FOR USERS ---
const MOCK_USERS = [
  { id: 1, name: "Arjun Mehta", email: "arjun.m@example.com", role: "Admin", status: "Active", joined: "Oct 24, 2025", lastActive: "2 mins ago" },
  { id: 2, name: "Priya Sharma", email: "priya.s@example.com", role: "User", status: "Active", joined: "Nov 01, 2025", lastActive: "1 day ago" },
  { id: 3, name: "Rohan Das", email: "rohan.d@example.com", role: "User", status: "Inactive", joined: "Sep 15, 2025", lastActive: "2 weeks ago" },
  { id: 4, name: "Sarah Williams", email: "sarah.w@example.com", role: "User", status: "Active", joined: "Dec 10, 2025", lastActive: "5 hours ago" },
  { id: 5, name: "Vikram Singh", email: "vikram.s@example.com", role: "Editor", status: "Suspended", joined: "Aug 20, 2025", lastActive: "1 month ago" },
];

// --- MOCK DATA FOR LOGS ---
const MOCK_LOGS = [
  { id: 101, event: "Password Reset", user: "Admin (You)", status: "Success", time: "10:42 AM", date: "Today" },
  { id: 102, event: "Campaign Sent", user: "System", status: "Success", time: "09:00 AM", date: "Today" },
  { id: 103, event: "Failed Login Attempt", user: "Unknown (IP: 192.168.x.x)", status: "Error", time: "02:15 AM", date: "Today" },
  { id: 104, event: "Database Backup", user: "System Cron", status: "Warning", time: "12:00 AM", date: "Today", note: "Latency detected" },
  { id: 105, event: "New User Registered", user: "Sarah Williams", status: "Success", time: "11:30 PM", date: "Yesterday" },
];

// --- COMPONENTS ---

export const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = MOCK_USERS.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">User Database</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
        <Search size={20} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search users by name or email..." 
          className="flex-1 outline-none text-slate-700 placeholder-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">User</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Role</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Last Active</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium 
                      ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 
                        user.status === 'Suspended' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : user.status === 'Suspended' ? 'bg-red-500' : 'bg-slate-400'}`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {user.lastActive}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                    No users found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
          <p>Showing {filteredUsers.length} entries</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 bg-white rounded hover:bg-slate-50 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-slate-200 bg-white rounded hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LogsPage = () => {
  const getStatusIcon = (status) => {
    switch(status) {
      case 'Success': return <CheckCircle size={18} className="text-green-500" />;
      case 'Error': return <XCircle size={18} className="text-red-500" />;
      case 'Warning': return <AlertTriangle size={18} className="text-orange-500" />;
      default: return <Clock size={18} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">System Logs</h2>
        <button className="text-sm text-indigo-600 font-medium hover:underline">Clear History</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700">Recent Activity</h3>
            <span className="text-xs text-slate-500 bg-white px-2 py-1 border border-slate-200 rounded">Live Monitoring</span>
        </div>
        
        <div className="divide-y divide-slate-100">
            {MOCK_LOGS.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
                    <div className={`mt-1 p-2 rounded-full bg-slate-50 border border-slate-100`}>
                        {getStatusIcon(log.status)}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-slate-800 text-sm">{log.event}</h4>
                            <span className="text-xs text-slate-400">{log.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            User: <span className="font-medium text-slate-700">{log.user}</span>
                        </p>
                        {log.note && (
                            <p className="text-xs text-orange-600 mt-1 bg-orange-50 inline-block px-2 py-0.5 rounded border border-orange-100">
                                Note: {log.note}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
        <button className="w-full py-3 text-sm text-slate-500 font-medium hover:bg-slate-50 transition-colors border-t border-slate-100">
            View All Logs
        </button>
      </div>
    </div>
  );
};