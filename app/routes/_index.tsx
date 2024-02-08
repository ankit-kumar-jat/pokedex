import type {
  MetaFunction,
  LoaderFunctionArgs,
  HeadersFunction,
} from "@remix-run/node";
import { json, useLoaderData, useSearchParams } from "@remix-run/react";
import PokemonCard from "~/components/pokemon-card";
import { getPokemons } from "~/utils/api/pokemon.server";
import { debounce, reuseUsefulLoaderHeaders } from "~/utils/misc";
import { getServerTimeHeader } from "~/utils/timing.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const timings = {};
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const page = url.searchParams.get("page");
  const pageSize = url.searchParams.get("page-size");

  const { pokemons, count } = await getPokemons({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 20,
    timings,
    search: query ?? undefined,
  });

  return json(
    { pokemons, count },
    {
      headers: {
        "Cache-Control": "public, max-age=1",
        "Server-Timing": getServerTimeHeader(timings),
      },
    }
  );
}

export const headers: HeadersFunction = reuseUsefulLoaderHeaders;

export const meta: MetaFunction = () => {
  return [
    { title: "Pokedex" },
    {
      name: "description",
      content:
        "Find detailed information on all the Pokémon creatures from the game series, including their stats, moves, evolutions, sprites and more. Browse the master list of Pokédexes by region, game or category, or search by name to see a detailed page with Pokédex data.",
    },
  ];
};

export default function Index() {
  const { pokemons } = useLoaderData<typeof loader>();

  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchValue = e.target.value;
    setSearchParams(
      (prev) => {
        if (newSearchValue) prev.set("q", newSearchValue);
        else prev.delete("q");
        return prev;
      },
      { preventScrollReset: true }
    );
  };

  return (
    <div>
      <div className="bg-gray-400 mb-4">
        <div className="container mx-auto p-4">
          <h1 className="font-semibold text-lg uppercase tracking-wider">
            Pokedex
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-4">
        <div className="py-4">
          <input
            type="text"
            className="border-2 border-gray-300 px-2 py-1 rounded-lg"
            placeholder="Search"
            onChange={debounce({ callback: handleSearchChange, wait: 500 })}
            defaultValue={q ?? undefined}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-9">
          {pokemons.map((pokemon) => (
            <PokemonCard
              key={pokemon.id}
              name={pokemon.name}
              image={pokemon.image}
              id={pokemon.id}
              types={pokemon.types}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
