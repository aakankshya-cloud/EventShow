import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import "../../styles/seatmap.css";

export default function SeatSelection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (event && event.sections && event.sections.length > 0) {
      fetchSeats(event.sections[activeSection].id);
    }
  }, [event, activeSection]);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeats = async (sectionId) => {
    try {
      const res = await api.get(`/events/${id}/seats/${sectionId}`);
      setSeats(res.data);
      setSelectedSeats([]);
    } catch (err) {
      console.error(err);
    }
  };

  const groupByRow = (seats) => {
    const rows = {};
    seats.forEach(seat => {
      const row = seat.seat_number[0];
      if (!rows[row]) rows[row] = [];
      rows[row].push(seat);
    });
    return rows;
  };

  const handleSeatClick = (seat) => {
    if (seat.status === "booked" || seat.status === "locked") return;
    const already = selectedSeats.find(s => s.id === seat.id);
    if (already) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const getSeatClass = (seat) => {
    if (seat.status === "booked") return "seat booked";
    if (seat.status === "locked") return "seat locked";
    if (selectedSeats.find(s => s.id === seat.id)) return "seat selected";
    return "seat available";
  };

  if (loading) return (
    <div className="page-wrapper" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <p style={{ color:"var(--gray1)" }}>Loading...</p>
    </div>
  );

  if (!event) return null;

  const currentSection = event.sections?.[activeSection];
  const rows = groupByRow(seats);
  const total = selectedSeats.length * (currentSection?.price || 0);

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="seatmap-page">
        <div className="seatmap-header">
          <p className="section-label">Pick Your Seats</p>
          <h1>{event.title}</h1>
          <p>{event.venue_name} · {new Date(event.event_date).toDateString()}</p>
        </div>

        <div className="seatmap-sections">
          {event.sections?.map((s, i) => (
            <button
              key={s.id}
              className={`seatmap-section-btn ${activeSection === i ? "active" : ""}`}
              onClick={() => setActiveSection(i)}
            >
              {s.section_name} — ₹{s.price}
            </button>
          ))}
        </div>

        <div className="seatmap-screen">
          <div className="seatmap-screen-bar">Screen / Stage</div>
        </div>

        <div className="seatmap-grid">
          {Object.entries(rows).map(([rowLabel, rowSeats]) => (
            <div className="seatmap-row" key={rowLabel}>
              <span className="seatmap-row-label">{rowLabel}</span>
              {rowSeats.map(seat => (
                <div
                  key={seat.id}
                  className={getSeatClass(seat)}
                  onClick={() => handleSeatClick(seat)}
                  title={seat.seat_number}
                >
                  {seat.seat_number.slice(1)}
                </div>
              ))}
            </div>
          ))}
        </div>

        {seats.length === 0 && (
          <p style={{ textAlign:"center", color:"var(--gray2)", marginBottom:32 }}>
            No seats available for this section yet.
          </p>
        )}

        <div className="seatmap-legend">
          <div className="legend-item">
            <div className="seat available" style={{width:20,height:18}}></div>
            Available
          </div>
          <div className="legend-item">
            <div className="seat selected" style={{width:20,height:18}}></div>
            Selected
          </div>
          <div className="legend-item">
            <div className="seat booked" style={{width:20,height:18}}></div>
            Booked
          </div>
        </div>

        <div className="seatmap-summary">
          <p className="seatmap-summary-seats">
            {selectedSeats.length > 0
              ? `${selectedSeats.length} seat(s): ${selectedSeats.map(s => s.seat_number).join(", ")}`
              : "No seats selected yet"}
          </p>
          <p className="seatmap-summary-price">
            ₹<span>{total.toLocaleString()}</span>
          </p>
          <button
            className="btn-primary"
            disabled={selectedSeats.length === 0}
            onClick={() => navigate("/checkout", {
              state: {
                selectedSeats,
                total,
                event,
                section: currentSection
              }
            })}
          >
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}