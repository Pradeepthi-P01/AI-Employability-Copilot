import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "copilot.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Create students table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        skills TEXT,          -- JSON string array
        experience TEXT,      -- JSON representation of experience list
        education TEXT,       -- JSON representation of education list
        certifications TEXT,  -- JSON string array
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Create analyses table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        target_role TEXT NOT NULL,
        employability_score INTEGER,
        score_breakdown TEXT, -- JSON string: { "technical": X, "experience": Y, "projects": Z, "education": W }
        missing_skills TEXT,  -- JSON string array
        roadmap TEXT,         -- JSON string representing milestones
        projects TEXT,        -- JSON string array of recommended projects
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES students(id)
    );
    """)

    # 3. Create interviews table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS interviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        target_role TEXT NOT NULL,
        questions TEXT,       -- JSON string array of questions
        transcript TEXT,      -- JSON string array of Q/A feedback items
        overall_score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES students(id)
    );
    """)

    # 4. Create jobs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT NOT NULL,
        experience_level TEXT,
        required_skills TEXT, -- JSON string array
        description TEXT,
        job_type TEXT DEFAULT 'Full-Time'
    );
    """)

    conn.commit()
    seed_jobs(conn)
    conn.close()

def seed_jobs(conn):
    cursor = conn.cursor()
    # Clear existing jobs to ensure the new non-CS jobs are fully seeded
    cursor.execute("DELETE FROM jobs")
    cursor.execute("DELETE FROM sqlite_sequence WHERE name='jobs'")

    sample_jobs = [
        # Software Engineer Jobs
        {
            "title": "Junior Software Engineer",
            "company": "NextGen Technologies",
            "location": "San Francisco, CA (Hybrid)",
            "experience_level": "Entry Level",
            "required_skills": json.dumps(["Python", "JavaScript", "HTML", "CSS", "Git", "SQL"]),
            "description": "We are looking for a passionate Junior Software Engineer to join our core product team. You will write clean code, participate in code reviews, and build user-facing features.",
            "job_type": "Full-Time"
        },
        {
            "title": "Frontend Developer Intern",
            "company": "PixelPerfect UI",
            "location": "Remote",
            "experience_level": "Internship",
            "required_skills": json.dumps(["React", "JavaScript", "HTML", "CSS", "TypeScript"]),
            "description": "PixelPerfect is seeking a Frontend Intern skilled in React to help build stunning, responsive user interfaces. You will collaborate closely with UI/UX designers.",
            "job_type": "Internship"
        },
        # Data Scientist Jobs
        {
            "title": "Data Scientist Associate",
            "company": "InsightAnalytics Corp",
            "location": "Boston, MA",
            "experience_level": "Entry Level",
            "required_skills": json.dumps(["Python", "SQL", "Pandas", "NumPy", "Scikit-Learn", "Data Visualization"]),
            "description": "Join our analytics division to extract insights from complex transactional data. You will develop predictive models and design A/B test experiments.",
            "job_type": "Full-Time"
        },
        {
            "title": "Data Science Intern",
            "company": "Global Finance Group",
            "location": "New York, NY (Hybrid)",
            "experience_level": "Internship",
            "required_skills": json.dumps(["Python", "SQL", "Pandas", "Matplotlib", "Statistics"]),
            "description": "Assist our quantitative modeling team. You will clean datasets, perform exploratory data analysis (EDA), and prepare summary report presentations.",
            "job_type": "Internship"
        },
        # ML Engineer Jobs
        {
            "title": "Machine Learning Engineer",
            "company": "Aura Intelligence",
            "location": "Seattle, WA (Hybrid)",
            "experience_level": "Entry Level",
            "required_skills": json.dumps(["Python", "PyTorch", "TensorFlow", "Docker", "Machine Learning", "MLOps"]),
            "description": "Help us scale our deep learning models. You will deploy models in production containers, optimize inference latency, and design training pipelines.",
            "job_type": "Full-Time"
        },
        {
            "title": "ML Ops Intern",
            "company": "DeepStream AI",
            "location": "Remote",
            "experience_level": "Internship",
            "required_skills": json.dumps(["Python", "Git", "Docker", "Linux", "MLOps", "CI/CD"]),
            "description": "Learn the ropes of model deployment! Work with our platform engineers to integrate machine learning pipelines with CI/CD systems.",
            "job_type": "Internship"
        },
        # Data Analyst Jobs
        {
            "title": "Business Intelligence Analyst",
            "company": "RetailSync Group",
            "location": "Chicago, IL",
            "experience_level": "Entry Level",
            "required_skills": json.dumps(["SQL", "Tableau", "Excel", "Data Visualization", "Communication"]),
            "description": "Create dashboard solutions that empower our retail managers. You will write complex queries, analyze purchase trends, and present recommendations.",
            "job_type": "Full-Time"
        },
        {
            "title": "Junior Data Analyst",
            "company": "HealthFirst Solutions",
            "location": "Austin, TX (Hybrid)",
            "experience_level": "Entry Level",
            "required_skills": json.dumps(["Python", "SQL", "Excel", "PowerBI"]),
            "description": "Support our healthcare analytics operations by auditing database records, creating clean reports, and maintaining live visualization dashboards.",
            "job_type": "Full-Time"
        },
        # Product Manager Jobs
        {
            "title": "Associate Product Manager",
            "company": "Vanguard Tech Solutions",
            "location": "Boston, MA (Hybrid)",
            "experience_level": "Entry Level",
            "required_skills": json.dumps(["Product Strategy", "Agile", "User Research", "Wireframing", "Roadmapping"]),
            "description": "We are looking for an Associate Product Manager to own product features from concept to launch. You will collaborate with engineering and design to run sprints and user interviews.",
            "job_type": "Full-Time"
        },
        {
            "title": "Product Management Intern",
            "company": "Synergy Workspace",
            "location": "Remote",
            "experience_level": "Internship",
            "required_skills": json.dumps(["Agile", "Scrum", "Jira", "Figma", "User Research"]),
            "description": "Join our core workspace team. You will help gather user requirements, create wireframes, track sprint KPIs, and support product releases.",
            "job_type": "Internship"
        },
        # UX/UI Designer Jobs
        {
            "title": "Junior UX/UI Designer",
            "company": "Studio Canvas Design",
            "location": "New York, NY",
            "experience_level": "Entry Level",
            "required_skills": json.dumps(["Figma", "UX Research", "Wireframing", "Prototyping", "Design Systems"]),
            "description": "Seeking a designer with a strong portfolio of interactive web and mobile concepts. You will construct high-fidelity mockups, visual components, and run user testing.",
            "job_type": "Full-Time"
        },
        {
            "title": "UX Design Intern",
            "company": "EcoLoop Systems",
            "location": "Remote",
            "experience_level": "Internship",
            "required_skills": json.dumps(["Figma", "UX Research", "Prototyping", "User Flows"]),
            "description": "Support the design of our consumer-facing recycling app. Work on user flows, wireframes, and low-fidelity prototypes using Figma.",
            "job_type": "Internship"
        },
        # Digital Marketing Jobs
        {
            "title": "Digital Marketing Specialist",
            "company": "GrowthScale Media",
            "location": "Los Angeles, CA (Hybrid)",
            "experience_level": "Entry Level",
            "required_skills": json.dumps(["SEO", "Google Analytics", "Social Media Marketing", "Content Strategy", "Copywriting"]),
            "description": "Execute search engine optimization audits, organic content distribution campaigns, and run email outreach calendars to grow customer sign-ups.",
            "job_type": "Full-Time"
        },
        {
            "title": "Marketing Analytics Intern",
            "company": "TrendWave Labs",
            "location": "Remote",
            "experience_level": "Internship",
            "required_skills": json.dumps(["Google Analytics", "SEO", "A/B Testing", "Excel", "SQL"]),
            "description": "Track organic user acquisition funnels. You will analyze web traffic metrics, monitor conversion rates, run ad keyword bids, and compile reports.",
            "job_type": "Internship"
        },
        # Financial Analyst Jobs
        {
            "title": "Junior Financial Analyst",
            "company": "Apex Asset Management",
            "location": "Chicago, IL",
            "experience_level": "Entry Level",
            "required_skills": json.dumps(["Excel", "Financial Modeling", "Accounting", "Corporate Finance", "Forecasting"]),
            "description": "Perform valuation analysis, create financial projection models, and assist in compiling investment advisory decks for key clients.",
            "job_type": "Full-Time"
        },
        {
            "title": "Finance Intern",
            "company": "Pacific Bancorp",
            "location": "San Francisco, CA (Hybrid)",
            "experience_level": "Internship",
            "required_skills": json.dumps(["Excel", "Accounting", "Data Analysis", "Tableau"]),
            "description": "Assist our corporate audit team. Perform transaction matching, auditing reports, and help construct financial dashboards in Tableau.",
            "job_type": "Internship"
        }
    ]

    for job in sample_jobs:
        cursor.execute("""
        INSERT INTO jobs (title, company, location, experience_level, required_skills, description, job_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (job["title"], job["company"], job["location"], job["experience_level"], job["required_skills"], job["description"], job["job_type"]))
    
    conn.commit()

