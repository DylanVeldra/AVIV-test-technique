import { beforeAll, describe, expect, jest, test } from "@jest/globals";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { getAllListingsFromListingApi } from "../listingApi";

jest.useFakeTimers().setSystemTime(new Date("2020-01-01"));

const server = setupServer(
  rest.get("http://listing.api/listings/:geom", (req, res, ctx) => {
    if (req.params.geom === "666") {
      return res(ctx.status(500));
    }

    if (req.url.searchParams.get("page") === "1") {
      return res(
        ctx.json([
          {
            listing_id: "1969946393",
            place: "Paris 1er arrondissement",
            price: "364\u202f000\u00a0\u20ac",
            title: "Appartement 2\u00a0pi\u00e8ces - 29\u00a0m\u00b2",
          },
        ])
      );
    } else if (req.url.searchParams.get("page") === "2") {
      return res(
        ctx.json([
          {
            listing_id: "1969971424",
            place: "Paris 1er arrondissement",
            price: "176\u202f000\u00a0\u20ac",
            title: "Studio - 14\u00a0m\u00b2",
          },
        ])
      );
    } else {
      return res(ctx.status(416));
    }
  })
);

describe("listings api", () => {
  beforeAll(() => {
    server.listen();
    process.env.LISTING_API_URL = "http://listing.api";
  });

  test("nominal case", async () => {
    const expected = [
      {
        id: 1969946393,
        place_id: 1111,
        price: 364000,
        area: 29,
        room_count: 2,
        seen_at: 1577836800,
      },
      {
        id: 1969971424,
        place_id: 1111,
        price: 176000,
        area: 14,
        room_count: 1,
        seen_at: 1577836800,
      },
    ];

    const result = await getAllListingsFromListingApi(1111);

    expect(result).toStrictEqual(expected);
  });

  test("api error case", async () => {
    await expect(getAllListingsFromListingApi(666)).rejects.toThrow();
  });
});
