// src/lib/governance.ts

export interface SnapshotProposal {
  id: string
  title: string
  body: string
  choices: string[]
  start: number
  end: number
  state: string
  scores: number[]
  scores_total: number
}

export interface FormattedProposal {
  id: string
  title: string
  status: 'Active' | 'Closed'
  deadline: string
  forVotes: number
  againstVotes: number
  link: string
  impact: string
}

const formatDeadline = (endTimestamp: number, state: string) => {
  const now = Math.floor(Date.now() / 1000)
  if (state === 'active') {
    const diff = endTimestamp - now
    if (diff <= 0) return 'Ending soon'
    const days = Math.floor(diff / 86400)
    if (days > 0) return `Ends in ${days} ${days === 1 ? 'day' : 'days'}`
    const hours = Math.floor(diff / 3600)
    return `Ends in ${hours} ${hours === 1 ? 'hour' : 'hours'}`
  } else {
    const date = new Date(endTimestamp * 1000)
    return `Ended ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
  }
}

export const fetchSpaceProposals = async (space: string): Promise<FormattedProposal[]> => {
  const query = `
    query SpaceProposals($space: String!) {
      proposals(
        first: 5,
        where: { space: $space },
        orderBy: "created",
        orderDirection: desc
      ) {
        id
        title
        body
        choices
        start
        end
        state
        scores
        scores_total
      }
    }
  `

  try {
    const response = await fetch('https://hub.snapshot.org/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { space },
      }),
    })

    if (!response.ok) throw new Error('Snapshot API query failed')
    const { data } = await response.json()
    const rawProposals: SnapshotProposal[] = data?.proposals || []

    return rawProposals.map(proposal => {
      const total = proposal.scores_total || 0
      let forVotes = 0
      let againstVotes = 0

      if (total > 0 && proposal.scores && proposal.scores.length >= 2) {
        forVotes = Math.round((proposal.scores[0] || 0) / total * 100)
        againstVotes = Math.round((proposal.scores[1] || 0) / total * 100)
      } else if (proposal.state === 'active') {
        forVotes = 50
        againstVotes = 50
      }

      // Generate dynamic DeFi context based on title keywords
      let impact = 'Affects Mantle ecosystem participants'
      const titleLower = proposal.title.toLowerCase()
      if (titleLower.includes('meth') || titleLower.includes('staking')) {
        impact = 'Positive for mETH holders'
      } else if (titleLower.includes('treasury') || titleLower.includes('allocate') || titleLower.includes('mnt')) {
        impact = 'Mantle treasury allocation changes'
      } else if (titleLower.includes('fluxion') || titleLower.includes('derivatives')) {
        impact = 'Benefits derivatives positions'
      } else if (titleLower.includes('usdy') || titleLower.includes('rwa')) {
        impact = 'Positive for RWA positions'
      }

      return {
        id: proposal.id.slice(0, 8).toUpperCase(), // Short identifier like a commit hash
        title: proposal.title,
        status: proposal.state === 'active' ? 'Active' : 'Closed',
        deadline: formatDeadline(proposal.end, proposal.state),
        forVotes,
        againstVotes,
        link: `https://snapshot.org/#/${space}/proposal/${proposal.id}`,
        impact,
      }
    })
  } catch (error) {
    console.error('Failed to fetch Snapshot proposals:', error)
    return []
  }
}
