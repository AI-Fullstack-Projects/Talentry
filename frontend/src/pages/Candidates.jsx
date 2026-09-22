import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Candidates() {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);

  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [resume, setResume] = useState(null);

  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Reload the collection after a successful resume upload.
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
      // Preserve the current candidate list when the API is unavailable.
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const addCandidate = async (event) => {
    event.preventDefault();

    if (!resume) {
      return;
    }

    setIsUploading(true);

    try {
      // FormData is required because the request includes the resume binary.
      const formData = new FormData();

      formData.append("name", candidateName);
      formData.append("email", candidateEmail);
      formData.append("resume", resume);

      const response = await fetch(
        "http://127.0.0.1:8000/candidates",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload candidate");
      }

      setCandidateName("");
      setCandidateEmail("");
      setResume(null);
      setIsAdding(false);

      await fetchCandidates();
    } catch {
      // Keep the form available so the user can retry the upload.
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Candidates</h1>

          <p>
            Manage candidates and analyze their resumes.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setIsAdding(true)}
        >
          + Add Candidate
        </button>
      </div>

      {/* Add Candidate Form */}
      {isAdding && (
        <form
          className="card"
          onSubmit={addCandidate}
        >
          <h2>Add Candidate</h2>

          <input
            type="text"
            placeholder="Candidate name"
            value={candidateName}
            onChange={(event) =>
              setCandidateName(event.target.value)
            }
            required
          />

          <input
            type="email"
            placeholder="Candidate email"
            value={candidateEmail}
            onChange={(event) =>
              setCandidateEmail(event.target.value)
            }
          />

          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(event) =>
              setResume(event.target.files[0])
            }
            required
          />

          <div className="card-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Add Candidate"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => setIsAdding(false)}
              disabled={isUploading}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Candidate cards link to resume analysis and profile details. */}
      <div className="jobs-list">
        {candidates.length === 0 ? (
          <div className="card">
            <h2>No candidates yet</h2>

            <p>
              Add a candidate to start analyzing resumes.
            </p>
          </div>
        ) : (
          candidates.map((candidate) => (
            <div
              className="card"
              key={candidate.id}
            >
              <h2>{candidate.name}</h2>

              {candidate.email && (
                <p>{candidate.email}</p>
              )}

              <p>
                Resume: {candidate.resume_filename}
              </p>

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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Candidates;