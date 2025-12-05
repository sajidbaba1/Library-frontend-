import React, { useState, useEffect } from 'react';
import { AuthState, User, Role, Category, Book, ThemeColor, FontOption, LibraryMessage } from './types';
import { AdminView } from './components/AdminView';
import { LibrarianView } from './components/LibrarianView';
import { StudentView } from './components/StudentView';
import { Chatbot } from './components/Chatbot';
import { LogOut, Library, Sun, Moon, Palette, Bell, Settings, User as UserIcon, X, Check, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---
const MOCK_USERS: User[] = [
  { id: '1', username: 'admin', name: 'Alice Admin', role: 'admin', avatarSeed: 'Alice' },
  { id: '2', username: 'lib', name: 'Larry Librarian', role: 'librarian', avatarSeed: 'Larry' },
  { id: '3', username: 'student', name: 'Sam Student', role: 'student', avatarSeed: 'Sam' },
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Computer Science', status: 'approved', createdBy: '1' },
  { id: 'c2', name: 'History', status: 'pending', createdBy: '2' },
];

const INITIAL_BOOKS: Book[] = [
  { id: 'b1', title: 'The React Handbook', author: 'Flavio Copes', categoryId: 'c1', coverUrl: 'https://picsum.photos/seed/react/300/400', isBorrowed: false },
  { id: 'b2', title: 'Clean Code', author: 'Robert C. Martin', categoryId: 'c1', coverUrl: 'https://picsum.photos/seed/clean/300/400', isBorrowed: true, borrowedBy: '3', borrowDate: new Date().toISOString(), dueDate: new Date(Date.now() + 7 * 86400000).toISOString() },
];

const AVATAR_SEEDS = ['Felix', 'Aneka', 'Zack', 'Midnight', 'Bear', 'Bella', 'Jack', 'Molly'];

const App: React.FC = () => {
  // --- STATE ---
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, user: null, token: null });
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [libraryMessages, setLibraryMessages] = useState<LibraryMessage[]>([]);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState<ThemeColor>('indigo');
  const [fontFamily, setFontFamily] = useState<FontOption>('inter');
  
  const [showAppearanceMenu, setShowAppearanceMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // --- NOTIFICATIONS ---
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Welcome to LibraMinds!', read: false },
    { id: 2, text: 'System maintenance scheduled for midnight.', read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // --- THEME EFFECT ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const root = document.body;
    root.classList.remove('font-sans', 'font-poppins', 'font-serif', 'font-mono');
    if (fontFamily === 'inter') root.classList.add('font-sans');
    if (fontFamily === 'poppins') root.classList.add('font-poppins');
    if (fontFamily === 'serif') root.classList.add('font-serif');
    if (fontFamily === 'mono') root.classList.add('font-mono');
  }, [fontFamily]);

  // --- ACTIONS ---
  const login = (role: Role) => {
    const user = MOCK_USERS.find(u => u.role === role);
    if (user) {
      const fakeToken = `jwt-${user.id}-${Date.now()}`;
      setAuth({ isAuthenticated: true, user, token: fakeToken });
      localStorage.setItem('authToken', fakeToken);
      if (role === 'admin') setThemeColor('indigo');
      if (role === 'librarian') setThemeColor('teal');
      if (role === 'student') setThemeColor('orange');
    }
  };
  
  const handleLogout = () => {
    setAuth({ isAuthenticated: false, user: null, token: null });
    localStorage.removeItem('authToken');
    setShowProfileMenu(false);
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
    const now = new Date();
    const due = new Date();
    due.setDate(now.getDate() + 14); // 2 weeks loan

    setBooks(prev => prev.map(b => 
      b.id === bookId ? { 
        ...b, 
        isBorrowed: true, 
        borrowedBy: auth.user!.id,
        borrowDate: now.toISOString(),
        dueDate: due.toISOString()
      } : b
    ));
    alert('You have borrowed this book successfully! Due date: ' + due.toLocaleDateString());
  };

  const handleReturnBook = (bookId: string) => {
    setBooks(prev => prev.map(b => 
      b.id === bookId ? { 
        ...b, 
        isBorrowed: false, 
        borrowedBy: undefined,
        borrowDate: undefined,
        dueDate: undefined
      } : b
    ));
  };

  const updateProfile = (name: string, bio: string, avatarSeed: string) => {
    if (auth.user) {
      const updatedUser = { ...auth.user, name, bio, avatarSeed };
      setAuth({ ...auth, user: updatedUser });
      setUsers(prev => prev.map(u => u.id === auth.user!.id ? updatedUser : u));
    }
  };

  const sendMessage = (text: string) => {
    if (!auth.user) return;
    const msg: LibraryMessage = {
      id: Date.now().toString(),
      senderId: auth.user.id,
      senderName: auth.user.name,
      text,
      timestamp: Date.now(),
      isFromLibrarian: auth.user.role === 'librarian'
    };
    setLibraryMessages(prev => [...prev, msg]);
  };

  // --- CONTEXT ---
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
        recentBooks: books.slice(-5).map(b => b.title),
        overdueBooks: books.filter(b => b.isBorrowed && b.dueDate && new Date(b.dueDate) < new Date()).length
       });
    } else {
       return JSON.stringify({
        availableBooks: books.filter(b => !b.isBorrowed).map(b => `${b.title} by ${b.author}`),
        categories: categories.filter(c => c.status === 'approved').map(c => c.name)
       });
    }
  };

  // --- LOGIN SCREEN ---
  if (!auth.isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
         <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className={`p-8 rounded-3xl shadow-2xl w-full max-w-md text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
          <div className={`mb-6 flex justify-center ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            <Library size={64} />
          </div>
          <h1 className="text-3xl font-bold mb-2 font-serif">LibraMinds</h1>
          <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Select a role to simulate login (Demo)</p>
          
          <div className="space-y-3">
            <button onClick={() => login('student')} className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30">
              Continue as Student
            </button>
            <button onClick={() => login('librarian')} className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium shadow-lg shadow-teal-500/30">
              Continue as Librarian
            </button>
            <button onClick={() => login('admin')} className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/30">
              Continue as Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN LAYOUT ---
  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Sidebar */}
      <aside className={`w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r p-4 flex md:flex-col justify-between items-center md:items-stretch sticky top-0 z-30 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-0 md:mb-8">
          <div className={`p-2 rounded-lg text-white bg-${themeColor}-600`}>
            <Library size={24} />
          </div>
          <span className="font-bold text-xl hidden md:inline font-serif">LibraMinds</span>
        </div>
        
        {/* Mobile-only header controls */}
        <div className="flex md:hidden items-center gap-2">
           <div className="relative">
             <button onClick={() => setShowAppearanceMenu(!showAppearanceMenu)} className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
               <Palette size={18} />
             </button>
              <AnimatePresence>
                  {showAppearanceMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={`absolute right-0 top-full mt-2 p-4 rounded-2xl shadow-xl border w-72 z-50 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}
                    >
                      <div className="space-y-4">
                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Dark Mode</span>
                          <button 
                            onClick={() => setIsDarkMode(!isDarkMode)} 
                            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
                          >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                          </button>
                        </div>

                        {/* Colors */}
                        <div>
                          <span className="text-sm font-medium block mb-2">Accent Color</span>
                          <div className="grid grid-cols-4 gap-2">
                             {['indigo', 'blue', 'teal', 'emerald', 'rose', 'orange', 'purple', 'cyan'].map((color) => (
                              <button
                                key={color}
                                onClick={() => setThemeColor(color as ThemeColor)}
                                className={`w-8 h-8 rounded-full bg-${color}-500 hover:scale-110 transition-transform flex items-center justify-center ring-2 ring-offset-2 ${themeColor === color ? `ring-${color}-500` : 'ring-transparent'} ${isDarkMode ? 'ring-offset-gray-800' : 'ring-offset-white'}`}
                              >
                                {themeColor === color && <Check size={14} className="text-white" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Typography */}
                        <div>
                          <span className="text-sm font-medium block mb-2">Typography</span>
                          <div className="grid grid-cols-2 gap-2">
                            {(['inter', 'poppins', 'serif', 'mono'] as FontOption[]).map((font) => (
                              <button
                                key={font}
                                onClick={() => setFontFamily(font)}
                                className={`px-3 py-2 text-xs rounded-lg border capitalize transition-all ${
                                  fontFamily === font 
                                    ? `bg-${themeColor}-100 text-${themeColor}-700 border-${themeColor}-500 dark:bg-${themeColor}-900/30 dark:text-${themeColor}-300` 
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                              >
                                {font}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
           </div>
           
           <div className="relative">
             <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.user?.avatarSeed}`} alt="avatar" />
             </button>
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg border py-2 z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                  >
                    <button onClick={() => { setShowSettingsModal(true); setShowProfileMenu(false); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <Settings size={16} /> Settings
                    </button>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>

        {/* Desktop Sidebar Content */}
        <div className="hidden md:flex flex-col gap-2 md:mt-4">
             <div className={`p-3 rounded-xl mb-2 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className="text-xs text-gray-400 uppercase font-bold">Current User</p>
                <div className="flex items-center gap-2 mt-1">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.user?.avatarSeed}`} alt="avatar" className="w-8 h-8 rounded-full bg-white" />
                  <div>
                    <p className="font-medium text-sm leading-tight">{auth.user?.name}</p>
                    <p className={`text-xs capitalize text-${themeColor}-500`}>{auth.user?.role}</p>
                  </div>
                </div>
             </div>
        </div>

        <button 
          onClick={handleLogout} 
          className="hidden md:flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors md:mt-auto"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navigation Bar (Desktop) */}
        <header className={`relative z-50 hidden md:flex justify-between items-center px-8 py-4 border-b transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
           <h2 className="text-xl font-semibold capitalize font-serif">
             {auth.user?.role} Dashboard
           </h2>

           <div className="flex items-center gap-4">
              {/* Appearance Menu */}
              <div className="relative">
                <button 
                  onClick={() => setShowAppearanceMenu(!showAppearanceMenu)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors border ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <Palette size={18} className={`text-${themeColor}-500`} />
                  <span className="text-sm font-medium">Appearance</span>
                </button>
                <AnimatePresence>
                  {showAppearanceMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={`absolute right-0 top-full mt-2 p-4 rounded-2xl shadow-xl border w-72 z-50 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}
                    >
                      <div className="space-y-4">
                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Dark Mode</span>
                          <button 
                            onClick={() => setIsDarkMode(!isDarkMode)} 
                            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
                          >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                          </button>
                        </div>

                        {/* Colors */}
                        <div>
                          <span className="text-sm font-medium block mb-2">Accent Color</span>
                          <div className="grid grid-cols-4 gap-2">
                             {['indigo', 'blue', 'teal', 'emerald', 'rose', 'orange', 'purple', 'cyan'].map((color) => (
                              <button
                                key={color}
                                onClick={() => setThemeColor(color as ThemeColor)}
                                className={`w-8 h-8 rounded-full bg-${color}-500 hover:scale-110 transition-transform flex items-center justify-center ring-2 ring-offset-2 ${themeColor === color ? `ring-${color}-500` : 'ring-transparent'} ${isDarkMode ? 'ring-offset-gray-800' : 'ring-offset-white'}`}
                              >
                                {themeColor === color && <Check size={14} className="text-white" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Typography */}
                        <div>
                          <span className="text-sm font-medium block mb-2">Typography</span>
                          <div className="grid grid-cols-2 gap-2">
                            {(['inter', 'poppins', 'serif', 'mono'] as FontOption[]).map((font) => (
                              <button
                                key={font}
                                onClick={() => setFontFamily(font)}
                                className={`px-3 py-2 text-xs rounded-lg border capitalize transition-all ${
                                  fontFamily === font 
                                    ? `bg-${themeColor}-100 text-${themeColor}-700 border-${themeColor}-500 dark:bg-${themeColor}-900/30 dark:text-${themeColor}-300` 
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                              >
                                {font}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Bell size={20} />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                  )}
                </button>
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute right-0 mt-2 w-80 rounded-xl shadow-lg border py-2 z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                    >
                      <div className="px-4 py-2 border-b dark:border-gray-700 font-semibold text-sm">Notifications</div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map(n => (
                          <div key={n.id} className={`px-4 py-3 text-sm border-b dark:border-gray-700 last:border-0 ${n.read ? 'opacity-50' : 'font-medium'}`}>
                            {n.text}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile */}
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className={`w-9 h-9 rounded-full bg-${themeColor}-100 overflow-hidden ring-2 ring-${themeColor}-500/20`}>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.user?.avatarSeed}`} alt="avatar" />
                  </div>
                </button>
                 <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg border py-2 z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                    >
                      <div className="px-4 py-2 border-b dark:border-gray-700 mb-1">
                        <p className="text-sm font-bold">{auth.user?.name}</p>
                        <p className="text-xs opacity-70 truncate">{auth.user?.username}</p>
                      </div>
                      <button onClick={() => { setShowSettingsModal(true); setShowProfileMenu(false); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                        <Settings size={16} /> Settings
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
           </div>
        </header>

        {/* Scrollable Main View */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto pb-20">
            {auth.user?.role === 'admin' && (
              <AdminView 
                users={users} 
                setUsers={setUsers} 
                categories={categories} 
                handleApproveCategory={handleApproveCategory}
                books={books}
                themeColor={themeColor}
              />
            )}
            {auth.user?.role === 'librarian' && (
              <LibrarianView 
                categories={categories} 
                books={books} 
                addCategory={addCategory} 
                addBook={addBook}
                currentUser={auth.user}
                themeColor={themeColor}
                handleReturnBook={handleReturnBook}
                messages={libraryMessages}
                sendMessage={sendMessage}
              />
            )}
            {auth.user?.role === 'student' && (
              <StudentView 
                books={books} 
                categories={categories} 
                handleBorrow={handleBorrow} 
                currentUser={auth.user}
                themeColor={themeColor}
                messages={libraryMessages}
                sendMessage={sendMessage}
              />
            )}
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 relative ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
            >
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Settings className={`text-${themeColor}-500`} /> Settings
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3 opacity-70">Choose Avatar</label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {AVATAR_SEEDS.map(seed => (
                      <button 
                        key={seed}
                        onClick={() => updateProfile(auth.user?.name || '', auth.user?.bio || '', seed)}
                        className={`rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${auth.user?.avatarSeed === seed ? `border-${themeColor}-500 ring-2 ring-${themeColor}-500/30` : 'border-transparent'}`}
                      >
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt="avatar" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 opacity-70">Display Name</label>
                  <input 
                    type="text" 
                    value={auth.user?.name}
                    onChange={(e) => updateProfile(e.target.value, auth.user?.bio || '', auth.user?.avatarSeed || '')}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-${themeColor}-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 opacity-70">Bio</label>
                  <textarea 
                    rows={3}
                    placeholder="Tell us about yourself..."
                    value={auth.user?.bio}
                    onChange={(e) => updateProfile(auth.user?.name || '', e.target.value, auth.user?.avatarSeed || '')}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-${themeColor}-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className={`px-4 py-2 rounded-lg bg-${themeColor}-600 text-white hover:bg-${themeColor}-700 shadow-lg shadow-${themeColor}-500/20`}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Chatbot Overlay */}
      <Chatbot role={auth.user?.role || 'student'} contextData={getContextData()} themeColor={themeColor} />
    </div>
  );
};

export default App;