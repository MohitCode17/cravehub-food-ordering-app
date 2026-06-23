import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useState } from "react";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { RESTAURANT_SERVICE } from "../main";
import toast from "react-hot-toast";
import { VscLoading } from "react-icons/vsc";
import { BiMinus, BiPlus } from "react-icons/bi";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, subtotal, quantity, fetchCart } = useAppData();
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [clearingCart, setClearingCart] = useState(false);

  if (!cart || cart.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center">
        <div className="mb-4 text-6xl">🛒</div>

        <h2 className="text-2xl font-bold text-gray-800">Your Cart is Empty</h2>

        <p className="mt-2 text-gray-500">
          Add some delicious food to get started.
        </p>
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;

  const deliveryFee = subtotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subtotal + deliveryFee + platformFee;

  const increaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(
        `${RESTAURANT_SERVICE}/api/cart/inc`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      await fetchCart();
    } catch (error: any) {
      console.log(error);
      toast.error("Error increasing quantity");
    } finally {
      setLoadingItemId(null);
    }
  };

  const decreaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(
        `${RESTAURANT_SERVICE}/api/cart/dec`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      await fetchCart();
    } catch (error: any) {
      console.log(error);
      toast.error("Error decreasing quantity");
    } finally {
      setLoadingItemId(null);
    }
  };

  const clearCart = async () => {
    const confirm = window.confirm("Are you sure want to clear your cart?");

    if (!confirm) return;

    try {
      setClearingCart(true);
      await axios.delete(`${RESTAURANT_SERVICE}/api/cart/clear`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      await fetchCart();
    } catch (error: any) {
      console.log(error);
      toast.error("Error clearning cart");
    } finally {
      setClearingCart(false);
    }
  };

  const checkout = () => {
    navigate("/checkout");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Restaurant Header */}
      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-md mb-5">
        <h2 className="text-2xl font-bold">{restaurant.name}</h2>

        <p className="text-sm text-gray-500">
          {restaurant.autoLocation.formattedAddress}
        </p>
      </div>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <div className="space-y-4">
          {cart.map((cartItem: ICart) => {
            const item = cartItem.itemId as IMenuItem;
            const isLoading = loadingItemId === item._id;

            return (
              <div
                key={item._id}
                className="sm:flex justify-between gap-4 rounded-3xl border border-gray-100 bg-white p-2 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={item.image}
                    alt=""
                    className="h-22 w-22 object-cover rounded-2xl"
                  />

                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-sm font-medium text-[#e23744]">
                      ₹{item.price}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-5">
                  <div className="flex items-center sm:gap-3 gap-2">
                    <button
                      className="rounded-full border p-2 hover:bg-gray-100 disabled:opacity-50"
                      disabled={isLoading}
                      onClick={() => decreaseQty(item._id)}
                    >
                      {isLoading ? (
                        <VscLoading size={16} className="animate-spin" />
                      ) : (
                        <BiMinus size={16} />
                      )}
                    </button>
                    <span className="font-medium">{cartItem.quantity}</span>
                    <button
                      className="rounded-full border p-2 hover:bg-gray-100 disabled:opacity-50"
                      disabled={isLoading}
                      onClick={() => increaseQty(item._id)}
                    >
                      {isLoading ? (
                        <VscLoading size={16} className="animate-spin" />
                      ) : (
                        <BiPlus size={16} />
                      )}
                    </button>
                  </div>

                  <p className="sm:w-24 text-right text-lg font-bold text-gray-900">
                    ₹{item.price * cartItem.quantity}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {/* Order Summary Card */}
        <div className="sticky top-24 rounded-3xl border border-gray-100 bg-white p-6 shadow-xl space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Items</span>
            <span>{quantity}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Delivery Fee</span>
            <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Platform Fee</span>
            <span>₹{platformFee}</span>
          </div>
          {subtotal < 250 && (
            <div className="rounded-2xl bg-orange-50 p-3">
              <p className="text-sm text-orange-700">
                Add ₹{250 - subtotal} more for free delivery 🚚
              </p>
            </div>
          )}

          <div className="flex justify-between border-t pt-4 text-lg font-bold">
            <span>Grand Total</span>
            <span>₹{grandTotal}</span>
          </div>

          <button
            onClick={checkout}
            disabled={!restaurant.isOpen}
            className={`w-full rounded-2xl bg-[#e23744] py-4 font-semibold text-white transition hover:bg-[#d32f3a] ${!restaurant.isOpen ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {!restaurant.isOpen
              ? "Restaurant is Closed"
              : "Proceed to Checkout"}
          </button>

          <button
            disabled={clearingCart}
            onClick={clearCart}
            className="w-full rounded-2xl bg-gray-700 py-4 font-semibold text-white transition hover:bg-gray-800"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
