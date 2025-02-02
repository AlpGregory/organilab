/* eslint-env node */
// This rollup script is run by the command:
// 'npm run build'

import path from 'path'
import rimraf from 'rimraf'
import babel from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
// import progress from 'rollup-plugin-progress';
import filesize from 'rollup-plugin-filesize'

const dirPath = path.join(__dirname, '../assets/svgcanvas');
const outPath = path.join(__dirname, '../src/sga/static/svgcanvas');
// remove existing distribution
rimraf('${outPath}', () => console.info('recreating dist'))

// config for svgedit core module
const config = [{
  input: [`${dirPath}/svgcanvas.js`],
  output: [
    {
      format: 'es',
      inlineDynamicImports: true,
      sourcemap: true,
      file: `${outPath}/svgcanvas.js`
    }
  ],
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    babel({ babelHelpers: 'bundled', exclude: [/\/core-js\//] }), // exclude core-js to avoid circular dependencies.
    terser({ keep_fnames: true }), // keep_fnames is needed to avoid an error when calling extensions.
    filesize()
  ]
}]
export default config
