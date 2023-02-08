import { ListingsDAO } from "../../domains/listings";

export interface ListingsRepository {
  createListingsTable(): Promise<void>;
  clearListingsTable(): Promise<void>;
  insertManyListings(listingsToInsert: ListingsDAO[]): Promise<void>;
  getVolumesByPlaceId(
    place_id: number,
    minPrice: number,
    maxPrice: number
  ): Promise<{}[]>;
}
