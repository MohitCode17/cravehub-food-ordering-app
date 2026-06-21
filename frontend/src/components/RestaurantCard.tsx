import { useNavigate } from "react-router-dom";

type props = {
  id: string;
  name: string;
  image: string;
  distance: string;
  isOpen: boolean;
};

const RestaurantCard = ({ id, name, image, distance, isOpen }: props) => {
  const navigate = useNavigate();

  return (
    <div
      className={`group cursor-pointer overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${!isOpen ? "opacity-80" : ""}`}
      onClick={() => navigate(`/restaurant/${id}`)}
    >
      <div className="relative h-52 w-full overflow-hidden">
        <img
          src={image}
          alt=""
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${!isOpen ? "grayscale" : ""}`}
        />

        {!isOpen && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
            Closed
          </span>
        )}
      </div>

      <div className="space-y-3 p-4">
        <h3 className="truncate text-lg font-bold text-gray-900">{name}</h3>
        <div className="flex items-center justify-between">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {isOpen ? "Open Now" : "Closed"}
          </span>
          <span className="text-sm text-gray-600">{distance} km away</span>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
