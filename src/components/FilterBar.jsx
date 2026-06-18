import "../styles/home.css";

const categories = ["All", "movie", "concert", "sports", "plays"];
const cities = ["All", "Mumbai", "Delhi", "Chennai", "Hyderabad", "Bangalore"];

export default function FilterBar({ filters, onChange }) {
  return (
    <div className="filterbar">
      <input
        className="filterbar-search"
        type="text"
        placeholder="Search events, artists..."
        value={filters.search}
        onChange={e => onChange({ ...filters, search: e.target.value })}
      />

      <div className="filterbar-cats">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filterbar-cat ${filters.category === cat ? "active" : ""}`}
            onClick={() => onChange({ ...filters, category: cat })}
          >
            {cat === "All" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <select
        className="filterbar-city"
        value={filters.city}
        onChange={e => onChange({ ...filters, city: e.target.value })}
      >
        {cities.map(c => (
          <option key={c} value={c}>{c === "All" ? "All Cities" : c}</option>
        ))}
      </select>
    </div>
  );
}