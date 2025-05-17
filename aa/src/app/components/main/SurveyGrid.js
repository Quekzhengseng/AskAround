import { motion } from "framer-motion";
import SurveyCard from "./SurveyCard";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
};

const SurveyGrid = ({ surveys }) => {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {surveys.map((survey, index) => (
        <motion.div
          key={survey.survey_id}
          variants={item}
          whileHover={{
            y: -8,
            transition: { type: "spring", stiffness: 300, damping: 15 },
          }}
          className="h-full"
        >
          <SurveyCard survey={survey} index={index} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default SurveyGrid;
