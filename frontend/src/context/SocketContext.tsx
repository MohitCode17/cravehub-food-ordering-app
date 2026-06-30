import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAppData } from "./AppContext";
import { REALTIME_SERVICE } from "../main";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { isAuth } = useAppData();

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuth) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    if (socketRef.current) return;

    const socket = io(REALTIME_SERVICE, {
      auth: {
        token: localStorage.getItem("token"),
      },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(`Socket connected`, socket.id);
    });

    socket.on("disconnect", () => {
      console.log(`Socket Disconnected`);
    });

    socket.on("connect_error", (err) => {
      console.log(`Socker error ${err.message}`);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuth]);

  return (
    // eslint-disable-next-line react-hooks/refs
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
