import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals'
import {
  canCreateVote,
  canManageVote,
  canCastVote,
  canViewMeetings,
  isVoteExpired,
  canViewResults,
  parseVoteOptions,
  parseMeetingAgenda,
  computeVoteResults,
  isNonBinding,
} from '@/lib/governance'
import type { Vote, VoteCast } from '@/lib/governance-store'

// ---------------------------------------------------------------------------
// Mock crypto.randomUUID for deterministic option/agenda IDs
// ---------------------------------------------------------------------------
const uuidCounter = { current: 0 }
const originalRandomUUID = crypto.randomUUID

beforeEach(() => {
  uuidCounter.current = 0
  crypto.randomUUID = (() => {
    uuidCounter.current += 1
    return `mock-uuid-${uuidCounter.current}`
  }) as typeof crypto.randomUUID
})

afterEach(() => {
  crypto.randomUUID = originalRandomUUID
})

// ---------------------------------------------------------------------------
// Helpers — reusable vote factory
// ---------------------------------------------------------------------------
function makeVote(overrides: Partial<Vote> = {}): Vote {
  return {
    id: 'v-1',
    type: 'E-VOTE',
    title: 'Budget vote',
    description: 'Approve the budget',
    status: 'ACTIVE',
    deadline: new Date(Date.now() + 86_400_000).toISOString(),
    quorum: 50,
    participation: 60,
    options: [
      { id: 'o-1', label: 'Yes', count: 3 },
      { id: 'o-2', label: 'No', count: 1 },
    ],
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

// =====================================================================
// ROLE CHECKS
// =====================================================================

describe('canCreateVote', () => {
  it.each([
    ['building_owner', true],
    ['property_manager', true],
    ['admin', true],
    ['resident', false],
    ['tenant', false],
    ['guest', false],
    ['concierge', false],
    [null, false],
    [undefined, false],
    ['', false],
  ])('role=%s → %s', (role, expected) => {
    expect(canCreateVote(role)).toBe(expected)
  })
})

describe('canManageVote', () => {
  it.each([
    ['building_owner', true],
    ['admin', true],
    ['property_manager', false],
    ['resident', false],
    [null, false],
    [undefined, false],
  ])('role=%s → %s', (role, expected) => {
    expect(canManageVote(role)).toBe(expected)
  })
})

describe('canCastVote', () => {
  it.each([
    ['resident', true],
    ['tenant', true],
    ['building_owner', true],
    ['board_member', true],
    ['admin', false],
    ['guest', false],
    ['concierge', false],
    [null, false],
    [undefined, false],
  ])('role=%s → %s', (role, expected) => {
    expect(canCastVote(role)).toBe(expected)
  })
})

describe('canViewMeetings', () => {
  it('allows all standard roles', () => {
    const allowed = [
      'facility_manager', 'building_owner', 'property_manager',
      'resident', 'tenant', 'concierge', 'staff', 'security',
      'vendor', 'admin', 'guest',
    ]
    for (const role of allowed) {
      expect(canViewMeetings(role)).toBe(true)
    }
  })

  it('rejects null/undefined/empty', () => {
    expect(canViewMeetings(null)).toBe(false)
    expect(canViewMeetings(undefined)).toBe(false)
    expect(canViewMeetings('')).toBe(false)
  })
})

// =====================================================================
// isVoteExpired
// =====================================================================

describe('isVoteExpired', () => {
  it('returns true when deadline is in the past', () => {
    const past = new Date(Date.now() - 1000).toISOString()
    expect(isVoteExpired(past)).toBe(true)
  })

  it('returns false when deadline is in the future', () => {
    const future = new Date(Date.now() + 86_400_000).toISOString()
    expect(isVoteExpired(future)).toBe(false)
  })

  it('returns true when deadline is exactly now', () => {
    // Date.now() <= Date.now() is true
    const now = new Date(Date.now()).toISOString()
    expect(isVoteExpired(now)).toBe(true)
  })
})

// =====================================================================
// canViewResults
// =====================================================================

describe('canViewResults', () => {
  it('returns true only when status is COMPLETED', () => {
    expect(canViewResults(makeVote({ status: 'COMPLETED' }))).toBe(true)
  })

  it('returns false for ACTIVE', () => {
    expect(canViewResults(makeVote({ status: 'ACTIVE' }))).toBe(false)
  })

  it('returns false for SCHEDULED', () => {
    expect(canViewResults(makeVote({ status: 'SCHEDULED' }))).toBe(false)
  })
})

// =====================================================================
// parseVoteOptions
// =====================================================================

describe('parseVoteOptions', () => {
  it('parses comma-separated labels into VoteOption[]', () => {
    const result = parseVoteOptions('Yes, No, Abstain')
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ id: 'mock-uuid-1', label: 'Yes', count: 0 })
    expect(result[1]).toEqual({ id: 'mock-uuid-2', label: 'No', count: 0 })
    expect(result[2]).toEqual({ id: 'mock-uuid-3', label: 'Abstain', count: 0 })
  })

  it('trims whitespace from labels', () => {
    const result = parseVoteOptions('  Approve ,  Reject  ')
    expect(result.map(o => o.label)).toEqual(['Approve', 'Reject'])
  })

  it('filters out blank entries', () => {
    const result = parseVoteOptions('A,,B,,,C')
    expect(result).toHaveLength(3)
  })

  it('returns empty array for null/undefined/empty', () => {
    expect(parseVoteOptions(null)).toEqual([])
    expect(parseVoteOptions(undefined)).toEqual([])
    expect(parseVoteOptions('')).toEqual([])
  })
})

