import React, { useEffect, useState } from "react";

function PokemonModal({
  pokemon,
  onClose,
  isFavorite,
  onToggleFavorite,
  showShiny,
}) {
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [loadingEvolution, setLoadingEvolution] = useState(false);
  const [evolutionError, setEvolutionError] = useState(null);

  const displayImage =
    showShiny && pokemon.shinyImage ? pokemon.shinyImage : pokemon.normalImage;

  useEffect(() => {
    let cancelled = false;

    const fetchEvolution = async () => {
      setLoadingEvolution(true);
      setEvolutionError(null);
      setEvolutionChain([]);

      try {
        const speciesRes = await fetch(
          `https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`
        );
        if (!speciesRes.ok) throw new Error("Failed to fetch species.");
        const speciesData = await speciesRes.json();

        const chainUrl = speciesData.evolution_chain?.url;
        if (!chainUrl) {
          setLoadingEvolution(false);
          return;
        }

        const chainRes = await fetch(chainUrl);
        if (!chainRes.ok) throw new Error("Failed to fetch evolution chain.");
        const chainData = await chainRes.json();

        const names = [];
        const traverse = (node) => {
          if (!node) return;
          names.push(node.species.name);
          node.evolves_to.forEach(traverse);
        };
        traverse(chainData.chain);

        const uniqueNames = [...new Set(names)];

        const details = await Promise.all(
          uniqueNames.map(async (name) => {
            const res = await fetch(
              `https://pokeapi.co/api/v2/pokemon/${name}`
            );
            if (!res.ok)
              throw new Error("Failed to fetch evolution Pokémon.");
            const data = await res.json();

            const image =
              data.sprites?.other?.["official-artwork"]?.front_default ||
              data.sprites?.front_default ||
              "";

            return {
              id: data.id,
              name: data.name,
              image,
            };
          })
        );

        if (!cancelled) {
          setEvolutionChain(details);
        }
      } catch (err) {
        if (!cancelled) {
          setEvolutionError(err?.message || "Failed to load evolution data.");
        }
      } finally {
        if (!cancelled) {
          setLoadingEvolution(false);
        }
      }
    };

    fetchEvolution();

    return () => {
      cancelled = true;
    };
  }, [pokemon.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl shadow-2xl border border-yellow-300/40 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full w-8 h-8 flex items-center justify-center bg-black/40 text-white text-lg hover:bg-black/70"
        >
          ✕
        </button>

        <div className="px-5 pt-6 pb-4 flex items-start gap-4">
          <img
            src={displayImage}
            alt={pokemon.name}
            className="w-28 h-28 object-contain drop-shadow-lg"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-extrabold text-white capitalize tracking-wide">
                {pokemon.name}
              </h2>
              <span className="text-xs font-bold text-yellow-300">
                #{String(pokemon.id).padStart(3, "0")}
              </span>
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              {pokemon.types.map((type) => (
                <span
                  key={type}
                  className="text-[10px] px-2 py-0.5 rounded-full bg.white/10 text-yellow-200 capitalize border border-yellow-300/60"
                >
                  {type}
                </span>
              ))}
            </div>

            <button
              onClick={onToggleFavorite}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-yellow-300 text-slate-900 shadow-md active:scale-95 transition-transform"
            >
              {isFavorite ? "⭐ Remove favorite" : "☆ Add to favorites"}
            </button>
          </div>
        </div>

        <div className="px-5 pb-5 grid grid-cols-2 gap-3 text-xs text-slate-100">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <h3 className="font-semibold text-[11px] uppercase tracking-wide text-yellow-200 mb-1">
              Basic Info
            </h3>
            <p>
              Height: <span className="font-semibold">{pokemon.height}</span>
            </p>
            <p>
              Weight: <span className="font-semibold">{pokemon.weight}</span>
            </p>
            <p className="mt-1">
              Abilities:
              <span className="block mt-1 text-[11px]">
                {pokemon.abilities.join(", ")}
              </span>
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border.white/10">
            <h3 className="font-semibold text-[11px] uppercase tracking-wide text-yellow-200 mb-1">
              Stats
            </h3>
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
              {pokemon.stats.map((stat) => (
                <div
                  key={stat.name}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="capitalize text-[10px]">
                    {stat.name.replace("-", " ")}
                  </span>
                  <div className="flex items-center gap-1 w-20">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-yellow-300"
                        style={{
                          width: `${Math.min(
                            (stat.value / 150) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold">
                      {stat.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Evolution Chain */}
        <div className="px-5 pb-4 text-xs text-slate-100">
          <h3 className="font-semibold text-[11px] uppercase tracking-wide text-yellow-200 mb-2">
            Evolution Chain
          </h3>

          {loadingEvolution && (
            <p className="text-[11px] text-slate-300">Loading evolutions…</p>
          )}

          {evolutionError && !loadingEvolution && (
            <p className="text-[11px] text-red-300">{evolutionError}</p>
          )}

          {!loadingEvolution &&
            !evolutionError &&
            evolutionChain.length === 0 && (
              <p className="text-[11px] text-slate-300">
                No evolution data available.
              </p>
            )}

          {!loadingEvolution && evolutionChain.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {evolutionChain.map((evo, index) => (
                <React.Fragment key={evo.id}>
                  {index > 0 && (
                    <span className="text-[12px] text-yellow-200">➜</span>
                  )}
                  <div className="flex flex-col items-center min-w-[70px]">
                    <img
                      src={evo.image}
                      alt={evo.name}
                      className="w-12 h-12 object-contain drop-shadow-md"
                    />
                    <span className="mt-1 text-[10px] capitalize">
                      {evo.name}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 pb-4 text-[10px] text-center text-slate-300/80">
          Tap ✕ to close
        </div>
      </div>
    </div>
  );
}

export default PokemonModal;
