import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function JobDetails() {
    const [matchResults, setMatchResults] = useState({});
    const [loadingCandidateId, setLoadingCandidateId] = useState(null);

    const { jobId } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [candidates, setCandidates] = useState([]);

    useEffect(() => {
        // Load the selected job and available candidates for this route.
        const fetchJob = async () => {
            try {
                const response = await fetch(
                    "http://127.0.0.1:8000/jobs"
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch jobs");
                }

                const jobs = await response.json();

                const selectedJob = jobs.find(
                    (job) => job.id === Number(jobId)
                );

                setJob(selectedJob || null);
            } catch {
                // Render the not-found state when the job request fails.
                setJob(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJob();
        fetchCandidates();
    }, [jobId]);
    const fetchCandidates = async () => {
        try {
            const response = await fetch(
                "http://127.0.0.1:8000/candidates"
            );

            if (!response.ok) {
                throw new Error("Failed to fetch candidates");
            }

            const data = await response.json();

            setCandidates(data);
        } catch {
            // Keep the candidate section empty when the API is unavailable.
        }
    };
    const checkCompatibility = async (candidateId) => {
        // Track one request so only its button shows the loading state.
        setLoadingCandidateId(candidateId);

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/jobs/${jobId}/candidates/${candidateId}/match`
            );

            if (!response.ok) {
                throw new Error("Failed to check compatibility");
            }

            const data = await response.json();

            setMatchResults((previousResults) => ({
                ...previousResults,
                [candidateId]: data,
            }));
        } catch {
            // The result remains unchanged so another compatibility check is possible.
        } finally {
            setLoadingCandidateId(null);
        }
    };
    if (isLoading) {
        return (
            <div className="page">
                <p>Loading job...</p>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="page">
                <button
                    className="back-button"
                    onClick={() => navigate("/jobs")}
                >
                    ← Back to Jobs
                </button>

                <h1>Job not found</h1>

                <p>
                    The job you're looking for doesn't exist or may have
                    been deleted.
                </p>
            </div>
        );
    }

    return (
        <div className="page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <button
                        className="back-button"
                        onClick={() => navigate("/jobs")}
                    >
                        ← Back to Jobs
                    </button>

                    <h1>{job.title}</h1>

                    <p>
                        View job requirements and evaluate candidates.
                    </p>
                </div>
            </div>

            {/* Job requirements provide context for the matching actions below. */}
            <section className="card">
                <h2>Job Description</h2>

                <p>{job.description}</p>
            </section>

            {/* Candidates can be opened or compared against this job. */}
            <section className="card">
                <div className="section-header">
                    <div>
                        <h2>Candidates</h2>

                        <p>
                            Candidates available for this job.
                        </p>
                    </div>
                </div>

                {candidates.length === 0 ? (
                    <div className="empty-state">
                        <p>No candidates available.</p>
                    </div>
                ) : (
                    <div className="jobs-list">
                        {candidates.map((candidate) => (
                            <div
                                className="card"
                                key={candidate.id}
                            >
                                <h3>{candidate.name}</h3>

                                {candidate.email && (
                                    <p>{candidate.email}</p>
                                )}

                                {/* Candidate Actions */}
                                <div className="card-actions">
                                    <button
                                        className="secondary-button"
                                        onClick={() =>
                                            navigate(
                                                `/candidates/${candidate.id}`
                                            )
                                        }
                                    >
                                        View Candidate
                                    </button>

                                    <button
                                        className="secondary-button"
                                        onClick={() =>
                                            checkCompatibility(
                                                candidate.id
                                            )
                                        }
                                        disabled={
                                            loadingCandidateId ===
                                            candidate.id
                                        }
                                    >
                                        {loadingCandidateId ===
                                            candidate.id
                                            ? "Checking..."
                                            : "Check Compatibility"}
                                    </button>
                                </div>

                                {/* Compatibility Result */}
                                {matchResults[candidate.id] && (
                                    <div className="match-result">
                                        <h4>
                                            Compatibility:{" "}
                                            {
                                                matchResults[
                                                    candidate.id
                                                ].match_score
                                            }
                                            %
                                        </h4>

                                        <div>
                                            <strong>
                                                Matched Skills
                                            </strong>

                                            {matchResults[
                                                candidate.id
                                            ].matched_skills.map(
                                                (skill) => (
                                                    <span key={skill}>
                                                        ✓ {skill}
                                                    </span>
                                                )
                                            )}
                                        </div>

                                        <div>
                                            <strong>
                                                Missing Skills
                                            </strong>

                                            {matchResults[
                                                candidate.id
                                            ].missing_skills.map(
                                                (skill) => (
                                                    <span key={skill}>
                                                        × {skill}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default JobDetails;