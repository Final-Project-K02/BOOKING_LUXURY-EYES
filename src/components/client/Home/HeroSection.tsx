import { Button } from "antd";

type HeroSectionProps = {
  bannerSrc: string;
  onBookNow: () => void;
};

const HeroSection = ({ bannerSrc, onBookNow }: HeroSectionProps) => {
  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
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
              Đội ngũ bác sĩ giàu kinh nghiệm cùng trang thiết bị hiện đại, mang
              đến dịch vụ khám chữa bệnh chất lượng cao 24/7
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                type="primary"
                size="large"
                onClick={onBookNow}
                className="h-12 px-8 text-base font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Đặt lịch ngay
              </Button>
              <Button size="large" className="h-12 px-8 text-base font-medium">
                Tìm hiểu thêm
              </Button>
            </div>

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

          <div className="relative animate-fade-in-delay">
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

            <img
              src={bannerSrc}
              alt="Eye Care"
              className="relative rounded-2xl shadow-2xl w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
