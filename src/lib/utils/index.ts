export const map_object = <O extends Record<string, unknown>, V>(
	obj: O,
	cb: (entry: [string, O[string]]) => V
) => {
	const mapped = {} as Record<string, V>;

	for (const key in obj) {
		mapped[key] = cb([key, obj[key]]);
	}

	return mapped;
};

export const project_object = <O extends Record<string, unknown>>(
	obj: O,
	projection: { keep?: string[]; drop?: string[] }
) => {
	if (projection.keep && projection.drop) {
		throw new Error('project_object: Cannot keep and drop');
	} else if (!projection.keep && !projection.drop) {
		throw new Error('project_object: Must keep or drop');
	} else if (projection.keep) {
		const projected = {} as Record<string, unknown>;

		for (const key of projection.keep) {
			projected[key] = obj[key];
		}

		return projected as O;
	} else {
		const projected = { ...obj };

		for (const key of projection.drop!) {
			delete projected[key];
		}

		return projected as O;
	}
};
