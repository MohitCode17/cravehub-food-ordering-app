import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AUTH_SERVICE } from "../main";
import type { AppContextType, LocationData, User } from "../types";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [city, setCity] = useState("Fetching Location...");

  async function fetchUser() {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(`${AUTH_SERVICE}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // TODO: BACKEND SHOULD SEND data.user IN RESPONSE
      setUser(data);
      setIsAuth(true);
    } catch (error) {
      console.log("Error fetching user", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation)
      return alert("Please Allow Location to continue");
    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        );
        const data = await res.json();

        setLocation({
          latitude,
          longitude,
          formattedAddress: data.display_name || "current location",
        });

        setCity(
          data.address.city ||
            data.address.town ||
            data.address.village ||
            "Your Location",
        );
      } catch (error) {
        console.error("Error fetching location", error);
        setLocation({
          latitude,
          longitude,
          formattedAddress: "Current Location",
        });
        setCity("Failed to load");
      }
    });
  }, []);

  return (
    <AppContext.Provider
      value={{ isAuth, loading, user, city, location, loadingLocation, setIsAuth, setLoading, setUser }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppData must be used with in AppProvider");
  }

  return context;
};
