import ReactEcharts from "echarts-for-react";

import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { ChartControlsProps } from "../../redux/ChartPoperties/ChartControlsInterface";
import { ColorSchemes } from "../ChartOptions/Color/ColorScheme";
import {
  formatChartLabelValue,
  formatChartLabelValueForSelectedMeasure,
  formatChartYAxisValue,
} from "../ChartOptions/Format/NumberFormatter";
import {
  ChartsMapStateToProps,
  ChartsReduxStateProps,
  FormatterValueProps,
} from "./ChartsCommonInterfaces";
import { TabTileStateProps2 } from "../../redux/TabTile/TabTilePropsInterfaces";
import { palette } from "../..";
import {getContrastColor} from '../CommonFunctions/CommonFunctions';


const MultiBarChart = ({
  // props
  propKey,
  graphDimension,
  chartArea,
  graphTileSize,
  colorScheme,
  softUI,

  //state
  chartControls,
  chartProperties,
  tabTileProps,
}: ChartsReduxStateProps & TabTileStateProps2) => {
  var chartControl: ChartControlsProps = chartControls.properties[propKey];
  let chartData: any[] = chartControl.chartData ? chartControl.chartData : [];

  const [seriesData, setSeriesData] = useState<any[]>([]);
  const processedChartData = chartData.map(item => {
    return Object.fromEntries(
        Object.entries(item).map(([key, value]) => [
            key,
            value === null 
                ? "(Blank)" 
                : typeof value === "boolean" 
                    ? value ? "True" : "False" 
                    : value
        ])
    );
  });

  useEffect(() => {
    var seriesDataTemp: any = [];
    if (chartData.length >= 1) {
      var chartDataKeys: string[] = Object.keys(chartData[0]);

      for (let i = 0; i < Object.keys(chartData[0]).length - 1; i++) {
        var seriesObj: any = {
          type: "bar",
          stack: "",
          emphasis: {
            focus: "series",
          },
          itemStyle:softUI? {
            shadowColor: "rgba(0, 0, 0, 0.5)", // Shadow color
            shadowBlur: 10, // Blurring effect
            shadowOffsetX: 3, // Horizontal shadow displacement
            shadowOffsetY: 3, // Vertical shadow displacement
          }:{},
          label: {
            show:
              graphDimension.height > 140 && graphDimension.height > 150
                ? chartControl.labelOptions.showLabel
                : false,
            fontSize: chartControl.labelOptions.fontSize,
            color: chartControl.labelOptions.labelColorManual
              ? chartControl.labelOptions.labelColor
              : null,

            formatter: (value: FormatterValueProps) => { 

              var formattedValue = value.value[chartDataKeys[i + 1]];
              formattedValue = formatChartLabelValueForSelectedMeasure(
                chartControls.properties[propKey],
                chartProperties.properties[propKey],
                formattedValue,
                chartDataKeys[i + 1]
              );

              return formattedValue;
            },
          },
        };

        seriesDataTemp.push(seriesObj);
      }
      setSeriesData(seriesDataTemp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData, chartControl,softUI]);
  var chartThemes: any[] = ColorSchemes.filter((el) => {
    if(colorScheme)
     return el.name === colorScheme;
    else 
    return el.name === chartControl.colorScheme
  });

  const getHeightAndWidth = () => {
    var height = 0;
    var width = 0;

    if (
      graphDimension.height > 230 &&
      graphDimension.width > 350 &&
      graphDimension.height < 300
    ) {
      height = 12;
      width = 12;
    } else {
      if (!tabTileProps.showDash) {
        height = chartControl.legendOptions?.symbolHeight;
        width = chartControl.legendOptions?.symbolWidth;
      } else {
        height = 15;
        width = 15;
      }
    }
    return { height: height, width: width };
  };
  const getLegentShowValue = () => {
    var show = false;
    if (graphDimension.height > 255) {
      show = chartControl.legendOptions?.showLegend;
    } else {
      show = false;
    }

    return show;
  };

  // const getTopMarginForLegend = () => {
  //   var top = "";
  //   if (tabTileProps.showDash) {
  //     if (graphDimension.height > 400) {
  //       top = "95%";
  //     }
  //     if (graphDimension.height < 400 && graphDimension.height > 300) {
  //       top = "93%";
  //     }
  //     if (graphDimension.height < 300) {
  //       top = "90%";
  //     }
  //   } else {
  //     top = "93%";
  //   }
  //   return top;
  // };

  const getTopMarginForLegend = () => {
    var top = "";
    if (chartControl.legendOptions?.position?.top === "top") {
      top = "top";
      // } else if (chartControl.legendOptions?.position?.top === "bottom") {
      //   top = "93%";
    } else {
      top = "50%";
    }
    return top;
  };

  const getHeightOfChart = () => {
    var height = "";
    if (tabTileProps.showDash) {
      if (graphDimension.height > 400) {
        height = "80%";
      }
      if (graphDimension.height < 400 && graphDimension.height > 300) {
        height = "75%";
      }
      if (graphDimension.height < 300) {
        height = "70%";
      }
      if (graphDimension.height < 220) {
        height = "90%";
      }
    } else {
      height = "80%";
    }
    return height;
  };

  const RenderChart = () => {
    return chartData ? (
      <ReactEcharts
        opts={{ renderer: "svg" }}
        // theme={chartControl.colorScheme}
        style={{
          // padding: "5px",
          width: graphDimension.width,
          height: graphDimension.height,
          overflow: "scroll",
          margin: "auto",
          border: chartArea
            ? "none"
            : graphTileSize
            ? "none"
            : "1px solid rgb(238,238,238)",
        }}
        option={{
          color: chartThemes[0].colors,
          backgroundColor: chartThemes[0].background,
          animation: false,
          legend: {
            // textStyle :{color : getContrastColor(chartThemes[0].background)},
            type: "scroll",
            show: getLegentShowValue(),
            itemHeight: getHeightAndWidth().height,
            itemWidth: getHeightAndWidth().width,
            // top: getTopMarginForLegend(),
            temGap: chartControl.legendOptions?.itemGap,
            // left: "50%",
            left: chartControl.legendOptions?.position?.left,
            // top: chartControl.legendOptions?.position?.top,
            top:
              chartControl.legendOptions?.position?.top !== "bottom"
                ? chartControl.legendOptions?.position?.top
                : null,
            bottom:
              chartControl.legendOptions?.position?.top === "bottom" ? 0 : null,
            orient: chartControl.legendOptions?.orientation,
            textStyle:{
              color:chartThemes[0].dark?"#ffffff":palette.primary.contrastText,
            }
          },
          grid: {
            left: chartControl.chartMargin.left + 5 + "%",
            right: chartControl.chartMargin.right + "%",
            top:
              chartControl.legendOptions?.position?.top === "top"
                ? chartControl.chartMargin.top + 5 + "%"
                : chartControl.chartMargin.top + "%",
            bottom:
              chartControl.legendOptions?.position?.top === "bottom"
                ? (graphDimension.height * chartControl.chartMargin.bottom) /
                    100 +
                  35
                : chartControl.chartMargin.bottom + "%",
                shadowColor: "rgba(0, 0, 0, 0.5)", // Setting shadow color
                shadowBlur: 10,
                shadowOffsetX: 3,
                shadowOffsetY: 3,
            // height: getHeightOfChart(),
          },

          tooltip: { show: chartControl.mouseOver.enable },

          dataset: {
            dimensions: Object.keys(processedChartData[0]),
            source: processedChartData,
          },
          xAxis: {
            splitLine: {
              show: chartControl.axisOptions?.xSplitLine,
            },
            type: "category",
            position: chartControl.axisOptions.xAxis.position,

            axisLine: {
              onZero: chartControl.axisOptions.xAxis.onZero,
            },

            show:
              graphDimension.height > 140 && graphDimension.height > 150
                ? chartControl.axisOptions.xAxis.showLabel
                : false,

            name: chartControl.axisOptions.xAxis.name,
            nameLocation: chartControl.axisOptions.xAxis.nameLocation,
            nameGap: chartControl.axisOptions.xAxis.nameGap,
            nameTextStyle: {
              fontSize: chartControl.axisOptions.xAxis.nameSize,
              color: chartControl.axisOptions.xAxis.nameColor,
            },

            axisTick: {
              alignWithLabel: true,
              length:
                chartControl.axisOptions.xAxis.position === "top"
                  ? chartControl.axisOptions.xAxis.tickSizeTop
                  : chartControl.axisOptions.xAxis.tickSizeBottom,
            },
            axisLabel: {
              rotate:
                chartControl.axisOptions.xAxis.position === "top"
                  ? chartControl.axisOptions.xAxis.tickRotationTop
                  : chartControl.axisOptions.xAxis.tickRotationBottom,
              margin:
                chartControl.axisOptions.xAxis.position === "top"
                  ? chartControl.axisOptions.xAxis.tickPaddingTop
                  : chartControl.axisOptions.xAxis.tickPaddingBottom,
            },
          },
          yAxis: {
            splitLine: {
              show: chartControl.axisOptions?.ySplitLine,
            },
            min: chartControl.axisOptions.axisMinMax.enableMin
              ? chartControl.axisOptions.axisMinMax.minValue
              : null,
            max: chartControl.axisOptions.axisMinMax.enableMax
              ? chartControl.axisOptions.axisMinMax.maxValue
              : null,

            inverse: chartControl.axisOptions.inverse,

            position: chartControl.axisOptions.yAxis.position,

            axisLine: {
              onZero: chartControl.axisOptions.yAxis.onZero,
            },

            axisTick: {
              alignWithLabel: true,
              length:
                chartControl.axisOptions.yAxis.position === "left"
                  ? chartControl.axisOptions.yAxis.tickSizeLeft
                  : chartControl.axisOptions.yAxis.tickSizeRight,
            },

            axisLabel: {
              rotate:
                chartControl.axisOptions.yAxis.position === "left"
                  ? chartControl.axisOptions.yAxis.tickRotationLeft
                  : chartControl.axisOptions.yAxis.tickRotationRight,
              margin:
                chartControl.axisOptions.yAxis.position === "left"
                  ? chartControl.axisOptions.yAxis.tickPaddingLeft
                  : chartControl.axisOptions.yAxis.tickPaddingRight,

              formatter: (value: number) => {
                var formattedValue = formatChartYAxisValue(chartControl, value);
                return formattedValue;
              },
            },

            show:
              graphDimension.height > 140 && graphDimension.height > 150
                ? chartControl.axisOptions.yAxis.showLabel
                : false,

            name: chartControl.axisOptions.yAxis.name,
            nameLocation: chartControl.axisOptions.yAxis.nameLocation,
            nameGap: chartControl.axisOptions.yAxis.nameGap,
            nameTextStyle: {
              fontSize: chartControl.axisOptions.yAxis.nameSize,
              color: chartControl.axisOptions.yAxis.nameColor,
            },
          },
          series: seriesData,
        }}
      />
    ) : null;
  };

  return <>{chartData.length >= 1 ? <RenderChart /> : ""}</>;
};
const mapStateToProps = (
  state: ChartsMapStateToProps & TabTileStateProps2,
  ownProps: any
) => {
  return {
    chartControls: state.chartControls,
    chartProperties: state.chartProperties,
    tabTileProps: state.tabTileProps,
  };
};

export default connect(mapStateToProps, null)(MultiBarChart);