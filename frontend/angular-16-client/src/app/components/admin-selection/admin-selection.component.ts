import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface AdminProfile {
  id: string;
  name: string;
  designation: string;
}

@Component({
  selector: 'app-admin-selection',
  templateUrl: './admin-selection.component.html',
  styleUrls: ['./admin-selection.component.css']
})
export class AdminSelectionComponent {
  admins: AdminProfile[] = [
    { id: 'SVG', name: 'Dr.S.Varadhaganapathy', designation: 'Professor' },
    { id: 'AJ', name: 'A.Jeevanantham', designation: 'Assistant Professor' },
    { id: 'KK', name: 'Dr.K.Krishnamoorthy', designation: 'Professor' },
    { id: 'SA', name: 'Dr.S.Anandhamurugan', designation: 'Assistant Professor' }
  ];

  constructor(private router: Router) {}

  onSelect(): void {
    this.router.navigate(['/admin-login']);
  }

  getInitials(name: string): string {
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
  }
}


