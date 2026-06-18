import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import EventCard from "../../components/EventCard";
import FilterBar from "../../components/FilterBar";
import api from "../../api/axios";
import "../../styles/home.css";

export default function UserHome() {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "", category: "All", city: "All"
  });

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setFilters(prev => ({ ...prev, category: cat }));
  }, [searchParams]);

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.category !== "All") params.category = filters.category;
      if (filters.city !== "All")     params.city     = filters.city;
      if (filters.search)             params.search   = filters.search;

      const res = await api.get("/events", { params });
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const movies   = events.filter(e => e.category === "movie");
  const concerts = events.filter(e => e.category === "concert");
  const sports   = events.filter(e => e.category === "sports");
  const plays    = events.filter(e => e.category === "plays");

  return (
    <div className="page-wrapper user-home">
      <Navbar />

      <div className="home-hero">
        <span className="section-label">Discover Live Experiences</span>
        <h1>What are you<br /><span>watching</span> next?</h1>
        <p>Browse events across India — movies, concerts, sports and more.</p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {loading && (
        <div className="no-results">
          <p>Loading events...</p>
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="no-results">
          <p>No events found.</p>
          <button className="btn-ghost" style={{ marginTop: 16 }}
            onClick={() => setFilters({ search: "", category: "All", city: "All" })}>
            Clear Filters
          </button>
        </div>
      )}

      {!loading && movies.length > 0 && (
        <section className="home-section">
          <div className="home-section-head">
            <h2>Movies</h2>
            <span>{movies.length} showing</span>
          </div>
          <div className="home-grid">
            {movies.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
          </div>
        </section>
      )}

      {!loading && concerts.length > 0 && (
        <section className="home-section">
          <div className="home-section-head">
            <h2>Concerts</h2>
            <span>{concerts.length} showing</span>
          </div>
          <div className="home-grid">
            {concerts.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
          </div>
        </section>
      )}

      {!loading && sports.length > 0 && (
        <section className="home-section">
          <div className="home-section-head">
            <h2>Sports</h2>
            <span>{sports.length} showing</span>
          </div>
          <div className="home-grid">
            {sports.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
          </div>
        </section>
      )}

      {!loading && plays.length > 0 && (
        <section className="home-section">
          <div className="home-section-head">
            <h2>Plays</h2>
            <span>{plays.length} showing</span>
          </div>
          <div className="home-grid">
            {plays.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}