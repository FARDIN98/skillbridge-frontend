import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showCount?: boolean;
  reviewCount?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showCount = false,
  reviewCount
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);

  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;
          const isPartiallyFilled = starValue > displayRating && starValue - 1 < displayRating;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              disabled={!interactive}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
            >
              <Star
                className={`${sizeStyles[size]} ${
                  isFilled
                    ? 'fill-yellow-400 text-yellow-400'
                    : isPartiallyFilled
                    ? 'fill-yellow-200 text-yellow-400'
                    : 'fill-gray-200 text-gray-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showCount && reviewCount !== undefined && (
        <span className="text-sm text-gray-600 ml-1">
          ({reviewCount})
        </span>
      )}

      {!showCount && rating > 0 && (
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
