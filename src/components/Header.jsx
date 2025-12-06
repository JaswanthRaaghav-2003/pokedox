import React from "react";

function Header({
  favoritesCount,
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
  showShiny,
  onToggleShiny,
}) {
  return (
    <header className="w-full py-4 px-4 sm:px-6 lg:px-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Logo + title */}
      <div className="flex items-center gap-3">
        <div className="pokeball-icon shrink-0" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-white drop-shadow-md">
            Pokédex Lite
          </h1>
          <p className="text-xs sm:text-sm text-red-50/90">
            Search, filter, favorite and explore Pokémon stats.
          </p>
        </div>
      </div>

      {/* Center: Tabs */}
      <div className="flex items-center justify-center sm:justify-end gap-2">
        <div className="inline-flex rounded-full bg-black/30 border border-white/30 p-1 text-xs sm:text-sm shadow-md">
          <button
            onClick={() => onTabChange("all")}
            className={`px-3 py-1 rounded-full font-semibold transition ${
              activeTab === "all"
                ? "bg-white text-slate-900 shadow"
                : "text-white/80"
            }`}
          >
            All Pokémon
          </button>
          <button
            onClick={() => onTabChange("favorites")}
            className={`px-3 py-1 rounded-full font-semibold flex items-center gap-1 transition ${
              activeTab === "favorites"
                ? "bg-yellow-300 text-slate-900 shadow"
                : "text-white/80"
            }`}
          >
            ⭐ Favorites
            <span className="inline-flex items-center justify-center rounded-full bg-slate-900/80 text-yellow-300 text-[10px] px-2 py-0.5">
              {favoritesCount}
            </span>
          </button>
        </div>
      </div>

      {/* Right: Toggles */}
      <div className="flex items-center justify-between sm:justify-end gap-2">
        {/* Shiny toggle */}
        <button
          onClick={onToggleShiny}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-md border border-white/40 transition-transform active:scale-95 ${
            showShiny
              ? "bg-yellow-300 text-slate-900"
              : "bg-white/80 text-slate-800"
          }`}
        >
          ✨ {showShiny ? "Shiny On" : "Shiny Off"}
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold bg-black/40 text-white shadow-md border border-white/40 active:scale-95 transition-transform"
        >
          {theme === "dark" ? "🌙 Dark" : "🌞 Light"}
        </button>
      </div>
    </header>
  );
}

export default Header;
