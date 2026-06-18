import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import "../../styles/organizer.css";

export default function EventAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent]     = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the organizer's events and find this one
        const { data: events } = await api.get("/organizer/events");
        const found = events.find(e => e.id === parseInt(id));
        if (!found) { setError("Event not found."); setLoading(false); return; }
        setEvent(found);

        // Fetch seat sections for this event
        try {
          const { data: secs } = await api.get(`/events/${id}/sections`);
          setSections(secs);
        } catch {
          // Sections endpoint may not exist yet; show empty list gracefully
          setSections([]);
        }
      } catch {
        setError("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="page-wrapper">
      <Navbar />
      <div className="org-page">
        <p style={{ color:"var(--text-muted)", paddingTop:60 }}>Loading…</p>
      </div>
    </div>
  );

  if (error || !event) return (
    <div className="page-wrapper">
      <Navbar />
      <div className="org-page">
        <p style={{ color:"red", paddingTop:60 }}>{error || "Event not found."}</p>
        <button className="btn-ghost" style={{ marginTop:16 }} onClick={() => navigate(-1)}>← Back</button>
      </div>
    </div>
  );

  const stats = [
    { label: "Tickets Sold",  value: <><span>—</span></> },
    { label: "Revenue",       value: <>₹<span>—</span></> },
    { label: "Occupancy",     value: <><span>—</span></> },
    { label: "Status",        value: <><span style={{ textTransform:"capitalize" }}>{event.status}</span></> },
  ];

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="org-page">
        <div className="org-header">
          <div>
            <p className="section-label">Analytics</p>
            <h1>{event.title.length > 20 ? event.title.slice(0,20)+"…" : event.title} <span>.</span></h1>
          </div>
          <button className="btn-ghost" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div className="org-stats">
          {stats.map((s, i) => (
            <div className="org-stat" key={i}>
              <p className="org-stat-label">{s.label}</p>
              <p className="org-stat-value">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="org-form">
          <h2>Event Details</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ padding:"12px 16px", background:"var(--bg3)", borderRadius:8, border:"1px solid var(--border)" }}>
              <p style={{ fontWeight:600, fontSize:14 }}>📍 {event.venue_name}, {event.city}</p>
              <p style={{ fontSize:12, color:"var(--gray2)", marginTop:4 }}>
                📅 {new Date(event.event_date).toLocaleString("en-IN", { dateStyle:"long", timeStyle:"short" })}
              </p>
              <p style={{ fontSize:12, color:"var(--gray2)", marginTop:4 }}>
                Base Price: ₹{event.base_price}
              </p>
            </div>

            {sections.length > 0 && (
              <>
                <h3 style={{ fontSize:14, fontWeight:600, marginTop:8 }}>Section Breakdown</h3>
                {sections.map(s => (
                  <div key={s.section_id}
                    style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                             padding:"12px 16px", background:"var(--bg3)", borderRadius:8,
                             border:"1px solid var(--border)" }}>
                    <div>
                      <p style={{ fontWeight:600, fontSize:14 }}>{s.section_name}</p>
                      <p style={{ fontSize:12, color:"var(--gray2)" }}>
                        ₹{s.price} · {s.total_seats} total seats
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
