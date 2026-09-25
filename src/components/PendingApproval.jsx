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
}) {
  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    id: `0000${pending.length + 10}`,
    name: "",
    visitDate: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
    clinician: "Student Clinician, Doe, Jane",
    procedure: "Root Canal Therapy #19",
    notes: "Requires attending supervisor sign-off before proceeding.",
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
      id: newItem.id.trim() || `0000${pending.length + 10}`,
    });
    setShowAddModal(false);
    setNewItem({
      id: `0000${pending.length + 11}`,
      name: "",
      visitDate: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
      clinician: "Student Clinician, Doe, Jane",
      procedure: "Root Canal Therapy #19",
      notes: "Requires attending supervisor sign-off before proceeding.",
    });
  };

  return (
    <Layout active="approvals" onNavigate={onNavigate}>
      <div className="toolbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            className="pill pill--search"
            placeholder="Search Patients"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="pill" type="button">Filter by</button>
          <button
            className="pill"
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{ fontWeight: 600, background: "#ff69b4", color: "#fff", cursor: "pointer" }}
          >
            + New Request
          </button>
        </div>

        {isSyncing && (
          <span style={{ fontSize: "11px", color: "#555", fontStyle: "italic" }}>
            Syncing with Supabase...
          </span>
        )}
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Name</th>
              <th>Visit Date<br />(MM/DD/YYYY)</th>
              <th>Attending Clinician</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.visitDate}</td>
                <td>{p.clinician}</td>
                <td>
                  <button className="table__action" onClick={() => onReview(p)}>Review</button>
                  <button className="table__action" onClick={() => onApprove(p)}>Approve</button>
                  <button className="table__action" onClick={() => onDecline(p)}>Decline</button>
                </td>
              </tr>
            ))}
            {Array.from({ length: blanks }, (_, i) => (
              <tr key={`blank-${i}`}><td colSpan={5} /></tr>
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
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setShowAddModal(false)}
        >
          <form
            onSubmit={handleCreate}
            style={{
              background: "#fff",
              borderRadius: "8px",
              padding: "20px",
              width: "100%",
              maxWidth: "420px",
              border: "2px solid #ff4f9a",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#111" }}>
                Submit Procedure for Faculty Approval
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: 0, fontSize: "18px", cursor: "pointer", fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gap: "10px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, marginBottom: "4px" }}>
                  Patient ID
                </label>
                <input
                  style={{ width: "100%", padding: "6px 10px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "13px" }}
                  value={newItem.id}
                  onChange={(e) => setNewItem({ ...newItem, id: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, marginBottom: "4px" }}>
                  Patient Name *
                </label>
                <input
                  style={{ width: "100%", padding: "6px 10px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "13px" }}
                  placeholder="e.g. Luke Skywalker"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, marginBottom: "4px" }}>
                  Visit Date (MM/DD/YYYY)
                </label>
                <input
                  style={{ width: "100%", padding: "6px 10px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "13px" }}
                  value={newItem.visitDate}
                  onChange={(e) => setNewItem({ ...newItem, visitDate: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, marginBottom: "4px" }}>
                  Attending Clinician
                </label>
                <input
                  style={{ width: "100%", padding: "6px 10px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "13px" }}
                  value={newItem.clinician}
                  onChange={(e) => setNewItem({ ...newItem, clinician: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, marginBottom: "4px" }}>
                  Procedure Description
                </label>
                <input
                  style={{ width: "100%", padding: "6px 10px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "13px" }}
                  value={newItem.procedure}
                  onChange={(e) => setNewItem({ ...newItem, procedure: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, marginBottom: "4px" }}>
                  Clinical Case Notes
                </label>
                <textarea
                  rows={2}
                  style={{ width: "100%", padding: "6px 10px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "13px" }}
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  background: "#eee",
                  border: 0,
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: "#ff69b4",
                  color: "#fff",
                  border: 0,
                  padding: "6px 16px",
                  borderRadius: "999px",
                  fontWeight: 600,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Submit Approval
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
}
