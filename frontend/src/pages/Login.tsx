/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { AUTH_SERVICE } from "../main";
import authBanner from "../assets/auth-banner.jpg";
import { LuUtensilsCrossed } from "react-icons/lu";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const responseGoogle = async (authResult: any) => {
    setLoading(true);

    try {
      const result = await axios.post(`${AUTH_SERVICE}/api/auth/login`, {
        code: authResult["code"],
      });

      localStorage.setItem("token", result.data.token);
      toast.success(result.data.message);
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Problem while login, Please try again!");
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-red-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Section */}
        <div className="relative hidden lg:flex overflow-hidden">
          <img
            src={authBanner}
            alt="Food"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-20 text-white">
            <div className="max-w-lg">
              <h1 className="text-6xl font-bold leading-tight">
                Food
                <span className="text-[#e23774]"> Delivered</span>
                <br />
                At Your Doorstep
              </h1>

              <p className="mt-6 text-lg text-gray-200">
                Discover top-rated restaurants, order your favorite meals, and
                track deliveries in real-time with CraveHub.
              </p>

              <div className="mt-10 flex gap-4">
                <div className="rounded-2xl bg-white/10 backdrop-blur-md px-6 py-4">
                  <h3 className="text-2xl font-bold">500+</h3>
                  <p className="text-sm text-gray-200">Restaurants</p>
                </div>

                <div className="rounded-2xl bg-white/10 backdrop-blur-md px-6 py-4">
                  <h3 className="text-2xl font-bold">10k+</h3>
                  <p className="text-sm text-gray-200">Orders Delivered</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-center px-6">
          <div className="w-full max-w-md">
            <div className="rounded-3xl bg-white/80 backdrop-blur-xl p-8 shadow-2xl border border-white/30">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e23774]/10">
                  <LuUtensilsCrossed className="text-[#e23774]" />
                </div>
                <h1 className="text-4xl font-bold text-[#e23774]">CraveHub</h1>

                <p className="mt-3 text-gray-500">
                  Welcome back! Sign in to continue.
                </p>
              </div>

              <button
                disabled={loading}
                onClick={googleLogin}
                className="group flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
              >
                <FcGoogle size={22} />

                {loading ? "Signing in..." : "Continue with Google"}
              </button>

              <p className="mt-8 text-center text-xs leading-relaxed text-gray-400">
                By continuing, you agree to our{" "}
                <span className="cursor-pointer text-[#e23774] font-medium">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="cursor-pointer text-[#e23774] font-medium">
                  Privacy Policy
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
