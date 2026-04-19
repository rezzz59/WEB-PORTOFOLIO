<script>
	import '../app.css';
	import { theme } from '$lib/stores/theme.js';
	import { panel } from '$lib/stores/panel.js';
	import { onMount } from 'svelte';
	import { projects } from '$lib/data/projects.js';
	import { categories, skillNodes, skillEdges, proficiency } from '$lib/data/skills.js';
	import { certs } from '$lib/data/certs.js';
	import { pubs } from '$lib/data/pubs.js';

	onMount(() => {
		theme.init();

		// Scroll-reveal via IntersectionObserver
		const els = document.querySelectorAll('.reveal, .reveal-stagger');
		const io = new IntersectionObserver((entries) => {
			entries.forEach(e => {
				if (e.isIntersecting) {
					e.target.classList.add('revealed');
					io.unobserve(e.target);
				}
			});
		}, { threshold: 0.1 });
		els.forEach(el => io.observe(el));

		// Stat counter animation
		const statNums = document.querySelectorAll('.stat-num[data-target]');
		statNums.forEach(el => {
			const target = parseInt(el.dataset.target);
			let current = 0;
			const step = target / 40;
			const interval = setInterval(() => {
				current += step;
				if (current >= target) {
					current = target;
					clearInterval(interval);
				}
				el.textContent = Math.floor(current);
			}, 30);
		});

		return () => io.disconnect();
	});

	// ─── Svelte action for Canvas charts ───
	function drawChart(node, project) {
		const { chartType, chartData } = project;
		const canvas = document.createElement('canvas');
		canvas.width = 280;
		canvas.height = 120;
		node.appendChild(canvas);
		const ctx = canvas.getContext('2d');

		const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
		const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
		const palette = isDark
			? ['#00E5C8', '#A78BFA', '#F472B6', '#FBBF24']
			: ['#0066B0', '#7C3AED', '#DB2777', '#D97706'];

		ctx.strokeStyle = gridColor;
		ctx.lineWidth = 1;
		for (let i = 0; i <= 4; i++) {
			const y = (i / 4) * 120;
			ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(280, y); ctx.stroke();
		}

		const series = chartData.series;

		if (chartType === 'line') {
			series.forEach((s, si) => {
				const color = palette[si % palette.length];
				const n = s.data.length;
				const pts = s.data.map((v, i) => ({
					x: (i / (n - 1)) * 280,
					y: 120 - Math.min(1, v) * 100
				}));

				// Area fill
				ctx.beginPath();
				ctx.moveTo(pts[0].x, 120);
				pts.forEach(p => ctx.lineTo(p.x, p.y));
				ctx.lineTo(pts[n - 1].x, 120);
				ctx.closePath();
				const grad = ctx.createLinearGradient(0, 0, 0, 120);
				grad.addColorStop(0, color + '28');
				grad.addColorStop(1, color + '00');
				ctx.fillStyle = grad;
				ctx.fill();

				// Line
				ctx.beginPath();
				pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
				ctx.strokeStyle = color;
				ctx.lineWidth = 2;
				ctx.lineJoin = 'round';
				ctx.stroke();

				// Dots
				pts.forEach(p => {
					ctx.beginPath();
					ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
					ctx.fillStyle = color;
					ctx.fill();
				});
			});
		} else {
			// Bar chart
			const n = series[0].data.length;
			const barW = 240 / n * 0.52;
			series.forEach((s, si) => {
				const color = palette[si % palette.length];
				s.data.forEach((v, i) => {
					const x = (i / n) * 240 + 20 + si * (barW * 1.2);
					const barH = Math.min(1, v) * 100;
					const y = 120 - barH;
					ctx.fillStyle = color;
					ctx.beginPath();
					ctx.roundRect(x, y, barW, barH, 2);
					ctx.fill();
				});
			});
		}

		return {
			destroy() {
				canvas.remove();
			}
		};
	}

	// ─── Reactive skill bar data ───
	$: skillBarData = skillNodes.map(n => ({ ...n, score: proficiency[n.id] || 0 }));

	// ─── Pub / cert helpers ───
	const pubIcons  = { article: '✎', tutorial: '◈', paper: '◯', guide: '▶' };
	const pubColors = { article: '#00E5C8', tutorial: '#A78BFA', paper: '#F472B6', guide: '#FBBF24' };

	const certBadgeColors = {
		'aws-ml':          '#FF9900',
		'tf-dev':          '#FF6F00',
		'kaggle-dl':       '#20BEFF',
		'azure-ds':        '#0078D4',
		'databricks-mlops':'#E05A00'
	};
	const certBadgeShapes = {
		'aws-ml':          'polygon',
		'tf-dev':          'circle',
		'kaggle-dl':       'rect',
		'azure-ds':        'roundRect',
		'databricks-mlops':'polygon'
	};
</script>

<div id="top"></div>

<!-- ══════════════════════════════════════════════
     HERO
