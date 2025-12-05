import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, CheckCircle, XCircle, Trash2, Plus } from 'lucide-react';
import { User, Category, Book } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AdminViewProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  categories: Category[];
  handleApproveCategory: (id: string) => void;
  books: Book[];
}

export const AdminView: React.FC<AdminViewProps> = ({ users, setUsers, categories, handleApproveCategory, books }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'approvals'>('analytics');
  const [newUser, setNewUser] = useState({ username: '', name: '', role: 'student' as const });

  const pendingCategories = categories.filter(c => c.status === 'pending');

  // Analytics Data
  const roleData = [
    { name: 'Admins', value: users.filter(u => u.role === 'admin').length },
    { name: 'Librarians', value: users.filter(u => u.role === 'librarian').length },
    { name: 'Students', value: users.filter(u => u.role === 'student').length },
  ];
  
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B'];

  const bookStats = categories.map(cat => ({
    name: cat.name,
    books: books.filter(b => b.categoryId === cat.id).length
  })).filter(item => item.books > 0);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.name) return;
    const user: User = {
      id: Date.now().toString(),
      username: newUser.username,
      name: newUser.name,
      role: newUser.role
    };
    setUsers([...users, user]);
    setNewUser({ username: '', name: '', role: 'student' });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg">
        <img 
          src="https://picsum.photos/1200/400?grayscale" 
          alt="Admin Dashboard" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-indigo-900/70 flex items-center px-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Hello, Admin</h1>
            <p className="text-indigo-200">Manage your library ecosystem effectively.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 pb-2">
        {['analytics', 'users', 'approvals'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              activeTab === tab 
                ? 'bg-indigo-600 text-white font-medium' 
                : 'text-gray-500 hover:bg-gray-100'
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">User Distribution</h3>
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
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Books per Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="books" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <form onSubmit={handleAddUser} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
               <div className="flex-1 w-full">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                 <input 
                    required
                    value={newUser.name}
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    placeholder="John Doe" 
                 />
               </div>
               <div className="flex-1 w-full">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                 <input 
                    required
                    value={newUser.username}
                    onChange={e => setNewUser({...newUser, username: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    placeholder="john.doe" 
                 />
               </div>
               <div className="w-full md:w-48">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                 <select 
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                 >
                   <option value="student">Student</option>
                   <option value="librarian">Librarian</option>
                   <option value="admin">Admin</option>
                 </select>
               </div>
               <button type="submit" className="w-full md:w-auto bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                 <Plus size={18} /> Add User
               </button>
            </form>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Username</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{user.name}</td>
                      <td className="px-6 py-4 text-gray-500">{user.username}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'librarian' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
               <BookOpen size={20} className="text-indigo-600"/>
               Pending Category Approvals
             </h3>
             {pendingCategories.length === 0 ? (
               <div className="text-center py-10 text-gray-400">All caught up! No pending categories.</div>
             ) : (
               <div className="grid gap-4">
                 {pendingCategories.map(cat => (
                   <div key={cat.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                     <div>
                       <h4 className="font-semibold text-gray-800">{cat.name}</h4>
                       <p className="text-xs text-gray-500">Suggested by Librarian ID: {cat.createdBy}</p>
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