import typescript from 'rollup-plugin-typescript2';
import multi from '@rollup/plugin-multi-entry';

import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";

const dev = false;

export default {
    input: [
        'src/card/WindRoseCard.ts',
        'src/util/Log.ts'
    ],
    cache: false,
    output: {
        format: 'es',
        name: 'windroseCardBundle',
        treeshake: false,
        file: 'build/windrose-card.js'
    },
    plugins: [
        multi(),
        nodeResolve({
            browser: true,
            preserveSymlinks: true
        }),
        commonjs({
            include: 'node_modules/**',
            ignoreGlobal: true,
            strictRequires: true
        }),
        typescript(),
        json(),
        !dev && terser()],
};
