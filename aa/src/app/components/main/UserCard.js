import { motion } from "framer-motion";
import { User, Award, ClipboardList, Coins } from "lucide-react";

const UserCard = ({ userData }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-lg shadow-lg p-6 w-full md:w-3/4 lg:w-3/4 mx-auto mb-12 border border-gray-200"
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="bg-blue-100 p-3 rounded-full">
          <User size={32} className="text-blue-600" />
        </div>

        <h2 className="text-2xl font-semibold text-gray-800">
          {userData?.username || ""}
        </h2>

        <div className="grid grid-cols-3 gap-4 w-full">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Award size={24} className="text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Points</p>
              <p className="text-lg font-bold">
                {userData
                  ? userData.points !== undefined
                    ? userData.points
                    : 0
                  : 0}
              </p>
            </div>
          </div>

          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <ClipboardList size={24} className="text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Pending Surveys</p>
              <p className="text-lg font-bold">
                {userData?.to_be_answered_surveys?.length ?? 0}
              </p>
            </div>
          </div>

          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Coins size={24} className="text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Available Credits</p>
              <p className="text-lg font-bold">
                {userData
                  ? userData.credit !== undefined
                    ? userData.credit
                    : 0
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserCard;
