/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  // An array of file extensions your modules use
  moduleFileExtensions: ["js", "ts"],
  transform: {
    "^.+\\.[tj]s$": "ts-jest",
  },
};
