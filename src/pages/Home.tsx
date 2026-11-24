import Hero from "../components/Hero";
import About from "../components/About";
import VideoPreview from "../components/VideoPreview";
import Pillars from "../components/Pillars";
import Community from "../components/Community";
import StudentOfTheWeekSection from "../components/StudentOfTheWeekSection";
import Courses from "../components/Courses";
import MentorshipPricingSection from "../components/MentorshipPricingSection";
import Services from "../components/Services";
import StoreSection from "../components/StoreSection";
import Testimonials from "../components/Testimonials";
import Events from "../components/Events";
import YoutubeSessionsBanner from "../components/YoutubeSessionsBanner";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <VideoPreview />
      <Pillars />
      <Community />
      <StudentOfTheWeekSection />
      <Courses />
      <MentorshipPricingSection />
      <Services />
      <StoreSection />
      <Testimonials />
      <section className="bg-cream pt-10">
        <div className="container-x">
          <YoutubeSessionsBanner />
        </div>
      </section>
      <Events />
    </>
  );
}
