import { NavLink } from "react-router-dom";

function Sidebar() {
  // Retained as a small standalone navigation option for future layouts.
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        Candidate Intelligence
      </div>

      <nav>
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/jobs">Jobs</NavLink>
        <NavLink to="/candidates">Candidates</NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;