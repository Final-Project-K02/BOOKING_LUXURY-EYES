import { UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Card } from "antd";
import type { Doctor } from "../../types/Doctor";

interface DoctorListProps {
  doctors: Doctor[];
  isFetching?: boolean;
  handleDoctorSelect: (doctor: Doctor) => void;
}

const DoctorList = ({
  doctors,
  isFetching,
  handleDoctorSelect,
}: DoctorListProps) => {
  return (
    <div>
      <div className="space-y-3">
        {isFetching && (
          <div className="absolute top-0 right-0 p-2 text-sm text-gray-500">
            Updating...
          </div>
        )}

        {doctors.length > 0 ? (
          doctors.map((doctor: Doctor) => (
            <Card
              key={doctor._id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              style={{ padding: "16px" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Avatar size={48} icon={<UserOutlined />} />
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {doctor.name}
                    </h3>
                    <p className="text-sm text-blue-600">
                      Kinh nghiệm: {doctor.experience_year} năm
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Giá khám:</p>
                    <p className="text-lg font-bold text-orange-500">
                      {doctor.price} đ
                    </p>
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    Chọn
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <p>không có bác sĩ nào phù hợp</p>
        )}
      </div>
    </div>
  );
};

export default DoctorList;
