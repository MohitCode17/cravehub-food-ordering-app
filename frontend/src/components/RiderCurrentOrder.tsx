import axios from "axios";
import type { IOrder } from "../types";
import { RIDER_SERVICE } from "../main";
import toast from "react-hot-toast";

interface Props {
  order: IOrder;
  onStatusUpdate: () => void;
}

const RiderCurrentOrder = ({ order, onStatusUpdate }: Props) => {
  const updateStatus = async () => {
    try {
      await axios.put(
        `${RIDER_SERVICE}/api/rider/order/update/${order._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success("Order status updated");
      onStatusUpdate();
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl mt-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Current Delivery</h2>
          <p className="mt-1 text-sm text-gray-500">
            Deliver this order safely to the customer.
          </p>
        </div>

        <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold capitalize text-blue-700">
          {order.status.replaceAll("_", " ")}
        </span>
      </div>

      {/* Order Details */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Pickup Restaurant
          </p>

          <p className="mt-2 font-semibold text-gray-900">
            {order.restaurantName}
          </p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Delivery Address
          </p>

          <p className="mt-2 leading-6 text-gray-800">
            {order.deliveryAddress.formattedAddress}
          </p>
        </div>
      </div>

      {/* Earnings */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-green-50 p-5">
          <p className="text-sm text-gray-500">Order Total</p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            ₹{order.totalAmount}
          </p>
        </div>

        <div className="rounded-2xl bg-red-50 p-5">
          <p className="text-sm text-gray-500">Your Earnings</p>

          <p className="mt-2 text-2xl font-bold text-[#e23744]">
            ₹{order.riderAmount}
          </p>
        </div>
      </div>

      {/* Customer */}
      {order.deliveryAddress.mobile && (
        <div className="mt-6 rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Customer Contact</p>

              <p className="mt-1 text-lg font-semibold text-gray-900">
                {order.deliveryAddress.mobile}
              </p>
            </div>

            <a
              href={`tel:${order.deliveryAddress.mobile}`}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              📞 Call
            </a>
          </div>
        </div>
      )}

      {/* Action */}
      {order.status === "rider_assigned" && (
        <div className="mt-8">
          <button
            onClick={updateStatus}
            className="w-full rounded-2xl bg-[#e23744] py-4 text-base font-semibold text-white transition hover:bg-[#d32f3a]"
          >
            I've Reached the Restaurant
          </button>
        </div>
      )}

      {order.status === "picked_up" && (
        <div className="mt-8">
          <button
            onClick={updateStatus}
            className="w-full rounded-2xl bg-[#e23744] py-4 text-base font-semibold text-white transition hover:bg-[#d32f3a]"
          >
            Mark as Delivered
          </button>
        </div>
      )}
    </div>
  );
};

export default RiderCurrentOrder;
