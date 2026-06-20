import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import desktopVideo from "../assets/desktop.mp4";
import mobileVideo from "../assets/mobile.mp4";
import HeroSection from '../sections/HeroSection';
import HowItWorksSection from '../sections/HowItWorksSection';
import CitySelectionSection from '../sections/CitySelectionSection';
import FeaturedExperiencesSection from '../sections/FeaturedExperiencesSection';
import VRExperienceSection from '../sections/VRExperienceSection';
import FounderSection from '../sections/FounderSection';
import SuccessStoriesSection from '../sections/SuccessStoriesSection';
import BookExperienceSection from '../sections/BookExperienceSection';

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

const isMobile = window.innerWidth <= 768;

useEffect(() => {
  const timer = setTimeout(() => {
    setShowIntro(false);
  }, 6000);

  return () => clearTimeout(timer);
}, []);
 return (
  <>
    <AnimatePresence>
      {showIntro && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          background: "#000",
          zIndex: 9999,
        }}
      >
        <video
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        >
          <source
            src={isMobile ? mobileVideo : desktopVideo}
            type="video/mp4"
          />
       </video>
      </motion.div>
      )}
    </AnimatePresence>
    {!showIntro && (
     <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <HeroSection />
        <HowItWorksSection />
        <CitySelectionSection />
        <FeaturedExperiencesSection />
        <VRExperienceSection />
        <FounderSection />
        <SuccessStoriesSection />
        <BookExperienceSection />
      </motion.main>
    )}
  </>
  )};
