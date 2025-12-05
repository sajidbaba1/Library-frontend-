import React, { useState, useEffect } from 'react';
import { AuthState, User, Role, Category, Book } from './types';
import { AdminView } from './components/AdminView';
import { LibrarianView } from './components/LibrarianView';
import { StudentView } from './components/StudentView';
import { Chatbot } from './components/Chatbot';
import { LogOut, Library } from 'lucide-react';

// --- MOCK DATA ---
const MOCK_USERS: User[] = [
  { id: '1', username: 'admin', name: 'Alice Admin', role: 'admin' },
  { id: '2', username: 'lib', name: 'Larry Librarian', role: 'librarian' },
  { id: '3', username: 'student', name: 'Sam Student', role: 'student' },
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Computer Science', status: 'approved', createdBy: '1' },
  { id: 'c2', name: 'History', status: 'pending', createdBy: '2' },
];

const INITIAL_BOOKS: Book[] = [
  { id: 'b1', title: 'The React Handbook', author: 'Flavio Copes', categoryId: 'c1', coverUrl: 'https://picsum.photos/seed/react/300/400', isBorrowed: false },
  { id: 'b2', title: 'Clean Code', author: 'Robert C. Martin', categoryId: 'c1', coverUrl: 'https://picsum.photos/seed/clean/300/400', isBorrowed: true, borrowedBy: '3' },
];

const App: React.FC = () => {
  // --- STATE ---
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, user: null, token: null });
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [usernameInput, setUsernameInput] = useState('');

  // --- ACTIONS ---
  const login = (role: Role) => {
    // Simulating login by picking the first user of that role from mock users
    // In a real app, verify username/password against backend and get JWT
    const user = MOCK_USERS.find(u => u.role === role);
    if (user) {
      const fakeToken = `jwt-${user.id}-${Date.now()}`;
      setAuth({ isAuthenticated: true, user, token: fakeToken });
      localStorage.setItem('authToken', fakeToken);
    }
  };
  
  const handleLogout = () => {
    setAuth({ isAuthenticated: false, user: null, token: null });
    localStorage.removeItem('authToken');
  };

  const handleApproveCategory = (id: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' } : c));
  };

  const addCategory = (name: string, userId: string) => {
    const newCat: Category = {
      id: Date.now().toString(),
      name,
      status: 'pending',
      createdBy: userId
    };
    setCategories([...categories, newCat]);
  };

  const addBook = (book: Book) => {
    setBooks([...books, book]);
  };

  const handleBorrow = (bookId: string) => {
    if (!auth.user) return;
    setBooks(prev => prev.map(b => 
      b.id === bookId ? { ...b, isBorrowed: true, borrowedBy: auth.user!.id } : b
    ));
    alert('You have borrowed this book successfully!');
  };

  // --- DERIVED DATA FOR AI CONTEXT ---
  const getContextData = () => {
    if (auth.user?.role === 'admin') {
      return JSON.stringify({
        totalUsers: users.length,
        totalBooks: books.length,
        pendingApprovals: categories.filter(c => c.status === 'pending').length
      });
    } else if (auth.user?.role === 'librarian') {
       return JSON.stringify({
        approvedCategories: categories.filter(c => c.status === 'approved').map(c => c.name),
        recentBooks: books.slice(-5).map(b => b.title)
       });
    } else {
       return JSON.stringify({
        availableBooks: books.filter(b => !b.isBorrowed).map(b => `${b.title} by ${b.author}`),
        categories: categories.filter(c => c.status === 'approved').map(c => c.name)
       });
    }
  };

  // --- RENDER ---
  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center">
          <div className="mb-6 flex justify-center text-indigo-600">
            <Library size={64} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">LibraMinds</h1>
          <p className="text-gray-500 mb-8">Select a role to simulate login (Demo)</p>
          
          <div className="space-y-3">
            <button 
              onClick={() => login('student')}
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-transform active:scale-95 shadow-lg shadow-orange-500/30"
            >
              Continue as Student
            </button>
            <button 
              onClick={() => login('librarian')}
              className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium transition-transform active:scale-95 shadow-lg shadow-teal-500/30"
            >
              Continue as Librarian
            </button>
            <button 
              onClick={() => login('admin')}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-transform active:scale-95 shadow-lg shadow-indigo-600/30"
            >
              Continue as Admin
            </button>
          </div>
          <p className="mt-6 text-xs text-gray-400">Uses Mock JWT & Local Storage</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar / Mobile Nav */}
      <aside className="bg-white w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-200 p-4 flex md:flex-col justify-between items-center md:items-stretch sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-0 md:mb-8">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Library size={24} />
          </div>
          <span className="font-bold text-xl text-gray-800 hidden md:inline">LibraMinds</span>
        </div>
        
        <div className="flex flex-row md:flex-col gap-2 md:mt-4">
             <div className="p-3 bg-gray-50 rounded-xl mb-2 hidden md:block">
                <p className="text-xs text-gray-500 uppercase font-bold">Current User</p>
                <p className="font-medium text-gray-800">{auth.user?.name}</p>
                <p className="text-xs text-indigo-600 capitalize">{auth.user?.role}</p>
             </div>
        </div>

        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors md:mt-auto"
        >
          <LogOut size={20} />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-80px)] md:h-screen">
        <div className="max-w-7xl mx-auto">
          {auth.user?.role === 'admin' && (
            <AdminView 
              users={users} 
              setUsers={setUsers} 
              categories={categories} 
              handleApproveCategory={handleApproveCategory}
              books={books}
            />
          )}
          {auth.user?.role === 'librarian' && (
            <LibrarianView 
              categories={categories} 
              books={books} 
              addCategory={addCategory} 
              addBook={addBook}
              currentUser={auth.user}
            />
          )}
          {auth.user?.role === 'student' && (
            <StudentView 
              books={books} 
              categories={categories} 
              handleBorrow={handleBorrow} 
              currentUser={auth.user}
            />
          )}
        </div>
      </main>

      {/* AI Chatbot Overlay */}
      <Chatbot role={auth.user?.role || 'student'} contextData={getContextData()} />
    </div>
  );
};

export default App;