module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
    'plugin:vue/essential',
    'standard',
    'esnext'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: [
    'vue'
  ],
  rules: {
    "camelcase": [
      "error",
      {
        "ignoreDestructuring": true,
        "properties": "never"
      }
    ],
    "import/no-commonjs": 0
  }
}
