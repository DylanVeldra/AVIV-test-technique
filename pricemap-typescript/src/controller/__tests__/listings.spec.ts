import { beforeAll, describe, expect, jest, test } from "@jest/globals";
import { Request, Response } from "express";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { getVolumesByPlaceId, updateListings } from "../listings";
import { geomsWithAvgPrice } from "./mockData";
import { geoPlaceRepository } from "../../repository/geoPlace";
import { listingsRepository } from "../../repository/listings";

jest.useFakeTimers().setSystemTime(new Date("2020-01-01"));
jest.mock("../../repository/geoPlace", () => {
  return {
    geoPlaceRepository: {
      getGeoms: jest.fn(async () => {
        return [
          { id: 32682, cog: "75101" },
          { id: 32683, cog: "75102" },
        ];
      }),
      getGeomsWithPriceAvg: jest.fn(async () => {
        return geomsWithAvgPrice;
      }),
      getGeomByCog: jest.fn((cog) => {
        if (cog === "75001") {
          return { id: 32682, cog: "75101" };
        } else {
          return undefined;
        }
      }),
    },
  };
});

jest.mock("../../repository/listings", () => {
  return {
    listingsRepository: {
      createListingsTable: jest.fn(),
      clearListingsTable: jest.fn(),
      insertManyListings: jest.fn(),
      getVolumesByPlaceId: jest.fn(() => {
        return [{}, {}, {}, {}];
      }),
    },
  };
});

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

describe("controller", () => {
  describe("updateListings endpoint", () => {
    beforeAll(() => {
      server.listen();
      process.env.LISTING_API_URL = "http://listing.api";
    });

    test("nominal case", async () => {
      const expected = [
        {
          area: 29,
          id: 1969946393,
          place_id: 32682,
          price: 364000,
          room_count: 2,
          seen_at: 1577836800,
        },
        {
          area: 14,
          id: 1969971424,
          place_id: 32682,
          price: 176000,
          room_count: 1,
          seen_at: 1577836800,
        },
      ];

      const mockedStatus = jest.fn((_) => ({}));
      const mockedSend = jest.fn((_) => ({}));

      await updateListings(
        {} as Request,
        { send: mockedSend, status: mockedStatus } as unknown as Response
      );

      expect(geoPlaceRepository.getGeoms).toHaveBeenCalled();
      expect(listingsRepository.createListingsTable).toHaveBeenCalled();

      expect(listingsRepository.insertManyListings).toHaveBeenCalledWith(
        expected
      );
      expect(mockedStatus).toHaveBeenCalledWith(200);
      expect(mockedSend).toHaveBeenCalled();
    });
  });

  describe("getVolumesByPlaceId endpoint", () => {
    beforeAll(() => {
      server.listen();
      process.env.LISTING_API_URL = "http://listing.api";
    });
    test("nominal case", async () => {
      const input = {
        cog: "75001",
      };

      const mockedStatus = jest.fn((_) => ({}));
      const mockedSend = jest.fn((_) => ({}));
      const mockedJson = jest.fn((_) => ({}));
      await getVolumesByPlaceId(
        { params: input } as unknown as Request,
        {
          json: mockedJson,
          send: mockedSend,
          status: mockedStatus,
        } as unknown as Response
      );

      expect(geoPlaceRepository.getGeomByCog).toHaveBeenCalledWith(input.cog);
      expect(mockedSend).toHaveBeenCalledTimes(0);
      expect(mockedStatus).toHaveBeenCalledTimes(0);
      expect(listingsRepository.getVolumesByPlaceId).toHaveBeenCalledWith(
        32682,
        0,
        6000
      );
      expect(listingsRepository.getVolumesByPlaceId).toHaveBeenCalledWith(
        32682,
        6000,
        8000
      );
      expect(listingsRepository.getVolumesByPlaceId).toHaveBeenCalledWith(
        32682,
        8000,
        10000
      );
      expect(listingsRepository.getVolumesByPlaceId).toHaveBeenCalledWith(
        32682,
        10000,
        14000
      );
      expect(listingsRepository.getVolumesByPlaceId).toHaveBeenCalledWith(
        32682,
        14000,
        100000
      );

      expect(mockedJson).toHaveBeenCalledWith({
        labels: [
          "0-6000",
          "6000-8000",
          "8000-10000",
          "10000-14000",
          "14000-100000",
        ],
        serie_name: "Prix 75001",
        volumes: [4, 4, 4, 4, 4],
      });
    });

    test("404 error case", async () => {
      const input = {
        cog: "potato",
      };

      const mockedStatus = jest.fn((_) => ({}));
      const mockedSend = jest.fn((_) => ({}));
      const mockedJson = jest.fn((_) => ({}));
      await getVolumesByPlaceId(
        { params: input } as unknown as Request,
        {
          json: mockedJson,
          send: mockedSend,
          status: mockedStatus,
        } as unknown as Response
      );

      expect(geoPlaceRepository.getGeomByCog).toHaveBeenCalledWith(input.cog);

      expect(mockedJson).toHaveBeenCalledTimes(0);
      expect(mockedSend).toHaveBeenCalledTimes(1);
      expect(mockedStatus).toHaveBeenCalledWith(404);
    });
  });
});
