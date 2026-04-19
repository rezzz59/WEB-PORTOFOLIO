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
			? ['#F97316', '#A78BFA', '#F472B6', '#FBBF24']
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
	const pubColors = { article: '#0066B0', tutorial: '#7C3AED', paper: '#DB2777', guide: '#D97706' };

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
<section id="hero" class="hero-section">
	<!-- Left: text + stats -->
	<div class="hero-left">
<div class="hero-orbit-col">
		<div class="hero-text">
			<div class="section-tag reveal">
				<span class="hero-label-dot"></span>
				Portfolio
			</div>
			<h1 class="hero-title reveal" style="transition-delay:60ms">
				ML Engineer &<br/>
				<em>Data Scientist.</em>
			</h1>
			<p class="hero-sub reveal" style="transition-delay:120ms">
				I build end-to-end machine learning systems — from data pipelines and model training
				to production deployment. Turning raw data into decisions at scale.
			</p>
			<div class="hero-cta reveal" style="transition-delay:180ms">
				<a href="#projects" class="btn-primary">
					View Projects
					<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</a>
				<a href="#contact" class="btn-ghost">Get in Touch</a>
			</div>
		</div>
		<!-- Hero stats -->
		<div class="hero-stats reveal-stagger" style="transition-delay:240ms">
			<div class="stat-card">
				<span class="stat-num" data-target="4">0</span><span class="stat-suffix">+</span>
				<span class="stat-label">Years Experience</span>
			</div>
			<div class="stat-card">
				<span class="stat-num" data-target="12">0</span><span class="stat-suffix">+</span>
				<span class="stat-label">Projects Shipped</span>
			</div>
			<div class="stat-card">
				<span class="stat-num" data-target="5">0</span><span class="stat-suffix">+</span>
				<span class="stat-label">Certifications</span>
			</div>
		</div>
	</div>

	<!-- Right: orbit -->
		</div>

	<!-- Right: orbit system -->
	<div class="hero-orbit-col">
