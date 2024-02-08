import { Timings, time } from "./timing.server";

export type Filter = {
  [key: string]: any;
};

export type SortBy = {
  property: string;
  order: "asc" | "desc";
};

export async function searchFilterSortPaginateList<
  T extends Record<string, any>
>({
  list,
  filters,
  sortBy,
  search,
  page = 1,
  pageSize = 30,
  timings,
}: {
  list: T[];
  filters?: Filter;
  sortBy?: SortBy;
  search?: string;
  page?: number;
  pageSize?: number;
  timings?: Timings;
}): Promise<{ pokemons: T[]; count: number }> {
  return time(
    new Promise((resolve) => {
      // apply filter and search
      const filteredList = list.filter((obj) => {
        const filterMatch =
          !filters ||
          Object.entries(filters).every(([key, value]) => obj[key] === value);

        const searchMatch =
          !search ||
          Object.values(obj).some(
            (val) =>
              typeof val === "string" &&
              val.toLowerCase().includes(search.toLowerCase())
          );

        return filterMatch && searchMatch;
      });

      const sortedList = sortBy
        ? filteredList.sort((a, b) => {
            const aValue = a[sortBy.property];
            const bValue = b[sortBy.property];
            const sortOrder = sortBy.order === "desc" ? -1 : 1;

            if (aValue < bValue) return -1 * sortOrder;
            if (aValue > bValue) return 1 * sortOrder;
            return 0;
          })
        : filteredList;

      // Apply pagination
      const startIdx = (page - 1) * pageSize;
      const paginatedList = sortedList.slice(startIdx, startIdx + pageSize);

      resolve({ pokemons: paginatedList, count: sortedList.length });
    }),
    { timings, type: `filter:pokemon`, desc: `filtering pokemon list` }
  );
}
