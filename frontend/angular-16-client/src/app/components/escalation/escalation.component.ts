import { Component, OnInit, OnDestroy } from '@angular/core';
import { EscalationService } from '../../services/escalation.service';
import { EscalationRule, EscalationHistory, ComplaintEscalation, EscalationLevel } from '../../models/escalation.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-escalation',
  templateUrl: './escalation.component.html',
  styleUrls: ['./escalation.component.css']
})
export class EscalationComponent implements OnInit, OnDestroy {
  escalations: ComplaintEscalation[] = [];
  escalationRules: EscalationRule[] = [];
  escalationHistory: EscalationHistory[] = [];
  escalationLevels: EscalationLevel[] = [];
  
  selectedTab: string = 'active';
  selectedComplaint: ComplaintEscalation | null = null;
  isCreateRuleModalOpen: boolean = false;
  
  newRule = {
    name: '',
    description: '',
    triggerType: 'time_based' as any,
    triggerValue: 24,
    priority: 'medium' as any,
    targetLevel: 1,
    isActive: true,
    conditions: {
      categories: [] as string[],
      priorities: [] as string[],
      minAge: 0
    }
  };

  stats = {
    activeEscalations: 0,
    resolvedToday: 0,
    avgResolutionTime: 0,
    escalationRate: 0
  };

  private subscription: Subscription = new Subscription();

  constructor(private escalationService: EscalationService) {}

  ngOnInit(): void {
    this.loadEscalations();
    this.loadEscalationRules();
    this.loadEscalationHistory();
    this.loadEscalationLevels();
    this.calculateStats();
    
    // Auto-escalation monitoring is handled by the service internally
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadEscalations(): void {
    this.escalationService.getAllEscalations().subscribe((escalations: ComplaintEscalation[]) => {
      this.escalations = escalations;
    });
  }

  loadEscalationRules(): void {
    this.escalationService.getEscalationRules().subscribe(rules => {
      this.escalationRules = rules;
    });
  }

  loadEscalationHistory(): void {
    // Get escalation history from all escalations
    this.escalationService.getAllEscalations().subscribe((escalations: ComplaintEscalation[]) => {
      this.escalationHistory = escalations.flatMap(e => e.escalationHistory);
    });
  }

  loadEscalationLevels(): void {
    // Get escalation levels from rules
    this.escalationService.getEscalationRules().subscribe(rules => {
      if (rules.length > 0) {
        this.escalationLevels = rules[0].escalationLevels;
      }
    });
  }

  calculateStats(): void {
    this.stats.activeEscalations = this.escalations.length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.stats.resolvedToday = this.escalationHistory.filter(h => 
      h.status === 'resolved' && new Date(h.escalatedAt) >= today
    ).length;
    
    // Calculate average resolution time (mock calculation)
    this.stats.avgResolutionTime = 4.2;
    this.stats.escalationRate = 12.5;
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  viewComplaintDetails(escalation: ComplaintEscalation): void {
    this.selectedComplaint = escalation;
  }

  closeComplaintDetails(): void {
    this.selectedComplaint = null;
  }

  escalateComplaint(complaintId: string, targetLevel: number): void {
    this.escalationService.escalateComplaint(complaintId, targetLevel.toString()).subscribe(() => {
      this.loadEscalations();
      this.loadEscalationHistory();
      this.calculateStats();
    });
  }

  resolveEscalation(complaintId: string): void {
    this.escalationService.resolveEscalation(complaintId).subscribe(() => {
      this.loadEscalations();
      this.loadEscalationHistory();
      this.calculateStats();
    });
  }

  openCreateRuleModal(): void {
    this.isCreateRuleModalOpen = true;
  }

  closeCreateRuleModal(): void {
    this.isCreateRuleModalOpen = false;
    this.resetNewRule();
  }

  createEscalationRule(): void {
    if (!this.newRule.name.trim() || !this.newRule.description.trim()) {
      return;
    }

    // Mock rule creation since service doesn't have createEscalationRule method
    const newRule: EscalationRule = {
      id: Date.now().toString(),
      name: this.newRule.name,
      description: this.newRule.description,
      triggerType: this.newRule.triggerType,
      triggerValue: this.newRule.triggerValue,
      priority: this.newRule.priority,
      targetLevel: this.newRule.targetLevel,
      triggerConditions: [{
        type: this.newRule.triggerType,
        condition: 'time_limit',
        value: this.newRule.triggerValue,
        timeLimit: this.newRule.triggerValue
      }],
      escalationLevels: [{
        level: this.newRule.targetLevel,
        name: `Level ${this.newRule.targetLevel}`,
        description: this.newRule.description,
        assignedTo: ['admin@college.edu'],
        emailNotification: true,
        smsNotification: false,
        timeLimit: 24
      }],
      isActive: this.newRule.isActive,
      createdAt: new Date()
    };
    
    this.escalationRules.push(newRule);
    this.closeCreateRuleModal();
  }

  toggleRuleStatus(ruleId: string): void {
    // Mock toggle functionality
    const rule = this.escalationRules.find(r => r.id === ruleId);
    if (rule) {
      rule.isActive = !rule.isActive;
    }
  }

  deleteRule(ruleId: string): void {
    if (confirm('Are you sure you want to delete this escalation rule?')) {
      this.escalationRules = this.escalationRules.filter(r => r.id !== ruleId);
    }
  }

  private resetNewRule(): void {
    this.newRule = {
      name: '',
      description: '',
      triggerType: 'time_based',
      triggerValue: 24,
      priority: 'medium',
      targetLevel: 1,
      isActive: true,
      conditions: {
        categories: [],
        priorities: [],
        minAge: 0
      }
    };
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDuration(hours: number): string {
    if (hours < 24) {
      return `${hours}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
  }

  getPriorityColor(priority: string): string {
    const colorMap: { [key: string]: string } = {
      low: '#48bb78',
      medium: '#ed8936',
      high: '#f56565',
      critical: '#e53e3e'
    };
    return colorMap[priority] || '#718096';
  }

  getLevelColor(level: number): string {
    const colors = ['#48bb78', '#ed8936', '#f56565', '#e53e3e'];
    return colors[Math.min(level - 1, colors.length - 1)] || '#718096';
  }

  getTimeUntilEscalation(escalation: ComplaintEscalation): string {
    if (!escalation.nextEscalationTime) {
      return 'No auto-escalation scheduled';
    }
    
    const now = new Date();
    const nextEscalation = new Date(escalation.nextEscalationTime);
    const diffMs = nextEscalation.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return 'Overdue for escalation';
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m remaining`;
    } else {
      return `${diffMinutes}m remaining`;
    }
  }
}
