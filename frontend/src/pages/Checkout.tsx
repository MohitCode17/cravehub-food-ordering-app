import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { RESTAURANT_SERVICE, UTILS_SERVICE } from "../main";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import toast from "react-hot-toast";
import { BiCreditCard, BiLoader } from "react-icons/bi";

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, subtotal, quantity } = useAppData();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!cart || cart.length === 0) {
        setLoadingAddress(false);
        return;
      }

      try {
        const { data } = await axios.get(
          `${RESTAURANT_SERVICE}/api/address/all`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        setAddresses(data.addresses || []);
      } catch (error) {
        console.log("Error fetching addresses", error);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchAddresses();
  }, [cart]);

  if (!cart || cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500 text-lg">Your cart is empty</p>
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;

  const deliverFee = subtotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subtotal + deliverFee + platformFee;

  const createOrder = async (paymentMethod: "razorpay" | "stripe") => {
    if (!selectedAddressId) return null;

    setCreatingOrder(true);

    try {
      const { data } = await axios.post(
        `${RESTAURANT_SERVICE}/api/order/new`,
        {
          paymentMethod,
          addressId: selectedAddressId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      return data;
    } catch (error: any) {
      toast.error("Failed to create order", error);
    } finally {
      setCreatingOrder(false);
    }
  };

  const payWithRazorpay = async () => {
    try {
      setLoadingRazorpay(true);

      const order = await createOrder("razorpay");
      if (!order) return;

      const { orderId, amount } = order;

      const { data } = await axios.post(`${UTILS_SERVICE}/api/payment/create`, {
        orderId,
      });

      const { razorpayOrderId, key } = data;

      const options = {
        key,
        amount: amount * 100,
        currency: "INR",
        name: "Cravehub",
        description: "Food Order Payment",
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            await axios.post(`${UTILS_SERVICE}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });

            toast.success("Payment Successful");
            navigate("/paymentsuccess/" + response.razorpay_payment_id);
          } catch (error: any) {
            toast.error("Payment verification failed", error);
          }
        },
        theme: {
          color: "#e23744",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
      toast.error("Payment failed, Please refresh the page.");
    } finally {
      setLoadingRazorpay(false);
    }
  };

  const payWithStripe = async () => {
    alert(
      "Stripe payment gateway will be added soon, Thanks for your patience.",
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

        <p className="mt-1 text-gray-500">
          Review your order before placing it.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Restaurant Card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <img
              src={restaurant.image}
              className="hidden sm:flex h-20 w-20 rounded-2xl object-cover"
            />

            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {restaurant.name}
              </h2>

              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                {restaurant.autoLocation.formattedAddress}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-sm space-y-3 p-2">
          <h3 className="font-semibold">Delivery Address</h3>
          {loadingAddress ? (
            <p className="text-sm text-gray-500">Loading addresses...</p>
          ) : addresses.length === 0 ? (
            <p className="text-sm text-gray-500">
              No address found. Please add one
            </p>
          ) : (
            addresses.map((add) => (
              <label
                key={add._id}
                className={`block cursor-pointer rounded-2xl border p-2 transition ${selectedAddressId === add._id ? "border-[#e23744] bg-red-50" : "border-gray-200 hover:border-red-300"}`}
              >
                <input
                  type="radio"
                  checked={selectedAddressId === add._id}
                  onChange={() => setSelectedAddressId(add._id)}
                />

                <div className="text-sm font-medium">
                  {add.formattedAddress}
                </div>
                <div className="text-xs text-gray-600 mt-1">{add.mobile}</div>
              </label>
            ))
          )}
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm space-y-4">
          <h3 className="font-semibold">Order Summary</h3>

          {cart.map((cartItem: ICart) => {
            const item = cartItem.itemId as IMenuItem;

            return (
              <div className="flex justify-between text-sm" key={cartItem._id}>
                <span>
                  {item.name} x {cartItem.quantity}
                </span>
                <span>₹{item.price * cartItem.quantity}</span>
              </div>
            );
          })}
          <hr />

          <div className="flex justify-between text-sm">
            <span>Items ({quantity})</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <span>{deliverFee === 0 ? "Free" : `${deliverFee}`}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Platform Fee</span>
            <span>₹{platformFee}</span>
          </div>

          {subtotal < 250 && (
            <p className="text-xs text-gray-500">
              Add ₹{250 - subtotal} more for free delivery 🚚
            </p>
          )}

          <div className="flex justify-between text-base font-semibold border-t pt-2">
            <span>Grand Total</span>
            <span>₹${grandTotal}</span>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
          <h3 className="font-semibold">Payment Method</h3>
          <p className="mt-1 text-sm text-gray-500">
            Secure payment powered by Razorpay
          </p>
          <button
            disabled={!selectedAddressId || loadingRazorpay || creatingOrder}
            onClick={payWithRazorpay}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#e23744] py-3 text-sm font-semibold text-white hover:bg-[#ef1e1a] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {loadingRazorpay ? (
              <BiLoader size={18} className="animate-spin" />
            ) : (
              <BiCreditCard size={18} />
            )}
            Pay With Razorpay
          </button>

          <hr className="text-gray-300 my-5" />

          <button
            disabled={!selectedAddressId}
            onClick={payWithStripe}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#e23744] py-3 text-sm font-semibold text-white hover:bg-[#ef1e1a] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <BiCreditCard size={18} />
            Pay With Stripe
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
