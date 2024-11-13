import { connect } from "react-redux";
import React, { useEffect, useState } from "react";
import * as CrossTab from "./CrossTab";
import { BuildTable } from "./BuildTable";
import "./CrossTab.css";

import {
  ChartsMapStateToProps,
  ChartsReduxStateProps,
} from "../ChartsCommonInterfaces";

import {
  formatChartLabelValue,
  formatChartLabelValueForSelectedMeasure,
} from "../../ChartOptions/Format/NumberFormatter";
import { displayName } from "../../CommonFunctions/CommonFunctions";

const CrossTabChart = ({
  propKey,
  graphDimension,

  //state
  chartControls,
  chartProperties,
}: ChartsReduxStateProps) => {
  let enable = false,
    defaultTemplate = false,
    chartDataCSV: any = { rows: [], columns: [] },
    crossTabData: any[] = [],
    columnObj = {
      rowIndex: 0,
      isRowField: false,
      isHeaderField: false,
      parentColumnSpan: 1,
      columnSpan: 2,
      rowSpan: 1,
      compareObj: {},
      displayData: "",
      skip: false,
    },
    rowObj = {
      index: 0,
      rowSpan: 1,
      columnSpan: 1,
      compareObj: {},
      columnList: [],
      displayData: "",
      columnItems: [],
    },
    dustbinRows: any[] = [],
    dustbinColumns: any[] = [],
    dustbinValues: any[] = [];

  var property = chartControls.properties[propKey];
  var chartPropAxes = chartProperties.properties[propKey].chartAxes;

  let chartPropData = property.chartData ? property.chartData : "";

  const [showAsColumn, setShowAsColumn] = React.useState(true);

  const [formatedChartPropData, setFormatedChartPropData] = useState([]);

  const sortChart = (chartData: any[]): any[] => {
    let result: any[] = [];

    if (chartData && chartData.length > 0) {
      let _zones: any = chartProperties.properties[propKey].chartAxes.filter(
        (zones: any) => zones.name !== "Filter"
      );
      let _chartFieldTempObject: any = {};

      const findFieldIndexName = (name: string, i: number = 2): string => {
        if (_chartFieldTempObject[`${name}_${i}`] !== undefined) {
          i++;
          return findFieldIndexName(name, i);
        } else {
          return `${name}_${i}`;
        }
      };

      _zones.forEach((zoneItem: any) => {
        zoneItem.fields.forEach((field: any) => {
          let _nameWithAgg: string = field.displayname;

          if (_chartFieldTempObject[field.fieldname] !== undefined) {
            let _name = findFieldIndexName(field.fieldname);

            field["NameWithIndex"] = _name;
            _chartFieldTempObject[_name] = "";
          } else {
            field["NameWithIndex"] = field.fieldname;
            _chartFieldTempObject[field.fieldname] = "";
          }

          field["NameWithAgg"] = _nameWithAgg;
        });
      });

      chartData.forEach((data: any) => {
        let _chartDataObj: any = {};

        _zones.forEach((zoneItem: any) => {
          zoneItem.fields.forEach((field: any) => {
            _chartDataObj[field.NameWithAgg] = data[field.NameWithIndex];
          });
        });

        result.push(_chartDataObj);
      });
    }
    return result;
  };

  let tempFormatedChartPropData = CrossTab.cloneData(chartPropData ?? {});
  if (
    chartControls.properties[propKey].crossTabStyleOptions.crossTabTotal &&
    property.chartData
  ) {
    tempFormatedChartPropData = sortChart(property.chartData[0]?.result);
  }
  /*
  To apply chart data format from 'property.formatOptions'. Deep cloned chart  data is used.
  */

  const chartDataFormat = (tempFormatedChartPropData: any[]): any[] => {
    let _formChartData: any = [];
    if (tempFormatedChartPropData && tempFormatedChartPropData[0]) {
      var chartDataKeys = Object.keys(tempFormatedChartPropData[0]);

      tempFormatedChartPropData.forEach((item: any) => {
        let formattedValue: any = {};

        for (let i = 0; i < chartDataKeys.length; i++) {
          /*  Need to format only numeric values  */
          if (
            typeof item[chartDataKeys[i]] === "number" ||
            !isNaN(item[chartDataKeys[i]])
          ) {
            let _isMeasureField = dustbinValues.find((field) =>
              //chartDataKeys[i].includes(field.fieldname)
              chartDataKeys[i].includes(field.displayname)
            );
            /*  Need to format Measure dustbin fields */

            if (
              _isMeasureField &&
              chartProperties.properties[propKey].chartAxes[
                chartProperties.properties[propKey].chartAxes.findIndex(
                  (item: any) => item.name === "Measure"
                )
              ].fields.find((val: any) => val.displayname === chartDataKeys[i])
            ) {
              formattedValue[chartDataKeys[i]] =
                formatChartLabelValueForSelectedMeasure(
                  property, // this property is chart controls
                  chartProperties.properties[propKey],
                  item[chartDataKeys[i]],
                  chartDataKeys[i]
                );
            } else {
              formattedValue[chartDataKeys[i]] = item[chartDataKeys[i]];
            }
          } else {
            formattedValue[chartDataKeys[i]] = item[chartDataKeys[i]];
          }
        }

        _formChartData.push(formattedValue);
      });
    }
    return _formChartData;
  };

  useEffect(() => {
    if (tempFormatedChartPropData && tempFormatedChartPropData[0]) {
      var chartDataKeys = Object.keys(tempFormatedChartPropData[0]);

      let _formChartData: any = [];

      tempFormatedChartPropData.forEach((item: any) => {
        let formattedValue: any = {};

        for (let i = 0; i < chartDataKeys.length; i++) {
          /*  Need to format only numeric values  */
          if (
            typeof item[chartDataKeys[i]] === "number" ||
            !isNaN(item[chartDataKeys[i]])
          ) {
            let _isMeasureField = dustbinValues.find((field) =>
              //chartDataKeys[i].includes(field.fieldname)
              chartDataKeys[i].includes(field.displayname)
            );
            /*  Need to format Measure dustbin fields */

            if (
              _isMeasureField &&
              chartProperties.properties[propKey].chartAxes[
                chartProperties.properties[propKey].chartAxes.findIndex(
                  (item: any) => item.name === "Measure"
                )
              ].fields.find((val: any) => val.displayname === chartDataKeys[i])
            ) {
              formattedValue[chartDataKeys[i]] =
                formatChartLabelValueForSelectedMeasure(
                  property, // this property is chart controls
                  chartProperties.properties[propKey],
                  item[chartDataKeys[i]],
                  chartDataKeys[i]
                );
            } else {
              formattedValue[chartDataKeys[i]] = item[chartDataKeys[i]];
            }
          } else {
            formattedValue[chartDataKeys[i]] = item[chartDataKeys[i]];
          }
        }

        _formChartData.push(formattedValue);
      });

      setFormatedChartPropData(_formChartData);
    }
  }, [chartPropData, property.formatOptions]);

  /*
	Assign deeply cloned values from Dustbins
  */
  if (
    chartPropAxes[1] &&
    chartPropAxes[1].fields &&
    chartPropAxes[1].fields.length > 0
  ) {
    dustbinRows = CrossTab.cloneData(chartPropAxes[1].fields);
  }

  if (
    chartPropAxes[2] &&
    chartPropAxes[2].fields &&
    chartPropAxes[2].fields.length > 0
  ) {
    dustbinColumns = CrossTab.cloneData(chartPropAxes[2].fields);
  }

  if (
    chartPropAxes[3] &&
    chartPropAxes[3].fields &&
    chartPropAxes[3].fields.length > 0
  ) {
    dustbinValues = CrossTab.cloneData(chartPropAxes[3].fields);
  }

  /*
	To update the ColumnSpan of header segment
*/
  const updateColSpan = (noValue?: boolean) => {
    /*  Need to add those measure fields values to ColumnCSV collection.  */
    if (dustbinValues.length > 1 && showAsColumn) {
      chartDataCSV.columns = CrossTab.addDusbinValuesMeasuresInChartData(
        dustbinValues,
        chartDataCSV.columns
      );

      for (let hdrRow = crossTabData.length - 1; hdrRow >= 0; hdrRow--) {
        for (
          let colIndex = 0;
          colIndex < crossTabData[hdrRow].columnItems.length;
          colIndex++
        ) {
          let colData = crossTabData[hdrRow].columnItems[colIndex];
          let spanSize = 1;
          console.log(colData.displayData);

          /*  Last row of the Column header span always of size 1 */
          if (hdrRow + 1 === crossTabData.length) {
            spanSize = 1;
            // if (
            //   property.crossTabStyleOptions.crossTabTotal &&
            //   property.crossTabStyleOptions.crossTabSubTotals
            // )
            //   spanSize *= 2;
          } else if (hdrRow + 2 === crossTabData.length) {
            /*  Last but above row of the Column header span always of size measure fields count */
            spanSize = dustbinValues.length;
            // if (
            //   property.crossTabStyleOptions.crossTabTotal &&
            //   property.crossTabStyleOptions.crossTabSubTotals
            // )
            //   spanSize *= 2;
          } else if (hdrRow - 1 === 0) {
            /* Top row column span calulated from ColumnCSV list with matching data list lenght  */
            let _list = chartDataCSV.columns.filter((item: any) =>
              item.includes(colData.displayData)
            );
            spanSize = _list.length;
            console.log(colData.displayData, "5", _list);
            // if (colData.displayData === "Total") {
            //   spanSize = dustbinValues.length;
            // }
            // if (
            //   property.crossTabStyleOptions.crossTabTotal &&
            //   property.crossTabStyleOptions.crossTabSubTotals
            // )
            //   spanSize *= 2;
          } else {
            let compObj = "";

            Object.keys(colData.compareObj).forEach((key) => {
              compObj = compObj.concat(colData.compareObj[key], ",");
            });

            let _list = chartDataCSV.columns.filter((item: any) =>
              item.includes(compObj)
            );
            console.log(chartDataCSV.columns, compObj, _list);
            spanSize = _list.length;
          }
          //////////////////////////////////////////////////////////////////////////////////////////////////
          if (
            // colData.compareObj["total"] &&
            (colData.displayData === "Total" ||
              colData.displayData === "Grand Total" ||
              colData.displayData === "SubTotal") &&
            colData.compareObj["total"] === "Total"
          ) {
            spanSize = dustbinValues.length;
          }
          // if (
          //   property.crossTabStyleOptions.crossTabTotal &&
          //   property.crossTabStyleOptions.crossTabSubTotals
          // )
          //   spanSize *= 2;

          colData.columnSpan = spanSize || 1;
          // if (
          //   property.crossTabStyleOptions.crossTabTotal &&
          //   property.crossTabStyleOptions.crossTabSubTotals
          // )
          //   colData.columnSpan = spanSize || 2;
        }
      }
    } else {
      /*  No measure fields where added, so no values in the cell */
      if (noValue) {
        for (let hdrRow = crossTabData.length - 1; hdrRow >= 0; hdrRow--) {
          for (
            let colIndex = 0;
            colIndex < crossTabData[hdrRow].columnItems.length;
            colIndex++
          ) {
            let colData = crossTabData[hdrRow].columnItems[colIndex];
            let spanSize = 1;

            if (hdrRow - 1 === crossTabData.length) {
              spanSize = 1;
            } else {
              let compObj = "";

              Object.keys(colData.compareObj).forEach((key) => {
                compObj = compObj.concat(colData.compareObj[key], ",");
              });

              let _list = chartDataCSV.columns.filter((item: any) =>
                item.includes(compObj)
              );
              spanSize = _list.length;
            }

            colData.columnSpan = spanSize || 1;
          }
        }
      } else {
        updateColSpanHasValue(crossTabData, formatedChartPropData);
      }
    }
  };

  /* Column span calulated from compare object list lenght  */
  const updateColSpanHasValue = (
    crossTabData: any,
    formatedChartPropData: any
  ) => {
    console.log(crossTabData);
    for (var hdrRow = 0; hdrRow < crossTabData.length; hdrRow++) {
      // for (var hdrRow = crossTabData.length - 1; hdrRow >= 0; hdrRow--) {
      for (
        let colIndex = 0;
        colIndex < crossTabData[hdrRow].columnItems.length;
        colIndex++
      ) {
        let colData = crossTabData[hdrRow].columnItems[colIndex];
        let _list = CrossTab.getFilteredChartPropDataByCompareObject(
          formatedChartPropData,
          colData.compareObj
        );
        let colSpan = 0;
        let tempcolSpan = 0;
        let tempcompObj = CrossTab.cloneData(colData.compareObj);
        tempcompObj["total"] = "Total";
        console.log(colData.compareObj);
        console.log(_list);
        if (
          property.crossTabStyleOptions.crossTabTotal &&
          property.crossTabStyleOptions.crossTabSubTotals
          // colData.compareObj["total"] === "Total"
        ) {
          chartPropData.forEach((member) => {
            // console.log(`Name: ${user.name}, Age: ${user.age}`);
            // console.log(
            //   formatedChartPropData,
            //   chartDataFormat(sortChart(member.result)),
            //   sortChart(member.result),
            //   compareObj
            // );
            // if (!_filteredData)
            let _filteredData25 =
              // _filteredData ||
              CrossTab.getFilteredChartPropDataByCompareObject(
                chartDataFormat(sortChart(member.result)),
                colData.compareObj
                // tempcompObj
                // dustbinColumns.length + dustbinRows.length
              );

            let _filteredData52 =
              // _filteredData ||
              CrossTab.getFilteredChartPropDataByCompareObject(
                chartDataFormat(sortChart(member.result)),
                tempcompObj
                // dustbinColumns.length + dustbinRows.length
              );

            let isnotTotal = false;
            for (let i = hdrRow + 1; i < dustbinColumns.length; i++) {
              if (
                _filteredData52 &&
                _filteredData52[0] &&
                _filteredData52[0][
                  CrossTab.getKeyWithPrefix(dustbinColumns[i], "col")
                ] !== undefined
              ) {
                isnotTotal = true;
              }
            }
            if (hdrRow === dustbinColumns.length) {
              for (
                let i = Object.keys(tempcompObj).length - 1;
                i < dustbinColumns.length;
                i++
              ) {
                if (
                  _filteredData52 &&
                  _filteredData52[0] &&
                  _filteredData52[0][
                    CrossTab.getKeyWithPrefix(dustbinColumns[i], "col")
                  ] !== undefined
                ) {
                  isnotTotal = true;
                }
              }
            }

            // if (_filteredData25[0]) {
            // _list = _filteredData25;
            colSpan += _filteredData25.length;
            if (!isnotTotal) tempcolSpan += _filteredData52.length;
            // }
            console.log(_filteredData25);
          });
          console.log(_list);

          if (tempcolSpan !== colSpan) {
            colSpan -= tempcolSpan;
          }
          // _list = CrossTab.getFilteredChartPropDataByCompareObject2(
          //   formatedChartPropData,
          //   colData.compareObj,
          //   dustbinColumns.length + dustbinRows.length
          // );
        }
        colData.columnSpan = _list.length || 1;
        if (colSpan > 0) {
          colData.columnSpan = colSpan || 1;
        }
        if (
          colData.compareObj["total"] === "Total" // &&
          // hdrRow < dustbinColumns.length
        ) {
          colData.columnSpan = tempcolSpan || 1;
          // colData.columnSpan = 1;
        }
        // _list.length *
        //   Math.pow(
        //     2,
        //     crossTabData.length - hdrRow - dustbinColumns.length - 1
        //   ) || 1;
        // if (
        //   property.crossTabStyleOptions.crossTabTotal &&
        //   property.crossTabStyleOptions.crossTabSubTotals
        // )
        //   colData.columnSpan = _list.length * 2 || 2;
      }
    }
  };

  /*
	Push Dusbin Rows into crossTabData Header Area collection
*/
  const appendRowsFieldsAsColumns = () => {
    for (let i = crossTabData.length - 1; i >= 0; i--) {
      let tempColumns = [];

      for (let row = 0; row < dustbinRows.length; row++) {
        let tempColumnObj = CrossTab.cloneData(columnObj);

        if (i === crossTabData.length - 1) {
          tempColumnObj.displayData = CrossTab.getKeyWithPrefix(
            dustbinRows[row],
            "row"
          );
        } else {
          /*  Feature added to include Column field to the column header  */
          if (row === dustbinRows.length - 1) {
            tempColumnObj.displayData = CrossTab.getKeyWithPrefix(
              dustbinColumns[i],
              "row"
            );
          }
        }

        tempColumnObj.isRowField = true;
        tempColumnObj.isHeaderField = true;
        tempColumns.push(tempColumnObj);
        // console.log(tempColumnObj);
      }

      /*  TODO:: During measure swap feature, added those measures to rows  */
      if (dustbinValues.length > 1 && !showAsColumn) {
        let tempColumnObj = CrossTab.cloneData(columnObj);
        tempColumnObj.displayData = "";
        tempColumnObj.isRowField = true;
        tempColumnObj.isHeaderField = true;
        tempColumns.push(tempColumnObj);
      }

      crossTabData[i].columnItems = [
        ...tempColumns,
        ...crossTabData[i].columnItems,
      ];
    }
  };

  const appendRowsFieldsAsColumnsForColumnOnly = () => {
    for (let i = crossTabData.length - 1; i >= 0; i--) {
      let tempColumns = [];

      ///	for (let row = 0; row < dustbinColumns.length; row++) {
      let tempColumnObj = CrossTab.cloneData(columnObj);

      // if (i === crossTabData.length - 1) {
      // 	tempColumnObj.displayData = CrossTab.getKeyWithPrefix(dustbinColumns[row], "col");
      // } else {
      // 	/*  Feature added to include Column field to the column header  */
      // 	if (row === dustbinColumns.length - 1) {
      tempColumnObj.displayData = CrossTab.getKeyWithPrefix(
        dustbinColumns[i],
        "col"
      );
      // 	}
      // }

      tempColumnObj.isRowField = true;
      tempColumnObj.isHeaderField = true;
      tempColumns.push(tempColumnObj);
      ///	}

      crossTabData[i].columnItems = [
        ...tempColumns,
        ...crossTabData[i].columnItems,
      ];
    }
  };

  /*  To populate the cell(table body) with measure values. User doesn't added row fields  */
  const populateTableBodydataWithoutRow = () => {
    /*  TODO:: during measure swap, show measures in rows*/
    if (!showAsColumn) {
      chartDataCSV.rows = CrossTab.addDusbinValuesMeasuresInChartData(
        dustbinValues,
        chartDataCSV.rows
      );
    }

    let tempRowObj = CrossTab.cloneData(rowObj);
    let columnIndex = 0;

    columnIndex = dustbinColumns.length;

    if (crossTabData[columnIndex] && crossTabData[columnIndex].columnItems) {
      crossTabData[columnIndex].columnItems.forEach(
        (item: any, colIndex: number) => {
          let tempColumnObj = CrossTab.cloneData(columnObj);
          let compareObj = CrossTab.cloneData(item.compareObj);

          if (dustbinValues.length === 1) {
            let _filteredData =
              CrossTab.getFilteredChartPropDataByCompareObject(
                formatedChartPropData,
                compareObj
              )[0];

            if (_filteredData) {
              let _key = CrossTab.getKeyWithPrefix(dustbinValues[0], "val");
              tempColumnObj.displayData = _filteredData[_key];
            } else {
              tempColumnObj.displayData = "";
            }
            tempColumnObj.columnSpan = item.columnSpan;
            tempColumnObj.compareObj = compareObj;
          } else {
            if (showAsColumn) {
              let _filteredData =
                CrossTab.getFilteredChartPropDataByCompareObject(
                  formatedChartPropData,
                  compareObj
                )[0];

              if (_filteredData) {
                tempColumnObj.displayData = _filteredData[item.displayData];
                compareObj[item.displayData] = tempColumnObj.displayData;
              } else {
                tempColumnObj.displayData = "";
              }
              tempColumnObj.columnSpan = item.columnSpan;
            } else {
              let _filteredData =
                CrossTab.getFilteredChartPropDataByCompareObject(
                  formatedChartPropData,
                  compareObj
                )[0];

              if (_filteredData) {
                let valueField = dustbinValues.find(
                  (dustVal) =>
                    CrossTab.getKeyWithPrefix(dustVal, "val") ===
                    item.displayData
                );

                let _key = CrossTab.getKeyWithPrefix(valueField, "val");
                tempColumnObj.displayData = _filteredData[_key];
              } else {
                tempColumnObj.displayData = "";
              }
              tempColumnObj.columnSpan = item.columnSpan;
            }
            tempColumnObj.compareObj = compareObj;
          }
          tempRowObj.columnItems.push(tempColumnObj);
          tempRowObj.index = tempRowObj.index + 1;
        }
      );
      crossTabData.push(tempRowObj);
    }
  };

  const populateTableBodydata = (noValue?: boolean) => {
    // console.log(chartDataCSV.rows);
    if (!showAsColumn) {
      chartDataCSV.rows = CrossTab.addDusbinValuesMeasuresInChartData(
        dustbinValues,
        chartDataCSV.rows
      );
    }
    console.log(chartDataCSV.rows);

    let prevDisplayData: string;
    /*  From chart data collection need to run the loop for distinct rows */
    chartDataCSV.rows.forEach((row: any, rowIndex: number) => {
      let tempRowObj = CrossTab.cloneData(rowObj);
      let columnIndex = 0;
      let rowValues5 = row.split(CrossTab.delimiter);

      if (noValue) {
        columnIndex = dustbinColumns.length - 1;
      } else {
        columnIndex = dustbinColumns.length;
      }

      if (crossTabData[columnIndex] && crossTabData[columnIndex].columnItems) {
        console.log(crossTabData[columnIndex]);
        crossTabData[columnIndex].columnItems.forEach(
          (item: any, colIndex: number) => {
            let tempColumnObj = CrossTab.cloneData(columnObj);
            let compareObj = CrossTab.cloneData(item.compareObj);
            let rowValues = row.split(CrossTab.delimiter);

            console.log(prevDisplayData);
            console.log(rowValues);

            if (item.isRowField) {
              if (rowIndex === 0) {
                tempColumnObj.displayData = rowValues[colIndex];
                tempColumnObj.isHeaderField = true;
                compareObj[item.displayData] = tempColumnObj.displayData;
                console.log(compareObj);
              } else {
                let lastColumnIndex = 0;

                lastColumnIndex = dustbinRows.length;

                if (!showAsColumn && dustbinValues.length > 1) {
                  lastColumnIndex += 1;
                }

                if (lastColumnIndex - 1 !== colIndex) {
                  let previousRowData = CrossTab.getPreviousRowColumnData(
                    crossTabData,
                    dustbinColumns,
                    dustbinValues,
                    showAsColumn,
                    rowIndex,
                    colIndex
                  );

                  if (
                    previousRowData &&
                    previousRowData.displayData === rowValues[colIndex] &&
                    previousRowData.displayData !== "Total" //////////////////////////////////////////////
                  ) {
                    previousRowData.rowSpan =
                      rowIndex - parseInt(previousRowData.rowIndex) + 1;
                    tempColumnObj.skip = true;
                  } else {
                    if (previousRowData.displayData === "Total") {
                      // tempColumnObj.skip = true;
                      // previousRowData.columnSpan *= dustbinRows.length;
                    }

                    // if (rowValues[colIndex] !== undefined) {
                    tempColumnObj.displayData = rowValues[colIndex];
                    compareObj[dustbinRows[colIndex].fieldname] =
                      tempColumnObj.displayData;
                    // } else {
                    // if (tempColumnObj.displayData === undefined) {
                    //   tempColumnObj.skip = true;
                    // }
                    if (rowValues[colIndex] === "Total") {
                      compareObj[dustbinRows[colIndex].fieldname] =
                        previousRowData.displayData;
                      // tempColumnObj.displayData = previousRowData.displayData;
                      // tempColumnObj.columnSpan *= dustbinRows.length;
                    }
                    //compareObj[dustbinRows[colIndex].displayname] = tempColumnObj.displayData;
                  }
                } else {
                  tempColumnObj.displayData = rowValues[colIndex];
                  compareObj[dustbinRows[colIndex]?.fieldname] =
                    tempColumnObj.displayData;
                  //compareObj[displayName(dustbinRows[colIndex])] = tempColumnObj.displayData;
                }
              }
              tempColumnObj.isHeaderField = true;
              tempColumnObj.isRowField = true;
              tempColumnObj.compareObj = compareObj;
              tempColumnObj.rowIndex = rowIndex;
              tempRowObj.columnItems.push(tempColumnObj);
              tempRowObj.index = tempRowObj.index + 1;
              // let tempColumnObj2 = CrossTab.cloneData(tempColumnObj);
              // tempColumnObj2.rowIndex = rowIndex * 2 + 1;
              // tempRowObj.columnItems.push(tempColumnObj2);
              // tempRowObj.index = tempRowObj.index + 1;
              // crossTabData.push(tempRowObj);
            } else {
              if (noValue) {
                tempColumnObj.displayData = "";
                tempColumnObj.columnSpan = 1;
              } else if (dustbinValues.length === 1) {
                for (let i = 0; i < dustbinRows.length; i++) {
                  if (rowValues[i] !== "Grand Total")
                    compareObj[
                      CrossTab.getKeyWithPrefix(dustbinRows[i], "row")
                    ] = rowValues[i];
                  console.log(prevDisplayData);
                  console.log(rowValues);
                  console.log(rowValues[i]);
                  if (rowValues[i] === "Total") {
                    compareObj[
                      CrossTab.getKeyWithPrefix(dustbinRows[i], "row")
                    ] = prevDisplayData;
                    compareObj["total"] = "Total";
                  }
                  if (rowValues[i] === "Grand Total") {
                    // compareObj[
                    //   CrossTab.getKeyWithPrefix(dustbinRows[i], "row")
                    // ] = undefined;
                    compareObj["total"] = "Total";
                  }
                }

                console.log(compareObj);

                let _filteredData = [];
                if (compareObj["total"] !== "Total") {
                  _filteredData =
                    CrossTab.getFilteredChartPropDataByCompareObject(
                      formatedChartPropData,
                      compareObj
                    )[0];
                  // console.log(
                  //   CrossTab.getFilteredChartPropDataByCompareObject(
                  //     formatedChartPropData,
                  //     compareObj
                  //   )
                  // );
                }

                if (
                  compareObj["total"] === "Total" //||
                  // compareObj["total"] === "Grand Total"
                ) {
                  chartPropData.forEach((member) => {
                    // console.log(`Name: ${user.name}, Age: ${user.age}`);
                    console.log(
                      formatedChartPropData,
                      chartDataFormat(sortChart(member.result)),
                      sortChart(member.result),
                      compareObj
                    );
                    // if (!_filteredData)
                    let _filteredData25 =
                      // _filteredData ||
                      CrossTab.getFilteredChartPropDataByCompareObject2(
                        chartDataFormat(sortChart(member.result)),
                        compareObj,
                        dustbinColumns.length + dustbinRows.length
                      )[0];

                    if (_filteredData25) {
                      _filteredData = _filteredData25;
                    }
                  });
                }

                console.log(_filteredData);

                if (_filteredData) {
                  let _key = CrossTab.getKeyWithPrefix(dustbinValues[0], "val");
                  tempColumnObj.displayData = _filteredData[_key];

                  let _compareObj = CrossTab.cloneData(compareObj);
                  _compareObj[_key] = _filteredData[_key];
                  tempColumnObj.compareObj = _compareObj;
                } else {
                  tempColumnObj.displayData = "";
                  if (
                    compareObj[
                      // "total"
                      CrossTab.getKeyWithPrefix(dustbinRows[0], "row")
                    ] === "Total"
                  ) {
                    // tempColumnObj.skip = true;
                  }
                }
                tempColumnObj.columnSpan = item.columnSpan;
              } else {
                for (let i = 0; i < dustbinRows.length; i++) {
                  if (rowValues[i] !== "Grand Total")
                    compareObj[
                      CrossTab.getKeyWithPrefix(dustbinRows[i], "row")
                    ] = rowValues[i];
                  if (rowValues[i] === "Total") {
                    compareObj[
                      CrossTab.getKeyWithPrefix(dustbinRows[i], "row")
                    ] = prevDisplayData;
                    compareObj["total"] = "Total";
                  }
                  if (rowValues[i] === "Grand Total") {
                    // compareObj[
                    //   CrossTab.getKeyWithPrefix(dustbinRows[i], "row")
                    // ] = undefined;
                    compareObj["total"] = "Total";
                  }
                }

                if (showAsColumn) {
                  // let _filteredData =
                  //   CrossTab.getFilteredChartPropDataByCompareObject(
                  //     formatedChartPropData,
                  //     compareObj
                  //   )[0];

                  let _filteredData = [];
                  if (compareObj["total"] !== "Total") {
                    _filteredData =
                      CrossTab.getFilteredChartPropDataByCompareObject(
                        formatedChartPropData,
                        compareObj
                      )[0];
                    // console.log(
                    //   CrossTab.getFilteredChartPropDataByCompareObject(
                    //     formatedChartPropData,
                    //     compareObj
                    //   )
                    // );
                  }

                  if (
                    compareObj["total"] === "Total" //||
                    // compareObj["total"] === "Grand Total"
                  ) {
                    chartPropData.forEach((member) => {
                      // console.log(`Name: ${user.name}, Age: ${user.age}`);
                      console.log(
                        formatedChartPropData,
                        chartDataFormat(sortChart(member.result)),
                        sortChart(member.result),
                        compareObj
                      );
                      // if (!_filteredData)
                      let _filteredData25 =
                        // _filteredData ||
                        CrossTab.getFilteredChartPropDataByCompareObject2(
                          chartDataFormat(sortChart(member.result)),
                          compareObj,
                          dustbinColumns.length + dustbinRows.length
                        )[0];

                      if (_filteredData25) {
                        _filteredData = _filteredData25;
                      }
                    });
                  }

                  console.log(_filteredData);

                  if (_filteredData) {
                    tempColumnObj.displayData =
                      _filteredData[item.displayData] ||
                      _filteredData[item.displayDataforTotal];

                    let _compareObj = CrossTab.cloneData(compareObj);
                    _compareObj[item.displayData] =
                      _filteredData[item.displayData];
                    tempColumnObj.compareObj = _compareObj;
                  } else {
                    tempColumnObj.displayData = "";
                  }
                  tempColumnObj.columnSpan = item.columnSpan;
                } else {
                  // let _filteredData =
                  //   CrossTab.getFilteredChartPropDataByCompareObject(
                  //     formatedChartPropData,
                  //     compareObj
                  //   )[0];

                  let _filteredData = [];
                  if (compareObj["total"] !== "Total") {
                    _filteredData =
                      CrossTab.getFilteredChartPropDataByCompareObject(
                        formatedChartPropData,
                        compareObj
                      )[0];
                    // console.log(
                    //   CrossTab.getFilteredChartPropDataByCompareObject(
                    //     formatedChartPropData,
                    //     compareObj
                    //   )
                    // );
                  }

                  if (
                    compareObj["total"] === "Total" //||
                    // compareObj["total"] === "Grand Total"
                  ) {
                    chartPropData.forEach((member) => {
                      // console.log(`Name: ${user.name}, Age: ${user.age}`);
                      console.log(
                        formatedChartPropData,
                        chartDataFormat(sortChart(member.result)),
                        sortChart(member.result),
                        compareObj
                      );
                      // if (!_filteredData)
                      let _filteredData25 =
                        // _filteredData ||
                        CrossTab.getFilteredChartPropDataByCompareObject2(
                          chartDataFormat(sortChart(member.result)),
                          compareObj,
                          dustbinColumns.length + dustbinRows.length
                        )[0];

                      if (_filteredData25) {
                        _filteredData = _filteredData25;
                      }
                    });
                  }

                  console.log(_filteredData);

                  if (_filteredData) {
                    let tempValue =
                      rowValues[row.split(CrossTab.delimiter).length - 2];
                    let valueField = dustbinValues.find(
                      (dustVal) =>
                        CrossTab.getKeyWithPrefix(dustVal, "val") === tempValue
                    );

                    let _key = CrossTab.getKeyWithPrefix(valueField, "val");
                    tempColumnObj.displayData = _filteredData[_key];

                    let _compareObj = CrossTab.cloneData(compareObj);
                    _compareObj[_key] = _filteredData[_key];
                    tempColumnObj.compareObj = _compareObj;
                  } else {
                    tempColumnObj.displayData = "";
                  }
                  tempColumnObj.columnSpan = item.columnSpan;
                }
              }
              tempColumnObj.rowIndex = rowIndex;
              tempRowObj.columnItems.push(tempColumnObj);
              tempRowObj.index = tempRowObj.index + 1;
            }
          }
        );
        // console.log(tempRowObj);
        crossTabData.push(tempRowObj);
        // crossTabData.push(tempRowObj);
      }
      prevDisplayData = rowValues5[0];
      console.log(rowValues5[0]);
    });
  };

  /*
	Push Dusbin Values Measures into crossTabData Header Area collection
*/

  const addMeasureValuesInColumnHeaderArea = () => {
    if (dustbinValues.length > 0) {
      let tempRowObj = CrossTab.cloneData(rowObj);
      let previousColumnItems =
        crossTabData[crossTabData.length - 1].columnItems;

      for (let i = 0; i < previousColumnItems.length; i++) {
        if (
          crossTabData.length === 1 &&
          i === previousColumnItems.length - 1 &&
          property.crossTabStyleOptions.crossTabGrandTotal
        ) {
          continue;
        }
        let _chartDataObj: any = {};
        dustbinValues.forEach((val) => {
          let tempColumnObj = CrossTab.cloneData(columnObj);
          tempColumnObj.displayData = CrossTab.getKeyWithPrefix(
            val,
            "val",
            _chartDataObj
          ); /*	Set Unique field display name	*/
          tempColumnObj.agg = val.agg;
          tempColumnObj.compareObj = previousColumnItems[i].compareObj;
          if (
            property.crossTabStyleOptions.crossTabTotal &&
            property.crossTabStyleOptions.crossTabSubTotals &&
            tempColumnObj.compareObj[
              "total"
              // CrossTab.getKeyWithPrefix(dustbinColumns[0], "col")
            ] === "Total"
          ) {
            tempColumnObj.displayDataforTotal = tempColumnObj.displayData;
            // tempColumnObj.displayData = val.fieldname;
            // if (dustbinValues.length === 1) tempColumnObj.skip = true;
            // tempColumnObj.compareObj = previousColumnItems[i].compareObj;
          }
          tempColumnObj.isHeaderField = true;
          tempRowObj.columnItems.push(tempColumnObj);
          console.log(tempColumnObj);

          _chartDataObj[tempColumnObj.displayData] = "";
        });
      }
      crossTabData.push(tempRowObj);
    }
  };

  const constructColumnHeaderArea = () => {
    for (let i = 0; i < dustbinColumns.length; i++) {
      if (i === 0) {
        let tempRowObj = CrossTab.cloneData(rowObj);
        console.log(tempRowObj);

        console.log(chartDataCSV);
        let _headerColumnList = CrossTab.getColumnList(i, chartDataCSV.columns);
        tempRowObj.columnList.push(_headerColumnList);
        console.log(_headerColumnList);

        _headerColumnList.forEach((col) => {
          let tempColumnObj = CrossTab.cloneData(columnObj);
          tempColumnObj.displayData = col;
          tempColumnObj.compareObj[
            CrossTab.getKeyWithPrefix(dustbinColumns[i], "col")
          ] = col;
          tempColumnObj.isHeaderField = true;
          // tempColumnObj.columnSpan = 2;
          if (col === "Grand Total") {
            tempColumnObj.rowSpan =
              dustbinColumns.length + (dustbinValues.length && 1);
          }
          tempRowObj.columnItems.push(tempColumnObj);
          // tempRowObj.columnItems.push(tempColumnObj);
          if (
            property.crossTabStyleOptions.crossTabTotal &&
            property.crossTabStyleOptions.crossTabSubTotals &&
            col !== "Grand Total"
          ) {
            let tempColumnObj2 = CrossTab.cloneData(columnObj);
            tempColumnObj2.displayData = "Total";
            tempColumnObj2.compareObj[
              CrossTab.getKeyWithPrefix(dustbinColumns[i], "col")
            ] = col;
            tempColumnObj2.compareObj["total"] = "Total";
            tempColumnObj2.isHeaderField = true;
            tempColumnObj2.rowSpan = dustbinColumns.length;
            // + (dustbinValues.length && 1);
            // if (dustbinValues.length > 1) {
            //   tempColumnObj2.rowSpan = dustbinColumns.length;
            // }
            tempRowObj.columnItems.push(tempColumnObj2);
            console.log(tempColumnObj2);
          }
          console.log(tempColumnObj);
        });
        if (
          property.crossTabStyleOptions.crossTabTotal &&
          property.crossTabStyleOptions.crossTabGrandTotal // &&
          // col !== "Grand Total"
        ) {
          let tempColumnObj2 = CrossTab.cloneData(columnObj);
          tempColumnObj2.displayData = "Grand Total";
          // tempColumnObj2.compareObj[
          //   CrossTab.getKeyWithPrefix(dustbinColumns[i], "col")
          // ] = col;
          tempColumnObj2.compareObj["total"] = "Total";
          tempColumnObj2.isHeaderField = true;
          // tempColumnObj2.rowSpan =
          //   dustbinColumns.length + (dustbinValues.length && 1);
          // if (dustbinValues.length > 1) {
          tempColumnObj2.rowSpan = dustbinColumns.length;
          // }
          tempRowObj.columnItems.push(tempColumnObj2);
          console.log(tempColumnObj2);
        }
        crossTabData.push(tempRowObj);
      } else {
        let tempRowObj = CrossTab.cloneData(rowObj);
        console.log(tempRowObj);
        console.log(crossTabData[i - 1]);

        for (
          let colItem = 0;
          colItem < crossTabData[i - 1].columnItems.length;
          colItem += 1
        ) {
          let _currentCompObj =
            crossTabData[i - 1].columnItems[colItem].compareObj;
          console.log(crossTabData[i - 1].columnItems[colItem]);
          // if (
          //   _currentCompObj[
          //     CrossTab.getKeyWithPrefix(dustbinColumns[0], "col")
          //   ] === "Total"
          // ) {
          //   continue;
          // }

          let list = [];
          if (_currentCompObj["total"] !== "Total") {
            list = CrossTab.getFilteredChartPropDataByCompareObject(
              formatedChartPropData,
              _currentCompObj
            );
          }
          console.log(list);
          /*  For each row there can be may Chat data objects, so based on the Dusbin column index need to filter distinct Column headers*/
          let distinctList = CrossTab.getDistinctList(
            dustbinColumns,
            _currentCompObj,
            i,
            list
          );
          console.log(distinctList);

          /* IMPROMENT
          
          let _list = chartDataCSV.columns.filter(item => item.includes(crossTabData[i].columnItems[colItem].displayData))
          
          CrossTab.getColumnList(i, _list).forEach() --> form comp obj then filter using "getFilteredChartPropDataByCompareObject"
          */

          distinctList = distinctList || [];
          // if (
          //   _currentCompObj[
          //     CrossTab.getKeyWithPrefix(dustbinColumns[0], "col")
          //   ] !== "Total"
          // )
          tempRowObj.columnList.push(distinctList);
          console.log(
            _currentCompObj[CrossTab.getKeyWithPrefix(dustbinColumns[0], "col")]
          );

          console.log(distinctList);
          distinctList.forEach((item) => {
            let tempColumnObj = CrossTab.cloneData(columnObj);
            let tempCompareObj = CrossTab.cloneData(_currentCompObj);
            tempColumnObj.displayData =
              item[CrossTab.getKeyWithPrefix(dustbinColumns[i], "col")];
            tempCompareObj[
              CrossTab.getKeyWithPrefix(dustbinColumns[i], "col")
            ] = tempColumnObj.displayData;
            tempColumnObj.compareObj = tempCompareObj;
            tempColumnObj.parentColumnSpan = distinctList.length;
            console.log(tempColumnObj);
            tempRowObj.columnItems.push(tempColumnObj);
            tempColumnObj.isHeaderField = true;
            // if (
            //   property.crossTabStyleOptions.crossTabTotal &&
            //   property.crossTabStyleOptions.crossTabSubTotals
            // ) {
            //   let tempColumnObj2 = CrossTab.cloneData(tempColumnObj);
            //   let tempCompareObj2 = CrossTab.cloneData(tempCompareObj);
            //   // tempColumnObj2.displayData = "Totals";
            //   // tempCompareObj2[
            //   //   CrossTab.getKeyWithPrefix(dustbinColumns[0], "col")
            //   // ] = "Total";
            //   // tempColumnObj2.compareObj = tempCompareObj2;
            //   // tempColumnObj2.rowSpan = 1;
            //   tempRowObj.columnItems.push(tempColumnObj2);
            // }

            //////////////////////////////////////////////////////////////////////////////////////
            if (
              property.crossTabStyleOptions.crossTabTotal &&
              property.crossTabStyleOptions.crossTabSubTotals &&
              i < dustbinColumns.length - 1 //&&
              // col !== "Grand Total"
            ) {
              let tempColumnObj2 = CrossTab.cloneData(tempColumnObj);
              tempColumnObj2.displayData = "SubTotal";
              tempColumnObj2.compareObj[
                CrossTab.getKeyWithPrefix(dustbinColumns[i], "col")
              ] = item[CrossTab.getKeyWithPrefix(dustbinColumns[i], "col")];
              tempColumnObj2.compareObj["total"] = "Total";
              tempColumnObj2.isHeaderField = true;
              // tempColumnObj2.rowSpan =
              //   dustbinColumns.length + (dustbinValues.length && 1) - i;
              // if (dustbinValues.length > 1) {
              tempColumnObj2.rowSpan = dustbinColumns.length - i;
              // }
              tempRowObj.columnItems.push(tempColumnObj2);
              console.log(tempColumnObj2);
            }
            // console.log(tempColumnObj);
          });
          if (
            _currentCompObj[
              "total"
              // CrossTab.getKeyWithPrefix(dustbinColumns[0], "col")
            ] === "Total"
          ) {
            let tempColumnObj = CrossTab.cloneData(columnObj);
            let tempCompareObj = CrossTab.cloneData(_currentCompObj);
            // tempColumnObj.displayData =
            //   item[CrossTab.getKeyWithPrefix(dustbinColumns[i], "col")];
            // tempCompareObj[
            //   CrossTab.getKeyWithPrefix(dustbinColumns[i], "col")
            // ] = tempColumnObj.displayData;
            tempColumnObj.compareObj = tempCompareObj;
            tempColumnObj.parentColumnSpan = distinctList.length;
            console.log(tempColumnObj);
            // tempRowObj.columnItems.push(tempColumnObj);
            tempColumnObj.isHeaderField = true;
            if (
              property.crossTabStyleOptions.crossTabTotal &&
              property.crossTabStyleOptions.crossTabSubTotals
            ) {
              let tempColumnObj2 = CrossTab.cloneData(tempColumnObj);
              let tempCompareObj2 = CrossTab.cloneData(tempCompareObj);
              tempColumnObj2.displayData = "";
              // tempCompareObj2[
              //   CrossTab.getKeyWithPrefix(dustbinColumns[0], "col")
              // ] = "Total";
              tempColumnObj2.compareObj["total"] = "Total";
              tempColumnObj2.compareObj = tempCompareObj2;
              tempColumnObj2.skip = true;
              // tempColumnObj2.rowSpan = 1;
              tempRowObj.columnItems.push(tempColumnObj2);
            }
          }
          // if (
          //   property.crossTabStyleOptions.crossTabTotal &&
          //   property.crossTabStyleOptions.crossTabSubTotals //&&
          //   // col !== "Grand Total"
          // ) {
          //   let tempColumnObj2 = CrossTab.cloneData(columnObj);
          //   tempColumnObj2.displayData = "SubTotal";
          //   tempColumnObj2.compareObj[
          //     CrossTab.getKeyWithPrefix(dustbinColumns[i], "col")
          //   ] = "Total"; //item[CrossTab.getKeyWithPrefix(dustbinColumns[i], "col")];
          //   tempColumnObj2.compareObj["total"] = "Total";
          //   tempColumnObj2.isHeaderField = true;
          //   tempColumnObj2.rowSpan =
          //     dustbinColumns.length + (dustbinValues.length && 1) - i - 1;
          //   if (dustbinValues.length > 1) {
          //     tempColumnObj2.rowSpan = dustbinColumns.length;
          //   }
          //   tempRowObj.columnItems.push(tempColumnObj2);
          //   console.log(tempColumnObj2);
          // }
          // // console.log(tempColumnObj);
        }
        console.log(tempRowObj);
        crossTabData.push(tempRowObj);
      }
    }

    if (showAsColumn) {
      addMeasureValuesInColumnHeaderArea();
    }
  };

  /*  Construct crossTabData object to show chart for atleat one field in all 3 dustbins  */
  const showChartForAtleastOneDusbinField = (noValue?: boolean) => {
    constructColumnHeaderArea();
    console.log(crossTabData);
    updateColSpan(noValue);
    console.log(crossTabData);
    appendRowsFieldsAsColumns();
    console.log(crossTabData);
    populateTableBodydata(noValue);
    console.log(crossTabData);
  };

  /*  Construct crossTabData object to show chart with column fields only  */
  const showColumnsOnlyChart = () => {
    constructColumnHeaderArea();
    updateColSpan(true);
    appendRowsFieldsAsColumnsForColumnOnly();
  };

  /*  Construct crossTabData object to show chart with row fields only  */
  const showRowsOnlyChart = () => {
    let tempRowObj1 = CrossTab.cloneData(rowObj);

    dustbinRows.forEach((rowItem) => {
      let tempColumnObj = CrossTab.cloneData(columnObj);
      tempColumnObj.displayData = CrossTab.getKeyWithPrefix(rowItem, "row");
      tempColumnObj.isHeaderField = true;
      tempRowObj1.columnItems.push(tempColumnObj);
    });

    crossTabData.push(tempRowObj1);

    for (let i = 0; i < chartDataCSV.rows.length; i++) {
      let tempRowObj = CrossTab.cloneData(rowObj);
      let compObj: any = {};
      let rowItemArray = chartDataCSV.rows[i].split(CrossTab.delimiter);

      rowItemArray.forEach((val: any, index: number) => {
        if (val) {
          let tempColumnObj = CrossTab.cloneData(columnObj);
          compObj[CrossTab.getKeyWithPrefix(dustbinRows[index], "row")] = val;

          let previousRowData = CrossTab.getPreviousRowColumnData(
            crossTabData,
            dustbinColumns,
            dustbinValues,
            showAsColumn,
            i,
            index
          );

          if (previousRowData && previousRowData.displayData === val) {
            if (index + 2 !== rowItemArray.length) {
              previousRowData.rowSpan =
                i - parseInt(previousRowData.rowIndex) + 1;
              tempColumnObj.skip = true;
            } else {
              previousRowData.rowSpan = 1;
              tempColumnObj.displayData = val;
            }
          } else {
            tempColumnObj.displayData = val;
            tempColumnObj.isRowField = true;
          }
          tempColumnObj.compareObj = compObj;

          tempColumnObj.rowIndex = i;
          tempRowObj.columnItems.push(tempColumnObj);
        }
      });

      crossTabData.push(tempRowObj);
    }

    defaultTemplate = false;
  };

  /*  Construct crossTabData object to show chart with value/measure fields only  */

  const showValuesOnlyChart = () => {
    if (showAsColumn) {
      let tempRowObj1 = CrossTab.cloneData(rowObj);
      let _chartDataObj: any = {};

      dustbinValues.forEach((rowItem) => {
        let tempColumnObj = CrossTab.cloneData(columnObj);
        tempColumnObj.displayData = CrossTab.getKeyWithPrefix(
          rowItem,
          "val",
          _chartDataObj
        ); /*	Set Unique field display name	*/
        tempColumnObj.isHeaderField = true;
        tempRowObj1.columnItems.push(tempColumnObj);

        _chartDataObj[tempColumnObj.displayData] = "";
      });

      crossTabData.push(tempRowObj1);

      let tempRowObj = CrossTab.cloneData(rowObj);
      Object.keys(formatedChartPropData[0]).forEach((key, idx) => {
        let tempColumnObj = CrossTab.cloneData(columnObj);
        tempColumnObj.displayData = formatedChartPropData[0][key];

        let _compareObj: any = {};
        _compareObj[key] = tempColumnObj.displayData;
        tempColumnObj.compareObj = _compareObj;

        tempRowObj.columnItems.push(tempColumnObj);
      });

      crossTabData.push(tempRowObj);
    } else {
      Object.keys(formatedChartPropData[0]).forEach((key) => {
        let tempRowObj = CrossTab.cloneData(rowObj);
        let tempColumnObj = CrossTab.cloneData(columnObj);

        tempColumnObj.displayData = key;
        tempColumnObj.isHeaderField = true;
        tempRowObj.columnItems.push(tempColumnObj);

        tempColumnObj = CrossTab.cloneData(columnObj);

        tempColumnObj.displayData = formatedChartPropData[0][key];
        tempRowObj.columnItems.push(tempColumnObj);

        crossTabData.push(tempRowObj);
      });
    }

    defaultTemplate = false;
  };

  /*  Construct crossTabData object to show chart with value/measure fields and column fields  */
  const showColumnsAndValuesChart = () => {
    constructColumnHeaderArea();
    updateColSpan();
    populateTableBodydataWithoutRow();
    appendRowsFieldsAsColumnsForColumnOnly();

    //defaultTemplate = false;
  };

  const addColumnItemsFromRowBoj = (
    dustbinList: any,
    tempRowObj1: any,
    dusbinName: string
  ) => {
    let _chartDataObj: any = {};

    dustbinList.forEach((rowItem: any) => {
      let tempColumnObj = CrossTab.cloneData(columnObj);
      tempColumnObj.displayData = CrossTab.getKeyWithPrefix(
        rowItem,
        dusbinName,
        _chartDataObj
      ); /*	Set Unique field display name	*/
      tempColumnObj.isHeaderField = true;
      tempRowObj1.columnItems.push(tempColumnObj);

      _chartDataObj[tempColumnObj.displayData] = "";
    });
  };

  /*  Construct crossTabData object to show chart with value/measure fields and row fields  */
  const showRowsAndValuesChart = () => {
    let tempRowObj1 = CrossTab.cloneData(rowObj);

    addColumnItemsFromRowBoj(dustbinRows, tempRowObj1, "row");
    addColumnItemsFromRowBoj(dustbinValues, tempRowObj1, "val");

    crossTabData.push(tempRowObj1);
    let columnsHeader: string[] = [];
    tempRowObj1.columnItems.forEach((item: any) => {
      columnsHeader.push(item?.displayData);
    });
    console.log(columnsHeader);
    console.log(formatedChartPropData);

    formatedChartPropData.forEach((data, index) => {
      let tempRowObj = CrossTab.cloneData(rowObj);
      let compObj: any = {};

      columnsHeader.forEach((key, pos) => {
        let tempColumnObj = CrossTab.cloneData(columnObj);

        if (pos > dustbinRows.length - 1) {
          tempColumnObj.displayData = data[key];
        } else {
          let previousRowData = CrossTab.getPreviousRowColumnData(
            crossTabData,
            dustbinColumns,
            dustbinValues,
            showAsColumn,
            index,
            pos,
            true
          );
          console.log(previousRowData);
          console.log(data[key]);

          if (previousRowData && previousRowData.displayData === data[key]) {
            previousRowData.rowSpan =
              index - parseInt(previousRowData.rowIndex) + 1;
            tempColumnObj.skip = true;
          } else {
            tempColumnObj.displayData = data[key];
            tempColumnObj.isRowField = true;
            tempColumnObj.isHeaderField = true;
          }
        }

        if (!tempColumnObj.isHeaderField && !tempColumnObj.isRowField) {
          dustbinValues.forEach((field) => {
            //delete compObj[displayName(field) + "__" + field.agg];
            //delete compObj[field.fieldname + "__" + field.agg];
            delete compObj[field.displayname + "__" + field.agg];
          });

          compObj[key] = data[key];
        } else {
          compObj[key] = data[key];
        }

        tempColumnObj.compareObj = CrossTab.cloneData(compObj);
        tempColumnObj.rowIndex = index;
        tempRowObj.columnItems.push(tempColumnObj);
      });

      tempRowObj.index = index;
      crossTabData.push(tempRowObj);
    });

    defaultTemplate = false;
  };

  /*  Construct crossTabData object to show chart with column and row fields  */

  const showColumnsAndRowsChart = () => {
    showChartForAtleastOneDusbinField(true);
    defaultTemplate = false;
  };

  /*  To determine how to construct CrossTabData object based dustbin fields count */
  const showAtleastOneEmptyDusbinFieldsChart = () => {
    if (
      dustbinColumns.length === 0 &&
      dustbinRows.length > 0 &&
      dustbinValues.length > 0
    ) {
      showRowsAndValuesChart();
    } else if (
      dustbinColumns.length > 0 &&
      dustbinRows.length === 0 &&
      dustbinValues.length > 0
    ) {
      showColumnsAndValuesChart();
    } else if (
      dustbinColumns.length > 0 &&
      dustbinRows.length > 0 &&
      dustbinValues.length === 0
    ) {
      showColumnsAndRowsChart();
    } else if (
      dustbinColumns.length === 0 &&
      dustbinRows.length === 0 &&
      dustbinValues.length > 0
    ) {
      showValuesOnlyChart();
    } else if (
      dustbinColumns.length > 0 &&
      dustbinRows.length === 0 &&
      dustbinValues.length === 0
    ) {
      showColumnsOnlyChart();
    } else if (
      dustbinColumns.length === 0 &&
      dustbinRows.length > 0 &&
      dustbinValues.length === 0
    ) {
      showRowsOnlyChart();
    } else {
      defaultTemplate = true;
    }
  };

  /* To determine to show chart  */
  if (formatedChartPropData.length > 0) {
    enable = true;
    // console.log(formatedChartPropData);
    let tempRowforSubTotal =
      formatedChartPropData[0][
        CrossTab.getKeyWithPrefix(dustbinRows[0], "row")
      ];
    let tempColforSubTotal =
      formatedChartPropData[0][
        CrossTab.getKeyWithPrefix(dustbinColumns[0], "col")
      ];
    // console.log(tempColforSubTotal);

    formatedChartPropData.forEach((data) => {
      let _combineRow = "",
        _combineColumn = "";

      // console.log(dustbinRows);
      if (
        data[CrossTab.getKeyWithPrefix(dustbinRows[0], "row")] !==
          tempRowforSubTotal &&
        property.crossTabStyleOptions.crossTabTotal &&
        property.crossTabStyleOptions.crossTabSubTotals
      ) {
        tempRowforSubTotal =
          data[CrossTab.getKeyWithPrefix(dustbinRows[0], "row")];
        chartDataCSV.rows.push("Total");
      }
      // if (
      //   data[CrossTab.getKeyWithPrefix(dustbinColumns[0], "col")] !==
      //     tempColforSubTotal &&
      //   property.crossTabStyleOptions.crossTabTotal &&
      //   property.crossTabStyleOptions.crossTabSubTotals
      // ) {
      //   tempColforSubTotal =
      //     data[CrossTab.getKeyWithPrefix(dustbinColumns[0], "col")];
      //   chartDataCSV.columns.push("Total,");
      // }
      dustbinRows.forEach((rowField) => {
        // console.log(rowField);
        _combineRow = _combineRow.concat(
          data[CrossTab.getKeyWithPrefix(rowField, "row")],
          CrossTab.delimiter
        );
        // console.log(CrossTab.getKeyWithPrefix(rowField, "row"));
        // console.log(data[CrossTab.getKeyWithPrefix(rowField, "row")]);
        // console.log(_combineRow);
      });

      dustbinColumns.forEach((colField) => {
        // console.log(colField);
        _combineColumn = _combineColumn.concat(
          data[CrossTab.getKeyWithPrefix(colField, "col")],
          CrossTab.delimiter
        );
        // console.log(data[CrossTab.getKeyWithPrefix(colField, "col")]);
        // console.log(_combineColumn);
      });

      if (_combineRow && !chartDataCSV.rows.includes(_combineRow)) {
        // console.log(_combineRow);
        chartDataCSV.rows.push(_combineRow);
      }

      if (_combineColumn && !chartDataCSV.columns.includes(_combineColumn)) {
        // console.log(_combineColumn);
        chartDataCSV.columns.push(_combineColumn);
      }
    });
    if (
      property.crossTabStyleOptions.crossTabTotal &&
      property.crossTabStyleOptions.crossTabSubTotals
    ) {
      chartDataCSV.rows.push("Total");
      // chartDataCSV.columns.push("Total,");
    }
    if (
      property.crossTabStyleOptions.crossTabTotal &&
      property.crossTabStyleOptions.crossTabGrandTotal
    ) {
      chartDataCSV.rows.push("Grand Total");
    }
    console.log(chartDataCSV);

    /*  To determine how to construct CrossTabData object based dustbin fields count */
    if (
      dustbinColumns.length > 0 &&
      dustbinRows.length > 0 &&
      dustbinValues.length > 0
    ) {
      showChartForAtleastOneDusbinField();
      defaultTemplate = false;
    } else {
      showAtleastOneEmptyDusbinFieldsChart();
    }
  } else {
    enable = false;
  }

  /*
  Render function
  */
  // crossTabData = [];

  return (
    <div
      style={{
        width: graphDimension.width,
        height: graphDimension.height,
      }}
    >
      {/* TODO:: feature to swap measures to Rows / Columns. Default to show as columns.
        dustbinValues.length > 1 && dustbinRows.length > 0 && dustbinColumns.length > 0 ? (
        <button onClick={(e) => setShowAsColumn(!showAsColumn)}>Swap Measures</button>
      ) : null */}
      {enable ? (
        defaultTemplate ? (
          <div
            style={{
              overflowX: "scroll",
              maxWidth: "1100px",
              maxHeight: "500px",
            }}
          ></div>
        ) : (
          <BuildTable
            crossTabData={crossTabData}
            dustbinRows={dustbinRows}
            dustbinValues={dustbinValues}
            dustbinColumns={dustbinColumns}
            formatedChartPropData={formatedChartPropData}
            chartControls={chartControls}
            chartProperties={chartProperties}
            propKey={propKey}
            graphDimension={graphDimension}
          ></BuildTable>
        )
      ) : null}
    </div>
  );
};

const mapStateToProps = (state: ChartsMapStateToProps, ownProps: any) => {
  return {
    chartControls: state.chartControls,
    chartProperties: state.chartProperties,
  };
};

export default connect(mapStateToProps, null)(CrossTabChart);
