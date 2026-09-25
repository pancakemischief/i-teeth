import { useState, useEffect } from "react";
import Layout from "./Layout";
import { testSupabaseConnection } from "../lib/dentalService";

const SECTIONS = ["Account", "Appearance", "Security", "System Info", "Supabase DB"];

const SQL_SCHEMA = `-- Run this in your Supabase SQL Editor:
create table if not exists public.patients (
  id text primary key,
  name text not null,
  last_visit text,
  clinician text,
  procedure text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.pending_approvals (
  id text primary key,
  name text not null,
  visit_date text,
  clinician text,
  procedure text,
  notes text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable public read/write for development (or configure RLS):
alter table public.patients enable row level security;
alter table public.pending_approvals enable row level security;

create policy "Allow all operations for anon" on public.patients
  for all using (true) with check (true);

create policy "Allow all operations for anon" on public.pending_approvals
  for all using (true) with check (true);
`;

export default function Settings({
  onNavigate,
  onSeedSupabase = () => {},
  onRefreshFromSupabase = () => {},
}) {
  const [section, setSection] = useState("Supabase DB");
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
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout active="settings" onNavigate={onNavigate} showHome={false}>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 8,
            background: "#fff",
            border: "1px dashed #7a5cff",
            display: "grid",
            gap: 4,
            minWidth: 120,
          }}
        >
          {SECTIONS.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => setSection(s)}
                aria-current={section === s ? "true" : undefined}
                style={{
                  width: "100%",
                  background: section === s ? "#ffe0ee" : "none",
                  border: 0,
                  padding: "6px 8px",
                  font: "600 12px inherit",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>

        <section
          style={{
            flex: 1,
            minHeight: 260,
            padding: 16,
            background: "#fff",
            borderRadius: "4px",
            border: "1px dashed #7a5cff",
            maxWidth: "700px",
          }}
        >
          {section === "Supabase DB" && (
            <div>
              <h2 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>
                Supabase Database Integration
              </h2>

              <div style={{ background: "#f8f9fa", border: "1px solid #e2e8f0", padding: "12px", borderRadius: "6px", marginBottom: "14px", fontSize: "12px", lineHeight: 1.6 }}>
                <div><strong>Endpoint:</strong> <code>https://mnsqgpiupgelkkmknyex.supabase.co</code></div>
                <div>
                  <strong>Status:</strong>{" "}
                  {dbStatus.checking ? (
                    <span style={{ color: "#d97706" }}>● Checking connection...</span>
                  ) : dbStatus.connected ? (
                    <span style={{ color: "#059669" }}>
                      ● Connected to Supabase Project
                      {dbStatus.tableFound ? " (Tables Ready)" : " (Tables Not Yet Initialized)"}
                    </span>
                  ) : (
                    <span style={{ color: "#dc2626" }}>● Connection error: {dbStatus.error}</span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={onRefreshFromSupabase}
                  style={{
                    background: "#ff69b4",
                    color: "#fff",
                    border: 0,
                    padding: "6px 14px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ↻ Fetch from Supabase
                </button>

                <button
                  type="button"
                  onClick={onSeedSupabase}
                  style={{
                    background: "#111",
                    color: "#fff",
                    border: 0,
                    padding: "6px 14px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ↑ Seed Sample Data to Supabase
                </button>

                <button
                  type="button"
                  onClick={copySql}
                  style={{
                    background: copied ? "#059669" : "#fff",
                    color: copied ? "#fff" : "#111",
                    border: "1px solid #999",
                    padding: "6px 14px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  {copied ? "✓ SQL Copied!" : "Copy SQL Schema"}
                </button>
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#555", display: "block", marginBottom: "6px" }}>
                  Recommended Supabase SQL Schema (Run in Supabase SQL Editor if tables are not yet created):
                </span>
                <pre
                  style={{
                    margin: 0,
                    padding: "10px",
                    background: "#1e1e2e",
                    color: "#f8f8f2",
                    fontSize: "10.5px",
                    borderRadius: "4px",
                    overflowX: "auto",
                    maxHeight: "180px",
                  }}
                >
                  {SQL_SCHEMA}
                </pre>
              </div>
            </div>
          )}

          {section === "System Info" && (
            <div>
              <h2 style={{ margin: "0 0 10px", fontSize: 14 }}>System Info</h2>
              <p style={{ fontSize: "12px", lineHeight: "1.6", color: "#333" }}>
                <strong>Application:</strong> I-Teeth Clinic Portal<br />
                <strong>Runtime:</strong> React 19 + Vite 8<br />
                <strong>Database Client:</strong> @supabase/supabase-js v2<br />
                <strong>Active Environment:</strong> Production / AI Studio
              </p>
            </div>
          )}

          {section === "Security" && (
            <div>
              <h2 style={{ margin: "0 0 10px", fontSize: 14 }}>Security & Access</h2>
              <p style={{ fontSize: "12px", lineHeight: "1.6", color: "#333" }}>
                <strong>API Authorization:</strong> Supabase Anon JWT<br />
                <strong>Role:</strong> anon / clinician<br />
                <strong>Transport:</strong> HTTPS TLS 1.3
              </p>
            </div>
          )}

          {section === "Appearance" && (
            <div>
              <h2 style={{ margin: "0 0 10px", fontSize: 14 }}>Appearance</h2>
              <p style={{ fontSize: "12px", color: "#333" }}>
                Theme: <strong>Bubblegum Clinic Pink</strong> (Figma Match)
              </p>
            </div>
          )}

          {section === "Account" && (
            <div>
              <h2 style={{ margin: "0 0 10px", fontSize: 14 }}>Clinician Account</h2>
              <p style={{ fontSize: "12px", lineHeight: "1.6", color: "#333" }}>
                <strong>Logged In As:</strong> Student Clinician, Doe, Jane<br />
                <strong>Department:</strong> Orthodontics & Restorative Dentistry<br />
                <strong>Clinic ID:</strong> DEN-2026-4412
              </p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
