import React from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen } from 'lucide-react';
import { Book, Category, User } from '../types';

interface StudentViewProps {
  books: Book[];
  categories: Category[];
  handleBorrow: (bookId: string) => void;
  currentUser: User;
}

export const StudentView: React.FC<StudentViewProps> = ({ books, categories, handleBorrow, currentUser }) => {
  const [filter, setFilter] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(filter.toLowerCase()) || book.author.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || book.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg">
        <img 
          src="https://picsum.photos/1200/400?grayscale&blur=1" 
          alt="Student Dashboard" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-orange-900/60 flex items-center px-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Hello, Student</h1>
            <p className="text-orange-100">Explore worlds within pages.</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search books by title or author..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
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
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex flex-col h-full"
          >
            <div className="h-48 overflow-hidden relative group">
              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-medium flex items-center gap-2"><BookOpen size={18}/> Read More</span>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="mb-auto">
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">{getCategoryName(book.categoryId)}</span>
                <h3 className="font-bold text-gray-800 text-lg leading-tight mt-1 mb-1">{book.title}</h3>
                <p className="text-gray-500 text-sm mb-4">by {book.author}</p>
              </div>

              <button
                onClick={() => handleBorrow(book.id)}
                disabled={book.isBorrowed}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  book.isBorrowed
                    ? book.borrowedBy === currentUser.id 
                        ? 'bg-blue-100 text-blue-700 cursor-default'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                {book.isBorrowed 
                    ? (book.borrowedBy === currentUser.id ? 'Borrowed by You' : 'Currently Unavailable') 
                    : 'Borrow Book'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          No books found matching your criteria.
        </div>
      )}
    </div>
  );
};