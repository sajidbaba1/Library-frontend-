import React, { useState, useEffect } from 'react';
import { AuthState, User, Role, Category, Book, ThemeColor, FontOption, LibraryMessage, BorrowHistory, Review, TIER_RULES, MembershipTier } from './types';
import { AdminView } from './components/AdminView';
import { LibrarianView } from './components/LibrarianView';
import { StudentView } from './components/StudentView';
import { Chatbot } from './components/Chatbot';
import { Auth } from './components/Auth';
import { LogOut, Library, Sun, Moon, Palette, Bell, Settings, User as UserIcon, X, Check, Type, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---
const MOCK_USERS: User[] = [
  { id: '1', username: 'admin', name: 'Alice Admin', role: 'admin', avatarSeed: 'Alice', walletBalance: 100.00, fines: 0, tier: 'Standard' },
  { id: '2', username: 'lib', name: 'Larry Librarian', role: 'librarian', avatarSeed: 'Larry', walletBalance: 50.00, fines: 0, tier: 'Standard' },
  { id: '3', username: 'student', name: 'Sam Student', role: 'student', avatarSeed: 'Sam', walletBalance: 60.00, fines: 5.00, tier: 'Standard' },
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Computer Science', status: 'approved', createdBy: '1' },
  { id: 'c2', name: 'History', status: 'pending', createdBy: '2' },
  { id: 'c3', name: 'Fiction', status: 'approved', createdBy: '2' },
];

const INITIAL_BOOKS: Book[] = [
  { 
    id: 'b1', 
    title: 'The React Handbook', 
    author: 'Flavio Copes', 
    categoryId: 'c1', 
    coverUrl: 'https://picsum.photos/seed/react/300/400', 
    description: "A comprehensive guide to mastering React.js. From hooks to context, this book covers modern React development patterns and best practices for building scalable web applications.",
    isBorrowed: false,
    rating: 4.5,
    reviews: [
      { id: 'r1', userId: '3', userName: 'Sam Student', rating: 5, comment: 'Excellent resource for beginners!', date: '2023-11-15' }
    ]
  },
  { 
    id: 'b2', 
    title: 'Clean Code', 
    author: 'Robert C. Martin', 
    categoryId: 'c1', 
    coverUrl: 'https://picsum.photos/seed/clean/300/400', 
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. This book is a must-read for any developer wanting to become a better software craftsman.",
    isBorrowed: true, 
    borrowedBy: '3', 
    borrowDate: new Date(Date.now() - 15 * 86400000).toISOString(), // Borrowed 15 days ago
    dueDate: new Date(Date.now() - 1 * 86400000).toISOString(), // Due yesterday (Overdue)
    rating: 4.8,
    reviews: []
  },
  {
    id: 'b3',
    title: 'Dune',
    author: 'Frank Herbert',
    categoryId: 'c3',
    coverUrl: 'https://picsum.photos/seed/dune/300/400',
    description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange.",
    isBorrowed: false,
    rating: 4.9,
    reviews: [
       { id: 'r2', userId: '2', userName: 'Larry Librarian', rating: 5, comment: 'A masterpiece of science fiction.', date: '2023-10-10' }
    ]
  }
];

const AVATAR_SEEDS = ['Felix', 'Aneka', 'Zack', 'Midnight', 'Bear', 'Bella', 'Jack', 'Molly'];

const App: React.FC = () => {
  // --- STATE ---
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, user: null, token: null });
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [borrowHistory, setBorrowHistory] = useState<BorrowHistory[]>([]);
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
    const user = users.find(u => u.role === role);
    if (user) {
      authenticateUser(user);
    }
  };

  const register = (name: string, username: string, role: Role) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      username,
      role,
      avatarSeed: name,
      walletBalance: 0,
      fines: 0,
      tier: 'Standard'
    };
    setUsers([...users, newUser]);
    authenticateUser(newUser);
  };

  const authenticateUser = (user: User) => {
    const fakeToken = `jwt-${user.id}-${Date.now()}`;
    setAuth({ isAuthenticated: true, user, token: fakeToken });
    localStorage.setItem('authToken', fakeToken);
    if (user.role === 'admin') setThemeColor('indigo');
    if (user.role === 'librarian') setThemeColor('teal');
    if (user.role === 'student') setThemeColor('orange');
  }
  
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
    if (auth.user.fines > 0) {
      alert("You have outstanding fines. Please pay them before borrowing new books.");
      return;
    }

    // TIER LOGIC: Check Max Books
    const currentlyBorrowed = books.filter(b => b.borrowedBy === auth.user!.id && b.isBorrowed).length;
    const tierLimit = TIER_RULES[auth.user.tier].maxBooks;

    if (currentlyBorrowed >= tierLimit) {
      alert(`You have reached your borrow limit of ${tierLimit} books for the ${auth.user.tier} tier. Upgrade your membership to borrow more!`);
      return;
    }

    const now = new Date();
    const due = new Date();
    // TIER LOGIC: Loan Duration
    due.setDate(now.getDate() + TIER_RULES[auth.user.tier].loanDays);

    setBooks(prev => prev.map(b => 
      b.id === bookId ? { 
        ...b, 
        isBorrowed: true, 
        borrowedBy: auth.user!.id,
        borrowDate: now.toISOString(),
        dueDate: due.toISOString()
      } : b
    ));
    alert(`Book borrowed! Based on your ${auth.user.tier} membership, it is due on ${due.toLocaleDateString()}`);
  };

  const handleReturnBook = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (book && book.borrowedBy) {
      const now = new Date();
      let fineAmount = 0;
      
      // Calculate Fine
      if (book.dueDate) {
        const dueDate = new Date(book.dueDate);
        if (now > dueDate) {
          const diffTime = Math.abs(now.getTime() - dueDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          fineAmount = diffDays * 5; // $5 per day overdue
        }
      }

      // Add to history
      const record: BorrowHistory = {
        id: Date.now().toString(),
        bookId: book.id,
        bookTitle: book.title,
        bookCoverUrl: book.coverUrl,
        userId: book.borrowedBy,
        borrowDate: book.borrowDate || new Date().toISOString(),
        returnDate: new Date().toISOString()
      };
      setBorrowHistory(prev => [record, ...prev]);

      // Apply Fine to User
      if (fineAmount > 0) {
        setUsers(prev => prev.map(u => u.id === book.borrowedBy ? { ...u, fines: u.fines + fineAmount } : u));
        
        // Update local auth user if it's the current user (though usually librarian returns)
        if (auth.user?.id === book.borrowedBy) {
          setAuth(prev => prev.user ? ({ ...prev, user: { ...prev.user, fines: prev.user.fines + fineAmount } }) : prev);
        }
        
        alert(`Book returned overdue! A fine of $${fineAmount} has been applied to the user's account.`);
      }

      // Update book state
      setBooks(prev => prev.map(b => 
        b.id === bookId ? { 
          ...b, 
          isBorrowed: false, 
          borrowedBy: undefined,
          borrowDate: undefined,
          dueDate: undefined
        } : b
      ));
    }
  };

  const handleAddFunds = (amount: number) => {
    if(!auth.user) return;
    const updatedUser = { ...auth.user, walletBalance: auth.user.walletBalance + amount };
    setAuth({ ...auth, user: updatedUser });
    setUsers(prev => prev.map(u => u.id === auth.user!.id ? updatedUser : u));
  };

  const handlePayFine = (amount: number) => {
    if(!auth.user) return;
    if(auth.user.walletBalance >= amount) {
      const updatedUser = { 
        ...auth.user, 
        walletBalance: auth.user.walletBalance - amount,
        fines: Math.max(0, auth.user.fines - amount)
      };
      setAuth({ ...auth, user: updatedUser });
      setUsers(prev => prev.map(u => u.id === auth.user!.id ? updatedUser : u));
    }
  };

  const handleUpgradeTier = (tier: MembershipTier) => {
    if (!auth.user) return;
    const cost = TIER_RULES[tier].cost;
    
    if (auth.user.walletBalance >= cost) {
      const updatedUser: User = { 
        ...auth.user, 
        tier: tier,
        walletBalance: auth.user.walletBalance - cost
      };
      setAuth({ ...auth, user: updatedUser });
      setUsers(prev => prev.map(u => u.id === auth.user!.id ? updatedUser : u));
      alert(`Successfully upgraded to ${tier} Membership!`);
    } else {
      alert("Insufficient funds for this upgrade.");
    }
  };

  const updateProfile = (name: string, bio: string, avatarSeed: string) => {
    if (auth.user) {
      const updatedUser = { ...auth.user, name, bio, avatarSeed };
      setAuth({ ...auth, user: updatedUser });
      setUsers(prev => prev.map(u => u.id === auth.user!.id ? updatedUser : u));
    }
  };

  const handleAddReview = (bookId: string, reviewData: { rating: number; comment: string }) => {
    if (!auth.user) return;
    const newReview: Review = {
      id: Date.now().toString(),
      userId: auth.user.id,
      userName: auth.user.name,
      rating: reviewData.rating,
      comment: reviewData.comment,
      date: new Date().toISOString()
    };

    setBooks(prev => prev.map(b => {
      if (b.id === bookId) {
        const updatedReviews = [newReview, ...b.reviews];
        const avgRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;
        return { ...b, reviews: updatedReviews, rating: avgRating };
      }
      return b;
    }));
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
        userTier: auth.user?.tier,
        availableBooks: books.filter(b => !b.isBorrowed).map(b => `${b.title} by ${b.author}`),
        categories: categories.filter(c => c.status === 'approved').map(c => c.name)
       });
    }
  };

  // --- LOGIN SCREEN ---
  if (!auth.isAuthenticated) {
    return (
      <Auth 
        onLogin={login} 
        onRegister={register} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
      />
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
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-tight truncate">{auth.user?.name}</p>
                    <p className={`text-xs capitalize text-${themeColor}-500`}>{auth.user?.role}</p>
                    {auth.user?.role === 'student' && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Crown size={10} className={`text-${TIER_RULES[auth.user.tier].color}-500 fill-current`} />
                        <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">{auth.user.tier}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 flex justify-between text-xs">
                   <span>Wallet:</span>
                   <span className="font-bold text-green-500">${auth.user?.walletBalance.toFixed(2)}</span>
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
           <h2 className="text-xl font-semibold capitalize font-serif flex items-center gap-2">
             {auth.user?.role} Dashboard
             {auth.user?.role === 'student' && (
               <span className={`text-xs px-2 py-0.5 rounded-full bg-${TIER_RULES[auth.user.tier].color}-100 text-${TIER_RULES[auth.user.tier].color}-700 border border-${TIER_RULES[auth.user.tier].color}-200 flex items-center gap-1`}>
                 <Crown size={12} /> {auth.user.tier} Member
               </span>
             )}
           </h2>

           <div className="flex items-center gap-4">
              {/* Wallet Indicator (Header) */}
              <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium border border-green-200 dark:border-green-800">
                ${auth.user?.walletBalance.toFixed(2)}
              </div>

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
                users={users}
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
                onAddReview={handleAddReview}
                borrowHistory={borrowHistory}
                onAddFunds={handleAddFunds}
                onPayFine={handlePayFine}
                onUpgradeTier={handleUpgradeTier}
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