import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  Key,
  Send,
  Users,
  CheckCircle,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
} from "lucide-react";

const Layout = ({ onLogout }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();

  // Helper to highlight active link
  const isActive = (path) => location.pathname === path;

  const SidebarItem = ({ to, label, icon: Icon }) => (
    <Link
      to={to}
      onClick={() => setShowMobileMenu(false)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isActive(to)
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform ${
          showMobileMenu ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 ease-in-out`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <Shield size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">FairFare</span>
          </div>
          <button
            onClick={() => setShowMobileMenu(false)}
            className="md:hidden text-slate-400"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <SidebarItem to="/" label="Overview" icon={LayoutDashboard} />
          <SidebarItem
            to="/password-reset"
            label="Password Resets"
            icon={Key}
          />
          <SidebarItem to="/campaigns" label="Campaigns" icon={Send} />
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase">
              Management
            </p>
          </div>
          <SidebarItem to="/users" label="User Database" icon={Users} />
          <SidebarItem to="/logs" label="System Logs" icon={CheckCircle} />
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 transition-all">
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="md:hidden text-slate-500"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-slate-800 capitalize">
              {/* Dynamically show title based on route */}
              {location.pathname === "/"
                ? "Overview"
                : location.pathname.replace("/", "").replace("-", " ")}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2">
              <Search size={16} className="text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Global Search..."
                className="bg-transparent border-none outline-none text-sm w-48"
              />
            </div>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <Link to="/admin-profile">
              <div className="h-8 w-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                AD
              </div>
            </Link>
          </div>
        </header>

        {/* This is where the Page components will render */}
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
