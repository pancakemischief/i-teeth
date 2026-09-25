import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import PatientRecord from "./components/PatientRecord";
import PendingApproval from "./components/PendingApproval";
import Settings from "./components/Settings";
import {
  fetchPatientsFromSupabase,
  fetchPendingFromSupabase,
  savePatientToSupabase,
  savePendingToSupabase,
  approvePendingInSupabase,
  declinePendingInSupabase,
} from "./lib/dentalService";

const DEFAULT_PATIENTS = [
  { id: "00001", name: "John Doe", lastVisit: "01/01/2026", clinician: "Student Clinician, Doe, Jane", procedure: "Biannual Prophylaxis & Bitewing X-Rays" },
  { id: "00002", name: "Sarah Connor", lastVisit: "02/14/2026", clinician: "Dr. Aris Thorne", procedure: "Endodontic Therapy #14" },
  { id: "00003", name: "Marcus Wright", lastVisit: "03/10/2026", clinician: "Student Clinician, Smith, Alex", procedure: "Composite Restoration #30 MOD" },
  { id: "00004", name: "Kyle Reese", lastVisit: "03/18/2026", clinician: "Dr. Emily Chen", procedure: "Gingival Scaling & Root Planing" },
];

const DEFAULT_PENDING = [
  { id: "00001", name: "John Doe", visitDate: "01/01/2026", clinician: "Student Clinician, Doe, Jane", procedure: "Routine Dental Cleaning & Examination", notes: "Patient reports mild sensitivity on lower right quadrant." },
  { id: "00005", name: "Grace Brewster", visitDate: "03/22/2026", clinician: "Student Clinician, Doe, Jane", procedure: "Composite Restoration Tooth #19", notes: "Class II resin restoration required. Supervising faculty sign-off requested." },
  { id: "00006", name: "Arthur Dent", visitDate: "03/24/2026", clinician: "Student Clinician, Smith, Alex", procedure: "Panoramic Radiograph Evaluation", notes: "Full mouth series review for third molar impaction." },
];

