module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    'module:@react-native/babel-preset',
  ],
  env: {
    production: {
      plugins: ['react-native-paper/babel', 'react-native-worklets/plugin'],
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
    //['@babel/plugin-transform-private-property-in-object', { loose: true }],
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