══════════════════════════════════════════════ -->
<section id="hero" class="hero-section grid-bg">
	<!-- Center Glow Point -->
	<div class="hero-orbit-wrap">
		<div class="center-glow">
			<div class="ping-ring ping-1"></div>
			<div class="ping-ring ping-2"></div>
			<div class="ping-ring ping-3"></div>
			<div class="glow-dot"></div>
		</div>

		<!-- Outer ring: Python, TensorFlow, Pandas -->
		<div class="orbit-ring outer-ring">
			<!-- Python -->
			<div class="orbit-node python-node" style="--angle: 0deg">
				<div class="orbit-logo">
					<svg viewBox="0 0 256 255" width="28" height="28">
						<path fill="#F97316" d="M126.916.072c-69.899 0-60.689 28.33-60.689 52.163 0 17.446 10.522 33.244 28.285 39.98 3.732 1.417 7.972 2.377 12.766 2.377 4.752 0 8.955-.96 12.616-2.377 3.44-1.306 7.01-3.002 10.383-5.013-12.63-8.866-14.15-25.56-5.086-38.455 11.05-13.748 27.53-9.075 28.8-.98 1.27 8.142-6.87 15.794-15.86 21.293 7.32 3.41 15.87 7.09 23.75 13.55 15.17 12.43 12.61 30.81 12.61 38.44 0 6.97-2.78 18.27-19.15 18.27-18.17 0-31.77-12.32-33.58-26.62-.28-2.21-.44-4.5-.44-6.8 0-1.04.04-2.07.12-3.08H86.648v-16.12h81.07v11.63c-3.07 8.78-5.84 17.84-5.84 27.26 0 24.75 22.86 33.59 42.83 18.79 12.35-9.15 18.54-25.45 18.54-38.44 0-15.57-9.66-33.69-34.44-38.44-16.93-3.27-34.36-.55-45.79 8.1-2.16 1.64-4.03 3.44-5.66 5.28C144.138 9.01 138.23 2.44 126.916.072zM95.354 76.93c-2.27 1.68-5.03 2.43-9.17 2.43-4.38 0-8.08-.87-11.32-2.43-4.8-2.3-8.16-6.4-8.16-12.15 0-5.61 3.37-9.8 8.16-12.16 3.24-1.56 6.94-2.43 11.32-2.43 4.14 0 6.91.88 9.17 2.43 4.53 3.12 5.96 8.74 5.96 12.16s-1.43 9.04-5.96 12.15zm76.463 53.03c2.27 1.68 5.04 2.43 9.18 2.43 4.37 0 8.08-.87 11.31-2.43 4.8-2.3 8.16-6.4 8.16-12.15 0-5.61-3.36-9.8-8.16-12.16-3.23-1.56-6.94-2.43-11.31-2.43-4.14 0-6.91.88-9.18 2.43-4.54 3.12-5.96 8.74-5.96 12.16s1.42 9.04 5.96 12.15z"/>
					</svg>
				</div>
			</div>
			<!-- TensorFlow -->
			<div class="orbit-node tf-node" style="--angle: 120deg">
				<div class="orbit-logo">
					<svg viewBox="0 0 256 267" width="28" height="28">
						<path fill="#F97316" d="M128 0C57.308 0 0 57.308 0 128s57.308 128 128 128 128-57.308 128-128S198.692 0 128 0zm72.662 94.663c2.27-15.63-2.27-25.457-10.908-34.098-17.217-17.217-45.227-17.217-62.444 0-2.27 2.27-3.633 4.54-4.54 6.813-1.36 3.407-1.36 6.813-.907 10.22-2.27 2.27-2.27 5.447 0 7.72 2.27 2.27 5.447 2.27 7.72 0 6.813-6.813 17.217-6.813 24.031 0 3.407 3.407 3.407 9.08-.907 11.36-5.447 2.27-9.08 6.813-12.717 10.45-2.27 2.27-3.633 4.54-5.447 7.72-4.54 9.08-4.54 20.487 0 29.567l13.627 13.627v-5.447c0-4.54 2.27-9.08 5.447-12.26l20.487-20.487z"/>
					</svg>
				</div>
			</div>
			<!-- Pandas -->
			<div class="orbit-node pandas-node" style="--angle: 240deg">
				<div class="orbit-logo">
					<svg viewBox="0 0 256 248" width="28" height="28">
						<path fill="#F97316" d="M167.2 32.5c-5.4 0-9.8 3.4-9.8 7.5v13.6c0 3.8 3.3 6.9 7.3 6.9h11.8c3.4 0 6.2-2.3 6.2-5.1v-17.8c0-2.8-2.3-5.1-5.1-5.1h-10.4zm18.3 0c-5.4 0-9.8 3.4-9.8 7.5v13.6c0 3.8 3.3 6.9 7.3 6.9h11.8c3.4 0 6.2-2.3 6.2-5.1v-17.8c0-2.8-2.3-5.1-5.1-5.1h-10.4zm-70.8 0c-5.4 0-9.8 3.4-9.8 7.5v13.6c0 3.8 3.3 6.9 7.3 6.9h11.8c3.4 0 6.2-2.3 6.2-5.1v-17.8c0-2.8-2.3-5.1-5.1-5.1h-10.4zm19.5 0c-5.4 0-9.8 3.4-9.8 7.5v13.6c0 3.8 3.3 6.9 7.3 6.9h11.8c3.4 0 6.2-2.3 6.2-5.1v-17.8c0-2.8-2.3-5.1-5.1-5.1h-10.4zm-10.2 34c-5.4 0-9.8 3.4-9.8 7.5v13.6c0 3.8 3.3 6.9 7.3 6.9h11.8c3.4 0 6.2-2.3 6.2-5.1V74c0-2.8-2.3-5.1-5.1-5.1h-10.4zm70.8 0c-5.4 0-9.8 3.4-9.8 7.5v13.6c0 3.8 3.3 6.9 7.3 6.9h11.8c3.4 0 6.2-2.3 6.2-5.1V74c0-2.8-2.3-5.1-5.1-5.1h-10.4zm19.5 0c-5.4 0-9.8 3.4-9.8 7.5v13.6c0 3.8 3.3 6.9 7.3 6.9h11.8c3.4 0 6.2-2.3 6.2-5.1V74c0-2.8-2.3-5.1-5.1-5.1h-10.4zm-100.1 34c-5.4 0-9.8 3.4-9.8 7.5v13.6c0 3.8 3.3 6.9 7.3 6.9h11.8c3.4 0 6.2-2.3 6.2-5.1v-17.8c0-2.8-2.3-5.1-5.1-5.1H94.5zm19.5 0c-5.4 0-9.8 3.4-9.8 7.5v13.6c0 3.8 3.3 6.9 7.3 6.9h11.8c3.4 0 6.2-2.3 6.2-5.1v-17.8c0-2.8-2.3-5.1-5.1-5.1H114zm70.8 0c-5.4 0-9.8 3.4-9.8 7.5v13.6c0 3.8 3.3 6.9 7.3 6.9h11.8c3.4 0 6.2-2.3 6.2-5.1v-17.8c0-2.8-2.3-5.1-5.1-5.1h-10.4zm19.5 0c-5.4 0-9.8 3.4-9.8 7.5v13.6c0 3.8 3.3 6.9 7.3 6.9h11.8c3.4 0 6.2-2.3 6.2-5.1v-17.8c0-2.8-2.3-5.1-5.1-5.1H204zm-89.9 34c-5.4 0-9.8 3.4-9.8 7.5v13.6c0 3.8 3.3 6.9 7.3 6.9h11.8c3.4 0 6.2-2.3 6.2-5.1v-17.8c0-2.8-2.3-5.1-5.1-5.1H114zm70.8 0c-5.4 0-9.8 3.4-9.8 7.5v13.6c0 3.8 3.3 6.9 7.3 6.9h11.8c3.4 0 6.2-2.3 6.2-5.1v-17.8c0-2.8-2.3-5.1-5.1-5.1h-10.4zm19.5 0c-5.4 0-9.8 3.4-9.8 7.5v13.6c0 3.8 3.3 6.9 7.3 6.9h11.8c3.4 0 6.2-2.3 6.2-5.1v-17.8c0-2.8-2.3-5.1-5.1-5.1H204z"/>
					</svg>
				</div>
			</div>
		</div>

		<!-- Inner ring: PyTorch, NumPy, Scikit-learn -->
		<div class="orbit-ring inner-ring">
			<!-- PyTorch -->
			<div class="orbit-node inner-node pytorch-node" style="--angle: 60deg">
				<div class="orbit-logo">
					<svg viewBox="0 0 256 271" width="26" height="26">
						<path fill="#F97316" d="M185.6 0.8c-0.4 0.3-0.8 0.5-1.3 0.5 -0.5 0-0.9-0.2-1.3-0.5 -0.7-0.8-0.9-2-0.3-3 5.8-10.7 8.9-21.3 9.1-31.4 0.2-11.6-3-21.8-8.9-28.5 -0.7-0.8-0.8-1.9-0.3-2.8 0.5-0.9 1.5-1.3 2.5-1 11.3 3.5 20.6 13.2 25.2 26.4 4.9 14.2 4.2 30.6-2.1 46.7C205.7 15 198 21.7 188.9 25.6c-0.4 0.2-0.9 0.3-1.3 0.3 -0.5 0-0.9-0.1-1.3-0.4 -0.8-0.7-1-1.9-0.5-2.9C189.3 13.4 189 6.9 187.3 0.8z"/>
						<path fill="#F97316" d="M70.4 0.8c-0.4 0.3-0.8 0.5-1.3 0.5 -0.5 0-0.9-0.2-1.3-0.5 -0.7-0.8-0.9-2-0.3-3 5.8-10.7 8.9-21.3 9.1-31.4 0.2-11.6-3-21.8-8.9-28.5 -0.7-0.8-0.8-1.9-0.3-2.8 0.5-0.9 1.5-1.3 2.5-1 11.3 3.5 20.6 13.2 25.2 26.4 4.9 14.2 4.2 30.6-2.1 46.7C90.5 15 82.8 21.7 73.7 25.6c-0.4 0.2-0.9 0.3-1.3 0.3 -0.5 0-0.9-0.1-1.3-0.4 -0.8-0.7-1-1.9-0.5-2.9C73.9 13.4 73.6 6.9 72.1 0.8z"/>
						<path fill="#F97316" d="M128 271c-70.7 0-128-57.3-128-128S57.3 15 128 15s128 57.3 128 128-57.3 128-128 128zm-10.7-195.6c-5.9 0.5-12.8 2.2-18 4.9 -0.8 0.4-1.1 1.4-0.7 2.2 0.4 0.8 1.4 1.1 2.2 0.7 9.4-5.1 22.9-6.9 35.8-1.4 0.9 0.4 1.9-0.1 2.2-1.1 0.3-0.9-0.1-1.9-1.1-2.2C132.7 77.5 127.5 76 124 75.4z"/>
					</svg>
				</div>
			</div>
			<!-- NumPy -->
			<div class="orbit-node inner-node numpy-node" style="--angle: 180deg">
				<div class="orbit-logo">
					<svg viewBox="0 0 256 256" width="26" height="26">
						<path fill="#F97316" d="M0 0h72v72H0V0zm184 0h72v72h-72V0zm0 184h72v72h-72v-72zm-184 0h72v72H0v-72zM28 28v40h40V28H28zm136 0v40h40V28h-40zM28 188v40h40v-40H28zm136 0v40h40v-40h-40z"/>
					</svg>
				</div>
			</div>
			<!-- Scikit-learn -->
			<div class="orbit-node inner-node sklearn-node" style="--angle: 300deg">
				<div class="orbit-logo">
					<svg viewBox="0 0 256 256" width="26" height="26">
						<path fill="#F97316" d="M128 0C57.4 0 0 57.4 0 128s57.4 128 128 128 128-57.4 128-128S198.6 0 128 0zm0 240c-61.8 0-112-50.2-112-112S66.2 16 128 16s112 50.2 112 112-50.2 112-112 112z"/>
						<path fill="#F97316" d="M80 80c-4.4 0-8 3.6-8 8v80c0 4.4 3.6 8 8 8h80c4.4 0 8-3.6 8-8V88c0-4.4-3.6-8-8-8H80zm56 16H96v16h40V96zm0 48H96v16h40v-16zM88 96v16h16V96H88zm48 0v16h16V96h-16zm0 48v16h16v-16h-16z"/>
					</svg>
				</div>
			</div>
		</div>

		<!-- Floating badges: Docker, FastAPI, MLflow -->
		<div class="floating-badges">
			<div class="float-badge" style="animation-delay: 0s">
				<svg viewBox="0 0 256 268" width="16" height="16">
					<path fill="#F97316" d="M42 49c0 5.7 4.6 10.3 10.3 10.3h8.3v-8.3c0-5.7-4.6-10.3-10.3-10.3H42v8.3zm10.3-8.3c-5.7 0-10.3 4.6-10.3 10.3v25.7c0 5.7 4.6 10.3 10.3 10.3h25.7c5.7 0 10.3-4.6 10.3-10.3v-8.3h-8.3v8.3c0 5.7-4.6 10.3-10.3 10.3H42c-5.7 0-10.3-4.6-10.3-10.3V51c0-5.7 4.6-10.3 10.3-10.3h25.7v8.3H52.3zm147.3-8.3c-16.4 0-29.7 13.3-29.7 29.7 0 13.1 8.5 24.2 20 28.2v9.1c0 1.1.9 2 2 2h8.3c1.1 0 2-.9 2-2v-9.1c11.5-4 20-15.1 20-28.2 0-16.4-13.3-29.7-29.7-29.7H180v8.3c0 5.7 4.6 10.3 10.3 10.3 5.7 0 10.3-4.6 10.3-10.3V51c0-5.7-4.6-10.3-10.3-10.3-5.7 0-10.3 4.6-10.3 10.3v8.3h-8.3v-8.3zm0 66.7h8.3c1.1 0 2-.9 2-2v-9.1c5.7-2 10.3-7.2 10.3-13.7 0-7.8-6.3-14-14-14-7.7 0-14 6.3-14 14 0 6.5 4.5 11.7 10.3 13.7v9.1c0 1.1.9 2 2 2zM42 165.7c-5.7 0-10.3 4.6-10.3 10.3v8.3h8.3c5.7 0 10.3 4.6 10.3 10.3s-4.6 10.3-10.3 10.3H32c-5.7 0-10.3 4.6-10.3 10.3v8.3c0 5.7 4.6 10.3 10.3 10.3h8.3c5.7 0 10.3 4.6 10.3 10.3s-4.6 10.3-10.3 10.3H32c-5.7 0-10.3 4.6-10.3 10.3v16.7c0 5.7 4.6 10.3 10.3 10.3h192c5.7 0 10.3-4.6 10.3-10.3V246c0-5.7-4.6-10.3-10.3-10.3h-8.3c-5.7 0-10.3-4.6-10.3-10.3s4.6-10.3 10.3-10.3h8.3c5.7 0 10.3-4.6 10.3-10.3v-8.3c0-5.7-4.6-10.3-10.3-10.3h-8.3c-5.7 0-10.3-4.6-10.3-10.3s4.6-10.3 10.3-10.3h8.3c5.7 0 10.3-4.6 10.3-10.3v-8.3c0-5.7-4.6-10.3-10.3-10.3H42z"/>
				</svg>
				<span>Docker</span>
			</div>
			<div class="float-badge" style="animation-delay: 1s">
				<svg viewBox="0 0 256 256" width="16" height="16">
					<path fill="#F97316" d="M128 0C57.3 0 0 57.3 0 128s57.3 128 128 128 128-57.3 128-128S198.7 0 128 0zm0 240c-61.8 0-112-50.2-112-112S66.2 16 128 16s112 50.2 112 112-50.2 112-112 112z"/>
					<path fill="#F97316" d="M80 80h96c4.4 0 8-3.6 8-8V80zm16 16v64h64v-64H96zM64 96h16v64H64V96zm96 0h16v64h-16V96zM64 176h16v16H64v-16zm96 0h16v16h-16v-16z"/>
				</svg>
				<span>FastAPI</span>
			</div>
			<div class="float-badge" style="animation-delay: 2s">
				<svg viewBox="0 0 256 256" width="16" height="16">
					<path fill="#F97316" d="M128 0C57.3 0 0 57.3 0 128s57.3 128 128 128 128-57.3 128-128S198.7 0 128 0zm0 240c-61.8 0-112-50.2-112-112S66.2 16 128 16s112 50.2 112 112-50.2 112-112 112z"/>
					<path fill="#F97316" d="M80 80h96v16H80V80zm16 32h64v16H96v-16zm0 48h48v16H96v-16z"/>
				</svg>
				<span>MLflow</span>
			</div>
		</div>
	</div>

	<!-- Hero overlay text (bottom-left) -->
	<div class="hero-overlay">
		<div class="section-tag reveal">
			<span class="hero-label-dot"></span>
			ML Engineer
		</div>
		<h1 class="hero-title reveal" style="transition-delay:60ms">
			Building systems<br/>
			<em>that learn at scale.</em>
		</h1>
		<p class="hero-sub reveal" style="transition-delay:120ms">
			From research notebook to production inference — I design, train, and deploy
			machine learning systems that handle millions of predictions daily.
		</p>
		<div class="hero-cta reveal" style="transition-delay:180ms">
			<a href="#projects" class="btn-primary">
				View Projects
				<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
					<path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</a>
			<a href="#contact" class="btn-ghost">Get in Touch</a>
		</div>
	</div>

	<!-- Stat cards (top-right) -->
	<div class="hero-stats reveal-stagger" style="transition-delay:240ms">
		<div class="stat-card">
			<span class="stat-num" data-target="50">0</span><span class="stat-suffix">M+</span>
			<span class="stat-label">Daily Predictions</span>
		</div>
		<div class="stat-card">
			<span class="stat-num" data-target="18">0</span><span class="stat-suffix">%</span>
			<span class="stat-label">Churn Reduction</span>
		</div>
		<div class="stat-card">
			<span class="stat-num" data-target="40">0</span><span class="stat-suffix">%</span>
			<span class="stat-label">Engagement Lift</span>
		</div>
	</div>
