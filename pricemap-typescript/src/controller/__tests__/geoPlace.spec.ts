import { beforeAll, describe, expect, jest, test } from "@jest/globals";
import { Request, Response } from "express";
import { geoPlaceRepository } from "../../repository/geoPlace";

import { setupServer } from "msw/node";
import { getGeoms } from "../geoPlace";
import { geomsWithAvgPrice, geomsWithAvgPriceExpected } from "./mockData";

jest.useFakeTimers().setSystemTime(new Date("2020-01-01"));
jest.mock("../../repository/geoPlace", () => {
  return {
    geoPlaceRepository: {
      getGeoms: jest.fn(async () => {
        return [];
      }),
      getGeomsWithPriceAvg: jest.fn(async () => {
        return geomsWithAvgPrice;
      }),
      getGeomByCog: jest.fn(),
    },
  };
});

const server = setupServer();

describe("get geoms endpoint", () => {
  beforeAll(() => {
    server.listen();
    process.env.LISTING_API_URL = "http://listing.api";
  });

  test("nominal case", async () => {
    const mockedJson = jest.fn((_) => ({}));

    await getGeoms({} as Request, { json: mockedJson } as unknown as Response);

    expect(geoPlaceRepository.getGeomsWithPriceAvg).toHaveBeenCalled();

    expect(mockedJson).toHaveBeenCalledWith(geomsWithAvgPriceExpected);
  });
});
