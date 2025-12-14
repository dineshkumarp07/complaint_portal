import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-complaints',
  templateUrl: './view-complaints.component.html',
  styleUrls: ['./view-complaints.component.css']
})
export class ViewComplaintsComponent implements OnInit {

  complaints: any[] = []; // empty array to avoid TS errors

  constructor(private router: Router) {}

  ngOnInit() {
    const isAdmin = localStorage.getItem('adminLoggedIn');
    if (!isAdmin) {
      this.router.navigate(['/admin-login']);
    }

    // Optionally, load complaints from backend later
    this.loadComplaints();
  }

  loadComplaints() {
    // Minimal placeholder to prevent errors
    this.complaints = [
      { _id: '1', studentID: 'S001', description: 'Complaint 1', status: 'Pending' },
      { _id: '2', studentID: 'S002', description: 'Complaint 2', status: 'Resolved' }
    ];
  }

  resolveComplaint(id: string) {
    alert(`Resolved complaint ${id}`);
  }

  deleteComplaint(id: string) {
    alert(`Deleted complaint ${id}`);
  }

  editComplaint(c: any) {
    alert(`Edit complaint: ${c.description}`);
  }
}
