import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Book as BookIcon, Layers, AlertCircle } from 'lucide-react';
import { Category, Book, User } from '../types';

interface LibrarianViewProps {
  categories: Category[];
  books: Book[];
  addCategory: (name: string, userId: string) => void;
  addBook: (book: Book) => void;
  currentUser: User;
}

export const LibrarianView: React.FC<LibrarianViewProps> = ({ categories, books, addCategory, addBook, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'books' | 'categories'>('books');
  const [newCategory, setNewCategory] = useState('');
  const [newBook, setNewBook] = useState({ title: '', author: '', categoryId: '', coverUrl: 'https://picsum.photos/200/300' });
  
  const approvedCategories = categories.filter(c => c.status === 'approved');

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

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg">
        <img 
          src="https://picsum.photos/1200/400?blur=2" 
          alt="Librarian Dashboard" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-teal-900/70 flex items-center px-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Hello, Librarian</h1>
            <p className="text-teal-200">Curate knowledge and organize the collection.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('books')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'books' ? 'bg-teal-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <BookIcon size={18} /> Manage Books
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'categories' ? 'bg-teal-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <Layers size={18} /> Categories
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
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-4">
                <h3 className="text-lg font-semibold mb-4">Add New Book</h3>
                {approvedCategories.length === 0 ? (
                    <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm flex gap-2">
                        <AlertCircle size={16} />
                        No approved categories. Add a category first.
                    </div>
                ) : (
                    <form onSubmit={handleAddBook} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input 
                            required 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                            value={newBook.title}
                            onChange={e => setNewBook({...newBook, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                        <input 
                            required 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                            value={newBook.author}
                            onChange={e => setNewBook({...newBook, author: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category (Must be Approved)</label>
                        <select 
                            required 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            value={newBook.categoryId}
                            onChange={e => setNewBook({...newBook, categoryId: e.target.value})}
                        >
                            <option value="">Select Category</option>
                            {approvedCategories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors">
                        Add Book
                    </button>
                    </form>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Current Catalog</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {books.map(book => (
                  <div key={book.id} className="flex bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 h-32">
                    <img src={book.coverUrl} alt={book.title} className="w-24 h-full object-cover" />
                    <div className="p-4 flex flex-col justify-center">
                      <h4 className="font-semibold text-gray-800 line-clamp-1">{book.title}</h4>
                      <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                      <span className={`text-xs px-2 py-1 rounded-full w-fit ${book.isBorrowed ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
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
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <h3 className="text-lg font-semibold mb-4">Request New Category</h3>
               <form onSubmit={handleAddCategory} className="flex gap-2">
                 <input 
                    required 
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2" 
                    placeholder="e.g. Science Fiction"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                 />
                 <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700">
                   Submit
                 </button>
               </form>
               <p className="text-xs text-gray-500 mt-2">New categories require Admin approval before you can add books to them.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <h3 className="text-lg font-semibold mb-4">Category Status</h3>
               <div className="space-y-2">
                 {categories.map(cat => (
                   <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                     <span className="font-medium text-gray-700">{cat.name}</span>
                     <span className={`text-xs px-2 py-1 rounded-full ${
                       cat.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                     }`}>
                       {cat.status.toUpperCase()}
                     </span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};