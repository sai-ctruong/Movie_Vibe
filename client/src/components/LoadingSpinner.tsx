
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export default function LoadingSpinner({ size = 'md', fullScreen = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div
      className={`spinner ${sizeClasses[size]} border-netflix-gray border-t-netflix-red rounded-full animate-spin`}
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
