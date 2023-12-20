export type Result<D extends unknown = undefined, E extends unknown = undefined> = {
	log: (prefix?: string) => void;
} & ({ ok: true; value: D } | { ok: false; value: E });
