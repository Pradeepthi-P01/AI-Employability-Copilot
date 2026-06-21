import sys
import os
import json

# Add parent directory to sys.path so we can import backend packages
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import init_db, save_student, get_student, get_latest_analysis, get_all_jobs
from backend.agents.resume_parser import ResumeParserAgent
from backend.agents.skill_gap import SkillGapAnalyzerAgent
from backend.agents.employability_score import EmployabilityScoringAgent
from backend.agents.roadmap_gen import RoadmapGeneratorAgent
from backend.agents.project_recommender import ProjectRecommenderAgent
from backend.agents.interview_coach import InterviewCoachAgent
from backend.agents.job_matcher import JobMatchingAgent
from backend.config import GEMINI_API_KEY

def test_local_agent_chain():
    print("=== Phase 1: Database Initialization ===")
    init_db()
    print("Database initialized and jobs seeded.")
    
    print("\n=== Phase 2: Seeding Test Student Profile ===")
    mock_student = {
        "name": "Jane Developer",
        "email": "jane.dev@example.com",
        "phone": "+1234567890",
        "skills": ["Python", "SQL", "Git", "HTML", "CSS", "JavaScript", "Pandas"],
        "experience": [
            {
                "company": "Tech Innovations LLC",
                "title": "Software Intern",
                "dates": "June 2025 - August 2025",
                "description": "Assisted in writing python scripts and query optimization for client databases."
            }
        ],
        "education": [
            {
                "institution": "State University",
                "degree": "Bachelor of Science",
                "field_of_study": "Computer Science",
                "dates": "2022 - 2026"
            }
        ],
        "certifications": ["AWS Cloud Practitioner"]
    }
    
    student_id = save_student(
        name=mock_student["name"],
        email=mock_student["email"],
        phone=mock_student["phone"],
        skills=mock_student["skills"],
        experience=mock_student["experience"],
        education=mock_student["education"],
        certifications=mock_student["certifications"]
    )
    print(f"Saved student profile to database. Student ID: {student_id}")
    
    student = get_student(student_id)
    print("Fetched student profile:")
    print(json.dumps(student, indent=2))
    
    # Check if Gemini API key is present
    api_key = GEMINI_API_KEY
    if not api_key:
        print("\n[WARNING] GEMINI_API_KEY environment variable is not set.")
        print("Skipping Gemini API dependent agent tests. Set GEMINI_API_KEY to test them.")
        return
        
    print("\n=== Phase 3: Testing Skill Gap Analyzer Agent ===")
    target_role = "Data Scientist"
    gap_analyzer = SkillGapAnalyzerAgent()
    gap_results = gap_analyzer.analyze(student, target_role)
    print(f"Gap Analysis Results for target role '{target_role}':")
    print(json.dumps(gap_results, indent=2))
    
    print("\n=== Phase 4: Testing Employability Scoring Agent ===")
    scorer = EmployabilityScoringAgent()
    score_results = scorer.calculate(student, target_role, gap_results)
    print("Employability Score Results:")
    print(json.dumps(score_results, indent=2))
    
    print("\n=== Phase 5: Testing Roadmap Generator Agent ===")
    roadmap_gen = RoadmapGeneratorAgent()
    roadmap = roadmap_gen.generate(
        student_skills=student["skills"],
        missing_skills=gap_results.get("missing_skills", []),
        target_role=target_role
    )
    print("Generated Learning Roadmap:")
    print(json.dumps(roadmap[:1], indent=2))  # Display first month
    
    print("\n=== Phase 6: Testing Project Recommender Agent ===")
    recommender = ProjectRecommenderAgent()
    projects = recommender.recommend(
        student_skills=student["skills"],
        missing_skills=gap_results.get("missing_skills", []),
        target_role=target_role
    )
    print("Recommended Projects:")
    print(json.dumps(projects, indent=2))
    
    print("\n=== Phase 7: Testing Job Matching Agent ===")
    jobs = get_all_jobs()
    matcher = JobMatchingAgent()
    matched_jobs = matcher.match(student["skills"], jobs)
    print("Top matched job listing:")
    if matched_jobs:
        print(json.dumps(matched_jobs[0], indent=2))
    else:
        print("No job listings found.")
        
    print("\n=== Phase 8: Testing Interview Coach Agent ===")
    coach = InterviewCoachAgent()
    questions = coach.generate_questions(target_role, gap_results.get("missing_skills", []), student)
    print("Generated Questions:")
    print(json.dumps(questions, indent=2))
    
    if questions:
        print("\nEvaluating sample response for first question...")
        eval_result = coach.evaluate_answer(questions[0], "I use Pandas dataframe.drop() and fillna() to handle them.")
        print("Evaluation feedback:")
        print(json.dumps(eval_result, indent=2))

if __name__ == "__main__":
    test_local_agent_chain()
