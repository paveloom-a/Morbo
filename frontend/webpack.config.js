import path from "path";

import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TerserPlugin from "terser-webpack-plugin";
import WorkboxPlugin from "workbox-webpack-plugin";

export default (_, argv) => {
  const devMode = argv.mode === "development";

  return {
    entry: { index: "./src/index.tsx" },
    mode: "production",
    output: {
      clean: true,
      filename: "[name].[contenthash].js",
      path: path.join(import.meta.dirname, "dist"),
      publicPath: "",
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            compress: {
              passes: 2,
            },
            format: {
              comments: false,
            },
          },
        }),
        new CssMinimizerPlugin(),
      ],
      runtimeChunk: "single",
      moduleIds: "deterministic",
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      },
    },
    resolve: {
      extensions: [".js", ".tsx"],
      symlinks: false,
    },
    devtool: devMode ? "source-map" : false,
    plugins: [
      new HtmlWebpackPlugin({
        template: "public/index.html",
        scriptLoading: "module",
      }),
      new MiniCssExtractPlugin({
        filename: "[name].[contenthash].css",
      }),
      new WorkboxPlugin.GenerateSW({
        clientsClaim: devMode,
        skipWaiting: devMode,
      }),
    ],
    module: {
      rules: [
        {
          test: /\.tsx$/,
          include: path.join(import.meta.dirname, "src"),
          loader: "ts-loader",
        },
        {
          test: /\.css$/,
          include: path.join(import.meta.dirname, "src"),
          use: [
            MiniCssExtractPlugin.loader,
            { loader: "css-loader", options: { modules: true } },
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
          include: path.join(import.meta.dirname, "public", "assets"),
          type: "asset/resource",
          generator: {
            filename: "assets/[name].[contenthash][ext]",
          },
        },
        {
          test: /\.webmanifest$/i,
          include: path.join(import.meta.dirname, "public"),
          loader: "webpack-webmanifest-loader",
          type: "asset/resource",
          generator: {
            filename: "[name].[contenthash][ext]",
          },
        },
        {
          test: /\.html$/,
          include: path.join(import.meta.dirname, "public"),
          loader: "html-loader",
        },
      ],
    },
  };
};
