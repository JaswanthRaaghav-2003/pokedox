import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import SearchBar from "./components/SearchBar.jsx";
import TypeFilter from "./components/TypeFilter.jsx";
import PokemonCard from "./components/PokemonCard.jsx";
import PokemonModal from "./components/PokemonModal.jsx";

const PAGE_SIZE = 20;
const FAVORITES_KEY = "pokedex-lite-favorites";
const THEME_KEY = "pokedex-theme";
const SHINY_KEY = "pokedex-shiny";

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [page, setPage] = useState(1);
  const [totalAvailable, setTotalAvailable] = useState(null);

  const [search, setSearch] = useState("");
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("all");

  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "favorites"

  const [favoritePokemons, setFavoritePokemons] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  const [loadingList, setLoadingList] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [errorList, setErrorList] = useState(null);
  const [errorFavorites, setErrorFavorites] = useState(null);

  const [theme, setTheme] = useState("light");
  const [showShiny, setShowShiny] = useState(false);

  const loaderRef = useRef(null);
  const soundRef = useRef(null);

  const loading = activeTab === "all" ? loadingList : loadingFavorites;
  const error = activeTab === "all" ? errorList : errorFavorites;

  // --- Init from localStorage ---
  useEffect(() => {
    try {
      const storedFav = localStorage.getItem(FAVORITES_KEY);
      if (storedFav) setFavorites(JSON.parse(storedFav));
    } catch {}

    try {
      const storedTheme = localStorage.getItem(THEME_KEY);
      if (storedTheme === "dark" || storedTheme === "light") {
        setTheme(storedTheme);
      }
    } catch {}

    try {
      const storedShiny = localStorage.getItem(SHINY_KEY);
      if (storedShiny === "true") {
        setShowShiny(true);
      }
    } catch {}
  }, []);

  // Apply + persist theme
  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("bg-slate-950");
    } else {
      document.body.classList.remove("bg-slate-950");
    }
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);

  // Persist shiny toggle
  useEffect(() => {
    try {
      localStorage.setItem(SHINY_KEY, showShiny ? "true" : "false");
    } catch {}
  }, [showShiny]);

  // Prepare click sound
  useEffect(() => {
    soundRef.current = new Audio("/sounds/poke-cry.mp3");
  }, []);

  const playCardSound = () => {
    if (!soundRef.current) return;
    try {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch(() => {});
    } catch {}
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Fetch Pokémon types once
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await fetch("https://pokeapi.co/api/v2/type");
        const data = await res.json();
        const typeNames = (data.results || []).map((t) => t.name);
        setTypes(typeNames);
      } catch {
        // ignore filter error
      }
    };
    fetchTypes();
  }, []);

  // Helper: fetch Pokémon by ID -> full object
  const fetchPokemonById = async (id) => {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!res.ok) throw new Error("Failed to fetch Pokémon by ID");
    const data = await res.json();

    const normalImage =
      data.sprites?.other?.["official-artwork"]?.front_default ||
      data.sprites?.front_default ||
      "";

    const shinyImage =
      data.sprites?.front_shiny ||
      data.sprites?.other?.["official-artwork"]?.front_shiny ||
      "";

    return {
      id: data.id,
      name: data.name,
      normalImage,
      shinyImage,
      types: data.types.map((t) => t.type.name),
      height: data.height,
      weight: data.weight,
      abilities: data.abilities.map((a) => a.ability.name),
      stats: data.stats.map((s) => ({
        name: s.stat.name,
        value: s.base_stat,
      })),
    };
  };

  // Fetch main paginated list (All tab) – infinite scroll
  useEffect(() => {
    const fetchPage = async () => {
      setLoadingList(true);
      setErrorList(null);

      const offset = (page - 1) * PAGE_SIZE;

      try {
        const listRes = await fetch(
          `https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE}&offset=${offset}`
        );
        if (!listRes.ok) {
          throw new Error("Failed to fetch Pokémon list");
        }
        const listData = await listRes.json();

        setTotalAvailable(listData.count ?? null);

        const detailed = await Promise.all(
          listData.results.map(async (item) => {
            const res = await fetch(item.url);
            const data = await res.json();

            const normalImage =
              data.sprites?.other?.["official-artwork"]?.front_default ||
              data.sprites?.front_default ||
              "";

            const shinyImage =
              data.sprites?.front_shiny ||
              data.sprites?.other?.["official-artwork"]?.front_shiny ||
              "";

            return {
              id: data.id,
              name: data.name,
              normalImage,
              shinyImage,
              types: data.types.map((t) => t.type.name),
              height: data.height,
              weight: data.weight,
              abilities: data.abilities.map((a) => a.ability.name),
              stats: data.stats.map((s) => ({
                name: s.stat.name,
                value: s.base_stat,
              })),
            };
          })
        );

        setPokemons((prev) => [...prev, ...detailed]);
      } catch (err) {
        setErrorList(
          err?.message || "Something went wrong while fetching Pokémon."
        );
      } finally {
        setLoadingList(false);
      }
    };

    fetchPage();
  }, [page]);

  const hasMore =
    totalAvailable !== null ? pokemons.length < totalAvailable : true;

  // Infinite scroll only on All tab
  useEffect(() => {
    if (activeTab !== "all") return;
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loadingList && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [activeTab, loadingList, hasMore]);

  // Favorites tab: load full data for all favorite IDs
  useEffect(() => {
    const loadFavorites = async () => {
      if (activeTab !== "favorites") return;

      if (!favorites.length) {
        setFavoritePokemons([]);
        setErrorFavorites(null);
        return;
      }

      setLoadingFavorites(true);
      setErrorFavorites(null);

      try {
        const results = await Promise.all(
          favorites.map((id) => fetchPokemonById(id))
        );
        setFavoritePokemons(results);
      } catch (err) {
        setErrorFavorites(
          err?.message || "Failed to load favorite Pokémon data."
        );
      } finally {
        setLoadingFavorites(false);
      }
    };

    loadFavorites();
  }, [activeTab, favorites]);

  // 🔍 Filtering: this is where search is applied
  const filteredPokemons = useMemo(() => {
    const baseList = activeTab === "favorites" ? favoritePokemons : pokemons;

    let result = [...baseList];

    const term = search.trim().toLowerCase();

    if (term) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(term)
      );
    }

    if (selectedType !== "all") {
      result = result.filter((p) => p.types.includes(selectedType));
    }

    return result;
  }, [pokemons, favoritePokemons, search, selectedType, activeTab]);

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDark ? "bg-slate-950 text-slate-50" : ""
      }`}
    >
      <Header
        favoritesCount={favorites.length}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
        onToggleTheme={() =>
          setTheme((prev) => (prev === "dark" ? "light" : "dark"))
        }
        showShiny={showShiny}
        onToggleShiny={() => setShowShiny((prev) => !prev)}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-10 pb-6">
        {/* Controls: ONE search bar + type filter */}
        <section className="bg-black/25 border border-white/20 rounded-3xl shadow-xl px-4 py-3 sm:px-6 sm:py-4 mb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1 flex flex-col gap-3 sm:flex-row sm:items-end">
              {/* Single search bar */}
              <div className="w-full sm:max-w-xs">
                <SearchBar search={search} onSearchChange={setSearch} />
              </div>

              {/* Type filter */}
              <div className="w-full sm:flex-1">
                <TypeFilter
                  types={types}
                  selectedType={selectedType}
                  onTypeChange={setSelectedType}
                />
              </div>
            </div>

            <div className="text-[10px] sm:text-xs text-white/80 mt-1 sm:mt-0">
              Data from{" "}
              <a
                href="https://pokeapi.co/"
                target="_blank"
                rel="noreferrer"
                className="underline font-semibold"
              >
                PokéAPI
              </a>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="bg-red-600/80 border border-red-200 rounded-2xl px-4 py-3 text-sm text-white mb-4">
            <p className="font-semibold mb-1">Oops!</p>
            <p>{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!error && filteredPokemons.length === 0 && !loading && (
          <div className="bg-black/30 rounded-3xl border border-white/20 px-4 py-6 text-center text-sm text-white/90">
            {activeTab === "favorites"
              ? "You don't have any favorite Pokémon that match these filters."
              : "No Pokémon found for your filters."}
            <br />
            <span className="text-xs text-white/70">
              Try clearing the search or selecting a different type.
            </span>
          </div>
        )}

        {/* Grid */}
        {filteredPokemons.length > 0 && (
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredPokemons.map((pokemon) => (
              <PokemonCard
                key={pokemon.id}
                pokemon={pokemon}
                isFavorite={favorites.includes(pokemon.id)}
                onToggleFavorite={() => toggleFavorite(pokemon.id)}
                onSelect={() => setSelectedPokemon(pokemon)}
                showShiny={showShiny}
                onPlaySound={playCardSound}
              />
            ))}
          </section>
        )}

        {/* Infinite scroll loader – only for All tab */}
        {activeTab === "all" && (
          <div ref={loaderRef} className="flex justify-center py-4">
            {loadingList && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-white/60 border-t-yellow-300 rounded-full animate-spin" />
                <p className="text-xs text-white/90 font-semibold">
                  Loading more Pokémon…
                </p>
              </div>
            )}
            {!loadingList && !hasMore && (
              <p className="text-[11px] text-white/80">
                You’ve reached the end of the Pokédex!
              </p>
            )}
          </div>
        )}

        {selectedPokemon && (
          <PokemonModal
            pokemon={selectedPokemon}
            onClose={() => setSelectedPokemon(null)}
            isFavorite={favorites.includes(selectedPokemon.id)}
            onToggleFavorite={() => toggleFavorite(selectedPokemon.id)}
            showShiny={showShiny}
          />
        )}
      </main>

      <footer className="py-3 text-center text-[10px] text-white/80">
        Built with ❤️ by JASWANTH RAAGHAV A using React, Vite & Tailwind · PokéAPI powered
      </footer>
    </div>
  );
}

export default App;
