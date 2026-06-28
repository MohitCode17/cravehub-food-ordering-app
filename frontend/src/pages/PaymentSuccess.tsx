import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect } from "react";
import { BiCheckCircle } from "react-icons/bi";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { paymentId } = useParams<{ paymentId: string }>();
  const { fetchCart } = useAppData();

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <div className="min-h-[80vh] bg-linear-to-b from-green-50 via-white to-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
          <BiCheckCircle size={56} className="text-green-600" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Payment Successful 🎉
        </h1>

        <p className="mt-2 text-gray-500">
          Your order has been placed successfully. The restaurant has started
          preparing your food.
        </p>
        {paymentId && (
          <div className="mt-8 rounded-2xl bg-gray-50 border border-gray-200 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Payment ID
            </p>

            <p className="mt-2 break-all font-mono text-sm text-gray-800">
              {paymentId}
            </p>
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Estimated Delivery</span>

            <span className="font-bold text-green-700">25–35 mins</span>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => navigate("/")}
            className="w-full rounded-xl bg-[#e23744] py-3 font-semibold text-white transition hover:bg-[#d42f3f]"
          >
            Order More
          </button>

          <button
            onClick={() => navigate("/orders")}
            className="w-full rounded-xl border border-gray-300 bg-white py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            View Orders
          </button>
        </div>
        <p className="mt-6 text-center text-xs text-gray-400">
          Thank you for choosing CraveHub ❤️
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
