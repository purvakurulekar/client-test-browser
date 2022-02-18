import path from "path";
// import webpack from "webpack";
import CopyWebpackPlugin from "copy-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";

const BUILD_DIR = path.resolve(__dirname, "dist/lib/");

module.exports = {
    mode: "production",
    // mode: "development",
    target: ["web", "es2020"],
    output: {
        path: BUILD_DIR,
        filename: "index.js",
        library: {
            // type: "module"
            type: "umd",
            umdNamedDefine: true,
            // export: "default"
        },
        publicPath: ''
    },
    externals: {
        'react': 'react',
        'react-dom': 'react-dom'
    },
    entry: "./src/lib.tsx",
    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/i,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
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
            'src/interfaces',
            'src',
            '.'
        ],
        extensions: [".tsx", ".ts", ".js"],
    },
    devtool: "source-map",
    plugins: [
        new CleanWebpackPlugin({
            verbose: true
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: "package.json"
                },
                {
                    from: "README.md"
                },
                {
                    from: "public"
                },
                {
                    from: 'src/lib.d.ts',
                    to: "index.d.ts"
                },
                {
                    from: "src/template.html",
                    to: "index.html"
                }
            ]
        })
    ]
}
