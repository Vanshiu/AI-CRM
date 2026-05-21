import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Users, 
  PhoneCall, 
  Briefcase, 
  LogOut, 
  Plus, 
  TrendingUp, 
  Clock, 
  Layers, 
  ChevronRight,
  Activity,
  LayoutDashboard,
  ClipboardList
} from 'lucide-react';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pendingFollowUps: 0,
    closedDeals: 0
  });

  // Fetch leads and aggregate statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/leads');
        if (res.data && res.data.success) {
          const fetchedLeads = res.data.data;
          setLeads(fetchedLeads);
          
          // Calculate dynamic metrics
          const total = fetchedLeads.length;
          
          const pendingFollowUps = fetchedLeads.filter(
            lead => lead.status !== 'Closed' && lead.followUpDate
          ).length;
          
          const closedDeals = fetchedLeads.filter(
            lead => lead.status === 'Closed'
          ).length;

          setStats({
            total,
            pendingFollowUps,
            closedDeals
          });
        }
      } catch (err) {
        console.error('Error fetching leads for dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Standard dummy data for Recent Activities
  const recentActivities = [
    {
      id: 1,
      type: 'lead',
      title: 'Sarah Jenkins registered',
      detail: 'Signed up via Webflow landing page integration.',
      time: '12 minutes ago',
      color: 'bg-emerald-500/10 text-emerald-400'
    },
    {
      id: 2,
      type: 'followup',
      title: 'Meeting scheduled with Acme Corp',
      detail: 'Demo review scheduled for Monday 10:00 AM by Alex.',
      time: '1 hour ago',
      color: 'bg-indigo-500/10 text-indigo-400'
    },
    {
      id: 3,
      type: 'deal',
      title: 'Deal closed: Beta Systems',
      detail: 'Contract valued at $12,400 finalized by billing.',
      time: '4 hours ago',
      color: 'bg-purple-500/10 text-purple-400'
    },
    {
      id: 4,
      type: 'lead',
      title: 'Lead re-assigned: David Miller',
      detail: 'Transferred from Growth team to Strategic sales pipeline.',
      time: '1 day ago',
      color: 'bg-amber-500/10 text-amber-400'
    }
  ];

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <nav className="bg-[#0f1422] border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight">AI CRM</span>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-500/20">SaaS Suite</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/10 text-xs font-bold transition-all duration-150"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link 
              to="/leads" 
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all duration-150"
            >
              <ClipboardList className="h-4 w-4" />
              Leads Workspace
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3.5 border-r border-slate-800 pr-5">
            <div className="h-8 w-8 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-sm">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-200">{user?.name || 'Authorized User'}</p>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide truncate max-w-[120px]">{user?.email}</p>
            </div>
          </div>

          <button 
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 font-semibold cursor-pointer transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8">
        
        {/* Mobile Navigation Header */}
        <div className="flex md:hidden items-center gap-2 pb-2">
          <span className="text-xs text-indigo-400 font-bold bg-[#0f1422] px-3 py-1.5 rounded-lg border border-slate-800/80">
            Dashboard
          </span>
          <Link to="/leads" className="text-xs text-slate-400 font-semibold bg-[#0f1422] px-3 py-1.5 rounded-lg border border-slate-800">
            Leads
          </Link>
        </div>

        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f1422] p-8 rounded-2xl border border-slate-800 shadow-md">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'User'}!
            </h2>
            <p className="text-sm text-slate-400 mt-1">Here is a summary of your CRM pipeline analytics for today.</p>
          </div>

          <Link 
            to="/leads"
            className="self-start md:self-auto flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-indigo-600/10 transition-all duration-200"
          >
            <Plus className="h-4 w-4" /> Manage Leads Workspace
          </Link>
        </section>

        {/* CRM Statistics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Total Leads */}
          <div className="bg-[#0f1422] p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between hover:border-[#1e293b] transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Leads</p>
                {loading ? (
                  <div className="h-8 w-14 bg-slate-800/60 rounded-lg animate-pulse mt-2"></div>
                ) : (
                  <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                    {stats.total}
                  </h3>
                )}
              </div>
              <div className="h-10 w-10 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
                <Users className="h-5 w-5" />
              </div>
            </div>
            
            <div className="border-t border-slate-800/80 pt-4 mt-6 flex items-center gap-1.5 text-xs text-slate-500">
              {loading ? (
                <div className="h-3 w-32 bg-slate-800/40 rounded animate-pulse"></div>
              ) : (
                <>
                  <span className="text-slate-400 font-semibold">{stats.total} leads</span>
                  <span>registered in pipeline</span>
                </>
              )}
            </div>
          </div>

          {/* Card 2: Pending Follow-Ups */}
          <div className="bg-[#0f1422] p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between hover:border-[#1e293b] transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Follow-Ups</p>
                {loading ? (
                  <div className="h-8 w-14 bg-slate-800/60 rounded-lg animate-pulse mt-2"></div>
                ) : (
                  <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                    {stats.pendingFollowUps}
                  </h3>
                )}
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
                <PhoneCall className="h-5 w-5" />
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-4 mt-6 flex items-center gap-1.5 text-xs text-slate-500">
              {loading ? (
                <div className="h-3 w-32 bg-slate-800/40 rounded animate-pulse"></div>
              ) : (
                <>
                  <span className="text-amber-400 font-semibold">{stats.pendingFollowUps} active</span>
                  <span>with scheduled follow-up dates</span>
                </>
              )}
            </div>
          </div>

          {/* Card 3: Closed Deals */}
          <div className="bg-[#0f1422] p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between hover:border-[#1e293b] transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Closed Deals</p>
                {loading ? (
                  <div className="h-8 w-14 bg-slate-800/60 rounded-lg animate-pulse mt-2"></div>
                ) : (
                  <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                    {stats.closedDeals}
                  </h3>
                )}
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-4 mt-6 flex items-center gap-1.5 text-xs text-slate-500">
              {loading ? (
                <div className="h-3 w-32 bg-slate-800/40 rounded animate-pulse"></div>
              ) : (
                <>
                  <span className="text-emerald-400 font-semibold">{stats.closedDeals} leads</span>
                  <span>successfully closed</span>
                </>
              )}
            </div>
          </div>

        </section>

        {/* Recent Activity Section */}
        <section className="bg-[#0f1422] rounded-2xl border border-slate-800 shadow-md p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              <h3 className="font-extrabold text-white text-base">Recent Sales Pipeline Activity</h3>
            </div>
            
            <Link to="/leads" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5">
              View All Logs <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Timeline list (Placeholder Log Section) */}
          <div className="space-y-4">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex gap-4 p-4 rounded-xl bg-[#13192a] border border-slate-800/60 hover:border-slate-800 transition-colors duration-150">
                <div className={`h-9 w-9 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${act.color}`}>
                  <Activity className="h-4.5 w-4.5" />
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white">{act.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{act.detail}</p>
                  </div>
                  
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 shrink-0 font-medium bg-[#0b0f19] px-2.5 py-1 rounded-full border border-slate-800/60">
                    <Clock className="h-3.5 w-3.5" /> {act.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#0b0f19] border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© 2026 AI CRM Enterprise Framework - SaaS Suite Client portal</p>
      </footer>
    </div>
  );
}

export default Dashboard;
