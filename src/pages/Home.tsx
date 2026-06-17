import HeroSection from '../sections/HeroSection';
import HowItWorksSection from '../sections/HowItWorksSection';
import CitySelectionSection from '../sections/CitySelectionSection';
import FeaturedExperiencesSection from '../sections/FeaturedExperiencesSection';
import VRExperienceSection from '../sections/VRExperienceSection';
import FounderSection from '../sections/FounderSection';
import SuccessStoriesSection from '../sections/SuccessStoriesSection';
import BookExperienceSection from '../sections/BookExperienceSection';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <HowItWorksSection />
      <CitySelectionSection />
      <FeaturedExperiencesSection />
      <VRExperienceSection />
      <FounderSection />
      <SuccessStoriesSection />
      <BookExperienceSection />
    </main>
  );
}
