import {
  calculateHangingPeriod,
  isWithinHangingPeriod,
  isRemovalPeriod,
  daysUntilRemovalDeadline,
} from '@/lib/time/electionDates';

describe('calculateHangingPeriod', () => {
  it('calculates kommunal election period correctly', () => {
    // KV25: Nov 18, 2025
    const electionDate = new Date(2025, 10, 18); // Nov 18
    const period = calculateHangingPeriod('kommunal', electionDate);

    expect(period.electionType).toBe('kommunal');
    expect(period.electionDate).toEqual(electionDate);
    expect(period.daysAfterForRemoval).toBe(8);
    // Earliest hanging should be a Saturday, ~4 weeks before
    expect(period.earliestHanging.getDay()).toBe(6); // Saturday
    expect(period.earliestHanging < electionDate).toBe(true);
    // Removal deadline should be 8 days after
    const expectedRemoval = new Date(2025, 10, 26); // Nov 26
    expect(period.latestRemoval).toEqual(expectedRemoval);
  });

  it('calculates folketings election period correctly', () => {
    const electionDate = new Date(2026, 5, 15); // June 15
    const period = calculateHangingPeriod('folketings', electionDate);

    expect(period.electionType).toBe('folketings');
    // Folketingsvalg: 3 weeks (21 days) before
    const expectedEarliest = new Date(2026, 4, 25); // May 25
    expect(period.earliestHanging).toEqual(expectedEarliest);
    // Removal: 8 days after
    const expectedRemoval = new Date(2026, 5, 23); // June 23
    expect(period.latestRemoval).toEqual(expectedRemoval);
  });

  it('calculates europa election period correctly', () => {
    const electionDate = new Date(2029, 5, 10); // June 10
    const period = calculateHangingPeriod('europa', electionDate);

    expect(period.electionType).toBe('europa');
    expect(period.earliestHanging.getDay()).toBe(6); // Saturday
    expect(period.daysAfterForRemoval).toBe(8);
  });

  it('calculates regional election same as kommunal', () => {
    const electionDate = new Date(2025, 10, 18);
    const kommunal = calculateHangingPeriod('kommunal', electionDate);
    const regional = calculateHangingPeriod('regional', electionDate);

    expect(kommunal.earliestHanging).toEqual(regional.earliestHanging);
    expect(kommunal.latestRemoval).toEqual(regional.latestRemoval);
  });

  it('handles year boundary correctly', () => {
    // Election on Jan 5
    const electionDate = new Date(2026, 0, 5); // Jan 5, 2026
    const period = calculateHangingPeriod('kommunal', electionDate);

    // Earliest hanging should be in December 2025
    expect(period.earliestHanging.getFullYear()).toBe(2025);
    expect(period.earliestHanging.getMonth()).toBe(11); // December
  });
});

describe('isWithinHangingPeriod', () => {
  const electionDate = new Date(2025, 10, 18); // Nov 18, 2025

  it('returns true during valid hanging period', () => {
    const period = calculateHangingPeriod('kommunal', electionDate);
    const duringPeriod = new Date(period.earliestHanging);
    duringPeriod.setDate(duringPeriod.getDate() + 1);
    expect(isWithinHangingPeriod('kommunal', electionDate, duringPeriod)).toBe(true);
  });

  it('returns true on election day', () => {
    expect(isWithinHangingPeriod('kommunal', electionDate, electionDate)).toBe(true);
  });

  it('returns false before hanging period starts', () => {
    const tooEarly = new Date(2025, 9, 1); // Oct 1
    expect(isWithinHangingPeriod('kommunal', electionDate, tooEarly)).toBe(false);
  });

  it('returns false after removal deadline', () => {
    const tooLate = new Date(2025, 11, 1); // Dec 1
    expect(isWithinHangingPeriod('kommunal', electionDate, tooLate)).toBe(false);
  });

  it('returns true on earliest hanging date', () => {
    const period = calculateHangingPeriod('kommunal', electionDate);
    expect(isWithinHangingPeriod('kommunal', electionDate, period.earliestHanging)).toBe(true);
  });

  it('returns true on removal deadline', () => {
    const period = calculateHangingPeriod('kommunal', electionDate);
    expect(isWithinHangingPeriod('kommunal', electionDate, period.latestRemoval)).toBe(true);
  });
});

describe('isRemovalPeriod', () => {
  const electionDate = new Date(2025, 10, 18); // Nov 18

  it('returns false before election', () => {
    const before = new Date(2025, 10, 17);
    expect(isRemovalPeriod(electionDate, before)).toBe(false);
  });

  it('returns false on election day', () => {
    expect(isRemovalPeriod(electionDate, electionDate)).toBe(false);
  });

  it('returns true day after election', () => {
    const dayAfter = new Date(2025, 10, 19);
    expect(isRemovalPeriod(electionDate, dayAfter)).toBe(true);
  });

  it('returns true on removal deadline (8 days after)', () => {
    const deadline = new Date(2025, 10, 26);
    expect(isRemovalPeriod(electionDate, deadline)).toBe(true);
  });

  it('returns false after removal deadline', () => {
    const after = new Date(2025, 10, 27);
    expect(isRemovalPeriod(electionDate, after)).toBe(false);
  });
});

describe('daysUntilRemovalDeadline', () => {
  const electionDate = new Date(2025, 10, 18); // Nov 18

  it('returns correct days from election day', () => {
    const days = daysUntilRemovalDeadline(electionDate, electionDate);
    expect(days).toBe(8);
  });

  it('returns 0 on deadline day', () => {
    const deadline = new Date(2025, 10, 26);
    const days = daysUntilRemovalDeadline(electionDate, deadline);
    expect(days).toBe(0);
  });

  it('returns negative after deadline', () => {
    const after = new Date(2025, 10, 28);
    const days = daysUntilRemovalDeadline(electionDate, after);
    expect(days).toBeLessThan(0);
  });

  it('returns positive before deadline', () => {
    const before = new Date(2025, 10, 20);
    const days = daysUntilRemovalDeadline(electionDate, before);
    expect(days).toBeGreaterThan(0);
    expect(days).toBe(6);
  });
});
