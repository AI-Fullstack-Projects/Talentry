import { NavLink, Outlet } from "react-router-dom";

function AppLayout() {
    return (
        /* Keep navigation mounted while the outlet swaps between routes. */
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">CI</div>

                    <div>
                        <h1>Candidate</h1>
                        <span>Intelligence</span>
                    </div>
                </div>

                {/* NavLink supplies the active state used by the sidebar CSS. */}
                <nav className="sidebar-nav">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `nav-link ${isActive ? "active" : ""}`
                        }
                    >
                        <span>⌂</span>
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/jobs"
                        className={({ isActive }) =>
                            `nav-link ${isActive ? "active" : ""}`
                        }
                    >
                        <span>▣</span>
                        Jobs
                    </NavLink>

                    <NavLink
                        to="/candidates"
                        className={({ isActive }) =>
                            `nav-link ${isActive ? "active" : ""}`
                        }
                    >
                        <span>♙</span>
                        Candidates
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <span>Candidate Intelligence</span>
                    <small>AI recruiting workspace</small>
                </div>
            </aside>

            {/* Child pages render here without duplicating the app chrome. */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}

export default AppLayout;