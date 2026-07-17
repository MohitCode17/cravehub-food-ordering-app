import { useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { RESTAURANT_SERVICE } from "../main";
import toast from "react-hot-toast";
import { BiEdit, BiMapPin, BiSave } from "react-icons/bi";
import { useAppData } from "../context/AppContext";

interface props {
  restaurant: IRestaurant;
  isSeller: boolean;
  onUpdate: (restaurant: IRestaurant) => void;
}

const RestaurantProfile = ({ restaurant, isSeller, onUpdate }: props) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description);
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [loading, setLoading] = useState(false);
  const { setIsAuth, setUser } = useAppData();

  const toggleOpenStatus = async () => {
    try {
      const { data } = await axios.put(
        `${RESTAURANT_SERVICE}/api/restaurant/status`,
        { status: !isOpen },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success(data.message);
      setIsOpen(data.restaurant.isOpen);
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        `${RESTAURANT_SERVICE}/api/restaurant/edit`,
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success(data.message);
      onUpdate(data.restaurant);
      setEditMode(false);
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const logoutHandler = async () => {
    await axios.put(
      `${RESTAURANT_SERVICE}/api/restaurant/status`,
      { status: false },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    localStorage.setItem("token", "");
    setIsAuth(false);
    setUser(null);
    toast.success("Logout successfully");
  };

  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
      {restaurant.image && (
        <img
          src={restaurant.image}
          alt=""
          className="h-64 w-full object-cover"
        />
      )}

      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            {editMode ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-lg outline-none focus:border-[#e23744]"
              />
            ) : (
              <h2 className="text-3xl font-bold text-gray-900">
                {restaurant.name}
              </h2>
            )}

            <div className="mt-3 flex items-start gap-3 rounded-2xl bg-gray-50 p-3">
              <div className="rounded-xl bg-[#e23744]/10 p-2">
                <BiMapPin className="h-4 w-4 text-[#e23744]" />
              </div>

              <span className="text-sm text-gray-600">
                {restaurant.autoLocation.formattedAddress ||
                  "Location unavailable"}
              </span>
            </div>
          </div>

          {isSeller && (
            <button
              onClick={() => setEditMode(!editMode)}
              className="rounded-xl bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200"
            >
              <BiEdit size={18} />
            </button>
          )}
        </div>

        {editMode ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 p-4 outline-none focus:border-[#e23744]"
          />
        ) : (
          <p className="leading-7 text-gray-600">
            {restaurant.description || "No description added"}
          </p>
        )}

        {/* Bottom Section */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-5">
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {isOpen ? "Open" : "Closed"}
          </span>

          <div className="flex gap-3">
            {editMode && (
              <button
                onClick={saveChanges}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-[#e23744] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#d32f3a]"
              >
                <BiSave size={16} />
                Save
              </button>
            )}

            {isSeller && (
              <button
                onClick={toggleOpenStatus}
                className={`rounded-xl px-5 py-2 text-sm font-medium text-white transition ${isOpen ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}`}
              >
                {isOpen ? "Close Restaurant" : "Open Restaurant"}
              </button>
            )}

            {isSeller && (
              <button
                onClick={logoutHandler}
                className="rounded-xl px-5 py-2 text-sm font-medium text-white transition bg-red-500 hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        <p className="pt-4 text-xs text-gray-400">
          Created on {new Date(restaurant.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default RestaurantProfile;
