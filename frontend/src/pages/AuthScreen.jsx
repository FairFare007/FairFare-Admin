import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

const AuthScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (isLogin) {
        onLogin();
      } else {
        alert("Request Sent! Admin will review your request.");
        setIsLogin(true);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">FairFare Admin</h1>
          <p className="text-slate-500 mt-2">{isLogin ? "Welcome back, Administrator" : "Request Admin Privileges"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input type="email" required className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="admin@fairfare.app" />
          </div>
          
          {isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" required className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="••••••••" />
            </div>
          )}

          {!isLogin && (
             <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Access</label>
             <textarea className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Why do you need admin access?" rows="3"></textarea>
           </div>
          )}

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors flex justify-center items-center" disabled={isLoading}>
            {isLoading ? <RefreshCw className="animate-spin h-5 w-5" /> : (isLogin ? "Login to Dashboard" : "Submit Request")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {isLogin ? <p>New here? <button onClick={() => setIsLogin(false)} className="text-indigo-600 font-semibold hover:underline">Request Access</button></p> 
                   : <p>Already have access? <button onClick={() => setIsLogin(true)} className="text-indigo-600 font-semibold hover:underline">Back to Login</button></p>}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;