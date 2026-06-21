from backend.agents.base_agent import BaseAgent
import json

SYSTEM_INSTRUCTION_GENERATOR = """
You are an Interview Recruiter Agent. Your task is to generate 4 mock technical interview questions for a student based on their target role and the missing skills they need to learn.
Focus on testing conceptual understanding and practical implementation challenges.
You must output a valid JSON array of questions:
[
  "Question 1...",
  "Question 2...",
  ...
]

Do not output any markdown formatting, explanation, or code blocks. Return ONLY raw JSON.
"""

SYSTEM_INSTRUCTION_EVALUATOR = """
You are an Interview Evaluator Agent. Your task is to evaluate a student's answer to a technical interview question.
You must output a valid JSON object matching this schema:
{
  "rating": 7,  -- Score from 0 to 10
  "critique": "Detailed explanation of what they did well, what keywords or concepts they missed, and how to improve.",
  "ideal_answer": "A perfect, professional answer to the question that demonstrates senior-level knowledge."
}

Do not output any markdown formatting, explanation, or code blocks. Return ONLY raw JSON.
"""

class InterviewCoachAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Interview Coach Agent")
        
    def generate_questions(self, target_role: str, missing_skills: list, student_profile: dict) -> list:
        self.system_instruction = SYSTEM_INSTRUCTION_GENERATOR
        prompt = f"""
Target Role: {target_role}
Missing Skills: {json.dumps(missing_skills)}
Student Profile: {json.dumps(student_profile)}

Please generate 4 technical interview questions to test the student's knowledge in these areas.
"""
        return self.query_llm_json(prompt)
        
    def evaluate_answer(self, question: str, user_answer: str) -> dict:
        self.system_instruction = SYSTEM_INSTRUCTION_EVALUATOR
        prompt = f"""
Interview Question: {question}
Student's Answer: {user_answer}

Please evaluate the answer, score it out of 10, write constructive feedback, and provide a model answer.
"""
        return self.query_llm_json(prompt)
