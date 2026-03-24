import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";
import { useMemo } from "react";

type HomeFeature = {
  icon: ReactNode;
  title: string;
  desc: string;
};

type HomeNews = {
  title: string;
  date: string;
  img: string;
};

export const useHomeContent = () => {
  const features = useMemo<HomeFeature[]>(
    () => [
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
    ],
    [],
  );

  const news = useMemo<HomeNews[]>(
    () => [
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
    ],
    [],
  );

  return {
    features,
    news,
  };
};
