import React from 'react';
import { Badge } from './Badge';

type Status = 'active' | 'draft' | 'paused' | 'completed' | 'cancelled' | 'expired' | 'claimed' | 'in_progress';

const statusVariants: Record<Status, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  active: 'success',
  draft: 'default',
  paused: 'warning',
  completed: 'success',
  cancelled: 'error',
  expired: 'error',
  claimed: 'info',
  in_progress: 'warning',
};

const statusLabels: Record<Status, string> = {
  active: 'Aktiv',
  draft: 'Kladde',
  paused: 'Pauseret',
  completed: 'Fuldført',
  cancelled: 'Annulleret',
  expired: 'Udløbet',
  claimed: 'Taget',
  in_progress: 'I gang',
};

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge label={statusLabels[status]} variant={statusVariants[status]} />;
}
