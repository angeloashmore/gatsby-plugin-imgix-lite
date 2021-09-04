export const parseArParam = (ar: string): number => {
	const [antecedent, consequent] = ar.split(":");

	return Number.parseFloat(antecedent) / Number.parseFloat(consequent);
};
