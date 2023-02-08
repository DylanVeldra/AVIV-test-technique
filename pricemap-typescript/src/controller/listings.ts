import { Request, Response } from "express";
import { geoPlaceRepository } from "../repository/geoPlace";
import { listingsRepository } from "../repository/listings";
import { getAllListingsFromListingApi } from "../provider/listingApi";

export const updateListings = async (_: Request, res: Response) => {
  const GEOMS_IDS = (await geoPlaceRepository.getGeoms()).map(
    (geom) => geom.id
  );

  await listingsRepository.createListingsTable();
  // await clearListingsTable();

  await Promise.all(
    GEOMS_IDS.map(async (geom) => {
      const listings = await getAllListingsFromListingApi(geom);
      await listingsRepository.insertManyListings(listings);
    })
  );

  res.status(200);
  res.send();
};

/**
 * Returns the volumes distribution for the given cog in storage format
 */
export async function getVolumesByPlaceId(req: Request, res: Response) {
  const serieName = `Prix ${req.params.cog}`;

  const labels: string[] = [
    "0-6000",
    "6000-8000",
    "8000-10000",
    "10000-14000",
    "14000-100000",
  ];

  const geomFromDb = await geoPlaceRepository.getGeomByCog(req.params.cog);

  if (!geomFromDb) {
    res.status(404);
    res.send();
    return;
  }

  const volumes: number[] = await Promise.all(
    labels.map(async (label) => {
      const minPrice = parseInt(label.split("-")[0]);
      const maxPrice = parseInt(label.split("-")[1]);

      const results = await listingsRepository.getVolumesByPlaceId(
        geomFromDb.id,
        minPrice,
        maxPrice
      );
      return results.length;
    })
  );

  res.json({
    serie_name: serieName,
    volumes,
    labels,
  });
}
