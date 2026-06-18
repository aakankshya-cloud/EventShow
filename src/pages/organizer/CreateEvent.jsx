import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../styles/organizer.css";
import api from "../../api/axios";

const DEFAULT_SECTIONS = [
  { section_name: "General", total_seats: 100, rows: 10, seats_per_row: 10, price: "" },
];

export default function CreateEvent() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    venue_id: "",
    title: "",
    category: "movie",
    event_date: "",
    base_price: "",
    description: "",
  });

  const [sections, setSections] = useState(DEFAULT_SECTIONS);

  useEffect(() => { loadVenues(); }, []);

  const loadVenues = async () => {
    try {
      const res = await api.get("/organizer/venues");
      setVenues(res.data);
    } catch {
      alert("Failed to load venues");
    }
  };

  const addSection = () => {
    setSections([...sections, { section_name: "", total_seats: 50, rows: 5, seats_per_row: 10, price: "" }]);
  };

  const removeSection = (i) => {
    if (sections.length === 1) return;
    setSections(sections.filter((_, idx) => idx !== i));
  };

  const updateSection = (i, field, value) => {
    const updated = sections.map((s, idx) => {
      if (idx !== i) return s;
      const next = { ...s, [field]: value };
      // keep total_seats in sync
      if (field === "rows" || field === "seats_per_row") {
        const r = field === "rows" ? Number(value) : Number(next.rows);
        const c = field === "seats_per_row" ? Number(value) : Number(next.seats_per_row);
        next.total_seats = r * c;
      }
      return next;
    });
    setSections(updated);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.venue_id || !form.event_date || !form.base_price) {
      alert("Fill all required fields (title, venue, date, base price).");
      return;
    }
    for (const s of sections) {
      if (!s.section_name.trim()) { alert("Every section needs a name."); return; }
      if (!s.price || Number(s.price) <= 0) { alert(`Set a price for section "${s.section_name}".`); return; }
    }

    setSubmitting(true);
    try {
      // 1. Create the event
      const res = await api.post("/organizer/events", {
        venue_id:    Number(form.venue_id),
        title:       form.title,
        category:    form.category,
        description: form.description,
        event_date:  form.event_date,
        base_price:  Number(form.base_price),
      });

      const eventId = res.data.id;

      // 2. Create sections + seats
      await api.post(`/organizer/events/${eventId}/sections`, {
        sections: sections.map(s => ({
          section_name: s.section_name.trim(),
          rows:         Number(s.rows),
          seats_per_row: Number(s.seats_per_row),
          price:        Number(s.price),
        })),
      });

      alert("Event created successfully with seat map!");
      navigate("/org/events");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="org-page">
        <div className="org-header">
          <div>
            <p className="section-label">Organizer Panel</p>
            <h1>Create <span>Event.</span></h1>
          </div>
        </div>

        {/* ── Event Details ── */}
        <div className="org-form">
          <h2>Event Details</h2>
          <div className="org-form-grid">
            <div className="form-field">
              <label>Event Title *</label>
              <input type="text" placeholder="e.g. Coldplay World Tour"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="form-field">
              <label>Category</label>
              <select value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}>
                {["movie","concert","sports","plays"].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Date & Time *</label>
              <input type="datetime-local" value={form.event_date}
                onChange={e => setForm({ ...form, event_date: e.target.value })} />
            </div>

            <div className="form-field">
              <label>Venue *</label>
              <select value={form.venue_id}
                onChange={e => setForm({ ...form, venue_id: e.target.value })}>
                <option value="">Select Venue</option>
                {venues.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.city})</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Base Price (₹) *</label>
              <input type="number" placeholder="e.g. 500"
                value={form.base_price}
                onChange={e => setForm({ ...form, base_price: e.target.value })} />
            </div>
          </div>

          <div className="form-field" style={{ marginBottom: 0 }}>
            <label>Description</label>
            <textarea rows={3} placeholder="Describe the event..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>

        {/* ── Seat Sections ── */}
        <div className="org-form" style={{ marginTop: 24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <h2 style={{ margin:0 }}>Seat Sections</h2>
            <button className="btn-ghost" style={{ padding:"8px 16px", fontSize:13 }} onClick={addSection}>
              + Add Section
            </button>
          </div>

          {sections.map((s, i) => (
            <div key={i} style={{
              background:"var(--bg3)", border:"1px solid var(--border)",
              borderRadius:12, padding:"20px", marginBottom:16,
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <span style={{ fontWeight:600, fontSize:14, color:"var(--orange)" }}>Section {i+1}</span>
                {sections.length > 1 && (
                  <button onClick={() => removeSection(i)}
                    style={{ background:"none", border:"none", color:"var(--gray2)", cursor:"pointer", fontSize:18 }}>✕</button>
                )}
              </div>

              <div className="org-form-grid">
                <div className="form-field">
                  <label>Section Name</label>
                  <input type="text" placeholder="e.g. VIP, General, Balcony"
                    value={s.section_name}
                    onChange={e => updateSection(i, "section_name", e.target.value)} />
                </div>

                <div className="form-field">
                  <label>Price per Seat (₹)</label>
                  <input type="number" placeholder="e.g. 1500"
                    value={s.price}
                    onChange={e => updateSection(i, "price", e.target.value)} />
                </div>

                <div className="form-field">
                  <label>Rows</label>
                  <input type="number" min="1" max="26"
                    value={s.rows}
                    onChange={e => updateSection(i, "rows", e.target.value)} />
                </div>

                <div className="form-field">
                  <label>Seats per Row</label>
                  <input type="number" min="1" max="50"
                    value={s.seats_per_row}
                    onChange={e => updateSection(i, "seats_per_row", e.target.value)} />
                </div>
              </div>

              <p style={{ fontSize:12, color:"var(--gray2)", marginTop:4 }}>
                Total seats: <strong style={{ color:"var(--white)" }}>{s.total_seats}</strong>
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Creating…" : "Create Event →"}
          </button>
        </div>
      </div>
    </div>
  );
}