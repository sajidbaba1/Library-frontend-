import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, MessageCircle, Send, Star, Clock } from 'lucide-react';
import { Book, Category, User, ThemeColor, LibraryMessage, Review, BorrowHistory } from '../types';
import { BookDetailsModal } from './BookDetailsModal';

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
}

export const StudentView: React.FC<StudentViewProps> = ({ 
  books, categories, handleBorrow, currentUser, themeColor, messages, sendMessage, onAddReview, borrowHistory 
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'chat' | 'history'>('browse');
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [chatInput, setChatInput] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

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
      <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg">
        <img 
          src="https://picsum.photos/1200/400?grayscale&blur=1" 
          alt="Student Dashboard" 
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-${themeColor}-900/60 flex items-center px-8 backdrop-blur-sm`}>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 font-serif">Hello, Student</h1>
            <p className="text-white/80">Explore worlds within pages.</p>
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
          <Clock size={18} /> History
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
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search books by title or author..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
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
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
            <h3 className="text-xl font-bold mb-6 font-serif flex items-center gap-2">
              <Clock className={`text-${themeColor}-500`} /> Reading History
            </h3>
            
            {borrowHistory.filter(h => h.userId === currentUser.id).length === 0 ? (
              <div className="text-center py-10 text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                You haven't returned any books yet.
              </div>
            ) : (
              <div className="space-y-4">
                {borrowHistory.filter(h => h.userId === currentUser.id).map(record => (
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