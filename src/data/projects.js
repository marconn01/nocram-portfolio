const defaultProjects = [
  {
    id: 1,
    title: "Wavelet-Driven Neural Super-Resolution for Real-Time Rendering",
    summary: "Wavelet-based neural super-resolution research with Fourier-Mapped INR, temporal features, and BRDF-aware decomposition; achieved PSNR 36.8 dB, LPIPS 0.059, SSIM 0.960.",
    stack: ["PyTorch", "Neural Rendering", "INR", "Wavelets"],
    year: 2025,
    type: "Publication and Research",
    featured: true,
    slug: "wavelet-driven-neural-super-resolution"
  },
  {
    id: 2,
    title: "Early Diagnosis and Prognosis of Alzheimer’s Disease from Longitudinal MRI",
    summary: "3D CNN-based longitudinal modeling for sMCI vs pMCI with explainable AI; reached 88% accuracy and macro F1-score of 0.88.",
    stack: ["PyTorch", "3D CNN", "Medical Imaging", "Grad-CAM++"],
    year: 2025,
    type: "AI and Healthcare",
    featured: true,
    slug: "alzheimers-longitudinal-mri-diagnosis"
  },
  {
    id: 3,
    title: "AgroCare AI",
    summary: "Plant disease detection and advisory platform using ResNet-101 with LLM-backed treatment suggestions; achieved 81% test accuracy.",
    stack: ["PyTorch", "OpenCV", "Streamlit", "LLM"],
    year: 2025,
    type: "AI Application",
    featured: false,
    slug: "agrocare-ai"
  },
  {
    id: 4,
    title: "Algorithm Visualizer",
    summary: "Real-time visualization of sorting and searching algorithms with configurable maze and array parameters in a cross-platform C++ app.",
    stack: ["C++", "SFML", "CMake"],
    year: 2025,
    type: "Systems and Visualization",
    featured: false,
    slug: "algorithm-visualizer"
  },
  {
    id: 5,
    title: "Fabric Flow",
    summary: "Real-time 2D cloth simulation using Verlet integration and constraint physics with user interactions and multithreaded performance optimizations.",
    stack: ["Python", "PyOpenGL", "Pygame", "NumPy", "Multithreading"],
    year: 2024,
    type: "Simulation",
    featured: false,
    slug: "fabric-flow"
  },
  {
    id: 6,
    title: "DataBridges: Backend and Data Analysis",
    summary: "Dataset exploration platform with FastAPI integration of external data sources and EDA workflows for GIS-oriented use cases.",
    stack: ["FastAPI", "Pandas", "PostgreSQL", "External APIs"],
    year: 2024,
    type: "Backend API",
    featured: false,
    slug: "databridges-backend-and-data-analysis"
  },
  {
    id: 7,
    title: "Cloud-Native Scalable Weather Platform",
    summary: "Production-grade cloud-native weather platform on AWS with ALB traffic distribution, event-driven processing, and automated CI/CD.",
    stack: ["AWS EC2", "ALB", "ECR", "S3", "SQS", "Terraform", "Docker", "GitHub Actions"],
    year: 2025,
    type: "Cloud Platform",
    featured: false,
    slug: "cloud-native-scalable-weather-platform"
  },
  {
    id: 8,
    title: "Rule-Based Self-Healing Kubernetes Infrastructure",
    summary: "Automated failure detection and remediation on Kubernetes using metrics-driven recovery loops and Python-based control services.",
    stack: ["Kubernetes", "Prometheus", "Grafana", "Python"],
    year: 2025,
    type: "SRE and Reliability",
    featured: true,
    slug: "rule-based-self-healing-kubernetes-infrastructure"
  }
];

module.exports = defaultProjects;
