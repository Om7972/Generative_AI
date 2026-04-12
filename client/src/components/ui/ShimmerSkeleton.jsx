import React from 'react';

const ShimmerSkeleton = ({ variant = 'card', count = 1 }) => {
  const cardSkeleton = (i) => (
    <div key={i} className="glass-card rounded-2xl p-5 space-y-3" aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl shimmer-bg" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2 shimmer-bg" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3 shimmer-bg" />
        </div>
      </div>
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4 shimmer-bg" />
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-2/3 shimmer-bg" />
    </div>
  );

  const lineSkeleton = (i) => (
    <div key={i} className="flex items-center gap-3 p-3" aria-hidden="true">
      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full shimmer-bg" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-4/5 shimmer-bg" />
        <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/5 shimmer-bg" />
      </div>
    </div>
  );

  const chartSkeleton = (i) => (
    <div key={i} className="glass-card rounded-2xl p-5 space-y-4" aria-hidden="true">
      <div className="flex justify-between items-center">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3 shimmer-bg" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-16 shimmer-bg" />
      </div>
      <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl shimmer-bg" />
    </div>
  );

  const renderFn = variant === 'line' ? lineSkeleton : variant === 'chart' ? chartSkeleton : cardSkeleton;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => renderFn(i))}
    </>
  );
};

export default ShimmerSkeleton;
