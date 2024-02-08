import { cachified, cache, generateCacheKey } from "../cache.server";
import { apiClient } from "./api.server";
import type { Timings } from "../timing.server";
import { getIdFromUrl, pick } from "../misc";
import { Filter, SortBy, searchFilterSortPaginateList } from "../filter.server";
import {
  NamedAPIResourceList,
  Pokemon as PokeApiPokemon,
} from "./types/pokemon-api";
import { Pokemon } from "./types/pokemon";

export async function getAllPokemons({ timings }: { timings?: Timings } = {}) {
  return cachified({
    key: generateCacheKey("pokemons", "all"),
    cache,
    timings,
    ttl: 1000 * 60 * 60 * 24,
    staleWhileRevalidate: 1000 * 60 * 60 * 24,
    getFreshValue: async () => {
      const res: NamedAPIResourceList = await apiClient("pokemon", {
        params: { limit: 100000, offset: 0 },
      });

      const promises = res.results.map((pokemon) =>
        getPokemonById({ pokemonId: getIdFromUrl(pokemon.url) })
      );
      const result = await Promise.all(promises);

      return result;
    },
  });
}

export async function getPokemons({
  page,
  pageSize,
  filters,
  sortBy,
  search,
  timings,
}: {
  filters?: Filter;
  sortBy?: SortBy;
  search?: string;
  page?: number;
  pageSize?: number;
  timings?: Timings;
} = {}) {
  return cachified({
    key: generateCacheKey("pokemons", filters, sortBy, search, page, pageSize),
    cache,
    timings,
    ttl: 1000 * 60 * 60 * 24,
    staleWhileRevalidate: 1000 * 60 * 60 * 24,
    getFreshValue: async () => {
      const allPokemons = await getAllPokemons();
      const result = await searchFilterSortPaginateList<Pokemon>({
        list: allPokemons,
        page,
        pageSize,
        filters,
        search,
        sortBy,
        timings,
      });

      return result;
    },
  });
}

export async function getPokemonById({
  pokemonId,
  timings,
}: {
  pokemonId: number;
  timings?: Timings;
}) {
  return cachified({
    key: generateCacheKey("pokemons", pokemonId),
    cache,
    timings,
    ttl: 1000 * 60 * 60 * 24 * 6,
    staleWhileRevalidate: 1000 * 60 * 60 * 24,
    getFreshValue: async () => {
      const res: PokeApiPokemon = await apiClient(`pokemon/${pokemonId}`);
      return formatPokemon(res);
    },
  });
}

const formatPokemon = (pokemon: PokeApiPokemon): Pokemon => ({
  baseExperience: pokemon.base_experience,
  abilities: pokemon.abilities.map((ability) => ({
    name: ability.ability.name,
    id: getIdFromUrl(ability.ability.url),
    isHidden: ability.is_hidden,
    slot: ability.slot,
  })),
  height: pokemon.height,
  forms: pokemon.forms.map((form) => ({
    name: form.name,
    id: getIdFromUrl(form.url),
  })),
  id: pokemon.id,
  isDefault: pokemon.is_default,
  name: pokemon.name,
  species: {
    name: pokemon.species.name,
    id: getIdFromUrl(pokemon.species.url),
  },
  weight: pokemon.weight,
  types: pokemon.types.map((type) => ({
    name: type.type.name,
    id: getIdFromUrl(type.type.url),
    slot: type.slot,
  })),
  stats: pokemon.stats.map((stat) => ({
    name: stat.stat.name,
    id: getIdFromUrl(stat.stat.url),
    baseStat: stat.base_stat,
    effort: stat.effort,
  })),
  image: pokemon.sprites.other?.["official-artwork"].front_default,
  moves: pokemon.moves.map((move) => ({
    id: getIdFromUrl(move.move.url),
    name: move.move.name,
  })),
});
