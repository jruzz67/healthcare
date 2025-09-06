// src/components/LandingPage.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCalendar, FiUsers, FiHeart, FiChevronDown, FiArrowRight,
  FiUserCheck, FiShield, FiActivity, FiBriefcase, FiMessageCircle
} from "react-icons/fi";

// Main Component: Assembles all the new sections
const LandingPage = () => {
  return (
    <div className="bg-gray-50 font-sans text-gray-800">
      <Navbar />
      <main>
        <Hero />
        <StatsSection />
        <FeaturesSection />
        <ChatbotPromoSection /> {/* <-- NEW SECTION ADDED HERE */}
        <UserBenefitsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

// ... (Navbar, Hero, AnimatedAppointments, StatsSection, FeaturesSection components remain unchanged) ...

// All the previous components (Navbar, Hero, StatsSection, etc.) go here.
// For brevity, I'm only showing the NEW and the MAIN components.
// Please ensure you have all the previous components from the last step in this file.

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <header className="bg-white/70 backdrop-blur-lg fixed top-4 left-4 right-4 z-50 rounded-xl shadow-sm border border-gray-200">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FiHeart className="text-2xl text-purple-600" />
          <h1 className="text-xl font-bold text-gray-900">HealthSuite</h1>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">Features</a>
          <a href="#benefits" className="text-gray-600 hover:text-purple-600 transition-colors">Benefits</a>
          <a href="#faq" className="text-gray-600 hover:text-purple-600 transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/app/patient")} className="font-medium text-gray-600 hover:text-purple-600 transition-colors">Patient Login</button>
          <button onClick={() => navigate("/app/doctor")} className="bg-purple-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            Doctor Login
          </button>
        </div>
      </div>
    </header>
  );
};
const Hero = () => {
  return (
    <section className="pt-32 pb-20 flex flex-col lg:flex-row items-center container mx-auto px-6 gap-12">
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full lg:w-1/2 text-center lg:text-left"
      >
        <h2 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight">
          Intelligent Healthcare, <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            Simplified for You
          </span>
        </h2>
        <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
          The all-in-one platform for seamless appointment scheduling and comprehensive patient management.
        </p>
        <div className="mt-8 flex justify-center lg:justify-start gap-4">
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2">
            Find Your Doctor <FiArrowRight />
          </button>
        </div>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="w-full lg:w-1/2"
      >
        <AnimatedAppointments />
      </motion.div>
    </section>
  );
};
const AnimatedAppointments = () => {
  const appointments = [
    { name: 'Sarah L.', time: '10:30 AM', specialty: 'Cardiology', icon: <FiHeart/> },
    { name: 'Michael B.', time: '11:00 AM', specialty: 'Dermatology', icon: <FiUserCheck/> },
    { name: 'Emily C.', time: '01:15 PM', specialty: 'Pediatrics', icon: <FiUsers/> },
    { name: 'David R.', time: '02:00 PM', specialty: 'General Practice', icon: <FiBriefcase/> },
  ];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % appointments.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [appointments.length]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">Live Bookings</h3>
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
      </div>
      <div className="h-40 relative">
        <AnimatePresence>
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8, transition: { duration: 0.3 } }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="absolute w-full"
          >
            <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
              <p className="font-semibold text-gray-700">New Appointment Confirmed!</p>
              <div className="mt-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg text-purple-600">{appointments[index].name}</p>
                  <p className="text-sm text-gray-500">{appointments[index].specialty}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl text-purple-500">{appointments[index].icon}</div>
                  <p className="font-semibold text-gray-700">{appointments[index].time}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
