import { useState } from "react";
import type { IMenuItem } from "../types";
import { BsCart, BsEye } from "react-icons/bs";
import { FiEyeOff } from "react-icons/fi";
import { BiTrash } from "react-icons/bi";
import { VscLoading } from "react-icons/vsc";
import axios from "axios";
import { RESTAURANT_SERVICE } from "../main";
import toast from "react-hot-toast";

interface MenuItemsProps {
  items: IMenuItem[];
  onItemDeleted: () => void;
  isSeller: boolean;
}

const MenuItems = ({ items, isSeller, onItemDeleted }: MenuItemsProps) => {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const handleDelete = async (itemId: string) => {
    const confirm = window.confirm("Are you sure you want to delete this item");

    if (!confirm) return;

    try {
      const { data } = await axios.delete(
        `${RESTAURANT_SERVICE}/api/item/${itemId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success(data.message);
      onItemDeleted();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete item");
    }
  };

  const toggleAvailiblity = async (itemId: string) => {
    try {
      const { data } = await axios.put(
        `${RESTAURANT_SERVICE}/api/item/status/${itemId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success(data.message);
      onItemDeleted();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const isLoading = loadingItemId === item._id;

        return (
          <div
            className={`relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${!item.isAvailable ? "opacity-75" : ""}`}
          >
            <div className="relative shrink-0">
              <img
                src={item.image}
                alt=""
                className={`h-48 w-full object-cover ${!item.isAvailable ? "grayscale brightness-75" : ""}`}
              />
              {!item.isAvailable && (
                <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                  Unavailable
                </span>
              )}
            </div>
            <div className="space-y-3 p-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                {item.description && (
                  <p className="text-sm leading-6 text-gray-500 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-[#e23744]">
                  ₹{item.price}
                </p>

                {isSeller && (
                  <div className="flex gap-2">
                    <button
                      className="rounded-xl bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200"
                      onClick={() => toggleAvailiblity(item._id)}
                    >
                      {item.isAvailable ? (
                        <BsEye size={18} />
                      ) : (
                        <FiEyeOff size={18} />
                      )}
                    </button>

                    <button
                      className="rounded-xl bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                      onClick={() => handleDelete(item._id)}
                    >
                      <BiTrash size={18} />
                    </button>
                  </div>
                )}

                {!isSeller && (
                  <button
                    className={`flex items-center gap-2 rounded-xl bg-[#e23744] px-4 py-2 text-sm font-medium text-white transition ${!item.isAvailable || isLoading ? "cursor-not-allowed opacity-60" : "hover:bg-[#d32f3a]"}`}
                  >
                    {isLoading ? (
                      <VscLoading size={18} className="animate-spin" />
                    ) : (
                      <>
                        <BsCart size={16} />
                        Add
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MenuItems;
