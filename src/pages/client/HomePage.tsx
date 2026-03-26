import banner from "../../assets/imgs/banner.png";
import AuthModal from "../../components/auth/AuthModal";
import AboutSection from "../../components/client/Home/AboutSection";
import DoctorsSection from "../../components/client/Home/DoctorsSection";
import FeaturesSection from "../../components/client/Home/FeaturesSection";
import HeroSection from "../../components/client/Home/HeroSection";
import HomePageStyles from "../../components/client/Home/HomePageStyles";
import NewsSection from "../../components/client/Home/NewsSection";
import QuickServicesSection from "../../components/client/Home/QuickServicesSection";
import { useHomePage } from "../../hooks/client/useHomePage";

const HomePage = () => {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    handleNavigateWithAuth,
    experiencedDoctors,
    features,
    news,
  } = useHomePage();

  return (
    <div className="min-h-screen bg-white">
      <HeroSection
        bannerSrc={banner}
        onBookNow={() => handleNavigateWithAuth("/dat-lich-kham")}
      />

      <QuickServicesSection
        onBookingClick={() => handleNavigateWithAuth("/dat-lich-kham")}
        onScheduleClick={() => handleNavigateWithAuth("/lich-kham")}
      />

      <FeaturesSection features={features} />
      <AboutSection />
      <DoctorsSection doctors={experiencedDoctors} />
      <NewsSection news={news} />

      <AuthModal
        open={authModalOpen}
        onClose={closeAuthModal}
        mode={authModalMode}
      />
      <HomePageStyles />
    </div>
  );
};

export default HomePage;
