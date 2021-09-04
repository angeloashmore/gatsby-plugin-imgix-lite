export const stripURLParameters = (url: string): string => {
	const instance = new URL(url);

	return `${instance.origin}${instance.pathname}`;
};
