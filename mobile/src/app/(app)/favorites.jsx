import useFavoritesStore from "../../store/favoritesStore";
import LibraryGrid from "../../components/LibraryGrid";

export default function Favorites() {
  const items = useFavoritesStore((state) => state.items);
  const isLoading = useFavoritesStore((state) => state.isLoading);
  const fetchFavorites = useFavoritesStore((state) => state.fetchFavorites);

  return (
    <LibraryGrid
      items={items}
      isLoading={isLoading}
      onRefresh={fetchFavorites}
      emptyText="No favorites yet. Tap the heart on any movie."
    />
  );
}