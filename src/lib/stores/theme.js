import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'portfolio-theme';

function createThemeStore() {
	// Default to light
	const initial = browser ? (localStorage.getItem(STORAGE_KEY) || 'light') : 'light';

	const { subscribe, set, update } = writable(initial);

	return {
		subscribe,
		toggle() {
			update(current => {
				const next = current === 'dark' ? 'light' : 'dark';
				if (browser) {
					localStorage.setItem(STORAGE_KEY, next);
					document.documentElement.setAttribute('data-theme', next);
				}
				return next;
			});
		},
		init() {
			if (browser) {
				const stored = localStorage.getItem(STORAGE_KEY) || 'light';
				document.documentElement.setAttribute('data-theme', stored);
				set(stored);
			}
		}
	};
}

export const theme = createThemeStore();