</section>

<!-- ══════════════════════════════════════════════
     ABOUT
══════════════════════════════════════════════ -->
<section id="about" class="section">
	<div class="container">
		<div class="section-tag reveal">About</div>
		<div class="about-grid">
			<div class="about-text reveal" style="transition-delay:60ms">
				<h2 class="section-heading">
					From research<br/>to production.
				</h2>
				<p>
					I'm an ML Engineer specializing in the full lifecycle of machine learning
					systems — from exploratory analysis and model development through
					CI/CD-integrated deployment and observability at scale.
				</p>
				<p>
					My work sits at the intersection of software engineering and data science:
					writing PyTorch training loops, shipping FastAPI endpoints, managing
					Kubernetes workloads, and building the pipelines that keep models fresh
					in production.
				</p>
				<p>
					Previously, I built recommendation systems serving 50M+ daily predictions,
					deployed computer vision pipelines on edge hardware, and designed ML
					architectures that cut inference costs by orders of magnitude.
				</p>
			</div>
			<div class="about-numbers reveal" style="transition-delay:120ms">
				<div class="about-num-item">
					<span class="about-num">4+</span>
					<span class="about-num-label">Years in ML Engineering</span>
				</div>
				<div class="about-num-item">
					<span class="about-num">12+</span>
					<span class="about-num-label">Models in Production</span>
				</div>
				<div class="about-num-item">
					<span class="about-num">$5M+</span>
					<span class="about-num-label">Annual Cost Savings</span>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- ══════════════════════════════════════════════
     PROJECTS
