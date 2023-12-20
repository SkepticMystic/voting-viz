import type { Counts } from '$lib/interfaces';
import type { Result } from '$lib/interfaces/result';
import { project_object } from '$lib/utils';
import {
	average,
	get_max_count,
	get_min_count,
	normalise_counts,
	proportionalise_counts,
	rand,
	sort_counts
} from '$lib/utils/math/index';
import { err, suc } from '$lib/utils/result';

export namespace Voting {
	export type Party = {
		id: string;
	};

	/** Represents a _group_ of voters */
	type Voter = {
		id: string;
		/** The voter's preference for each party */
		preferences: Counts;
	};

	export type Input = {
		voters: Voter[];
		parties: Party[];
	};

	/** The number of votes for each party. Can be thought of as the aggregation/resolution of multiple voting groups' preferences */
	export type Vote = Counts;

	export type Outcome = Result<{ votes: [Vote, ...(Vote | null)[]]; winner: Party }, string>;

	export type Rating = Result<{ voter_choice: Counts; avg_choice: number }, string>;
}

const make_random_input = ({
	parties,
	voters
}: {
	parties: { n: number };
	voters: { n: number; preferences: { min: number; max: number } };
}): Voting.Input => ({
	parties: Array(parties.n)
		.fill(null)
		.map((p, i) => ({ id: i.toString() })),

	voters: Array(voters.n)
		.fill(null)
		.map((_, i) => ({
			id: i.toString(),
			preferences: Array(parties.n)
				.fill(null)
				.reduce((p, _, i) => {
					p[i.toString()] = rand.int(voters.preferences.min, voters.preferences.max);
					return p;
				}, {})
		}))
});

const validate_input = (input: Voting.Input): Result<undefined, string> => {
	if (input.parties.length < 2) {
		return err('validateinput: Voting requires at least 2 parties');
	}

	return suc(undefined);
};

const resolve_vote = {
	first_preference: (input: Voting.Input) => {
		const party_ids = input.parties.map((p) => p.id);

		// TODO: Ties
		// You vote once, for your favourite party. All secondary preferences are ignored.
		return input.voters.reduce((vote, voter) => {
			const [party_id, vote_count] = get_max_count(
				project_object(voter.preferences, { keep: party_ids }),
				() => (Math.random() > 0.5 ? 1 : -1)
			);

			// Here is where absolute vote_counts come in. One voting group may be larger than another
			vote[party_id] = (vote[party_id] ?? 0) + vote_count;

			return vote;
			// TODO: This approach doesn't guarentee a key for each party, on the ones that were voted for
		}, {} as Voting.Vote);
	},

	all_preferences: (input: Voting.Input) =>
		input.parties.reduce((vote, party) => {
			input.voters.forEach((voter) => {
				vote[party.id] = (vote[party.id] ?? 0) + voter.preferences[party.id];
			});

			return vote;
		}, {} as Voting.Vote)
};

const first_past_the_post = (input: Voting.Input): Voting.Outcome => {
	const valid = validate_input(input);
	if (!valid.ok) return valid;

	const vote = resolve_vote.first_preference(input);
	console.log('first_past_the_post vote:', vote);

	// TODO: Whatabout ties?
	const [winner_party_id] = get_max_count(vote);
	const winner = input.parties.find((party) => party.id === winner_party_id)!;

	return suc({ votes: [vote], winner });
};

const two_round = (input: Voting.Input): Voting.Outcome => {
	const valid = validate_input(input);
	if (!valid.ok) return valid;

	// First pref
	const vote_1 = resolve_vote.first_preference(input);
	console.log('two_round vote_1:', vote_1);

	let vote_2: Voting.Vote | null = null;
	let winner: Voting.Party | null = null;

	const [max_party_id, vote_proportion] = get_max_count(proportionalise_counts(vote_1));
	if (vote_proportion > 0.5) {
		console.log('two_round winner in one round:', max_party_id);
		winner = input.parties.find((party) => party.id === max_party_id)!;
	} else {
		const top_2_parties = sort_counts(vote_1, -1)
			.slice(0, 2)
			.map(([party_id]) => input.parties.find((p) => p.id === party_id)!);

		vote_2 = resolve_vote.first_preference({ ...input, parties: top_2_parties });

		const [max_party_id] = get_max_count(vote_2);
		console.log('two_round winner in two rounds:', max_party_id);
		winner = input.parties.find((party) => party.id === max_party_id)!;
	}

	return winner ? suc({ votes: [vote_1, vote_2], winner }) : err('draw');
};

const instant_runoff = (input: Voting.Input): Voting.Outcome => {
	const valid = validate_input(input);
	if (!valid.ok) return valid;

	const vote = resolve_vote.all_preferences(input);
	console.log('instant_runoff vote:', vote);

	let mut_vote = { ...vote };
	let winner: Voting.Party | null = null;

	while (Object.keys(mut_vote).length > 1) {
		const proportional_vote = proportionalise_counts(mut_vote);
		console.log('instant_runoff proportional_vote:', proportional_vote);
		// NOTE: No need to do ties. By definition, if there is a tie, no party has > 0.5 majority
		const [max_party_id, vote_proportion] = get_max_count(proportional_vote);

		if (vote_proportion > 0.5) {
			console.log('instant_runoff winner:', max_party_id);
			winner = input.parties.find((party) => party.id === max_party_id)!;
			break;
		} else {
			// TODO: Ties
			const [min_party_id] = get_min_count(mut_vote);
			console.log('instant_runoff no winner yet, removing:', min_party_id);
			delete mut_vote[min_party_id];
		}
	}

	return winner ? suc({ votes: [vote], winner }) : err('draw');
};

const rate_outcome = (input: Voting.Input, outcome: Voting.Outcome): Voting.Rating => {
	if (!outcome.ok) return outcome;

	// Represents how satisfied each voter is with the winner
	const voter_choice = input.voters.reduce((voter_choice, voter) => {
		const normalised_preferences = normalise_counts(voter.preferences);
		// How much do they prefer the party that won
		voter_choice[voter.id] = normalised_preferences[outcome.value.winner.id];
		return voter_choice;
	}, {} as Counts);

	const avg_choice = average(Object.values(voter_choice));

	return suc({ voter_choice, avg_choice });
};

export const Voting = {
	make_random_input,

	Systems: {
		first_past_the_post,
		instant_runoff,
		two_round
	},

	rate_outcome
};

export const VOTING_SYSTEMS = [
	'first_past_the_post',
	'two_round',
	'instant_runoff'
] satisfies (keyof typeof Voting.Systems)[];
if (VOTING_SYSTEMS.length !== Object.keys(Voting.Systems).length) {
	throw new Error('Missing VOTING_SYSTEMS');
}
