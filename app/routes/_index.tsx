import type { MetaFunction } from "@remix-run/node";

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
  return <div className="text-3xl text-red-800">Pokemon Home</div>;
}
