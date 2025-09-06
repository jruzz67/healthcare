// src/components/NotificationPopup.js

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const NotificationPopup = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2500); // Popup is visible for 2.5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="fixed top-5 right-5 z-50"
      >
        <div className={`flex items-center p-4 rounded-xl shadow-2xl text-white font-semibold ${isSuccess ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}>
          {isSuccess ? <FiCheckCircle className="mr-3 text-2xl" /> : <FiAlertCircle className="mr-3 text-2xl" />}
          <span>{message}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationPopup;
