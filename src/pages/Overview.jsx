import { MOCK_STATS } from '../data/mockData';

const Overview = () => (
  <div className="space-y-6 animate-fade-in">
    <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {MOCK_STATS.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{stat.title}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
            <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${stat.change.includes('+') ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
              {stat.change}
            </span>
          </div>
          <div className={`${stat.color} p-3 rounded-lg text-white shadow-lg shadow-indigo-100`}>
            <stat.icon size={24} />
          </div>
        </div>
      ))}
    </div>
    
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mt-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">System Live Feed</h3>
      <div className="space-y-4">
        {[1,2,3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <p className="text-sm text-slate-600 flex-1">New user registration <span className="font-semibold">User#{2024 + i}</span> via Android App.</p>
            <span className="text-xs text-slate-400">Just now</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Overview;