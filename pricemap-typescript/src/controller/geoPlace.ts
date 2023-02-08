import { Request, Response } from "express";
import { geoPlaceRepository } from "../repository/geoPlace";

export const getGeoms = async (_: Request, res: Response) => {
  const results = await geoPlaceRepository.getGeomsWithPriceAvg();

  const geoms = {
    type: "FeatureCollection",
    features: results.map((row) => {
      return {
        type: "Feature",
        geometry: JSON.parse(row.geom),
        properties: {
          cog: row.cog,
          price: row.price,
        },
      };
    }),
  };

  res.json(geoms);
};
