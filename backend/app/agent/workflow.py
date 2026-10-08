from pydantic import BaseModel
from typing import List, Optional, Type, Any
from app.services.llm_service import generate_structured_content
import math

class MCQOption(BaseModel):
    text: str
    is_correct: bool

class MCQ(BaseModel):
    question: str
    options: List[MCQOption]
    explanation: str
    difficulty: str

class MCQResult(BaseModel):
    questions: List[MCQ]

class QuizQuestion(BaseModel):
    question: str
    type: str
    options: Optional[List[str]] = None
    answer: str
    explanation: str

class QuizResult(BaseModel):
    title: str
    questions: List[QuizQuestion]

class AssignmentTask(BaseModel):
    title: str
    description: str
    expected_outcome: str

class AssignmentResult(BaseModel):
    title: str
    instructions: str
    tasks: List[AssignmentTask]

class SummaryResult(BaseModel):
    title: str
    content: str # Can be markdown

class ConceptResult(BaseModel):
    concept: str
    explanation: str # Can be markdown

class QnAResult(BaseModel):
    answer: str
    relevant_excerpt: Optional[str] = None
    key_points: List[str] = []

class ImportantQuestionsResult(BaseModel):
    topic: str
    questions: List[str]
    sample_answers: List[str]

class WorkflowAgent:
    def __init__(self, request_data: dict, task_type: str):
        self.request = request_data
        self.task_type = task_type
        
    def _get_system_prompt(self):
        level = self.request.get("educational_level", "General")
        lang = self.request.get("language", "English")
        
        prompt = f"You are an expert educator. Adapt all content to the '{level}' educational level. Ensure clarity and accuracy."
        if lang and lang != "English":
            prompt += f" MANDATORY: Generate all responses, explanations, questions, and options in {lang} language."
        return prompt

    def generate_mcqs(self) -> MCQResult:
        topic = self.request.get("topic")
        num = self.request.get("num_questions", 5)
        diff = self.request.get("difficulty", "Medium")
        options_cnt = self.request.get("num_options", 4)
        source = self.request.get("source_material", "")
        lang = self.request.get("language", "English")
        
        prompt = f"Generate {num} multiple-choice questions about '{topic}'. Difficulty: {diff}. Each question must have exactly {options_cnt} options. Provide explanations."
        if lang and lang != "English":
            prompt += f" Provide all questions, options, and explanations in {lang}."
        if source:
            prompt += f"\nBase the questions primarily on the following material:\n{source[:8000]}"
            
        return generate_structured_content(prompt, MCQResult, self._get_system_prompt())

    def _generate_quiz_batch(self, topic: str, diff: str, qtype: str, num: int, source: str, lang: str = "English") -> QuizResult:
        prompt = f"Generate {num} '{qtype}' quiz questions about '{topic}'. Difficulty: {diff}. Include the correct answer and a brief explanation."
        if lang and lang != "English":
            prompt += f" Provide all questions, options, answers, and explanations in {lang}."
        if source:
            prompt += f"\nSource material to use:\n{source[:8000]}"
        return generate_structured_content(prompt, QuizResult, self._get_system_prompt())

    def generate_quiz(self) -> QuizResult:
        topic = self.request.get("topic")
        total_num = self.request.get("num_questions", 10)
        diff = self.request.get("difficulty", "Medium")
        qtype = self.request.get("question_type", "MCQ")
        source = self.request.get("source_material", "")
        lang = self.request.get("language", "English")
        
        MAX_BATCH_SIZE = 15
        all_questions = []
        title = f"{topic} Quiz"
        
        batches = math.ceil(total_num / MAX_BATCH_SIZE)
        
        for i in range(batches):
            q_in_batch = min(MAX_BATCH_SIZE, total_num - len(all_questions))
            if q_in_batch <= 0: break
            
            try:
                batch_res = self._generate_quiz_batch(topic, diff, qtype, q_in_batch, source, lang)
                if i == 0:
                    title = batch_res.title
                all_questions.extend(batch_res.questions)
            except Exception as e:
                print(f"Failed to generate batch {i}: {e}")
                break
                
        return QuizResult(title=title, questions=all_questions)
        
    def generate_assignment(self) -> AssignmentResult:
        topic = self.request.get("topic")
        atype = self.request.get("assignment_type", "Essay")
        diff = self.request.get("difficulty", "Medium")
        num = self.request.get("num_tasks", 3)
        obj = self.request.get("learning_objectives", "")
        lang = self.request.get("language", "English")
        
        prompt = f"Create an assignment about '{topic}'. Type: {atype}. Difficulty: {diff}. Number of tasks: {num}. Objectives: {obj}."
        if lang and lang != "English":
            prompt += f" Write the instructions, title, and tasks in {lang}."
        return generate_structured_content(prompt, AssignmentResult, self._get_system_prompt())

    def summarize_topic(self) -> SummaryResult:
        topic = self.request.get("topic")
        length = self.request.get("length", "Medium")
        fmt = self.request.get("format", "Paragraphs")
        source = self.request.get("source_material", "")
        lang = self.request.get("language", "English")
        
        prompt = f"Summarize the topic '{topic}'. Length: {length}. Format: {fmt}."
        if lang and lang != "English":
            prompt += f" Output the entire summary in {lang}."
        if source:
            prompt += f"\nSource material:\n{source[:8000]}"
        return generate_structured_content(prompt, SummaryResult, self._get_system_prompt())

    def explain_concept(self) -> ConceptResult:
        concept = self.request.get("topic")
        style = self.request.get("style", "Simple")
        example = self.request.get("include_example", True)
        lang = self.request.get("language", "English")
        
        prompt = f"Explain the concept '{concept}'. Style: {style}."
        if example:
            prompt += " Include a clear real-world example."
        if lang and lang != "English":
            prompt += f" Output the entire explanation in {lang}."
        return generate_structured_content(prompt, ConceptResult, self._get_system_prompt())

    def ask_document(self) -> QnAResult:
        document_text = self.request.get("document_text", "")
        question = self.request.get("question", "")
        lang = self.request.get("language", "English")

        prompt = f"""You are analyzing the following uploaded study material:
=== DOCUMENT EXCERPT ===
{document_text[:9000]}
========================

User question: {question}

Answer strictly using facts from the document above. Provide the main answer, any relevant excerpt or reference from the text, and key takeaway points."""
        if lang and lang != "English":
            prompt += f" Respond in {lang}."
        return generate_structured_content(prompt, QnAResult, self._get_system_prompt())

    def generate_important_questions(self) -> ImportantQuestionsResult:
        document_text = self.request.get("document_text", "")
        topic = self.request.get("topic", "Uploaded Study Material")
        lang = self.request.get("language", "English")

        prompt = f"""Review the following study material and generate the 5 most important exam/conceptual questions and their answers:
=== DOCUMENT EXCERPT ===
{document_text[:9000]}
========================
Topic: {topic}"""
        if lang and lang != "English":
            prompt += f" Provide all questions and answers in {lang}."
        return generate_structured_content(prompt, ImportantQuestionsResult, self._get_system_prompt())
