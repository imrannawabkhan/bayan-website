import Image from 'next/image';
import { NewsItem } from '@/interfaces';
import { useEffect, useRef, useState } from 'react';

interface NewsCardProps {
  news: NewsItem;
  onClick: (news: NewsItem) => void;
}

export default function NewsCard({ news, onClick }: NewsCardProps) {
  const images = news.images && news.images.length > 0
    ? news.images
    : news.image
      ? [news.image]
      : [];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [news.id]);

  useEffect(() => {
    if (images.length < 2) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const showPrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length < 2) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const showNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length < 2) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    const threshold = 30;
    if (touchDeltaX.current > threshold) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    } else if (touchDeltaX.current < -threshold) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'announcement': return 'bg-blue-500';
      case 'update': return 'bg-green-500';
      case 'partnership': return 'bg-purple-500';
      case 'achievement': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <article
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
      onClick={() => onClick(news)}
    >
      <div
        className="relative h-48"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.length > 0 ? (
          <Image
            src={images[currentImageIndex]}
            alt={news.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-sm text-gray-400">No image</span>
          </div>
        )}

        {images.length > 1 && (
          <>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {images.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/60'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-4 left-4">
          <span 
            className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(news.category)}`}
          >
            {news.category.charAt(0).toUpperCase() + news.category.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="text-sm text-gray-500 mb-2">
          {new Date(news.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {news.title}
        </h3>
        
        <p className="text-gray-600 line-clamp-3 mb-4">
          {news.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-blue-600 font-medium group-hover:text-blue-800 transition-colors">
            Read more →
          </span>
          
        </div>
      </div>
    </article>
  );
}
