export type Pokemon = {
  baseExperience: number;
  abilities: PokemonAbility[];
  height: number;
  forms: PokemonForm[];
  id: number;
  isDefault: boolean;
  name: string;
  species: PokemonSpecies;
  weight: number;
  types: PokemonType[];
  stats: PokemonStat[];
  image?: string | null;
  // moves pokemon can learn
  moves: PokemonMove[];
};

export type PokemonAbility = {
  name: string;
  id: number;
  isHidden: boolean;
  slot: number;
};

export type PokemonForm = {
  name: string;
  id: number;
};

export type PokemonSpecies = {
  name: string;
  id: number;
};

export type PokemonType = {
  name: string;
  id: number;
  slot: number;
};

export type PokemonStat = {
  name: string;
  id: number;
  baseStat: number;
  effort: number;
};

export type PokemonMove = {
  name: string;
  id: number;
};
