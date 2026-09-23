from ollama import chat

from schemas import CandidateAIProfile


def analyze_resume(resume_text: str) -> CandidateAIProfile:
    response = chat(
        model="qwen3:8b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a resume analysis assistant. "
                    "Extract factual information from the resume. "
                    "Do not invent information that is not present. "
                    "Return only information supported by the resume."
                ),
                },
                {
                    "role": "user",
                    "content": resume_text,
                },
        ],
        format=CandidateAIProfile.model_json_schema(),
    )

    return CandidateAIProfile.model_validate_json(
        response.message.content
    )