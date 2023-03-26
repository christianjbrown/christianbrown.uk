module.exports = {
    "presets": [
        [
            "@babel/preset-env",
            {
                "targets": {
                    "node": "current",
                },
                "corejs": "3.29.1",
                "useBuiltIns": "usage",
                "shippedProposals": true
            }
        ],
    ],
    "plugins": [
        "@babel/plugin-proposal-export-default-from",
        "babel-plugin-transform-import-meta",
        [
            "@babel/plugin-syntax-import-assertions",
            {
                "importAssertions": true,
            }
        ]
    ]
}