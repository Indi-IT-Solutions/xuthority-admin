import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaPreviewModalProps {
  isOpen: boolean;
  mediaUrls: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  isOpen,
  mediaUrls,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
}) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideoUrl = (url: string): boolean => {
    return /\.(mp4|webm|mov|avi|mkv|flv|wmv|m4v|3gp|ogv)(\?.*)?$/i.test(url);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrevious();
          break;
        case 'ArrowRight':
          onNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrevious]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setIsVideoPlaying(false);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    setIsVideoPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [currentIndex]);

  if (!isOpen || !mediaUrls || mediaUrls.length === 0) return null;

  const currentMedia = mediaUrls[currentIndex];
  const isVideo = isVideoUrl(currentMedia);

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div 
          className="relative w-[90vw] max-w-5xl max-h-[90vh] mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 text-white hover:bg-white/10 z-50"
            onClick={onClose}
          >
            <X className="h-10 w-10" />
          </Button>

          <div className="relative flex items-center justify-center gap-4">
            {mediaUrls.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 "
                onClick={onPrevious}
              >
                <ChevronLeft className="h-10 w-10" />
              </Button>
            )}

            <div className="relative flex-1 flex items-center justify-center ">
            {isVideo ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  src={currentMedia}
                  className="w-full h-auto max-h-[80vh] rounded-lg"
                  onClick={handleVideoPlay}
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                >
                  Your browser does not support the video tag.
                </video>
                {!isVideoPlaying && (
                  <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={handleVideoPlay}
                  >
                    <PlayCircle className="h-20 w-20 text-white opacity-80 hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
            ) : (
              <img
                src={currentMedia}
                alt={`Preview ${currentIndex + 1}`}
                className="w-full h-[80vh] rounded-md object-contain bg-white/10"
              />
            )}
            </div>

            {mediaUrls.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={onNext}
              >
                <ChevronRight className="h-10 w-10" />
              </Button>
            )}
          </div>

          {mediaUrls.length > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {mediaUrls.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentIndex ? "bg-white" : "bg-white/40"
                  )}
                  onClick={() => {
                    const diff = index - currentIndex;
                    if (diff > 0) {
                      for (let i = 0; i < diff; i++) onNext();
                    } else if (diff < 0) {
                      for (let i = 0; i < Math.abs(diff); i++) onPrevious();
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaPreviewModal;