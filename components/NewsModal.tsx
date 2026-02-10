import Image from 'next/image';
import { NewsModalProps } from '@/interfaces';
import { useEffect, useRef, useState } from 'react';

export default function NewsModal({ news, isOpen, onClose }: NewsModalProps) {
  const images = news?.images && news.images.length > 0
    ? news.images
    : news?.image
      ? [news.image]
      : [];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  useEffect(() => {
    if (!news) return;
    setCurrentImageIndex(0);
  }, [news?.id, isOpen]);

  const showPrevImage = () => {
    if (images.length < 2) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const showNextImage = () => {
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
    const threshold = 40;
    if (touchDeltaX.current > threshold) {
      showPrevImage();
    } else if (touchDeltaX.current < -threshold) {
      showNextImage();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  if (!isOpen || !news) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
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

  // Function to format plain text content
  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      // Skip empty lines
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
      // Handle bullet points
      if (line.trim().startsWith('•')) {
        return (
          <li key={index} className="ml-4 mb-1">
            {line.trim().substring(1).trim()}
          </li>
        );
      }
      
      // Handle section headers (lines that end with colon)
      if (line.trim().endsWith(':') && line.trim().length < 100) {
        return (
          <h3 key={index} className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            {line.trim()}
          </h3>
        );
      }
      
      // Regular paragraphs
      return (
        <p key={index} className="mb-4 leading-relaxed">
          {line.trim()}
        </p>
      );
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl max-h-[82vh] overflow-y-auto relative mt-6">
        {/* Header Image */}
        <div
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {images.length > 0 ? (
            <Image
              src={images[currentImageIndex]}
              alt={news.title}
              width={800}
              height={400}
              className="w-full object-cover"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-sm text-gray-400">No image available</span>
            </div>
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={showPrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 text-gray-700 rounded-full p-2 shadow hover:bg-white"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5 animate-bounce motion-reduce:animate-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={showNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 text-gray-700 rounded-full p-2 shadow hover:bg-white"
                aria-label="Next image"
              >
                <svg className="w-5 h-5 animate-bounce motion-reduce:animate-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {currentImageIndex + 1} / {images.length}
              </div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                {images.map((_, index) => (
                  <button
                    key={`dot-${index}`}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Category Badge */}
          <div className="absolute bottom-4 left-4">
            <span 
              className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(news.category)}`}
            >
              {news.category.charAt(0).toUpperCase() + news.category.slice(1)}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-8">
          {/* Meta Information */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span>
              {new Date(news.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          
          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
            {news.title}
          </h2>

          {/* Excerpt */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-lg text-blue-800 italic">
              {news.excerpt}
            </p>
          </div>
          
          {/* Formatted Content */}
          <div className="prose prose-lg max-w-none text-gray-700">
            {formatContent(news.content)}
          </div>
          
          {/* Footer Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Article #{news.id} • {news.category}
            </div>
            <div className="space-x-3">
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: news.title,
                      text: news.excerpt,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
