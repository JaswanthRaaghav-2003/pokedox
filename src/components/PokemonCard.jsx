import React from "react";

function PokemonCard({
  pokemon,
  isFavorite,
  onToggleFavorite,
  onSelect,
  showShiny,
  onPlaySound,
}) {
  const displayImage =
    showShiny && pokemon.shinyImage ? pokemon.shinyImage : pokemon.normalImage;

  const handleClick = () => {
    if (onPlaySound) onPlaySound();
    onSelect();
  };

  return (
    <div
      className="relative bg-white/90 rounded-3xl shadow-xl overflow-hidden cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-2xl border border-black/5"
      onClick={handleClick}
    >
      {/* Favorite button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="absolute z-10 top-2 right-2 rounded-full px-2 py-1 text-xs font-semibold bg-white/90 text-yellow-500 shadow-md hover:scale-105 transition-transform"
      >
        {isFavorite ? "⭐" : "☆"}
      </button>

      <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 px-2 pt-2 pb-1 flex justify-between items-center">
        <span className="text-[10px] font-bold text-yellow-300 uppercase tracking-wide">
          #{String(pokemon.id).padStart(3, "0")}
        </span>
        <div className="flex gap-1">
          {pokemon.types.map((type) => (
            <span
              key={type}
              className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white capitalize border border-white/20"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center p-3 pb-4">
        <img
          src={displayImage}
          alt={pokemon.name}
          className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-md"
          loading="lazy"
        />
        <h3 className="mt-2 text-sm sm:text-base font-bold text-slate-800 capitalize">
          {pokemon.name}
        </h3>
      </div>
    </div>
  );
}

export default PokemonCard;
