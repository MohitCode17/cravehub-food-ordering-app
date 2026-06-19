import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { RESTAURANT_SERVICE } from "../main";
import AddRestaurant from "../components/AddRestaurant";
import RestaurantProfile from "../components/RestaurantProfile";
import { BiFoodMenu, BiPlusCircle, BiBarChart } from "react-icons/bi";
import MenuItems from "../components/MenuItems";
import AddMenuItem from "../components/AddMenuItem";

type SellerTab = "menu" | "add-item" | "sales";

const Restaurant = () => {
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<SellerTab>("menu");

  const token = localStorage.getItem("token");

  const fetchMyRestaurant = async () => {
    try {
      const { data } = await axios.get(
        `${RESTAURANT_SERVICE}/api/restaurant/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setRestaurant(data.restaurant || null);

      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRestaurant();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading your restaurant...</p>
      </div>
    );

  if (!restaurant) {
    return <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-red-50 px-4 py-8">
      <RestaurantProfile
        restaurant={restaurant}
        onUpdate={setRestaurant}
        isSeller={true}
      />

      <div className="rounded-3xl border border-gray-100 bg-white p-2 mt-10 shadow-md">
        <div className="flex gap-2">
          {[
            {
              key: "menu",
              label: "Menu",
              icon: <BiFoodMenu />,
            },
            {
              key: "add-item",
              label: "Add Item",
              icon: <BiPlusCircle />,
            },
            {
              key: "sales",
              label: "Sales",
              icon: <BiBarChart />,
            },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as SellerTab)}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${tab === t.key ? "bg-[#e23744] text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <div className="flex items-center justify-center gap-2">
                {t.icon}
                <span>{t.label}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "menu" && <MenuItems />}
          {tab === "add-item" && <AddMenuItem onItemAdded={() => {}} />}
          {tab === "sales" && <p>Sales Page</p>}
        </div>
      </div>
    </div>
  );
};

export default Restaurant;
