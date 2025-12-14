import { Component, OnInit } from '@angular/core';
import { ForumService } from '../../services/forum.service';
import { ForumPost, ForumCategory, ForumStats } from '../../models/forum.model';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})
export class ForumComponent implements OnInit {
  posts: ForumPost[] = [];
  categories: ForumCategory[] = [];
  stats: ForumStats = {
    totalPosts: 0,
    totalReplies: 0,
    activeUsers: 0,
    resolvedIssues: 0,
    categoriesStats: {}
  };

  selectedCategory: string = 'all';
  searchQuery: string = '';
  sortBy: string = 'recent';
  isCreatePostModalOpen: boolean = false;
  
  newPost = {
    title: '',
    content: '',
    category: 'general' as any,
    tags: '',
    isAnonymous: true,
    authorName: 'Anonymous Student'
  };

  constructor(private forumService: ForumService) {}

  ngOnInit(): void {
    this.loadPosts();
    this.loadCategories();
    this.loadStats();
  }

  loadPosts(): void {
    if (this.selectedCategory === 'all') {
      this.forumService.getAllPosts().subscribe(posts => {
        this.posts = this.sortPosts(posts);
      });
    } else {
      this.forumService.getPostsByCategory(this.selectedCategory).subscribe(posts => {
        this.posts = this.sortPosts(posts);
      });
    }
  }

  loadCategories(): void {
    this.forumService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  loadStats(): void {
    this.forumService.getForumStats().subscribe(stats => {
      this.stats = stats;
    });
  }

  onCategoryChange(): void {
    this.loadPosts();
  }

  onSortChange(): void {
    this.posts = this.sortPosts(this.posts);
  }

  searchPosts(): void {
    if (this.searchQuery.trim()) {
      this.forumService.searchPosts(this.searchQuery).subscribe(posts => {
        this.posts = this.sortPosts(posts);
      });
    } else {
      this.loadPosts();
    }
  }

  sortPosts(posts: ForumPost[]): ForumPost[] {
    switch (this.sortBy) {
      case 'recent':
        return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'popular':
        return posts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      case 'replies':
        return posts.sort((a, b) => b.replies.length - a.replies.length);
      case 'views':
        return posts.sort((a, b) => b.viewCount - a.viewCount);
      default:
        return posts;
    }
  }

  openCreatePostModal(): void {
    this.isCreatePostModalOpen = true;
  }

  closeCreatePostModal(): void {
    this.isCreatePostModalOpen = false;
    this.resetNewPost();
  }

  createPost(): void {
    if (!this.newPost.title.trim() || !this.newPost.content.trim()) {
      return;
    }

    const tagsArray = this.newPost.tags
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    this.forumService.createPost({
      title: this.newPost.title,
      content: this.newPost.content,
      category: this.newPost.category,
      tags: tagsArray,
      isAnonymous: this.newPost.isAnonymous,
      authorName: this.newPost.isAnonymous ? 'Anonymous Student' : this.newPost.authorName,
      isResolved: false,
      isPinned: false
    }).subscribe(() => {
      this.closeCreatePostModal();
      this.loadPosts();
      this.loadStats();
    });
  }

  votePost(postId: string, isUpvote: boolean): void {
    this.forumService.votePost(postId, isUpvote).subscribe(() => {
      this.loadPosts();
    });
  }

  markAsResolved(postId: string): void {
    this.forumService.markPostAsResolved(postId).subscribe(() => {
      this.loadPosts();
      this.loadStats();
    });
  }

  incrementViewCount(postId: string): void {
    this.forumService.incrementViewCount(postId).subscribe();
  }

  private resetNewPost(): void {
    this.newPost = {
      title: '',
      content: '',
      category: 'general',
      tags: '',
      isAnonymous: true,
      authorName: 'Anonymous Student'
    };
  }

  getCategoryIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      academic: 'school',
      hostel: 'home',
      cafeteria: 'restaurant',
      transport: 'directions_bus',
      facilities: 'business',
      general: 'forum'
    };
    return iconMap[category] || 'forum';
  }

  getCategoryColor(category: string): string {
    const colorMap: { [key: string]: string } = {
      academic: '#3498db',
      hostel: '#e74c3c',
      cafeteria: '#f39c12',
      transport: '#9b59b6',
      facilities: '#1abc9c',
      general: '#34495e'
    };
    return colorMap[category] || '#34495e';
  }

  formatDate(date: Date): string {
    const now = new Date();
    const postDate = new Date(date);
    const diffTime = now.getTime() - postDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return postDate.toLocaleDateString();
    }
  }
}
