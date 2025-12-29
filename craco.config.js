const tryRequire = (name) => {
  try {
    return require(name);
  } catch (e) {
    return null;
  }
};

const ESLintPlugin = tryRequire('eslint-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      if (ESLintPlugin) {
        const hasPlugin = webpackConfig.plugins && webpackConfig.plugins.some((p) => p && p.constructor && p.constructor.name === 'ESLintWebpackPlugin');
        if (!hasPlugin) {
          webpackConfig.plugins = webpackConfig.plugins || [];
          webpackConfig.plugins.push(new ESLintPlugin({ extensions: ['js', 'jsx', 'ts', 'tsx'] }));
        }
      }
      return webpackConfig;
    },
  },
  devServer: (devServerConfig) => {
    return {
      ...devServerConfig,
      onBeforeSetupMiddleware: undefined,
      onAfterSetupMiddleware: undefined,
      setupMiddlewares: (middlewares) => {
        return middlewares;
      },
    };
  },
};
