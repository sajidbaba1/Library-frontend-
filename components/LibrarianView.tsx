import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Book as BookIcon, Layers, AlertCircle, Calendar as CalendarIcon, RotateCcw, MessageSquare, Send, Users, Search, Crown, X, Upload, Image as ImageIcon, Bookmark, Star, ChevronRight, Check } from 'lucide-react';
import { Category, Book, User, ThemeColor, LibraryMessage, TIER_RULES, BorrowHistory } from '../types';
import { BookDetailsModal } from './BookDetailsModal';

interface LibrarianViewProps {
  categories: Category[];
  books: Book[];
  addCategory: (name: string, userId: string) => void;
  addBook: (book: Book) => void;
  currentUser: User;
  themeColor: ThemeColor;
  handleReturnBook: (bookId: string) => void;
  handleApproveRequest: (bookId: string) => void;
  handleRejectRequest: (bookId: string) => void;
  messages: LibraryMessage[];
  sendMessage: (text: string) => void;
  users: User[];
  borrowHistory: BorrowHistory[];
  onUpdateBook?: (book: Book) => void;
  onDeleteBook?: (bookId: string) => void;
}

export const LibrarianView: React.FC<LibrarianViewProps> = ({ 
  categories, books, addCategory, addBook, currentUser, themeColor, handleReturnBook, handleApproveRequest, handleRejectRequest, messages, sendMessage, users, borrowHistory, onUpdateBook, onDeleteBook
}) => {
  const [activeTab, setActiveTab] = useState<'books' | 'requests' | 'categories' | 'calendar' | 'messages' | 'users'>('books');
  const [newCategory, setNewCategory] = useState('');
  
  // Detailed Add/Edit Book Form State
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const [newBook, setNewBook] = useState({ 
    title: '', 
    author: '', 
    categoryId: '', 
    coverUrl: '',
    description: ''
  });
  
  const [replyText, setReplyText] = useState('');
  const [userSearch, setUserSearch] = useState('');
  
  const approvedCategories = categories.filter(c => c.status === 'approved');
  const borrowedBooks = books.filter(b => b.isBorrowed);
  const pendingRequests = books.filter(b => b.borrowStatus === 'pending');

  const getDaysInMonth = () => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };
  
  const today = new Date().getDate();

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if(newCategory.trim()) {
      addCategory(newCategory, currentUser.id);
      setNewCategory('');
      alert('Category submitted for approval!');
    }
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newBook.categoryId) {
      alert("Please select a valid category");
      return;
    }

    if (editingBookId && onUpdateBook) {
      // Update Mode
      const updatedBook: Book = {
        ...(books.find(b => b.id === editingBookId) as Book),
        ...newBook
      };
      onUpdateBook(updatedBook);
    } else {
      // Create Mode
      const book: Book = {
        id: Date.now().toString(),
        ...newBook,
        isBorrowed: false,
        borrowStatus: 'available',
        rating: 0,
        reviews: [],
        coverUrl: newBook.coverUrl || 'https://picsum.photos/300/400'
      };
      addBook(book);
    }
    
    // Reset
    setNewBook({ title: '', author: '', categoryId: '', coverUrl: '', description: '' });
    setShowAddBookModal(false);
    setEditingBookId(null);
  };

  const openEditModal = (book: Book) => {
    setNewBook({
      title: book.title,
      author: book.author,
      categoryId: book.categoryId,
      coverUrl: book.coverUrl,
      description: book.description
    });
    setEditingBookId(book.id);
    setSelectedBook(null); // Close details modal if open
    setShowAddBookModal(true);
  };

  const openAddModal = () => {
    setNewBook({ title: '', author: '', categoryId: '', coverUrl: '', description: '' });
    setEditingBookId(null);
    setShowAddBookModal(true);
  };

  const handleDelete = (bookId: string) => {
    if(onDeleteBook) {
      onDeleteBook(bookId);
      setSelectedBook(null);
    }
  };

  const handleSendMessage = () => {
    if(!replyText.trim()) return;
    sendMessage(replyText);
    setReplyText('');
  };

  const searchedUsers = users.filter(u => 
    u.role === 'student' && 
    (u.username.toLowerCase().includes(userSearch.toLowerCase()) || u.name.toLowerCase().includes(userSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <BookDetailsModal 
        book={selectedBook} 
        onClose={() => setSelectedBook(null)} 
        currentUser={currentUser}
        themeColor={themeColor}
        role="librarian"
        borrowHistory={borrowHistory}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      {/* Hero */}
      <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg group">
        <img 
          src="https://picsum.photos/1200/400?blur=2" 
          alt="Librarian Dashboard" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className={`absolute inset-0 bg-${themeColor}-900/70 flex items-center px-8 backdrop-blur-sm`}>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 font-serif">Hello, Librarian</h1>
            <p className="text-white/80">Curate knowledge and organize the collection.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto hide-scrollbar">
        {[
          { id: 'books', icon: <BookIcon size={18} />, label: 'Catalog' },
          { id: 'requests', icon: <AlertCircle size={18} />, label: 'Requests' },
          { id: 'users', icon: <Users size={18} />, label: 'Users' },
          { id: 'categories', icon: <Layers size={18} />, label: 'Categories' },
          { id: 'calendar', icon: <CalendarIcon size={18} />, label: 'Returns' },
          { id: 'messages', icon: <MessageSquare size={18} />, label: 'Messages' }
        ].map(tab => (
           <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
              ? `bg-${themeColor}-600 text-white shadow-md shadow-${themeColor}-500/30` 
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {tab.icon} {tab.label}
            {tab.id === 'requests' && pendingRequests.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingRequests.length}</span>
            )}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'books' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white font-serif">Library Collection</h3>
              <button 
                onClick={openAddModal}
                className={`flex items-center gap-2 px-6 py-3 bg-${themeColor}-600 text-white rounded-xl shadow-lg hover:bg-${themeColor}-700 transition-all hover:-translate-y-1`}
              >
                <Plus size={20} /> Add New Book
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map(book => (
                <motion.div
                    key={book.id}
                    layout
                    whileHover={{ y: -8 }}
                    onClick={() => setSelectedBook(book)}
                    className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer"
                  >
                    {/* Glossy Effect Layer */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                    </div>

                    <div className="h-56 overflow-hidden relative">
                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1" />
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold ${
                        book.borrowStatus === 'borrowed' ? 'bg-orange-100 text-orange-700' : 
                        book.borrowStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {book.borrowStatus === 'borrowed' ? 'Out' : book.borrowStatus === 'pending' ? 'Pending' : 'In'}
                      </div>
                      {book.reservedBy && (
                         <div className="absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-bold bg-purple-500 text-white flex items-center gap-1 shadow-md">
                           <Bookmark size={10} fill="currentColor" /> Reserved
                         </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity" />
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-bold text-gray-800 dark:text-white text-lg leading-tight mb-1 truncate">{book.title}</h4>
                      <p className="text-gray-500 text-sm mb-3">{book.author}</p>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-xs text-gray-400">ID: {book.id}</span>
                        <div className="flex text-yellow-400">
                           <Star size={12} fill="currentColor" />
                           <span className="text-xs text-gray-500 ml-1">{book.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
              ))}
            </div>

            {/* Rich Add/Edit Book Modal */}
            <AnimatePresence>
              {showAddBookModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                  >
                     {/* Left: Preview Panel */}
                     <div className="w-full md:w-2/5 bg-gray-100 dark:bg-gray-900 p-8 flex flex-col items-center justify-center border-r border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-bold uppercase text-gray-400 mb-6 tracking-wider">Live Preview</h4>
                        <div className="w-48 aspect-[2/3] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden relative group">
                           {newBook.coverUrl ? (
                             <img src={newBook.coverUrl} className="w-full h-full object-cover" alt="Preview" onError={(e) => (e.currentTarget.src = 'https://picsum.photos/300/400')} />
                           ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                               <ImageIcon size={48} className="mb-2" />
                               <span className="text-xs">No Cover Image</span>
                             </div>
                           )}
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                             {newBook.title || "Book Title"}
                           </div>
                        </div>
                        <div className="mt-6 text-center">
                          <p className="font-bold text-gray-800 dark:text-white text-lg">{newBook.title || "Untitled Book"}</p>
                          <p className="text-gray-500 text-sm">{newBook.author || "Unknown Author"}</p>
                        </div>
                     </div>

                     {/* Right: Form Panel */}
                     <div className="flex-1 p-8 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{editingBookId ? 'Edit Book' : 'Add New Book'}</h3>
                          <button onClick={() => setShowAddBookModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                            <X size={24} className="text-gray-500" />
                          </button>
                        </div>

                        {approvedCategories.length === 0 ? (
                            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl flex gap-3 border border-yellow-200">
                                <AlertCircle size={24} className="flex-shrink-0" />
                                <div>
                                  <h4 className="font-bold">Categories Needed</h4>
                                  <p className="text-sm">You must create and approve at least one category before adding books.</p>
                                </div>
                            </div>
                        ) : (
                          <form onSubmit={handleSaveBook} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Book Title</label>
                                <input 
                                  required 
                                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors bg-gray-50 dark:bg-gray-800" 
                                  placeholder="e.g. The Great Gatsby"
                                  value={newBook.title}
                                  onChange={e => setNewBook({...newBook, title: e.target.value})}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Author</label>
                                <input 
                                  required 
                                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors bg-gray-50 dark:bg-gray-800" 
                                  placeholder="e.g. F. Scott Fitzgerald"
                                  value={newBook.author}
                                  onChange={e => setNewBook({...newBook, author: e.target.value})}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Cover Image URL</label>
                              <div className="relative">
                                <Upload className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input 
                                  required 
                                  className="w-full pl-12 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors bg-gray-50 dark:bg-gray-800" 
                                  placeholder="https://example.com/image.jpg"
                                  value={newBook.coverUrl}
                                  onChange={e => setNewBook({...newBook, coverUrl: e.target.value})}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                <select 
                                  required 
                                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors bg-gray-50 dark:bg-gray-800"
                                  value={newBook.categoryId}
                                  onChange={e => setNewBook({...newBook, categoryId: e.target.value})}
                                >
                                  <option value="">Select Category</option>
                                  {approvedCategories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                              <textarea 
                                className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors bg-gray-50 dark:bg-gray-800 min-h-[120px]" 
                                placeholder="Enter a brief summary of the book..."
                                value={newBook.description}
                                onChange={e => setNewBook({...newBook, description: e.target.value})}
                              />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                               <button 
                                 type="button"
                                 onClick={() => setShowAddBookModal(false)}
                                 className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                               >
                                 Cancel
                               </button>
                               <button 
                                 type="submit" 
                                 className={`px-8 py-3 bg-${themeColor}-600 text-white rounded-xl font-bold shadow-lg shadow-${themeColor}-500/30 hover:bg-${themeColor}-700 transition-all transform active:scale-95`}
                               >
                                 {editingBookId ? 'Save Changes' : 'Add to Library'}
                               </button>
                            </div>
                          </form>
                        )}
                     </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
             <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-white">
               <AlertCircle size={20} className={`text-${themeColor}-600`} />
               Pending Borrow Requests
             </h3>
             {pendingRequests.length === 0 ? (
               <div className="text-center py-10 text-gray-400">All caught up! No pending requests.</div>
             ) : (
               <div className="space-y-4">
                 {pendingRequests.map(book => {
                   const requester = users.find(u => u.id === book.borrowedBy);
                   return (
                     <div key={book.id} className="flex flex-col md:flex-row items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/30 transition-colors gap-4">
                       <div className="flex items-center gap-4 w-full md:w-auto">
                         <div className="w-12 h-16 rounded overflow-hidden shadow-sm">
                           <img src={book.coverUrl} className="w-full h-full object-cover" />
                         </div>
                         <div>
                           <h4 className="font-bold text-gray-800 dark:text-white text-lg">{book.title}</h4>
                           <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                             <span>Requested by:</span>
                             {requester ? (
                               <span className="font-semibold flex items-center gap-1">
                                 {requester.name} 
                                 <span className={`text-[10px] px-1.5 rounded-full border border-${TIER_RULES[requester.tier].color}-200 bg-${TIER_RULES[requester.tier].color}-50 text-${TIER_RULES[requester.tier].color}-700 uppercase`}>{requester.tier}</span>
                               </span>
                             ) : (
                               <span className="italic">Unknown User ({book.borrowedBy})</span>
                             )}
                           </div>
                         </div>
                       </div>
                       
                       <div className="flex gap-2 w-full md:w-auto">
                         <button 
                            onClick={() => handleRejectRequest(book.id)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
                          >
                           <X size={16} /> Reject
                         </button>
                         <button 
                            onClick={() => handleApproveRequest(book.id)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-md shadow-green-500/20"
                          >
                           <Check size={16} /> Approve
                         </button>
                       </div>
                     </div>
                   );
                 })}
               </div>
             )}
          </div>
        )}
        
        {/* ... (Other Tabs remain largely the same) ... */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users size={20} className={`text-${themeColor}-600`} /> Student Check & Eligibility
            </h3>
            
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search student by name or username..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-4">
              {searchedUsers.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No students found. Try searching for a name.</p>
              ) : (
                searchedUsers.map(user => {
                  const userBooks = books.filter(b => b.borrowedBy === user.id);
                  const tierLimit = TIER_RULES[user.tier].maxBooks;
                  const canBorrow = userBooks.length < tierLimit;
                  
                  return (
                    <div key={user.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex flex-col md:flex-row gap-6 items-center bg-gray-50 dark:bg-gray-700/30">
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarSeed}`} className="w-12 h-12 rounded-full bg-white" />
                        <div>
                          <p className="font-bold text-gray-800 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-center border border-gray-100 dark:border-gray-700">
                          <p className="text-xs text-gray-400 uppercase font-bold">Tier</p>
                          <div className={`flex items-center justify-center gap-1 font-bold text-${TIER_RULES[user.tier].color}-600`}>
                            <Crown size={14} /> {user.tier}
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-center border border-gray-100 dark:border-gray-700">
                          <p className="text-xs text-gray-400 uppercase font-bold">Active Loans</p>
                          <p className={`font-bold ${!canBorrow ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>
                            {userBooks.length} / {tierLimit}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-center border border-gray-100 dark:border-gray-700">
                          <p className="text-xs text-gray-400 uppercase font-bold">Loan Duration</p>
                          <p className="font-bold text-gray-800 dark:text-white">{TIER_RULES[user.tier].loanDays} Days</p>
                        </div>
                         <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-center border border-gray-100 dark:border-gray-700">
                          <p className="text-xs text-gray-400 uppercase font-bold">Eligibility</p>
                          {canBorrow ? (
                            <span className="text-green-600 font-bold text-sm">Approved</span>
                          ) : (
                            <span className="text-red-600 font-bold text-sm">Limit Reached</span>
                          )}
                        </div>
                      </div>

                      <div className="w-full md:w-auto">
                        <button disabled={!canBorrow} className={`w-full px-4 py-2 rounded-lg font-bold text-sm ${canBorrow ? `bg-${themeColor}-600 text-white` : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                           Checkout Book
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
               <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Request New Category</h3>
               <form onSubmit={handleAddCategory} className="flex gap-2">
                 <input 
                    required 
                    className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder="e.g. Science Fiction"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                 />
                 <button type="submit" className={`bg-${themeColor}-600 text-white px-4 py-2 rounded-lg hover:bg-${themeColor}-700 shadow-md shadow-${themeColor}-500/20`}>
                   Submit
                 </button>
               </form>
               <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">New categories require Admin approval before you can add books to them.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
               <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Category Status</h3>
               <div className="space-y-2">
                 {categories.map(cat => (
                   <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors">
                     <span className="font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                     <span className={`text-xs px-2 py-1 rounded-full ${
                       cat.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                     }`}>
                       {cat.status.toUpperCase()}
                     </span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Due Dates Calendar (Current Month)</h3>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center text-xs font-bold text-gray-400 uppercase py-2">{d}</div>
                ))}
                {getDaysInMonth().map(day => {
                  const hasDue = borrowedBooks.some(b => b.dueDate && new Date(b.dueDate).getDate() === day);
                  return (
                    <div 
                      key={day} 
                      className={`h-24 p-2 border rounded-xl flex flex-col justify-between transition-all ${
                        day === today 
                          ? `border-${themeColor}-500 bg-${themeColor}-50 dark:bg-${themeColor}-900/20` 
                          : 'border-gray-100 dark:border-gray-700'
                      }`}
                    >
                      <span className={`text-sm font-semibold ${day === today ? `text-${themeColor}-600` : 'text-gray-600 dark:text-gray-400'}`}>{day}</span>
                      {hasDue && (
                        <div className="text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded flex items-center gap-1 justify-center">
                          <AlertCircle size={10} />
                          Due
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Borrowed Books</h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {borrowedBooks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No books currently borrowed.</p>
                ) : (
                  borrowedBooks.map(book => (
                    <div key={book.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                      <div className="flex gap-3">
                        <img src={book.coverUrl} className="w-12 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-clamp-1">{book.title}</h4>
                          <p className="text-xs text-gray-500">Issued to: Student {book.borrowedBy}</p>
                          <p className="text-xs text-red-500 mt-1">Due: {new Date(book.dueDate!).toLocaleDateString()}</p>
                           {book.reservedBy && (
                             <p className="text-[10px] font-bold text-purple-600 mt-1 flex items-center gap-1"><Bookmark size={10} /> Reserved</p>
                           )}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleReturnBook(book.id)}
                        className={`w-full mt-2 py-1.5 text-xs font-medium rounded-lg border border-${themeColor}-200 text-${themeColor}-700 hover:bg-${themeColor}-50 flex items-center justify-center gap-1`}
                      >
                        <RotateCcw size={12} /> Mark as Returned
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors h-[600px] flex flex-col">
            <div className={`p-4 border-b border-gray-100 dark:border-gray-700 bg-${themeColor}-50 dark:bg-gray-800 rounded-t-2xl`}>
              <h3 className="font-semibold flex items-center gap-2"><MessageSquare size={18}/> Student Inquiries</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-20">No messages yet.</div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.isFromLibrarian ? 'items-end' : 'items-start'}`}>
                     <div className={`max-w-[70%] p-3 rounded-xl text-sm ${
                       msg.isFromLibrarian 
                         ? `bg-${themeColor}-600 text-white rounded-br-none` 
                         : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
                     }`}>
                       <p className="font-bold text-xs opacity-70 mb-1">{msg.senderName}</p>
                       {msg.text}
                     </div>
                     <span className="text-[10px] text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-2">
              <input 
                value={replyText} 
                onChange={e => setReplyText(e.target.value)}
                placeholder="Type a reply..." 
                className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                onClick={handleSendMessage}
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