import React from 'react';

export function MovieCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-48">
      <div className="skeleton aspect-[2/3] rounded-md" />
      <div className="skeleton h-4 w-3/4 mt-2 rounded" />
      <div className="skeleton h-3 w-1/2 mt-1 rounded" />
    </div>
  );
}

export function MovieRowSkeleton() {
  return (
    <div className="mb-8">
      <div className="skeleton h-8 w-48 mb-4 px-4 md:px-12 rounded" />
      <div className="flex space-x-4 px-4 md:px-12">
        {[...Array(6)].map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[80vh] bg-netflix-darkGray">
      <div className="absolute bottom-0 left-0 right-0 p-12">
        <div className="skeleton h-12 w-96 mb-4 rounded" />
        <div className="skeleton h-6 w-full max-w-2xl mb-6 rounded" />
        <div className="flex space-x-4">
          <div className="skeleton h-12 w-32 rounded" />
          <div className="skeleton h-12 w-32 rounded" />
        </div>
      </div>
    </div>
  );
}
