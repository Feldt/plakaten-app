import type { ElectionType, HangingPeriod } from '@/types/rules';

function getFourthSaturdayBefore(date: Date): Date {
  const result = new Date(date);
  // Go back to the Saturday before election
  const dayOfWeek = result.getDay();
  const daysToLastSaturday = dayOfWeek === 6 ? 7 : dayOfWeek + 1;
  result.setDate(result.getDate() - daysToLastSaturday);
  // Go back 3 more weeks (total 4 Saturdays before)
  result.setDate(result.getDate() - 21);
  return result;
}

const REMOVAL_DAYS: Record<ElectionType, number> = {
  kommunal: 8,
  regional: 8,
  folketings: 8,
  europa: 8,
};

const DAYS_BEFORE: Record<ElectionType, number> = {
  kommunal: 28, // ~4 weeks (4th Saturday approximation, calculated properly)
  regional: 28,
  folketings: 21, // 3 weeks (announced election)
  europa: 28,
};

export function calculateHangingPeriod(
  electionType: ElectionType,
  electionDate: Date,
): HangingPeriod {
  let earliestHanging: Date;

  if (electionType === 'folketings') {
    // Folketingsvalg: 3 weeks before as default
    earliestHanging = new Date(electionDate);
    earliestHanging.setDate(earliestHanging.getDate() - 21);
  } else {
    // Kommunal, regional, europa: 4th Saturday before
    earliestHanging = getFourthSaturdayBefore(electionDate);
  }

  const removalDays = REMOVAL_DAYS[electionType];
  const latestRemoval = new Date(electionDate);
  latestRemoval.setDate(latestRemoval.getDate() + removalDays);

  return {
    electionType,
    electionDate,
    earliestHanging,
    latestRemoval,
    daysBeforeElection: DAYS_BEFORE[electionType],
    daysAfterForRemoval: removalDays,
  };
}

export function isWithinHangingPeriod(
  electionType: ElectionType,
  electionDate: Date,
  checkDate: Date = new Date(),
): boolean {
  const period = calculateHangingPeriod(electionType, electionDate);
  return checkDate >= period.earliestHanging && checkDate <= period.latestRemoval;
}

export function isRemovalPeriod(
  electionDate: Date,
  checkDate: Date = new Date(),
): boolean {
  const dayAfterElection = new Date(electionDate);
  dayAfterElection.setDate(dayAfterElection.getDate() + 1);
  const removalDeadline = new Date(electionDate);
  removalDeadline.setDate(removalDeadline.getDate() + 8);
  return checkDate >= dayAfterElection && checkDate <= removalDeadline;
}

export function daysUntilRemovalDeadline(
  electionDate: Date,
  checkDate: Date = new Date(),
): number {
  const deadline = new Date(electionDate);
  deadline.setDate(deadline.getDate() + 8);
  const diff = deadline.getTime() - checkDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
