import { Component, OnInit } from '@angular/core';
import { FeedbackService } from '../../services/feedback.service';
import { Feedback, FeedbackStats } from '../../models/feedback.model';

@Component({
  selector: 'app-feedback-page',
  templateUrl: './feedback-page.component.html',
  styleUrls: ['./feedback-page.component.css']
})
export class FeedbackPageComponent implements OnInit {
  feedbacks: Feedback[] = [];
  stats: FeedbackStats = {
    averageRating: 0,
    totalFeedbacks: 0,
    ratingDistribution: {}
  };

  constructor(private feedbackService: FeedbackService) {}

  ngOnInit(): void {
    this.loadFeedbacks();
    this.loadStats();
  }

  loadFeedbacks(): void {
    this.feedbackService.getAllFeedbacks().subscribe(feedbacks => {
      this.feedbacks = feedbacks;
    });
  }

  loadStats(): void {
    this.feedbackService.getFeedbackStats().subscribe(stats => {
      this.stats = stats;
    });
  }

  onFeedbackSubmitted(feedback: Feedback): void {
    console.log('New feedback submitted:', feedback);
    this.loadFeedbacks();
    this.loadStats();
  }
}
