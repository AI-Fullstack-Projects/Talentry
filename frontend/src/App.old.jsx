import { useEffect, useState } from "react";

function App() {
  // A component is a JavaScript function that returns the UI it should render.

  // Each state value is the single source of truth for the matching form field.
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobs, setJobs] = useState([]); // Jobs loaded from the backend.

  // These state values store the candidate form data for the resume upload form.
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [resume, setResume] = useState(null); // Holds the selected resume file object.

  // Store all uploaded candidates fetched from the backend.
  const [candidates, setCandidates] = useState([]);

  // Stores the role and compatibility result currently selected for review.
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);

  const [selectedAIProfile, setSelectedAIProfile] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // `fetch` returns a promise, so this function waits for the HTTP response
  // and then converts the JSON response into data React can render.
  const fetchJobs = async () => {
    // `async` allows this function to pause at each `await` until the promise resolves.
    try {
      const response = await fetch("http://127.0.0.1:8000/jobs");

      // A response can exist even when the server returns an HTTP error.
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      setJobs(data); // Re-render the page with the latest jobs.
    } catch {
      // Legacy screen keeps its current jobs when the API is unavailable.
    }
  };

  // Fetch all saved candidates so the page can display them after upload.
  const fetchCandidates = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/candidates");

      if (!response.ok) {
        throw new Error("Failed to fetch candidates");
      }

      const data = await response.json();
      setCandidates(data); // Store the API response in component state.
    } catch {
      // Legacy screen keeps its current candidates when the API is unavailable.
    }
  };

  const analyzeCandidate = async (candidateId) => {
    setIsLoadingAI(true);
    setSelectedAIProfile(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/candidates/${candidateId}/analyze`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to analyze candidate");
      }

      const data = await response.json();

      setSelectedAIProfile(data.ai_profile);
    } catch {
      // Keep the previous profile when analysis fails.
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Compare one candidate with the selected role.
  const fetchCandidateMatch = async (candidateId) => {
    if (!selectedJobId) {
      return;
    }

    setSelectedCandidateId(candidateId);
    setIsLoadingMatch(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/jobs/${selectedJobId}/candidates/${candidateId}/match`
      );

      if (!response.ok) {
        throw new Error("Failed to match candidate");
      }

      const data = await response.json();
      setMatchResult(data);
    } catch {
      // Keep the previous match when compatibility lookup fails.
      setMatchResult(null);
    } finally {
      setIsLoadingMatch(false);
    }
  };

  const handleJobSelection = (e) => {
    setSelectedJobId(e.target.value);
    setSelectedCandidateId(null);
    setMatchResult(null);
  };
  // An empty dependency array means this runs once after the first render.
  useEffect(() => {
    fetchJobs();
    fetchCandidates();
  }, []);

  // Stop the browser's normal form submission, which would reload the page.
  const handleSubmit = async (e) => {
    // `e` is the browser's submit event; its `target` is the submitted form.
    e.preventDefault();

    // Match the JSON shape expected by the JobCreate Pydantic schema.
    const jobData = {
      title: jobTitle,
      description: jobDescription,
    };

    try {
      // POST sends the form data to FastAPI as a JSON request body.
      const response = await fetch("http://127.0.0.1:8000/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        throw new Error("Failed to create job");
      }

      await response.json();

      setJobTitle(""); // Clear the controlled input after a successful save.
      setJobDescription("");

      fetchJobs(); // Reload so the newly created job appears in the list.
    } catch {
      // Leave the form values available for another attempt.
    }
  };

  // Handle the candidate upload form submission.
  const handleCandidateSubmit = async (e) => {
    // `e.preventDefault()` stops the browser from submitting the form normally,
    // which would refresh the page and lose the uploaded file state.
    e.preventDefault();

    // A file must be selected before we can send the request.
    if (!resume) {
      alert("Please select a resume");
      return;
    }

    // `FormData` is the browser API for sending multipart form requests.
    // It can include both string fields and binary file content in the same request.
    const formData = new FormData();

    // These keys must exactly match the parameter names in the FastAPI route.
    formData.append("name", candidateName);
    formData.append("email", candidateEmail);
    formData.append("resume", resume);

    try {
      // We do not set `Content-Type` manually because the browser creates the required
      // `multipart/form-data` boundary automatically for FormData requests.
      const response = await fetch("http://127.0.0.1:8000/candidates", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload candidate");
      }

      await response.json();
      alert("Candidate uploaded successfully!");

      // Clear the controlled inputs after a successful upload.
      setCandidateName("");
      setCandidateEmail("");
      setResume(null);
      fetchCandidates();

      // Reset the file input so the browser clears the selected file visually.
      e.target.reset();
    } catch {
      // Leave the form values available for another upload attempt.
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Talent operations workspace</p>
          <h1>Candidate Intelligence</h1>
          <p className="header-copy">
            Build focused roles, organize applicants, and review resume insights in one place.
          </p>
        </div>
        <div className="header-mark" aria-hidden="true">CI</div>
      </header>

      <section className="workspace-section intro-section">
        <div className="section-heading">
          <p className="section-kicker">01 / Role setup</p>
          <h2>Create Job</h2>
        </div>

        {/* React calls handleSubmit when the user submits this form. */}
        <form className="form-panel" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="job-title">Job Title</label>
            <input
              id="job-title"
              type="text"
              value={jobTitle}
              /* Update React state on every keystroke. */
              onChange={(e) => setJobTitle(e.target.value)}
              required
              placeholder="e.g. Senior Product Designer"
            />
          </div>

          <div className="field-group">
            <label htmlFor="job-description">Job Description</label>
            <textarea
              id="job-description"
              value={jobDescription}
              /* The textarea follows the same controlled-input pattern. */
              onChange={(e) => setJobDescription(e.target.value)}
              rows="8"
              required
              placeholder="Describe the role, responsibilities, and what success looks like."
            />
          </div>

          <button className="primary-button" type="submit">Create Job <span aria-hidden="true">+</span></button>
        </form>
      </section>

      <section className="workspace-section">
        <div className="section-heading section-heading-inline">
          <div>
            <p className="section-kicker">02 / Open roles</p>
            <h2>Existing Jobs</h2>
          </div>
          <span className="section-count">{jobs.length} {jobs.length === 1 ? "role" : "roles"}</span>
        </div>

        {jobs.length === 0 ? (
          <p className="empty-state">No jobs found. Create your first role above.</p>
        ) : (
          <div className="record-grid">
            {/* map() creates one job card for every object in the jobs array. */}
            {jobs.map((job) => (
              <article className="record-card job-card" key={job.id}>
                <h3>{job.title}</h3>
                <p>{job.description}</p>
                <small>
                  Created: {new Date(job.created_at).toLocaleString()}
                </small>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="workspace-section candidate-section">
        <div className="section-heading">
          <p className="section-kicker">03 / Candidate intake</p>
          <h2>Upload Candidate</h2>
        </div>

        {/* React calls handleCandidateSubmit when this form is submitted. */}
        <form className="form-panel candidate-form" onSubmit={handleCandidateSubmit}>
          <div className="field-group">
            <label htmlFor="candidate-name">Candidate Name</label>
            <input
              id="candidate-name"
              type="text"
              value={candidateName}
              /* Store the candidate name in React state on every keystroke. */
              onChange={(e) => setCandidateName(e.target.value)}
              required
              placeholder="Full name"
            />
          </div>

          <div className="field-group">
            <label htmlFor="candidate-email">Candidate Email</label>
            <input
              id="candidate-email"
              type="email"
              value={candidateEmail}
              /* Store the candidate email in React state. */
              onChange={(e) => setCandidateEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>

          <div className="field-group file-field">
            <label htmlFor="resume">Resume</label>
            <input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              /*
               * File inputs are special because they expose the chosen file through
               * the browser's `files` array. We store the first selected file here.
               */
              onChange={(e) => setResume(e.target.files[0])}
              required
            />
          </div>

          <button className="primary-button" type="submit">Upload Candidate <span aria-hidden="true">↑</span></button>
        </form>
      </section>

      <section className="workspace-section">
        <div className="section-heading section-heading-inline">
          <div>
            <p className="section-kicker">04 / Talent pool</p>
            <h2>Uploaded Candidates</h2>
          </div>
          <span className="section-count">{candidates.length} {candidates.length === 1 ? "candidate" : "candidates"}</span>
        </div>

        {candidates.length === 0 ? (
          <p className="empty-state">No candidates found. Upload a resume to begin reviewing talent.</p>
        ) : (
          <div className="record-grid candidate-grid">
            {/* map() creates one card per candidate received from the backend. */}
            {candidates.map((candidate) => (
              <article className="record-card candidate-card" key={candidate.id}>
                <h3>{candidate.name}</h3>

                <p>
                  Email: {candidate.email || "Not provided"}
                </p>

                <p>
                  Resume: {candidate.resume_filename}
                </p>

                <small>
                  Uploaded:{" "}
                  {new Date(candidate.created_at).toLocaleString()}
                </small>

                <div className="card-action">
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={isLoadingAI}
                    onClick={() => analyzeCandidate(candidate.id)}
                  >
                    {isLoadingAI
                      ? "Analyzing..."
                      : "Analyze with AI"}
                  </button>

                  <button
                    className="secondary-button"
                    type="button"
                    disabled={!selectedJobId || isLoadingMatch}
                    onClick={() => fetchCandidateMatch(candidate.id)}
                  >
                    {isLoadingMatch && selectedCandidateId === candidate.id
                      ? "Matching..."
                      : "Check compatibility"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="workspace-section">
        <div className="section-heading section-heading-inline">
          <div>
            <p className="section-kicker">05 / AI insights</p>
            <h2>Candidate AI Profile</h2>
          </div>
        </div>

        {isLoadingAI ? (
          <p className="empty-state">
            Analyzing resume with AI...
          </p>
        ) : selectedAIProfile ? (
          <div className="candidate-details">
            <div>
              <span className="skill-heading">Summary</span>
              <p>{selectedAIProfile.summary}</p>
            </div>

            <div className="skill-groups">
              <div>
                <span className="skill-heading">
                  Skills
                </span>

                <p>
                  {selectedAIProfile.skills.length
                    ? selectedAIProfile.skills.join(", ")
                    : "No skills detected"}
                </p>
              </div>

              <div>
                <span className="skill-heading">
                  Years of Experience
                </span>

                <p>
                  {selectedAIProfile.years_of_experience ??
                    "Not specified"}
                </p>
              </div>
            </div>

            <div className="skill-groups">
              <div>
                <span className="skill-heading">
                  Education
                </span>

                {selectedAIProfile.education.length ? (
                  selectedAIProfile.education.map((education, index) => (
                    <p key={index}>
                      <strong>{education.degree}</strong>
                      <br />
                      {education.institution}
                      {education.graduation_year
                        ? ` — ${education.graduation_year}`
                        : ""}
                    </p>
                  ))
                ) : (
                  <p>No education information detected.</p>
                )}
              </div>

              <div>
                <span className="skill-heading">
                  Experience
                </span>

                {selectedAIProfile.experience.length ? (
                  selectedAIProfile.experience.map((experience, index) => (
                    <p key={index}>
                      <strong>{experience.role}</strong>
                      <br />
                      {experience.company}
                      <br />
                      {experience.start_year ?? "?"}
                      {" - "}
                      {experience.end_year ?? "Present"}
                    </p>
                  ))
                ) : (
                  <p>No experience information detected.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="empty-state">
            Select "Analyze with AI" on a candidate to generate their AI profile.
          </p>
        )}
      </section>
      <section className="workspace-section details-section">
        <div className="section-heading section-heading-inline">
          <div>
            <p className="section-kicker">06 / Compatibility</p>
            <h2>Candidate compatibility</h2>
          </div>
          <span className="section-count">{candidates.length} available</span>
        </div>

        {candidates.length === 0 ? (
          <p className="empty-state">Upload a candidate to calculate compatibility.</p>
        ) : jobs.length === 0 ? (
          <p className="empty-state">Create a job before checking candidate compatibility.</p>
        ) : (
          <div className="compatibility-layout">
            <div className="compatibility-list">
              <label className="compatibility-label" htmlFor="match-job">
                Match candidates against
              </label>
              <select
                id="match-job"
                className="job-selector"
                value={selectedJobId}
                onChange={handleJobSelection}
              >
                <option value="">Select a job</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>

              <div className="compatibility-candidates">
                {candidates.map((candidate) => (
                  <button
                    className={`candidate-select ${selectedCandidateId === candidate.id ? "is-selected" : ""}`}
                    key={candidate.id}
                    type="button"
                    disabled={!selectedJobId || isLoadingMatch}
                    onClick={() => fetchCandidateMatch(candidate.id)}
                  >
                    <span>{candidate.name}</span>
                    <small>{candidate.resume_filename}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="match-result" aria-live="polite">
              {!selectedJobId ? (
                <p className="match-placeholder">Choose a role, then select a candidate to see the match.</p>
              ) : isLoadingMatch ? (
                <p className="match-placeholder">Calculating compatibility...</p>
              ) : matchResult ? (
                <>
                  <p className="match-overline">Compatibility score</p>
                  <div className="match-score">{matchResult.match_score}%</div>
                  <h3>{matchResult.candidate_name}</h3>
                  <p className="match-role">Matched against {matchResult.job_title}</p>
                  <div className="skill-groups">
                    <div>
                      <span className="skill-heading">Matched skills</span>
                      <p>{matchResult.matched_skills.length ? matchResult.matched_skills.join(", ") : "No matching skills found"}</p>
                    </div>
                    <div>
                      <span className="skill-heading">Skills to explore</span>
                      <p>{matchResult.missing_skills.length ? matchResult.missing_skills.join(", ") : "No gaps detected"}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="match-placeholder">Select a candidate to calculate their compatibility.</p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;