"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const ToggleSwitch = ({
  leftOption = "Page 1",
  rightOption = "Page 2",
  leftPath = "/page1",
  rightPath = "/page2",
  initialValue = "left",
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState(initialValue);

  // Set initial state based on current path
  useEffect(() => {
    console.log("Current pathname:", pathname);
    if (pathname === leftPath) {
      setSelected("left");
    } else if (pathname === rightPath) {
      setSelected("right");
    }
  }, [pathname, leftPath, rightPath]);

  const handleToggle = (value) => {
    setSelected(value);
    router.push(value === "left" ? leftPath : rightPath);
  };

  return (
    <div className="inline-flex items-center p-1 rounded-full bg-gray-100 shadow-inner">
      <button
        onClick={() => handleToggle("left")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          selected === "left"
            ? "bg-white text-purple-700 shadow"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        {leftOption}
      </button>
      <button
        onClick={() => handleToggle("right")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          selected === "right"
            ? "bg-white text-purple-700 shadow"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        {rightOption}
      </button>
    </div>
  );
};

export default ToggleSwitch;
