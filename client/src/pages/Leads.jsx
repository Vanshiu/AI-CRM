import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Users, 
  LogOut, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  X, 
  AlertCircle, 
  Layers, 
  Calendar, 
  Mail, 
  Phone,
  LayoutDashboard,
  ClipboardList,
  List,
  Columns,
  Sparkles,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import KanbanBoard from '../components/kanban/KanbanBoard';

function Leads() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null); // Used for Edit or Delete
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'

  // AI Reply State variables
  const [activeModalTab, setActiveModalTab] = useState('details');
  const [customerMessage, setCustomerMessage] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [generatingReply, setGeneratingReply] = useState(false);
  const [aiError, setAiError] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  const [toastMessage, setToastMessage] = useState({ text: '', type: '' });

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    status: 'New Lead',
    notes: '',
    followUpDate: ''
  });
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch all leads
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leads');
      if (res.data && res.data.success) {
        setLeads(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to fetch leads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Open Create Lead Modal
  const openCreateModal = () => {
    setFormData({
      customerName: '',
      email: '',
      phone: '',
      status: 'New Lead',
      notes: '',
      followUpDate: ''
    });
    setFormError('');
    setModalType('create');
    // Reset AI States
    setActiveModalTab('details');
    setCustomerMessage('');
    setGeneratedReply('');
    setAiError('');
    setCopiedText(false);
    setToastMessage({ text: '', type: '' });
    setIsFormModalOpen(true);
  };

  // Open Edit Lead Modal
  const openEditModal = (lead) => {
    const formattedDate = lead.followUpDate 
      ? new Date(lead.followUpDate).toISOString().split('T')[0]
      : '';
      
    setFormData({
      customerName: lead.customerName || '',
      email: lead.email || '',
      phone: lead.phone || '',
      status: lead.status || 'New Lead',
      notes: lead.notes || '',
      followUpDate: formattedDate
    });
    setSelectedLead(lead);
    setFormError('');
    setModalType('edit');
    // Reset AI States
    setActiveModalTab('details');
    setCustomerMessage('');
    setGeneratedReply('');
    setAiError('');
    setCopiedText(false);
    setToastMessage({ text: '', type: '' });
    setIsFormModalOpen(true);
  };

  // Open Delete Confirmation Modal
  const openDeleteModal = (lead) => {
    setSelectedLead(lead);
    setIsDeleteModalOpen(true);
  };

  // Handle Form Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form Validation & Submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Basic Validation
    if (!formData.customerName.trim()) {
      setFormError('Customer name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Customer email is required.');
      return;
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }

    try {
      setFormSubmitting(true);
      if (modalType === 'create') {
        const res = await api.post('/leads', formData);
        if (res.data && res.data.success) {
          setLeads(prev => [res.data.data, ...prev]);
          setIsFormModalOpen(false);
          showToast('Lead contact registered successfully!');
        }
      } else {
        const res = await api.put(`/leads/${selectedLead._id}`, formData);
        if (res.data && res.data.success) {
          setLeads(prev => prev.map(l => l._id === selectedLead._id ? res.data.data : l));
          setIsFormModalOpen(false);
          showToast('Lead updates applied successfully!');
        }
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      const serverMessage = err.response?.data?.message || 'Something went wrong. Please check your input.';
      setFormError(serverMessage);
      showToast(serverMessage, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Lead Handler
  const handleDeleteSubmit = async () => {
    try {
      const res = await api.delete(`/leads/${selectedLead._id}`);
      if (res.data && res.data.success) {
        setLeads(prev => prev.filter(l => l._id !== selectedLead._id));
        setIsDeleteModalOpen(false);
        showToast('Lead record deleted successfully!');
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
      showToast('Failed to delete lead. Please try again.', 'error');
    }
  };

  // Handle status update from Kanban drag-and-drop (Optimistic Update)
  const handleStatusChange = async (leadId, newStatus) => {
    const originalLeads = [...leads];
    
    setLeads(prev => prev.map(lead => 
      lead._id === leadId ? { ...lead, status: newStatus } : lead
    ));

    try {
      await api.put(`/leads/${leadId}`, { status: newStatus });
    } catch (err) {
      console.error('Failed to update lead status via drag-and-drop:', err);
      setLeads(originalLeads);
      const serverMessage = err.response?.data?.message || 'Failed to persist status change. Reverting.';
      setError(serverMessage);
      setTimeout(() => setError(''), 4000);
    }
  };

  // Toast notification trigger
  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage({ text: '', type: '' });
    }, 3000);
  };

  // Generate AI Reply Suggestion
  const handleGenerateReply = async (e) => {
    if (e) e.preventDefault();
    
    if (!customerMessage.trim()) {
      setAiError('Please enter a customer message first.');
      showToast('Please enter a customer message.', 'error');
      return;
    }

    if (generatingReply) return; // Prevent duplicate concurrent API requests

    try {
      setGeneratingReply(true);
      setAiError('');
      setGeneratedReply('');
      setCopiedText(false);

      const res = await api.post('/ai/reply', { message: customerMessage.trim() });
      if (res.data && res.data.success) {
        setGeneratedReply(res.data.data.reply);
        showToast('AI suggestion generated successfully!');
      } else {
        throw new Error('Invalid response structure received from server.');
      }
    } catch (err) {
      console.error('Error generating AI reply:', err);
      const msg = err.response?.data?.message || 'Failed to connect to the AI service. Please try again.';
      setAiError(msg);
      showToast(msg, 'error');
    } finally {
      setGeneratingReply(false);
    }
  };

  // Copy Suggestion to Clipboard
  const handleCopyReply = () => {
    if (!generatedReply) return;
    
    navigator.clipboard.writeText(generatedReply)
      .then(() => {
        setCopiedText(true);
        showToast('Copied to clipboard!');
        setTimeout(() => setCopiedText(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text:', err);
        showToast('Failed to copy to clipboard.', 'error');
      });
  };

  // Filtering Logic (Client side for fast dynamic updates)
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Kanban filtered leads (ignores status filters, respects search term queries)
  const kanbanFilteredLeads = leads.filter(lead => {
    return (
      lead.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Get status pill styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'New Lead':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Interested':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'Payment Pending':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Closed':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

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
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all duration-150"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link 
              to="/leads" 
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/10 text-xs font-bold transition-all duration-150"
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

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-6">
        
        {/* Mobile Navigation Header */}
        <div className="flex md:hidden items-center gap-2 pb-2">
          <Link to="/dashboard" className="text-xs text-slate-400 font-semibold bg-[#0f1422] px-3 py-1.5 rounded-lg border border-slate-800">
            Dashboard
          </Link>
          <span className="text-xs text-indigo-400 font-bold bg-[#0f1422] px-3 py-1.5 rounded-lg border border-slate-800/80">
            Leads
          </span>
        </div>

        {/* Page Title Section */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              Leads Pipeline
            </h2>
            <p className="text-sm text-slate-400 mt-1">Manage and track prospective pipeline contacts in real-time.</p>
          </div>

          <button 
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-indigo-600/10 transition-all duration-200 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" /> Add Lead Entry
          </button>
        </section>

        {/* Filters and Search Bar */}
        <section className="bg-[#0f1422] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-md">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by name, email, phone or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#080b11] border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-transparent transition-all duration-150"
            />
          </div>

          {/* Filters & View Toggles */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto shrink-0 justify-end">
            {/* Dropdown Filter (Only visible in Table mode to prevent Kanban grid hiding columns) */}
            {viewMode === 'table' && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500 hidden sm:inline" />
                <span className="text-xs text-slate-400 hidden sm:inline font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#080b11] border border-slate-800 text-xs text-slate-300 rounded-xl px-3.5 py-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all duration-150 w-full sm:w-auto"
                >
                  <option value="All">All Statuses</option>
                  <option value="New Lead">New Lead</option>
                  <option value="Interested">Interested</option>
                  <option value="Payment Pending">Payment Pending</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            )}

            {/* View Mode Toggle Switcher */}
            <div className="flex bg-[#080b11] border border-slate-800 rounded-xl p-0.5 w-full sm:w-auto justify-center">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 flex-1 sm:flex-initial ${
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Table View"
              >
                <List className="h-4 w-4" />
                <span>Table</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 flex-1 sm:flex-initial ${
                  viewMode === 'kanban'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Pipeline Kanban Board"
              >
                <Columns className="h-4 w-4" />
                <span>Pipeline</span>
              </button>
            </div>
          </div>
        </section>

        {/* Database Action Alert Notification */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 text-xs">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Content Section: Loading, Empty, Table, or Kanban Board */}
        {loading ? (
          viewMode === 'table' ? (
            /* Table Loading Skeleton */
            <div className="bg-[#0f1422] border border-slate-800 rounded-2xl shadow-md overflow-hidden animate-pulse">
              <div className="bg-[#0b0f19] border-b border-slate-800 h-12 w-full"></div>
              <div className="p-6 space-y-5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between gap-4 border-b border-slate-800/40 pb-4 last:border-b-0 last:pb-0">
                    <div className="space-y-2 flex-1">
                      <div className="h-4.5 bg-slate-800/80 rounded w-1/4"></div>
                      <div className="h-3 bg-slate-800/40 rounded w-1/3"></div>
                    </div>
                    <div className="h-6 bg-slate-800/60 rounded w-20"></div>
                    <div className="h-4 bg-slate-800/40 rounded w-1/3 hidden md:block"></div>
                    <div className="h-8 bg-slate-800/60 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Kanban Loading Skeleton */
            <div className="flex flex-row lg:grid lg:grid-cols-4 gap-6 w-full overflow-hidden animate-pulse">
              {[1, 2, 3, 4].map((col) => (
                <div key={col} className="flex flex-col bg-[#0f1422]/60 border border-slate-800/80 rounded-2xl p-4 w-full min-w-[280px] sm:min-w-[320px] lg:min-w-0 min-h-[500px] flex-1 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-4.5 bg-slate-800/80 rounded w-1/3"></div>
                    <div className="h-5 bg-slate-800/60 rounded-full w-6"></div>
                  </div>
                  {[1, 2].map((card) => (
                    <div key={card} className="bg-[#0b0f19]/60 border border-slate-800/60 rounded-xl p-4.5 space-y-3">
                      <div className="h-4 bg-slate-800/80 rounded w-3/4"></div>
                      <div className="space-y-1.5 pt-1">
                        <div className="h-3 bg-slate-800/40 rounded w-5/6"></div>
                        <div className="h-3 bg-slate-800/40 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )
        ) : leads.length === 0 ? (
          /* Total Empty State Container */
          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl shadow-md py-20 px-6 text-center max-w-md mx-auto">
            <div className="h-14 w-14 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-5 mx-auto">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-white">No Lead Contacts Found</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Begin your sales pipeline by recording your first enterprise lead. Add contact coordinates, status milestones, and scheduler tasks.
            </p>
            <button 
              onClick={openCreateModal}
              className="mt-6 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-lg transition-all duration-150 mx-auto"
            >
              <Plus className="h-3.5 w-3.5" /> Record First Lead
            </button>
          </div>
        ) : viewMode === 'kanban' ? (
          /* Kanban Board View */
          kanbanFilteredLeads.length === 0 ? (
            /* Empty Filtered State for Kanban */
            <div className="bg-[#0f1422] border border-slate-800 rounded-2xl shadow-md py-20 px-6 text-center max-w-md mx-auto">
              <div className="h-14 w-14 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-5 mx-auto">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-white">No Matching Leads</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                We couldn't find any leads matching your current search query "{searchTerm}" in the status pipeline.
              </p>
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-6 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer border border-indigo-500/20 hover:border-indigo-500/40 bg-indigo-600/5 px-4 py-2 rounded-xl transition-all duration-150 mx-auto"
              >
                Clear Search Query
              </button>
            </div>
          ) : (
            <KanbanBoard 
              leads={kanbanFilteredLeads} 
              onStatusChange={handleStatusChange} 
              onEditLead={openEditModal} 
            />
          )
        ) : (
          /* Table View Mode */
          <section className="bg-[#0f1422] border border-slate-800 rounded-2xl shadow-md overflow-hidden">
            {filteredLeads.length === 0 ? (
              /* Filtered Empty State Container */
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-md mx-auto">
                <div className="h-14 w-14 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-5">
                  <Users className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-white">No Lead Contacts Found</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  We couldn't find any leads matching your current search queries or status filter configurations.
                </p>
                <button 
                  onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}
                  className="mt-6 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer border border-indigo-500/20 hover:border-indigo-500/40 bg-indigo-600/5 px-4 py-2 rounded-xl transition-all duration-150"
                >
                  Clear Active Filters
                </button>
              </div>
            ) : (
              /* Leads Table */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0b0f19] border-b border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Customer Details</th>
                      <th className="px-6 py-4">Status Badge</th>
                      <th className="px-6 py-4">Notes Log</th>
                      <th className="px-6 py-4">Follow-Up Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300">
                    {filteredLeads.map((lead) => (
                      <tr key={lead._id} className="hover:bg-[#13192a]/30 transition-colors duration-150">
                        {/* Name & Contacts */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-white text-sm">{lead.customerName}</div>
                          <div className="flex flex-col gap-1 mt-1.5 text-[11px] text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3 w-3 text-slate-500" />
                              <span>{lead.email}</span>
                            </div>
                            {lead.phone && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-3 w-3 text-slate-500" />
                                <span>{lead.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Status Badges */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${getStatusBadge(lead.status)}`}>
                            {lead.status}
                          </span>
                        </td>

                        {/* Notes Summary */}
                        <td className="px-6 py-4 max-w-xs">
                          <div className="text-slate-400 line-clamp-2 leading-relaxed break-words font-medium">
                            {lead.notes || <span className="text-slate-600 italic">No notes logged</span>}
                          </div>
                        </td>

                        {/* Follow-up Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {lead.followUpDate ? (
                            <div className="flex items-center gap-2 text-slate-300 font-semibold bg-[#0b0f19] px-2.5 py-1 rounded-lg border border-slate-800/60 inline-flex">
                              <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                              <span>{new Date(lead.followUpDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          ) : (
                            <span className="text-slate-600 italic">Unscheduled</span>
                          )}
                        </td>

                        {/* Actions Buttons */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => openEditModal(lead)}
                              className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-[#13192a] border border-transparent hover:border-slate-800 flex items-center justify-center cursor-pointer transition-all duration-150"
                              title="Edit Lead Details"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => openDeleteModal(lead)}
                              className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#13192a] border border-transparent hover:border-slate-800 flex items-center justify-center cursor-pointer transition-all duration-150"
                              title="Delete Lead Record"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0b0f19] border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© 2026 AI CRM Enterprise Framework - SaaS Suite Client portal</p>
      </footer>

      {/* CREATE & EDIT LEAD DIALOG MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#0f1422] border border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-scaleIn">
            {/* Modal Header */}
            <div className="bg-[#0b0f19] px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-extrabold text-white text-base tracking-tight">
                {modalType === 'create' ? 'Record New Lead Entry' : 'Modify Lead Coordinates'}
              </h3>
              <button 
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Tabs Selector */}
            <div className="flex bg-[#0b0f19] px-6 border-b border-slate-800">
              <button
                type="button"
                onClick={() => setActiveModalTab('details')}
                className={`px-4 py-3 text-xs font-bold border-b-2 cursor-pointer transition-all duration-150 ${
                  activeModalTab === 'details'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Customer Details
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('ai-reply')}
                className={`px-4 py-3 text-xs font-bold border-b-2 cursor-pointer transition-all duration-150 flex items-center gap-1.5 ${
                  activeModalTab === 'ai-reply'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                AI Reply Assistant
              </button>
            </div>

            {/* Modal Content conditional render based on activeModalTab */}
            {activeModalTab === 'details' ? (
              /* Modal Form body */
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                
                {/* Form Validation Notice */}
                {formError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl flex items-center gap-2.5 text-xs">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Grid 2-column input row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Customer Name *</label>
                    <input 
                      type="text" 
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      placeholder="Enter customer name..."
                      className="w-full bg-[#080b11] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-transparent transition-all duration-150"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address *</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="customer@example.com"
                      className="w-full bg-[#080b11] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-transparent transition-all duration-150"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Phone Number</label>
                    <input 
                      type="text" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +1 (555) 019-2834"
                      className="w-full bg-[#080b11] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-transparent transition-all duration-150"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Lead Status Milestone</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-[#080b11] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer transition-all duration-150"
                    >
                      <option value="New Lead">New Lead</option>
                      <option value="Interested">Interested</option>
                      <option value="Payment Pending">Payment Pending</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Follow-Up Schedule Date</label>
                  <input 
                    type="date" 
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleInputChange}
                    className="w-full bg-[#080b11] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all duration-150"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Notes / Pipeline logs</label>
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Record customer preferences, target deal sizes, or team communication logs here..."
                    rows="3"
                    className="w-full bg-[#080b11] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-transparent transition-all duration-150 resize-none"
                  />
                </div>

                {/* Action Buttons inside Form */}
                <div className="flex justify-end gap-3.5 border-t border-slate-800/80 pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4.5 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-transparent border border-slate-800 hover:bg-[#13192a] rounded-xl cursor-pointer transition-all duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10 transition-all duration-150 disabled:opacity-50"
                  >
                    {formSubmitting ? 'Saving coordinates...' : modalType === 'create' ? 'Create Lead Entry' : 'Apply Updates'}
                  </button>
                </div>

              </form>
            ) : (
              /* AI Reply Generation Assistant Tab View */
              <div className="p-6 space-y-5 animate-fadeIn">
                {/* AI Section Intro */}
                <div className="bg-indigo-950/20 border border-indigo-500/10 rounded-xl p-4 flex gap-3 items-start">
                  <Sparkles className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Gemini Customer Response Draft</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Input the inquiry sent by the client. The CRM AI Engine will construct a natural, human-like sales reply suggestion.
                    </p>
                  </div>
                </div>

                {/* Customer Message input box */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Incoming Customer Message</label>
                  <textarea
                    value={customerMessage}
                    onChange={(e) => setCustomerMessage(e.target.value)}
                    disabled={generatingReply}
                    placeholder="Paste the customer's question or message here (e.g., 'What is the price of the plan?' or 'Can I schedule a live demo?')..."
                    rows="4"
                    className="w-full bg-[#080b11] border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-transparent transition-all duration-150 resize-none disabled:opacity-60"
                  />
                </div>

                {/* Trigger / Action Bar */}
                <div className="flex justify-between items-center gap-4">
                  <div className="text-[10px] text-slate-500 font-medium">
                    {customerMessage.trim().length} characters entered
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateReply}
                    disabled={generatingReply || !customerMessage.trim()}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10 transition-all duration-150 disabled:opacity-50"
                  >
                    {generatingReply ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Analyzing Message...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Generate AI Reply</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Error state presentation inline inside tab */}
                {aiError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 text-xs animate-fadeIn">
                    <AlertCircle className="h-5 w-5 shrink-0 animate-pulse" />
                    <span>{aiError}</span>
                  </div>
                )}

                {/* Generated Draft presentation container */}
                {generatedReply && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Professional Reply suggestion
                      </label>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                        Ready
                      </span>
                    </div>

                    <div className="bg-[#0b0f19] border border-indigo-500/10 rounded-xl p-4.5 space-y-3 relative shadow-inner">
                      <p className="text-xs text-slate-300 leading-relaxed font-medium select-all">
                        {generatedReply}
                      </p>

                      {/* suggestion card action panel */}
                      <div className="flex justify-end gap-2 border-t border-slate-800/80 pt-3 mt-1.5">
                        <button
                          type="button"
                          onClick={handleGenerateReply}
                          disabled={generatingReply}
                          className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 font-bold border border-slate-800 hover:bg-[#13192a] px-3.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-50"
                          title="Produce a slightly different phrasing of this reply"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Regenerate
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyReply}
                          className={`flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                            copiedText
                              ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/20'
                              : 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600/25'
                          }`}
                        >
                          {copiedText ? (
                            <>
                              <Check className="h-3 w-3" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copy Suggestion
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal footer with Close button to close modal */}
                <div className="flex justify-end border-t border-slate-800/80 pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4.5 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-transparent border border-slate-800 hover:bg-[#13192a] rounded-xl cursor-pointer transition-all duration-150"
                  >
                    Close Assistant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#0f1422] border border-slate-800 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-scaleIn">
            <div className="p-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto mb-2">
                <Trash2 className="h-5.5 w-5.5" />
              </div>
              <h3 className="font-extrabold text-white text-base tracking-tight">Delete Lead Record</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you absolutely sure you want to delete <span className="font-bold text-slate-200">"{selectedLead?.customerName}"</span>? This pipeline contact record will be permanently deleted from the database.
              </p>

              <div className="flex gap-3 pt-4 justify-center">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full py-2 text-xs font-semibold text-slate-400 bg-transparent border border-slate-800 hover:bg-[#13192a] rounded-xl cursor-pointer transition-all duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSubmit}
                  className="w-full py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl cursor-pointer transition-all duration-150 shadow-md shadow-rose-600/10"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Interactive SaaS Toast Alert */}
      {toastMessage.text && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold shadow-2xl z-[100] animate-fadeIn backdrop-blur-md ${
          toastMessage.type === 'error'
            ? 'bg-rose-950/90 border-rose-500/30 text-rose-300'
            : 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
        }`}>
          {toastMessage.type === 'error' ? (
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          ) : (
            <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

    </div>
  );
}

export default Leads;
