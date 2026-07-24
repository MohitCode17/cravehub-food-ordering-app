import axios from "axios";
import { useEffect, useState } from "react";
import { RIDER_SERVICE } from "../main";
import toast from "react-hot-toast";

interface Props {
  orderId: string;
  onAccepted: () => void;
}

const RiderOrderRequest = ({ orderId, onAccepted }: Props) => {
  const [accepting, setAccepting] = useState(false);
  const [secondLeft, setSecondLeft] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onAccepted();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const acceptOrder = async () => {
    setAccepting(true);
    try {
      await axios.post(
        `${RIDER_SERVICE}/api/rider/accept/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success("Order Accepted");
      onAccepted();
    } catch (error: any) {
      toast.error(error.response.data.message);
      onAccepted();
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-lg transition hover:shadow-xl">
      {/* Top Banner */}

      <div className="flex items-center justify-between bg-gradient-to-r from-[#e23744] to-red-500 px-6 py-4 text-white">
        <div>
          <p className="text-xs uppercase tracking-wider opacity-80">
            New Delivery
          </p>

          <h3 className="text-lg font-bold">Delivery Request</h3>
        </div>

        <div className="rounded-full bg-white/20 px-4 py-2 text-xl font-bold">
          {secondLeft}s
        </div>
      </div>

      {/* Content */}

      <div className="space-y-5 p-6">
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Order ID
          </p>

          <p className="mt-1 font-bold text-gray-900">#{orderId.slice(-6)}</p>
        </div>

        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm font-medium text-yellow-700">
            ⏳ Accept this request before the timer expires.
          </p>
        </div>

        <button
          disabled={accepting}
          onClick={acceptOrder}
          className="w-full rounded-2xl bg-green-600 py-4 text-base font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {accepting ? "Accepting..." : "Accept Order"}
        </button>
      </div>
    </div>
  );
};

export default RiderOrderRequest;
