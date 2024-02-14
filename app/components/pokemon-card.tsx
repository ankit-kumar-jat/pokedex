import { Link } from "@remix-run/react";
import React from "react";
import { PokemonType } from "~/utils/api/types/pokemon";

type PokemonCardProps = {
  name: string;
  id: number;
  types: PokemonType[];
  image?: string | null;
};

const PokemonCard = ({ name, id, types, image }: PokemonCardProps) => {
  return (
    <div className="relative mb-2">
      <div className="bg-gray-200 p-4">
        <Link
          to={`/${id}`}
          className="peer absolute inset-0 z-10 w-full h-full overflow-hidden ring-gray-700 focus:ring-2 outline-none"
        >
          <span className="sr-only">View {name} details</span>
        </Link>
        <img
          src={image ?? ""}
          alt={name}
          height={475}
          width={475}
          loading="lazy"
          className="w-full h-auto peer-hover:scale-[1.2] peer-focus:scale-[1.2] peer-hover:translate-y-6 peer-hover:-translate-x-4 peer-focus:-translate-x-4 transition-all peer-hover:drop-shadow-3d duration-300 peer-focus:drop-shadow-3d peer-focus:translate-y-6"
        />
      </div>
      <div className="p-2">
        <p className="text-sm font-medium text-gray-500 mt-3 drop-shadow">
          #{id.toString().padStart(4, "0")}
        </p>
        <p className="text-xl font-bold text-gray-800 capitalize mt-2">
          {name}
        </p>
        <p className="flex gap-2 mt-1">
          {types.map((type) => (
            <span
              className="bg-gray-200 rounded-md px-3 capitalize"
              key={type.id}
            >
              {type.name}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
};

export default PokemonCard;
