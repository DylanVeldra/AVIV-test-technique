import { ListingsDAO } from "../domains/listings";
import { sql } from "../provider/postgres";
import { ListingsRepository } from "./contract/listings";

class ListingsPostgreRepository implements ListingsRepository {
  async createListingsTable() {
    await sql`
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER,
      place_id INTEGER,
      price INTEGER,
      area INTEGER,
      room_count INTEGER,
      seen_at TIMESTAMP,
      PRIMARY KEY (id, seen_at)
    )
  `;
  }

  async clearListingsTable() {
    await sql`
    DELETE FROM listings
  `;
  }

  async insertManyListings(listings: ListingsDAO[]) {
    await sql`insert into listings ${sql(listings)}`;
  }

  async getVolumesByPlaceId(
    place_id: number,
    minPrice: number,
    maxPrice: number
  ): Promise<{}[]> {
    return sql<{}[]>`
        SELECT
        FROM listings
        WHERE place_id = ${place_id} AND area != 0 AND price / area BETWEEN ${minPrice} AND ${maxPrice}
      `;
  }
}

export const listingsRepository: ListingsRepository =
  new ListingsPostgreRepository();
