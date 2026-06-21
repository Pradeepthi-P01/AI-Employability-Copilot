from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import json
import logging

from backend.database import (
    init_db, save_student, get_student, save_analysis, 
    get_latest_analysis, save_interview, update_interview, get_interview, get_all_jobs
)
from backend.utils import extract_text_from_pdf
from backend.agents.resume_parser import ResumeParserAgent
from backend.agents.skill_gap import SkillGapAnalyzerAgent
from backend.agents.employability_score import EmployabilityScoringAgent
from backend.agents.roadmap_gen import RoadmapGeneratorAgent
from backend.agents.project_recommender import ProjectRecommenderAgent
from backend.agents.interview_coach import InterviewCoachAgent
from backend.agents.job_matcher import JobMatchingAgent

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize DB on startup
init_db()

app = FastAPI(title="Multi-Agent Employability Copilot API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon, allow all. In production, specify frontend URL.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class GapAnalysisRequest(BaseModel):
    student_id: int
    target_role: str

class InterviewStartRequest(BaseModel):
    student_id: int
    target_role: str

class AnswerSubmitRequest(BaseModel):
    interview_id: int
    question_index: int
    answer: str

# API Routes
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Employability Copilot"}

@app.post("/api/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """
    Endpoint to upload a PDF resume. Extracts text, runs the Parser Agent, 
    and saves the structured profile to SQLite database.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF resumes are supported.")
        
    try:
        pdf_bytes = await file.read()
        raw_text = extract_text_from_pdf(pdf_bytes)
        
        logger.info("Resume text extracted. Starting ResumeParserAgent...")
        parser = ResumeParserAgent()
        parsed_profile = parser.parse(raw_text)
        
        student_id = save_student(
            name=parsed_profile.get("name", "Unknown Student"),
            email=parsed_profile.get("email", ""),
            phone=parsed_profile.get("phone", ""),
            skills=parsed_profile.get("skills", []),
            experience=parsed_profile.get("experience", []),
            education=parsed_profile.get("education", []),
            certifications=parsed_profile.get("certifications", [])
        )
        
        parsed_profile["student_id"] = student_id
        return parsed_profile
    except ValueError as ve:
        logger.error(f"Validation error parsing resume: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"System error parsing resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")

@app.post("/api/analyze-gap")
def analyze_gap(req: GapAnalysisRequest):
    """
    Triggers the multi-agent chain:
    1. Fetches student profile
    2. Runs Skill Gap Analyzer Agent
    3. Runs Employability Scoring Agent
    4. Runs Roadmap Generator Agent
    5. Runs Project Recommender Agent
    6. Saves results in database
    """
    student = get_student(req.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found.")
        
    try:
        logger.info(f"Starting analysis for student {req.student_id} targeting role: {req.target_role}")
        
        # 1. Skill Gap Analyzer
        gap_analyzer = SkillGapAnalyzerAgent()
        gap_results = gap_analyzer.analyze(student, req.target_role)
        
        # 2. Employability Scoring
        scorer = EmployabilityScoringAgent()
        score_results = scorer.calculate(student, req.target_role, gap_results)
        
        # 3. Roadmap Generator
        roadmap_gen = RoadmapGeneratorAgent()
        roadmap = roadmap_gen.generate(
            student_skills=student.get("skills", []),
            missing_skills=gap_results.get("missing_skills", []),
            target_role=req.target_role
        )
        
        # 4. Project Recommender
        recommender = ProjectRecommenderAgent()
        projects = recommender.recommend(
            student_skills=student.get("skills", []),
            missing_skills=gap_results.get("missing_skills", []),
            target_role=req.target_role
        )
        
        # Save analysis to database
        save_analysis(
            student_id=req.student_id,
            target_role=req.target_role,
            score=score_results.get("overall_score", 0),
            breakdown=score_results.get("breakdown", {}),
            missing_skills=gap_results.get("missing_skills", []),
            roadmap=roadmap,
            projects=projects
        )
        
        # Return merged payload
        return {
            "student_id": req.student_id,
            "target_role": req.target_role,
            "employability_score": score_results.get("overall_score", 0),
            "score_breakdown": score_results.get("breakdown", {}),
            "score_rationales": score_results.get("rationales", {}),
            "matching_skills": gap_results.get("matching_skills", []),
            "missing_skills": gap_results.get("missing_skills", []),
            "strengths": gap_results.get("strengths", []),
            "weaknesses": gap_results.get("weaknesses", []),
            "roadmap": roadmap,
            "projects": projects
        }
    except Exception as e:
        logger.error(f"Error executing analysis chain: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/interview/start")
def start_interview(req: InterviewStartRequest):
    """
    Generates tailored questions and initializes an interview session.
    """
    student = get_student(req.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found.")
        
    try:
        # Find missing skills from latest analysis
        analysis = get_latest_analysis(req.student_id, req.target_role)
        missing_skills = analysis.get("missing_skills", []) if analysis else []
        
        logger.info(f"Generating interview questions for student {req.student_id} targeting {req.target_role}")
        coach = InterviewCoachAgent()
        questions = coach.generate_questions(req.target_role, missing_skills, student)
        
        interview_id = save_interview(
            student_id=req.student_id,
            target_role=req.target_role,
            questions=questions,
            transcript=[],
            overall_score=0
        )
        
        return {
            "interview_id": interview_id,
            "questions": questions
        }
    except Exception as e:
        logger.error(f"Failed to start interview: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")

@app.post("/api/interview/submit-answer")
def submit_answer(req: AnswerSubmitRequest):
    """
    Submits user answer to a specific question, evaluates it, logs to DB transcript, and updates score.
    """
    interview = get_interview(req.interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found.")
        
    try:
        questions = interview.get("questions", [])
        if req.question_index < 0 or req.question_index >= len(questions):
            raise HTTPException(status_code=400, detail="Invalid question index.")
            
        question = questions[req.question_index]
        logger.info(f"Evaluating answer for interview {req.interview_id}, Q-Index: {req.question_index}")
        
        coach = InterviewCoachAgent()
        evaluation = coach.evaluate_answer(question, req.answer)
        
        # Update transcript
        transcript = interview.get("transcript", [])
        transcript.append({
            "question_index": req.question_index,
            "question": question,
            "user_answer": req.answer,
            "rating": evaluation.get("rating", 0),
            "critique": evaluation.get("critique", ""),
            "ideal_answer": evaluation.get("ideal_answer", "")
        })
        
        # Calculate updated overall score (average rating * 10 to scale to 100)
        avg_rating = sum(item["rating"] for item in transcript) / len(transcript)
        overall_score = round(avg_rating * 10)
        
        # Save back to database
        update_interview(
            interview_id=req.interview_id,
            transcript=transcript,
            overall_score=overall_score
        )
        
        return {
            "rating": evaluation.get("rating", 0),
            "critique": evaluation.get("critique", ""),
            "ideal_answer": evaluation.get("ideal_answer", ""),
            "overall_score": overall_score
        }
    except Exception as e:
        logger.error(f"Failed to evaluate answer: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

@app.get("/api/jobs")
def get_matched_jobs(student_id: int):
    """
    Performs set-based alignment between the student's current skills and database job listings.
    """
    student = get_student(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found.")
        
    try:
        jobs = get_all_jobs()
        matcher = JobMatchingAgent()
        matched_results = matcher.match(student.get("skills", []), jobs)
        return matched_results
    except Exception as e:
        logger.error(f"Failed to match jobs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Job matching failed: {str(e)}")

# Serve React static assets in production
import os

frontend_dist_path = os.path.join(os.path.dirname(__file__), "frontend", "dist")
if not os.path.exists(frontend_dist_path):
    # Try sibling path if running inside backend/ folder directly
    frontend_dist_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

assets_path = os.path.join(frontend_dist_path, "assets")

if os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

@app.get("/{catchall:path}")
async def serve_react_app(catchall: str):
    # Avoid intercepting API routes
    if catchall.startswith("api"):
        raise HTTPException(status_code=404, detail="API endpoint not found.")
        
    index_file_path = os.path.join(frontend_dist_path, "index.html")
    if os.path.exists(index_file_path):
        return FileResponse(index_file_path)
    return {"message": "Welcome to Employability Copilot API. Frontend build not found."}
