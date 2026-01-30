// User and Auth Types
export type UserRole = 'STUDENT' | 'TUTOR' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BANNED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  tutorProfile?: TutorProfile;
}

export interface TutorProfile {
  id: string;
  userId: string;
  bio?: string;
  hourlyRate: number;
  subjects: string[];
  experience: number;
  availability?: any;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  categories?: Category[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

// Booking Types
export type BookingStatus = 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  dateTime: string;
  duration: number;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  student?: User;
  tutor?: User;
  review?: Review;
}

// Review Types
export interface Review {
  id: string;
  bookingId: string;
  studentId: string;
  tutorId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  student?: User;
  tutor?: User;
  booking?: Booking;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'STUDENT' | 'TUTOR';
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// API Response Types
export interface ApiError {
  error: string;
  message: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page?: number;
  totalPages?: number;
}

// Tutor Types (extended)
export interface TutorWithDetails extends User {
  tutorProfile: TutorProfile & {
    categories: Category[];
  };
  tutorReviews?: Review[];
}

// Filter and Query Types
export interface TutorFilters {
  category?: string;
  minRating?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'rating' | 'price';
  order?: 'asc' | 'desc';
}

export interface BookingFilters {
  status?: BookingStatus;
}

// Form Types
export interface TutorProfileFormData {
  bio?: string;
  hourlyRate?: number;
  subjects?: string[];
  experience?: number;
  availability?: any;
  categories?: string[];
}

export interface BookingFormData {
  tutorId: string;
  dateTime: string;
  duration: number;
  notes?: string;
}

export interface ReviewFormData {
  bookingId: string;
  rating: number;
  comment?: string;
}

// Admin Types
export interface AdminStats {
  users: {
    total: number;
    active: number;
    banned: number;
    byRole: {
      student: number;
      tutor: number;
      admin: number;
    };
  };
  bookings: {
    total: number;
    byStatus: {
      confirmed: number;
      completed: number;
      cancelled: number;
    };
  };
  tutors: number;
  reviews: number;
  categories: number;
  revenue: number;
}

export interface UserWithStats extends Omit<User, 'tutorProfile'> {
  tutorProfile?: {
    id: string;
    rating: number;
    reviewCount: number;
  };
  _count?: {
    studentBookings: number;
    tutorBookings: number;
  };
}
