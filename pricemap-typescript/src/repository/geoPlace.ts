import { GeoPlacePriceAvg, LightGeoPlace } from "../domains/geoPlace";
import { sql } from "../provider/postgres";
import { GeoPlaceRepository } from "./contract/geoPlace";

class GeoPlacePostgreRepository implements GeoPlaceRepository {
  async getGeoms(): Promise<LightGeoPlace[]> {
    return sql<LightGeoPlace[]>`
    SELECT id, cog
    FROM geo_place
  `;
  }

  async getGeomsWithPriceAvg(): Promise<GeoPlacePriceAvg[]> {
    return sql<GeoPlacePriceAvg[]>`
    SELECT
      ST_ASGEOJSON(geom) as geom,
      cog,
      sum(price) / sum(area) as price
    FROM geo_place
    JOIN listings ON geo_place.id = listings.place_id
    group by (geom, cog)
  `;
  }

  async getGeomByCog(cog: string): Promise<LightGeoPlace | undefined> {
    return (
      await sql<LightGeoPlace[]>`
    SELECT id, cog
    FROM geo_place
    WHERE cog = ${cog}
  `
    )[0];
  }
}

export const geoPlaceRepository: GeoPlaceRepository =
  new GeoPlacePostgreRepository();
