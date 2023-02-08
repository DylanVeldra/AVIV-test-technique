import { GeoPlacePriceAvg, LightGeoPlace } from "../../domains/geoPlace";

export interface GeoPlaceRepository {
  getGeoms(): Promise<LightGeoPlace[]>;
  getGeomsWithPriceAvg(): Promise<GeoPlacePriceAvg[]>;
  getGeomByCog(cog: string): Promise<LightGeoPlace | undefined>;
}
