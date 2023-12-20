const numberFormatterOptions: Intl.NumberFormatOptions = {
	style: 'decimal',
	maximumFractionDigits: 2,
	minimumFractionDigits: 0
};
const numberFormatter = new Intl.NumberFormat('en', numberFormatterOptions);

// const randFormatterOptions: Intl.NumberFormatOptions = {
//   style: "currency",
//   currency: "ZAR",
//   currencyDisplay: "narrowSymbol",
//   maximumFractionDigits: 2,
//   minimumFractionDigits: 0,
// };
// const randFormatter = new Intl.NumberFormat("en", randFormatterOptions);

const percentFormatterOptions: Intl.NumberFormatOptions = {
	style: 'percent',
	maximumFractionDigits: 2,
	minimumFractionDigits: 0
};
const percentFormatter = new Intl.NumberFormat('en', percentFormatterOptions);

export const Format = {
	number: (amount: number | undefined, opts?: Intl.NumberFormatOptions) => {
		if (amount === undefined || isNaN(amount)) return '-';

		return opts
			? new Intl.NumberFormat('en', {
					...numberFormatterOptions,
					...opts
				}).format(amount)
			: numberFormatter.format(amount);
	},

	//   rands: (amount: number | undefined, opts?: Intl.NumberFormatOptions) => {
	//     if (amount === undefined || isNaN(amount)) return "-";

	//     return opts
	//       ? new Intl.NumberFormat("en", {
	//         ...randFormatterOptions,
	//         ...opts,
	//       }).format(amount)
	//       : randFormatter.format(amount);
	//   },

	//   currency: (
	//     amount: number | undefined,
	//     currency: Intl.NumberFormatOptions["currency"],
	//     opts?: Intl.NumberFormatOptions
	//   ) => {
	//     if (amount === undefined || isNaN(amount)) return "-";

	//     return new Intl.NumberFormat("en", {
	//       ...randFormatterOptions,
	//       currency,
	//       ...opts,
	//     }).format(amount);
	//   },

	percent: (amount: number, opts?: Intl.NumberFormatOptions) => {
		if (amount === undefined || isNaN(amount)) return '-';

		return opts
			? new Intl.NumberFormat('en', {
					...percentFormatterOptions,
					...opts
				}).format(amount)
			: percentFormatter.format(amount);
	}
	//   custom: (
	//     amount: string | number | null | undefined,
	//     options: Intl.NumberFormatOptions,
	//   ) => {
	//     const { format } = new Intl.NumberFormat("en", options);

	//     switch (typeof amount) {
	//       case "string":
	//         return amount;
	//       case "object":
	//         return null;
	//       case "undefined":
	//         return null;
	//       default:
	//         return format(amount);
	//     }
	//   },
};