<div class="hero-right">
		<!-- Orbit system: spinning ring of tech logos -->
		<div class="hero-orbit">
			<!-- Glass orbit ring -->
			<div class="orbit-ring"></div>
			<!-- Spinning wrapper: 6 logos orbit the center -->
			<div class="orbit-anim">
				<!-- 0° — right (Python) -->
				<div class="orbit-logo a0">
					<div class="orbit-logo-chip">
						<svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
							<title>Python</title>
							<path fill="#3776AB" d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
						</svg>
						<span class="orbit-logo-name">Python</span>
					</div>
				</div>
				<!-- 60° — bottom-right (TensorFlow) -->
				<div class="orbit-logo a60">
					<div class="orbit-logo-chip">
						<svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
							<title>TensorFlow</title>
							<path fill="#FF6F00" d="M1.292 5.856L11.54 0v24l-4.095-2.378V7.603l-6.168 3.564.015-5.31zm21.43 5.311l-.014-5.31L12.46 0v24l4.095-2.378V14.87l3.092 1.788-.018-4.618-3.074-1.756V7.603l6.168 3.564z"/>
						</svg>
						<span class="orbit-logo-name">TensorFlow</span>
					</div>
				</div>
				<!-- 120° — bottom (PyTorch) -->
				<div class="orbit-logo a120">
					<div class="orbit-logo-chip">
						<svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
							<title>PyTorch</title>
							<path fill="#EE4C2C" d="M12.005 0L4.952 7.053a9.865 9.865 0 000 14.022 9.866 9.866 0 0014.022 0c3.984-3.9 3.986-10.205.085-14.023l-1.744 1.743c2.904 2.905 2.904 7.634 0 10.538s-7.634 2.904-10.538 0-2.904-7.634 0-10.538l4.647-4.646.582-.665zm3.568 3.899a1.327 1.327 0 00-1.327 1.327 1.327 1.327 0 001.327 1.328A1.327 1.327 0 0016.9 5.226 1.327 1.327 0 0015.573 3.9z"/>
						</svg>
						<span class="orbit-logo-name">PyTorch</span>
					</div>
				</div>
				<!-- 180° — left (Pandas) -->
				<div class="orbit-logo a180">
					<div class="orbit-logo-chip">
						<svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
							<title>pandas</title>
							<path fill="#150458" d="M16.922 0h2.623v18.104h-2.623zm-4.126 12.94h2.623v2.57h-2.623zm0-7.037h2.623v5.446h-2.623zm0 11.197h2.623v5.446h-2.623zM4.456 5.896h2.622V24H4.455zm4.213 2.559h2.623v2.57H8.67zm0 4.151h2.623v5.447H8.67zm0-11.187h2.623v5.446H8.67Z"/>
						</svg>
						<span class="orbit-logo-name">Pandas</span>
					</div>
				</div>
				<!-- 240° — top-left (NumPy) -->
				<div class="orbit-logo a240">
					<div class="orbit-logo-chip">
						<svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
							<title>NumPy</title>
							<path fill="#4DABCF" d="M10.315 4.876L6.3048 2.8517l-4.401 2.1965 4.1186 2.0683zm1.8381.9277l4.2045 2.1223-4.3622 2.1906-4.125-2.0718zm5.6153-2.9213l4.3193 2.1658-3.863 1.9402-4.2131-2.1252zm-1.859-.9329L12.021 0 8.1742 1.9193l4.0068 2.0208zm-3.0401 16.7443V24l4.7107-2.3507-.0053-5.3085zm4.7037-4.2057l-.0052-5.2528-4.6985 2.3356v5.2546zm5.6553-.9845v5.327l-4.0178 2.0052-.0029-5.3028zm0-1.8626V6.4214l-4.0253 2.001.0034 5.2633zM11.2062 11.571L8.0333 9.9756v6.895s-3.8804-8.2564-4.2399-8.998c-.0463-.0957-.2371-.2007-.2858-.2262C2.8118 7.2812.773 6.2485.773 6.2485V18.43l2.8204 1.5076v-6.3674s3.8392 7.3775 3.878 7.458c.0389.0807.4245.8582.8362 1.1314.5485.363 2.8992 1.7766 2.8992 1.7766z"/>
						</svg>
						<span class="orbit-logo-name">NumPy</span>
					</div>
				</div>
				<!-- 300° — top-right (Scikit-learn) -->
				<div class="orbit-logo a300">
					<div class="orbit-logo-chip">
						<svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
							<title>scikit-learn</title>
							<path fill="#F7931E" d="M15.601 5.53c-1.91.035-3.981.91-5.63 2.56-2.93 2.93-2.083 8.53-1.088 9.525.805.804 6.595 1.843 9.526-1.088a9.74 9.74 0 00.584-.643c.043-.292.205-.66.489-1.106a1.848 1.848 0 01-.537.176c-.144.265-.37.55-.676.855-.354.335-.607.554-.76.656a.795.795 0 01-.437.152c-.35 0-.514-.308-.494-.924-.22.316-.425.549-.612.7a.914.914 0 01-.578.224c-.194 0-.36-.09-.496-.273a1.03 1.03 0 01-.193-.507 4.016 4.016 0 01-.726.583c-.224.132-.47.197-.74.197-.3 0-.543-.096-.727-.288a.978.978 0 01-.257-.524v.004c-.3.276-.564.48-.79.611a1.295 1.295 0 01-.649.197.693.693 0 01-.571-.275c-.145-.183-.218-.43-.218-.739 0-.464.101-1.02.302-1.67.201-.65.445-1.25.733-1.797l.842-.312a.21.21 0 01.06-.013c.063 0 .116.047.157.14.04.095.061.221.061.38 0 .451-.104.888-.312 1.31-.207.422-.532.873-.974 1.352-.018.23-.027.388-.027.474 0 .193.036.345.106.458.071.113.165.169.282.169a.71.71 0 00.382-.13c.132-.084.333-.26.602-.523.028-.418.187-.798.482-1.142.324-.38.685-.569 1.08-.569.206 0 .37.054.494.16a.524.524 0 01.186.417c0 .458-.486.829-1.459 1.114.088.43.32.646.693.646a.807.807 0 00.417-.117c.129-.076.321-.243.575-.497.032-.252.118-.495.259-.728.182-.3.416-.544.701-.73.285-.185.537-.278.756-.278.276 0 .47.127.58.381l.677-.374h.186l-.292.971c-.15.488-.226.823-.226 1.004 0 .19.067.285.202.285.086 0 .181-.045.285-.137.104-.092.25-.232.437-.42v.001c.143-.155.274-.32.392-.494-.19-.084-.285-.21-.285-.375 0-.17.058-.352.174-.545.116-.194.275-.29.479-.29.172 0 .258.088.258.265 0 .139-.05.338-.149.596.367-.04.687-.32.961-.842l.228-.01c1.059-2.438.828-5.075-.83-6.732-1.019-1.02-2.408-1.5-3.895-1.471zm4.725 8.203a8.938 8.938 0 0 1-1.333 2.151 1.09 1.09 0 0 0-.012.147c0 .168.047.309.14.423.092.113.206.17.34.17.296 0 .714-.264 1.254-.787-.001.04-.003.08-.003.121 0 .146.012.368.036.666l.733-.172c0-.2.003-.357.01-.474.01-.157.033-.33.066-.517.02-.11.07-.216.152-.315l.186-.216a5.276 5.276 0 0 1 .378-.397c.062-.055.116-.099.162-.13a.26.26 0 0 1 .123-.046c.055 0 .083.035.083.106 0 .07-.052.236-.156.497-.194.486-.292.848-.292 1.084 0 .175.046.314.136.418a.45.45 0 0 0 .358.155c.365 0 .803-.269 1.313-.808v-.381c-.361.426-.623.64-.784.64-.109 0-.163-.067-.163-.2 0-.1.065-.316.195-.65.19-.486.285-.836.285-1.048a.464.464 0 0 0-.112-.319.36.36 0 0 0-.282-.127c-.165 0-.354.077-.567.233-.213.156-.5.436-.863.84.053-.262.165-.622.335-1.08l-.809.156a6.54 6.54 0 0 0-.399 1.074c-.04.156-.07.316-.092.48a7.447 7.447 0 0 1-.49.45.38.38 0 0 1-.229.08.208.208 0 0 1-.174-.082.352.352 0 0 1-.064-.222c0-.1.019-.214.056-.343.038-.13.12-.373.249-.731l.308-.849z"/>
						</svg>
						<span class="orbit-logo-name">Scikit-learn</span>
					</div>
				</div>
			</div>
			<!-- Center dot -->
			<div class="orbit-center">
				<div class="orbit-center-dot"></div>
			</div>
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
		justify-content: center;
		padding: 6rem 3rem 3rem;
		gap: 5rem;
		position: relative;
		overflow: hidden;
	}

	/* Left column: text + stats */
	.hero-left {
		flex: 1;
		max-width: 520px;
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
	}

	/* Right column: orbit system */
	.hero-orbit-col {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Orbit system container */
	.hero-orbit {
		position: relative;
		width: 320px;
		height: 320px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Glass orbit ring */
	.orbit-ring {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		border: 1px solid var(--border);
		background: transparent;
	}

	/* Spinning orbit wrapper — this orbits all logos around the center */
	.orbit-anim {
		position: absolute;
		inset: 0;
		animation: orbit-spin 24s linear infinite;
		transform-origin: 160px 160px;
	}

	/* Each orbiting logo — fixed at starting position on the orbit circle
	   Orbit: 320×320, center (160,160), radius 130px
	   When orbit-anim rotates, these travel in a circle around the center */
	.orbit-logo {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		/* Static positioning at starting angles */
	}
	.a0   { top: 136px; left: 246px; }
	.a60  { top: 249px; left: 181px; }
	.a120 { top: 249px; left: 51px;  }
	.a180 { top: 136px; left: -14px; }
	.a240 { top: 23px;  left: 51px;  }
	.a300 { top: 23px;  left: 181px; }

	@keyframes orbit-spin {
		from { transform: rotate(0deg); }
		to   { transform: rotate(360deg); }
	}

	/* Logo chip: counter-rotates to stay upright while parent orbits */
	.orbit-logo-chip {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		padding: 0.5rem 0.6rem;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		white-space: nowrap;
	}
	/* Counter-rotate each chip so label stays upright as it orbits */
	.a0   .orbit-logo-chip { transform: rotate(0deg);   }
	.a60  .orbit-logo-chip { transform: rotate(-60deg);  }
	.a120 .orbit-logo-chip { transform: rotate(-120deg); }
	.a180 .orbit-logo-chip { transform: rotate(-180deg); }
	.a240 .orbit-logo-chip { transform: rotate(-240deg); }
	.a300 .orbit-logo-chip { transform: rotate(-300deg); }

	.orbit-logo-name {
		font-family: var(--font-mono);
		font-size: 0.58rem;
		color: var(--text-muted);
	}

	/* Center dot */
	.orbit-center {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.orbit-center-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent);
		box-shadow: 0 0 12px var(--accent);
		animation: center-pulse 3s ease-in-out infinite;
	}

	/* Right column: text + stats */
	.hero-right {
		flex: 1;
		max-width: 520px;
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
	}

	.hero-label-dot {
		display: inline-block;
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
		font-size: clamp(2.5rem, 4vw, 3.75rem);
		font-weight: 500;
		line-height: 1.1;
		letter-spacing: -0.025em;
		margin: 1rem 0 1.25rem;
		color: var(--text);
	}
	.hero-title em {
		font-style: italic;
		color: var(--accent);
	}
	.hero-sub {
		font-size: 1rem;
		margin-bottom: 2rem;
	}
	.hero-cta {
		display: flex;
		gap: 0.875rem;
		flex-wrap: wrap;
	}

	/* Stat cards */
	.hero-stats {
		display: flex;
		gap: 1px;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--border);
	}
	.stat-card {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		padding: 1rem 1.25rem;
		background: var(--bg-surface);
	}
	.stat-num {
		font-family: var(--font-head);
		font-size: 2rem;
		font-weight: 600;
		color: var(--accent);
		letter-spacing: -0.04em;
		line-height: 1;
	}
	.stat-suffix {
		font-family: var(--font-head);
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--accent);
	}
	.stat-label {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		color: var(--text-muted);
	}

	/* Responsive: stack on mobile, orbit on right */
	@media (max-width: 768px) {
		.hero-section {
			flex-direction: column;
			padding: 5rem 1.5rem 3rem;
			gap: 3rem;
			align-items: center;
		}
		.hero-left {
			text-align: center;
			max-width: 100%;
			align-items: center;
			order: -1;
		}
		.hero-orbit {
			width: 260px;
			height: 260px;
		}
		.a0   { top: 111px; left: 201px; }
		.a60  { top: 201px; left: 147px; }
		.a120 { top: 201px; left: 38px;  }
		.a180 { top: 111px; left: -16px; }
		.a240 { top: 21px;  left: 38px;  }
		.a300 { top: 21px;  left: 147px; }
		.orbit-anim { transform-origin: 130px 130px; }
		/* On mobile: no background/border on chips, pure icon */
		.orbit-logo-chip {
			background: transparent !important;
			border-color: transparent !important;
			box-shadow: none !important;
		}
		.hero-cta { justify-content: center; }
		.hero-stats { width: 100%; }
	}

	/* Dark theme orbit overrides */
	:global([data-theme="dark"]) .orbit-ring {
		border-color: rgba(255,255,255,0.06);
	}
	:global([data-theme="dark"]) .orbit-logo-chip {
		background: transparent;
		border-color: rgba(255,255,255,0.08);
		box-shadow: 0 4px 20px rgba(0,0,0,0.4);
	}
	:global([data-theme="dark"]) .orbit-logo-name {
		color: rgba(255,255,255,0.5);
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
		color: #fff;
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
		color: #fff;
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
