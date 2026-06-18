import { useNavigate } from "react-router-dom";
import "../styles/cards.css";

export default function EventCard({ event, index = 0 }) {
  const navigate = useNavigate();

  // handle both database fields and dummy data fields
  const image     = event.image || `https://placehold.co/400x560/111111/FF6B00?text=${encodeURIComponent(event.title)}`;
  const rating    = event.rating || "N/A";
  const price     = event.base_price || event.basePrice || 0;
  const city      = event.city || event.venue_name || "";
  const promoted  = event.promoted || false;

  return (
    <div
      className={`event-card animate-slideUp stagger-${Math.min(index + 1, 6)}`}
      onClick={() => navigate(`/event/${event.id}`)}
    >
      <div className="event-card-poster">
        <img src={image} alt={event.title} />
        {promoted && <span className="event-card-promoted">HOT</span>}
        <div className="event-card-rating">
          <span>★ {rating}</span>
          <span>₹{price}+</span>
        </div>
        <div className="event-card-overlay">
          <span>View Details →</span>
        </div>
      </div>
      <div className="event-card-body">
        <span className="tag tag-orange">{event.category}</span>
        <h3>{event.title}</h3>
        <div className="event-card-meta">
          <span>📍 {city}</span>
        </div>
      </div>
    </div>
  );
}