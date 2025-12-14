export interface EscalationRule {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  triggerValue: number;
  priority: string;
  targetLevel: number;
  triggerConditions: EscalationTrigger[];
  escalationLevels: EscalationLevel[];
  isActive: boolean;
  createdAt: Date;
}

export interface EscalationTrigger {
  type: 'time_based' | 'priority_based' | 'category_based' | 'manual';
  condition: string;
  value: any;
  timeLimit?: number; // in hours
}

export interface EscalationLevel {
  level: number;
  name: string;
  description: string;
  assignedTo: string[];
  emailNotification: boolean;
  smsNotification: boolean;
  timeLimit: number; // hours before next escalation
}

export interface EscalationHistory {
  id: string;
  complaintId: string;
  complaintTitle: string;
  fromLevel: number;
  toLevel: number;
  reason: string;
  description: string;
  action: string;
  escalatedBy: string;
  escalatedAt: Date;
  timestamp: Date;
  assignedTo: string;
  status: 'pending' | 'acknowledged' | 'resolved' | 'further_escalated';
  notes?: string;
}

export interface ComplaintEscalation {
  id: string;
  complaintId: string;
  complaintTitle: string;
  category: string;
  priority: string;
  currentLevel: number;
  maxLevel: number;
  isEscalated: boolean;
  escalationHistory: EscalationHistory[];
  nextEscalationTime?: Date;
  lastEscalatedAt?: Date;
  autoEscalationEnabled: boolean;
  ageInHours: number;
  assignedTo?: string;
}