# CRUD Functions
def save_student(name, email, phone, skills, experience, education, certifications):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO students (name, email, phone, skills, experience, education, certifications)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        name,
        email,
        phone,
        json.dumps(skills),
        json.dumps(experience),
        json.dumps(education),
        json.dumps(certifications)
    ))
    student_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return student_id

def get_student(student_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "phone": row["phone"],
        "skills": json.loads(row["skills"]),
        "experience": json.loads(row["experience"]),
        "education": json.loads(row["education"]),
        "certifications": json.loads(row["certifications"])
    }

def save_analysis(student_id, target_role, score, breakdown, missing_skills, roadmap, projects):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO analyses (student_id, target_role, employability_score, score_breakdown, missing_skills, roadmap, projects)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        student_id,
        target_role,
        score,
        json.dumps(breakdown),
        json.dumps(missing_skills),
        json.dumps(roadmap),
        json.dumps(projects)
    ))
    conn.commit()
    conn.close()

def get_latest_analysis(student_id, target_role=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if target_role:
        cursor.execute("""
        SELECT * FROM analyses 
        WHERE student_id = ? AND target_role = ? 
        ORDER BY created_at DESC LIMIT 1
        """, (student_id, target_role))
    else:
        cursor.execute("""
        SELECT * FROM analyses 
        WHERE student_id = ? 
        ORDER BY created_at DESC LIMIT 1
        """, (student_id,))
        
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    
    return {
        "id": row["id"],
        "student_id": row["student_id"],
        "target_role": row["target_role"],
        "employability_score": row["employability_score"],
        "score_breakdown": json.loads(row["score_breakdown"]),
        "missing_skills": json.loads(row["missing_skills"]),
        "roadmap": json.loads(row["roadmap"]),
        "projects": json.loads(row["projects"]),
        "created_at": row["created_at"]
    }

def save_interview(student_id, target_role, questions, transcript, overall_score):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO interviews (student_id, target_role, questions, transcript, overall_score)
    VALUES (?, ?, ?, ?, ?)
    """, (
        student_id,
        target_role,
        json.dumps(questions),
        json.dumps(transcript),
        overall_score
    ))
    interview_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return interview_id

def update_interview(interview_id, transcript, overall_score):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE interviews 
    SET transcript = ?, overall_score = ?
    WHERE id = ?
    """, (
        json.dumps(transcript),
        overall_score,
        interview_id
    ))
    conn.commit()
    conn.close()


def get_interview(interview_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM interviews WHERE id = ?", (interview_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id": row["id"],
        "student_id": row["student_id"],
        "target_role": row["target_role"],
        "questions": json.loads(row["questions"]),
        "transcript": json.loads(row["transcript"]),
        "overall_score": row["overall_score"],
        "created_at": row["created_at"]
    }

def get_all_jobs():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs")
    rows = cursor.fetchall()
    conn.close()
    jobs_list = []
    for r in rows:
        jobs_list.append({
            "id": r["id"],
            "title": r["title"],
            "company": r["company"],
            "location": r["location"],
            "experience_level": r["experience_level"],
            "required_skills": json.loads(r["required_skills"]),
            "description": r["description"],
            "job_type": r["job_type"]
        })
    return jobs_list
