<script>
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme.js';

	let scrollProgress = 0;

	onMount(() => {
		function updateProgress() {
			const scrollTop = window.scrollY;
			const docHeight = document.documentElement.scrollHeight - window.innerHeight;
			scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
		}

		window.addEventListener('scroll', updateProgress, { passive: true });
		updateProgress();

		return () => window.removeEventListener('scroll', updateProgress);
	});

	const navLinks = [
		{ label: 'About', href: '#about' },
		{ label: 'Projects', href: '#projects' },
		{ label: 'Skills', href: '#skills' },
		{ label: 'Certifications', href: '#certifications' },
		{ label: 'Publications', href: '#publications' }
	];
</script>

<nav>
	<!-- Scroll progress bar -->
	<div class="progress-bar" style="width: {scrollProgress}%"></div>

	<div class="nav-inner container">
		<!-- Logo -->
		<a href="#top" class="logo" aria-label="Home">
			Ahmad<span style="color: var(--accent)">.</span>
		</a>

		<!-- Nav links -->
		<ul class="nav-links" role="list">
			{#each navLinks as link}
				<li>
					<a href={link.href}>{link.label}</a>
				</li>
			{/each}
		</ul>

		<!-- Theme toggle -->
		<button
			class="theme-toggle"
			on:click={() => theme.toggle()}
			aria-label="Toggle theme"
		>
			{#if $theme === 'dark'}
				<span aria-hidden="true">☀</span>
			{:else}
				<span aria-hidden="true">☾</span>
			{/if}
		</button>
	</div>
</nav>

<style>
	nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		height: 60px;
		background: rgba(var(--bg-rgb, 10, 10, 15), 0.7);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-bottom: 1px solid var(--border);
		transition: background var(--transition-med);
	}

	/* Progress bar sits at the very top of the nav */
	.progress-bar {
		position: absolute;
		top: 0;
		left: 0;
		height: 2px;
		background: var(--accent);
		transition: width 0.05s linear;
		pointer-events: none;
	}

	.nav-inner {
		display: flex;
		align-items: center;
		height: 100%;
		gap: 2rem;
	}

	/* Logo */
	.logo {
		font-family: var(--font-head);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text);
		text-decoration: none;
		letter-spacing: -0.02em;
		flex-shrink: 0;
	}

	.logo:hover {
		color: var(--text);
	}

	/* Nav links */
	.nav-links {
		display: flex;
		list-style: none;
		gap: 0.25rem;
		margin-left: auto;
		align-items: center;
	}

	.nav-links a {
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-muted);
		text-decoration: none;
		padding: 0.375rem 0.75rem;
		border-radius: var(--radius-sm);
		transition:
			color var(--transition-fast),
			background var(--transition-fast);
	}

	.nav-links a:hover {
		color: var(--text);
		background: var(--bg-surface);
	}

	/* Theme toggle */
	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--text-muted);
		font-size: 1rem;
		cursor: pointer;
		flex-shrink: 0;
		transition:
			color var(--transition-fast),
			border-color var(--transition-fast),
			background var(--transition-fast);
	}

	.theme-toggle:hover {
		color: var(--accent);
		border-color: var(--accent);
		background: var(--accent-dim);
	}

	.theme-toggle span {
		display: block;
		line-height: 1;
	}
</style>
