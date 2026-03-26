import {
  CalendarOutlined,
  MedicineBoxOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Card } from "antd";

type QuickServicesSectionProps = {
  onBookingClick: () => void;
  onScheduleClick: () => void;
};

const QuickServicesSection = ({
  onBookingClick,
  onScheduleClick,
}: QuickServicesSectionProps) => {
  return (
    <div className="container mx-auto px-4 -mt-12 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div onClick={onBookingClick} className="cursor-pointer">
          <Card className="h-full shadow-lg hover:shadow-2xl transition-all duration-300 border-0 bg-white group hover:-translate-y-2">
            <div className="flex items-center gap-6 p-4">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <CalendarOutlined className="text-4xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Đặt khám online
                </h3>
                <p className="text-gray-600">Đặt lịch nhanh chóng, tiện lợi</p>
              </div>
              <RightOutlined className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Card>
        </div>

        <div onClick={onScheduleClick} className="cursor-pointer">
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
  );
};

export default QuickServicesSection;
