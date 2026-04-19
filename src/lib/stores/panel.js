import { writable, get } from 'svelte/store';

function createPanelStore() {
	const { subscribe, set, update } = writable({
		activeProject: null,
		isOpen: false
	});

	function openProject(project) {
		set({ activeProject: project, isOpen: true });
		if (typeof document !== 'undefined') {
			document.body.style.overflow = 'hidden';
		}
	}

	function closeProject() {
		set({ activeProject: null, isOpen: false });
		if (typeof document !== 'undefined') {
			document.body.style.overflow = '';
		}
	}

	function toggleProject(project) {
		const state = get({ subscribe });
		if (state.activeProject?.id === project.id) {
			closeProject();
		} else {
			openProject(project);
		}
	}

	return {
		subscribe,
		openProject,
		closeProject,
		toggleProject
	};
}

export const panel = createPanelStore();