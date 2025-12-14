export interface Feedback {
  id?: string;
  userId?: string;
  userName?: string;
  rating: number;
  comment: string;
  category: 'service' | 'website' | 'support' | 'general';
  createdAt?: Date;
  isAnonymous: boolean;
}

export interface FeedbackStats {
  averageRating: number;
  totalFeedbacks: number;
  ratingDistribution: {
    [key: number]: number;
  };
}
