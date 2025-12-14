import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, interval } from 'rxjs';
import { EscalationRule, EscalationHistory, ComplaintEscalation, EscalationLevel } from '../models/escalation.model';

@Injectable({
  providedIn: 'root'
})
export class EscalationService {
  private escalationsSubject = new BehaviorSubject<ComplaintEscalation[]>([]);
  public escalations$ = this.escalationsSubject.asObservable();

  private escalationRules: EscalationRule[] = [
    {
      id: '1',
      name: 'Time-based Escalation',
      description: 'Auto-escalate complaints not resolved within specified time',
      triggerType: 'time_based',
      triggerValue: 24,
      priority: 'medium',
      targetLevel: 2,
      triggerConditions: [
        {
          type: 'time_based',
          condition: 'no_response_time',
          value: 24,
          timeLimit: 24
        }
      ],
      escalationLevels: [
        {
          level: 1,
          name: 'Department Head',
          description: 'First level escalation to department head',
          assignedTo: ['dept_head@college.edu'],
          emailNotification: true,
          smsNotification: false,
          timeLimit: 48
        },
        {
          level: 2,
          name: 'Dean Office',
          description: 'Second level escalation to Dean',
          assignedTo: ['dean@college.edu'],
          emailNotification: true,
          smsNotification: true,
          timeLimit: 72
        },
        {
          level: 3,
          name: 'Principal Office',
          description: 'Final escalation to Principal',
          assignedTo: ['principal@college.edu'],
          emailNotification: true,
          smsNotification: true,
          timeLimit: 96
        }
      ],
      isActive: true,
      createdAt: new Date()
    },
    {
      id: '2',
      name: 'Priority-based Escalation',
      description: 'Immediate escalation for high priority complaints',
      triggerType: 'priority_based',
      triggerValue: 1,
      priority: 'high',
      targetLevel: 1,
      triggerConditions: [
        {
          type: 'priority_based',
          condition: 'priority_level',
          value: 'high'
        }
      ],
      escalationLevels: [
        {
          level: 1,
          name: 'Senior Administrator',
          description: 'Direct escalation to senior admin for urgent issues',
          assignedTo: ['admin@college.edu'],
          emailNotification: true,
          smsNotification: true,
          timeLimit: 12
        }
      ],
      isActive: true,
      createdAt: new Date()
    }
  ];

  private mockEscalations: ComplaintEscalation[] = [
    {
      id: '1',
      complaintId: 'complaint_001',
      complaintTitle: 'Hostel WiFi Not Working',
      category: 'hostel',
      priority: 'high',
      currentLevel: 1,
      maxLevel: 3,
      isEscalated: true,
      ageInHours: 36,
      assignedTo: 'dept_head@college.edu',
      escalationHistory: [
        {
          id: 'esc_001',
          complaintId: 'complaint_001',
          complaintTitle: 'Hostel WiFi Not Working',
          fromLevel: 0,
          toLevel: 1,
          reason: 'No response within 24 hours',
          description: 'Complaint escalated due to no response within specified time limit',
          action: 'escalated',
          escalatedBy: 'system',
          escalatedAt: new Date('2024-01-15T10:00:00'),
          timestamp: new Date('2024-01-15T10:00:00'),
          assignedTo: 'dept_head@college.edu',
          status: 'pending'
        }
      ],
      nextEscalationTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
      lastEscalatedAt: new Date('2024-01-15T10:00:00'),
      autoEscalationEnabled: true
    }
  ];

  constructor() {
    this.escalationsSubject.next(this.mockEscalations);
    this.startEscalationMonitoring();
  }

