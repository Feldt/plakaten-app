import type { Coordinates } from '@/types/geo';
import type { RuleViolation, RuleCheckResult, ElectionType } from '@/types/rules';
import { POSTER_RULES } from '@/config/constants';
import { isWithinHangingPeriod } from '@/lib/time/electionDates';

interface CheckContext {
  coordinates: Coordinates;
  electionType: ElectionType;
  electionDate: Date;
  currentDate?: Date;
  nearbyPosterDistanceMeters?: number;
  nearestIntersectionMeters?: number;
  heightMeters?: number;
  isMotorway?: boolean;
}

export function checkPosterRules(context: CheckContext): RuleCheckResult {
  const violations: RuleViolation[] = [];
  const now = context.currentDate ?? new Date();

  if (!isWithinHangingPeriod(context.electionType, context.electionDate, now)) {
    violations.push({
      ruleId: 'hanging-period',
      severity: 'error',
      message: 'Ophængning er ikke tilladt uden for ophængningsperioden.',
    });
  }

  if (context.heightMeters !== undefined && context.heightMeters < POSTER_RULES.minHeightMeters) {
    violations.push({
      ruleId: 'height-minimum',
      severity: 'error',
      message: `Plakaten hænger for lavt. Minimum ${POSTER_RULES.minHeightMeters}m krævet.`,
    });
  }

  if (
    context.nearestIntersectionMeters !== undefined &&
    context.nearestIntersectionMeters < POSTER_RULES.minDistanceFromIntersectionMeters
  ) {
    violations.push({
      ruleId: 'intersection-distance',
      severity: 'warning',
      message: `For tæt på vejkryds. Minimum ${POSTER_RULES.minDistanceFromIntersectionMeters}m krævet.`,
    });
  }

  if (
    context.nearbyPosterDistanceMeters !== undefined &&
    context.nearbyPosterDistanceMeters < POSTER_RULES.maxDistanceBetweenMeters
  ) {
    violations.push({
      ruleId: 'poster-spacing',
      severity: 'warning',
      message: `For tæt på anden plakat. Minimum ${POSTER_RULES.maxDistanceBetweenMeters}m krævet.`,
    });
  }

  if (context.isMotorway) {
    violations.push({
      ruleId: 'motorway-prohibition',
      severity: 'error',
      message: 'Plakater er forbudt langs motorveje.',
    });
  }

  return {
    passed: violations.filter((v) => v.severity === 'error').length === 0,
    violations,
    checkedAt: now,
  };
}
