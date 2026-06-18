import { createContext, useContext, useState } from "react";
import { dummyEvents } from "../data/dummyData";

const EventContext = createContext();

const STORAGE_KEY = "eventshow_events";

function loadEvents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : dummyEvents;
  } catch {
    return dummyEvents;
  }
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function EventProvider({ children }) {
  const [events, setEvents] = useState(loadEvents);

  const addEvent = (eventData) => {
    const newEvent = {
      ...eventData,
      id: Date.now(),
      rating: 0,
      votes: "0",
      promoted: false,
      status: "upcoming",
      sections: [
        { id: "A", name: "VIP",     price: Number(eventData.basePrice) * 2, rows: 2, seatsPerRow: 10 },
        { id: "B", name: "Premium", price: Math.round(Number(eventData.basePrice) * 1.4), rows: 3, seatsPerRow: 12 },
        { id: "C", name: "General", price: Number(eventData.basePrice), rows: 5, seatsPerRow: 15 },
      ],
    };
    const updated = [newEvent, ...events];
    setEvents(updated);
    saveEvents(updated);
    return newEvent;
  };

  const updateEvent = (updatedEvent) => {
    const updated = events.map(e => e.id === updatedEvent.id ? updatedEvent : e);
    setEvents(updated);
    saveEvents(updated);
  };

  const deleteEvent = (id) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    saveEvents(updated);
  };

  return (
    <EventContext.Provider value={{ events, addEvent, updateEvent, deleteEvent }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  return useContext(EventContext);
}
