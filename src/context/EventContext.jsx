import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const EventContext = createContext();

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all public events on mount
  const fetchEvents = async (filters = {}) => {
    try {
      const params = {};
      if (filters.category && filters.category !== "All") params.category = filters.category;
      if (filters.city && filters.city !== "All") params.city = filters.city;
      if (filters.search) params.search = filters.search;

      const res = await api.get("/events", { params });
      setEvents(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch events:", err);
      return [];
    }
  };

  // Load only the logged-in organizer's events
  const fetchMyEvents = async () => {
    try {
      const res = await api.get("/events/organizer/mine");
      setMyEvents(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch organizer events:", err);
      return [];
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchEvents();
      setLoading(false);
    })();
  }, []);

  // CREATE — sends to MySQL via POST /api/events
  const addEvent = async (eventData) => {
    try {
      const res = await api.post("/events", {
        title:       eventData.title,
        category:    eventData.category,
        description: eventData.description,
        event_date:  eventData.date,        // expects "YYYY-MM-DD" or full datetime
        base_price:  Number(eventData.basePrice),
        venue_name:  eventData.venue,
        city:        eventData.city,
        address:     eventData.address || null,
      });

      // Refresh both lists so the new event shows up everywhere immediately
      await fetchEvents();
      await fetchMyEvents();

      return { success: true, event_id: res.data.event_id };
    } catch (err) {
      console.error("Failed to create event:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Failed to create event",
      };
    }
  };

  // UPDATE — PUT /api/events/:id
  const updateEvent = async (eventId, updatedFields) => {
    try {
      await api.put(`/events/${eventId}`, {
        title:       updatedFields.title,
        category:    updatedFields.category,
        description: updatedFields.description,
        event_date:  updatedFields.date,
        base_price:  Number(updatedFields.basePrice),
        status:      updatedFields.status || "upcoming",
      });

      await fetchEvents();
      await fetchMyEvents();

      return { success: true };
    } catch (err) {
      console.error("Failed to update event:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Failed to update event",
      };
    }
  };

  // DELETE — DELETE /api/events/:id
  const deleteEvent = async (eventId) => {
    try {
      await api.delete(`/events/${eventId}`);
      await fetchEvents();
      await fetchMyEvents();
      return { success: true };
    } catch (err) {
      console.error("Failed to delete event:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Failed to delete event",
      };
    }
  };

  return (
    <EventContext.Provider
      value={{
        events,
        myEvents,
        loading,
        fetchEvents,
        fetchMyEvents,
        addEvent,
        updateEvent,
        deleteEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  return useContext(EventContext);
}