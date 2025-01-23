import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import excludeDependenciesFromBundle from 'rollup-plugin-exclude-dependencies-from-bundle';

export function getPlugins({
  outDir,
  tsconfig,
  minify,
  replacements,
  bundleDependencies = false,
}) {
  return [
    ...(bundleDependencies
      ? []
      : [
          excludeDependenciesFromBundle({
            dependencies: true,
            peerDependencies: true,
          }),
        ]),
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    replace({
      preventAssignment: true,
      ...(replacements ?? {}),
    }),
    commonjs(),
    typescript({
      tsconfig: tsconfig ? tsconfig : './tsconfig.build.json',
      outDir,
      outputToFilesystem: false,
      noEmit: true,
      declaration: false,
      moduleResolution: 'Bundler',
    }),
    ...(minify === true ? [terser()] : []),
  ];
}

export const esmConfigs = {
  dir: './dist/esm',
  format: 'es',
  sourcemap: "inline",
  preserveModules: true,
  preserveModulesRoot: 'src',
  entryFileNames: '[name].mjs',
  importAttributesKey: 'with',
};

export const cjsConfigs = {
  dir: './dist/cjs',
  format: 'cjs',
  sourcemap: "inline",
  preserveModules: true,
  preserveModulesRoot: 'src',
  exports: 'named',
};

export function getConfig({
  pkg,
  minify,
  tsconfig,
  replacements,
  input = 'src/index.ts',
  flatOutput = false,
}) {
  return [
    {
      input,
      plugins: getPlugins({
        outDir: flatOutput ? './dist' : './dist/esm',
        minify,
        tsconfig,
        replacements,
      }),
      external: Object.keys(pkg.dependencies),
      output: [{...esmConfigs, dir: flatOutput ? './dist' : './dist/esm'}],
    },
    {
      input,
      plugins: getPlugins({
        outDir: flatOutput ? './dist' : './dist/cjs',
        minify,
        tsconfig,
        replacements,
      }),
      external: Object.keys(pkg.dependencies),
      output: [{...cjsConfigs, dir: flatOutput ? './dist' : './dist/cjs'}],
    },
  ];
}
