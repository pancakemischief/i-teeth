import "./Layout.css";

// Six tab slots to match the Figma; empty ones are placeholders for future pages.
const TABS = [
  { key: "patients", label: "Patients Database" },
  { key: "approvals", label: "Pending Approvals" },
  { key: "slot3", label: "" },
  { key: "slot4", label: "" },
  { key: "slot5", label: "" },
  { key: "settings", label: "Settings" },
];

/**
 * Shared shell: top nav + home button.
 * `active`     – key of the current tab
 * `onNavigate` – called with a tab key (wire to react-router / state)
 */
export default function Layout({ active, onNavigate = () => {}, showHome = true, children }) {
  return (
    <div className="screen">
      <nav className="navbar" aria-label="Main">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`navbar__tab ${active === t.key ? "navbar__tab--active" : ""}`}
            onClick={() => t.label && onNavigate(t.key)}
            disabled={!t.label}
            aria-current={active === t.key ? "page" : undefined}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="screen__body">{children}</main>

      {showHome && (
        <button className="home-btn" aria-label="Home" onClick={() => onNavigate("patients")}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 3 2 12h3v8h5v-6h4v6h5v-8h3z" />
          </svg>
        </button>
      )}
    </div>
  );
}