// =====================================================================
// parseMeetingAgenda
// =====================================================================

describe('parseMeetingAgenda', () => {
  it('splits newline-separated items', () => {
    const result = parseMeetingAgenda('Item A\nItem B\nItem C')
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ id: 'mock-uuid-1', order: 1, item: 'Item A' })
    expect(result[2]).toEqual({ id: 'mock-uuid-3', order: 3, item: 'Item C' })
  })

  it('trims whitespace and skips blanks', () => {
    const result = parseMeetingAgenda('  First  \n\n  Second  \n')
    expect(result).toHaveLength(2)
    expect(result[0].item).toBe('First')
    expect(result[1].item).toBe('Second')
  })

  it('returns empty array for null/undefined/empty', () => {
    expect(parseMeetingAgenda(null)).toEqual([])
    expect(parseMeetingAgenda(undefined)).toEqual([])
    expect(parseMeetingAgenda('')).toEqual([])
  })
})

// =====================================================================
// computeVoteResults
// =====================================================================

describe('computeVoteResults', () => {
  it('computes percentages from cast counts', () => {
    const vote = makeVote({
      options: [
        { id: 'o-1', label: 'Yes', count: 0 },
        { id: 'o-2', label: 'No', count: 0 },
      ],
    })
    const casts: VoteCast[] = [
      { id: 'c-1', voteId: 'v-1', optionId: 'o-1', voterId: 'u-1', castedAt: '' },
      { id: 'c-2', voteId: 'v-1', optionId: 'o-1', voterId: 'u-2', castedAt: '' },
      { id: 'c-3', voteId: 'v-1', optionId: 'o-2', voterId: 'u-3', castedAt: '' },
    ]

    const results = computeVoteResults(vote, casts)
    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({ optionId: 'o-1', label: 'Yes', count: 2, percentage: 66.67 })
    expect(results[1]).toEqual({ optionId: 'o-2', label: 'No', count: 1, percentage: 33.33 })
  })

  it('falls back to option.count when no casts exist', () => {
    const vote = makeVote({
      options: [
        { id: 'o-1', label: 'Yes', count: 7 },
        { id: 'o-2', label: 'No', count: 3 },
      ],
    })

    const results = computeVoteResults(vote, [])
    expect(results[0].count).toBe(7)
    expect(results[0].percentage).toBe(70)
    expect(results[1].count).toBe(3)
    expect(results[1].percentage).toBe(30)
  })

  it('returns 0% when total is zero', () => {
    const vote = makeVote({
      options: [
        { id: 'o-1', label: 'Yes', count: 0 },
        { id: 'o-2', label: 'No', count: 0 },
      ],
    })

    const results = computeVoteResults(vote, [])
    expect(results.every(r => r.percentage === 0)).toBe(true)
  })

  it('returns empty array when vote has no options', () => {
    const vote = makeVote({ options: undefined })
    expect(computeVoteResults(vote, [])).toEqual([])
  })
})

// =====================================================================
// isNonBinding
// =====================================================================

describe('isNonBinding', () => {
  it('returns true when participation < quorum', () => {
    expect(isNonBinding(makeVote({ participation: 10, quorum: 50 }))).toBe(true)
  })

  it('returns false when participation >= quorum', () => {
    expect(isNonBinding(makeVote({ participation: 50, quorum: 50 }))).toBe(false)
    expect(isNonBinding(makeVote({ participation: 80, quorum: 50 }))).toBe(false)
  })
})
