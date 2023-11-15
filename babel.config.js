module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    'module:metro-react-native-babel-preset',
  ],
  env: {
    production: {
      plugins: ['react-native-paper/babel', 'react-native-reanimated/plugin'],
    },
  },
  plugins: [
    '@babel/plugin-transform-class-static-block',
    [
      '@babel/plugin-transform-private-methods',
      {
        loose: true,
        shippedProposals: true,
      },
    ],
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '@': './src',
          '@root': './',
        },
      },
    ],
  ],
};