const StatsSection = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="p-4">
            <h3 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">10k+</h3>
            <p className="text-gray-500 mt-1">Happy Patients</p>
          </div>
          <div className="p-4">
            <h3 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">200+</h3>
            <p className="text-gray-500 mt-1">Expert Doctors</p>
          </div>
          <div className="p-4">
            <h3 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">50k+</h3>
            <p className="text-gray-500 mt-1">Appointments Booked</p>
          </div>
          <div className="p-4">
            <h3 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">98%</h3>
            <p className="text-gray-500 mt-1">Positive Ratings</p>
          </div>
        </div>
      </div>
    </section>
  );
};
const FeaturesSection = () => {
  const features = [
    { icon: <FiCalendar />, title: "Smart Scheduling", desc: "Our AI-powered calendar finds the perfect slot for you and your doctor." },
    { icon: <FiUserCheck />, title: "Verified Professionals", desc: "Every doctor on our platform is board-certified and vetted." },
    { icon: <FiShield />, title: "Secure Data", desc: "Your personal health information is encrypted and protected." },
    { icon: <FiActivity />, title: "Health Analytics", desc: "Track your appointment history and health metrics over time." },
  ];
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-gray-900">Everything You Need, and More</h2>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">Our platform is built with powerful features to provide a holistic healthcare experience.</p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 cursor-pointer"
              whileHover={{ y: -10, scale: 1.05, boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-4xl text-white bg-gradient-to-r from-purple-500 to-pink-500 p-3 inline-block rounded-full mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- NEW CHATBOT PROMO SECTION ---
const ChatbotPromoSection = () => {
    const navigate = useNavigate();
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="bg-gray-100 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border">
                    <div className="text-6xl text-white bg-gradient-to-r from-purple-500 to-pink-500 p-5 rounded-full">
                        <FiMessageCircle />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-gray-900">Chat & Book with AI in a Minute!</h2>
                        <p className="mt-2 text-gray-600">
                            Skip the forms. Our new AI assistant helps you find a doctor and schedule an appointment instantly.
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/app/patient')}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap">
                        Try the AI Assistant
                    </button>
                </div>
            </div>
        </section>
    )
}

const UserBenefitsSection = () => {
  const [activeTab, setActiveTab] = useState('patients');
  return (
    <section id="benefits" className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-gray-900 text-center">Designed for Everyone</h2>
        <div className="mt-8 flex justify-center border-b">
          <button onClick={() => setActiveTab('patients')} className={`px-8 py-3 font-semibold text-lg transition-colors ${activeTab === 'patients' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}>For Patients</button>
          <button onClick={() => setActiveTab('doctors')} className={`px-8 py-3 font-semibold text-lg transition-colors ${activeTab === 'doctors' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}>For Doctors</button>
        </div>
        <div className="mt-10 max-w-4xl mx-auto">
          {activeTab === 'patients' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <p>✔ Find specialists in minutes.</p><p>✔ Book appointments 24/7.</p>
              <p>✔ Get automated reminders.</p><p>✔ Access your history anytime.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <p>✔ Reduce no-shows with reminders.</p><p>✔ Manage your schedule effortlessly.</p>
              <p>✔ Expand your patient reach.</p><p>✔ Streamline administrative tasks.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
const FaqSection = () => {
  const faqs = [
    { q: "How do I book an appointment?", a: "Simply search for a doctor by specialty or name, view their available times, and select the slot that works for you. Confirm your booking, and you're all set!" },
    { q: "Is my personal information secure?", a: "Absolutely. We use industry-standard encryption and security protocols to ensure your data is always safe and confidential." },
    { q: "Can I reschedule or cancel my appointment?", a: "Yes, you can easily reschedule or cancel appointments through your patient dashboard up to 24 hours before the scheduled time." },
    { q: "Is there a fee for using this service?", a: "Our platform is completely free for patients to use for booking and managing appointments. Standard consultation fees from the doctor's clinic will apply." },
  ];
  const [openFaq, setOpenFaq] = useState(0);
  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full text-left p-6 flex justify-between items-center">
                <h3 className="font-semibold text-lg">{faq.q}</h3>
                <motion.div animate={{ rotate: openFaq === index ? 180 : 0 }}><FiChevronDown /></motion.div>
              </button>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <p className="px-6 pb-6 text-gray-600">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
const CtaSection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold">Ready to Take Control of Your Health?</h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto">Find a doctor and schedule your next appointment in just a few clicks. It's simple, fast, and free.</p>
          <button onClick={() => navigate('/app/patient')} className="mt-8 bg-white text-purple-600 px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
            Book Your Appointment Now
          </button>
        </div>
      </div>
    </section>
  );
};
const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t pt-16 pb-8">
      <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div><h3 className="font-bold text-gray-900 mb-4">HealthSuite</h3><p className="text-sm text-gray-600">Simplifying healthcare management.</p></div>
        <div><h3 className="font-semibold text-gray-800 mb-4">Product</h3><a href="#features" className="block text-gray-600 hover:text-purple-600 text-sm mb-2">Features</a><a href="#benefits" className="block text-gray-600 hover:text-purple-600 text-sm mb-2">Benefits</a><a href="#faq" className="block text-gray-600 hover:text-purple-600 text-sm mb-2">FAQ</a></div>
        <div><h3 className="font-semibold text-gray-800 mb-4">Company</h3><p className="text-gray-600 text-sm mb-2">About Us</p><p className="text-gray-600 text-sm mb-2">Contact</p></div>
        <div><h3 className="font-semibold text-gray-800 mb-4">Legal</h3><p className="text-gray-600 text-sm mb-2">Privacy Policy</p><p className="text-gray-600 text-sm mb-2">Terms of Service</p></div>
      </div>
      <div className="text-center text-sm text-gray-500 mt-12 border-t pt-6">&copy; {new Date().getFullYear()} HealthSuite. All Rights Reserved.</div>
    </footer>
  );
};

export default LandingPage;
