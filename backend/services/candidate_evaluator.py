from ollama import chat

from schemas import CandidateAIProfile, CandidateEvaluation


def evaluate_candidate(
    job_description: str,
    candidate_profile: CandidateAIProfile,
) -> CandidateEvaluation:

    prompt = f"""
Evaluate this candidate against the job description.

JOB DESCRIPTION:
{job_description}

CANDIDATE PROFILE:
{candidate_profile.model_dump_json(indent=2)}

Rules:
- Base the evaluation only on the information provided.
- Do not invent experience or skills.
- Identify concrete strengths and gaps.
- For each important requirement, provide supporting evidence from the candidate profile.
- Return only the requested structured output.
"""

    response = chat(
        model="qwen3:8b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a candidate evaluation assistant. "
                    "Evaluate candidates against job requirements "
                    "using only the provided information."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        format=CandidateEvaluation.model_json_schema(),
    )

    return CandidateEvaluation.model_validate_json(
        response.message.content
    )