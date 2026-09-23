from pydantic import BaseModel


# Pydantic validates incoming JSON before it reaches the route function.
# The same shape is used for both creating and fully updating a job.
class JobCreate(BaseModel):
    # A colon introduces a type annotation; both values must be strings.
    title: str
    description: str

class Education(BaseModel):
    degree: str
    institution: str
    graduation_year: int | None = None


class Experience(BaseModel):
    company: str
    role: str
    start_year: int | None = None
    end_year: int | None = None


class CandidateAIProfile(BaseModel):
    summary: str
    skills: list[str]
    years_of_experience: float | None = None
    education: list[Education]
    experience: list[Experience]

class EvaluationEvidence(BaseModel):
    requirement: str
    evidence: str


class CandidateEvaluation(BaseModel):
    overall_match: int
    strengths: list[str]
    gaps: list[str]
    evidence: list[EvaluationEvidence]
    summary: str