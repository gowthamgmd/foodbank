import { useState } from 'react';

export default function FeedbackStars({ value = 0, onChange, readOnly = false }) {
    const [hovered, setHovered] = useState(0);

    return (
        <div className="flex gap-1" aria-label={`Rating: ${value} out of 5`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readOnly}
                    onClick={() => !readOnly && onChange?.(star)}
                    onMouseEnter={() => !readOnly && setHovered(star)}
                    onMouseLeave={() => !readOnly && setHovered(0)}
                    className={`text-2xl transition-transform ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                    aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                >
                    <span className={star <= (hovered || value) ? 'text-accent' : 'text-gray-300'}>
                        ★
                    </span>
                </button>
            ))}
        </div>
    );
}
