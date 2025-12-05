import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Calendar, User as UserIcon, BookOpen, Clock, Settings, Trash2, Edit } from 'lucide-react';
import { Book, Review, ThemeColor, User, Role, BorrowHistory } from '../types';

interface BookDetailsModalProps {
  book: Book | null;
  onClose: () => void;
  onAddReview?: (bookId: string, review: Omit<Review, 'id' | 'userId' | 'userName' | 'date'>) => void;
  currentUser: User;
  themeColor: ThemeColor;
  role?: Role;
  borrowHistory?: BorrowHistory[];
  onEdit?: (book: Book) => void;
  onDelete?: (bookId: string) => void;
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({ 
  book, onClose, onAddReview, currentUser, themeColor, role = 'student', borrowHistory = [], onEdit, onDelete
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'manage'>('details');

  if (!book) return null;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if(onAddReview) {
      onAddReview(book.id, { rating, comment });
      setComment('');
      setRating(5);
    }
  };

  const bookHistory = borrowHistory.filter(h => h.bookId === book.id);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] border border-gray-100 dark:border-gray-700"
        >
          {/* Close Button Mobile */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/20 text-white rounded-full md:hidden"
          >
            <X size={20} />
          </button>

          {/* Left Side - Image & Key Info */}
          <div className="w-full md:w-1/3 h-64 md:h-auto relative bg-gray-100 dark:bg-gray-900 flex-shrink-0 group">
            <img 
              src={book.coverUrl} 
              alt={book.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6 text-white`}>
              <h2 className="text-2xl font-serif font-bold leading-tight shadow-black drop-shadow-md">{book.title}</h2>
              <p className="opacity-90">{book.author}</p>
              <div className="flex items-center gap-2 mt-2">
                 <div className="flex text-yellow-400">
                   {[...Array(5)].map((_, i) => (
                     <Star key={i} size={16} fill={i < Math.round(book.rating) ? "currentColor" : "none"} />
                   ))}
                 </div>
                 <span className="text-sm opacity-80">({book.reviews.length} reviews)</span>
              </div>
            </div>
          </div>

          {/* Right Side - Details & Reviews */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab('details')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'details' ? `bg-${themeColor}-100 text-${themeColor}-700 dark:bg-${themeColor}-900/30 dark:text-${themeColor}-300` : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  Overview
                </button>
                {(role === 'librarian' || role === 'admin') && (
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'history' ? `bg-${themeColor}-100 text-${themeColor}-700 dark:bg-${themeColor}-900/30 dark:text-${themeColor}-300` : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    History
                  </button>
                )}
                {role === 'librarian' && (
                  <button 
                    onClick={() => setActiveTab('manage')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'manage' ? `bg-${themeColor}-100 text-${themeColor}-700 dark:bg-${themeColor}-900/30 dark:text-${themeColor}-300` : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    Manage
                  </button>
                )}
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-6">
              <AnimatePresence mode="wait">
                {activeTab === 'details' && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <div className="mb-8">
                      <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                        <BookOpen className={`text-${themeColor}-500`} size={20} />
                        Description
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                        {book.description || "No description available for this book."}
                      </p>
                      
                      <div className="mt-4 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          <span>Published 2023</span>
                        </div>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium border ${book.isBorrowed ? 'border-orange-200 text-orange-600 bg-orange-50 dark:bg-orange-900/20' : 'border-green-200 text-green-600 bg-green-50 dark:bg-green-900/20'}`}>
                          {book.isBorrowed ? 'Currently Borrowed' : 'Available Now'}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                      <h3 className="text-lg font-bold mb-4">Community Reviews</h3>
                      
                      {/* Review List */}
                      <div className="space-y-4 mb-8">
                        {book.reviews.length === 0 ? (
                          <p className="text-gray-400 italic">No reviews yet. Be the first to share your thoughts!</p>
                        ) : (
                          book.reviews.map(review => (
                            <div key={review.id} className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-full bg-${themeColor}-100 flex items-center justify-center text-${themeColor}-600 font-bold text-xs`}>
                                    {review.userName.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold">{review.userName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(review.date).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{review.comment}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add Review Form */}
                      {onAddReview && (
                        <div className={`bg-${themeColor}-50 dark:bg-gray-700/50 p-5 rounded-xl border border-${themeColor}-100 dark:border-gray-600`}>
                          <h4 className="font-semibold mb-3 text-sm">Write a Review</h4>
                          <form onSubmit={handleSubmitReview}>
                            <div className="flex gap-1 mb-3 text-yellow-400 cursor-pointer">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  size={24} 
                                  fill={star <= rating ? "currentColor" : "none"} 
                                  onClick={() => setRating(star)}
                                  className="hover:scale-110 transition-transform"
                                />
                              ))}
                            </div>
                            <textarea
                              required
                              value={comment}
                              onChange={e => setComment(e.target.value)}
                              placeholder="What did you think about this book?"
                              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none mb-3"
                              rows={3}
                            />
                            <div className="flex justify-end">
                              <button 
                                type="submit"
                                className={`bg-${themeColor}-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-${themeColor}-700 transition-colors shadow-lg shadow-${themeColor}-500/20`}
                              >
                                Post Review
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'history' && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                      <Clock size={20} className={`text-${themeColor}-500`} /> Loan History
                    </h3>
                    
                    {bookHistory.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                        <Clock size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No borrowing history recorded for this book.</p>
                      </div>
                    ) : (
                      bookHistory.map(record => (
                        <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                           <div className="flex items-center gap-3">
                             <div className="p-2 bg-white dark:bg-gray-600 rounded-full">
                               <UserIcon size={16} />
                             </div>
                             <div>
                               <p className="text-sm font-bold text-gray-800 dark:text-white">User ID: {record.userId}</p>
                               <p className="text-xs text-gray-500">Returned: {new Date(record.returnDate).toLocaleDateString()}</p>
                             </div>
                           </div>
                           <div className="text-right">
                             <p className="text-xs font-mono text-gray-400">{record.id}</p>
                           </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}

                {activeTab === 'manage' && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                      <Settings size={20} className={`text-${themeColor}-500`} /> Management Actions
                    </h3>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-900/50 mb-6">
                      <h4 className="font-bold text-yellow-800 dark:text-yellow-200 text-sm mb-1">Administrative Zone</h4>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">Changes made here will immediately reflect in the public catalog.</p>
                    </div>

                    <button 
                      onClick={() => onEdit && onEdit(book)}
                      className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Edit size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-800 dark:text-white">Edit Book Details</p>
                          <p className="text-xs text-gray-500">Update title, author, cover, or description</p>
                        </div>
                      </div>
                      <div className="text-gray-400 group-hover:translate-x-1 transition-transform">→</div>
                    </button>

                    <button 
                      onClick={() => onDelete && onDelete(book.id)}
                      className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-red-500 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                          <Trash2 size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-800 dark:text-white">Delete from Catalog</p>
                          <p className="text-xs text-gray-500">Permanently remove this book</p>
                        </div>
                      </div>
                      <div className="text-gray-400 group-hover:translate-x-1 transition-transform">→</div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};