export type GeoPlaceDAO = {
  id: number;
  cog: string;
  geom: string;
};

export type LightGeoPlace = Omit<GeoPlaceDAO, "geom">;

export type GeoPlacePriceAvg = Omit<GeoPlaceDAO, "id"> & { price: number };
