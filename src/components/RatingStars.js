'use client';
import { Star } from 'lucide-react';
import { useState } from 'react';

export default function RatingStars({ value = 0, onChange, size = 20 }) {
  const [hover, setHover] = useState(0);
  const interactive = !!onChange;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          className={`transition-colors ${
            i <= (hover || value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
          } ${interactive ? 'cursor-pointer' : ''}`}
          onClick={() => interactive && onChange(i)}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
        />
      ))}
    </div>
  );
}
