import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { RESTAURANT_SERVICE } from "../main";
import AddRestaurant from "../components/AddRestaurant";

const Restaurant = () => {
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState(true);

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

  return <div>Restaurant</div>;
};

export default Restaurant;
