import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, MessageCircle, Send, Star, Clock, Wallet, Sparkles, Loader2, X, Mic, Trophy, Award, Medal } from 'lucide-react';
import { Book, Category, User, ThemeColor, LibraryMessage, Review, BorrowHistory, AIRecommendation } from '../types';
import { BookDetailsModal } from './BookDetailsModal';
import { WalletPanel } from './WalletPanel';
import { getBookRecommendations } from '../services/geminiService';

interface StudentViewProps {
  books: Book[];
  categories: Category[];
  handleBorrow: (bookId: string) => void;
  currentUser: User;
  themeColor: ThemeColor;
  messages: LibraryMessage[];
  sendMessage: (text: string) => void;
  onAddReview: (bookId: string, review: Omit<Review, 'id' | 'userId' | 'userName' | 'date'>) => void;
  borrowHistory: BorrowHistory[];
  onAddFunds: (amount: number) => void;
  onPayFine: (amount: number) => void;
}

export const StudentView: React.FC<StudentViewProps> = ({ 
  books, categories, handleBorrow, currentUser, themeColor, messages, sendMessage, onAddReview, borrowHistory, onAddFunds, onPayFine 
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

  // Voice Search Logic
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

  // Gamification Logic
  const myHistory = borrowHistory.filter(h => h.userId === currentUser.id);
  const myReviews = books.reduce((acc, book) => acc + book.reviews.filter(r => r.userId === currentUser.id).length, 0);
  
  const badges = [
    { 
      id: 1, 
      name: 'Novice Reader', 
      desc: 'Borrowed your first book', 
      icon: <BookOpen size={20} />, 
      color: 'blue', 
      earned: myHistory.length > 0 
    },
    { 
      id: 2, 
      name: 'Bookworm', 
      desc: 'Borrowed 5+ books', 
      icon: <Trophy size={20} />, 
      color: 'yellow', 
      earned: myHistory.length >= 5 
    },
    { 
      id: 3, 
      name: 'The Critic', 
      desc: 'Left your first review', 
      icon: <Star size={20} />, 
      color: 'purple', 
      earned: myReviews > 0 
    },
    { 
      id: 4, 
      name: 'Responsible', 
      desc: 'No current fines', 
      icon: <Medal size={20} />, 
      color: 'green', 
      earned: currentUser.fines === 0 && myHistory.length > 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Modal */}
      <BookDetailsModal 
        book={selectedBook} 
        onClose={() => setSelectedBook(null)} 
        onAddReview={onAddReview}
        currentUser={currentUser}
        themeColor={themeColor}
      />

      {/* Hero */}
      <div className="relative h-64 md:h-56 rounded-3xl overflow-hidden shadow-lg group">
        <img 
          src="https://picsum.photos/1200/400?grayscale&blur=1" 
          alt="Student Dashboard" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className={`absolute inset-0 bg-${themeColor}-900/60 flex flex-col justify-center px-8 backdrop-blur-sm`}>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 font-serif">Hello, {currentUser.name.split(' ')[0]}</h1>
          <p className="text-white/80 max-w-lg mb-6">Explore worlds within pages. Your next great adventure is just a click away.</p>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setActiveTab('browse')}
              className={`bg-white text-${themeColor}-900 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg`}
            >
              Browse Library
            </button>
            <button 
              onClick={handleGetRecommendations}
              className={`bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg flex items-center gap-2`}
            >
              <Sparkles size={18} className="animate-pulse" />
              AI Recommendations
            </button>
          </div>
        </div>
      </div>

       {/* Tabs */}
       <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'browse' ? `bg-${themeColor}-600 text-white shadow-md shadow-${themeColor}-500/30` : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          <BookOpen size={18} /> Browse Books
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'history' ? `bg-${themeColor}-600 text-white shadow-md shadow-${themeColor}-500/30` : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          <Award size={18} /> Achievements & History
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'wallet' ? `bg-${themeColor}-600 text-white shadow-md shadow-${themeColor}-500/30` : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          <Wallet size={18} /> Wallet & Fines
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'chat' ? `bg-${themeColor}-600 text-white shadow-md shadow-${themeColor}-500/30` : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          <MessageCircle size={18} /> Chat with Librarian
        </button>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {activeTab === 'browse' && (
          <>
            {/* AI Recommendations Section */}
            {showRecs && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mb-8 overflow-hidden"
              >
                <div className={`bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-100 dark:border-purple-800/50 relative`}>
                  <button 
                    onClick={() => setShowRecs(false)}
                    className="absolute top-4 right-4 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
                  >
                    <X size={16} className="text-gray-500" />
                  </button>
                  
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-900 dark:text-purple-100">
                    <Sparkles size={20} className="text-purple-500" /> 
                    Smart Recommendations for You
                  </h3>

                  {isGeneratingRecs ? (
                    <div className="py-8 flex flex-col items-center justify-center text-purple-600 dark:text-purple-300">
                      <Loader2 size={32} className="animate-spin mb-3" />
                      <p>Analyzing your reading history and finding the perfect match...</p>
                    </div>
                  ) : recommendations.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">Could not generate recommendations at this time.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {recommendations.map((rec, idx) => {
                        const book = books.find(b => b.id === rec.bookId);
                        if (!book) return null;
                        return (
                          <div 
                            key={idx}
                            onClick={() => setSelectedBook(book)}
                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-purple-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer flex gap-4"
                          >
                             <img src={book.coverUrl} className="w-16 h-24 object-cover rounded-md flex-shrink-0" alt={book.title} />
                             <div>
                               <h4 className="font-bold text-gray-800 dark:text-white line-clamp-1">{book.title}</h4>
                               <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{book.author}</p>
                               <div className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded-lg">
                                 <p className="text-xs text-purple-800 dark:text-purple-200 italic leading-snug">"{rec.reason}"</p>
                               </div>
                             </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search books by title or author..."
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
                <button 
                  onClick={startListening}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                  title="Voice Search"
                >
                  <Mic size={18} />
                </button>
              </div>
              <select
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.filter(c => c.status === 'approved').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map(book => (
                <motion.div
                  key={book.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-black/50 transition-all border border-gray-100 dark:border-gray-700 flex flex-col h-full cursor-pointer group"
                  onClick={() => setSelectedBook(book)}
                >
                  <div className="h-48 overflow-hidden relative">
                    <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-medium flex items-center gap-2"><BookOpen size={18}/> View Details</span>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="mb-auto">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs font-bold text-${themeColor}-600 uppercase tracking-wider`}>{getCategoryName(book.categoryId)}</span>
                        <div className="flex items-center text-yellow-400 gap-0.5">
                          <Star size={12} fill="currentColor" />
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{book.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg leading-tight mt-1 mb-1 font-serif group-hover:text-indigo-500 transition-colors">{book.title}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">by {book.author}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBorrow(book.id);
                      }}
                      disabled={book.isBorrowed}
                      className={`w-full py-2 rounded-lg font-medium transition-colors ${
                        book.isBorrowed
                          ? book.borrowedBy === currentUser.id 
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 cursor-default'
                              : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                          : `bg-${themeColor}-600 text-white hover:bg-${themeColor}-700 shadow-md shadow-${themeColor}-500/20`
                      }`}
                    >
                      {book.isBorrowed 
                          ? (book.borrowedBy === currentUser.id ? 'Borrowed by You' : 'Currently Unavailable') 
                          : 'Borrow Book'}
                    </button>
                    {book.isBorrowed && book.borrowedBy === currentUser.id && book.dueDate && (
                      <p className="text-xs text-center text-blue-600 mt-2">Due: {new Date(book.dueDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            {filteredBooks.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                No books found matching your criteria.
                {isListening && <p className="mt-2 text-red-500 animate-pulse">Listening...</p>}
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Gamification / Badges Section */}
            <div className={`bg-gradient-to-br from-${themeColor}-500 to-${themeColor}-700 rounded-2xl p-6 text-white shadow-lg`}>
              <div className="flex items-center gap-3 mb-6">
                <Trophy size={28} className="text-yellow-300" />
                <div>
                  <h3 className="text-xl font-bold font-serif">Your Achievements</h3>
                  <p className="text-white/80 text-sm">Unlock badges as you read and review!</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((badge) => (
                  <div 
                    key={badge.id} 
                    className={`bg-white/10 backdrop-blur-md rounded-xl p-4 border transition-all ${
                      badge.earned 
                        ? 'border-white/30 opacity-100' 
                        : 'border-white/5 opacity-50 grayscale'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3 ${badge.earned ? 'text-yellow-300' : 'text-white'}`}>
                      {badge.icon}
                    </div>
                    <h4 className="font-bold text-sm mb-1">{badge.name}</h4>
                    <p className="text-xs text-white/70">{badge.desc}</p>
                    {badge.earned && (
                      <div className="mt-2 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full w-fit">
                        Unlocked
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reading History List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
              <h3 className="text-xl font-bold mb-6 font-serif flex items-center gap-2">
                <Clock className={`text-${themeColor}-500`} /> Reading History
              </h3>
              
              {myHistory.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                  You haven't returned any books yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {myHistory.map(record => (
                    <div key={record.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/20">
                       <img src={record.bookCoverUrl} alt="cover" className="w-16 h-20 object-cover rounded-lg shadow-sm" />
                       <div className="flex-1">
                         <h4 className="font-bold text-gray-900 dark:text-gray-100">{record.bookTitle}</h4>
                         <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                           <span>Borrowed: {new Date(record.borrowDate).toLocaleDateString()}</span>
                           <span>Returned: {new Date(record.returnDate).toLocaleDateString()}</span>
                         </div>
                       </div>
                       <button 
                         onClick={() => {
                            const book = books.find(b => b.id === record.bookId);
                            if(book) setSelectedBook(book);
                         }}
                         className={`px-4 py-2 rounded-lg text-sm border border-${themeColor}-200 text-${themeColor}-600 hover:bg-${themeColor}-50 font-medium`}
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
             <h3 className="text-xl font-bold font-serif flex items-center gap-2">
              <Wallet className={`text-${themeColor}-500`} /> Financial Center
            </h3>
            <WalletPanel 
              user={currentUser} 
              themeColor={themeColor} 
              onAddFunds={onAddFunds} 
              onPayFine={onPayFine} 
            />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors h-[600px] flex flex-col max-w-2xl mx-auto">
             <div className={`p-4 border-b border-gray-100 dark:border-gray-700 bg-${themeColor}-600 text-white rounded-t-2xl`}>
               <h3 className="font-semibold flex items-center gap-2"><MessageCircle size={18}/> Chat with Librarian</h3>
               <p className="text-xs opacity-80">Ask about availability, returns, or recommendations.</p>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {messages.length === 0 ? (
                 <div className="text-center text-gray-400 mt-20">Start a conversation with the library staff.</div>
               ) : (
                 messages.map(msg => (
                   <div key={msg.id} className={`flex flex-col ${!msg.isFromLibrarian ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-xl text-sm ${
                        !msg.isFromLibrarian 
                          ? `bg-${themeColor}-600 text-white rounded-br-none` 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
                      }`}>
                        <p className="font-bold text-xs opacity-70 mb-1">{msg.senderName} {msg.isFromLibrarian && '(Librarian)'}</p>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                   </div>
                 ))
               )}
             </div>

             <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-2">
               <input 
                 value={chatInput} 
                 onChange={e => setChatInput(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                 placeholder="Type your message..." 
                 className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
               />
               <button 
                 onClick={handleSendChat}
                 className={`p-2 bg-${themeColor}-600 text-white rounded-lg hover:bg-${themeColor}-700`}
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