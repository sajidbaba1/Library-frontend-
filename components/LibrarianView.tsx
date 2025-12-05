import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Book as BookIcon, Layers, AlertCircle, Calendar as CalendarIcon, RotateCcw, MessageSquare, Send } from 'lucide-react';
import { Category, Book, User, ThemeColor, LibraryMessage } from '../types';

interface LibrarianViewProps {
  categories: Category[];
  books: Book[];
  addCategory: (name: string, userId: string) => void;
  addBook: (book: Book) => void;
  currentUser: User;
  themeColor: ThemeColor;
  handleReturnBook: (bookId: string) => void;
  messages: LibraryMessage[];
  sendMessage: (text: string) => void;
}

export const LibrarianView: React.FC<LibrarianViewProps> = ({ 
  categories, books, addCategory, addBook, currentUser, themeColor, handleReturnBook, messages, sendMessage 
}) => {
  const [activeTab, setActiveTab] = useState<'books' | 'categories' | 'calendar' | 'messages'>('books');
  const [newCategory, setNewCategory] = useState('');
  const [newBook, setNewBook] = useState({ title: '', author: '', categoryId: '', coverUrl: 'https://picsum.photos/200/300' });
  const [replyText, setReplyText] = useState('');
  
  const approvedCategories = categories.filter(c => c.status === 'approved');
  const borrowedBooks = books.filter(b => b.isBorrowed);

  // Calendar Generation
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

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newBook.categoryId) {
      alert("Please select a valid category");
      return;
    }
    const book: Book = {
      id: Date.now().toString(),
      ...newBook,
      isBorrowed: false
    };
    addBook(book);
    setNewBook({ title: '', author: '', categoryId: '', coverUrl: 'https://picsum.photos/200/300' });
    alert('Book added successfully!');
  };

  const handleSendMessage = () => {
    if(!replyText.trim()) return;
    sendMessage(replyText);
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg">
        <img 
          src="https://picsum.photos/1200/400?blur=2" 
          alt="Librarian Dashboard" 
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-${themeColor}-900/70 flex items-center px-8 backdrop-blur-sm`}>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 font-serif">Hello, Librarian</h1>
            <p className="text-white/80">Curate knowledge and organize the collection.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('books')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'books' ? `bg-${themeColor}-600 text-white shadow-md shadow-${themeColor}-500/30` : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          <BookIcon size={18} /> Manage Books
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'categories' ? `bg-${themeColor}-600 text-white shadow-md shadow-${themeColor}-500/30` : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          <Layers size={18} /> Categories
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'calendar' ? `bg-${themeColor}-600 text-white shadow-md shadow-${themeColor}-500/30` : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          <CalendarIcon size={18} /> Calendar & Returns
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'messages' ? `bg-${themeColor}-600 text-white shadow-md shadow-${themeColor}-500/30` : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          <MessageSquare size={18} /> Student Chat
        </button>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {activeTab === 'books' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-4 transition-colors">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Add New Book</h3>
                {approvedCategories.length === 0 ? (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm flex gap-2 border border-yellow-200 dark:border-yellow-800">
                        <AlertCircle size={16} />
                        No approved categories. Add a category first.
                    </div>
                ) : (
                    <form onSubmit={handleAddBook} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                        <input 
                            required 
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" 
                            value={newBook.title}
                            onChange={e => setNewBook({...newBook, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author</label>
                        <input 
                            required 
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" 
                            value={newBook.author}
                            onChange={e => setNewBook({...newBook, author: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover URL</label>
                        <input 
                            required 
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" 
                            value={newBook.coverUrl}
                            onChange={e => setNewBook({...newBook, coverUrl: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category (Must be Approved)</label>
                        <select 
                            required 
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newBook.categoryId}
                            onChange={e => setNewBook({...newBook, categoryId: e.target.value})}
                        >
                            <option value="">Select Category</option>
                            {approvedCategories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className={`w-full bg-${themeColor}-600 text-white py-2 rounded-lg hover:bg-${themeColor}-700 transition-colors shadow-lg shadow-${themeColor}-500/20`}>
                        Add Book
                    </button>
                    </form>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Current Catalog</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {books.map(book => (
                  <div key={book.id} className="flex bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 h-32 transition-colors">
                    <img src={book.coverUrl} alt={book.title} className="w-24 h-full object-cover" />
                    <div className="p-4 flex flex-col justify-center">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">{book.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{book.author}</p>
                      <span className={`text-xs px-2 py-1 rounded-full w-fit ${book.isBorrowed ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                        {book.isBorrowed ? 'Borrowed' : 'Available'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
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