import { writable } from 'svelte/store';

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
		update(state => {
			if (state.activeProject?.id === project.id) {
				if (typeof document !== 'undefined') {
					document.body.style.overflow = '';
				}
				return { activeProject: null, isOpen: false };
			} else {
				if (typeof document !== 'undefined') {
					document.body.style.overflow = 'hidden';
				}
				return { activeProject: project, isOpen: true };
			}
		});
	}

	return {
		subscribe,
		openProject,
		closeProject,
		toggleProject
	};
}

export const panel = createPanelStore();