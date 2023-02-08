import axios, { AxiosError } from "axios";
import { ListingsDAO } from "../domains/listings";
import { ListingApiResponse } from "../types/listingApiResponse";

export const getAllListingsFromListingApi = async (
  geom: number
): Promise<ListingsDAO[]> => {
  let p = 0;

  let result: ListingsDAO[] = [];

  while (true) {
    ++p;
    const url = `${process.env.LISTING_API_URL}/listings/${geom}?page=${p}`;

    let d;
    try {
      d = await axios.get<ListingApiResponse[]>(url);
    } catch (e) {
      if (e instanceof AxiosError && e.response?.status === 416) {
        break;
      }

      throw e;
    }

    result = result.concat(
      d.data.map((rawListing) => formatRawListing(rawListing, geom))
    );
  }
  return result;
};

export const formatRawListing = (
  rawListingData: ListingApiResponse,
  place_id: number
): ListingsDAO => {
  const id = Number.parseInt(rawListingData["listing_id"]);

  const price =
    Number.parseInt(
      (rawListingData["price"] as string)
        .split("")
        .filter((letter) => !Number.isNaN(Number.parseInt(letter)))
        .join("")
    ) || 0;

  const areaText = (rawListingData["title"].split("-")[1] || "0")
    .replace(" ", "")
    .replace("\u00a0m\u00b2", "");

  const area = Number.parseInt(areaText);

  const room_count = rawListingData["title"].includes("Studio")
    ? 1
    : !rawListingData["title"].includes("pièces")
    ? 0
    : Number.parseInt(
        (rawListingData["title"].split("pièces")[0] as string)
          .split("")
          .filter((letter) => !Number.isNaN(Number.parseInt(letter)))
          .join("")
      ) || 0;

  const seen_at = Math.round(Date.now() / 1000);
  return { id, place_id, price, area, room_count, seen_at };
};
