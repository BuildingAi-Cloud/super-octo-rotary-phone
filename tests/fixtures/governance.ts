// Governance test fixtures
import type { Vote, VoteCast, VoteOption, MeetingAgendaItem } from '@/lib/governance-store'

export const sampleVoteOption: VoteOption = {
  id: 'opt-1',
  label: 'Yes',
  count: 0,
}

export const sampleAgendaItem: MeetingAgendaItem = {
  id: 'agenda-1',
  order: 1,
  item: 'Discuss budget allocation',
}

export const sampleEVote: Vote = {
  id: 'vote-1',
  type: 'E-VOTE',
  title: 'Approve annual budget',
  description: 'Vote on the proposed annual budget for 2026.',
  status: 'ACTIVE',
  deadline: new Date(Date.now() + 86400000).toISOString(),
  quorum: 50,
  participation: 0,
  options: [
    { id: 'opt-1', label: 'Yes', count: 0 },
    { id: 'opt-2', label: 'No', count: 0 },
  ],
  createdBy: 'user-admin',
  createdAt: new Date().toISOString(),
}

export const sampleMeetingVote: Vote = {
  id: 'vote-2',
  type: 'MEETING',
  title: 'Q1 Board Meeting',
  description: 'Quarterly board meeting with agenda items.',
  status: 'SCHEDULED',
  deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
  quorum: 30,
  participation: 0,
  agenda: [sampleAgendaItem],
  createdBy: 'user-admin',
  createdAt: new Date().toISOString(),
}

export const sampleVoteCast: VoteCast = {
  id: 'cast-1',
  voteId: 'vote-1',
  optionId: 'opt-1',
  voterId: 'resident-1',
  castedAt: new Date().toISOString(),
}
