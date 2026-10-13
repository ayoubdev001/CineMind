import useWatchlistStore from "../../store/watchlistStore";
import LibraryGrid from "../../components/LibraryGrid";

export default function Watchlist() {
  const items = useWatchlistStore((state) => state.items);
  const isLoading = useWatchlistStore((state) => state.isLoading);
  const fetchWatchlist = useWatchlistStore((state) => state.fetchWatchlist);

  return (
    <LibraryGrid
      items={items}
      isLoading={isLoading}
      onRefresh={fetchWatchlist}
      emptyText="Your watchlist is empty. Tap the bookmark on any movie."
    />
  );
}