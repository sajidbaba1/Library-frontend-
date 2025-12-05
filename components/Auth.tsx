import React, { useState } from 'react';
import { Library, Sun, Moon, UserPlus, LogIn, ArrowRight } from 'lucide-react';
import { Role, User } from '../types';

interface AuthProps {
  onLogin: (role: Role) => void;
  onRegister: (name: string, username: string, role: Role) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onRegister, isDarkMode, toggleDarkMode }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    role: 'student' as Role
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.username) {
      onRegister(formData.name, formData.username, formData.role);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
      <button 
        onClick={toggleDarkMode} 
        className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className={`p-8 rounded-3xl shadow-2xl w-full max-w-md text-center transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <div className={`mb-6 flex justify-center ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
          <Library size={64} />
        </div>
        <h1 className="text-3xl font-bold mb-2 font-serif">LibraMinds</h1>
        <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {isRegistering ? 'Create your account' : 'Welcome back to your library'}
        </p>
        
        {!isRegistering ? (
          <div className="space-y-3">
             <p className="text-xs uppercase font-bold text-gray-400 mb-2">Quick Login (Demo)</p>
            <button onClick={() => onLogin('student')} className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2">
              <LogIn size={18} /> Continue as Student
            </button>
            <button onClick={() => onLogin('librarian')} className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2">
              <LogIn size={18} /> Continue as Librarian
            </button>
            <button onClick={() => onLogin('admin')} className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2">
              <LogIn size={18} /> Continue as Admin
            </button>
            
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <button 
                onClick={() => setIsRegistering(true)}
                className="text-sm text-indigo-500 hover:text-indigo-600 font-semibold flex items-center justify-center gap-1 mx-auto"
              >
                New user? Register here <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">Full Name</label>
              <input 
                required
                type="text"
                className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">Username</label>
              <input 
                required
                type="text"
                className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">Role</label>
              <select 
                className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as Role})}
              >
                <option value="student">Student</option>
                <option value="librarian">Librarian</option>
              </select>
            </div>
            
            <button type="submit" className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mt-4">
               <UserPlus size={18} /> Create Account
            </button>

            <button 
              type="button"
              onClick={() => setIsRegistering(false)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-center mt-2"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};