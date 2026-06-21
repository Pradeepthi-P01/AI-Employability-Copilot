import json

class JobMatchingAgent:
    def __init__(self):
        self.name = "Job Matching Agent"
        
    def match(self, student_skills: list, jobs: list) -> list:
        """
        Performs skill-based matching between a student's skills and a list of jobs.
        Returns a sorted list of jobs with match details.
        """
        matched_jobs = []
        student_set = set(s.lower() for s in student_skills)
        
        for job in jobs:
            required_skills = job.get("required_skills", [])
            required_set = set(s.lower() for s in required_skills)
            
            if not required_set:
                match_percentage = 50
                matching_skills = []
                missing_skills = []
            else:
                matching_set = student_set.intersection(required_set)
                missing_set = required_set.difference(student_set)
                
                # Case-preserving list restoration
                matching_skills = [s for s in required_skills if s.lower() in matching_set]
                missing_skills = [s for s in required_skills if s.lower() in missing_set]
                
                match_percentage = round((len(matching_skills) / len(required_skills)) * 100)
            
            matched_jobs.append({
                "id": job["id"],
                "title": job["title"],
                "company": job["company"],
                "location": job["location"],
                "experience_level": job["experience_level"],
                "job_type": job["job_type"],
                "description": job["description"],
                "match_percentage": match_percentage,
                "matching_skills": matching_skills,
                "missing_skills": missing_skills
            })
            
        # Sort jobs by match_percentage in descending order
        matched_jobs.sort(key=lambda x: x["match_percentage"], reverse=True)
        return matched_jobs
