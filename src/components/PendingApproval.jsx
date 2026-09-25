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
}) {
  const [query, setQuery] = useState("");

  const filtered = pending.filter((p) =>
    `${p.id} ${p.name}`.toLowerCase().includes(query.toLowerCase())
  );
  const blanks = Math.max(0, ROWS - filtered.length);

  return (
    <Layout active="approvals" onNavigate={onNavigate}>
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
    </Layout>
  );
}
