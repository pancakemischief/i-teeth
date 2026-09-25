import { supabase } from "./supabaseClient";

/**
 * Normalizes a database row to standard UI patient object
 */
function normalizePatient(row) {
  return {
    id: String(row.id || row.patient_id || ""),
    name: row.name || row.patient_name || "Unknown Patient",
    lastVisit: row.last_visit || row.lastVisit || row.visit_date || "N/A",
    clinician: row.clinician || row.attending_clinician || "Staff Clinician",
    procedure: row.procedure || row.procedure_name || "",
    notes: row.notes || "",
  };
}

/**
 * Normalizes a database row to standard UI pending approval object
 */
function normalizePending(row) {
  return {
    id: String(row.id || row.patient_id || ""),
    name: row.name || row.patient_name || "Unknown Patient",
    visitDate: row.visit_date || row.visitDate || row.last_visit || "N/A",
    clinician: row.clinician || row.attending_clinician || "Staff Clinician",
    procedure: row.procedure || row.procedure_name || "Clinical Evaluation",
    notes: row.notes || "",
    status: row.status || "pending",
  };
}

/**
 * Fetch patients from Supabase
 */
export async function fetchPatientsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.warn("[Supabase] fetchPatients error:", error.message);
      return { success: false, error: error.message, data: null };
    }
    return {
      success: true,
      error: null,
      data: Array.isArray(data) ? data.map(normalizePatient) : [],
    };
  } catch (err) {
    console.warn("[Supabase] Unexpected error fetching patients:", err);
    return { success: false, error: err.message, data: null };
  }
}

/**
 * Fetch pending approvals from Supabase
 */
export async function fetchPendingFromSupabase() {
  try {
    const { data, error } = await supabase
      .from("pending_approvals")
      .select("*")
      .eq("status", "pending")
      .order("id", { ascending: true });

    if (error) {
      // Also try fallback table name 'approvals'
      const fallback = await supabase
        .from("approvals")
        .select("*")
        .order("id", { ascending: true });

      if (!fallback.error && Array.isArray(fallback.data)) {
        return {
          success: true,
          error: null,
          data: fallback.data.map(normalizePending),
        };
      }

      console.warn("[Supabase] fetchPending error:", error.message);
      return { success: false, error: error.message, data: null };
    }

    return {
      success: true,
      error: null,
      data: Array.isArray(data) ? data.map(normalizePending) : [],
    };
  } catch (err) {
    console.warn("[Supabase] Unexpected error fetching pending:", err);
    return { success: false, error: err.message, data: null };
  }
}

/**
 * Save or update a patient in Supabase
 */
export async function savePatientToSupabase(patient) {
  try {
    const payload = {
      id: patient.id,
      name: patient.name,
      last_visit: patient.lastVisit,
      clinician: patient.clinician,
      procedure: patient.procedure || null,
      notes: patient.notes || null,
    };

    const { data, error } = await supabase
      .from("patients")
      .upsert(payload, { onConflict: "id" })
      .select();

    if (error) {
      console.warn("[Supabase] savePatient error:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.warn("[Supabase] Unexpected error saving patient:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Add or update pending approval in Supabase
 */
export async function savePendingToSupabase(item) {
  try {
    const payload = {
      id: item.id,
      name: item.name,
      visit_date: item.visitDate,
      clinician: item.clinician,
      procedure: item.procedure || "Clinical Evaluation",
      notes: item.notes || null,
      status: "pending",
    };

    const { data, error } = await supabase
      .from("pending_approvals")
      .upsert(payload, { onConflict: "id" })
      .select();

    if (error) {
      console.warn("[Supabase] savePending error:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.warn("[Supabase] Unexpected error saving pending approval:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Approve a pending request in Supabase
 */
export async function approvePendingInSupabase(item) {
  try {
    // 1. Update or delete pending approval
    const { error: pendingErr } = await supabase
      .from("pending_approvals")
      .update({ status: "approved" })
      .eq("id", item.id);

    if (pendingErr) {
      console.warn("[Supabase] approvePending update error:", pendingErr.message);
    }

    // 2. Insert or update patient record
    const patientPayload = {
      id: item.id,
      name: item.name,
      last_visit: item.visitDate || new Date().toISOString().split("T")[0],
      clinician: item.clinician,
      procedure: item.procedure || "Approved Treatment",
      notes: item.notes || "Approved and scheduled.",
    };

    const { data, error: patientErr } = await supabase
      .from("patients")
      .upsert(patientPayload, { onConflict: "id" })
      .select();

    if (patientErr) {
      console.warn("[Supabase] patient insert after approval error:", patientErr.message);
      return { success: false, error: patientErr.message };
    }

    return { success: true, data };
  } catch (err) {
    console.warn("[Supabase] Unexpected error approving pending item:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Decline a pending request in Supabase
 */
export async function declinePendingInSupabase(item) {
  try {
    const { error } = await supabase
      .from("pending_approvals")
      .update({ status: "declined" })
      .eq("id", item.id);

    if (error) {
      console.warn("[Supabase] declinePending error:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.warn("[Supabase] Unexpected error declining pending item:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Test Supabase connection
 */
export async function testSupabaseConnection() {
  try {
    const { error } = await supabase.from("patients").select("id").limit(1);
    if (error) {
      return { connected: true, tableFound: error.code !== "PGRST205", error: error.message };
    }
    return { connected: true, tableFound: true, error: null };
  } catch (err) {
    return { connected: false, tableFound: false, error: err.message };
  }
}