══════════════════════════════════════════════ -->
<section id="projects" class="section">
	<div class="container">
		<div class="section-tag reveal">Selected Work</div>
		<h2 class="section-heading reveal" style="transition-delay:60ms">
			Projects in production.
		</h2>

		<div class="project-list">
			{#each projects as project, i}
				<div class="project-card reveal" style="transition-delay:{i * 80}ms">
					<div class="project-card-header">
						<div class="project-meta">
							<span class="project-index">{String(project.index).padStart(2, '0')}</span>
							<span class="project-sep">—</span>
							<span class="project-year">{project.year}</span>
						</div>
						<h3 class="project-name">{project.name}</h3>
						<p class="project-desc">{project.desc}</p>
					</div>

					<div class="project-card-body">
						<!-- Canvas chart via Svelte action -->
						<div class="project-chart" use:drawChart={project}></div>

						<!-- Metric badge -->
						<div class="project-metric">
							<span class="metric-value">
								{typeof project.metric === 'number' && project.metric < 100
									? project.metric.toFixed(2)
									: project.metric}%
							</span>
							<span class="metric-label">{project.metricLabel}</span>
						</div>
					</div>

					<div class="project-card-footer">
						<div class="project-stack">
							{#each project.stack as tag}
								<span class="stack-tag">{tag}</span>
							{/each}
						</div>
						<button
							class="btn-detail"
							on:click={() => panel.openProject(project)}
							aria-label="View {project.name} case study"
						>
							Case Study
							<svg width="12" height="12" viewBox="0 0 14 14" fill="none">
								<path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ══════════════════════════════════════════════
     SKILLS
══════════════════════════════════════════════ -->
<section id="skills" class="section">
	<div class="container">
		<div class="section-tag reveal">Technical Proficiency</div>
		<h2 class="section-heading reveal" style="transition-delay:60ms">
			Skills &amp; tools.
		</h2>

		<!-- Category legend -->
		<div class="skill-legend reveal" style="transition-delay:120ms">
			{#each Object.values(categories) as cat}
				<span class="legend-item">
					<span class="legend-dot" style="background:{cat.color}"></span>
					{cat.label}
				</span>
			{/each}
		</div>

		<!-- SVG Skill Graph -->
		<div class="skill-graph-wrap reveal" style="transition-delay:180ms">
			<svg viewBox="0 0 720 460" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;">
				<!-- Edges -->
				{#each skillEdges as e}
					{@const from = skillNodes.find(n => n.id === e.from)}
					{@const to   = skillNodes.find(n => n.id === e.to)}
					{#if from && to}
						<line
							x1={from.x} y1={from.y}
							x2={to.x}   y2={to.y}
							stroke="rgba(255,255,255,0.07)"
							stroke-width="1"
						/>
					{/if}
				{/each}

				<!-- Category halos -->
				{#each Object.values(categories) as cat}
					<circle
						cx={cat.x} cy={cat.y} r="38"
						fill="{cat.color}15"
						stroke="{cat.color}35"
						stroke-width="1"
					/>
					<text
						x={cat.x} y={cat.y + 4}
						text-anchor="middle"
						font-family="Figtree, sans-serif"
						font-size="9"
						font-weight="600"
						fill={cat.color}
					>{cat.label}</text>
				{/each}

				<!-- Skill nodes -->
				{#each skillNodes as node}
					{@const cat = categories[node.category]}
					<g transform="translate({node.x},{node.y})">
						<!-- Glow ring -->
						<circle r="17" fill="{cat.color}18" stroke="{cat.color}28" stroke-width="1"/>
						<!-- Node bg -->
						<circle r="12" fill="var(--bg-elevated)" stroke="var(--border-light)" stroke-width="1.5"/>
						<!-- Accent dot -->
						<circle cy="-6" r="3.5" fill={cat.color}/>
						<!-- Label -->
						<text y="25" text-anchor="middle"
							font-family="Figtree, sans-serif"
							font-size="9.5"
							fill="var(--text)"
						>{node.label}</text>
					</g>
				{/each}
			</svg>
		</div>

		<!-- Proficiency bars -->
		<div class="skill-bars reveal" style="transition-delay:240ms">
			{#each skillBarData as node, i}
				<div class="skill-bar-row">
					<span class="skill-bar-name">{node.label}</span>
					<div class="skill-bar-track">
						<div
							class="skill-bar-fill"
							style="
								width: {node.score}%;
								background: {categories[node.category].color};
								transition-delay: {(i * 30) + 300}ms;
							"
						></div>
					</div>
					<span class="skill-bar-score">{node.score}</span>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ══════════════════════════════════════════════
     CERTIFICATIONS
══════════════════════════════════════════════ -->
<section id="certifications" class="section">
	<div class="container">
		<div class="section-tag reveal">Credentials</div>
		<h2 class="section-heading reveal" style="transition-delay:60ms">
			Certifications.
		</h2>

		<div class="certs-grid reveal-stagger" style="transition-delay:120ms">
			{#each certs as cert}
				{@const badgeColor = certBadgeColors[cert.badge] || 'var(--accent)'}
				{@const badgeShape = certBadgeShapes[cert.badge] || 'circle'}
				<div class="cert-card">
					<div class="cert-badge" style="border-color:{badgeColor}44">
						<svg width="30" height="30" viewBox="0 0 30 30">
							{#if badgeShape === 'polygon'}
								<polygon points="15,2 28,9 28,21 15,28 2,21 2,9"
									fill="none" stroke={badgeColor} stroke-width="1.5"/>
								<text x="15" y="19" text-anchor="middle"
									font-size="7" font-weight="700" fill={badgeColor}>
									{cert.badge.includes('aws') ? 'AWS' : cert.badge.includes('databricks') ? 'DB' : 'CERT'}
								</text>
							{:else if badgeShape === 'circle'}
								<circle cx="15" cy="15" r="12"
									fill="none" stroke={badgeColor} stroke-width="1.5"/>
								<text x="15" y="19" text-anchor="middle"
									font-size="8" font-weight="700" fill={badgeColor}>TF</text>
							{:else if badgeShape === 'rect'}
								<rect x="2" y="2" width="26" height="26" rx="5"
									fill="none" stroke={badgeColor} stroke-width="1.5"/>
								<text x="15" y="19" text-anchor="middle"
									font-size="7" font-weight="700" fill={badgeColor}>KGL</text>
							{:else}
								<rect x="2" y="2" width="26" height="26" rx="13"
									fill="none" stroke={badgeColor} stroke-width="1.5"/>
								<text x="15" y="19" text-anchor="middle"
									font-size="7" font-weight="700" fill={badgeColor}>AZ</text>
							{/if}
						</svg>
					</div>
					<div class="cert-info">
						<span class="cert-name">{cert.name}</span>
						<span class="cert-issuer">{cert.issuer} · {cert.year}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ══════════════════════════════════════════════
     PUBLICATIONS
══════════════════════════════════════════════ -->
<section id="publications" class="section">
	<div class="container">
		<div class="section-tag reveal">Writing</div>
		<h2 class="section-heading reveal" style="transition-delay:60ms">
			Publications &amp; articles.
		</h2>

		<div class="pubs-list reveal-stagger" style="transition-delay:120ms">
			{#each pubs as pub}
				<div class="pub-item">
					<span class="pub-icon" style="color:{pubColors[pub.type]}">
						{pubIcons[pub.type]}
					</span>
					<div class="pub-content">
						<span class="pub-title">{pub.title}</span>
						<span class="pub-meta">{pub.source} · {pub.date} · {pub.readTime}</span>
					</div>
					<svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="pub-arrow">
						<path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ══════════════════════════════════════════════
     CONTACT
══════════════════════════════════════════════ -->
<section id="contact" class="section contact-section">
	<div class="container">
		<div class="contact-inner reveal">
			<div class="section-tag">Contact</div>
			<h2 class="contact-heading">Let's build something.</h2>
			<p class="contact-sub">
				Open to ML engineering roles, consulting on production ML systems,
				or collaborating on interesting research problems.
			</p>
			<a href="mailto:ahmad@example.com" class="btn-primary btn-lg">
				Send a message
			</a>
			<div class="contact-links">
				<a href="https://github.com/ahmad" target="_blank" rel="noopener">GitHub ↗</a>
				<a href="https://linkedin.com/in/ahmad" target="_blank" rel="noopener">LinkedIn ↗</a>
				<a href="https://arxiv.org/abs/..." target="_blank" rel="noopener">ArXiv ↗</a>
			</div>
		</div>
	</div>
</section>

<!-- ══════════════════════════════════════════════
     FOOTER
══════════════════════════════════════════════ -->
<footer>
	<div class="container footer-inner">
		<span class="footer-copy">© {new Date().getFullYear()} Ahmad</span>
		<span class="footer-built">Built with SvelteKit · ML Portfolio</span>
	</div>
</footer>

<style>
	/* ── HERO ── */
	.hero-section {
		min-height: 100svh;
		display: flex;
		align-items: center;
		position: relative;
		overflow: hidden;
		padding: 0;
	}

	.hero-orbit-wrap {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Center glow */
	.center-glow {
		position: absolute;
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.glow-dot {
		position: absolute;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent);
		box-shadow: 0 0 12px var(--accent), 0 0 24px var(--accent-dim);
		animation: center-pulse 2.5s ease-in-out infinite;
		z-index: 2;
	}
	.ping-ring {
		position: absolute;
		border-radius: 50%;
		border: 1px solid var(--accent);
		width: 40px;
		height: 40px;
		animation: ping-ring 2.5s ease-out infinite;
	}
	.ping-1 { animation-delay: 0s; }
	.ping-2 { animation-delay: 0.83s; }
	.ping-3 { animation-delay: 1.66s; }
	@keyframes center-pulse {
		0%, 100% { box-shadow: 0 0 12px var(--accent), 0 0 24px var(--accent-dim); }
		50%       { box-shadow: 0 0 20px var(--accent), 0 0 40px var(--accent-dim); }
	}
	@keyframes ping-ring {
		0%   { transform: scale(0.5); opacity: 0.8; }
		100% { transform: scale(3.5); opacity: 0; }
	}

	/* Orbit rings */
	.orbit-ring {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.outer-ring {
		width: 440px;
		height: 440px;
	}
	.inner-ring {
		width: 260px;
		height: 260px;
	}

	/* Outer orbit nodes: clockwise, 20s */
	.orbit-node {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
	}
	.outer-ring .orbit-node {
		animation: orbit-outer 20s linear infinite;
	}
	/* Inner orbit nodes: counter-clockwise, 14s, staggered */
	.inner-ring .orbit-node {
		animation: orbit-inner 14s linear infinite;
	}
	.inner-node:nth-child(1) { animation-delay: -4.6s; }
	.inner-node:nth-child(2) { animation-delay: -9.3s; }
	.inner-node:nth-child(3) { animation-delay: -14s; }

	/* Logo positioned at end of radius arm */
	.orbit-logo {
		position: absolute;
		transform-origin: center center;
	}
	/* Outer ring logos: 220px radius arm, counter-rotate to stay upright */
	.outer-ring .orbit-logo {
		top: 0;
		left: 0;
		width: 0;
		height: 0;
		transform: rotate(calc(-1 * var(--angle))) translateX(220px);
		animation: counter-spin-outer 20s linear infinite;
	}
	/* Inner ring logos: 130px radius arm, counter-rotate reverse */
	.inner-ring .orbit-logo {
		top: 0;
		left: 0;
		width: 0;
		height: 0;
		transform: rotate(calc(-1 * var(--angle))) translateX(130px);
		animation: counter-spin-inner 14s linear infinite reverse;
	}

	.python-node   { --angle: 0deg; }
	.tf-node       { --angle: 120deg; }
	.pandas-node   { --angle: 240deg; }
	.pytorch-node  { --angle: 60deg; }
	.numpy-node    { --angle: 180deg; }
	.sklearn-node  { --angle: 300deg; }

	@keyframes counter-spin-outer {
		from { transform: rotate(calc(-1 * var(--angle))) rotate(0deg) translateX(220px); }
		to   { transform: rotate(calc(-1 * var(--angle))) rotate(-360deg) translateX(220px); }
	}
	@keyframes counter-spin-inner {
		from { transform: rotate(calc(-1 * var(--angle))) rotate(0deg) translateX(130px); }
		to   { transform: rotate(calc(-1 * var(--angle))) rotate(-360deg) translateX(130px); }
	}

	/* Floating badges */
	.floating-badges {
		position: absolute;
		top: 18%;
		right: 12%;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.float-badge {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.75rem;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: 99px;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--text-muted);
		animation: badge-bob 3.5s ease-in-out infinite;
		cursor: default;
		transition: border-color 0.15s, color 0.15s;
	}
	.float-badge:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	@keyframes badge-bob {
		0%, 100% { transform: translateY(0); }
		50%       { transform: translateY(-5px); }
	}

	/* Hero overlay text */
	.hero-overlay {
		position: absolute;
		bottom: 10%;
		left: 0;
		padding: 0 4rem;
		max-width: 620px;
		z-index: 10;
	}
	.hero-label-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent);
		animation: dot-blink 2s ease-in-out infinite;
	}
	@keyframes dot-blink {
		0%, 100% { opacity: 1; }
		50%       { opacity: 0.3; }
	}
	.hero-title {
		font-size: clamp(2.75rem, 6vw, 4.75rem);
		font-weight: 500;
		line-height: 1.08;
		letter-spacing: -0.025em;
		margin: 1.25rem 0 1.5rem;
		color: var(--text);
	}
	.hero-title em {
		font-style: italic;
		color: var(--accent);
	}
	.hero-sub {
		font-size: 1.0625rem;
		max-width: 500px;
		margin-bottom: 2.5rem;
	}
	.hero-cta {
		display: flex;
		gap: 0.875rem;
		flex-wrap: wrap;
	}

	/* Stat cards */
	.hero-stats {
		position: absolute;
		top: 15%;
		right: 4%;
		display: flex;
		flex-direction: column;
		gap: 1px;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		width: fit-content;
	}
	.stat-card {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		padding: 1.125rem 1.75rem;
		background: var(--bg-surface);
		min-width: 160px;
		text-align: right;
	}
	.stat-num {
		font-family: var(--font-head);
		font-size: 2.25rem;
		font-weight: 600;
		color: var(--accent);
		letter-spacing: -0.04em;
		line-height: 1;
		display: inline;
	}
	.stat-suffix {
		font-family: var(--font-head);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--accent);
		letter-spacing: -0.03em;
	}
	.stat-label {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		color: var(--text-muted);
	}

	/* Responsive */
	@media (max-width: 900px) {
		.floating-badges { display: none; }
		.hero-overlay { padding: 0 1.5rem; max-width: 100%; }
		.hero-stats { top: 12%; right: 1.5rem; }
	}
	@media (max-width: 640px) {
		.hero-orbit-wrap { display: none; }
		.hero-stats {
			position: static;
			flex-direction: row;
			margin-top: 2rem;
			width: 100%;
		}
		.stat-card { min-width: unset; flex: 1; text-align: center; }
	}

	/* ── SECTIONS ── */
	.section {
		padding: var(--section-gap) 0;
		border-top: 1px solid var(--border);
	}
	.section-heading {
		font-size: clamp(1.75rem, 4vw, 2.75rem);
		font-weight: 500;
		margin: 0.75rem 0 2.5rem;
		letter-spacing: -0.02em;
	}

	/* ── BUTTONS ── */
	:global(.btn-primary) {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.375rem;
		background: var(--accent);
		color: #0A0A0F;
		font-family: var(--font-body);
		font-weight: 600;
		font-size: 0.875rem;
		border-radius: var(--radius-sm);
		border: none;
		cursor: pointer;
		text-decoration: none;
		transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
	}
	:global(.btn-primary:hover) {
		background: var(--accent-hover);
		color: #0A0A0F;
		transform: translateY(-2px);
		box-shadow: 0 8px 24px var(--accent-dim);
	}
	:global(.btn-lg) {
		padding: 0.875rem 2rem;
		font-size: 1rem;
	}
	:global(.btn-ghost) {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.375rem;
		background: transparent;
		color: var(--text-muted);
		font-family: var(--font-body);
		font-weight: 500;
		font-size: 0.875rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-light);
		cursor: pointer;
		text-decoration: none;
		transition: all 0.15s ease;
	}
	:global(.btn-ghost:hover) {
		color: var(--text);
		border-color: var(--text-muted);
		background: var(--bg-surface);
	}
	:global(.btn-detail) {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--accent);
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 0.375rem 0.75rem;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.15s ease;
	}
	:global(.btn-detail:hover) {
		background: var(--accent-dim);
		border-color: var(--accent);
	}

	/* ── ABOUT ── */
	.about-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: start;
	}
	.about-text p {
		margin-bottom: 1.125rem;
		font-size: 0.9375rem;
	}
	.about-numbers {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
		padding-top: 0.5rem;
	}
	.about-num-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding-left: 1.5rem;
		border-left: 2px solid var(--accent);
	}
	.about-num {
		font-family: var(--font-head);
		font-size: 2.5rem;
		font-weight: 600;
		color: var(--text);
		letter-spacing: -0.04em;
		line-height: 1;
	}
	.about-num-label {
		font-size: 0.8125rem;
		color: var(--text-muted);
	}

	/* ── PROJECTS ── */
	.project-list {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1px;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--border);
	}
	.project-card {
		display: flex;
		flex-direction: column;
		background: var(--bg);
		padding: 1.75rem;
		gap: 1.25rem;
		transition: background 0.15s ease;
	}
	.project-card:hover { background: var(--bg-surface); }
	.project-card-header { display: flex; flex-direction: column; gap: 0.5rem; }
	.project-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.project-index {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--accent);
		font-weight: 500;
	}
	.project-sep {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--text-dim);
	}
	.project-year {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--text-dim);
	}
	.project-name {
		font-size: 1.125rem;
		font-weight: 500;
		color: var(--text);
		letter-spacing: -0.01em;
	}
	.project-desc {
		font-size: 0.85rem;
		line-height: 1.6;
		color: var(--text-muted);
	}
	.project-card-body {
		display: flex;
		align-items: flex-end;
		gap: 1.5rem;
	}
	.project-chart {
		flex: 1;
		height: 120px;
	}
	.project-metric {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		flex-shrink: 0;
	}
	.metric-value {
		font-family: var(--font-head);
		font-size: 1.625rem;
		font-weight: 600;
		color: var(--accent);
		letter-spacing: -0.04em;
		line-height: 1;
	}
	.metric-label {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		color: var(--text-dim);
		text-align: right;
		margin-top: 0.25rem;
	}
	.project-card-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}
	.project-stack { display: flex; flex-wrap: wrap; gap: 0.375rem; }
	.stack-tag {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		padding: 0.2rem 0.5rem;
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text-muted);
	}

	/* ── SKILLS ── */
	.skill-legend {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
		margin-bottom: 1.5rem;
	}
	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
		color: var(--text-muted);
	}
	.legend-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.skill-graph-wrap {
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		margin-bottom: 3rem;
		padding: 1rem 0.5rem;
	}
	.skill-bars {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.875rem 3rem;
	}
	.skill-bar-row {
		display: grid;
		grid-template-columns: 110px 1fr 30px;
		align-items: center;
		gap: 0.75rem;
	}
	.skill-bar-name {
		font-size: 0.8125rem;
		color: var(--text-muted);
		text-align: right;
	}
	.skill-bar-track {
		height: 3px;
		background: var(--border);
		border-radius: 2px;
		overflow: hidden;
	}
	.skill-bar-fill {
		height: 100%;
		border-radius: 2px;
		opacity: 0;
		transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease;
	}
	:global(.skill-bars.revealed) .skill-bar-fill { opacity: 1; }
	.skill-bar-score {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		color: var(--text-dim);
	}

	/* ── CERTS ── */
	.certs-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1px;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--border);
	}
	.cert-card {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		padding: 1.5rem;
		background: var(--bg);
		transition: background 0.15s ease;
	}
	.cert-card:hover { background: var(--bg-surface); }
	.cert-badge {
		width: 54px;
		height: 54px;
		border-radius: var(--radius-md);
		border: 1px solid;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-elevated);
		flex-shrink: 0;
	}
	.cert-info { display: flex; flex-direction: column; gap: 0.25rem; }
	.cert-name {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text);
		line-height: 1.4;
	}
	.cert-issuer {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--text-muted);
	}

	/* ── PUBS ── */
	.pubs-list {
		display: flex;
		flex-direction: column;
		gap: 1px;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--border);
	}
	.pub-item {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		padding: 1.375rem 1.5rem;
		background: var(--bg);
		transition: background 0.15s ease;
	}
	.pub-item:hover { background: var(--bg-surface); }
	.pub-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
		width: 24px;
		text-align: center;
	}
	.pub-content { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
	.pub-title {
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--text);
	}
	.pub-meta {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--text-muted);
	}
	.pub-arrow {
		color: var(--text-dim);
		flex-shrink: 0;
		transition: color 0.15s ease, transform 0.15s ease;
	}
	.pub-item:hover .pub-arrow {
		color: var(--accent);
		transform: translateX(3px);
	}

	/* ── CONTACT ── */
	.contact-section {
		padding: 8rem 0;
	}
	.contact-inner {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1rem;
	}
	.contact-heading {
		font-size: clamp(2.25rem, 5vw, 3.75rem);
		font-weight: 500;
		color: var(--text);
		margin: 0.5rem 0 0.5rem;
		letter-spacing: -0.025em;
	}
	.contact-sub {
		max-width: 480px;
		margin-bottom: 0.5rem;
	}
	.contact-links {
		display: flex;
		gap: 1.5rem;
		margin-top: 0.5rem;
	}
	.contact-links a {
		font-size: 0.875rem;
		color: var(--text-muted);
		text-decoration: none;
		transition: color 0.15s ease;
	}
	.contact-links a:hover { color: var(--accent); }

	/* ── FOOTER ── */
	footer {
		border-top: 1px solid var(--border);
		padding: 1.5rem 0;
	}
	.footer-inner {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.footer-copy, .footer-built {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-dim);
	}

	/* ── RESPONSIVE ── */
	@media (max-width: 640px) {
		.about-grid    { grid-template-columns: 1fr; gap: 2.5rem; }
		.project-list  { grid-template-columns: 1fr; }
		.skill-bars    { grid-template-columns: 1fr; }
		.hero-stats    { flex-direction: column; width: 100%; }
		.stat-card     { min-width: unset; }
		.footer-inner { flex-direction: column; gap: 0.5rem; text-align: center; }
	}
</style>
