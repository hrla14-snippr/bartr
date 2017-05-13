module.exports = {
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "env": {
        "browser": true,
        "node": true
    },
    "rules": {
        "no-underscore-dangle": [2, { "allowAfterThis": true, allow: ["_*"] }],
        "class-methods-use-this": 0,
        "indent": ["error", "tab"],
    }
};