function AppRoutes() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState(DEFAULT_PATIENTS);
  const [pending, setPending] = useState(DEFAULT_PENDING);
  const [activeModal, setActiveModal] = useState(null); // { type: 'view' | 'review', item: ... }
  const [notification, setNotification] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification((current) => (current === message ? null : current));
    }, 4000);
  };

  // Load from Supabase on mount
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [patientsRes, pendingRes] = await Promise.all([
          fetchPatientsFromSupabase(),
          fetchPendingFromSupabase(),
        ]);
        if (!active) return;
        if (patientsRes.success && patientsRes.data && patientsRes.data.length > 0) {
          setPatients(patientsRes.data);
        }
        if (pendingRes.success && pendingRes.data && pendingRes.data.length > 0) {
          setPending(pendingRes.data);
        }
      } catch (err) {
        console.warn("Initial Supabase load error:", err);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const refreshFromSupabase = useCallback(async (showNotice = true) => {
    setIsSyncing(true);
    try {
      const [patientsRes, pendingRes] = await Promise.all([
        fetchPatientsFromSupabase(),
        fetchPendingFromSupabase(),
      ]);

      let loadedCount = 0;
      if (patientsRes.success && patientsRes.data && patientsRes.data.length > 0) {
        setPatients(patientsRes.data);
        loadedCount += patientsRes.data.length;
      }

      if (pendingRes.success && pendingRes.data && pendingRes.data.length > 0) {
        setPending(pendingRes.data);
        loadedCount += pendingRes.data.length;
      }

      if (showNotice) {
        if (loadedCount > 0) {
          showToast(`✓ Loaded ${loadedCount} records from Supabase`);
        } else if (!patientsRes.success) {
          showToast("⚡ Supabase ready. Create tables in Supabase SQL editor to persist records.");
        }
      }
    } catch (err) {
      console.warn("Failed fetching from Supabase:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleNavigate = (key) => {
    if (key === "patients") navigate("/patients");
    else if (key === "approvals") navigate("/approvals");
    else if (key === "settings") navigate("/settings");
    else navigate(`/${key}`);
  };

  const handleViewRecords = (patient) => {
    setActiveModal({ type: "view", item: patient });
  };

  const handleReview = (pendingItem) => {
    setActiveModal({ type: "review", item: pendingItem });
  };

  // Write new patient to Supabase
  const handleAddPatient = async (newPatient) => {
    // Optimistic UI update
    setPatients((prev) => [newPatient, ...prev.filter((p) => p.id !== newPatient.id)]);
    showToast(`Saving patient ${newPatient.name} to Supabase...`);

    const res = await savePatientToSupabase(newPatient);
    if (res.success && res.data) {
      setPatients((prev) => [
        res.data,
        ...prev.filter((p) => p.id !== newPatient.id && p.id !== res.data.id),
      ]);
      showToast(`✓ Patient ${newPatient.name} saved to Supabase!`);
    } else if (res.success) {
      showToast(`✓ Patient ${newPatient.name} saved to Supabase!`);
    } else {
      showToast(`Saved locally (${res.error || "Supabase table not initialized"})`);
    }
  };

  // Write new pending request to Supabase
  const handleAddPending = async (newItem) => {
    setPending((prev) => [newItem, ...prev.filter((p) => p.id !== newItem.id)]);
    showToast(`Submitting request for ${newItem.name} to Supabase...`);

    const res = await savePendingToSupabase(newItem);
    if (res.success) {
      showToast(`✓ Approval request for ${newItem.name} saved to Supabase!`);
    } else {
      showToast(`Saved locally (${res.error || "Supabase table not initialized"})`);
    }
  };

  // Approve a pending request
  const handleApprove = async (item) => {
    // Optimistic update
    setPending((prev) => prev.filter((p) => p.id !== item.id));
    const approvedPatient = {
      id: item.id,
      name: item.name,
      lastVisit: item.visitDate || new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
      clinician: item.clinician,
      procedure: item.procedure,
      notes: item.notes,
    };
    setPatients((prev) => [
      approvedPatient,
      ...prev.filter((p) => p.id !== item.id),
    ]);
    setActiveModal(null);
    showToast(`✓ Approved ${item.name}. Syncing with Supabase...`);

    const res = await approvePendingInSupabase(item);
    if (res.success) {
      if (res.data) {
        setPatients((prev) => [
          res.data,
          ...prev.filter((p) => p.id !== item.id && p.id !== res.data.id),
        ]);
      }
      showToast(`✓ Successfully approved & synced ${item.name} in Supabase!`);
    } else {
      showToast(`✓ Approved locally (Supabase: ${res.error || "offline"})`);
    }
  };

  // Decline a pending request
  const handleDecline = async (item) => {
    setPending((prev) => prev.filter((p) => p.id !== item.id));
    setActiveModal(null);
    showToast(`Declining ${item.name}...`);

    const res = await declinePendingInSupabase(item);
    if (res.success) {
      showToast(`✕ Declined request for ${item.name} in Supabase.`);
    } else {
      showToast(`✕ Declined request locally.`);
    }
  };

  // Seed sample records into Supabase
  const handleSeedSupabase = async () => {
    showToast("Seeding sample data to Supabase...");
    let savedPatients = 0;
    let savedPending = 0;

    for (const p of patients) {
      const res = await savePatientToSupabase(p);
      if (res.success) savedPatients++;
    }

    for (const pend of pending) {
      const res = await savePendingToSupabase(pend);
      if (res.success) savedPending++;
    }

    if (savedPatients > 0 || savedPending > 0) {
      showToast(`✓ Seeded ${savedPatients} patients and ${savedPending} pending requests to Supabase!`);
    } else {
      showToast("⚡ Tables not found in Supabase. Copy SQL schema in Settings and run in Supabase SQL editor!");
    }
  };

  return (
    <>
      {notification && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: 14,
            right: 14,
            zIndex: 9999,
            background: "#111",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {notification}
        </div>
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/patients" replace />} />
        <Route
          path="/patients"
          element={
            <PatientRecord
              patients={patients}
              onNavigate={handleNavigate}
              onViewRecords={handleViewRecords}
              onAddPatient={handleAddPatient}
              isSyncing={isSyncing}
            />
          }
        />
        <Route
          path="/approvals"
          element={
            <PendingApproval
              pending={pending}
              onNavigate={handleNavigate}
              onReview={handleReview}
              onApprove={handleApprove}
              onDecline={handleDecline}
              onAddPending={handleAddPending}
              isSyncing={isSyncing}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <Settings
              onNavigate={handleNavigate}
              onSeedSupabase={handleSeedSupabase}
              onRefreshFromSupabase={() => refreshFromSupabase(true)}
            />
          }
        />
        <Route path="*" element={<Navigate to="/patients" replace />} />
      </Routes>

      {/* Detail / Review Modal */}
      {activeModal && (
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
          onClick={() => setActiveModal(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "8px",
              padding: "20px",
              width: "100%",
              maxWidth: "480px",
              border: "2px solid #ff4f9a",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#111" }}>
                {activeModal.type === "view" ? "Patient Clinical Record" : "Review Approval Request"}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{
                  background: "none",
                  border: 0,
                  fontSize: "18px",
                  cursor: "pointer",
                  fontWeight: 700,
                  color: "#666",
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#222", background: "#fff5f8", padding: "12px", borderRadius: "6px", marginBottom: "16px" }}>
              <p style={{ margin: "2px 0" }}><strong>Patient ID:</strong> {activeModal.item.shortId || activeModal.item.id}</p>
              <p style={{ margin: "2px 0" }}><strong>Patient Name:</strong> {activeModal.item.name}</p>
              {activeModal.item.email && (
                <p style={{ margin: "2px 0" }}><strong>Email:</strong> {activeModal.item.email}</p>
              )}
              {activeModal.item.phone && (
                <p style={{ margin: "2px 0" }}><strong>Phone:</strong> {activeModal.item.phone}</p>
              )}
              <p style={{ margin: "2px 0" }}>
                <strong>{activeModal.type === "view" ? "Last Visit:" : "Visit Date:"}</strong>{" "}
                {activeModal.item.lastVisit || activeModal.item.visitDate}
              </p>
              <p style={{ margin: "2px 0" }}><strong>Attending Clinician:</strong> {activeModal.item.clinician}</p>
              {activeModal.item.procedure && (
                <p style={{ margin: "2px 0" }}><strong>Procedure:</strong> {activeModal.item.procedure}</p>
              )}
              {activeModal.item.notes && (
                <p style={{ margin: "2px 0" }}><strong>Clinical Notes:</strong> {activeModal.item.notes}</p>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              {activeModal.type === "review" ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleDecline(activeModal.item)}
                    style={{
                      background: "#f0f0f0",
                      color: "#c00",
                      border: "1px solid #ccc",
                      padding: "6px 12px",
                      borderRadius: "999px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(activeModal.item)}
                    style={{
                      background: "#ff69b4",
                      color: "#fff",
                      border: "0",
                      padding: "6px 14px",
                      borderRadius: "999px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Approve Treatment
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  style={{
                    background: "#ff69b4",
                    color: "#fff",
                    border: 0,
                    padding: "6px 14px",
                    borderRadius: "999px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
