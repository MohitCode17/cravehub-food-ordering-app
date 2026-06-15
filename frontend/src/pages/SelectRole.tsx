import { useState } from "react";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AUTH_SERVICE } from "../main";
import toast from "react-hot-toast";

interface RoleCard {
  value: Role;
  icon: string;
  title: string;
  description: string;
}

type Role = "customer" | "rider" | "seller";

const SelectRole = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const { setUser } = useAppData();

  const roles: RoleCard[] = [
    {
      value: "customer",
      icon: "🍔",
      title: "Customer",
      description: "Order food from your favorite restaurants",
    },
    {
      value: "rider",
      icon: "🛵",
      title: "Rider",
      description: "Deliver orders and earn money",
    },
    {
      value: "seller",
      icon: "🏪",
      title: "Seller",
      description: "Manage your restaurant and menu",
    },
  ];

  const token = localStorage.getItem("token");

  const addRole = async () => {
    try {
      const { data } = await axios.put(
        `${AUTH_SERVICE}/api/auth/add-role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      localStorage.setItem("token", data.token);
      setUser(data.user);

      navigate("/", { replace: true });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-red-50 px-6">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center">
        {/* Role Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome to
            <span className="text-[#e23744]"> CraveHub</span>
          </h1>

          <p className="mt-3 text-gray-500">
            Select how you'd like to use the platform
          </p>
        </div>

        {/* Role Card */}
        <div className="grid gap-6 md:grid-cols-3">
          {roles.map((r) => (
            <button
              key={r.value}
              onClick={() => setRole(r.value as Role)}
              className={`rounded-3xl border p-8 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer

              ${
                role === r.value
                  ? "border-[#e23744] bg-[#e23744] text-white shadow-xl"
                  : "border-gray-200 bg-white"
              }
            `}
            >
              <div className="mb-4 text-5xl">{r.icon}</div>

              <h3 className="text-xl font-bold">{r.title}</h3>

              <p
                className={`mt-2 text-sm ${
                  role === r.value ? "text-white/80" : "text-gray-500"
                }`}
              >
                {r.description}
              </p>
            </button>
          ))}
        </div>

        {/* Continue button */}
        <div className="mt-10 flex justify-center">
          <button
            disabled={!role}
            onClick={addRole}
            className={`
      rounded-2xl
      px-10
      py-4
      font-semibold
      transition-all
      duration-300

      ${
        role
          ? "bg-[#e23744] text-white hover:scale-105 hover:shadow-lg"
          : "bg-gray-200 text-gray-400 cursor-not-allowed"
      }
    `}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;
