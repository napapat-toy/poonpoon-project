export default function HistoryLoading() {
  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* 1. Header Skeleton */}
      <div className="flex items-center gap-3 animate-pulse">
        {/* Back Button Skeleton */}
        <div className="h-12 w-12 rounded-2xl bg-[#EAE4DB]/50 shrink-0" />
        
        {/* Title & Subtitle Skeleton */}
        <div className="space-y-2 flex-1">
          {/* Title */}
          <div className="h-6 w-48 bg-[#EAE4DB] rounded-lg" />
          {/* Subtitle */}
          <div className="h-4 w-64 bg-[#EAE4DB]/60 rounded-md" />
        </div>
      </div>

      {/* 2. List Card Skeleton */}
      <div className="bg-[#FDFBF7] border border-[#EAE4DB] rounded-3xl p-5 space-y-4 animate-pulse">
        {/* Card Title Skeleton */}
        <div className="flex items-center justify-between pb-1 border-b border-[#F7F5F0]">
          <div className="h-5 w-36 bg-[#EAE4DB] rounded-md" />
          <div className="h-4 w-16 bg-[#EAE4DB]/60 rounded-md" />
        </div>

        {/* 6 Skeleton List Items representing transactions */}
        <div className="divide-y divide-[#F7F5F0]">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
            >
              {/* Left Side: Icon + Details */}
              <div className="flex items-center gap-3 flex-1">
                {/* Emoji Circle Skeleton */}
                <div className="h-10 w-10 rounded-xl bg-[#EAE4DB]/60 shrink-0" />
                
                {/* Title + Date */}
                <div className="space-y-1.5 flex-1 max-w-[150px] sm:max-w-xs">
                  {/* Category Title */}
                  <div className="h-4 w-28 bg-[#EAE4DB] rounded-md" />
                  {/* Date */}
                  <div className="h-3.5 w-20 bg-[#EAE4DB]/50 rounded-md" />
                </div>
              </div>

              {/* Right Side: Amount */}
              <div className="h-5 w-16 bg-[#EAE4DB] rounded-md shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
