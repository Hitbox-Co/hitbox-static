const path = require("path");

module.exports = function (api) {
    // Detect Jest reliably: babel-jest always identifies itself via the caller,
    // which is more dependable than NODE_ENV (not always "test" at transform time).
    const isTest =
        api.caller((caller) => !!caller && caller.name === "babel-jest") ||
        process.env.NODE_ENV === "test";

    // Under Jest, skip NativeWind's babel transform — it injects a
    // _ReactNativeCSSInterop global that trips Jest's jest.mock() sandbox.
    // className props simply become inert on RN components in tests.
    if (isTest) {
        return {
            presets: ["babel-preset-expo"],
        };
    }

    // Our own code (src/) is compiled with `nativewindWithDmDigits`; every other
    // file — node_modules, config — keeps the stock `nativewind/babel`.
    const srcDir = path.join(__dirname, "src").toLowerCase() + path.sep;
    const inSrc = (filename) => !!filename && (path.resolve(filename).toLowerCase() + "").startsWith(srcDir);

    // `nativewind/babel` written out, with ONE change: the JSX runtime is ours
    // (src/lib/dm-digits) — NativeWind's runtime plus "every number inside a <Text>
    // is set in DM Sans". `nativewind/babel` hard-codes its own runtime, so the
    // `jsxImportSource` option of babel-preset-expo cannot redirect it. The `@/`
    // alias only resolves for files in src/, which is why this is scoped to it.
    // If NativeWind is upgraded, compare with node_modules/react-native-css-interop/babel.js.
    const nativewindWithDmDigits = () => ({
        plugins: [
            require("react-native-css-interop/dist/babel-plugin").default,
            [
                "@babel/plugin-transform-react-jsx",
                { runtime: "automatic", importSource: "@/lib/dm-digits" },
            ],
            "react-native-worklets/plugin",
        ],
    });

    return {
        presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
        overrides: [
            { test: (filename) => !inSrc(filename), presets: ["nativewind/babel"] },
            { test: (filename) => inSrc(filename), presets: [nativewindWithDmDigits] },
        ],
    };
};
