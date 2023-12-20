import type { Result } from '$lib/interfaces/result';

export const err = <V>(value: V): Extract<Result<never, V>, { ok: false }> => ({
	value,
	ok: false,
	log: (prefix?: string) => console.log((prefix ?? 'res') + ' err:', value)
});

export const suc = <V>(value: V): Extract<Result<V, never>, { ok: true }> => ({
	value,
	ok: true,
	log: (prefix?: string) => console.log((prefix ?? 'res') + ' suc:', value)
});
