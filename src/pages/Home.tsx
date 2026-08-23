import Hero from "../components/Hero";
import About from "../components/About";
import VideoPreview from "../components/VideoPreview";
import Pillars from "../components/Pillars";
import Community from "../components/Community";
import Courses from "../components/Courses";
import MentorshipPricingSection from "../components/MentorshipPricingSection";
import Services from "../components/Services";
import Testimonials from "../components/Testimonials";
import Events from "../components/Events";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <VideoPreview />
      <Pillars />
      <Community />
      <Courses />
      <MentorshipPricingSection />
      <Services />
      <Testimonials />
      <Events />
    </>
  );
}
