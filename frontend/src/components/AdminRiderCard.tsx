import axios from "axios";
import { ADMIN_SERVICE } from "../main";
import toast from "react-hot-toast";

const AdminRiderCard = ({
  rider,
  onVerify,
}: {
  rider: any;
  onVerify: () => void;
}) => {
  const verify = async () => {
    try {
      await axios.patch(
        `${ADMIN_SERVICE}/api/v1/verify/rider/${rider._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success("Rider verified");
      onVerify();
    } catch (error) {
      console.log(error);
      toast.error("failed to verify rider");
    }
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow space-y-2">
      <img
        src={rider.picture}
        alt=""
        className="h-40 w-full object-cover rounded"
      />
      <h3>{rider.phoneNumber}</h3>
      <p className="text-sm text-gray-500">Adhaar Number: {rider.adhaarNumber}</p>
      <p className="text-sm text-gray-500">Driving Licence Number: {rider.drivingLicenceNumber}</p>
      <button
        className="w-full rounded bg-green-500 py-2 text-white hover:bg-green-600"
        onClick={verify}
      >
        Verify Rider
      </button>
    </div>
  );
};

export default AdminRiderCard;
