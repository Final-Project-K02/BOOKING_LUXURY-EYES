import { RightOutlined } from "@ant-design/icons";
import { Card } from "antd";

type NewsItem = {
  title: string;
  date: string;
  img: string;
};

type NewsSectionProps = {
  news: NewsItem[];
};

const NewsSection = ({ news }: NewsSectionProps) => {
  return (
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
  );
};

export default NewsSection;
