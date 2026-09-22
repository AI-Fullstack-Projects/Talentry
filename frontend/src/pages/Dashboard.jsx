import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Dashboard metrics come from both collections, so load them together.
    const fetchDashboardData = async () => {
      try {
        const [jobsResponse, candidatesResponse] =
          await Promise.all([
            fetch("http://127.0.0.1:8000/jobs"),
            fetch("http://127.0.0.1:8000/candidates"),
          ]);

        if (!jobsResponse.ok || !candidatesResponse.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const jobsData = await jobsResponse.json();
        const candidatesData =
          await candidatesResponse.json();

        setJobs(jobsData);
        setCandidates(candidatesData);
      } catch {
        // Keep the dashboard empty and let the loading state finish gracefully.
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const analyzedCandidates = candidates.filter(
    (candidate) => candidate.ai_profile
  ).length;

  if (isLoading) {
    return (
      <div className="page">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>

          <p>
            Overview of your candidate intelligence
            workspace.
          </p>
        </div>
      </div>

      {/* Summary metrics provide a quick view of workspace activity. */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">
            Total Jobs
          </span>

          <strong className="stat-value">
            {jobs.length}
          </strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">
            Total Candidates
          </span>

          <strong className="stat-value">
            {candidates.length}
          </strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">
            AI Analyzed
          </span>

          <strong className="stat-value">
            {analyzedCandidates}
          </strong>
        </div>
      </div>

      {/* Recent jobs are limited to five to keep the overview scannable. */}
      <section className="card">
        <div className="section-header">
          <div>
            <h2>Jobs</h2>

            <p>
              Your recently created job descriptions.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() => navigate("/jobs")}
          >
            View All
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="empty-state">
            <p>No jobs created yet.</p>

            <button
              className="primary-button"
              onClick={() => navigate("/jobs")}
            >
              Create a Job
            </button>
          </div>
        ) : (
          <div className="dashboard-list">
            {jobs.slice(0, 5).map((job) => (
              <div
                className="dashboard-list-item"
                key={job.id}
              >
                <div>
                  <h3>{job.title}</h3>

                  <p>
                    {job.description.length > 120
                      ? `${job.description.slice(
                          0,
                          120
                        )}...`
                      : job.description}
                  </p>
                </div>

                <button
                  className="secondary-button"
                  onClick={() =>
                    navigate(`/jobs/${job.id}`)
                  }
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent candidates link directly to their detail pages. */}
      <section className="card">
        <div className="section-header">
          <div>
            <h2>Candidates</h2>

            <p>
              Recently added candidates.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() => navigate("/candidates")}
          >
            View All
          </button>
        </div>

        {candidates.length === 0 ? (
          <div className="empty-state">
            <p>No candidates added yet.</p>

            <button
              className="primary-button"
              onClick={() => navigate("/candidates")}
            >
              Add a Candidate
            </button>
          </div>
        ) : (
          <div className="dashboard-list">
            {candidates.slice(0, 5).map((candidate) => (
              <div
                className="dashboard-list-item"
                key={candidate.id}
              >
                <div>
                  <h3>{candidate.name}</h3>

                  <p>
                    {candidate.email ||
                      candidate.resume_filename}
                  </p>
                </div>

                <button
                  className="secondary-button"
                  onClick={() =>
                    navigate(
                      `/candidates/${candidate.id}`
                    )
                  }
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;