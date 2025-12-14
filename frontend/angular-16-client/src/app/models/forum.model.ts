export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId?: string;
  authorName: string;
  isAnonymous: boolean;
  category: 'academic' | 'hostel' | 'cafeteria' | 'transport' | 'facilities' | 'general';
  tags: string[];
  upvotes: number;
  downvotes: number;
  replies: ForumReply[];
  createdAt: Date;
  updatedAt: Date;
  isResolved: boolean;
  isPinned: boolean;
  viewCount: number;
}

export interface ForumReply {
  id: string;
  postId: string;
  content: string;
  authorId?: string;
  authorName: string;
  isAnonymous: boolean;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  isAcceptedAnswer: boolean;
  parentReplyId?: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  postCount: number;
  color: string;
}

export interface ForumStats {
  totalPosts: number;
  totalReplies: number;
  activeUsers: number;
  resolvedIssues: number;
  categoriesStats: { [key: string]: number };
}
