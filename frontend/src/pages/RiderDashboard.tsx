import { useEffect, useRef, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { RIDER_SERVICE } from "../main";
import toast from "react-hot-toast";
import LoadingUI from "../utils/Loading";
import { BiUpload } from "react-icons/bi";
import type { IOrder } from "../types";
import audio from "../assets/alert.mp3";
import RiderOrderRequest from "../components/RiderOrderRequest";
import RiderCurrentOrder from "../components/RiderCurrentOrder";

interface IRider {
  _id: string;
  picture: string;
  phoneNumber: string;
  adhaarNumber: string;
  drivingLicenceNumber: string;
  isVerified: boolean;
  isAvailable: boolean;
}

const RiderDashboard = () => {
  const { user } = useAppData();
  const { socket } = useSocket();
  const [profile, setProfile] = useState<IRider | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [incomingOrders, setIncomingOrders] = useState<string[]>([]);
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [adhaarNumber, setAdhaarNumber] = useState("");
  const [drivingLicenceNumber, setDrivingLicenceNumber] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audio);
    audioRef.current.preload = "auto";
  }, []);

  const unlockAudio = async () => {
    try {
      if (!audioRef.current) return;
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioUnlocked(true);
      toast.success("Sound Enable");
    } catch (error) {
      console.log("Error unlocking audio for rider dashboard", error);
      toast.error("Tap again to enable sound");
    }
  };

  useEffect(() => {
    if (!socket) return;

    const onOrderAvailable = ({ orderId }: { orderId: string }) => {
      setIncomingOrders((prev) =>
        prev.includes(orderId) ? prev : [...prev, orderId],
      );

      if (audioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      setTimeout(() => {
        setIncomingOrders((prev) => prev.filter((id) => id !== orderId));
      }, 10000);
    };

    socket.on("order:available", onOrderAvailable);

    return () => {
      socket.off("order:available", onOrderAvailable);
    };
  }, [socket, audioUnlocked]);

  // Fetch Rider Profile
  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${RIDER_SERVICE}/api/rider/myprofile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setProfile(data.profile || null);
    } catch (error) {
      console.log("Error fetching rider profile", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "rider") fetchProfile();
    else setLoading(false);
  }, [user]);

  // Fetch Current Order
  const fetchCurrentOrder = async () => {
    try {
      const { data } = await axios.get(
        `${RIDER_SERVICE}/api/rider/order/current`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setCurrentOrder(data.order);
    } catch (error) {
      console.log(error);
      setCurrentOrder(null);
    }
  };

  useEffect(() => {
    fetchCurrentOrder();
  }, []);

  // Toggle offline or online feature
  const toggleAvailability = async () => {
    if (!navigator.geolocation) {
      toast.error("Location Access Required");
      return;
    }

    setToggling(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await axios.patch(
          `${RIDER_SERVICE}/api/rider/toggle`,
          {
            isAvailable: !profile?.isAvailable,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        toast.success(
          profile?.isAvailable ? "You are offline" : "You are online",
        );

        fetchProfile();
      } catch (error: any) {
        toast.error(error.response.data.message);
      } finally {
        setToggling(false);
      }
    });
  };

  // Create Rider Profile
  const handleSubmit = async () => {
    if (!navigator.geolocation) {
      toast.error("Location Access Required");
      return;
    }

    setSubmitting(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const formData = new FormData();

      formData.append("adhaarNumber", adhaarNumber);
      formData.append("phoneNumber", phoneNumber);
      formData.append("drivingLicenceNumber", drivingLicenceNumber);
      formData.append("latitude", pos.coords.latitude.toString());
      formData.append("longitude", pos.coords.longitude.toString());

      if (image) {
        formData.append("file", image);
      }

      try {
        const { data } = await axios.post(
          `${RIDER_SERVICE}/api/rider/new`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        toast.success(data.messge || "You profile has created successfully");
        fetchProfile();
      } catch (error: any) {
        toast.error(error.response.data.message);
      } finally {
        setSubmitting(false);
      }
    });
  };

  if (user?.role !== "rider") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        You are not registered as rider
      </div>
    );
  }

  if (loading) {
    return <LoadingUI loadingContent="Loading rider details..." />;
  }

  if (!profile)
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-red-50 px-4 py-10">
        <div className="mx-auto max-w-xl space-y-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Add Your Profile
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Start deliver customers on CraveHub.
            </p>
          </div>
          <input
            type="text"
            placeholder="Aadhaar Number"
            value={adhaarNumber}
            onChange={(e) => setAdhaarNumber(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm transition outline-none focus:border-[#e23744] focus:ring-2 focus:ring-[#e23744]/10"
          />
          <input
            type="text"
            placeholder="Driving Licence Number"
            value={drivingLicenceNumber}
            onChange={(e) => setDrivingLicenceNumber(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm transition outline-none focus:border-[#e23744] focus:ring-2 focus:ring-[#e23744]/10"
          />
          <input
            type="number"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm transition outline-none focus:border-[#e23744] focus:ring-2 focus:ring-[#e23744]/10"
          />
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-[#e23744] hover:bg-red-50">
            <BiUpload className="h-8 w-8 text-[#e23744]" />
            <div>
              <p className="font-medium text-gray-800">
                {image ? image.name : "Upload Your Image"}
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
            disabled={submitting}
            onClick={handleSubmit}
            className="w-full rounded-2xl bg-[#e23744] py-4 font-semibold text-white transition-all hover:bg-[#d32f3a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating profile..." : "Add Profile"}
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-red-50 px-4 py-10">
      <div className="mx-auto max-w-xl rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
        {/* Profile */}
        <div className="flex flex-col items-center">
          <img
            src={profile.picture}
            alt={user?.name}
            className="h-28 w-28 rounded-full border-4 border-red-100 object-cover shadow-md"
          />

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            {user?.name}
          </h1>

          <p className="mt-1 text-gray-500">{profile.phoneNumber}</p>

          <span
            className={`mt-4 rounded-full px-4 py-1 text-sm font-semibold ${
              profile.isVerified
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {profile.isVerified ? "✓ Verified Rider" : "Verification Pending"}
          </span>
        </div>

        {/* Divider */}

        <div className="my-8 border-t border-gray-100" />

        {/* Rider Details */}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Aadhaar
            </p>

            <p className="mt-2 font-semibold text-gray-900">
              {profile.adhaarNumber}
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Licence
            </p>

            <p className="mt-2 font-semibold text-gray-900">
              {profile.drivingLicenceNumber}
            </p>
          </div>
        </div>

        {/* Notice */}

        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <h3 className="font-semibold text-blue-900">Rider Tip</h3>

          <p className="mt-2 text-sm leading-6 text-blue-700">
            Stay within a <strong>500 meter radius</strong> of a restaurant
            hotspot before going online. This helps you receive delivery
            requests faster.
          </p>
        </div>

        {/* Availability */}
        {profile.isVerified && !currentOrder && (
          <div className="mt-8">
            <button
              onClick={toggleAvailability}
              disabled={toggling}
              className={`w-full rounded-2xl py-4 text-base font-semibold text-white transition-all ${
                toggling
                  ? "cursor-not-allowed bg-gray-400"
                  : profile.isAvailable
                    ? "bg-gray-800 hover:bg-black"
                    : "bg-[#e23744] hover:bg-[#d32f3a]"
              }`}
            >
              {toggling
                ? "Updating..."
                : profile.isAvailable
                  ? "Go Offline"
                  : "Go Online"}
            </button>

            <p
              className={`mt-4 text-center text-sm font-medium ${
                profile.isAvailable ? "text-green-600" : "text-gray-500"
              }`}
            >
              {profile.isAvailable
                ? "🟢 You are currently Online"
                : "⚪ You are currently Offline"}
            </p>
          </div>
        )}
      </div>
      {/* Enable sound Feature todo */}
      {!audioUnlocked && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="font-medium text-blue-900">
                Enable Sound Notification
              </p>
              <p className="text-sm text-blue-700">
                Get notified whenever a new order arrives.
              </p>
            </div>
          </div>
          <button
            onClick={unlockAudio}
            className="w-full md:w-auto rounded-xl bg-blue-600 px-5 py-2.5 text-white font-medium transition hover:bg-blue-700"
          >
            Enable sound
          </button>
        </div>
      )}

      {/* Display Incoming Orders */}
      {profile.isAvailable && incomingOrders.length > 0 && (
        <div className="mx-auto mt-8 max-w-xl space-y-5 px-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Incoming Orders
              </h2>

              <p className="text-sm text-gray-500">
                Accept quickly before another rider gets it.
              </p>
            </div>

            <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-600">
              {incomingOrders.length} New
            </span>
          </div>

          {incomingOrders.map((id) => (
            <RiderOrderRequest
              key={id}
              orderId={id}
              onAccepted={() => {
                fetchProfile();
                fetchCurrentOrder();
              }}
            />
          ))}
        </div>
      )}

      {currentOrder && (
        <div className="mx-auto max-w-xl px-4 space-y-4">
          <RiderCurrentOrder
            order={currentOrder}
            onStatusUpdate={fetchCurrentOrder}
          />
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;
