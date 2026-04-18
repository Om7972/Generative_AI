import React from 'react';

const ShimmerSkeleton = ({ variant = 'card', count = 1 }) => {
  const cards = Array.from({ length: count });

  if (variant === 'card') {
    return cards.map((_, i) => (
      <div
        key={i}
        className="rounded-2xl overflow-hidden glass-card p-5 space-y-3 animate-reveal-up"
        style={{ animationDelay: `${i * 0.08}s` }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl shimmer-bg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded-lg shimmer-bg" />
            <div className="h-3 w-1/2 rounded-lg shimmer-bg" />
          </div>
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-3 w-full rounded-lg shimmer-bg" />
          <div className="h-3 w-5/6 rounded-lg shimmer-bg" />
          <div className="h-3 w-2/3 rounded-lg shimmer-bg" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-8 w-20 rounded-lg shimmer-bg" />
          <div className="h-8 w-16 rounded-lg shimmer-bg" />
        </div>
      </div>
    ));
  }

  if (variant === 'line') {
    return cards.map((_, i) => (
      <div
        key={i}
        className="h-4 rounded-lg shimmer-bg animate-reveal-up"
        style={{
          animationDelay: `${i * 0.06}s`,
          width: `${60 + Math.random() * 40}%`,
        }}
      />
    ));
  }

  return null;
};

export default ShimmerSkeleton;
