// only provides very basic and common options

var commonOptions = {
  // animation: {
  //     startup: true,
  //     duration: 500,
  //     easing: 'linear'
  // }
};

var LineChartOptions = Object.assign({}, commonOptions);

var ColumnChartOptions = Object.assign({}, commonOptions);

var BarChartOptions = Object.assign({}, commonOptions);

var ComboChartOptions = Object.assign({}, commonOptions);

var AreaChartOptions = Object.assign({}, commonOptions);

var ImageChartOptions = {};

exports.chartOptions = {
  LineChart: LineChartOptions,
  ColumnChart: ColumnChartOptions,
  BarChart: BarChartOptions,
  ComboChart: ComboChartOptions,
  AreaChart: AreaChartOptions,
  ImageChart: ImageChartOptions
};
