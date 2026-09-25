import { useState } from "react";
import Layout from "./Layout";

const MOCK_PENDING = [
  { id: "00001", name: "John Doe", visitDate: "01/01/2026", clinician: "Student Clinician, Doe, Jane" },
];
const ROWS = 7;

export default function PendingApproval({
  onNavigate,
  pending = MOCK_PENDING,
  onReview = () => {},
  onApprove = () => {},
  onDecline = () => {},
  onAddPending = () => {},
  isSyncing = false,
  currentUser,
  onSignOut,
}) {
  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    id: "REQ-1082",
    name: "",
    visitDate: "01/01/2026",
    clinician: currentUser?.role === "Student Clinician" ? "Student Clinician, Doe, Jane" : (currentUser?.email || "Staff Clinician"),
    procedure: "Root Canal Therapy #19",
    notes: "Requires attending faculty clinical evaluation and sign-off.",
  });

  const filtered = pending.filter((p) =>
    `${p.id} ${p.name} ${p.clinician || ""}`.toLowerCase().includes(query.toLowerCase())
  );
  const blanks = Math.max(0, ROWS - filtered.length);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    onAddPending({
      ...newItem,
      id: newItem.id.trim() || `REQ-${Date.now().toString().slice(-4)}`,
    });
    setShowAddModal(false);
    setNewItem({
      id: `REQ-${Date.now().toString().slice(-4)}`,
      name: "",
      visitDate: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
      clinician: currentUser?.role === "Student Clinician" ? "Student Clinician, Doe, Jane" : (currentUser?.email || "Staff Clinician"),
      procedure: "Root Canal Therapy #19",
      notes: "Requires attending faculty clinical evaluation and sign-off.",
    });
  };

  return (
    <Layout
      active="approvals"
      onNavigate={onNavigate}
      currentUser={currentUser}
      onSignOut={onSignOut}
    >
      <div className="toolbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div className="search-input-wrapper">
            <svg
              className="search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="pill pill--search"
              placeholder="Search pending approvals..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <button className="pill" type="button">
            Filter by
          </button>

          <button
            className="pill pill--primary"
            type="button"
            onClick={() => setShowAddModal(true)}
          >
            + New Request
          </button>
        </div>

        {isSyncing && (
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#e91e77",
                display: "inline-block",
                animation: "pulse 1.5s infinite",
              }}
            />
            Syncing with Supabase...
          </span>
        )}
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Patient Name</th>
              <th>Visit Date (MM/DD/YYYY)</th>
              <th>Attending Clinician</th>
              <th style={{ textAlign: "right", paddingRight: "20px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td style={{ fontFamily: "monospace", fontSize: "12.5px", color: "#0f172a" }}>
                  {p.id}
                </td>
                <td style={{ fontWeight: 600, color: "#1e293b" }}>{p.name}</td>
                <td>{p.visitDate}</td>
                <td>{p.clinician}</td>
                <td style={{ textAlign: "right", paddingRight: "20px" }}>
                  <button className="table__action" onClick={() => onReview(p)}>
                    Review
                  </button>
                  <button
                    className="table__action table__action--approve"
                    onClick={() => onApprove(p)}
                  >
                    Approve
                  </button>
                  <button
                    className="table__action table__action--decline"
                    onClick={() => onDecline(p)}
                  >
                    Decline
                  </button>
                </td>
              </tr>
            ))}
            {Array.from({ length: blanks }, (_, i) => (
              <tr key={`blank-${i}`}>
                <td colSpan={5} style={{ height: "46px" }} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Request Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              background: "#ffffff",
              borderRadius: "24px",
              boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.2)",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Pink Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #e91e77 0%, #f02a80 100%)",
                padding: "24px",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800" }}>
                    Submit Faculty Approval Request
                  </h3>
                  <p style={{ margin: 0, fontSize: "11px", opacity: 0.9 }}>
                    Escolar Dental Records System
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreate} style={{ padding: "22px 24px" }}>
              <div style={{ display: "grid", gap: "14px", marginBottom: "20px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#334155",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    Patient Full Name *
                  </label>
                  <input
                    style={{
                      width: "100%",
                      height: "44px",
                      padding: "0 14px",
                      background: "#f8fafc",
                      border: "1.5px solid #cbd5e1",
                      borderRadius: "12px",
                      fontSize: "13.5px",
                      color: "#0f172a",
                      outline: "none",
                    }}
                    placeholder="e.g. Luke Skywalker"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#334155",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        marginBottom: "6px",
                      }}
                    >
                      Visit Date
                    </label>
                    <input
                      style={{
                        width: "100%",
                        height: "44px",
                        padding: "0 14px",
                        background: "#f8fafc",
                        border: "1.5px solid #cbd5e1",
                        borderRadius: "12px",
                        fontSize: "13.5px",
                        color: "#0f172a",
                        outline: "none",
                      }}
                      value={newItem.visitDate}
                      onChange={(e) => setNewItem({ ...newItem, visitDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#334155",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        marginBottom: "6px",
                      }}
                    >
                      Attending Clinician
                    </label>
                    <input
                      style={{
                        width: "100%",
                        height: "44px",
                        padding: "0 14px",
                        background: "#f8fafc",
                        border: "1.5px solid #cbd5e1",
                        borderRadius: "12px",
                        fontSize: "13.5px",
                        color: "#0f172a",
                        outline: "none",
                      }}
                      value={newItem.clinician}
                      onChange={(e) => setNewItem({ ...newItem, clinician: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#334155",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    Procedure Description
                  </label>
                  <input
                    style={{
                      width: "100%",
                      height: "44px",
                      padding: "0 14px",
                      background: "#f8fafc",
                      border: "1.5px solid #cbd5e1",
                      borderRadius: "12px",
                      fontSize: "13.5px",
                      color: "#0f172a",
                      outline: "none",
                    }}
                    value={newItem.procedure}
                    onChange={(e) => setNewItem({ ...newItem, procedure: e.target.value })}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#334155",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    Clinical Case Notes & Indication
                  </label>
                  <textarea
                    rows={2}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "#f8fafc",
                      border: "1.5px solid #cbd5e1",
                      borderRadius: "12px",
                      fontSize: "13.5px",
                      color: "#0f172a",
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                    value={newItem.notes}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(135deg, #e91e77 0%, #ec206f 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "10px 22px",
                    borderRadius: "12px",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(233, 30, 119, 0.3)",
                  }}
                >
                  Submit Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
