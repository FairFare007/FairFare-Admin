import { Users, Send, AlertCircle, TrendingUp } from 'lucide-react';

export const INITIAL_PASSWORD_REQUESTS = [
  { id: 1, name: "Arjun Mehta", email: "arjun.m@example.com", issue: "Forgot Password", status: "Pending", time: "10 mins ago" },
  { id: 2, name: "Priya Sharma", email: "priya.s@example.com", issue: "OTP not received", status: "Pending", time: "2 hrs ago" },
  { id: 3, name: "Rohan Das", email: "rohan.d@example.com", issue: "Account Locked", status: "Urgent", time: "5 hrs ago" },
];

export const MOCK_STATS = [
  { title: "Total Users", value: "12,450", change: "+12%", icon: Users, color: "bg-blue-500" },
  { title: "Active Campaigns", value: "3", change: "Running", icon: Send, color: "bg-purple-500" },
  { title: "Pending Tickets", value: "15", change: "-2", icon: AlertCircle, color: "bg-orange-500" },
  { title: "App Revenue", value: "₹4.2L", change: "+8%", icon: TrendingUp, color: "bg-green-500" },
];