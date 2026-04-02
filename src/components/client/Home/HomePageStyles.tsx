const HomePageStyles = () => {
  return (
    <style>{`
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
      }

      .animate-fade-in { animation: fade-in 0.8s ease-out; }
      .animate-fade-in-delay { animation: fade-in 0.8s ease-out 0.2s both; }
      .animate-blob { animation: blob 7s infinite; }
      .animation-delay-2000 { animation-delay: 2s; }

      .bg-grid-pattern {
        background-image: linear-gradient(to right, rgba(59,130,246,0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(59,130,246,0.1) 1px, transparent 1px);
        background-size: 40px 40px;
      }

      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `}</style>
  );
};

export default HomePageStyles;
