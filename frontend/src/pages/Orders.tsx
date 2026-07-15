import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { RESTAURANT_SERVICE } from "../main";
import { statusStyles } from "../utils/statusStyles";

const ACTIVE_STATUS = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
];

const Orders = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${RESTAURANT_SERVICE}/api/order/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setOrders(data.orders || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = () => {
      fetchOrders();
    };

    socket.on("order:update", onOrderUpdate);

    return () => {
      socket.off("order:update", onOrderUpdate);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl border border-gray-100 bg-white px-10 py-8 text-center shadow-md">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-red-100 border-t-[#e23744]" />
          <p className="font-medium text-gray-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 bg-white py-20 text-center">
        <div className="mb-4 text-6xl">📦</div>

        <h2 className="text-xl font-semibold text-gray-900">No Orders Yet</h2>

        <p className="mt-2 text-gray-500">
          Looks like you haven't placed any orders yet.
        </p>

        <button
          onClick={() => navigate("/")}
          className="mt-6 rounded-xl bg-[#e23744] px-6 py-3 font-medium text-white hover:bg-red-600"
        >
          Explore Restaurants
        </button>
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
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Headers */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>

          <p className="mt-1 text-gray-500">
            Track your active and completed food orders.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="rounded-2xl bg-orange-50 px-5 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Active
            </p>

            <p className="text-2xl font-bold text-orange-600">
              {activeOrders.length}
            </p>
          </div>

          <div className="rounded-2xl bg-green-50 px-5 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Completed
            </p>

            <p className="text-2xl font-bold text-green-600">
              {completedOrders.length}
            </p>
          </div>
        </div>
      </div>
      {/* Active Order Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Active Orders</h2>

          <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-600">
            {activeOrders.length}
          </span>
        </div>
        {activeOrders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 py-12 text-center">
            <div className="text-5xl">🍔</div>

            <h3 className="mt-3 font-semibold">No Active Orders</h3>

            <p className="mt-2 text-sm text-gray-500">
              Your current orders will appear here.
            </p>
          </div>
        ) : (
          activeOrders.map((order) => (
            <OrderRow
              key={order._id}
              order={order}
              onClick={() => navigate(`/order/${order._id}`)}
            />
          ))
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Completed Orders</h2>

          <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-600">
            {completedOrders.length}
          </span>
        </div>
        {completedOrders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 py-12 text-center">
            <div className="text-5xl">🍔</div>

            <h3 className="mt-3 font-semibold">No Completed Orders</h3>

            <p className="mt-2 text-sm text-gray-500">
              Your completed orders will appear here.
            </p>
          </div>
        ) : (
          completedOrders.map((order) => (
            <OrderRow
              key={order._id}
              order={order}
              onClick={() => navigate(`/order/${order._id}`)}
            />
          ))
        )}
      </section>
    </div>
  );
};

export default Orders;

const OrderRow = ({
  order,
  onClick,
}: {
  order: IOrder;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-gray-800 font-bold">
          Order #{order._id.slice(-6)}
        </p>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.status]}`}
        >
          {order.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="mt-4 space-y-1 text-sm text-gray-600">
        {order.items.map((item, i) => (
          <span key={i}>
            {item.name} x {item.quantity}
            {i < order.items.length - 1 && ", "}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t pt-4">
        <div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-lg font-bold">₹{order.totalAmount}</p>
        </div>

        <div className="text-[#e23744] font-semibold">View Details →</div>
      </div>
    </div>
  );
};
