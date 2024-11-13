// This component is used to enable / disable Smooth Curve option for Line charts

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { updateCrossTabStyleOptions } from "../../../redux/ChartPoperties/ChartControlsActions";
import {
  ChartOptionsProps,
  ChartOptionsStateProps,
} from "../CommonInterfaceForChartOptions";
import SwitchWithInput from "../SwitchWithInput";

interface LineChartProps {
  updateCrossTabStyleOptions: (
    propKey: string,
    option: string,
    value: any
  ) => void;
}

const CrossTabTotal = ({
  // state
  chartControls,
  tabTileProps,

  // dispatch
  updateCrossTabStyleOptions,
}: ChartOptionsProps & LineChartProps) => {
  var propKey: string = `${tabTileProps.selectedTabId}.${tabTileProps.selectedTileId}`;

  return (
    <div className="optionsInfo">
      <div className="optionDescription">
        <label
          htmlFor="enableDisable"
          className="enableDisableLabel"
          style={{ marginRight: "10px" }}
        >
          Add Totals
        </label>

        <SwitchWithInput
          isChecked={
            chartControls.properties[propKey].crossTabStyleOptions.crossTabTotal
          }
          onSwitch={() => {
            console.log(
              chartControls.properties[propKey].crossTabStyleOptions
                .crossTabTotal
            );
            updateCrossTabStyleOptions(
              propKey,
              "crossTabTotal",
              !chartControls.properties[propKey].crossTabStyleOptions
                .crossTabTotal
            );
          }}
        />
      </div>
      {chartControls.properties[propKey].crossTabStyleOptions.crossTabTotal ? (
        <>
          <div className="optionDescription">
            <label
              htmlFor="enableDisable"
              className="enableDisableLabel"
              style={{ marginRight: "10px" }}
            >
              Add SubTotals
            </label>

            <SwitchWithInput
              isChecked={
                chartControls.properties[propKey].crossTabStyleOptions
                  .crossTabSubTotals
              }
              onSwitch={() => {
                updateCrossTabStyleOptions(
                  propKey,
                  "crossTabSubTotals",
                  !chartControls.properties[propKey].crossTabStyleOptions
                    .crossTabSubTotals
                );
              }}
            />
          </div>

          <div className="optionDescription">
            <label
              htmlFor="enableDisable"
              className="enableDisableLabel"
              style={{ marginRight: "10px" }}
            >
              Add GrandTotal
            </label>

            <SwitchWithInput
              isChecked={
                chartControls.properties[propKey].crossTabStyleOptions
                  .crossTabGrandTotal
              }
              onSwitch={() => {
                updateCrossTabStyleOptions(
                  propKey,
                  "crossTabGrandTotal",
                  !chartControls.properties[propKey].crossTabStyleOptions
                    .crossTabGrandTotal
                );
              }}
            />
          </div>
        </>
      ) : null}
    </div>
  );
};

const mapStateToProps = (state: ChartOptionsStateProps, ownProps: any) => {
  return {
    chartControls: state.chartControls,
    tabTileProps: state.tabTileProps,
  };
};
const mapDispatchToProps = (dispatch: Dispatch<any>) => {
  return {
    updateCrossTabStyleOptions: (propKey: string, option: string, value: any) =>
      dispatch(updateCrossTabStyleOptions(propKey, option, value)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CrossTabTotal);
