const path= require('path');

module.exports = {
  entry: './src/demo/demo.ts',
  output:{
    filename:'demo.js',
    path:path.resolve(__dirname,'demo')
  },
  devtool: 'inline-source-map',
  module:{
    rules:[
      {test:/\.ts$/, use:'ts-loader'}
    ]
  },
  resolve:{
    extensions:['.ts', '.js']
  }
};
