import { defineConfig } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { swc } from 'rollup-plugin-swc3';
import { dts } from 'rollup-plugin-dts';

const input = 'src/index.ts';

export default defineConfig([
  {
    input,
    output: [
      { file: 'dist/index.js', format: 'cjs' },
      { file: 'dist/index.mjs', format: 'esm' },
      { file: 'dist/index.umd.js', format: 'umd', name: 'greasyFetch' }
    ],
    plugins: [
      nodeResolve({ extensions: ['.mjs', '.js', '.json', '.ts'] }),
      swc({
        minify: true,
        jsc: { minify: { module: true, compress: true, mangle: true, sourceMap: false } }
      })
    ]
  },
  {
    input,
    output: { file: 'dist/index.d.ts', format: 'esm' },
    plugins: [dts()]
  }
]);
