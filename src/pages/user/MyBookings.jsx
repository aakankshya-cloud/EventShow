import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import "../../styles/bookings.css";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refunding, setRefunding] = useState(null); // booking id being refunded

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/my");
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (booking) => {
    if (!window.confirm(
      `Cancel booking for "${booking.event_title}" and refund ₹${Number(booking.total_amount).toLocaleString()}?\n\nSeats will be released immediately.`
    )) return;

    setRefunding(booking.id);
    try {
      await api.post(`/bookings/${booking.id}/refund`);
      // Refresh list so status updates to cancelled
      await fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Refund failed. Please try again.");
    } finally {
      setRefunding(null);
    }
  };

  const isPastEvent = (eventDate) => eventDate && new Date(eventDate) < new Date();

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="bookings-page">
        <h1>My <span>Bookings.</span></h1>

        {loading && <p style={{ color:"var(--text-muted)", padding:"40px 0" }}>Loading...</p>}

        {!loading && bookings.length === 0 && (
          <div className="no-bookings">No bookings yet.</div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="bookings-list">
            {bookings.map((b, i) => (
              <div className={`booking-item stagger-${Math.min(i+1,6)}`} key={b.id}>
                <div className="booking-item-top">
                  <div>
                    <p className="booking-item-title">{b.event_title}</p>
                    <p className="booking-item-venue">{b.venue_name}</p>
                  </div>
                  <span className={`booking-badge ${b.status}`}>{b.status}</span>
                </div>

                <div className="booking-item-rows">
                  <div className="booking-item-row">
                    <span>Booked On</span>
                    <span>{new Date(b.booked_at).toDateString()}</span>
                  </div>
                  <div className="booking-item-row">
                    <span>Event Date</span>
                    <span>{b.event_date ? new Date(b.event_date).toDateString() : "—"}</span>
                  </div>
                  <div className="booking-item-row">
                    <span>Seats</span>
                    <span>{b.seats?.join(", ") || "N/A"}</span>
                  </div>
                  <div className="booking-item-row">
                    <span>Total Paid</span>
                    <span style={{ color:"var(--primary)", fontWeight:600 }}>
                      ₹{Number(b.total_amount).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Show refund button only for confirmed future bookings */}
                {b.status === "confirmed" && !isPastEvent(b.event_date) && (
                  <div style={{ marginTop: 16, borderTop:"1px solid var(--border)", paddingTop:14 }}>
                    <button
                      onClick={() => handleRefund(b)}
                      disabled={refunding === b.id}
                      style={{
                        background:"transparent",
                        border:"1px solid var(--danger)",
                        borderRadius:8,
                        padding:"8px 20px",
                        color:"var(--danger)",
                        fontSize:12,
                        fontFamily:"var(--font-body)",
                        cursor: refunding === b.id ? "not-allowed" : "pointer",
                        opacity: refunding === b.id ? 0.6 : 1,
                        transition:"var(--transition)",
                      }}
                    >
                      {refunding === b.id ? "Processing refund…" : "Cancel & Refund"}
                    </button>
                    <p style={{ fontSize:11, color:"var(--text-muted)", marginTop:6 }}>
                      Refunds take 5–7 business days · Only available for future events
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}