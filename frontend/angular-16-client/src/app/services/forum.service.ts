import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ForumPost, ForumReply, ForumCategory, ForumStats } from '../models/forum.model';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private postsSubject = new BehaviorSubject<ForumPost[]>([]);
  public posts$ = this.postsSubject.asObservable();

  private categories: ForumCategory[] = [
    {
      id: 'academic',
      name: 'Academic Issues',
      description: 'Course registration, grades, faculty concerns',
      icon: 'school',
      postCount: 0,
      color: '#3498db'
    },
    {
      id: 'hostel',
      name: 'Hostel Problems',
      description: 'Room allocation, maintenance, facilities',
      icon: 'home',
      postCount: 0,
      color: '#e74c3c'
    },
    {
      id: 'cafeteria',
      name: 'Cafeteria Issues',
      description: 'Food quality, hygiene, service problems',
      icon: 'restaurant',
      postCount: 0,
      color: '#f39c12'
    },
    {
      id: 'transport',
      name: 'Transport Problems',
      description: 'Bus schedules, routes, vehicle conditions',
      icon: 'directions_bus',
      postCount: 0,
      color: '#9b59b6'
    },
    {
      id: 'facilities',
      name: 'Facilities',
      description: 'Library, labs, sports, infrastructure',
      icon: 'business',
      postCount: 0,
      color: '#1abc9c'
    },
    {
      id: 'general',
      name: 'General',
      description: 'Other issues and general discussions',
      icon: 'forum',
      postCount: 0,
      color: '#34495e'
    }
  ];

  // Mock data for demonstration
  private mockPosts: ForumPost[] = [
    {
      id: '1',
      title: 'WiFi connectivity issues in hostel blocks',
      content: 'The WiFi has been extremely slow in blocks A and B for the past week. Students are unable to attend online classes properly. Has anyone else faced this issue?',
      authorId: 'user1',
      authorName: 'Anonymous Student',
      isAnonymous: true,
      category: 'hostel',
      tags: ['wifi', 'connectivity', 'hostel'],
      upvotes: 15,
      downvotes: 2,
      replies: [],
      createdAt: new Date('2024-01-15T10:30:00'),
      updatedAt: new Date('2024-01-15T10:30:00'),
      isResolved: false,
      isPinned: false,
      viewCount: 45
    },
    {
      id: '2',
      title: 'Course registration portal not working',
      content: 'The course registration portal shows error 500 when trying to register for electives. The deadline is tomorrow. Need urgent help!',
      authorId: 'user2',
      authorName: 'Concerned Student',
      isAnonymous: true,
      category: 'academic',
      tags: ['registration', 'portal', 'urgent'],
      upvotes: 23,
      downvotes: 0,
      replies: [],
      createdAt: new Date('2024-01-14T14:20:00'),
      updatedAt: new Date('2024-01-14T14:20:00'),
      isResolved: true,
      isPinned: true,
      viewCount: 78
    }
  ];

  constructor() {
    this.postsSubject.next(this.mockPosts);
    this.updateCategoryPostCounts();
  }

  getAllPosts(): Observable<ForumPost[]> {
    return this.posts$;
  }

  getPostsByCategory(category: string): Observable<ForumPost[]> {
    const posts = this.postsSubject.value;
    const filteredPosts = posts.filter(post => post.category === category);
    return of(filteredPosts);
  }

  getPostById(id: string): Observable<ForumPost | undefined> {
    const posts = this.postsSubject.value;
    const post = posts.find(p => p.id === id);
    return of(post);
  }

  createPost(post: Omit<ForumPost, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes' | 'replies' | 'viewCount'>): Observable<ForumPost> {
    const newPost: ForumPost = {
      ...post,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      upvotes: 0,
      downvotes: 0,
      replies: [],
      viewCount: 0
    };

    const currentPosts = this.postsSubject.value;
    this.postsSubject.next([newPost, ...currentPosts]);
    this.updateCategoryPostCounts();

    return of(newPost);
  }

  addReply(postId: string, reply: Omit<ForumReply, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'isAcceptedAnswer'>): Observable<ForumReply> {
    const newReply: ForumReply = {
      ...reply,
      id: Date.now().toString(),
      createdAt: new Date(),
      upvotes: 0,
      downvotes: 0,
      isAcceptedAnswer: false
    };

    const posts = this.postsSubject.value;
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
      posts[postIndex].replies.push(newReply);
      posts[postIndex].updatedAt = new Date();
      this.postsSubject.next([...posts]);
    }

    return of(newReply);
  }

  votePost(postId: string, isUpvote: boolean): Observable<boolean> {
    const posts = this.postsSubject.value;
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
      if (isUpvote) {
        posts[postIndex].upvotes++;
      } else {
        posts[postIndex].downvotes++;
      }
      this.postsSubject.next([...posts]);
    }

    return of(true);
  }

  voteReply(postId: string, replyId: string, isUpvote: boolean): Observable<boolean> {
    const posts = this.postsSubject.value;
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
      const replyIndex = posts[postIndex].replies.findIndex(r => r.id === replyId);
      if (replyIndex !== -1) {
        if (isUpvote) {
          posts[postIndex].replies[replyIndex].upvotes++;
        } else {
          posts[postIndex].replies[replyIndex].downvotes++;
        }
        this.postsSubject.next([...posts]);
      }
    }

    return of(true);
  }

  markPostAsResolved(postId: string): Observable<boolean> {
    const posts = this.postsSubject.value;
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
      posts[postIndex].isResolved = true;
      posts[postIndex].updatedAt = new Date();
      this.postsSubject.next([...posts]);
    }

    return of(true);
  }

  incrementViewCount(postId: string): Observable<boolean> {
    const posts = this.postsSubject.value;
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
      posts[postIndex].viewCount++;
      this.postsSubject.next([...posts]);
    }

    return of(true);
  }

  searchPosts(query: string): Observable<ForumPost[]> {
    const posts = this.postsSubject.value;
    const searchResults = posts.filter(post => 
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.content.toLowerCase().includes(query.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    return of(searchResults);
  }

  getCategories(): Observable<ForumCategory[]> {
    return of(this.categories);
  }

  getForumStats(): Observable<ForumStats> {
    const posts = this.postsSubject.value;
    const totalReplies = posts.reduce((sum, post) => sum + post.replies.length, 0);
    
    const categoriesStats: { [key: string]: number } = {};
    this.categories.forEach(cat => {
      categoriesStats[cat.name] = posts.filter(p => p.category === cat.id).length;
    });

    const stats: ForumStats = {
      totalPosts: posts.length,
      totalReplies,
      activeUsers: new Set(posts.map(p => p.authorId).filter(id => id)).size,
      resolvedIssues: posts.filter(p => p.isResolved).length,
      categoriesStats
    };

    return of(stats);
  }

  private updateCategoryPostCounts(): void {
    const posts = this.postsSubject.value;
    this.categories.forEach(category => {
      category.postCount = posts.filter(p => p.category === category.id).length;
    });
  }

  deletePost(postId: string): Observable<boolean> {
    const posts = this.postsSubject.value;
    const filteredPosts = posts.filter(p => p.id !== postId);
    this.postsSubject.next(filteredPosts);
    this.updateCategoryPostCounts();
    return of(true);
  }
}
