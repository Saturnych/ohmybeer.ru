import { navigate } from 'astro:transitions/client';

export const isBrowser: boolean = import.meta.env.SSR === false;

export const goto = (uri: string, replaceState: boolean = false): void => {
	if (isBrowser && replaceState) {
		window.history.replaceState({}, '', uri);
	} else {
		navigate(uri);
	}
};
