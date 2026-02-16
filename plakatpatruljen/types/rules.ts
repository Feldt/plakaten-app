export type ElectionType = 'kommunal' | 'regional' | 'folketings' | 'europa';

export interface HangingPeriod {
  electionType: ElectionType;
  electionDate: Date;
  earliestHanging: Date;
  latestRemoval: Date;
  daysBeforeElection: number;
  daysAfterForRemoval: number;
}

export interface PosterRule {
  id: string;
  category: 'placement' | 'timing' | 'size' | 'safety' | 'removal';
  title: string;
  description: string;
  regulation: string;
  enforcedBy: 'kommune' | 'vejdirektoratet' | 'politi';
}

export interface RuleViolation {
  ruleId: string;
  severity: 'warning' | 'error';
  message: string;
  details?: string;
}

export interface RuleCheckResult {
  passed: boolean;
  violations: RuleViolation[];
  checkedAt: Date;
}
