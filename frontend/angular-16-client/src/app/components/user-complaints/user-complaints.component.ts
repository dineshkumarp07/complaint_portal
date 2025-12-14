import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-complaints',
  templateUrl: './user-complaints.component.html',
  styleUrls: ['./user-complaints.component.css']
})
export class UserComplaintsComponent implements OnInit {
  studentID = '';
  complaints: any[] = [];
  errorMessage = '';
  isLoading = false;
  hasSearched = false;
  isLoggedIn = false;
  showSearchForm = false; // New: Control when to show search form
  isAdmin = false; // New: Track if user is admin

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Check if admin is logged in
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    if (adminLoggedIn === 'true') {
      this.isAdmin = true;
      this.isLoggedIn = true;
      this.hasSearched = true;
      this.showSearchForm = false;
      // Load all complaints for admin
      this.loadAllComplaints(true);
      return;
    }

    // Auto-fill Student ID from login session and load complaints automatically
    const studentId = localStorage.getItem('studentID');
    if (studentId) {
      this.studentID = studentId;
      this.isLoggedIn = true;
      this.hasSearched = true; // Mark as searched so we show appropriate UI
      // Auto-search if user is already logged in
      this.fetchComplaints();
    } else {
      // Check for anonymous tracking codes
      const anonymousCodes = localStorage.getItem('anonymousTrackingCodes');
      if (anonymousCodes) {
        const codes = JSON.parse(anonymousCodes);
        if (codes.length > 0) {
          // Show message about anonymous complaints
          this.errorMessage = `You have ${codes.length} anonymous complaint(s). Use your tracking code to view them.`;
        }
      }
      
      // If no Student ID in localStorage, show the search form
      this.isLoggedIn = false;
      this.hasSearched = false;
      this.showSearchForm = true;
    }
  }

  // New method to load all complaints for admin
  loadAllComplaints(showAlerts: boolean = false) {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.http.get<any[]>('http://localhost:3005/api/complaints')
      .subscribe({
        next: (response: any) => {
          console.log('All complaints loaded for admin:', response);
          
          // Handle both array response and object with data property
          if (Array.isArray(response)) {
            this.complaints = response;
          } else if (response && response.data) {
            this.complaints = response.data;
          } else {
            this.complaints = [];
          }
          
          this.isLoading = false;
          console.log('Total complaints loaded:', this.complaints.length);

          // High-risk or attention alerts
          if (showAlerts && response && response.meta) {
            const highRiskCount = response.meta.highRiskCount || 0;
            const attentionCount = response.meta.attentionCount || 0;

            if (highRiskCount > 0) {
              const highRisk = this.complaints.filter(c => c && c.isHighRisk);
              const list = highRisk.slice(0, 5).map((c: any) => `#${c._id?.slice(-6)} (${c.priority || '—'}) - ${c.title || (c.category || 'General')}`).join('\n');
              alert(`Important: ${highRiskCount} high-risk complaint(s) detected.\n\nTop items:\n${list}`);
            } else if (attentionCount > 0) {
              const attention = this.complaints.filter(c => c && c.requiresAttention && !c.isHighRisk);
              const list = attention.slice(0, 5).map((c: any) => `#${c._id?.slice(-6)} - ${c.title || (c.category || 'General')}`).join('\n');
              alert(`Notice: ${attentionCount} complaint(s) require attention (e.g., staff scolded).\n\nExamples:\n${list}`);
            }

            // Priority-based alert (High/Urgent)
            const urgentHigh = this.complaints.filter(c => c && typeof c.priority === 'string' && ['urgent','high'].includes(c.priority.toLowerCase()));
            if (urgentHigh.length > 0) {
              const list = urgentHigh.slice(0, 5).map((c: any) => `#${c._id?.slice(-6)} (${c.priority}) - ${c.title || (c.category || 'General')}`).join('\n');
              alert(`Priority Alert: ${urgentHigh.length} complaint(s) marked High/Urgent.\n\nExamples:\n${list}`);
            }
          }
        },
        error: (err) => {
          console.error('Error loading all complaints:', err);
          this.errorMessage = 'Unable to load complaints. Please try again.';
          this.isLoading = false;
          this.complaints = [];
        }
      });
  }

  fetchComplaints() {
    if (!this.studentID.trim()) {
      this.errorMessage = 'Please enter your Student ID or Anonymous Tracking Code to search for complaints.';
      return;
    }

    // Validate input format (basic validation)
    if (this.studentID.trim().length < 1) {
      this.errorMessage = 'Please enter a valid Student ID or Tracking Code.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.hasSearched = true;
    this.showSearchForm = false; // Hide search form while loading

    console.log('Searching for complaints with ID/Code:', this.studentID);

    this.http.get<any[]>(`http://localhost:3005/api/complaints/user/${this.studentID}`)
      .subscribe({
        next: (response: any) => {
          console.log('API Response:', response);
          
          // Handle both array response and object with data property
          if (Array.isArray(response)) {
            this.complaints = response;
          } else if (response && response.data) {
            this.complaints = response.data;
          } else {
            this.complaints = [];
          }
          
          this.isLoading = false;
          
          // Store the Student ID/Tracking Code in localStorage for future use
          if (!localStorage.getItem('studentID')) {
            localStorage.setItem('studentID', this.studentID);
            this.isLoggedIn = true;
          }
          
          console.log('Complaints found:', this.complaints.length);
        },
        error: (err) => {
          console.error('Error fetching complaints:', err);
          this.errorMessage = `Unable to fetch complaints for ${this.isTrackingCode(this.studentID) ? 'Tracking Code' : 'Student ID'}: ${this.studentID}. Please verify and try again.`;
          this.isLoading = false;
          this.complaints = [];
          this.showSearchForm = true; // Show search form on error
        }
      });
  }

  // Check if input is a tracking code
  isTrackingCode(input: string): boolean {
    // Check for the new format: ADJECTIVE-NOUN-NUMBER (e.g., HAPPY-TIGER-123)
    const trackingCodePattern = /^[A-Z]+-[A-Z]+-\d{3}$/;
    return trackingCodePattern.test(input);
  }

  // Get saved anonymous tracking codes
  getAnonymousTrackingCodes(): string[] {
    const codes = localStorage.getItem('anonymousTrackingCodes');
    return codes ? JSON.parse(codes) : [];
  }

  // Show anonymous tracking codes to user
  showAnonymousTrackingCodes() {
    const codes = this.getAnonymousTrackingCodes();
    if (codes.length > 0) {
      const codesList = codes.join('\n');
      alert(`Your Anonymous Complaint Tracking Codes:\n\n${codesList}\n\nUse any of these codes to view your anonymous complaints.`);
    } else {
      alert('No anonymous complaint tracking codes found.');
    }
  }

  searchForDifferentStudent() {
    this.showSearchForm = true;
    this.studentID = '';
    this.complaints = [];
    this.errorMessage = '';
    this.hasSearched = false;
    this.isLoggedIn = false;
  }

  clearSearch() {
    this.studentID = '';
    this.complaints = [];
    this.errorMessage = '';
    this.hasSearched = false;
    this.isLoggedIn = false;
    this.showSearchForm = true;
    localStorage.removeItem('studentID');
  }

  // New method to clear admin session
  clearAdminSession() {
    localStorage.removeItem('adminLoggedIn');
    this.isAdmin = false;
    this.isLoggedIn = false;
    this.complaints = [];
    this.errorMessage = '';
    this.hasSearched = false;
    this.showSearchForm = true;
  }

  // Helper methods for safe counting
  getPendingCount(): number {
    if (!this.complaints || !Array.isArray(this.complaints)) return 0;
    return this.complaints.filter(c => c && c.status === 'Pending').length;
  }

  getResolvedCount(): number {
    if (!this.complaints || !Array.isArray(this.complaints)) return 0;
    return this.complaints.filter(c => c && c.status === 'Resolved').length;
  }

  // Admin method to resolve a complaint
  resolveComplaint(complaint: any) {
    if (confirm(`Are you sure you want to mark complaint "${complaint.title}" as resolved?`)) {
      const updatedData = {
        status: 'Resolved',
        resolution: 'Complaint has been resolved by administrator',
        assignedTo: 'Admin'
      };

      this.http.put<any>(`http://localhost:3005/api/complaints/${complaint._id}`, updatedData)
        .subscribe({
          next: (response: any) => {
            console.log('Complaint resolved:', response);
            // Update the complaint in the local array
            const index = this.complaints.findIndex(c => c._id === complaint._id);
            if (index !== -1) {
              this.complaints[index] = { ...this.complaints[index], ...updatedData };
            }
            alert('Complaint marked as resolved successfully!');
          },
          error: (err) => {
            console.error('Error resolving complaint:', err);
            alert('Failed to resolve complaint. Please try again.');
          }
        });
    }
  }

  // Admin method to mark complaint as in progress
  markInProgress(complaint: any) {
    if (confirm(`Are you sure you want to mark complaint "${complaint.title}" as in progress?`)) {
      const updatedData = {
        status: 'In Progress',
        assignedTo: 'Admin'
      };

      this.http.put<any>(`http://localhost:3005/api/complaints/${complaint._id}`, updatedData)
        .subscribe({
          next: (response: any) => {
            console.log('Complaint marked as in progress:', response);
            // Update the complaint in the local array
            const index = this.complaints.findIndex(c => c._id === complaint._id);
            if (index !== -1) {
              this.complaints[index] = { ...this.complaints[index], ...updatedData };
            }
            alert('Complaint marked as in progress successfully!');
          },
          error: (err) => {
            console.error('Error updating complaint status:', err);
            alert('Failed to update complaint status. Please try again.');
          }
        });
    }
  }

  // Admin method to delete a complaint
  deleteComplaint(complaint: any) {
    if (confirm(`Are you sure you want to delete complaint "${complaint.title}"? This action cannot be undone.`)) {
      this.http.delete<any>(`http://localhost:3005/api/complaints/${complaint._id}`)
        .subscribe({
          next: (response: any) => {
            console.log('Complaint deleted:', response);
            // Remove the complaint from the local array
            this.complaints = this.complaints.filter(c => c._id !== complaint._id);
            alert('Complaint deleted successfully!');
          },
          error: (err) => {
            console.error('Error deleting complaint:', err);
            alert('Failed to delete complaint. Please try again.');
          }
        });
    }
  }

  getStatusClass(status: string): string {
    if (!status) return 'status-pending';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pending')) return 'status-pending';
    if (statusLower.includes('progress') || statusLower.includes('processing')) return 'status-progress';
    if (statusLower.includes('resolved') || statusLower.includes('completed')) return 'status-resolved';
    if (statusLower.includes('rejected') || statusLower.includes('denied')) return 'status-rejected';
    return 'status-pending'; // default fallback
  }

  getPriorityClass(priority: string): string {
    if (!priority) return 'priority-medium';
    const priorityLower = priority.toLowerCase();
    if (priorityLower.includes('urgent')) return 'priority-urgent';
    if (priorityLower.includes('high')) return 'priority-high';
    if (priorityLower.includes('medium')) return 'priority-medium';
    if (priorityLower.includes('low')) return 'priority-low';
    return 'priority-medium'; // default fallback
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  }

  getComplaintSummary(complaint: string): string {
    if (!complaint) return 'No description available';
    return complaint.length > 100 ? complaint.substring(0, 100) + '...' : complaint;
  }

  viewComplaintDetails(complaint: any) {
    // Show complaint details in an alert for now
    const details = `
Complaint Details:
- Complaint ID: ${complaint._id?.slice(-6) || 'N/A'}
- Title: ${complaint.title || 'No Title'}
- Category: ${complaint.category || 'General'}
- Priority: ${complaint.priority || 'Medium'}
- Status: ${complaint.status || 'Pending'}
- Submitted: ${this.formatDate(complaint.submissionDate || complaint.createdAt)}
- Description: ${complaint.complaint || 'No description'}
- Student Name: ${complaint.name || 'Anonymous'}
- Student ID: ${complaint.studentID || 'Anonymous'}
- Department: ${complaint.department || 'Not specified'}
- Contact: ${complaint.contactNumber || 'Not provided'}
- Email: ${complaint.email || 'Not provided'}
- Witnesses: ${complaint.witnesses || 'None'}
- Previous Complaints: ${complaint.previousComplaints || 'None'}
- Expected Resolution: ${complaint.expectedResolution || 'Not specified'}
- Assigned To: ${complaint.assignedTo || 'Not assigned'}
- Resolution: ${complaint.resolution || 'Not resolved yet'}
 - Tracking Code: ${complaint.trackingCode || 'N/A'}
 - History: ${(complaint.history && Array.isArray(complaint.history) && complaint.history.length > 0)
        ? complaint.history.map((h: any) => `${h.status} on ${this.formatDate(h.changedAt)}`).join(' \u2192 ')
        : 'No history'}
    `;
    alert(details);
  }

  copyTrackingCode(code: string | null | undefined) {
    if (!code) {
      alert('No tracking code available for this complaint.');
      return;
    }
    if (navigator && (navigator as any).clipboard && (navigator as any).clipboard.writeText) {
      (navigator as any).clipboard.writeText(code).then(() => {
        alert('Tracking code copied to clipboard!');
      }).catch(() => {
        this.copyTextFallback(code);
      });
    } else {
      this.copyTextFallback(code);
    }
  }

  private copyTextFallback(text: string) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand('copy'); } catch {}
    document.body.removeChild(textarea);
    alert('Tracking code copied to clipboard!');
  }

  showFullStatus(complaint: any) {
    const historyLines = (complaint.history && Array.isArray(complaint.history) && complaint.history.length > 0)
      ? complaint.history.map((h: any, idx: number) => `${idx + 1}. ${h.status} on ${this.formatDate(h.changedAt)}${h.changedBy ? ` by ${h.changedBy}` : ''}${h.note ? ` — ${h.note}` : ''}`).join('\n')
      : 'No history available';

    const statusDetails = `
Full Status
====================
Title: ${complaint.title || 'No Title'}
Complaint (Full Text):\n${complaint.complaint || 'No description provided'}\n
Current Status: ${complaint.status || 'Pending'}
Priority: ${complaint.priority || 'Medium'}
Assigned To: ${complaint.assignedTo || 'Not assigned'}
Resolution: ${complaint.resolution || 'Not resolved yet'}
Tracking Code: ${complaint.trackingCode || 'N/A'}
Submitted: ${this.formatDate(complaint.submissionDate || complaint.createdAt)}
Last Updated: ${this.formatDate(complaint.updatedAt)}

Status History:
${historyLines}
    `;
    alert(statusDetails);
  }
}