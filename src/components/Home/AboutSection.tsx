import { CheckCircleOutlined } from "@ant-design/icons";
import { Button } from "antd";

const AboutSection = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-white py-24">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
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
              Phòng khám chuyên khoa mắt Luxury Eyes là cơ sở y tế hàng đầu với
              hơn 5 năm kinh nghiệm trong việc chăm sóc sức khỏe cộng đồng.
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
  );
};

export default AboutSection;
