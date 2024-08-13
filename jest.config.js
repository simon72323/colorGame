/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  //coverage結果路徑
  coverageDirectory: "coverage",
  //執行物件
  preset: 'ts-jest',
  //測試環境, node or jsdom
  testEnvironment: 'jsdom',
  //檔案
  testMatch:[
    '<rootDir>/src/test/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  //執行檔案
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'cjs', 'mjs'],
  modulePathIgnorePatterns: ['<rootDir>/src/proto/*.*'],
  setupFilesAfterEnv: ['<rootDir>/src/test/envSetup.ts'],
  //忽略測試檔案
  coveragePathIgnorePatterns: [
      "<rootDir>/src/proto/*.*",
      "MockData.ts",
      "<rootDir>/assets/techArt",
      "<rootDir>/assets/common/script",
      "<rootDir>/assets/game/mahjong/script/framework/",
      "<rootDir>/assets/game/mahjong/script/lib/analytics/",
      "<rootDir>/assets/game/mahjong/script/wheel/",
      // "<rootDir>/assets/game/mahjong/script/tools",
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: './tsconfig-ci.json' }]
  },
  reporters: [
      'default',
      ['jest-junit', {
        outputDirectory: './coverage',
        outputName: 'junit.xml'
      }]
  ],
  moduleNameMapper: {
    '^@casino-mono/mvc$': '<rootDir>/assets/game/mahjong/script/framework/mvc/index.ts',
    '^@casino-mono/share-tools$': '<rootDir>/assets/game/mahjong/script/framework/share-tools/index.ts',
    '^cc$': '<rootDir>/src/declaration/cc.d.ts',
    '^cc/env$': '<rootDir>/src/declaration/env.ts'
  }
};