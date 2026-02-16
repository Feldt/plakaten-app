import { useState, useEffect } from 'react';
import {
  isWithinHangingPeriod,
  isRemovalPeriod,
  daysUntilRemovalDeadline,
} from '@/lib/time/electionDates';
import type { ElectionType } from '@/types/rules';

export function useTimeCheck(electionType: ElectionType, electionDate: Date) {
  const [canHang, setCanHang] = useState(false);
  const [isRemoval, setIsRemoval] = useState(false);
  const [daysUntilDeadline, setDaysUntilDeadline] = useState(0);

  useEffect(() => {
    const check = () => {
      setCanHang(isWithinHangingPeriod(electionType, electionDate));
      setIsRemoval(isRemovalPeriod(electionDate));
      setDaysUntilDeadline(daysUntilRemovalDeadline(electionDate));
    };

    check();
    const interval = setInterval(check, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [electionType, electionDate]);

  return { canHang, isRemoval, daysUntilDeadline };
}
