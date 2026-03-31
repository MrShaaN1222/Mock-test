module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
    browser: true
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  ignorePatterns: ["node_modules", "dist", "coverage"],
  rules: {
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
  },
  overrides: [
    {
      files: ["frontend/**/*.{js,jsx}"],
      env: {
        browser: true,
        node: false
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    {
      files: ["backend/**/*.js"],
      env: {
        node: true,
        browser: false
      }
    }
  ]
};
