import axios from "axios";
import { useState } from "react";
import { RESTAURANT_SERVICE } from "../main";
import toast from "react-hot-toast";
import { BiUpload } from "react-icons/bi";

type props = {
  onItemAdded: () => void;
};

const AddMenuItem = ({ onItemAdded }: props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImage(null);
  };

  const handleSubmit = async () => {
    if (!name || !price || !image) {
      alert("Name, price and image is required");
      return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("file", image);

    try {
      setLoading(true);

      const { data } = await axios.post(
        `${RESTAURANT_SERVICE}/api/item/new`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success(data.message);
      resetForm();
      onItemAdded();
    } catch (error) {
      console.log(error);
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add Your Item</h1>
      </div>
      <input
        type="text"
        placeholder="Item Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm transition outline-none focus:border-[#e23744] focus:ring-2 focus:ring-[#e23744]/10"
      />
      <input
        type="number"
        placeholder="Item Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm transition outline-none focus:border-[#e23744] focus:ring-2 focus:ring-[#e23744]/10"
      />
      <textarea
        placeholder="Item Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm transition outline-none focus:border-[#e23744] focus:ring-2 focus:ring-[#e23744]/10"
        rows={4}
      />
      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-[#e23744] hover:bg-red-50">
        <BiUpload className="h-8 w-8 text-[#e23744]" />
        <div>
          <p className="font-medium text-gray-800">
            {image ? image.name : "Upload Item Image"}
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

      <button
        disabled={loading}
        onClick={handleSubmit}
        className="w-full rounded-2xl bg-[#e23744] py-4 font-semibold text-white transition-all hover:bg-[#d32f3a] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating Item..." : "Create Item"}
      </button>
    </div>
  );
};

export default AddMenuItem;
