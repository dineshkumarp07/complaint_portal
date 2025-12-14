import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Feedback, FeedbackStats } from '../models/feedback.model';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = 'http://localhost:3000/api/feedback'; // Update with your backend URL
  private feedbacksSubject = new BehaviorSubject<Feedback[]>([]);
  public feedbacks$ = this.feedbacksSubject.asObservable();

  // Mock data for demonstration
  private mockFeedbacks: Feedback[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'John Doe',
      rating: 5,
      comment: 'Excellent service! Very satisfied with the complaint resolution.',
      category: 'service',
      createdAt: new Date('2024-01-15'),
      isAnonymous: false
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Anonymous',
      rating: 4,
      comment: 'Good website interface, easy to navigate.',
      category: 'website',
      createdAt: new Date('2024-01-14'),
      isAnonymous: true
    }
  ];

  constructor(private http: HttpClient) {
    // Initialize with mock data
    this.feedbacksSubject.next(this.mockFeedbacks);
  }

  // Submit new feedback
  submitFeedback(feedback: Feedback): Observable<Feedback> {
    // For now, use mock implementation
    const newFeedback: Feedback = {
      ...feedback,
      id: Date.now().toString(),
      createdAt: new Date()
    };

    const currentFeedbacks = this.feedbacksSubject.value;
    this.feedbacksSubject.next([...currentFeedbacks, newFeedback]);

    // Uncomment when backend is ready
    // return this.http.post<Feedback>(this.apiUrl, feedback);
    return of(newFeedback);
  }

  // Get all feedbacks
  getAllFeedbacks(): Observable<Feedback[]> {
    // return this.http.get<Feedback[]>(this.apiUrl);
    return this.feedbacks$;
  }

  // Get feedback statistics
  getFeedbackStats(): Observable<FeedbackStats> {
    const feedbacks = this.feedbacksSubject.value;
    const totalFeedbacks = feedbacks.length;
    
    if (totalFeedbacks === 0) {
      return of({
        averageRating: 0,
        totalFeedbacks: 0,
        ratingDistribution: {}
      });
    }

    const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks;
    const ratingDistribution: { [key: number]: number } = {};
    
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = feedbacks.filter(f => f.rating === i).length;
    }

    const stats: FeedbackStats = {
      averageRating: Math.round(averageRating * 10) / 10,
      totalFeedbacks,
      ratingDistribution
    };

    return of(stats);
  }

  // Get feedbacks by category
  getFeedbacksByCategory(category: string): Observable<Feedback[]> {
    const feedbacks = this.feedbacksSubject.value;
    const filtered = feedbacks.filter(f => f.category === category);
    return of(filtered);
  }

  // Delete feedback (admin only)
  deleteFeedback(id: string): Observable<boolean> {
    const currentFeedbacks = this.feedbacksSubject.value;
    const updatedFeedbacks = currentFeedbacks.filter(f => f.id !== id);
    this.feedbacksSubject.next(updatedFeedbacks);
    
    // return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
    return of(true);
  }
}
