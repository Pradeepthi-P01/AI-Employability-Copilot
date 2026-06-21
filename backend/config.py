import os

# Gemini API Key Setup
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

if not GEMINI_API_KEY:
    try:
        # Check backend/.env
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                for line in f:
                    if line.strip().startswith("GEMINI_API_KEY="):
                        GEMINI_API_KEY = line.strip().split("=", 1)[1].strip().strip('"').strip("'")
                        break
        # Check root/.env as fallback
        if not GEMINI_API_KEY:
            root_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
            if os.path.exists(root_env_path):
                with open(root_env_path, "r") as f:
                    for line in f:
                        if line.strip().startswith("GEMINI_API_KEY="):
                            GEMINI_API_KEY = line.strip().split("=", 1)[1].strip().strip('"').strip("'")
                            break
    except Exception:
        pass

# Standard benchmark skills for target roles
ROLE_BENCHMARKS = {
    "Software Engineer": {
        "technical_skills": [
            "Python", "JavaScript", "HTML", "CSS", "SQL", "Git", "Docker", "React", "Node.js", 
            "REST APIs", "CI/CD", "Data Structures", "Algorithms", "TypeScript", "Linux"
        ],
        "core_requirements": "Requires strong foundation in general software development, web frameworks, version control, and system architecture."
    },
    "ML Engineer": {
        "technical_skills": [
            "Python", "SQL", "Git", "Docker", "PyTorch", "TensorFlow", "Scikit-Learn", "NumPy", 
            "Pandas", "MLOps", "Machine Learning", "Deep Learning", "Statistics", "Linear Algebra", "Linux"
        ],
        "core_requirements": "Requires deep understanding of ML models, training pipelines, model packaging, deploying models using Docker, and quantitative math."
    },
    "Data Scientist": {
        "technical_skills": [
            "Python", "SQL", "Pandas", "NumPy", "Scikit-Learn", "Statistics", "Data Visualization", 
            "Matplotlib", "Seaborn", "Machine Learning", "Tableau", "Excel", "A/B Testing", "R"
        ],
        "core_requirements": "Requires analytical reasoning, data wrangling, scientific modeling, reporting, and statistical inference."
    },
    "Data Analyst": {
        "technical_skills": [
            "SQL", "Excel", "Tableau", "PowerBI", "Python", "Pandas", "Data Visualization", 
            "Communication", "Statistics", "Business Intelligence"
        ],
        "core_requirements": "Requires querying databases, building dashboards, and extracting business insights for stakeholders."
    },
    "Product Manager": {
        "technical_skills": [
            "Product Strategy", "Agile", "Scrum", "User Research", "Wireframing", "Roadmapping", 
            "Jira", "Figma", "Data Analytics", "SQL", "A/B Testing", "KPI Tracking"
        ],
        "core_requirements": "Requires understanding of product lifecycle, agile methodologies, user feedback analysis, cross-functional leadership, and defining product roadmaps."
    },
    "UX/UI Designer": {
        "technical_skills": [
            "Figma", "Sketch", "UX Research", "Wireframing", "Prototyping", "User Flows", 
            "Information Architecture", "Visual Design", "Design Systems", "HTML", "CSS", "Interaction Design"
        ],
        "core_requirements": "Requires expert knowledge of wireframing and high-fidelity prototyping, visual design standards, user-centric research, and building intuitive design systems."
    },
    "Digital Marketing Specialist": {
        "technical_skills": [
            "SEO", "SEM", "Google Analytics", "Social Media Marketing", "Content Strategy", 
            "Email Marketing", "Copywriting", "A/B Testing", "AdWords", "Canva", "SQL"
        ],
        "core_requirements": "Requires knowledge of search engine optimization, content creation, ad campaign tracking, data-driven optimization, and analytics tools like Google Analytics."
    },
    "Financial Analyst": {
        "technical_skills": [
            "Excel", "Financial Modeling", "Valuations", "Accounting", "Corporate Finance", 
            "SQL", "Python", "PowerBI", "Data Analysis", "Tableau", "Forecasting"
        ],
        "core_requirements": "Requires strong quantitative aptitude, financial statement analysis, spreadsheet modeling, business valuations, and dashboard reporting."
    }
}
