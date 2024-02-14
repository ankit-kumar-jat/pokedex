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
  const page = Number(url.searchParams.get("page")) || 1;
  const pageSize = Number(url.searchParams.get("page-size")) || 20;

  const { pokemons, count } = await getPokemons({
    page: page,
    pageSize: pageSize,
    timings,
    search: query ?? undefined,
  });

  return json(
    { pokemons, count, totalPages: Math.ceil(count / pageSize) },
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
  const { pokemons, totalPages } = useLoaderData<typeof loader>();

  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q");
  const page = Number(searchParams.get("page")) || 1;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchValue = e.target.value;
    setSearchParams(
      (prev) => {
        if (newSearchValue) {
          prev.set("q", newSearchValue);
          prev.delete("page");
          prev.delete("page-size");
        } else {
          prev.delete("q");
        }
        return prev;
      },
      { preventScrollReset: true }
    );
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setSearchParams((prev) => {
        if (newPage === 1) prev.delete("page");
        else prev.set("page", newPage.toString());

        return prev;
      });
    }
  };

  return (
    <div className="mb-9 mt-4">
      <div className="py-4">
        <input
          type="text"
          className="border-2 border-gray-300 px-2 py-1 rounded-lg"
          placeholder="Search"
          onChange={debounce({ callback: handleSearchChange, wait: 500 })}
          defaultValue={q ?? undefined}
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
      <div className="p-4 mb-6 flex justify-center gap-6 items-center">
        <button
          title="Go to Previous page"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="text-gray-700 font-medium text-lg"
        >
          {"<"} Prev
        </button>
        <p className="font-semibold text-gray-600 text-xl">
          {page}/{totalPages}
        </p>
        <button
          title="Go to Next page"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="text-gray-700 font-medium text-lg"
        >
          Next {">"}
        </button>
      </div>
    </div>
  );
}
