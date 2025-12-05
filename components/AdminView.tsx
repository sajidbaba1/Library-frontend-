import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BookOpen, CheckCircle, XCircle, Trash2, Plus, Crown, TrendingUp, Edit, Save, X, RotateCcw, Bookmark, CreditCard, Clock, Activity, BarChart as ChartIcon, AlertCircle } from 'lucide-react';
import { User, Category, Book, ThemeColor, TIER_RULES, Role, BorrowHistory } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface AdminViewProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  categories: Category[];
  handleApproveCategory: (id: string) => void;
  books: Book[];
  themeColor: ThemeColor;
  borrowHistory?: BorrowHistory[];
}

export const AdminView: React.FC<AdminViewProps> = ({ users, setUsers, categories, handleApproveCategory, books, themeColor, borrowHistory = [] }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'approvals'>('analytics');
  
  // User Form State
  const [formData, setFormData] = useState({ username: '', name: '', role: 'student' as Role });
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // User Detail Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const pendingCategories = categories.filter(c => c.status === 'pending');

  // Analytics Data
  const roleData = [
    { name: 'Admins', value: users.filter(u => u.role === 'admin').length },
    { name: 'Librarians', value: users.filter(u => u.role === 'librarian').length },
    { name: 'Students', value: users.filter(u => u.role === 'student').length },
  ];
  
  // Use shades of the theme color or a fixed palette that looks good in dark mode
  const COLORS = ['#6366f1', '#10B981', '#F59E0B'];

  const bookStats = categories.map(cat => ({
    name: cat.name,
    books: books.filter(b => b.categoryId === cat.id).length
  })).filter(item => item.books > 0);

  // Revenue Calculation (Mock based on users tier)
  const totalRevenue = users.reduce((acc, user) => acc + TIER_RULES[user.tier].cost, 0);
  
  // Reservation Stats
  const activeReservations = books.filter(b => b.reservedBy).length;

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.name) return;

    if (editingId) {
      // Update existing user
      setUsers(users.map(u => 
        u.id === editingId 
          ? { ...u, name: formData.name, username: formData.username, role: formData.role } 
          : u
      ));
      alert(`User ${formData.name} updated successfully.`);
      setEditingId(null);
    } else {
      // Create new user
      const user: User = {
        id: Date.now().toString(),
        username: formData.username,
        name: formData.name,
        role: formData.role,
        avatarSeed: formData.name, // Default avatar seed
        walletBalance: 0,
        fines: 0,
        tier: 'Standard'
      };
      setUsers([...users, user]);
      alert(`User ${formData.name} created successfully.`);
    }
    setFormData({ username: '', name: '', role: 'student' });
  };

  const handleEditClick = (e: React.MouseEvent, user: User) => {
    e.stopPropagation(); // Prevent opening detail modal
    setFormData({ username: user.username, name: user.name, role: user.role });
    setEditingId(user.id);
    const formElement = document.getElementById('user-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setFormData({ username: '', name: '', role: 'student' });
    setEditingId(null);
  };

  const handleDeleteUser = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent opening detail modal
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(u => u.id !== id));
      if (editingId === id) handleCancelEdit();
    }
  };
  
  const getUserBorrowingStats = (userId: string) => {
     // Mocking some data points for the chart based on actual history count
     const userHistoryCount = borrowHistory.filter(h => h.userId === userId).length;
     return [
       { name: 'Jan', books: Math.floor(userHistoryCount * 0.1) },
       { name: 'Feb', books: Math.floor(userHistoryCount * 0.2) },
       { name: 'Mar', books: Math.floor(userHistoryCount * 0.4) },
       { name: 'Apr', books: Math.floor(userHistoryCount * 0.1) },
       { name: 'May', books: Math.floor(userHistoryCount * 0.2) },
     ];
  };

  return (
    <div className="space-y-6">
      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, rotateX: 10 }}
               animate={{ opacity: 1, scale: 1, rotateX: 0 }}
               exit={{ opacity: 0, scale: 0.95, rotateX: 10 }}
               className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] border border-gray-100 dark:border-gray-700"
             >
                {/* Left Panel: Digital ID Card */}
                <div className="w-full md:w-1/3 bg-gray-50 dark:bg-gray-900 p-8 flex flex-col items-center justify-center border-r border-gray-200 dark:border-gray-700 relative overflow-hidden">
                   {/* Decorative Gradients */}
                   <div className={`absolute top-0 right-0 w-64 h-64 bg-${themeColor}-500/10 rounded-full blur-3xl -mr-20 -mt-20`} />
                   <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20" />
                   
                   <div className="relative z-10 w-full">
                      <div className="aspect-[3/4.5] rounded-2xl bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-white/5 backdrop-blur-md border border-white/20 shadow-2xl p-6 flex flex-col items-center text-center relative overflow-hidden group">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity duration-500">
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                        </div>

                        <div className="absolute top-4 right-4">
                           <Crown size={24} className={`text-${TIER_RULES[selectedUser.tier].color}-500 drop-shadow-sm`} />
                        </div>
                        
                        <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg mb-4 mt-8">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.avatarSeed}`} className="w-full h-full rounded-full" />
                        </div>
                        
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1 font-serif">{selectedUser.name}</h2>
                        <p className="text-sm text-gray-500 mb-6 font-mono bg-white/50 dark:bg-black/30 px-2 py-0.5 rounded">ID: {selectedUser.id}</p>
                        
                        <div className="w-full space-y-3 mt-auto">
                           <div className="flex justify-between items-center text-sm p-2 bg-white/60 dark:bg-black/20 rounded-lg">
                             <span className="text-gray-500 dark:text-gray-400">Role</span>
                             <span className="font-bold capitalize">{selectedUser.role}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm p-2 bg-white/60 dark:bg-black/20 rounded-lg">
                             <span className="text-gray-500 dark:text-gray-400">Status</span>
                             <span className="font-bold text-green-600 flex items-center gap-1"><CheckCircle size={12}/> Active</span>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Right Panel: Detailed Stats */}
                <div className="flex-1 p-8 overflow-y-auto">
                   <div className="flex justify-between items-center mb-6">
                     <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                       <Activity className={`text-${themeColor}-500`} /> User Analytics
                     </h3>
                     <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                       <X size={24} className="text-gray-500" />
                     </button>
                   </div>
                   
                   <div className="grid grid-cols-3 gap-4 mb-8">
                     <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
                        <div className="flex items-center gap-2 text-green-600 mb-1">
                          <CreditCard size={18} />
                          <span className="text-xs font-bold uppercase">Wallet</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">${selectedUser.walletBalance.toFixed(2)}</p>
                     </div>
                     <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                        <div className="flex items-center gap-2 text-red-600 mb-1">
                          <AlertCircle size={18} />
                          <span className="text-xs font-bold uppercase">Fines</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">${selectedUser.fines.toFixed(2)}</p>
                     </div>
                     <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                          <BookOpen size={18} />
                          <span className="text-xs font-bold uppercase">Read</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                          {borrowHistory.filter(h => h.userId === selectedUser.id).length}
                        </p>
                     </div>
                   </div>

                   <div className="mb-6">
                     <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                       <ChartIcon size={18} /> Activity Trends
                     </h4>
                     <div className="h-48 w-full bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 p-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={getUserBorrowingStats(selectedUser.id)}>
                            <defs>
                              <linearGradient id="colorBooks" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={`var(--color-${themeColor}-500, #6366f1)`} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={`var(--color-${themeColor}-500, #6366f1)`} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                            <Area type="monotone" dataKey="books" stroke={`var(--color-${themeColor}-500, #6366f1)`} fillOpacity={1} fill="url(#colorBooks)" />
                          </AreaChart>
                        </ResponsiveContainer>
                     </div>
                   </div>

                   <div>
                     <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                       <Clock size={18} /> Recent History
                     </h4>
                     <div className="space-y-3">
                       {borrowHistory.filter(h => h.userId === selectedUser.id).slice(0, 3).map(record => (
                         <div key={record.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700">
                            <div className="w-10 h-14 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                               <img src={record.bookCoverUrl} className="w-full h-full object-cover" />
                            </div>
                            <div>
                               <p className="font-bold text-sm text-gray-800 dark:text-white line-clamp-1">{record.bookTitle}</p>
                               <p className="text-xs text-gray-500">Returned: {new Date(record.returnDate).toLocaleDateString()}</p>
                            </div>
                         </div>
                       ))}
                       {borrowHistory.filter(h => h.userId === selectedUser.id).length === 0 && (
                         <p className="text-gray-400 text-sm italic">No reading history available.</p>
                       )}
                     </div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg">
        <img 
          src="https://picsum.photos/1200/400?grayscale" 
          alt="Admin Dashboard" 
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-${themeColor}-900/70 flex items-center px-8 backdrop-blur-sm`}>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Hello, Admin</h1>
            <p className="text-white/80">Manage your library ecosystem effectively.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        {['analytics', 'users', 'approvals'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              activeTab === tab 
                ? `bg-${themeColor}-600 text-white font-medium shadow-md shadow-${themeColor}-500/30` 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Revenue Metric */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                 <p className="opacity-80 font-medium mb-1">Total Membership Revenue</p>
                 <h3 className="text-3xl font-bold flex items-center gap-2">
                   ${totalRevenue.toFixed(2)}
                   <TrendingUp size={24} className="opacity-50" />
                 </h3>
                 <p className="text-sm opacity-60 mt-2">Simulated revenue from all user tiers</p>
               </div>
               
               <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                 <div className="p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full">
                   <Bookmark size={24} />
                 </div>
                 <div>
                   <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Reservations</p>
                   <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{activeReservations}</h3>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">User Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {roleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none', color: '#fff' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Books per Category</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bookStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none', color: '#fff' }} />
                      <Bar dataKey="books" fill={`var(--color-${themeColor}-500, #6366f1)`} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div id="user-form" className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border-2 ${editingId ? `border-${themeColor}-500` : 'border-gray-100 dark:border-gray-700'} transition-colors`}>
               <div className="flex justify-between items-center mb-4">
                 <h3 className={`text-lg font-bold flex items-center gap-2 ${editingId ? `text-${themeColor}-600` : 'text-gray-800 dark:text-white'}`}>
                   {editingId ? <Edit size={20} /> : <Plus size={20} />} 
                   {editingId ? 'Edit User Details' : 'Add New User'}
                 </h3>
                 {editingId && (
                   <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 flex items-center gap-1 text-sm">
                     <RotateCcw size={14} /> Cancel
                   </button>
                 )}
               </div>
               
               <form onSubmit={handleSubmitUser} className="flex flex-col md:flex-row gap-4 items-end">
                 <div className="flex-1 w-full">
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                   <input 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" 
                      placeholder="John Doe" 
                   />
                 </div>
                 <div className="flex-1 w-full">
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                   <input 
                      required
                      value={formData.username}
                      onChange={e => setFormData({...formData, username: e.target.value})}
                      className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" 
                      placeholder="john.doe" 
                   />
                 </div>
                 <div className="w-full md:w-48">
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                   <select 
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value as Role})}
                      className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                   >
                     <option value="student">Student</option>
                     <option value="librarian">Librarian</option>
                     <option value="admin">Admin</option>
                   </select>
                 </div>
                 <button 
                   type="submit" 
                   className={`w-full md:w-auto px-6 py-2 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all ${
                     editingId 
                       ? `bg-green-600 hover:bg-green-700 text-white shadow-green-500/30` 
                       : `bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white shadow-${themeColor}-500/30`
                   }`}
                 >
                   {editingId ? <Save size={18} /> : <Plus size={18} />} 
                   {editingId ? 'Update User' : 'Add User'}
                 </button>
               </form>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Tier</th>
                    <th className="px-6 py-4">Wallet</th>
                    <th className="px-6 py-4">Fines</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {users.map(user => (
                    <tr 
                      key={user.id} 
                      onClick={() => setSelectedUser(user)}
                      className={`transition-colors cursor-pointer ${editingId === user.id ? `bg-${themeColor}-50 dark:bg-${themeColor}-900/10` : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                           {user.name}
                           {editingId === user.id && <span className="text-xs text-green-600 font-bold bg-green-100 px-1.5 py-0.5 rounded-full">Editing</span>}
                        </div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                          user.role === 'librarian' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         {user.role === 'student' ? (
                           <span className={`flex items-center gap-1 font-bold text-xs text-${TIER_RULES[user.tier].color}-600`}>
                             <Crown size={12} /> {user.tier}
                           </span>
                         ) : (
                           <span className="text-gray-400 text-xs">-</span>
                         )}
                      </td>
                      <td className="px-6 py-4 text-green-600 font-medium">${user.walletBalance.toFixed(2)}</td>
                      <td className="px-6 py-4">
                         <span className={`${user.fines > 0 ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
                           ${user.fines.toFixed(2)}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={(e) => handleEditClick(e, user)} 
                            className={`p-2 rounded-lg transition-colors ${
                              editingId === user.id 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30' 
                                : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                            }`}
                            title="Edit User"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteUser(e, user.id)} 
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
             <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-white">
               <BookOpen size={20} className={`text-${themeColor}-600`} />
               Pending Category Approvals
             </h3>
             {pendingCategories.length === 0 ? (
               <div className="text-center py-10 text-gray-400">All caught up! No pending categories.</div>
             ) : (
               <div className="grid gap-4">
                 {pendingCategories.map(cat => (
                   <div key={cat.id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/30 transition-colors">
                     <div>
                       <h4 className="font-semibold text-gray-800 dark:text-gray-200">{cat.name}</h4>
                       <p className="text-xs text-gray-500 dark:text-gray-400">Suggested by Librarian ID: {cat.createdBy}</p>
                     </div>
                     <div className="flex gap-2">
                       <button 
                          onClick={() => handleApproveCategory(cat.id)}
                          className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                         <CheckCircle size={16} /> Approve
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}
      </motion.div>
    </div>
  );
};