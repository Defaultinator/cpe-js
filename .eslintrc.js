module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "extends": "airbnb",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
      // Ohm requires a bunch of unused function params
      "no-unused-vars": ["error", { "args": "none" }],
      "no-underscore-dangle": ["error", { "allow": ["_terminal"] }]
    },
    "settings": {
      "react": {
        "version": "999.999.999"
      }
    }
};
