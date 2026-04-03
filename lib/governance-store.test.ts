import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals'
import {
  createGovernanceVote,
  createGovernanceCast,
  getGovernanceVoteById,
  listGovernanceVotes,
  listGovernanceCasts,
  updateGovernanceVote,
  softDeleteGovernanceVote,
  resetGovernanceStore,
  type Vote,
  type VoteCast,
} from '@/lib/governance-store'

// ---------------------------------------------------------------------------
// localStorage + window mock (node env has no window/localStorage;
// governance-store guards persistence with `typeof window !== "undefined"`)
// ---------------------------------------------------------------------------
const storageMap = new Map<string, string>()

const fakeStorage = {
  getItem: (key: string) => storageMap.get(key) ?? null,
  setItem: (key: string, val: string) => storageMap.set(key, val),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
}

// In node env, `window` is undefined — expose it so the store's guard passes.
// In jsdom env, `window` already exists — just override localStorage.
if (typeof window === 'undefined') {
  Object.defineProperty(globalThis, 'window', { value: globalThis, writable: true })
}
Object.defineProperty(globalThis, 'localStorage', { value: fakeStorage, writable: true })

// ---------------------------------------------------------------------------
// Deterministic UUID
// ---------------------------------------------------------------------------
const uuidCounter = { current: 0 }
const originalRandomUUID = crypto.randomUUID

beforeEach(() => {
  uuidCounter.current = 0
  crypto.randomUUID = (() => {
    uuidCounter.current += 1
    return `uuid-${uuidCounter.current}`
  }) as typeof crypto.randomUUID

  resetGovernanceStore()
  storageMap.clear()
})

