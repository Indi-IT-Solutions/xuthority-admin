import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

const StarRating = ({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  showValue = false 
}: StarRatingProps) => {
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'md':
        return 'w-4 h-4';
      case 'lg':
        return 'w-5 h-5';
      default:
        return 'w-4 h-4';
    }
  };

  const renderStars = () => {
    return Array.from({ length: maxRating }, (_, index) => (
      <Star
        key={index}
        className={`${getSizeClasses()} ${
          index < rating 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {renderStars()}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">
          {rating}/{maxRating}
        </span>
      )}
    </div>
  );
};

export default StarRating; 