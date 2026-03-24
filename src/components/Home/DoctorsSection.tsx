import type { Doctor } from "../../types/Doctor";

type DoctorsSectionProps = {
  doctors: Doctor[];
};

const DoctorsSection = ({ doctors }: DoctorsSectionProps) => {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {doctors.slice(0, 3).map((doctor) => (
          <div
            key={doctor._id}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            <div className="relative overflow-hidden">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

              <div className="absolute top-4 right-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                  {doctor.experience_year} năm kinh nghiệm
                </span>
              </div>
            </div>

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

            <div className="absolute inset-0 border-2 border-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorsSection;
