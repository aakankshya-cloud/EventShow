import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import "../../styles/bookings.css";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

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

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="bookings-page">
        <h1>My <span>Bookings.</span></h1>

        {loading && <p style={{ color:"var(--gray1)" }}>Loading...</p>}

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
                    <span>Date</span>
                    <span>{new Date(b.booked_at).toDateString()}</span>
                  </div>
                  <div className="booking-item-row">
                    <span>Seats</span>
                    <span>{b.seats?.join(", ") || "N/A"}</span>
                  </div>
                  <div className="booking-item-row">
                    <span>Total Paid</span>
                    <span style={{ color:"var(--orange)" }}>
                      ₹{b.total_amount?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}