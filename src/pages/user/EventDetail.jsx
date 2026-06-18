import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="page-wrapper" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <p style={{ color:"var(--gray1)" }}>Loading...</p>
    </div>
  );

  if (error || !event) return (
    <div className="page-wrapper" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", flexDirection:"column", gap:16 }}>
      <h2 style={{ fontFamily:"var(--font-head)" }}>Event not found</h2>
      <button className="btn-primary" onClick={() => navigate("/home")}>Go Back</button>
    </div>
  );

  const image = event.image || `https://placehold.co/400x560/111111/FF6B00?text=${encodeURIComponent(event.title)}`;

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="ed-wrap animate-fadeIn">
        <div className="ed-top">
          <div className="ed-poster">
            <img src={image} alt={event.title} />
          </div>
          <div className="ed-info animate-slideUp">
            <span className="tag tag-orange">{event.category}</span>
            <h1 className="ed-title">{event.title}</h1>
            <div className="ed-rating">
              <span className="ed-stars">★ {event.rating || "N/A"}</span>
            </div>
            <p className="ed-desc">{event.description}</p>
            <div className="ed-rows">
              <div className="ed-row">
                <span>📅 Date</span>
                <span>{new Date(event.event_date).toDateString()}</span>
              </div>
              <div className="ed-row">
                <span>📍 Venue</span>
                <span>{event.venue_name}</span>
              </div>
              <div className="ed-row">
                <span>🏙 City</span>
                <span>{event.city}</span>
              </div>
              <div className="ed-row">
                <span>💰 Starting from</span>
                <span style={{ color:"var(--orange)" }}>₹{event.base_price}</span>
              </div>
            </div>

            {event.sections && event.sections.length > 0 && (
              <div className="ed-sections">
                <h3>Sections & Pricing</h3>
                <div className="ed-section-list">
                  {event.sections.map(s => (
                    <div key={s.id} className="ed-section-item">
                      <span>{s.section_name}</span>
                      <span style={{ color:"var(--orange)" }}>₹{s.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              className="btn-primary ed-book-btn"
              onClick={() => navigate(`/seats/${event.id}`)}
            >
              Book Tickets →
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .ed-wrap { padding: 48px; max-width: 1100px; margin: 0 auto; }
        .ed-top { display: grid; grid-template-columns: 280px 1fr; gap: 52px; align-items: start; }
        .ed-poster { border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
        .ed-info { display: flex; flex-direction: column; gap: 16px; }
        .ed-title { font-size: 38px; font-weight: 800; letter-spacing: -1px; line-height: 1.1; }
        .ed-rating { display: flex; align-items: center; gap: 12px; font-size: 14px; color: var(--gray2); }
        .ed-stars { color: var(--orange); font-size: 18px; font-weight: 700; }
        .ed-desc { font-size: 14px; color: var(--gray2); line-height: 1.8; }
        .ed-rows { display: flex; flex-direction: column; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
        .ed-row { display: flex; justify-content: space-between; padding: 12px 16px; font-size: 13px; border-bottom: 1px solid var(--border); }
        .ed-row:last-child { border-bottom: none; }
        .ed-row span:first-child { color: var(--gray2); }
        .ed-sections h3 { font-size: 14px; font-weight: 600; margin-bottom: 10px; }
        .ed-section-list { display: flex; flex-direction: column; gap: 8px; }
        .ed-section-item { display: flex; justify-content: space-between; padding: 10px 14px; background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; font-size: 13px; }
        .ed-book-btn { align-self: flex-start; padding: 14px 36px; font-size: 15px; }
        @media (max-width: 768px) { .ed-top { grid-template-columns: 1fr; } .ed-wrap { padding: 24px; } }
      `}</style>
    </div>
  );
}