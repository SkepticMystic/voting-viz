import type { Counts } from '$lib/interfaces';
import { map_object } from '..';

export const sum = (items: number[]) => items.reduce((total, curr) => total + curr, 0);
export const average = (items: number[]) => sum(items) / items.length;

export const sum_by = <T>(items: T[], cb: (item: T) => number) => sum(items.map(cb));

export const normalise_counts = (counts: Counts) => {
	const max = Math.max(...Object.values(counts));

	return map_object(counts, (entry) => entry[1] / max);
};

export const proportionalise_counts = (counts: Counts) => {
	const total = sum(Object.values(counts));

	return map_object(counts, (entry) => entry[1] / total);
};

type TieBreaker = <T>(a: T, b: T) => number;

export const sort_counts = (
	obj: Counts,
	order: -1 | 1,
	tie_breaker: TieBreaker = () => (Math.random() > 0.5 ? 1 : -1)
) => {
	const entries = Object.entries(obj);
	if (!entries.length) throw new Error('No entries');

	return entries.sort((a, b) =>
		a[1] > b[1] ? order : a[1] === b[1] ? tie_breaker(a, b) : -1 * order
	);
};

export const get_max_count = (obj: Counts, tie_breaker?: TieBreaker) =>
	sort_counts(obj, -1, tie_breaker).at(0)!;
export const get_min_count = (obj: Counts, tie_breaker?: TieBreaker) =>
	sort_counts(obj, -1, tie_breaker).at(-1)!;

const rand_float = (min: number, max: number) => Math.random() * max + min;

export const rand = {
	float: (min: number, max: number) => rand_float(min, max),
	int: (min: number, max: number) => Math.floor(rand_float(min, max))
};
