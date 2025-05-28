import { createDateRangeQuery } from "../api/ElasticAPI";

describe("createDateRangeQuery", () => {
  test("returns correct query for date range [2015-01-01 TO 2015-12-31]", () => {
    const input = "[2015-01-01 TO 2015-12-31]";
    const expectedOutput = {
      gte: "2015-01-01",
      lte: "2015-12-31",
    };
    expect(createDateRangeQuery(input)).toEqual(expectedOutput);
  });

  test("returns correct query for date range [2015-01-01 TO *]", () => {
    const input = "[2015-01-01 TO *]";
    const expectedOutput = {
      gte: "2015-01-01",
    };
    expect(createDateRangeQuery(input)).toEqual(expectedOutput);
  });

  test("returns correct query for date range [* TO 2015-12-31]", () => {
    const input = "[* TO 2015-12-31]";
    const expectedOutput = {
      lte: "2015-12-31",
    };
    expect(createDateRangeQuery(input)).toEqual(expectedOutput);
  });

  test("returns correct query for date range [* TO *]", () => {
    const input = "[* TO *]";
    const expectedOutput = {};
    expect(createDateRangeQuery(input)).toEqual(expectedOutput);
  });

  test("throws an error for invalid date range string", () => {
    const input = "invalid string";
    expect(() => createDateRangeQuery(input)).toThrow(
      "Invalid date range string"
    );
  });
});
