import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Calendar, User as UserIcon, BookOpen } from 'lucide-react';
import { Book, Review, ThemeColor, User } from '../types';

interface BookDetailsModalProps {
  book: Book | null;
  onClose: () => void;
  onAddReview: (bookId: string, review: Omit<Review, 'id' | 'userId' | 'userName' | 'date'>) => void;
  currentUser: User;
  themeColor: ThemeColor;
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({ book, onClose, onAddReview, currentUser, themeColor }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!book) return null;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    onAddReview(book.id, { rating, comment });
    setComment('');
    setRating(5);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        >
          {/* Close Button Mobile */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/20 text-white rounded-full md:hidden"
          >
            <X size={20} />
          </button>

          {/* Left Side - Image & Key Info */}
          <div className="w-full md:w-1/3 h-64 md:h-auto relative bg-gray-100 dark:bg-gray-900 flex-shrink-0">
            <img 
              src={book.coverUrl} 
              alt={book.title} 
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6 text-white`}>
              <h2 className="text-2xl font-serif font-bold leading-tight">{book.title}</h2>
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
            {/* Header (Desktop Close) */}
            <div className="hidden md:flex justify-end p-4">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-0">
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <BookOpen className={`text-${themeColor}-500`} size={20} />
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
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
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};