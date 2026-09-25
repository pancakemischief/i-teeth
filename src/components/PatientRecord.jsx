import { useState } from "react";
import Layout from "./Layout";

const MOCK_PATIENTS = [
  { id: "00001", name: "John Doe", lastVisit: "01/01/2026", clinician: "Student Clinician, Doe, Jane" },
];
const ROWS = 7; // minimum visible rows, as in the mockup

export default function PatientRecord({ onNavigate, patients = MOCK_PATIENTS, onViewRecords = () => {} }) {
  const [query, setQuery] = useState("");

  const filtered = patients.filter((p) =>
    `${p.id} ${p.name}`.toLowerCase().includes(query.toLowerCase())
  );
  const blanks = Math.max(0, ROWS - filtered.length);

  return (
    <Layout active="patients" onNavigate={onNavigate}>
      <div className="toolbar">
        <input
          className="pill pill--search"
          placeholder="Search Patients"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="pill">Filter by</button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Name</th>
              <th>Last Visit<br />(MM/DD/YYYY)</th>
              <th>Attending Clinician</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.lastVisit}</td>
                <td>{p.clinician}</td>
                <td>
                  <button className="table__action" onClick={() => onViewRecords(p)}>
                    View Records
                  </button>
                </td>
              </tr>
            ))}
            {Array.from({ length: blanks }, (_, i) => (
              <tr key={`blank-${i}`}><td colSpan={5} /></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
