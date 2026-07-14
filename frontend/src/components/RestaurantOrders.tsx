import { useEffect, useRef, useState } from "react";
import type { IOrder } from "../types";
import { useSocket } from "../context/SocketContext";
import audio from "../assets/notification.mp3";
import axios from "axios";
import { RESTAURANT_SERVICE } from "../main";
import OrderCard from "./OrderCard";

const ACTIVE_STATUS = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
];

const RestaurantOrders = ({ restaurantId }: { restaurantId: string }) => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const { socket } = useSocket();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audio);
  }, []);

  const unlockAudio = () => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          audioRef.current!.pause();
          audioRef.current!.currentTime = 0;
          setAudioUnlocked(true);
          console.log("Audio unlocked");
        })
        .catch((err) => {
          console.log("Failed to unlock audio: ", err);
        });
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        `${RESTAURANT_SERVICE}/api/order/restaurant/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setOrders(data.orders || []);
    } catch (err) {
      console.log("Failed to fetch restaurants orders: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [restaurantId]);

  useEffect(() => {
    if (!socket) return;

    const onNewOrder = () => {
      console.log("New order received socket");

      if (audioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.log("Failed to play audio: ", err);
        });
      }

      fetchOrders();
    };
    socket.on("order:new", onNewOrder);

    return () => {
      socket.off("order:new", onNewOrder);
    };
  }, [socket, audioUnlocked]);

  if (loading) {
    return (
      <div className="mt-8 rounded-3xl border bg-white p-12 text-center shadow-md">
        <p className="text-gray-500">Loading orders...</p>
      </div>
    );
  }

  // Active Orders
  const activeOrders = orders.filter((o) => ACTIVE_STATUS.includes(o.status));

  // Completed Orders
  const completedOrders = orders.filter(
    (o) => !ACTIVE_STATUS.includes(o.status),
  );

  return (
    <div className="mt-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-md space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>

          <p className="text-sm text-gray-500">
            Manage all incoming and completed orders.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="rounded-2xl bg-red-50 px-5 py-3">
            <p className="text-xs text-gray-500">Active Orders</p>

            <p className="text-xl font-bold text-red-500">
              {activeOrders.length}
            </p>
          </div>

          <div className="rounded-2xl bg-green-50 px-5 py-3">
            <p className="text-xs text-gray-500">Completed Orders</p>

            <p className="text-xl font-bold text-green-600">
              {completedOrders.length}
            </p>
          </div>
        </div>
      </div>

      {!audioUnlocked && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="font-medium text-blue-900">
                Enable Sound Notification
              </p>
              <p className="text-sm text-blue-700">
                Get notified whenever a new order arrives.
              </p>
            </div>
          </div>
          <button
            onClick={unlockAudio}
            className="w-full md:w-auto rounded-xl bg-blue-600 px-5 py-2.5 text-white font-medium transition hover:bg-blue-700"
          >
            Enable sound
          </button>
        </div>
      )}
      {/* Active Orders */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Active Orders</h3>

          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
            {activeOrders.length}
          </span>
        </div>
        {activeOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 py-10 text-center">
            <div className="text-5xl mb-3">📦</div>

            <h4 className="font-semibold text-gray-700">No Active Orders</h4>

            <p className="mt-1 text-sm text-gray-500">
              New customer orders will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {activeOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusUpdate={fetchOrders}
              />
            ))}
          </div>
        )}
      </div>
      {/* Completed Order Orders */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            Completed Orders
          </h3>

          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-600">
            {completedOrders.length}
          </span>
        </div>
        {completedOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 py-10 text-center">
            <div className="text-5xl mb-3">📦</div>

            <h4 className="font-semibold text-gray-700">No Completed Orders</h4>

            <p className="mt-1 text-sm text-gray-500">
              Completed orders will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {completedOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusUpdate={fetchOrders}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantOrders;