  createEscalation(complaintId: string, priority: string = 'normal'): Observable<ComplaintEscalation> {
    const escalation: ComplaintEscalation = {
      id: Date.now().toString(),
      complaintId,
      complaintTitle: `Complaint ${complaintId}`,
      category: 'general',
      priority,
      currentLevel: 0,
      maxLevel: 3,
      isEscalated: false,
      ageInHours: 0,
      escalationHistory: [],
      autoEscalationEnabled: true
    };

    // Check for immediate escalation based on priority
    if (priority === 'high' || priority === 'urgent') {
      this.escalateComplaintInternal(escalation.id, 'High priority complaint - immediate escalation');
    } else {
      // Set next escalation time for normal priority
      escalation.nextEscalationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    const currentEscalations = this.escalationsSubject.value;
    this.escalationsSubject.next([...currentEscalations, escalation]);

    return of(escalation);
  }

  escalateComplaint(complaintId: string, targetLevel: string): Observable<boolean> {
    const escalations = this.escalationsSubject.value;
    const escalationIndex = escalations.findIndex(e => e.complaintId === complaintId);

    if (escalationIndex === -1) {
      return of(false);
    }

    const escalation = escalations[escalationIndex];
    const nextLevel = parseInt(targetLevel);

    if (nextLevel > escalation.maxLevel) {
      return of(false);
    }

    const escalationHistory: EscalationHistory = {
      id: Date.now().toString(),
      complaintId: escalation.complaintId,
      complaintTitle: escalation.complaintTitle,
      fromLevel: escalation.currentLevel,
      toLevel: nextLevel,
      reason: `Manual escalation to level ${nextLevel}`,
      description: `Escalated from level ${escalation.currentLevel} to level ${nextLevel}`,
      action: 'escalated',
      escalatedBy: 'admin',
      escalatedAt: new Date(),
      timestamp: new Date(),
      assignedTo: this.getAssignedPersonForLevel(nextLevel),
      status: 'pending'
    };

    escalation.currentLevel = nextLevel;
    escalation.isEscalated = true;
    escalation.escalationHistory.push(escalationHistory);
    escalation.lastEscalatedAt = new Date();

    if (nextLevel < escalation.maxLevel) {
      const timeLimit = this.getTimeLimitForLevel(nextLevel);
      escalation.nextEscalationTime = new Date(Date.now() + timeLimit * 60 * 60 * 1000);
    }

    this.escalationsSubject.next([...escalations]);
    this.sendEscalationNotifications(escalationHistory);

    return of(true);
  }

  escalateComplaintInternal(escalationId: string, reason: string, manualEscalation: boolean = false): Observable<boolean> {
    const escalations = this.escalationsSubject.value;
    const escalationIndex = escalations.findIndex(e => e.id === escalationId);

    if (escalationIndex === -1) {
      return of(false);
    }

    const escalation = escalations[escalationIndex];
    const nextLevel = escalation.currentLevel + 1;

    if (nextLevel > escalation.maxLevel) {
      return of(false); // Cannot escalate further
    }

    const escalationHistory: EscalationHistory = {
      id: Date.now().toString(),
      complaintId: escalation.complaintId,
      complaintTitle: escalation.complaintTitle,
      fromLevel: escalation.currentLevel,
      toLevel: nextLevel,
      reason,
      description: `Escalated from level ${escalation.currentLevel} to level ${nextLevel}: ${reason}`,
      action: 'escalated',
      escalatedBy: manualEscalation ? 'admin' : 'system',
      escalatedAt: new Date(),
      timestamp: new Date(),
      assignedTo: this.getAssignedPersonForLevel(nextLevel),
      status: 'pending'
    };

    escalation.currentLevel = nextLevel;
    escalation.isEscalated = true;
    escalation.escalationHistory.push(escalationHistory);
    escalation.lastEscalatedAt = new Date();

    // Set next escalation time if not at max level
    if (nextLevel < escalation.maxLevel) {
      const timeLimit = this.getTimeLimitForLevel(nextLevel);
      escalation.nextEscalationTime = new Date(Date.now() + timeLimit * 60 * 60 * 1000);
    }

    this.escalationsSubject.next([...escalations]);

    // Send notifications
    this.sendEscalationNotifications(escalationHistory);

    return of(true);
  }

  acknowledgeEscalation(escalationId: string, historyId: string): Observable<boolean> {
    const escalations = this.escalationsSubject.value;
    const escalation = escalations.find(e => e.id === escalationId);

    if (!escalation) {
      return of(false);
    }

    const historyItem = escalation.escalationHistory.find(h => h.id === historyId);
    if (historyItem) {
      historyItem.status = 'acknowledged';
      this.escalationsSubject.next([...escalations]);
    }

    return of(true);
  }

  resolveEscalation(escalationId: string, notes?: string): Observable<boolean> {
    const escalations = this.escalationsSubject.value;
    const escalationIndex = escalations.findIndex(e => e.id === escalationId);

    if (escalationIndex === -1) {
      return of(false);
    }

    const escalation = escalations[escalationIndex];
    
    // Mark latest escalation as resolved
    if (escalation.escalationHistory.length > 0) {
      const latestHistory = escalation.escalationHistory[escalation.escalationHistory.length - 1];
      latestHistory.status = 'resolved';
      if (notes) {
        latestHistory.notes = notes;
      }
    }

    // Clear next escalation time
    escalation.nextEscalationTime = undefined;

    this.escalationsSubject.next([...escalations]);

    return of(true);
  }

  getEscalationByComplaintId(complaintId: string): Observable<ComplaintEscalation | undefined> {
    const escalations = this.escalationsSubject.value;
    const escalation = escalations.find(e => e.complaintId === complaintId);
    return of(escalation);
  }

  getAllEscalations(): Observable<ComplaintEscalation[]> {
    return this.escalations$;
  }

  getPendingEscalations(): Observable<ComplaintEscalation[]> {
    const escalations = this.escalationsSubject.value;
    const pending = escalations.filter(e => 
      e.isEscalated && 
      e.escalationHistory.some(h => h.status === 'pending')
    );
    return of(pending);
  }

  getEscalationRules(): Observable<EscalationRule[]> {
    return of(this.escalationRules);
  }

  private startEscalationMonitoring(): void {
    // Check for escalations every hour
    interval(60 * 60 * 1000).subscribe(() => {
      this.checkForAutoEscalations();
    });

    // Initial check
    setTimeout(() => this.checkForAutoEscalations(), 5000);
  }

  private checkForAutoEscalations(): void {
    const escalations = this.escalationsSubject.value;
    const now = new Date();

    escalations.forEach(escalation => {
      if (
        escalation.autoEscalationEnabled &&
        escalation.nextEscalationTime &&
        now >= escalation.nextEscalationTime &&
        escalation.currentLevel < escalation.maxLevel
      ) {
        this.escalateComplaint(
          escalation.id,
          `Auto-escalation: No response within time limit`
        ).subscribe();
      }
    });
  }

  private getAssignedPersonForLevel(level: number): string {
    const levelMap: { [key: number]: string } = {
      1: 'dept_head@college.edu',
      2: 'dean@college.edu',
      3: 'principal@college.edu'
    };
    return levelMap[level] || 'admin@college.edu';
  }

  private getTimeLimitForLevel(level: number): number {
    const timeLimits: { [key: number]: number } = {
      1: 48, // 48 hours
      2: 72, // 72 hours
      3: 96  // 96 hours
    };
    return timeLimits[level as keyof typeof timeLimits] || 24;
  }

  private sendEscalationNotifications(escalationHistory: EscalationHistory): void {
    // Simulate sending notifications
    console.log(`Escalation notification sent for complaint ${escalationHistory.complaintId}`);
    console.log(`From Level ${escalationHistory.fromLevel} to Level ${escalationHistory.toLevel}`);
    console.log(`Assigned to: ${escalationHistory.assignedTo}`);
    console.log(`Escalation status: ${escalationHistory.status}`);
  }

  toggleAutoEscalation(escalationId: string): Observable<boolean> {
    const escalations = this.escalationsSubject.value;
    const escalation = escalations.find(e => e.id === escalationId);
    
    if (escalation) {
      escalation.autoEscalationEnabled = !escalation.autoEscalationEnabled;
      this.escalationsSubject.next([...escalations]);
      return of(true);
    }
    
    return of(false);
  }
}
