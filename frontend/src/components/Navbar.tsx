import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import { CgShoppingCart } from "react-icons/cg";
import { BiMapPin, BiSearch } from "react-icons/bi";

const Navbar = () => {
  const currentLocation = useLocation();
  const { isAuth, city, quantity } = useAppData();
  
  const isHomePage = currentLocation.pathname === "/";

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    // Debouncing
    const timer = setTimeout(() => {
      if (search) {
        setSearchParams({ search });
      } else {
        setSearchParams({});
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-[#e23744] text-white">
            🍔
          </div>

          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
              CraveHub
            </h1>

            <p className="text-xs text-gray-500">Food Delivery</p>
          </div>
        </Link>

        <div className="flex items-center gap-5">
          <Link
            to={"/cart"}
            className=" relative rounded-xl p-2 transition-all hover:bg-gray-100"
          >
            <CgShoppingCart className="h-6 w-6 text-gray-700" />
            <span className=" absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#e23744] text-[10px] font-bold text-white">
              {quantity}
            </span>
          </Link>

          {isAuth ? (
            <Link
              to={"/account"}
              className="rounded-xl bg-[#e23744] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#d32f3a]"
            >
              Account
            </Link>
          ) : (
            <Link
              to={"/login"}
              className="rounded-xl bg-[#e23744] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#d32f3a]"
            >
              Login
            </Link>
          )}
        </div>
      </div>
      {/* Search Bar */}
      {isHomePage && (
        <div className="border-t bg-gray-50 px-4 py-4">
          <div className=" mx-auto flex max-w-5xl items-center overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
            <div className="flex items-center gap-2 border-r px-4 py-3 text-gray-700">
              <BiMapPin className="h-4 w-4 text-[#e23744]" />
              <span className="max-w-36 truncate text-sm font-medium">
                {city}
              </span>
            </div>
            <div className="flex flex-1 items-center gap-2 px-4">
              <BiSearch className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for restaurant"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-3 text-sm outline-none placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
