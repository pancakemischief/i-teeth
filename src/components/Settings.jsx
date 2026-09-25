import { useState, useEffect } from "react";
import Layout from "./Layout";
import { testSupabaseConnection } from "../lib/dentalService";

const SECTIONS = ["Account", "Supabase DB", "Security", "Appearance", "System Info"];

export default function Settings({
  onNavigate,
  onSeedSupabase = () => {},
  onRefreshFromSupabase = () => {},
  currentUser,
  onSignOut,
}) {
  const [section, setSection] = useState("Account");
  const [dbStatus, setDbStatus] = useState({ checking: true, connected: false, error: null });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    testSupabaseConnection().then((res) => {
      if (mounted) {
        setDbStatus({
          checking: false,
          connected: res.connected,
          tableFound: res.tableFound,
          error: res.error,
        });
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const copySql = () => {
    const SQL_SCHEMA = `-- Run in Supabase SQL Editor:
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  date_of_birth date,
  gender text,
  medical_history text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.pending_approvals (
  id text primary key,
  name text not null,
  visit_date text,
  clinician text,
  procedure text,
  notes text,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table public.patients enable row level security;
alter table public.pending_approvals enable row level security;

create policy "Anon full access" on public.patients for all using (true) with check (true);
create policy "Anon full access" on public.pending_approvals for all using (true) with check (true);
`;
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout
      active="settings"
      onNavigate={onNavigate}
      showHome={false}
      currentUser={currentUser}
      onSignOut={onSignOut}
    >
      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Left Section Nav */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            border: "1px solid #e2e8f0",
            padding: "8px",
            display: "grid",
            gap: "4px",
            minWidth: "180px",
            boxShadow: "0 4px 16px -2px rgba(0, 0, 0, 0.04)",
          }}
        >
          {SECTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSection(s)}
              aria-current={section === s ? "true" : undefined}
              style={{
                width: "100%",
                background: section === s ? "linear-gradient(135deg, #e91e77 0%, #ec206f 100%)" : "transparent",
                color: section === s ? "#ffffff" : "#475569",
                border: "none",
                borderRadius: "12px",
                padding: "10px 14px",
                font: "600 13px Inter, system-ui, sans-serif",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Right Content Panel */}
        <section
          style={{
            flex: 1,
            minHeight: "340px",
            padding: "24px 28px",
            background: "#ffffff",
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.04)",
            maxWidth: "780px",
          }}
        >
          {section === "Account" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #e91e77 0%, #f02a80 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: "800",
                    fontSize: "20px",
                  }}
                >
                  {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                    {currentUser?.role || "Student Clinician"}
                  </h2>
                  <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>
                    {currentUser?.email || "student@ceu.edu.ph"}
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "16px",
                  display: "grid",
                  gap: "10px",
                  fontSize: "13px",
                  lineHeight: "1.6",
                }}
              >
                <div>
                  <strong style={{ color: "#334155" }}>Institutional Role:</strong>{" "}
                  <span style={{ color: "#e91e77", fontWeight: "700" }}>{currentUser?.role}</span>
                </div>
                {currentUser?.employeeId && (
                  <div>
                    <strong style={{ color: "#334155" }}>Faculty / Employee ID:</strong>{" "}
                    <code style={{ background: "#ffffff", padding: "2px 6px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                      {currentUser.employeeId}
                    </code>
                  </div>
                )}
                <div>
                  <strong style={{ color: "#334155" }}>Clinic Department:</strong> CEU College of Dentistry
                </div>
                <div>
                  <strong style={{ color: "#334155" }}>Access Level:</strong> Authenticated Clinical Portal
                </div>
              </div>

              <div style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={onSignOut}
                  style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                    border: "1.5px solid #fecaca",
                    padding: "9px 18px",
                    borderRadius: "12px",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Switch Role / Sign Out
                </button>
              </div>
            </div>
          )}

          {section === "Supabase DB" && (
            <div>
              <h2 style={{ margin: "0 0 14px", fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                Supabase Database Integration
              </h2>

              <div
                style={{
                  background: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  padding: "16px",
                  borderRadius: "14px",
                  marginBottom: "18px",
                  fontSize: "13px",
                  lineHeight: 1.6,
                }}
              >
                <div style={{ marginBottom: "6px" }}>
                  <strong>Project Endpoint:</strong>{" "}
                  <code style={{ background: "#fff", padding: "2px 6px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                    https://mnsqgpiupgelkkmknyex.supabase.co
                  </code>
                </div>
                <div>
                  <strong>Live Status:</strong>{" "}
                  {dbStatus.checking ? (
                    <span style={{ color: "#d97706", fontWeight: "600" }}>● Checking connection...</span>
                  ) : dbStatus.connected ? (
                    <span style={{ color: "#059669", fontWeight: "700" }}>
                      ● Connected & Synchronized with Supabase
                    </span>
                  ) : (
                    <span style={{ color: "#dc2626", fontWeight: "700" }}>● Error: {dbStatus.error}</span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginBottom: "18px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={onRefreshFromSupabase}
                  style={{
                    background: "linear-gradient(135deg, #e91e77 0%, #ec206f 100%)",
                    color: "#fff",
                    border: 0,
                    padding: "9px 16px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(233, 30, 119, 0.3)",
                  }}
                >
                  ↻ Fetch from Supabase
                </button>

                <button
                  type="button"
                  onClick={onSeedSupabase}
                  style={{
                    background: "#0f172a",
                    color: "#fff",
                    border: 0,
                    padding: "9px 16px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  ↑ Seed Sample Data
                </button>

                <button
                  type="button"
                  onClick={copySql}
                  style={{
                    background: copied ? "#059669" : "#ffffff",
                    color: copied ? "#ffffff" : "#334155",
                    border: "1.5px solid #cbd5e1",
                    padding: "9px 16px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {copied ? "✓ Schema Copied!" : "Copy SQL Schema"}
                </button>
              </div>
            </div>
          )}

          {section === "Security" && (
            <div>
              <h2 style={{ margin: "0 0 14px", fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                Security & Compliance
              </h2>
              <div
                style={{
                  background: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "16px",
                  fontSize: "13px",
                  lineHeight: "1.7",
                }}
              >
                <div><strong>Authentication:</strong> CEU Institutional Portal Single Sign-On</div>
                <div><strong>Encryption:</strong> TLS 1.3 in-transit, AES-256 at-rest</div>
                <div><strong>Access Protocol:</strong> Escolar Dental Records Authorization</div>
              </div>
            </div>
          )}

          {section === "Appearance" && (
            <div>
              <h2 style={{ margin: "0 0 14px", fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                Appearance & Theme
              </h2>
              <div
                style={{
                  background: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "16px",
                  fontSize: "13px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #e91e77 0%, #ec206f 100%)",
                    }}
                  />
                  <span>
                    <strong>I-Teeth Clinic Magenta</strong> (#e91e77)
                  </span>
                </div>
              </div>
            </div>
          )}

          {section === "System Info" && (
            <div>
              <h2 style={{ margin: "0 0 14px", fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                System Info
              </h2>
              <div
                style={{
                  background: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "16px",
                  fontSize: "13px",
                  lineHeight: "1.7",
                }}
              >
                <div><strong>Applet:</strong> I-Teeth Dental Patient Management System</div>
                <div><strong>Framework:</strong> React 19 + Vite 8 SPA</div>
                <div><strong>Database:</strong> Supabase PostgreSQL (PostgREST API)</div>
              </div>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
