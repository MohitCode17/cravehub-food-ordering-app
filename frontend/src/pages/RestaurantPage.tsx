import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { RESTAURANT_SERVICE } from "../main";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItems from "../components/MenuItems";

const RestaurantPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurant = async () => {
    try {
      const { data } = await axios.get(
        `${RESTAURANT_SERVICE}/api/restaurant/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setRestaurant(data.restaurant || null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data } = await axios.get(
        `${RESTAURANT_SERVICE}/api/item/all/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setMenuItems(data.items);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRestaurant();
      fetchMenuItems();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <p className="text-lg font-medium text-gray-700">
          Loading Restaurant...
        </p>

        <p className="mt-2 text-sm text-gray-500">Please wait a moment</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <h2 className="text-xl font-semibold text-gray-700">
          Restaurant Not Found
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          The restaurant you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-red-50 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <RestaurantProfile
          restaurant={restaurant}
          onUpdate={setRestaurant}
          isSeller={false}
        />

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
            <p className="mt-1 text-sm text-gray-500">
              Explore dishes available at this restaurant
            </p>
          </div>
          {menuItems.length === 0 ? (
            <div className="py-16 text-center">
              <h3 className="text-lg font-semibold text-gray-700">
                No Menu Items Available
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                This restaurant hasn't added any dishes yet.
              </p>
            </div>
          ) : (
            <MenuItems
              isSeller={false}
              items={menuItems}
              onItemDeleted={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantPage;
