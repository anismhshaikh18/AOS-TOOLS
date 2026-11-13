import React, { useState, useEffect } from 'react';
import { Star, Check } from 'lucide-react';

interface StarRatingWidgetProps {
  toolId: string;
  toolName: string;
  className?: string;
  compact?: boolean;
}

interface StoredRatingData {
  userRating: number;
  averageRating: number;
  totalVotes: number;
  ratedAt: string;
}

export const StarRatingWidget: React.FC<StarRatingWidgetProps> = ({
  toolId,
  toolName,
  className = '',
  compact = false,
}) => {
  const storageKey = `aos_rating_${toolId}`;

  // Start fresh with real data from localStorage - ZERO fake ratings or mock numbers
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [hasRated, setHasRated] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Load real persisted rating for this tool from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: StoredRatingData = JSON.parse(saved);
        // Clean up any legacy mock seeds with inflated vote counts
        if (parsed.totalVotes && parsed.totalVotes > 5) {
          localStorage.removeItem(storageKey);
          setUserRating(null);
          setHasRated(false);
          setAverageRating(null);
          setTotalVotes(0);
          return;
        }
        if (parsed.userRating) {
          setUserRating(parsed.userRating);
          setHasRated(true);
          setAverageRating(parsed.averageRating ?? parsed.userRating);
          setTotalVotes(parsed.totalVotes ?? 1);
        }
      } else {
        // Reset cleanly for new tool
        setUserRating(null);
        setHasRated(false);
        setAverageRating(null);
        setTotalVotes(0);
      }
    } catch {
      // Ignore read errors
    }
  }, [toolId, storageKey]);

  const handleRate = (rating: number) => {
    setUserRating(rating);
    const isNew = !hasRated;
    const newVotes = isNew ? (totalVotes === 0 ? 1 : totalVotes + 1) : totalVotes;
    const currentAvg = averageRating ?? rating;
    const newAvg = isNew
      ? Number((((currentAvg * (newVotes - 1)) + rating) / newVotes).toFixed(1))
      : Number((((currentAvg * totalVotes) - (userRating || currentAvg) + rating) / totalVotes).toFixed(1));

    setAverageRating(newAvg);
    setTotalVotes(newVotes);
    setHasRated(true);

    try {
      const data: StoredRatingData = {
        userRating: rating,
        averageRating: newAvg,
        totalVotes: newVotes,
        ratedAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      // Ignore write errors
    }

    setFeedbackMsg(`Thank you! You rated ${rating} / 5 stars`);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 3500);
  };

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 1: return '1 Star - Needs Improvement';
      case 2: return '2 Stars - Fair';
      case 3: return '3 Stars - Good';
      case 4: return '4 Stars - Very Good';
      case 5: return '5 Stars - Excellent!';
      default: return '';
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-2 sm:gap-3 text-xs ${className}`}
      aria-label={`Rating for ${toolName}`}
    >
      {/* Score Badge: Displays Real Average or Rate Prompt */}
      {averageRating !== null ? (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold font-mono tracking-tight shrink-0 shadow-xs">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
          <span>{averageRating.toFixed(1)} / 5</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-[11px] shrink-0">
          <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Rate this tool</span>
        </div>
      )}

      {/* Interactive 5 Star Clickable Row */}
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => setHoverRating(null)}
        role="group"
        aria-label="Star rating options"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hoverRating ?? (userRating || (averageRating ? Math.floor(averageRating) : 0)));

          return (
            <button
              key={star}
              type="button"
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoverRating(star)}
              onFocus={() => setHoverRating(star)}
              onBlur={() => setHoverRating(null)}
              title={getRatingLabel(star)}
              aria-label={`Rate ${star} out of 5 stars`}
              className="p-1 rounded hover:scale-120 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 group"
            >
              <Star
                className={`w-4 h-4 transition-colors ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_1px_3px_rgba(251,191,36,0.4)]'
                    : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Real Review Count or Invitation */}
      <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px] whitespace-nowrap">
        {totalVotes > 0 ? (
          `(${totalVotes} ${totalVotes === 1 ? 'review' : 'reviews'})`
        ) : (
          <span className="italic text-slate-400 dark:text-slate-500">(Be the first to rate)</span>
        )}
      </span>

      {/* Dynamic Feedback or User Status */}
      {feedbackMsg ? (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-md animate-in fade-in slide-in-from-left-2 duration-200">
          <Check className="w-3 h-3 text-emerald-500" />
          <span>{feedbackMsg}</span>
        </span>
      ) : hasRated ? (
        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
          <span>You rated: ★ {userRating}/5</span>
        </span>
      ) : hoverRating ? (
        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold animate-in fade-in duration-150">
          {getRatingLabel(hoverRating)}
        </span>
      ) : null}
    </div>
  );
};
