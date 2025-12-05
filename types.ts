export type Role = 'admin' | 'librarian' | 'student';

export type ThemeColor = 'indigo' | 'blue' | 'teal' | 'emerald' | 'rose' | 'orange' | 'purple' | 'cyan';

export type FontOption = 'inter' | 'poppins' | 'serif' | 'mono';

export type MembershipTier = 'Standard' | 'Premium' | 'Scholar';

export interface User {
  id: string;
  username: string;
  role: Role;
  name: string;
  avatarSeed?: string;
  bio?: string;
  walletBalance: number;
  fines: number;
  tier: MembershipTier;
}

export interface Category {
  id: string;
  name: string;
  status: 'pending' | 'approved';
  createdBy: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  categoryId: string;
  coverUrl: string;
  description: string;
  isBorrowed: boolean;
  borrowStatus: 'available' | 'pending' | 'borrowed'; // New field for workflow
  borrowedBy?: string; // User ID
  borrowDate?: string; // ISO Date string
  dueDate?: string; // ISO Date string
  reservedBy?: string; // User ID of the person who reserved it
  reviews: Review[];
  rating: number; // Average rating
}

export interface BorrowHistory {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCoverUrl: string;
  userId: string;
  borrowDate: string;
  returnDate: string;
}

export interface AIRecommendation {
  bookId: string;
  reason: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isLoading?: boolean;
}

export interface LibraryMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isFromLibrarian: boolean;
}

export interface Notification {
  id: number;
  title: string;
  text: string;
  read: boolean;
  recipientId: string | 'all' | 'role:librarian' | 'role:admin';
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

export const TIER_RULES = {
  Standard: { maxBooks: 2, loanDays: 14, cost: 0, color: 'gray', maxReservations: 0 },
  Premium: { maxBooks: 5, loanDays: 30, cost: 20, color: 'purple', maxReservations: 3 },
  Scholar: { maxBooks: 10, loanDays: 60, cost: 50, color: 'amber', maxReservations: 5 }
};