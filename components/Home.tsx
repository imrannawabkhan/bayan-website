import Image from 'next/image';
import NewsBar from './NewsBar';

export default function Home() {
  return (
    <div className="mb-0" id="home">
      <section className="hero-section relative">
        <video className="hero-video w-full h-screen object-cover" autoPlay loop muted>
          <source src="/assets/videos/bayan-hero.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Transparent Rectangle with Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="bg-gray-900 bg-opacity-15 p-6 pt-10 rounded-lg flex flex-col items-center">

              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
                Bayan Medical Company
              </h1>

              {/* 15 Year Badge */}
              <Image
                src="/assets/badge.png"
                alt="15 Year Anniversary Badge"
                width={320}
                height={320}
                priority
                sizes="(max-width: 768px) 200px, (max-width: 1024px) 280px, 320px"
                className="w-[200px] md:w-[280px] lg:w-[320px] h-auto max-w-full mb-4 celebration-badge"
              />

              

              
            </div>
          </div>


        {/* Sliding News Bar - Positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-30 mb-20">
          <NewsBar />
        </div>

      {/* Bottom Horizontal Ribbon */}
      <a
        
        className="absolute bottom-0 left-0 w-full flex justify-center z-40"
      >
        <div
          className="ribbon-shine"
          style={{
            background: "linear-gradient(to right, #f5f7fa, #c3c8d0, #8d939a)",
            padding: "14px 24px",
            fontWeight: "bold",
            color: "#1A1A1A",
            cursor: "pointer",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
            fontSize: "1.1rem",
            letterSpacing: "0.08em",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h3 className="ribbon-bounce flex items-center justify-center gap-3">
            Celebrating 15 Years of Innovation & Excellence in Healthcare
            
          </h3>

        </div>
      </a>


  
      </section>
      
    </div>
  );
}