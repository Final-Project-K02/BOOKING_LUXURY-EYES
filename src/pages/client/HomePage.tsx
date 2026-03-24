import banner from "../../assets/imgs/banner.png";
import AuthModal from "../../components/auth/AuthModal";
import AboutSection from "../../components/Home/AboutSection";
import DoctorsSection from "../../components/Home/DoctorsSection";
import FeaturesSection from "../../components/Home/FeaturesSection";
import HeroSection from "../../components/Home/HeroSection";
import HomePageStyles from "../../components/Home/HomePageStyles";
import NewsSection from "../../components/Home/NewsSection";
import QuickServicesSection from "../../components/Home/QuickServicesSection";
import { useHomeAuth } from "../../hooks/HomePage/useHomeAuth";
import { useHomeContent } from "../../hooks/HomePage/useHomeContent";
import { useHomeDoctorSchedules } from "../../hooks/HomePage/useHomeDoctorSchedules";
import { useHomeDoctors } from "../../hooks/HomePage/useHomeDoctors";

const HomePage = () => {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    handleNavigateWithAuth,
  } = useHomeAuth();
  const { doctors, experiencedDoctors } = useHomeDoctors();
  const { features, news } = useHomeContent();

  // Giữ side-effect gọi lịch bác sĩ như behavior cũ.
  useHomeDoctorSchedules(doctors);

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
