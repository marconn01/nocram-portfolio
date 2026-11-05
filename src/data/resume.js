// Content of public/Navin_Nepal_Resume.pdf, rendered as the /cv page.
// Keep this in sync when the PDF changes.
module.exports = {
  name: "Navin Nepal",
  headline: "DevOps & Backend Engineer",
  location: "Imadol, Lalitpur, Nepal",
  pdf: "/Navin_Nepal_Resume.pdf",
  updated: "2026-03",
  contact: [
    { label: "email", text: "navinkhanal3@gmail.com", href: "mailto:navinkhanal3@gmail.com" },
    { label: "phone", text: "+977 9868265503", href: "tel:+9779868265503" },
    { label: "linkedin", text: "in/navin-nepal", href: "https://www.linkedin.com/in/navin-nepal/" },
    { label: "github", text: "marconn01", href: "https://github.com/marconn01" }
  ],
  skills: [
    { group: "DevOps & Systems", items: ["Ubuntu", "Docker", "GitHub Actions", "Nginx", "Terraform", "Kubernetes", "AWS (EC2, ALB, S3, IAM, CloudWatch, ECR, SQS)"] },
    { group: "Backend & APIs", items: ["Python", "FastAPI", "Django"] },
    { group: "Databases", items: ["PostgreSQL", "SQLite3"] },
    { group: "ML & Data", items: ["PyTorch", "OpenCV", "NumPy"] },
    { group: "Version control", items: ["Git"] }
  ],
  experience: [
    {
      role: "DevOps Intern",
      org: "Verisk",
      period: "Oct 2025 – Jan 2026",
      tags: "DevOps · CI/CD · Containers",
      stack: ["AWS", "Docker", "Linux", "GitHub Workflows", "Terraform"],
      points: [
        "Designed and maintained CI/CD pipelines using GitHub Actions, automating build, test, and deployment workflows.",
        "Deployed load-balanced applications on AWS EC2 with ALB, configuring health checks and traffic routing for high availability.",
        "Implemented zero-downtime deployment strategies including blue-green deployments and rollback mechanisms.",
        "Containerized backend and frontend services using Docker and Docker Compose, integrating Nginx as a reverse proxy for request routing.",
        "Provisioned and managed AWS infrastructure using Terraform, including compute, networking, IAM roles, and security groups."
      ]
    }
  ],
  projects: [
    {
      name: "Cloud-Native Scalable Weather Platform",
      subtitle: "Event-driven distributed system",
      link: { text: "github.com/marconn01/Verisk_Internship", href: "https://github.com/marconn01/Verisk_Internship" },
      stack: ["AWS", "CI/CD", "Docker", "EC2", "ECR", "S3", "Linux", "Terraform"],
      points: [
        "Designed and deployed a production-grade, scalable cloud-native application using Dockerized services on AWS EC2 with ALB-based traffic distribution.",
        "Implemented Infrastructure as Code with Terraform to provision EC2, ALB, IAM roles, and networking components reproducibly.",
        "Built a fully automated CI/CD pipeline with GitHub Actions and Amazon ECR for image build, versioning, and deployment, using blue-green deployment for zero downtime.",
        "Designed an event-driven, fault-tolerant data pipeline using Amazon SQS with decoupled producer and consumer services.",
        "Implemented observability and reliability practices using CloudWatch logs, metrics, automatic health checks, and SNS-based alerting."
      ]
    },
    {
      name: "Rule-Based Self-Healing Kubernetes Infrastructure",
      subtitle: "Automated failure detection & remediation platform",
      stack: ["Kubernetes", "Prometheus", "Grafana", "Python"],
      points: [
        "Designed a rule-based self-healing system that detects service failures and automatically performs restart, scaling, and rollback actions.",
        "Implemented Prometheus-based control loops using latency, error-rate, and restart metrics to trigger recovery.",
        "Built a Python remediation service integrating with the Kubernetes API, including circuit breakers.",
        "Validated recovery by injecting crashes in a test environment."
      ]
    },
    {
      name: "DataBridges: Backend and Data Analysis",
      subtitle: "Dataset exploration platform",
      link: { text: "github.com/bhattaraisushma", href: "https://github.com/bhattaraisushma" },
      stack: ["FastAPI", "Pandas"],
      points: [
        "Engineered an API to query and retrieve datasets from multiple sources.",
        "Integrated external APIs (data.gov, Canadian Space Agency) to aggregate and display datasets on a single platform.",
        "Performed exploratory data analysis (EDA) to assess dataset suitability for a Geographic Information System (GIS) application.",
        "Structured the system for scalability, stateless services, and environment-based configuration."
      ]
    },
    {
      name: "Realtime Voting System",
      subtitle: "Centralized ledger with manual DB management",
      link: { text: "github.com/marconn01/VotingSystem", href: "https://github.com/marconn01/VotingSystem" },
      stack: ["Python", "Django", "SQLite3"],
      points: [
        "Developed a real-time voting system with Django and SQLite3.",
        "Implemented a centralized ledger with vote hashing for record integrity.",
        "Automated election start/end with Django admin and scheduled tasks.",
        "Designed a scalable architecture with role-based access."
      ]
    },
    {
      name: "Fabric Flow",
      subtitle: "Real-time 2D cloth simulation",
      link: { text: "demo video", href: "https://www.youtube.com/watch?v=mA_7RsT82rw" },
      stack: ["Python", "PyOpenGL", "Pygame", "NumPy", "Multithreading"],
      points: [
        "Developed a real-time 2D cloth simulation engine using Verlet integration and constraint-based physics.",
        "Implemented interactive features like stretching, tearing, sphere collisions, wind flow, and multi-planet gravity.",
        "Optimized performance with multithreaded constraint solving and adaptive timesteps for smooth simulation."
      ]
    }
  ],
  activities: [
    {
      role: "Volunteer",
      org: "GDG Kathmandu",
      period: "2024 – present",
      points: [
        "Assisted in managing and curating content for GDG Kathmandu's social media platforms.",
        "Promoted upcoming events and meetups, increasing community engagement.",
        "Handled event backend and execution."
      ]
    },
    {
      role: "Technical Lead",
      org: "Thapathali Literature Club, Thapathali Campus",
      period: "2023 – 2024",
      points: [
        "Handled all technical aspects along with event logistics and digital promotions.",
        "Designed the official club magazine: layout, visual design, and digital formatting.",
        "Initiated the club's official website to strengthen its digital presence."
      ]
    },
    {
      role: "President",
      org: "IT Club, SOS Hermann Gmeiner School",
      period: "2016 – 2017",
      points: [
        "Led the IT Club in organizing tech-related extracurricular events.",
        "Facilitated student engagement in technology through presentations.",
        "Won Best Demonstration at the Parents' Meet."
      ]
    }
  ],
  education: [
    {
      school: "Tribhuvan University",
      degree: "Bachelor of Engineering in Computer Engineering",
      period: "Apr 2022 – present",
      place: "Nepal"
    }
  ],
  certifications: [
    "MicroDegree™ in AI, Fusemachines Fellowship",
    "Galactic Problem Solver, NASA Space Apps 2023",
    "Winner, Concept Catalyst Ideathon, IEEE Computer Society Pulchowk Student Branch",
    "CS50P: Introduction to Programming with Python"
  ]
};
