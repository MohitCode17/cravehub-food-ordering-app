import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import { BiLogOut, BiMapPin, BiPackage } from "react-icons/bi";

const Account = () => {
  const navigate = useNavigate();
  const { user, setUser, setIsAuth } = useAppData();

  const firstLetter = user?.name.charAt(0).toUpperCase();

  const logoutHandler = () => {
    localStorage.setItem("token", "");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
    toast.success("Logout Success");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-red-50 px-4 py-10">
      <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
        <div className="flex items-center gap-4 border-b bg-gray-50 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e23744] text-2xl font-bold text-white shadow-md">
            {firstLetter}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="p-2">
          <div
            className="mb-2 flex cursor-pointer items-center gap-4 rounded-2xl p-4 transition-all hover:bg-gray-50 hover:shadow-sm"
            onClick={() => navigate("/orders")}
          >
            <BiPackage className="h-5 w-5 text-red-500" />
            <span className="font-medium">Your Orders</span>
          </div>
          <div
            className="mb-2 flex cursor-pointer items-center gap-4 rounded-2xl p-4 transition-all hover:bg-gray-50 hover:shadow-sm"
            onClick={() => navigate("/address")}
          >
            <BiMapPin className="h-5 w-5 text-red-500" />
            <span className="font-medium">Address</span>
          </div>
          <div
            className="flex cursor-pointer items-center gap-4 rounded-2xl p-4 transition-all hover:bg-red-50"
            onClick={logoutHandler}
          >
            <BiLogOut className="h-5 w-5 text-red-600" />
            <span className="font-medium">Logout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
