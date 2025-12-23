module.exports = {
  webpack: {
    configure: (webpackConfig) => {
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
