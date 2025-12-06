import React from "react";

function Pagination({ page, onPrev, onNext, disabledPrev, disabledNext }) {
  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      <button
        onClick={onPrev}
        disabled={disabledPrev}
        className="px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-white/80 text-slate-800 shadow-md border border-black/10 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
      >
        ◀ Prev
      </button>
      <span className="text-xs sm:text-sm font-semibold text-white drop-shadow-sm">
        Page{" "}
        <span className="px-2 py-1 rounded-full bg-slate-900/70 border border-white/20">
          {page}
        </span>
      </span>
      <button
        onClick={onNext}
        disabled={disabledNext}
        className="px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-white/80 text-slate-800 shadow-md border border-black/10 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
      >
        Next ▶
      </button>
    </div>
  );
}

export default Pagination;
