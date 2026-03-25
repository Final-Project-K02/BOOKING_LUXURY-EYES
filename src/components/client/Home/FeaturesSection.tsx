type FeatureItem = {
  icon: React.ReactNode;
  title: string;
  desc: string;
};

type FeaturesSectionProps = {
  features: FeatureItem[];
};

const FeaturesSection = ({ features }: FeaturesSectionProps) => {
  return (
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
  );
};

export default FeaturesSection;
