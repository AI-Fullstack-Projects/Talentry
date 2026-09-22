import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Jobs() {
    const [jobs, setJobs] = useState([]);

    const [jobTitle, setJobTitle] = useState("");
    const [jobDescription, setJobDescription] = useState("");

    const [isCreating, setIsCreating] = useState(false);

    const navigate = useNavigate();

    // Refresh the list after every create or delete operation.
    const fetchJobs = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/jobs");

            if (!response.ok) {
                throw new Error("Failed to fetch jobs");
            }

            const data = await response.json();
            setJobs(data);
        } catch {
            // Preserve the current job list when the API is unavailable.
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const createJob = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch("http://127.0.0.1:8000/jobs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: jobTitle,
                    description: jobDescription,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create job");
            }

            setJobTitle("");
            setJobDescription("");
            setIsCreating(false);

            fetchJobs();
        } catch {
            // Keep the form available so the user can retry creation.
        }
    };

    const deleteJob = async (jobId) => {
        try {
            const response = await fetch(
                `http://127.0.0.1:8000/jobs/${jobId}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete job");
            }

            fetchJobs();
        } catch {
            // Leave the current list unchanged when deletion fails.
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Jobs</h1>
                    <p>
                        Create and manage the job descriptions you're hiring for.
                    </p>
                </div>

                <button
                    className="primary-button"
                    onClick={() => setIsCreating(true)}
                >
                    + Create Job
                </button>
            </div>

            {/* The form stays hidden until the user starts creating a job. */}
            {isCreating && (
                <form className="card" onSubmit={createJob}>
                    <h2>Create Job</h2>

                    <input
                        type="text"
                        placeholder="Job title"
                        value={jobTitle}
                        onChange={(event) => setJobTitle(event.target.value)}
                        required
                    />

                    <textarea
                        placeholder="Job description"
                        value={jobDescription}
                        onChange={(event) =>
                            setJobDescription(event.target.value)
                        }
                        required
                    />

                    <div>
                        <button type="submit" className="primary-button">
                            Create
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => setIsCreating(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Each card links to the job detail route for candidate matching. */}
            <div className="jobs-list">
                {jobs.map((job) => (
                    <div className="card" key={job.id}>
                        <h2>{job.title}</h2>

                        <p>{job.description}</p>

                        <div className="card-actions">
                            <button
                                className="secondary-button"
                                onClick={() => navigate(`/jobs/${job.id}`)}
                            >
                                View Job
                            </button>

                            <button
                                className="secondary-button"
                                onClick={() => deleteJob(job.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Jobs;