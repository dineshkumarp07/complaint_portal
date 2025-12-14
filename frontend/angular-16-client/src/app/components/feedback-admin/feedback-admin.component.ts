import { Component, OnInit } from '@angular/core';
import { FeedbackService } from '../../services/feedback.service';
import { Feedback, FeedbackStats } from '../../models/feedback.model';

@Component({
  selector: 'app-feedback-admin',
  templateUrl: './feedback-admin.component.html',
  styleUrls: ['./feedback-admin.component.css']
})
export class FeedbackAdminComponent implements OnInit {
  feedbacks: Feedback[] = [];
  filteredFeedbacks: Feedback[] = [];
  stats: FeedbackStats = {
    averageRating: 0,
    totalFeedbacks: 0,
    ratingDistribution: {}
  };

  // Filter and sort options
  selectedCategory: string = 'all';
  selectedRating: number = 0;
  sortBy: string = 'date';
  sortOrder: string = 'desc';
  searchTerm: string = '';

  categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'service', label: 'Service Quality' },
    { value: 'website', label: 'Website Experience' },
    { value: 'support', label: 'Customer Support' },
    { value: 'general', label: 'General Feedback' }
  ];

  constructor(private feedbackService: FeedbackService) {}

  ngOnInit(): void {
    this.loadFeedbacks();
    this.loadStats();
  }

  loadFeedbacks(): void {
    this.feedbackService.getAllFeedbacks().subscribe(feedbacks => {
      this.feedbacks = feedbacks;
      this.applyFilters();
    });
  }

  loadStats(): void {
    this.feedbackService.getFeedbackStats().subscribe(stats => {
      this.stats = stats;
    });
  }

  applyFilters(): void {
    let filtered = [...this.feedbacks];

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(f => f.category === this.selectedCategory);
    }

    // Filter by rating
    if (this.selectedRating > 0) {
      filtered = filtered.filter(f => f.rating === this.selectedRating);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(f => 
        f.comment.toLowerCase().includes(term) ||
        f.userName?.toLowerCase().includes(term)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'date':
          comparison = new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
          break;
        case 'rating':
          comparison = b.rating - a.rating;
          break;
        case 'name':
          comparison = (a.userName || '').localeCompare(b.userName || '');
          break;
      }

      return this.sortOrder === 'desc' ? comparison : -comparison;
    });

    this.filteredFeedbacks = filtered;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  deleteFeedback(id: string): void {
    if (confirm('Are you sure you want to delete this feedback?')) {
      this.feedbackService.deleteFeedback(id).subscribe(() => {
        this.loadFeedbacks();
        this.loadStats();
      });
    }
  }

  getStarsArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  exportFeedbacks(): void {
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedback-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private generateCSV(): string {
    const headers = ['Date', 'Name', 'Rating', 'Category', 'Comment'];
    const rows = this.filteredFeedbacks.map(f => [
      this.formatDate(f.createdAt),
      f.userName || 'Anonymous',
      f.rating.toString(),
      f.category,
      `"${f.comment.replace(/"/g, '""')}"`
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // Add Math property to make it available in template
  Math = Math;
}
