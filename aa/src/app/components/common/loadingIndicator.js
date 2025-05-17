import { motion } from "framer-motion";

const LoadingIndicator = ({ loadingText = "Loading..." }) => {
  return (
    <div className="flex flex-col justify-center items-center py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: {
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          },
        }}
        className="w-16 h-16 mb-4"
      >
        <svg
          viewBox="0 0 38 38"
          xmlns="http://www.w3.org/2000/svg"
          className="text-indigo-500"
        >
          <defs>
            <linearGradient
              x1="8.042%"
              y1="0%"
              x2="65.682%"
              y2="23.865%"
              id="prefix__a"
            >
              <stop stopColor="currentColor" stopOpacity="0" offset="0%" />
              <stop
                stopColor="currentColor"
                stopOpacity=".631"
                offset="63.146%"
              />
              <stop stopColor="currentColor" offset="100%" />
            </linearGradient>
          </defs>
          <g fill="none" fillRule="evenodd">
            <g transform="translate(1 1)">
              <path
                d="M36 18c0-9.94-8.06-18-18-18"
                stroke="url(#prefix__a)"
                strokeWidth="3"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 18 18"
                  to="360 18 18"
                  dur="0.9s"
                  repeatCount="indefinite"
                />
              </path>
              <circle fill="currentColor" cx="36" cy="18" r="1">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 18 18"
                  to="360 18 18"
                  dur="0.9s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          </g>
        </svg>
      </motion.div>
      <p className="text-indigo-500 font-medium">{loadingText}</p>
    </div>
  );
};

export default LoadingIndicator;
