import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  RightOutlined,
  SafetyOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Button, Card } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hook";
import { useGetDoctorsQuery } from "../../app/services/doctorApi";
import banner from "../../assets/imgs/banner.png";
import AuthModal from "../../components/auth/AuthModal";
import type { Doctor } from "../../types/Doctor";

const HomePage = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">(
    "login",
  );

  const isAuthenticated =
    useAppSelector((state) => state.auth.accessToken) ||
    localStorage.getItem("accessToken");

  const { data } = useGetDoctorsQuery();

  const doctors: Doctor[] = data?.data ?? [];

  const features = [
    {
      icon: <TeamOutlined className="text-5xl text-blue-500" />,
      title: "Đội ngũ chuyên môn cao",
      desc: "Bác sĩ giàu kinh nghiệm, tận tâm",
    },
    {
      icon: <SafetyOutlined className="text-5xl text-green-500" />,
      title: "Trang thiết bị hiện đại",
      desc: "Công nghệ tiên tiến, chính xác",
    },
    {
      icon: <ClockCircleOutlined className="text-5xl text-orange-500" />,
      title: "Phục vụ 24/7",
      desc: "Luôn sẵn sàng chăm sóc bạn",
    },
    {
      icon: <CheckCircleOutlined className="text-5xl text-purple-500" />,
      title: "Quy trình chuyên nghiệp",
      desc: "Khám chữa bệnh chuẩn quốc tế",
    },
  ];

  const news = [
    {
      title: "Thông báo lịch làm việc Tết Nguyên đán 2025",
      date: "15/11/2024",
      img: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&h=250&fit=crop",
    },
    {
      title: "Chương trình khám mắt tổng quát cuối năm",
      date: "10/11/2024",
      img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=250&fit=crop",
    },
    {
      title: "Hội thảo chăm sóc sức khỏe đôi mắt",
      date: "05/11/2024",
      img: "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=400&h=250&fit=crop",
    },
  ];

  const experiencedDoctors = doctors
    .map((doc) => ({
      ...doc,
      experience_year: Number(doc.experience_year),
    }))
    .filter((doc) => doc.experience_year >= 10);

  // ===== HÀM XỬ LÝ ĐIỀU HƯỚNG CÓ KIỂM TRA ĐĂNG NHẬP =====
  const handleNavigateWithAuth = (path: string) => {
    if (!isAuthenticated) {
      // Nếu chưa đăng nhập: hiện modal đăng nhập và ở trang chủ
      setAuthModalMode("login");
      setAuthModalOpen(true);
    } else {
      // Nếu đã đăng nhập: chuyển hướng bình thường
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Modern Layout */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 animate-fade-in">
              <div className="inline-block">
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  ✨ Chăm sóc sức khỏe chuyên nghiệp
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Chăm sóc đôi mắt
                <span className="text-blue-600"> sáng khỏe</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                Đội ngũ bác sĩ giàu kinh nghiệm cùng trang thiết bị hiện đại,
                mang đến dịch vụ khám chữa bệnh chất lượng cao 24/7
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => handleNavigateWithAuth("/dat-lich-kham")}
                  className="h-12 px-8 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Đặt lịch ngay
                </Button>
                <Button
                  size="large"
                  className="h-12 px-8 text-base font-medium"
                >
                  Tìm hiểu thêm
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-8 border-t border-gray-200">
                <div>
                  <div className="text-3xl font-bold text-blue-600">5+</div>
                  <div className="text-sm text-gray-600">Năm kinh nghiệm</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">10K+</div>
                  <div className="text-sm text-gray-600">Bệnh nhân</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">24/7</div>
                  <div className="text-sm text-gray-600">Hỗ trợ</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative animate-fade-in-delay">
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

              <img
                src={banner}
                alt="Eye Care"
                className="relative rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Services - Floating Cards */}
      <div className="container mx-auto px-4 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Đặt khám online */}
          <div
            onClick={() => handleNavigateWithAuth("/dat-lich-kham")}
            className="cursor-pointer"
          >
            <Card className="h-full shadow-lg hover:shadow-2xl transition-all duration-300 border-0 bg-white group hover:-translate-y-2">
              <div className="flex items-center gap-6 p-4">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <CalendarOutlined className="text-4xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Đặt khám online
                  </h3>
                  <p className="text-gray-600">
                    Đặt lịch nhanh chóng, tiện lợi
                  </p>
                </div>
                <RightOutlined className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          </div>

          {/* Lịch khám */}
          <div
            onClick={() => handleNavigateWithAuth("/lich-kham")}
            className="cursor-pointer"
          >
            <Card className="h-full shadow-lg hover:shadow-2xl transition-all duration-300 border-0 bg-white group hover:-translate-y-2">
              <div className="flex items-center gap-6 p-4">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <MedicineBoxOutlined className="text-4xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Lịch khám
                  </h3>
                  <p className="text-gray-600">Quản lý lịch khám đã đặt</p>
                </div>
                <RightOutlined className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Tại sao chọn Luxury Eyes?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến dịch vụ chăm sóc sức khỏe chất lượng cao
            với sự tận tâm và chuyên nghiệp
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="text-center p-8 rounded-2xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="inline-flex items-center justify-center mb-6 transform hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About Section - Two Column */}
      <div className="bg-gradient-to-br from-blue-50 to-white py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Image Side */}
            <div className="relative">
              <div className="absolute inset-0 bg-blue-200 rounded-3xl transform rotate-3"></div>
              <img
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop"
                alt="Hospital"
                className="relative rounded-3xl shadow-2xl w-full transform -rotate-2 hover:rotate-0 transition-transform duration-300"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-6 max-w-xs">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleOutlined className="text-2xl text-green-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Uy tín</div>
                    <div className="text-sm text-gray-600">Chất lượng cao</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className="space-y-6">
              <div className="inline-block">
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  Về chúng tôi
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Phòng khám chuyên khoa mắt Luxury Eyes
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed">
                Phòng khám chuyên khoa mắt Luxury Eyes là cơ sở y tế hàng đầu
                với hơn 5 năm kinh nghiệm trong việc chăm sóc sức khỏe cộng
                đồng.
              </p>

              <div className="space-y-4">
                {[
                  "Đội ngũ bác sĩ chuyên môn cao",
                  "Trang thiết bị y tế hiện đại",
                  "Dịch vụ chăm sóc 24/7",
                  "Quy trình khám chữa bệnh chuyên nghiệp",
                ].map((text, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircleOutlined className="text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{text}</span>
                  </div>
                ))}
              </div>

              <Button type="primary" size="large" className="mt-6">
                Tìm hiểu thêm
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Đội ngũ bác sĩ nổi bật
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Đội ngũ chuyên gia hàng đầu với nhiều năm kinh nghiệm trong lĩnh vực
            nhãn khoa
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {experiencedDoctors.slice(0, 3).map((doctor) => (
            <div
              key={doctor._id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={doctor.avatar}
                  alt={doctor.name}
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                {/* Experience Badge */}
                <div className="absolute top-4 right-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                    {doctor.experience_year} năm kinh nghiệm
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {doctor.name}
                  </h3>
                  <p className="text-blue-600 font-medium text-sm mb-1">
                    {doctor.description}
                  </p>
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 border-2 border-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>

      {/* News Section */}
      <div className="bg-gray-50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Tin tức & Sự kiện
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cập nhật thông tin mới nhất từ phòng khám
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {news.map((item, idx) => (
              <Card
                key={idx}
                className="h-full border-0 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden"
                style={{ padding: 0 }}
              >
                <div className="relative overflow-hidden">
                  <img
                    alt={item.title}
                    src={item.img}
                    className="h-56 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-md">
                      {item.date}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center text-blue-600 font-medium">
                    Đọc thêm
                    <RightOutlined className="ml-2 text-sm group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authModalMode}
      />

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.2s both;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .bg-grid-pattern {
          background-image: linear-gradient(
              to right,
              rgba(59, 130, 246, 0.1) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(59, 130, 246, 0.1) 1px,
              transparent 1px
            );
          background-size: 40px 40px;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
