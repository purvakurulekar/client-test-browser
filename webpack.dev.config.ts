import path from "path";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";

const BUILD_DIR = path.resolve(__dirname, "dist/debug/");

export default {
    mode: "development",
    target: ["web","es2020"],
    output: {
        path: BUILD_DIR,
        filename: "client-test-catalogbrowser.js"
    },
    entry: "./src/index.tsx",
    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/i,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-env",
                            "@babel/preset-react",
                            "@babel/preset-typescript",
                        ],
                    },
                }
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: ['style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            query: {
                                name: 'assets/[name].[ext]'
                            }
                        }
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            query: {
                                mozjpeg: {
                                    progressive: true,
                                },
                                gifsicle: {
                                    interlaced: true,
                                },
                                optipng: {
                                    optimizationLevel: 7,
                                }
                            }
                        }
                    }]
            }
        ],
    },
    resolve: {
        modules: [
            path.resolve(),
            'node_modules',
            'src/components',
            'src',
            '.'
        ],
        extensions: [".tsx", ".ts", ".js"],
    },
    devtool: "inline-source-map",
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template: "src/template.html",
            filename: "index.html"
        }),
        new CleanWebpackPlugin({
            verbose: true
        }),
        new CopyWebpackPlugin({
            patterns: [
            {
                from: 'public'
            }]
        })
    ]
};