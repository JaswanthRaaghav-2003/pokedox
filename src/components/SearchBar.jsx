import React from "react";

function SearchBar({ search, onSearchChange }) {
  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-white/90 mb-1">
        Search by name
      </label>
      <input
        type="text"
        placeholder="e.g. pikachu, charizard..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full rounded-full px-4 py-2 text-sm bg-white/90 text-slate-800 shadow-md outline-none focus:ring-2 focus:ring-yellow-300"
      />
    </div>
  );
}

export default SearchBar;
