module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/cinehub/cinehub-main/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "build/chunks/ea9c5_3a0d6fcb._.js",
  "build/chunks/[root-of-the-server]__068b016c._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/cinehub/cinehub-main/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];