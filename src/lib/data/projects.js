export const projects = [
	{
		id: 'churn-prediction',
		index: 1,
		year: '2024',
		name: 'Customer Churn Prediction',
		desc: 'End-to-end ML pipeline predicting subscriber churn 30 days in advance, enabling proactive retention campaigns that reduced churn by 18%.',
		stack: ['Python', 'XGBoost', 'Scikit-learn', 'MLflow', 'FastAPI', 'Docker'],
		metric: 0.91,
		metricLabel: 'F1 Score',
		chartType: 'line',
		chartData: {
			labels: ['10k', '50k', '100k', '250k', '500k'],
			series: [
				{ name: 'Train Accuracy', data: [0.83, 0.88, 0.90, 0.92, 0.93] },
				{ name: 'Val Accuracy',  data: [0.80, 0.85, 0.87, 0.88, 0.89] }
			]
		},
		problem: 'High-value subscribers were cancelling with no early warning, leaving no time for retention interventions. Manual review was too slow for the volume.',
		approach: 'Built a gradient-boosted classifier on 6 months of behavioral data. Engineered temporal features capturing usage decline patterns. Deployed as a REST API with batch scoring capability.',
		results: '18% reduction in monthly churn, 3.2x improvement in retention campaign ROI, model retrained weekly with zero downtime via blue/green deployments.'
	},
	{
		id: 'sentiment-api',
		index: 2,
		year: '2024',
		name: 'Sentiment Analysis API',
		desc: 'Production BERT-based API processing 2M+ text inferences per day with sub-50ms p99 latency, powering real-time brand monitoring dashboards.',
		stack: ['Python', 'BERT', 'PyTorch', 'Redis', 'FastAPI', 'Kubernetes'],
		metric: 94.3,
		metricLabel: 'Accuracy %',
		chartType: 'bar',
		chartData: {
			labels: ['Precision', 'Recall', 'F1 Score', 'Accuracy'],
			series: [
				{ name: 'Score', data: [0.93, 0.92, 0.93, 0.943] }
			]
		},
		problem: 'Brand monitoring team needed real-time sentiment classification across 12 languages but commercial APIs were cost-prohibitive at their inference volume.',
		approach: 'Fine-tuned DistilBERT on domain-specific review data. Quantized the model to INT8 and implemented streaming inference. Built a Redis-backed caching layer for repeated queries.',
		results: '2M+ daily inferences at $0.00003/inference vs $0.01 for commercial APIs. p99 latency under 50ms. 99.95% uptime across 8 months.'
	},
	{
		id: 'defect-detection',
		index: 3,
		year: '2023',
		name: 'Defect Detection System',
		desc: 'Computer vision pipeline using a fine-tuned ResNet50 to detect manufacturing defects in real time, deployed on edge hardware at the factory floor.',
		stack: ['Python', 'PyTorch', 'OpenCV', 'NVIDIA Triton', 'ONNX', 'Grafana'],
		metric: 98.7,
		metricLabel: 'Detection Rate %',
		chartType: 'line',
		chartData: {
			labels: ['Epoch 1', 'Epoch 10', 'Epoch 20', 'Epoch 30', 'Epoch 40'],
			series: [
				{ name: 'Train Loss', data: [1.82, 0.74, 0.38, 0.21, 0.12] },
				{ name: 'Val Accuracy', data: [0.71, 0.88, 0.93, 0.96, 0.987] }
			]
		},
		problem: 'Manual visual inspection was missing 4% of defective parts, causing costly warranty claims. A separate ML attempt had failed due to edge hardware constraints.',
		approach: 'Fine-tuned ResNet50 on 50k labeled images with aggressive augmentation. Optimized for TensorRT, compiled to ONNX for NVIDIA Triton inference server. Integrated with existing PLC hardware.',
		results: '98.7% detection rate, false positive rate below 0.5%. Defect escape rate dropped from 4% to 0.3%. Estimated $2.1M annual savings in warranty costs.'
	},
	{
		id: 'recommendation-engine',
		index: 4,
		year: '2023',
		name: 'Recommendation Engine',
		desc: 'Collaborative filtering system leveraging TensorFlow Recommenders to personalize content discovery, increasing user engagement by 40%.',
		stack: ['Python', 'TensorFlow', 'Apache Beam', 'BigQuery', 'Vertex AI', 'Redis'],
		metric: 40.0,
		metricLabel: 'Engagement Lift %',
		chartType: 'line',
		chartData: {
			labels: ['Baseline', 'Week 2', 'Week 4', 'Week 6', 'Week 8'],
			series: [
				{ name: 'CTR Lift', data: [0, 12, 24, 33, 40] },
				{ name: 'Session Depth', data: [0, 8, 18, 28, 36] }
			]
		},
		problem: 'Static content curation was leading to declining user engagement and high bounce rates. The existing rule-based recommendation system had plateaued.',
		approach: 'Implemented a two-tower retrieval model with a ranking layer. Processed 6 months of user interaction logs in BigQuery. Trained on Vertex AI with hyperparameter tuning via Vizier.',
		results: '40% lift in click-through rate, 28% increase in session depth, 15% uplift in daily active users. Model retrained nightly, serving 50M+ predictions/day.'
	}
];