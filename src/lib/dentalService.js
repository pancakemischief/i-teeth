import { supabase } from "./supabaseClient.js";

/**
 * Checks if a string is a valid UUID
 */
function isUuid(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str));
}

/**
 * Normalizes a database row from `patients` table to standard UI patient object
 */
function normalizePatient(row) {
  let meta = {};
  if (row.medical_history) {
    try {
      meta = JSON.parse(row.medical_history);
    } catch {
      meta = { notes: row.medical_history };
    }
  }

  const fullName =
    `${row.first_name || ""} ${row.last_name || ""}`.trim() ||
    row.name ||
    "Unknown Patient";

  const formattedDate = row.created_at
    ? new Date(row.created_at).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
    : "01/01/2026";

  return {
    id: row.id,
    shortId: meta.shortId || (isUuid(row.id) ? row.id.slice(0, 5).toUpperCase() : row.id),
    name: fullName,
    firstName: row.first_name || "",
    lastName: row.last_name || "",
    email: row.email || "",
    phone: row.phone || "",
    gender: row.gender || "",
    dateOfBirth: row.date_of_birth || "",
    lastVisit: meta.lastVisit || row.last_visit || formattedDate,
    clinician: meta.clinician || row.clinician || "Student Clinician, Doe, Jane",
    procedure: meta.procedure || row.procedure || "Dental Examination & Charting",
    notes: meta.notes || (typeof row.medical_history === "string" ? row.medical_history : ""),
  };
}

/**
 * Normalizes a database row from `pending_approvals` table
 */
function normalizePending(row) {
  return {
    id: String(row.id || ""),
    name: row.name || "Unknown Patient",
    visitDate: row.visit_date || row.visitDate || "01/01/2026",
    clinician: row.clinician || "Student Clinician, Doe, Jane",
    procedure: row.procedure || "Clinical Evaluation",
    notes: row.notes || "",
    status: row.status || "pending",
  };
}

/**
 * Fetch patients from Supabase `patients` table
 */
export async function fetchPatientsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

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
 * Fetch pending approvals from Supabase `pending_approvals` table
 */
export async function fetchPendingFromSupabase() {
  try {
    const { data, error } = await supabase
      .from("pending_approvals")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
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
 * Save or update a patient in Supabase matching the exact `patients` table schema:
 * (id: uuid, first_name: text, last_name: text, email: text, phone: text,
 *  date_of_birth: date, gender: text, medical_history: text)
 */
export async function savePatientToSupabase(patient) {
  try {
    const nameParts = (patient.name || "").trim().split(/\s+/);
    const firstName = patient.firstName || nameParts[0] || "Unnamed";
    const lastName = patient.lastName || nameParts.slice(1).join(" ") || "Patient";

    const meta = {
      clinician: patient.clinician || "Student Clinician, Doe, Jane",
      lastVisit:
        patient.lastVisit ||
        new Date().toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }),
      procedure: patient.procedure || "Dental Examination & Charting",
      notes: patient.notes || "",
      shortId: patient.shortId || (patient.id && !isUuid(patient.id) ? patient.id : undefined),
    };

    const payload = {
      first_name: firstName,
      last_name: lastName,
      email: patient.email || null,
      phone: patient.phone || null,
      date_of_birth: patient.dateOfBirth || null,
      gender: patient.gender || null,
      medical_history: JSON.stringify(meta),
      updated_at: new Date().toISOString(),
    };

    // If patient has a valid UUID, include it for upsert
    if (patient.id && isUuid(patient.id)) {
      payload.id = patient.id;
      const { data, error } = await supabase
        .from("patients")
        .upsert(payload, { onConflict: "id" })
        .select();

      if (error) {
        console.warn("[Supabase] savePatient upsert error:", error.message);
        return { success: false, error: error.message };
      }
      return { success: true, data: data?.[0] ? normalizePatient(data[0]) : null };
    } else {
      // Auto-generate UUID in database
      const { data, error } = await supabase
        .from("patients")
        .insert(payload)
        .select();

      if (error) {
        console.warn("[Supabase] savePatient insert error:", error.message);
        return { success: false, error: error.message };
      }
      return { success: true, data: data?.[0] ? normalizePatient(data[0]) : null };
    }
  } catch (err) {
    console.warn("[Supabase] Unexpected error saving patient:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Add or update pending approval in Supabase matching the exact `pending_approvals` table schema:
 * (id: text, name: text, visit_date: text, clinician: text, procedure: text, notes: text, status: text)
 */
export async function savePendingToSupabase(item) {
  try {
    const payload = {
      id: String(item.id || `REQ-${Date.now().toString().slice(-5)}`),
      name: item.name,
      visit_date:
        item.visitDate ||
        new Date().toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }),
      clinician: item.clinician || "Student Clinician, Doe, Jane",
      procedure: item.procedure || "Clinical Evaluation",
      notes: item.notes || null,
      status: item.status || "pending",
    };

    const { data, error } = await supabase
      .from("pending_approvals")
      .upsert(payload, { onConflict: "id" })
      .select();

    if (error) {
      console.warn("[Supabase] savePending error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data?.[0] ? normalizePending(data[0]) : null };
  } catch (err) {
    console.warn("[Supabase] Unexpected error saving pending approval:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Approve a pending request:
 * 1. Updates status in `pending_approvals` to 'approved'
 * 2. Creates/updates the patient in `patients` table
 */
export async function approvePendingInSupabase(item) {
  try {
    // 1. Update status in pending_approvals
    const { error: pendingErr } = await supabase
      .from("pending_approvals")
      .update({ status: "approved" })
      .eq("id", item.id);

    if (pendingErr) {
      console.warn("[Supabase] approvePending update error:", pendingErr.message);
    }

    // 2. Insert into patients table
    const patientResult = await savePatientToSupabase({
      name: item.name,
      lastVisit: item.visitDate,
      clinician: item.clinician,
      procedure: item.procedure,
      notes: item.notes || "Approved faculty procedure.",
    });

    return { success: true, data: patientResult.data };
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
      return { connected: true, tableFound: false, error: error.message };
    }
    return { connected: true, tableFound: true, error: null };
  } catch (err) {
    return { connected: false, tableFound: false, error: err.message };
  }
}
