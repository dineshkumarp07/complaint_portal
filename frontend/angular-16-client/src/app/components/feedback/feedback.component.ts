import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FeedbackService } from '../../services/feedback.service';
import { Feedback } from '../../models/feedback.model';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {
  @Input() showForm: boolean = true;
  @Input() showStats: boolean = true;
  @Output() feedbackSubmitted = new EventEmitter<Feedback>();

  // Form properties
  rating: number = 0;
  comment: string = '';
  category: 'service' | 'website' | 'support' | 'general' = 'general';
  isAnonymous: boolean = false;
  userName: string = '';

  // Display properties
  feedbacks: Feedback[] = [];
  averageRating: number = 0;
  totalFeedbacks: number = 0;
  ratingDistribution: { [key: number]: number } = {};
  
  // UI state
  isSubmitting: boolean = false;
  showSuccessMessage: boolean = false;
  hoveredStar: number = 0;

  categories = [
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
      this.feedbacks = feedbacks.sort((a, b) => 
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      );
    });
  }

  loadStats(): void {
    this.feedbackService.getFeedbackStats().subscribe(stats => {
      this.averageRating = stats.averageRating;
      this.totalFeedbacks = stats.totalFeedbacks;
      this.ratingDistribution = stats.ratingDistribution;
    });
  }

  setRating(rating: number): void {
    this.rating = rating;
  }

  setHoveredStar(star: number): void {
    this.hoveredStar = star;
  }

  clearHoveredStar(): void {
    this.hoveredStar = 0;
  }

  getStarClass(starNumber: number): string {
    const activeRating = this.hoveredStar || this.rating;
    return starNumber <= activeRating ? 'star active' : 'star';
  }

  submitFeedback(): void {
    if (this.rating === 0 || this.comment.trim() === '') {
      return;
    }

    this.isSubmitting = true;

    const feedback: Feedback = {
      rating: this.rating,
      comment: this.comment.trim(),
      category: this.category,
      isAnonymous: this.isAnonymous,
      userName: this.isAnonymous ? 'Anonymous' : (this.userName || 'User')
    };

    this.feedbackService.submitFeedback(feedback).subscribe({
      next: (submittedFeedback) => {
        this.feedbackSubmitted.emit(submittedFeedback);
        this.resetForm();
        this.showSuccessMessage = true;
        this.loadFeedbacks();
        this.loadStats();
        
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error submitting feedback:', error);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  resetForm(): void {
    this.rating = 0;
    this.comment = '';
    this.category = 'general';
    this.isAnonymous = false;
    this.userName = '';
  }

  getRatingPercentage(starCount: number): number {
    if (this.totalFeedbacks === 0) return 0;
    return (this.ratingDistribution[starCount] / this.totalFeedbacks) * 100;
  }

  getStarsArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }

  // Add Math property to make it available in template
  Math = Math;

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
