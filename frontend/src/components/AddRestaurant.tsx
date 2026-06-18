import { useState } from "react";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import { RESTAURANT_SERVICE } from "../main";
import { BiMapPin, BiUpload } from "react-icons/bi";

interface props {
  fetchMyRestaurant: () => Promise<void>;
}

const AddRestaurant = ({fetchMyRestaurant}: props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const { location, loadingLocation } = useAppData();

  const handleSubmit = async () => {
    if (!name || !image || !location) {
      alert("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("latitude", String(location.latitude));
    formData.append("longitude", String(location.longitude));
    formData.append("formattedAddress", location.formattedAddress);
    formData.append("file", image);
    formData.append("phone", phone);

    try {
      setLoading(true);

      await axios.post(`${RESTAURANT_SERVICE}/api/restaurant/new`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Restaurant added successfully");
      fetchMyRestaurant();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-red-50 px-4 py-10">
      <div className="mx-auto max-w-xl space-y-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Add Your Restaurant
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Start serving customers on CraveHub.
          </p>
        </div>
        <input
          type="text"
          placeholder="Restaurant Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm transition outline-none focus:border-[#e23744] focus:ring-2 focus:ring-[#e23744]/10"
        />
        <input
          type="number"
          placeholder="Contact Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm transition outline-none focus:border-[#e23744] focus:ring-2 focus:ring-[#e23744]/10"
        />
        <textarea
          placeholder="Restaurant Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm transition outline-none focus:border-[#e23744] focus:ring-2 focus:ring-[#e23744]/10"
          rows={4}
        />
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-[#e23744] hover:bg-red-50">
          <BiUpload className="h-8 w-8 text-[#e23744]" />
          <div>
            <p className="font-medium text-gray-800">
              {image ? image.name : "Upload Restaurant Image"}
            </p>

            <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
          </div>
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </label>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e23744]/10">
              <BiMapPin className="h-5 w-5 text-[#e23744]" />
            </div>

            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Restaurant Location
              </p>

              <p className="mt-1 text-sm font-medium text-gray-800">
                {loadingLocation ? (
                  <p
                    className={`mt-1 text-sm font-medium ${
                      loadingLocation ? "text-gray-500" : "text-gray-800"
                    }`}
                  >
                    Fetching your location...
                  </p>
                ) : (
                  location?.formattedAddress || "Location not available"
                )}
              </p>
            </div>
          </div>
        </div>
        <button
          disabled={loading}
          onClick={handleSubmit}
          className="w-full rounded-2xl bg-[#e23744] py-4 font-semibold text-white transition-all hover:bg-[#d32f3a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating Restaurant..." : "Create Restaurant"}
        </button>
      </div>
    </div>
  );
};

export default AddRestaurant;
