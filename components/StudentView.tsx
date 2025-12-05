import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, MessageCircle, Send, Star, Clock, Wallet, Sparkles, Loader2, X, Mic, Trophy, Award, Medal, ChevronLeft, ChevronRight, Check, Bookmark } from 'lucide-react';
import { Book, Category, User, ThemeColor, LibraryMessage, Review, BorrowHistory, AIRecommendation, MembershipTier, TIER_RULES } from '../types';
import { BookDetailsModal } from './BookDetailsModal';
import { WalletPanel } from './WalletPanel';
import { getBookRecommendations } from '../services/geminiService';

interface StudentViewProps {
  books: Book[];
  categories: Category[];
  handleBorrow: (bookId: string) => void;
  handleReserve: (bookId: string) => void;
  currentUser: User;
  themeColor: ThemeColor;
  messages: LibraryMessage[];
  sendMessage: (text: string) => void;
  onAddReview: (bookId: string, review: Omit<Review, 'id' | 'userId' | 'userName' | 'date'>) => void;
  borrowHistory: BorrowHistory[];
  onAddFunds: (amount: number) => void;
  onPayFine: (amount: number) => void;
  onUpgradeTier: (tier: MembershipTier) => void;
}

export const StudentView: React.FC<StudentViewProps> = ({ 
  books, categories, handleBorrow, handleReserve, currentUser, themeColor, messages, sendMessage, onAddReview, borrowHistory, onAddFunds, onPayFine, onUpgradeTier 
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'chat' | 'history' | 'wallet'>('browse');
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [chatInput, setChatInput] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  // Voice Search State
  const [isListening, setIsListening] = useState(false);
  
  // AI Recommendation State
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);
  const [showRecs, setShowRecs] = useState(false);

  // Carousel Ref
  const carouselRef = useRef<HTMLDivElement>(null);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(filter.toLowerCase()) || book.author.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || book.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';

  const handleSendChat = () => {
    if(!chatInput.trim()) return;
    sendMessage(chatInput);
    setChatInput('');
  };

  const handleGetRecommendations = async () => {
    setIsGeneratingRecs(true);
    setShowRecs(true);
    
    const userHistoryTitles = borrowHistory
      .filter(h => h.userId === currentUser.id)
      .map(h => h.bookTitle);
      
    const recs = await getBookRecommendations(userHistoryTitles, books);
    setRecommendations(recs);
    setIsGeneratingRecs(false);
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setFilter(transcript);
      };

      recognition.start();
    } else {
      alert("Voice search is not supported in this browser.");
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Gamification Logic
  const myHistory = borrowHistory.filter(h => h.userId === currentUser.id);
  const myReviews = books.reduce((acc, book) => acc + book.reviews.filter(r => r.userId === currentUser.id).length, 0);
  
  const badges = [
    { id: 1, name: 'Novice Reader', desc: 'Borrowed your first book', icon: <BookOpen size={20} />, color: 'blue', earned: myHistory.length > 0 },
    { id: 2, name: 'Bookworm', desc: 'Borrowed 5+ books', icon: <Trophy size={20} />, color: 'yellow', earned: myHistory.length >= 5 },
    { id: 3, name: 'The Critic', desc: 'Left your first review', icon: <Star size={20} />, color: 'purple', earned: myReviews > 0 },
    { id: 4, name: 'Responsible', desc: 'No current fines', icon: <Medal size={20} />, color: 'green', earned: currentUser.fines === 0 && myHistory.length > 0 }
  ];

  const canReserve = TIER_RULES[currentUser.tier].maxReservations > 0;

  return (
    <div className="space-y-8">
      <BookDetailsModal 
        book={selectedBook} 
        onClose={() => setSelectedBook(null)} 
        onAddReview={onAddReview}
        currentUser={currentUser}
        themeColor={themeColor}
      />

      {/* Hero Section */}
      <div className="relative h-72 rounded-3xl overflow-hidden shadow-2xl group">
        <img 
          src="https://picsum.photos/1200/400?grayscale&blur=1" 
          alt="Student Dashboard" 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className={`absolute inset-0 bg-gradient-to-r from-${themeColor}-900/90 to-transparent flex flex-col justify-center px-10 backdrop-blur-[2px]`}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 font-serif drop-shadow-lg">Hello, {currentUser.name.split(' ')[0]}</h1>
            <p className="text-white/90 max-w-lg mb-8 text-lg font-light leading-relaxed">
              Unlock a world of knowledge. Your {currentUser.tier} membership gives you access to premium resources.
            </p>
          </motion.div>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setActiveTab('browse')}
              className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-white/20 transform hover:-translate-y-1"
            >
              Start Reading
            </button>
            <button 
              onClick={handleGetRecommendations}
              className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-3 rounded-full font-bold hover:bg-white/30 transition-all shadow-lg flex items-center gap-2"
            >
              <Sparkles size={18} className="animate-pulse text-yellow-300" />
              Surprise Me
            </button>
          </div>
        </div>
      </div>

       {/* Navigation Tabs */}
       <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-1 overflow-x-auto hide-scrollbar">
        {[
          { id: 'browse', icon: <BookOpen size={18} />, label: 'Library Catalog' },
          { id: 'history', icon: <Award size={18} />, label: 'Achievements' },
          { id: 'wallet', icon: <Wallet size={18} />, label: 'Membership' },
          { id: 'chat', icon: <MessageCircle size={18} />, label: 'Librarian Chat' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-t-xl flex items-center gap-2 transition-all font-medium relative ${
              activeTab === tab.id 
                ? `text-${themeColor}-600 bg-white dark:bg-gray-800 border-b-2 border-${themeColor}-600 dark:text-${themeColor}-400` 
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/50 dark:text-gray-400'
            }`}
          >
            {tab.icon} {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${themeColor}-600`} 
              />
            )}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'browse' && (
          <div className="space-y-10">
            {/* AI Recommendations Area */}
            <AnimatePresence>
              {showRecs && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className={`bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 p-8 rounded-3xl border border-purple-100 dark:border-purple-800/30 relative`}>
                    <button 
                      onClick={() => setShowRecs(false)}
                      className="absolute top-4 right-4 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X size={20} className="text-gray-500" />
                    </button>
                    
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-purple-900 dark:text-purple-100">
                      <Sparkles size={24} className="text-purple-500" /> 
                      Curated Just For You
                    </h3>

                    {isGeneratingRecs ? (
                      <div className="py-12 flex flex-col items-center justify-center text-purple-600 dark:text-purple-300">
                        <Loader2 size={40} className="animate-spin mb-4" />
                        <p className="text-lg animate-pulse">Consulting the AI Librarian...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recommendations.map((rec, idx) => {
                          const book = books.find(b => b.id === rec.bookId);
                          if (!book) return null;
                          return (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              onClick={() => setSelectedBook(book)}
                              className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-purple-100 dark:border-gray-700 hover:shadow-xl hover:shadow-purple-500/10 transition-all cursor-pointer flex gap-4 group"
                            >
                               <div className="w-20 h-28 flex-shrink-0 overflow-hidden rounded-lg shadow-md">
                                 <img src={book.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={book.title} />
                               </div>
                               <div className="flex-1">
                                 <h4 className="font-bold text-gray-800 dark:text-white line-clamp-1 group-hover:text-purple-600 transition-colors">{book.title}</h4>
                                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{book.author}</p>
                                 <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl border border-purple-100 dark:border-purple-800/30">
                                   <p className="text-xs text-purple-800 dark:text-purple-200 italic leading-relaxed">"{rec.reason}"</p>
                                 </div>
                               </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* New Arrivals Carousel */}
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white font-serif">New Arrivals</h3>
                <div className="flex gap-2">
                  <button onClick={() => scrollCarousel('left')} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => scrollCarousel('right')} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
              <div 
                ref={carouselRef}
                className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar"
                style={{ scrollBehavior: 'smooth' }}
              >
                {books.slice(0, 5).map((book) => (
                  <div 
                    key={book.id} 
                    className="flex-shrink-0 w-64 snap-start group cursor-pointer"
                    onClick={() => setSelectedBook(book)}
                  >
                    <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg mb-4">
                      <img src={book.coverUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                      <div className="absolute bottom-4 left-4 right-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button className="w-full py-2 bg-white/90 backdrop-blur text-gray-900 rounded-lg font-bold text-sm shadow-lg">
                          View Details
                        </button>
                      </div>
                    </div>
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{book.title}</h4>
                    <p className="text-gray-500 text-sm">{book.author}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Library Grid */}
            <div className="space-y-6">
               <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by title, author, or ISBN..."
                    className="w-full pl-12 pr-12 py-3 bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                  <button 
                    onClick={startListening}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white shadow-red-500/50 shadow-lg animate-pulse' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <Mic size={18} />
                  </button>
                </div>
                <div className="h-px w-full md:w-px md:h-auto bg-gray-200 dark:bg-gray-700" />
                <select
                  className="px-4 py-3 bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 font-medium min-w-[180px]"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Genres</option>
                  {categories.filter(c => c.status === 'approved').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredBooks.map(book => {
                  const isReservedByMe = book.reservedBy === currentUser.id;
                  const isReservedByOther = book.reservedBy && !isReservedByMe;
                  
                  return (
                    <motion.div
                      key={book.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -8 }}
                      className="group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer"
                      onClick={() => setSelectedBook(book)}
                    >
                      {/* Glossy Effect Layer */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                      </div>

                      <div className="h-64 overflow-hidden relative">
                        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1" />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1">
                          <Star size={12} className="text-yellow-500 fill-current" />
                          {book.rating.toFixed(1)}
                        </div>
                        {isReservedByMe && (
                           <div className="absolute top-3 left-3 bg-purple-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1">
                             <Bookmark size={12} fill="currentColor" /> Reserved
                           </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <span className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1 block">{getCategoryName(book.categoryId)}</span>
                          <h3 className="font-bold text-white text-xl leading-tight font-serif shadow-black drop-shadow-md">{book.title}</h3>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">by {book.author}</p>
                          <span className={`w-2 h-2 rounded-full ${book.isBorrowed ? (isReservedByMe ? 'bg-purple-400' : 'bg-orange-400') : 'bg-green-400'}`} />
                        </div>

                        {book.isBorrowed ? (
                          <div className="flex gap-2">
                             <button
                                onClick={(e) => e.stopPropagation()}
                                disabled={true}
                                className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                              >
                                {book.borrowedBy === currentUser.id ? 'Borrowed' : 'Unavailable'}
                              </button>
                              
                              {!book.borrowedBy || book.borrowedBy !== currentUser.id ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReserve(book.id);
                                  }}
                                  disabled={!!book.reservedBy && !isReservedByMe}
                                  className={`px-3 rounded-xl font-bold text-sm transition-all ${
                                    isReservedByMe 
                                      ? 'bg-purple-100 text-purple-600 border border-purple-200 cursor-default'
                                      : isReservedByOther
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : canReserve 
                                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                                          : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                  }`}
                                  title={!canReserve ? "Upgrade Tier to Reserve" : isReservedByOther ? "Reserved by another user" : "Reserve this book"}
                                >
                                  {isReservedByMe ? <Check size={18} /> : <Bookmark size={18} />}
                                </button>
                              ) : null}
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBorrow(book.id);
                            }}
                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all transform active:scale-95 bg-${themeColor}-600 text-white shadow-lg shadow-${themeColor}-500/30 hover:shadow-${themeColor}-500/50 hover:bg-${themeColor}-700`}
                          >
                            Borrow Now
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              {filteredBooks.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                  <div className="text-gray-300 mb-4"><BookOpen size={48} className="mx-auto" /></div>
                  <h3 className="text-lg font-bold text-gray-500 mb-2">No books found</h3>
                  <p className="text-gray-400">Try adjusting your search terms or filters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other Tabs (History, Wallet, Chat) remain using their existing components but wrapped in the layout */}
        {activeTab === 'history' && (
          <div className="space-y-8 animate-fadeIn">
            <div className={`bg-gradient-to-br from-${themeColor}-600 to-${themeColor}-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                    <Trophy size={40} className="text-yellow-300 drop-shadow-md" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold font-serif mb-1">Your Trophy Case</h3>
                    <p className="text-white/80">Level up your reading journey by unlocking badges.</p>
                  </div>
                </div>
                <div className="px-6 py-2 bg-black/20 rounded-full text-sm font-medium border border-white/10">
                  {badges.filter(b => b.earned).length} / {badges.length} Unlocked
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                {badges.map((badge) => (
                  <div 
                    key={badge.id} 
                    className={`relative group overflow-hidden rounded-2xl p-5 border transition-all duration-500 ${
                      badge.earned 
                        ? 'bg-white/10 border-white/30 hover:bg-white/20' 
                        : 'bg-black/10 border-white/5 opacity-60'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${badge.earned ? 'from-yellow-400 to-orange-500' : 'from-gray-600 to-gray-700'} flex items-center justify-center mb-4 shadow-lg`}>
                      <div className="text-white drop-shadow-md">{badge.icon}</div>
                    </div>
                    <h4 className="font-bold text-lg mb-1">{badge.name}</h4>
                    <p className="text-xs text-white/70 leading-relaxed">{badge.desc}</p>
                    {badge.earned && (
                      <div className="absolute top-3 right-3 text-yellow-300 animate-pulse">
                        <Sparkles size={16} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
              <h3 className="text-2xl font-bold mb-6 font-serif flex items-center gap-3 text-gray-800 dark:text-white">
                <div className={`p-2 rounded-lg bg-${themeColor}-100 dark:bg-${themeColor}-900/30 text-${themeColor}-600`}>
                  <Clock size={24} />
                </div>
                Borrowing History
              </h3>
              
              {myHistory.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">Your reading journey begins with a single page.</p>
                  <button onClick={() => setActiveTab('browse')} className={`mt-4 text-${themeColor}-600 font-bold hover:underline`}>
                    Browse Library
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myHistory.map(record => (
                    <div key={record.id} className="group flex flex-col sm:flex-row items-center gap-6 p-5 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                       <div className="w-16 h-24 rounded-lg overflow-hidden shadow-md flex-shrink-0">
                         <img src={record.bookCoverUrl} alt="cover" className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1 text-center sm:text-left">
                         <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">{record.bookTitle}</h4>
                         <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                           <span className="flex items-center gap-1"><Clock size={14} /> Borrowed: {new Date(record.borrowDate).toLocaleDateString()}</span>
                           <span className="flex items-center gap-1"><Check size={14} /> Returned: {new Date(record.returnDate).toLocaleDateString()}</span>
                         </div>
                       </div>
                       <button 
                         onClick={() => {
                            const book = books.find(b => b.id === record.bookId);
                            if(book) setSelectedBook(book);
                         }}
                         className={`px-6 py-2.5 rounded-xl text-sm font-bold border-2 border-${themeColor}-100 text-${themeColor}-600 hover:bg-${themeColor}-50 hover:border-${themeColor}-200 transition-all`}
                       >
                         Write Review
                       </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="space-y-6">
             <h3 className="text-3xl font-bold font-serif flex items-center gap-3 text-gray-800 dark:text-white">
              <div className={`p-2 rounded-xl bg-${themeColor}-100 dark:bg-${themeColor}-900/30 text-${themeColor}-600`}>
                <Wallet size={28} />
              </div>
              Financial Center
            </h3>
            <WalletPanel 
              user={currentUser} 
              themeColor={themeColor} 
              onAddFunds={onAddFunds} 
              onPayFine={onPayFine} 
              onUpgradeTier={onUpgradeTier}
            />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden h-[700px] flex flex-col max-w-4xl mx-auto">
             <div className={`p-6 bg-gradient-to-r from-${themeColor}-600 to-${themeColor}-700 text-white`}>
               <h3 className="text-xl font-bold flex items-center gap-2"><MessageCircle size={24}/> Librarian Support</h3>
               <p className="text-white/80 mt-1">Real-time assistance for all your library needs.</p>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-900/50">
               {messages.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-gray-400">
                   <div className={`w-16 h-16 rounded-full bg-${themeColor}-100 flex items-center justify-center mb-4`}>
                     <MessageCircle size={32} className={`text-${themeColor}-500`} />
                   </div>
                   <p className="font-medium">Start a conversation with the library staff.</p>
                 </div>
               ) : (
                 messages.map(msg => (
                   <div key={msg.id} className={`flex flex-col ${!msg.isFromLibrarian ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${
                        !msg.isFromLibrarian 
                          ? `bg-${themeColor}-600 text-white rounded-br-none` 
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700'
                      }`}>
                        <p className="font-bold text-xs opacity-70 mb-1 uppercase tracking-wider">{msg.senderName} {msg.isFromLibrarian && '(Staff)'}</p>
                        <p className="leading-relaxed text-base">{msg.text}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1.5 px-1">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                   </div>
                 ))
               )}
             </div>

             <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-3">
               <input 
                 value={chatInput} 
                 onChange={e => setChatInput(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                 placeholder="Type your message..." 
                 className="flex-1 px-5 py-3 border rounded-xl bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
               />
               <button 
                 onClick={handleSendChat}
                 className={`px-6 py-3 bg-${themeColor}-600 text-white rounded-xl hover:bg-${themeColor}-700 shadow-lg shadow-${themeColor}-500/20 transition-all active:scale-95`}
               >
                 <Send size={20} />
               </button>
             </div>
           </div>
        )}
      </motion.div>
    </div>
  );
};