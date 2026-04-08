"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import PartnerCard from "./Cards";
import { PartnerProps } from "@/interfaces";

export default function Partners() {
  const [partners, setPartners] = useState<PartnerProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false); // Track if the component is mounted on the client

  useEffect(() => {
    // Ensure Swiper is only rendered on the client
    setIsClient(true);

    fetch("/api/partners")
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => {
        setPartners(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching partner data:", error);
        setIsLoading(false);
      });
  }, []);

  // Double the partners array for seamless infinite loop
  const duplicatedPartners = [...partners, ...partners];

  return (
    <div id="partners" className="relative overflow-hidden w-full min-h-screen py-10 bg-sky-100 pt-20">
      <div className="text-center mb-10 mt-10">
        <h3 className="text-sm font-light text-sky-900 mb-2">OUR PARTNERS</h3>
        <h2 className="text-3xl lg:text-4xl font-bold text-sky-900 mb-4">
          Global Partnerships Driving Medical Excellence
        </h2>
        <p className="text-gray-700 text-sm lg:text-base mx-auto max-w-md mb-10">
          Solutions Provider in the UAE, partnering with world-class suppliers to offer cutting-edge medical devices and services.
        </p>
      </div>

      <div className="relative w-full px-4">
        {/* Gradient Fade Effect */}
        <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-sky-200 to-transparent z-20" />
        <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-sky-200 to-transparent z-20" />

        {isLoading ? (
          <div className="text-center text-sky-900">Loading partners...</div>
        ) : (
          isClient && ( // Render Swiper only on the client
            <Swiper
              modules={[Autoplay, FreeMode]}
              spaceBetween={30}
              slidesPerView={"auto"}
              centeredSlides={true}
              loop={true}
              freeMode={{
                momentum: true,
                momentumBounce: false,
              }}
              autoplay={{
                delay: 1000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                waitForTransition: true,
              }}
              speed={1000}
              breakpoints={{
                320: {
                  slidesPerView: 1,
                  spaceBetween: 20,
                },
                640: {
                  slidesPerView: 2,
                  spaceBetween: 30,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 40,
                },
                1280: {
                  slidesPerView: 4,
                  spaceBetween: 50,
                },
              }}
              className="!overflow-visible"
              key={partners.length}
              onSwiper={(swiper) => {
                // Pause autoplay when hovering over a card
                const swiperContainer = swiper.el;
                swiperContainer.addEventListener("mouseenter", () => {
                  if (swiper.autoplay) swiper.autoplay.stop();
                });
                swiperContainer.addEventListener("mouseleave", () => {
                  if (swiper.autoplay) swiper.autoplay.start();
                });
              }}
            >
              {duplicatedPartners.map((partner, index) => (
                <SwiperSlide
                  key={`${partner.name}-${index}`}
                  className="!h-auto !flex !items-center !justify-center"
                >
                  <div className="w-[300px]"> {/* Fixed width for consistent sizing */}
                    <PartnerCard
                      name={partner.name}
                      link={partner.link}
                      brief={partner.brief}
                      logo={partner.logo}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )
        )}
      </div>
    </div>
  );
}