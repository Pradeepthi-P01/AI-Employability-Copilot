from backend.agents.base_agent import BaseAgent
import json

SYSTEM_INSTRUCTION = """
You are a Project Recommender Agent. Your task is to recommend 2 to 3 tailored portfolio projects for a student based on their current skills and the skill gaps identified for their target role.
Each recommended project must help them bridge their gap by forcing them to learn and implement their missing skills.
You must output a valid JSON array of project objects matching this schema:
[
  {
    "title": "Project Title",
    "difficulty": "Beginner / Intermediate / Advanced",
    "tech_stack": ["Tech 1", "Tech 2", ...],
    "description": "A high-level explanation of the project, why it's useful, and what problem it solves.",
    "steps": [
      "Step 1: Set up the repository and database...",
      "Step 2: Implement the API routes...",
      ...
    ]
  },
  ...
]

Do not suggest standard, generic projects (like simple calculator or to-do apps). Suggest innovative, hackathon-worthy project blueprints that will make the student stand out to employers.
Do not output any markdown formatting, explanation, or code blocks. Return ONLY raw JSON.
"""

class ProjectRecommenderAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Project Recommender Agent",
            system_instruction=SYSTEM_INSTRUCTION
        )
        
    def recommend(self, student_skills: list, missing_skills: list, target_role: str) -> list:
        prompt = f"""
Target Role: {target_role}
Student Current Skills: {json.dumps(student_skills)}
Missing Skills to Learn: {json.dumps(missing_skills)}

Please suggest 2 to 3 outstanding, industry-relevant portfolio projects that will bridge these gaps.
"""
        return self.query_llm_json(prompt)
