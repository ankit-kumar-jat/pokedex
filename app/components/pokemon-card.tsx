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
    <Link to={`/${id}`} className="group">
      <div className="bg-gray-200 p-4 overflow-hidden">
        <img
          src={image ?? ""}
          alt={name}
          height={475}
          width={475}
          loading="lazy"
          className="w-full h-auto group-hover:scale-125 group-focus:scale-125 transition-all "
        />
      </div>
      <div className="p-2">
        <p className="text-sm font-medium text-gray-500">
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
    </Link>
  );
};

export default PokemonCard;
