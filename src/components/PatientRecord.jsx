import { useState } from "react";
import Layout from "./Layout";

const MOCK_PATIENTS = [
  { id: "00001", name: "John Doe", lastVisit: "01/01/2026", clinician: "Student Clinician, Doe, Jane" },
];
const ROWS = 7;

export default function PatientRecord({
  onNavigate,
  patients = MOCK_PATIENTS,
  onViewRecords = () => {},
  onAddPatient = () => {},
  isSyncing = false,
  currentUser,
  onSignOut,
}) {
  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    email: "",
    phone: "",
    clinician: currentUser?.role === "Student Clinician" ? "Student Clinician, Doe, Jane" : (currentUser?.email || "Attending Faculty"),
    procedure: "Dental Examination & Charting",
    notes: "",
  });

  const filtered = patients.filter((p) =>
    `${p.shortId || p.id} ${p.name} ${p.clinician || ""}`.toLowerCase().includes(query.toLowerCase())
  );
  const blanks = Math.max(0, ROWS - filtered.length);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newPatient.name.trim()) return;
    onAddPatient({
      ...newPatient,
      lastVisit: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
    });
    setShowAddModal(false);
    setNewPatient({
      name: "",
      email: "",
      phone: "",
      clinician: currentUser?.role === "Student Clinician" ? "Student Clinician, Doe, Jane" : (currentUser?.email || "Attending Faculty"),
      procedure: "Dental Examination & Charting",
      notes: "",
    });
  };

  return (
    <Layout
      active="patients"
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
              placeholder="Search patients by name or ID..."
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
            + Add Patient
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
              <th>Patient ID</th>
              <th>Name</th>
              <th>Last Visit (MM/DD/YYYY)</th>
              <th>Attending Clinician</th>
              <th style={{ textAlign: "right", paddingRight: "20px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td style={{ fontFamily: "monospace", fontSize: "12.5px", color: "#0f172a" }}>
                  {p.shortId || (typeof p.id === "string" && p.id.length > 8 ? p.id.slice(0, 8).toUpperCase() : p.id)}
                </td>
                <td style={{ fontWeight: 600, color: "#1e293b" }}>{p.name}</td>
                <td>{p.lastVisit}</td>
                <td>{p.clinician}</td>
                <td style={{ textAlign: "right", paddingRight: "20px" }}>
                  <button className="table__action" onClick={() => onViewRecords(p)}>
                    View Records
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

      {/* Add Patient Modal Styled Like Login Screen */}
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
                    <rect x="3" y="7" width="18" height="13" rx="2" />
                    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="12" y1="11" x2="12" y2="15" />
                    <line x1="10" y1="13" x2="14" y2="13" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800" }}>
                    Add Patient Record
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
                    placeholder="e.g. John Doe"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
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
                      Email Address
                    </label>
                    <input
                      type="email"
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
                      placeholder="patient@ceu.edu.ph"
                      value={newPatient.email}
                      onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
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
                      Phone Number
                    </label>
                    <input
                      type="tel"
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
                      placeholder="(09) 123-4567"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
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
                    value={newPatient.clinician}
                    onChange={(e) => setNewPatient({ ...newPatient, clinician: e.target.value })}
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
                    Procedure / Treatment Plan
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
                    value={newPatient.procedure}
                    onChange={(e) => setNewPatient({ ...newPatient, procedure: e.target.value })}
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
                    Medical History & Clinical Notes
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
                    placeholder="Allergies, alerts, restorative charting notes..."
                    value={newPatient.notes}
                    onChange={(e) => setNewPatient({ ...newPatient, notes: e.target.value })}
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
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
