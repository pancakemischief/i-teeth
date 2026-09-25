import { useState } from "react";
import Layout from "./Layout";

const SECTIONS = ["Account", "Appearance", "Security", "System Info"];

export default function Settings({ onNavigate }) {
  const [section, setSection] = useState("Security");

  return (
    <Layout active="settings" onNavigate={onNavigate} showHome={false}>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <ul
          style={{
            listStyle: "none", margin: 0, padding: 8, background: "#fff",
            border: "1px dashed #7a5cff", display: "grid", gap: 4, minWidth: 110,
          }}
        >
          {SECTIONS.map((s) => (
            <li key={s}>
              <button
                onClick={() => setSection(s)}
                aria-current={section === s ? "true" : undefined}
                style={{
                  width: "100%", background: section === s ? "#ffe0ee" : "none", border: 0,
                  padding: "4px 8px", font: "600 12px inherit", cursor: "pointer", textAlign: "center",
                }}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>

        <section
          style={{
            flex: 1, minHeight: 210, padding: 12,
            border: "1px dashed #7a5cff",
          }}
        >
          <div style={{ background: "#d9d9d9", padding: 10, maxWidth: 210, minHeight: 92 }}>
            <h2 style={{ margin: 0, fontSize: 13 }}>{section}</h2>
            {/* Render the selected section's settings here */}
          </div>
        </section>
      </div>
    </Layout>
  );
}
