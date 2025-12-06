import React from "react";

function TypeFilter({ types, selectedType, onTypeChange }) {
  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-white/90 mb-1">
        Filter by type
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onTypeChange("all")}
          className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-sm border border-white/40 transition ${
            selectedType === "all"
              ? "bg-white text-slate-900"
              : "bg-white/20 text-white hover:bg-white/40"
          }`}
        >
          All
        </button>
        {types.map((type) => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-sm border border-white/40 transition capitalize ${
              selectedType === type
                ? "bg-yellow-300 text-slate-900"
                : "bg-white/20 text-white hover:bg-white/40"
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TypeFilter;
