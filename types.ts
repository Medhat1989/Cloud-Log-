
export enum StressLevel {
  BASELINE = 'Baseline',
  ELEVATED = 'Elevated',
  HIGH = 'High'
}

export enum FlightPhase {
  PRE_FLIGHT = 'Pre-Flight',
  TAXI = 'Taxi',
  TAKEOFF = 'Takeoff',
  CLIMB = 'Climb',
  CRUISE = 'Cruise',
  DESCENT = 'Descent',
  APPROACH = 'Approach',
  LANDING = 'Landing',
  DE_BOARDING = 'De-boarding'
}

export type CrewTask = 'Meal Distribution' | 'Medical Case' | 'Safety Check' | 'Galley Duty' | 'Rest' | 'Passenger Assist';

export interface MovementMarker {
  timestamp: number;
  zoneId: number;
  activityType: 'patrol' | 'service' | 'galley-work' | 'rest';
}

export interface CrewMember {
  id: string;
  name: string;
  position: string;
  zone: number;
  stress: StressLevel;
  lastCommunication: string;
  heartRate?: number;
  fatigueScore: number; // 0-100 score
  movementHistory: MovementMarker[];
  currentTaskTime: number; // seconds in current zone
  currentTaskDuration: number; // seconds engaged in current task
  currentTask?: CrewTask;
}

export interface ZoneStatus {
  zoneId: number;
  coverage: number; // 0 to 100
  activityLevel: 'Low' | 'Normal' | 'Intense';
  requestsPending: number;
  isOverloaded: boolean;
  sopRequiredStaff: number;
  currentStaffCount: number;
}

export interface CommunicationMetric {
  timestamp: string;
  f0: number; // Fundamental Frequency
  jitter: number;
  shimmer: number;
  stressScore: number;
}

export interface EmergencyAlert {
  id: string;
  type: 'Medical' | 'Security' | 'Safety';
  medicalType?: string; // e.g., 'Cardiac', 'Respiratory', 'Neurological'
  sopBrief?: string[]; // List of required SOP steps
  seatNumber: string;
  crewName: string;
  timestamp: number;
}
