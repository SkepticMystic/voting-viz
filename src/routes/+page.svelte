<script lang="ts">
	import { VOTING_SYSTEMS, Voting } from '$lib/classes/voting-systems';
	import { Format } from '$lib/utils/format';
	import { get_max_count, sum_by } from '$lib/utils/math/index';

	let elections: { outcome: Voting.Outcome; rating: Voting.Rating }[] = [];

	const make_random_input = () =>
		Voting.make_random_input({
			parties: { n: 5 },
			voters: { n: 10, preferences: { min: 1, max: 1000 } }
		});

	let input = make_random_input();
	console.log('input', input);

	const vote = () => {
		elections = VOTING_SYSTEMS.map((vs) => {
			const outcome = Voting.Systems[vs](input);
			outcome.log(vs + ' outcome');

			const rating = Voting.rate_outcome(input, outcome);
			rating.log(vs + ' rating');

			return { outcome, rating };
		});
	};
</script>

<button class="btn" on:click={() => (input = make_random_input())}> Randomise Input </button>

<button class="btn" on:click={vote}> Vote! </button>

<table class="table table-sm">
	<thead>
		<tr>
			<th></th>

			{#each input.parties as party}
				<th>
					Party <code>{party.id}</code>
				</th>
			{/each}
		</tr>
	</thead>

	<tbody>
		{#each input.voters as voter}
			{@const [max_party_id] = get_max_count(voter.preferences)}
			<tr>
				<td class="text-right font-semibold">
					Voter <code>{voter.id}</code>
				</td>

				{#each input.parties as party}
					<td class={max_party_id === party.id ? 'font-semibold text-green-600' : ''}>
						{Format.number(voter.preferences[party.id])}
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>

	<tfoot>
		<tr>
			<td class="text-right">Total</td>

			{#each input.parties as party}
				{@const total = sum_by(input.voters, (voter) => voter.preferences[party.id])}

				<td>{Format.number(total)}</td>
			{/each}
		</tr>
	</tfoot>
</table>