afterEach(() => {
  crypto.randomUUID = originalRandomUUID
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeVote(overrides: Partial<Vote> = {}): Vote {
  return {
    id: `vote-${Date.now()}`,
    type: 'E-VOTE',
    title: 'Budget vote',
    description: 'Approve the budget',
    status: 'ACTIVE',
    deadline: new Date(Date.now() + 86_400_000).toISOString(),
    quorum: 50,
    participation: 0,
    options: [
      { id: 'opt-a', label: 'Yes', count: 0 },
      { id: 'opt-b', label: 'No', count: 0 },
    ],
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

// =====================================================================
// createGovernanceVote
// =====================================================================

describe('createGovernanceVote', () => {
  it('adds a vote to the store and returns it', () => {
    const vote = makeVote({ id: 'v-1' })
    const result = createGovernanceVote(vote)

    expect(result).toEqual(vote)
    expect(listGovernanceVotes()).toHaveLength(1)
    expect(listGovernanceVotes()[0].id).toBe('v-1')
  })

  it('persists state to localStorage', () => {
    createGovernanceVote(makeVote({ id: 'v-persist' }))

    const stored = storageMap.get('buildsync_governance_store')
    expect(stored).toBeDefined()
    const parsed = JSON.parse(stored!)
    expect(parsed.votes).toHaveLength(1)
    expect(parsed.votes[0].id).toBe('v-persist')
  })
})

// =====================================================================
// listGovernanceVotes
// =====================================================================

describe('listGovernanceVotes', () => {
  it('returns empty array when store is empty', () => {
    expect(listGovernanceVotes()).toEqual([])
  })

  it('excludes soft-deleted votes', () => {
    createGovernanceVote(makeVote({ id: 'v-alive' }))
    createGovernanceVote(makeVote({ id: 'v-dead', deletedAt: new Date().toISOString() }))

    const votes = listGovernanceVotes()
    expect(votes).toHaveLength(1)
    expect(votes[0].id).toBe('v-alive')
  })

  it('returns clones (mutations do not affect store)', () => {
    createGovernanceVote(makeVote({ id: 'v-clone' }))
    const votes = listGovernanceVotes()
    votes[0].title = 'MUTATED'

    expect(listGovernanceVotes()[0].title).toBe('Budget vote')
  })
})

// =====================================================================
// getGovernanceVoteById
// =====================================================================

describe('getGovernanceVoteById', () => {
  it('returns the vote when it exists', () => {
    createGovernanceVote(makeVote({ id: 'v-find' }))
    const vote = getGovernanceVoteById('v-find')
    expect(vote).not.toBeNull()
    expect(vote!.id).toBe('v-find')
  })

  it('returns null for unknown id', () => {
    expect(getGovernanceVoteById('nonexistent')).toBeNull()
  })

  it('returns null for soft-deleted vote', () => {
    createGovernanceVote(makeVote({ id: 'v-del', deletedAt: '2024-01-01T00:00:00Z' }))
    expect(getGovernanceVoteById('v-del')).toBeNull()
  })

  it('returns a clone (mutation-safe)', () => {
    createGovernanceVote(makeVote({ id: 'v-safe' }))
    const clone = getGovernanceVoteById('v-safe')!
    clone.title = 'MUTATED'

    expect(getGovernanceVoteById('v-safe')!.title).toBe('Budget vote')
  })
})

// =====================================================================
// updateGovernanceVote
// =====================================================================

describe('updateGovernanceVote', () => {
  it('merges partial updates into existing vote', () => {
    createGovernanceVote(makeVote({ id: 'v-upd' }))
    const updated = updateGovernanceVote('v-upd', { title: 'New title', quorum: 75 })

    expect(updated).not.toBeNull()
    expect(updated!.title).toBe('New title')
    expect(updated!.quorum).toBe(75)
    // Untouched fields remain
    expect(updated!.description).toBe('Approve the budget')
  })

  it('returns null for nonexistent vote', () => {
    expect(updateGovernanceVote('nope', { title: 'x' })).toBeNull()
  })

  it('returns null for soft-deleted vote', () => {
    createGovernanceVote(makeVote({ id: 'v-del2', deletedAt: '2024-01-01T00:00:00Z' }))
    expect(updateGovernanceVote('v-del2', { title: 'x' })).toBeNull()
  })

  it('persists updated state to localStorage', () => {
    createGovernanceVote(makeVote({ id: 'v-lsu' }))
    updateGovernanceVote('v-lsu', { title: 'Updated' })

    const parsed = JSON.parse(storageMap.get('buildsync_governance_store')!)
    expect(parsed.votes[0].title).toBe('Updated')
  })
})

// =====================================================================
// softDeleteGovernanceVote
// =====================================================================

describe('softDeleteGovernanceVote', () => {
  it('marks vote as deleted and returns true', () => {
    createGovernanceVote(makeVote({ id: 'v-sd' }))
    expect(softDeleteGovernanceVote('v-sd')).toBe(true)
    expect(getGovernanceVoteById('v-sd')).toBeNull()
  })

  it('returns false for nonexistent vote', () => {
    expect(softDeleteGovernanceVote('nope')).toBe(false)
  })

  it('returns false for already-deleted vote', () => {
    createGovernanceVote(makeVote({ id: 'v-dd', deletedAt: '2024-01-01T00:00:00Z' }))
    expect(softDeleteGovernanceVote('v-dd')).toBe(false)
  })

  it('persists deletion to localStorage', () => {
    createGovernanceVote(makeVote({ id: 'v-sdl' }))
    softDeleteGovernanceVote('v-sdl')

    const parsed = JSON.parse(storageMap.get('buildsync_governance_store')!)
    expect(parsed.votes[0].deletedAt).toBeTruthy()
  })
})

// =====================================================================
// createGovernanceCast
// =====================================================================

describe('createGovernanceCast', () => {
  it('records a cast and increments option count', () => {
    createGovernanceVote(makeVote({ id: 'v-cast' }))

    const cast: VoteCast = {
      id: 'c-1',
      voteId: 'v-cast',
      optionId: 'opt-a',
      voterId: 'user-1',
      castedAt: new Date().toISOString(),
    }

    const result = createGovernanceCast(cast)
    expect(result.conflict).toBe(false)
    expect(result.cast).toEqual(cast)

    // Option count incremented
    const vote = getGovernanceVoteById('v-cast')!
    expect(vote.options![0].count).toBe(1)
  })

  it('prevents double voting by the same voter on the same vote', () => {
    createGovernanceVote(makeVote({ id: 'v-dup' }))

    const cast1: VoteCast = {
      id: 'c-1', voteId: 'v-dup', optionId: 'opt-a', voterId: 'user-1', castedAt: '',
    }
    const cast2: VoteCast = {
      id: 'c-2', voteId: 'v-dup', optionId: 'opt-b', voterId: 'user-1', castedAt: '',
    }

    createGovernanceCast(cast1)
    const result = createGovernanceCast(cast2)

    expect(result.conflict).toBe(true)
    expect(result.cast).toBeNull()
  })

  it('allows different voters on the same vote', () => {
    createGovernanceVote(makeVote({ id: 'v-multi' }))

    createGovernanceCast({
      id: 'c-1', voteId: 'v-multi', optionId: 'opt-a', voterId: 'user-1', castedAt: '',
    })
    const result = createGovernanceCast({
      id: 'c-2', voteId: 'v-multi', optionId: 'opt-b', voterId: 'user-2', castedAt: '',
    })

    expect(result.conflict).toBe(false)
    expect(listGovernanceCasts()).toHaveLength(2)
  })

  it('updates participation percentage', () => {
    createGovernanceVote(makeVote({ id: 'v-part' }))
    createGovernanceCast({
      id: 'c-1', voteId: 'v-part', optionId: 'opt-a', voterId: 'u-1', castedAt: '',
    })

    const vote = getGovernanceVoteById('v-part')!
    // 1 cast / 100 eligible = 1%
    expect(vote.participation).toBe(1)
  })
})

// =====================================================================
// resetGovernanceStore
// =====================================================================

describe('resetGovernanceStore', () => {
  it('clears all votes and casts', () => {
    createGovernanceVote(makeVote({ id: 'v-r' }))
    createGovernanceCast({
      id: 'c-r', voteId: 'v-r', optionId: 'opt-a', voterId: 'u1', castedAt: '',
    })

    resetGovernanceStore()

    expect(listGovernanceVotes()).toEqual([])
    expect(listGovernanceCasts()).toEqual([])
  })
})
