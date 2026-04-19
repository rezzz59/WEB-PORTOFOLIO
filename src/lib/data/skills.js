// 4 categories positioned on the skill graph canvas
const categories = {
	ml: {
		id: 'ml',
		label: 'Machine Learning',
		x: 360,
		y: 200,
		color: '#00E5C8'
	},
	data: {
		id: 'data',
		label: 'Data Engineering',
		x: 140,
		y: 130,
		color: '#A78BFA'
	},
	mlops: {
		id: 'mlops',
		label: 'MLOps',
		x: 580,
		y: 130,
		color: '#F472B6'
	},
	serving: {
		id: 'serving',
		label: 'Model Serving',
		x: 360,
		y: 400,
		color: '#FBBF24'
	}
};

// 20 skill nodes — each positioned in arcs around their category
const skillNodes = [
	// ML category (centered at 360, 200)
	{ id: 'pytorch',    label: 'PyTorch',        category: 'ml', x: 280, y: 118 },
	{ id: 'xgboost',    label: 'XGBoost',         category: 'ml', x: 310, y: 100 },
	{ id: 'sklearn',    label: 'Scikit-learn',    category: 'ml', x: 360, y:  92 },
	{ id: 'tensorflow', label: 'TensorFlow',      category: 'ml', x: 420, y: 108 },
	{ id: 'huggingface', label: 'HuggingFace',  category: 'ml', x: 445, y: 145 },
	{ id: 'cv',         label: 'Computer Vision', category: 'ml', x: 440, y: 200 },
	{ id: 'nlp',        label: 'NLP / LLMs',     category: 'ml', x: 395, y: 240 },
	{ id: 'rl',         label: 'Reinforcement L.', category: 'ml', x: 315, y: 240 },

	// Data Engineering category (centered at 140, 130)
	{ id: 'python',   label: 'Python',         category: 'data', x:  72, y:  85 },
	{ id: 'sql',      label: 'SQL',            category: 'data', x:  78, y: 115 },
	{ id: 'spark',    label: 'Apache Spark',   category: 'data', x:  68, y: 155 },
	{ id: 'kafka',    label: 'Kafka',          category: 'data', x:  92, y: 175 },
	{ id: 'airflow',  label: 'Airflow',        category: 'data', x: 118, y: 185 },

	// MLOps category (centered at 580, 130)
	{ id: 'docker',   label: 'Docker',         category: 'mlops', x: 518, y:  88 },
	{ id: 'k8s',      label: 'Kubernetes',    category: 'mlops', x: 558, y:  80 },
	{ id: 'terraform', label: 'Terraform',     category: 'mlops', x: 600, y:  92 },
	{ id: 'mlflow',  label: 'MLflow',         category: 'mlops', x: 625, y: 125 },
	{ id: 'gcp',      label: 'GCP',           category: 'mlops', x: 625, y: 165 },

	// Model Serving category (centered at 360, 400)
	{ id: 'fastapi',  label: 'FastAPI',       category: 'serving', x: 280, y: 355 },
	{ id: 'redis',   label: 'Redis',         category: 'serving', x: 305, y: 368 },
	{ id: 'triton',  label: 'Triton',        category: 'serving', x: 348, y: 375 },
	{ id: 'onnx',    label: 'ONNX',          category: 'serving', x: 400, y: 372 },
	{ id: 'grafana', label: 'Monitoring',    category: 'serving', x: 440, y: 358 }
];

// Edge connections between skill nodes (for visual graph lines)
const skillEdges = [
	// ML internal
	{ from: 'pytorch',    to: 'tensorflow' },
	{ from: 'tensorflow', to: 'huggingface' },
	{ from: 'pytorch',    to: 'cv' },
	{ from: 'huggingface', to: 'nlp' },
	{ from: 'sklearn',    to: 'xgboost' },
	{ from: 'nlp',        to: 'rl' },

	// Cross-category edges (representing tool usage bridging)
	{ from: 'sklearn',    to: 'python' },
	{ from: 'python',     to: 'sql' },
	{ from: 'python',     to: 'spark' },
	{ from: 'spark',      to: 'kafka' },
	{ from: 'airflow',    to: 'docker' },
	{ from: 'docker',    to: 'k8s' },
	{ from: 'k8s',        to: 'mlflow' },
	{ from: 'mlflow',     to: 'gcp' },
	{ from: 'tensorflow', to: 'onnx' },
	{ from: 'pytorch',    to: 'triton' },
	{ from: 'fastapi',    to: 'redis' },
	{ from: 'onnx',       to: 'triton' },
	{ from: 'grafana',    to: 'triton' }
];

// Proficiency scores for skill bars (0–100)
const proficiency = {
	pytorch:     90,
	xgboost:     85,
	sklearn:     92,
	tensorflow:  80,
	huggingface: 85,
	cv:          75,
	nlp:         80,
	rl:          65,
	python:      95,
	sql:         90,
	spark:       78,
	kafka:       72,
	airflow:     80,
	docker:      85,
	k8s:         78,
	terraform:   70,
	mlflow:      82,
	gcp:         80,
	fastapi:     88,
	redis:       78,
	triton:      70,
	onnx:        75,
	grafana:     78
};

export { categories, skillNodes, skillEdges, proficiency };