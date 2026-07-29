import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import axios from "axios";
import { RESTAURANT_SERVICE } from "../main";
import { statusStyles } from "../utils/statusStyles";
import UserOrderMap from "../components/UserOrderMap";

const OrderDetails = () => {
  const { id } = useParams();
  const { socket } = useSocket();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(
    null,
  );

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(
        `${RESTAURANT_SERVICE}/api/order/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setOrder(data.order);
    } catch (error) {
      console.log("Error fetching order details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = () => {
      fetchOrder();
    };

    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);

    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !id) return;

    socket.emit("join", `user:${id}`);

    return () => {
      socket.emit("leave", `user:${id}`);
    };
  }, [socket, id]);

  useEffect(() => {
    if (!socket) return;

    const onRiderLocation = ({ latitude, longitude }: any) => {
      console.log("Rider location:", latitude, longitude);
      setRiderLocation([latitude, longitude]);
    };
    socket.on("rider:location", onRiderLocation);

    return () => {
      socket.off("rider:location", onRiderLocation);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl border border-gray-100 bg-white px-10 py-8 text-center shadow-md">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-red-100 border-t-[#e23744]" />
          <p className="font-medium text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-md">
          <div className="mb-4 text-6xl">📦</div>

          <h2 className="text-2xl font-bold text-gray-900">Order Not Found</h2>

          <p className="mt-2 text-gray-500">We couldn't find this order.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-md">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-500">Order ID</p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              #{order._id.slice(-6)}
            </h1>
          </div>

          <span
            className={`rounded-full px-5 py-2 text-sm font-semibold capitalize ${statusStyles[order.status]}`}
          >
            {order.status.replaceAll("_", " ")}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-md">
            <h2 className="mb-5 text-xl font-bold text-gray-900">Items</h2>

            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-none"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>

                    <p className="text-sm text-gray-500">
                      Qty : {item.quantity}
                    </p>
                  </div>

                  <p className="font-bold text-[#e23744]">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Delivery Address
            </h2>

            <p className="leading-7 text-gray-700">
              {order.deliveryAddress.formattedAddress}
            </p>

            <div className="mt-4 rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Contact Number</p>

              <p className="font-semibold">{order.deliveryAddress.mobile}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-md">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              Payment Summary
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>

                <span>₹{order.subtotal}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Fee</span>

                <span>
                  {order.deliveryFee === 0 ? "Free" : `₹${order.deliveryFee}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Platform Fee</span>

                <span>₹{order.platformFee}</span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>

                  <span className="text-[#e23744]">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-md">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              Payment Details
            </h2>

            <div className="space-y-5">
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>

                <p className="mt-1 font-semibold capitalize">
                  {order.paymentMethod}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Payment Status</p>

                <span
                  className={`mt-2 inline-block rounded-full capitalize px-4 py-1 text-sm font-semibold ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {(order.status === "rider_assigned" || order.status === "picked_up") &&
        (riderLocation ? (
          <UserOrderMap
            riderLocation={riderLocation}
            deliveryLocation={[
              order.deliveryAddress.latitude!,
              order.deliveryAddress.longitude!,
            ]}
          />
        ) : (
          <p>Waiting for rider</p>
        ))}
    </div>
  );
};

export default OrderDetails;
