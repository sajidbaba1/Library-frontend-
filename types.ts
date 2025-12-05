export type Role = 'admin' | 'librarian' | 'student';

export interface User {
  id: string;
  username: string;
  role: Role;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  status: 'pending' | 'approved';
  createdBy: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  categoryId: string;
  coverUrl: string;
  isBorrowed: boolean;
  borrowedBy?: string; // User ID
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