import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./styles/global.css";
import SplashScreen from "./components/Splashscreen";
import { EventProvider } from "./context/EventContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <EventProvider>
        <SplashScreen />
        <App />
      </EventProvider>
    </AuthProvider>
  </StrictMode>
);