// only provides very basic and common options
var LineChartOptions = {
    animation: {
        startup: true,
        duration: 500,
        easing: 'linear'
    }
};

var ColumnChartOptions = {
    animation: {
        startup: true,
        duration: 500,
        easing: 'linear'
    }
};

var BarChartOptions = {
    animation: {
        startup: true,
        duration: 500,
        easing: 'linear'
    }
};

var ComboChartOptions = {
    animation: {
        startup: true,
        duration: 500,
        easing: 'linear'
    }
};

var ImageChartOptions = {};

exports.chartOptions = {
    LineChart: LineChartOptions,
    ColumnChart: ColumnChartOptions,
    BarChart: BarChartOptions,
    ComboChart: ComboChartOptions,
    ImageChart: ImageChartOptions
};
