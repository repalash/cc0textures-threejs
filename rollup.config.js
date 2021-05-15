import typescript from "rollup-plugin-typescript";
import {liveServer} from "rollup-plugin-live-server";
import { terser } from "rollup-plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { string } from "rollup-plugin-string";

const output = process.argv.includes("-w") ? [
  {
    file: "./example/lib.js",
    format: "esm",
    name: "cc0materials",
    sourcemap: true
  }
] : [
    {
      file: "./example/lib.js",
      format: "esm",
      name: "cc0materials",
      sourcemap: true,
      plugins: [terser()]
    }
  ];

export default {
  input: "./src/index.ts",
  inlineDynamicImports: true,
  output,

  plugins: [
    string({
      // Required to be specified
      include: [
        "**/*.txt",
        "**/*.frag",
        "**/*.vert",
        "**/*.shader",
        "**/*.glsl",
      ],

      // Undefined by default
      // exclude: ["**/index.html"]
    }),
    resolve({
      browser: true,
      extensions: ['.mjs', '.js', '.ts', '.json', '.node']
    }),
    commonjs(),

    typescript(),
    liveServer({
      port: 2412,
      host: "localhost",
      root: "example",
      file: "index.html",
      mount: [],
      open: false,
      wait: 500
    })
  ],
}
