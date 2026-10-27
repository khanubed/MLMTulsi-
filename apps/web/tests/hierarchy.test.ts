import { describe, test, expect } from 'vitest';
import { OFFICIAL_COMMISSION_SCHEDULE } from '../src/modules/commissions/commissions.service';
import { NetworkService } from '../src/modules/network/network.service';

/**
 * Basic tests verifying business rules defined in backend.md
 */
describe('MLM Business Rules Verification', () => {
  test('Ternary tree enforces max 3 direct children', () => {
    expect(NetworkService.MAX_DIRECT_CHILDREN).toBe(3);
  });

  test('Single account capped at maximum 100 network IDs', () => {
    expect(NetworkService.MAX_USER_NETWORK_IDS).toBe(100);
  });

  test('Hierarchy and earning depth capped at 10 relative levels', () => {
    expect(NetworkService.MAX_EARNING_DEPTH).toBe(10);
    expect(OFFICIAL_COMMISSION_SCHEDULE.length).toBe(10);
  });

  test('Commission amounts match official schedule', () => {
    expect(OFFICIAL_COMMISSION_SCHEDULE[0].amountRupees).toBe(500); // Level 1
    expect(OFFICIAL_COMMISSION_SCHEDULE[1].amountRupees).toBe(100); // Level 2
    expect(OFFICIAL_COMMISSION_SCHEDULE[2].amountRupees).toBe(75);  // Level 3
    expect(OFFICIAL_COMMISSION_SCHEDULE[3].amountRupees).toBe(50);  // Level 4
    expect(OFFICIAL_COMMISSION_SCHEDULE[4].amountRupees).toBe(25);  // Level 5
    expect(OFFICIAL_COMMISSION_SCHEDULE[5].amountRupees).toBe(15);  // Level 6
    expect(OFFICIAL_COMMISSION_SCHEDULE[6].amountRupees).toBe(10);  // Level 7
    expect(OFFICIAL_COMMISSION_SCHEDULE[7].amountRupees).toBe(5);   // Level 8
    expect(OFFICIAL_COMMISSION_SCHEDULE[8].amountRupees).toBe(3);   // Level 9
    expect(OFFICIAL_COMMISSION_SCHEDULE[9].amountRupees).toBe(1);   // Level 10
  });
});
