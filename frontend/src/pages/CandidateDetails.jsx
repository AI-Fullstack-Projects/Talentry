import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function CandidateDetails() {
    const { candidateId } = useParams();
    const navigate = useNavigate();

    const [candidate, setCandidate] = useState(null);
    const [aiProfile, setAiProfile] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState("");

    // Fetch the candidate profile whenever the route parameter changes.
    const fetchCandidate = async () => {
        try {
            const response = await fetch(
                `http://127.0.0.1:8000/candidates/${candidateId}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch candidate");
            }

            const data = await response.json();

            setCandidate(data);
            setAiProfile(data.ai_profile || null);
        } catch {
            setError("Failed to load candidate.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidate();
    }, [candidateId]);

    const analyzeCandidate = async () => {
        // Analysis replaces the stored profile shown in the detail view.
        setIsAnalyzing(true);
        setError("");

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/candidates/${candidateId}/analyze`,
                {
                    method: "POST",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();

                throw new Error(
                    errorData.detail || "AI analysis failed"
                );
            }

            const data = await response.json();

            setAiProfile(data.ai_profile);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="page">
                <p>Loading candidate...</p>
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className="page">
                <button
                    className="back-button"
                    onClick={() => navigate("/candidates")}
                >
                    ← Back to Candidates
                </button>

                <h1>Candidate not found</h1>
            </div>
        );
    }

    return (
        <div className="page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <button
                        className="back-button"
                        onClick={() =>
                            navigate("/candidates")
                        }
                    >
                        ← Back to Candidates
                    </button>

                    <h1>{candidate.name}</h1>

                    {candidate.email && (
                        <p>{candidate.email}</p>
                    )}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Resume metadata remains available even before AI analysis. */}
            <section className="card">
                <h2>Resume</h2>

                <p>{candidate.resume_filename}</p>
            </section>

            {/* AI profile sections render only after a successful analysis. */}
            <section className="card">
                <div className="section-header">
                    <div>
                        <h2>AI Profile</h2>

                        <p>
                            Information extracted from the
                            candidate's resume using AI.
                        </p>
                    </div>

                    <button
                        className="primary-button"
                        type="button"
                        onClick={analyzeCandidate}
                        disabled={isAnalyzing}
                    >
                        {isAnalyzing
                            ? "Analyzing..."
                            : aiProfile
                              ? "Re-analyze"
                              : "Analyze with AI"}
                    </button>
                </div>

                {!aiProfile ? (
                    <div className="empty-state">
                        <p>
                            This candidate has not been
                            analyzed yet.
                        </p>

                        <p>
                            Click "Analyze with AI" to
                            extract information from the
                            resume.
                        </p>
                    </div>
                ) : (
                    <div className="ai-profile">
                        {/* Summary */}
                        <div className="profile-section">
                            <h3>Summary</h3>

                            <p>
                                {aiProfile.summary}
                            </p>
                        </div>

                        {/* Skills */}
                        <div className="profile-section">
                            <h3>Skills</h3>

                            <div className="skill-list">
                                {aiProfile.skills?.map(
                                    (skill) => (
                                        <span
                                            className="skill-tag"
                                            key={skill}
                                        >
                                            {skill}
                                        </span>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="profile-section">
                            <h3>Experience</h3>

                            {aiProfile.experience?.length >
                            0 ? (
                                aiProfile.experience.map(
                                    (
                                        experience,
                                        index
                                    ) => (
                                        <div
                                            className="experience-item"
                                            key={index}
                                        >
                                            <strong>
                                                {
                                                    experience.role
                                                }
                                            </strong>

                                            <p>
                                                {
                                                    experience.company
                                                }
                                            </p>

                                            <span>
                                                {experience.start_year ??
                                                    "?"}{" "}
                                                -{" "}
                                                {experience.end_year ??
                                                    "Present"}
                                            </span>
                                        </div>
                                    )
                                )
                            ) : (
                                <p>
                                    No experience
                                    information found.
                                </p>
                            )}
                        </div>

                        {/* Education */}
                        <div className="profile-section">
                            <h3>Education</h3>

                            {aiProfile.education?.length >
                            0 ? (
                                aiProfile.education.map(
                                    (
                                        education,
                                        index
                                    ) => (
                                        <div
                                            className="education-item"
                                            key={index}
                                        >
                                            <strong>
                                                {
                                                    education.degree
                                                }
                                            </strong>

                                            <p>
                                                {
                                                    education.institution
                                                }
                                            </p>

                                            {education.graduation_year && (
                                                <span>
                                                    Graduation:{" "}
                                                    {
                                                        education.graduation_year
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    )
                                )
                            ) : (
                                <p>
                                    No education
                                    information found.
                                </p>
                            )}
                        </div>

                        {/* Years of Experience */}
                        <div className="profile-section">
                            <h3>
                                Years of Experience
                            </h3>

                            <p>
                                {aiProfile.years_of_experience ??
                                    "Not available"}
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

export default CandidateDetails;