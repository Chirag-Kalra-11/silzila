// This component provides individual dropzone
// Each Dropzone can have allowed number of cards.
// Cards can be moved between dropzones & also sorted within a dropzone
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {
  FormControl,
  ListItemText,
  MenuItem,
  Select,
  Tooltip,
  Typography,
  Menu,
  Button,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ChartFilterGroups from "./ChartFilterGroups";
import { useState, useEffect, useRef } from "react";
import AddIcon from "@mui/icons-material/Add";
import {
  addChartFilterGroupName,
  deleteChartFilterSelectedGroup,
  addChartFilterTabTileName,
  updateChartFilterSelectedGroups,
  updateChartFilterGroupsCollapsed,
  deleteFilterGroupFromChartFilterGroup,
} from "../../redux/ChartFilterGroup/ChartFilterGroupStateActions";
import { Checkbox } from "@mui/material";
import { ChartFilterGroupsContainerProps } from "../../redux/ChartFilterGroup/ChartFilterGroupInterface";
import { ChartPropertiesStateProps } from "../../redux/ChartPoperties/ChartPropertiesInterfaces";
import {
  ChartFilterGroupStateProps,
  groupProp,
} from "../../redux/ChartFilterGroup/ChartFilterGroupInterface";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  updateDashBoardGroups,
  deleteDashBoardSelectedGroup,
  deleteFilterGroupFromDashBoardFilterGroup,
} from "../../redux/DashBoardFilterGroup/DashBoardFilterGroupAction";
import {
  addDashBoardFilterGroupTabTiles,
  setDashBoardFilterGroupsTabTiles,
  deleteDashBoardSelectedGroupAllTabTiles,
} from "../../redux/DashBoardFilterGroup/DashBoardFilterGroupAction";
import { TileRibbonStateProps } from "../../Components/TabsAndTiles/TileRibbonInterfaces";
import "./ChartFilterGroup.css";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  AcceptRejectDialog,
  NotificationDialog,
} from "../CommonFunctions/DialogComponents";
import { text } from "stream/consumers";
import { setSelectedControlMenu } from "../../redux/TabTile/TabTileActionsAndMultipleDispatches";
const ChartFilterGroupsContainer = ({
  // props
  propKey,
  fromDashboard,

  // state
  chartProp,
  chartGroup,
  dashBoardGroup,
  tileState,
  tabTileProps,
  tabState,

  // dispatch
  addChartFilterGroupName,
  addChartFilterTabTileName,
  updateChartFilterSelectedGroups,
  updateChartFilterGroupsCollapsed,
  deleteChartFilterSelectedGroup,
  updateDashBoardGroups,
  deleteDashBoardSelectedGroup,
  addDashBoardFilterGroupTabTiles,
  setDashBoardFilterGroupsTabTiles,
  deleteDashBoardSelectedGroupAllTabTiles,
  deleteFilterGroupFromChartFilterGroup,
  deleteFilterGroupFromDashBoardFilterGroup,
  setMenu,
}: ChartFilterGroupsContainerProps & any) => {
  let selectedDatasetID = "";
  let datasetGroupList = [];
  let selectedFilterGroups: any = [];
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const filterGroupToBeDeleted = useRef<{ id: string; name: string } | null>(
    null
  );
  if (!fromDashboard) {
    selectedDatasetID = chartProp.properties[propKey].selectedDs.id;
    datasetGroupList = chartGroup.datasetGroupsList[selectedDatasetID];
    selectedFilterGroups = chartGroup.tabTile[propKey] || [];
  } else {
    selectedFilterGroups = dashBoardGroup.groups;
    datasetGroupList = Object.keys(chartGroup.groups);
  }
  console.log("selectedFilterGroups", selectedFilterGroups);
  //const
  let showFilters: any[] = [];

  //if (!fromDashboard) {
  if (selectedFilterGroups && selectedFilterGroups.length > 0) {
    selectedFilterGroups.forEach((grp: string) => {
      showFilters.push({
        id: grp,
        name: chartGroup.groups[grp].name,
        filters: chartGroup.groups[grp].filters,
        isCollapsed: chartGroup.groups[grp].isCollapsed,
      });
    });
  }
  //}

  const collapseOtherGroups = () => {
    if (selectedFilterGroups && selectedFilterGroups.length > 0) {
      selectedFilterGroups.forEach((grp: any) => {
        updateChartFilterGroupsCollapsed(grp, true);
      });
    }
  };

  const handleCBChange = (event: any) => {
    if (event.target.checked) {
      if (fromDashboard) {
        addDashBoardFilterGroupTabTiles(event.target.name);
        updateDashBoardGroups(event.target.name);

        let tabTilesList: any = [];
        let groupDataSetId = chartGroup.groups[event.target.name].dataSetId;

        [...tileState.tileList[tabTileProps.selectedTabId]].forEach(
          (item: any) => {
            if (chartProp.properties[item].selectedDs.id === groupDataSetId) {
              tabTilesList.push(item);
            }
          }
        );

        setDashBoardFilterGroupsTabTiles(event.target.name, tabTilesList);
      } else {
        updateChartFilterSelectedGroups(propKey, event.target.name);
      }
    } else {
      if (fromDashboard) {
        deleteDashBoardSelectedGroup(event.target.name);

        deleteDashBoardSelectedGroupAllTabTiles(event.target.name);
      } else {
        deleteChartFilterSelectedGroup(
          propKey,
          selectedFilterGroups.findIndex(
            (name: string) => name === event.target.name
          )
        );
      }
    }
  };

  const getNewGroupName = (numOfGroups: number): string => {
    let isUnique = true;

    let newName = "Filter Group " + numOfGroups;

    Object.keys(chartGroup.groups).forEach((grp) => {
      if (chartGroup.groups[grp].name === newName) {
        isUnique = false;
        return;
      }
    });

    if (!isUnique) {
      return getNewGroupName(numOfGroups + 1);
    } else {
      return newName;
    }
  };

  // name list of selected filter grops in tile
  const [filterGroupNamelist, setFilterGroupNamelist] = useState<string[]>([
    "No group selected",
  ]);

  /* getting names of selected filter groups to store the names in filterGropNamelist 
	state  to give it as a value for choose group dropdown when user select or deselect filtergrops in tile */
  useEffect(() => {
    if (chartGroup?.tabTile[propKey]) {
      let temp = chartGroup?.tabTile[propKey].map((el: any) => {
        return chartGroup.groups[el].name;
      });
      if (temp.length === 0) {
        setFilterGroupNamelist(["No group selected"]);
      } else {
        setFilterGroupNamelist(temp);
      }
    }
  }, [chartGroup?.tabTile[propKey]]);

  // name list of selected filter grops in dashboard

  const [dashboardFilterGroupNamelist, setDashboardFilterGroupNamelist] =
    useState<string[]>(["No group selected"]);

  /* getting names of selected filter group of dashboard to store the names in dashboardFilterGroupNamelist 
	state  to give it as a value for choose group dropdown of dashboard when user select or deselect filtergrops in dashboard */


	useEffect(() => {
		if (dashBoardGroup.groups.length > 0) {
			const selectedDashboardFilterGropsNames = dashBoardGroup.groups.map((el: any) => {
				return chartGroup.groups[el].name;
			});
			setDashboardFilterGroupNamelist(selectedDashboardFilterGropsNames);
		} else {
			setDashboardFilterGroupNamelist(["No group selected"]);
		}
	}, [dashBoardGroup.groups]);
  const deleteFilterGroup = () => {
    if (!filterGroupToBeDeleted.current) return;
    if (datasetGroupList.length === 1) {
      setAnchorEl(null);
      setOpenDialog(false);
      setOpenAlert(true);
      return;
    }
    deleteFilterGroupFromChartFilterGroup(filterGroupToBeDeleted.current.id);
    deleteFilterGroupFromDashBoardFilterGroup(
      filterGroupToBeDeleted.current.id
    );
    filterGroupToBeDeleted.current = null;
    setOpenDialog(false);
    setAnchorEl(null);
  };
	const MenuProps = {
		PaperProps: {
			style: {
				width: 180,
			},
		},
	};
	return (
		<div className="chartFilterGroupContainer">
			<div className="chartFilterGroupcontainersHead">
				<div>
					<span className="chooseGroupDropDownContainer">
						<Typography sx={{ fontSize: "14px", textAlign: "left", color: "grey" }}>
							Choose Group
						</Typography>
						{fromDashboard ? (
							<Tooltip title="Hide">
								<KeyboardArrowUpIcon
									sx={{
										fontSize: "16px",
										float: "right",
										color: "grey",
										marginRight: "10px",
									}}
									// onClick={() => setShowDashBoardFilter(false)}
								/>
							</Tooltip>
						) : null}
					</span>
					<FormControl sx={{ mt: 1, width: fromDashboard ? 212 : 175 }}>
						<Select
							labelId="demo-multiple-checkbox-label"
							id="demo-multiple-checkbox"
							multiple
							value={
								fromDashboard ? dashboardFilterGroupNamelist : filterGroupNamelist
							}
							renderValue={selected => selected.join(", ")}
							MenuProps={MenuProps}
							sx={{
								height: "1.8rem",
								fontSize: "13px",
								color: "grey",

								"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
									borderColor: "#2bb9bb",
									color: "#2bb9bb",
								},

								"&.Mui-focused .MuiSvgIcon-root ": {
									fill: "#2bb9bb !important",
								},
							}}
						>
							{datasetGroupList?.map((item: string) => (
								<MenuItem
									key={item}
									value={chartGroup.groups[item].name}
									sx={{
										height: "30px",
										padding: "2px 1rem 2px 0.5rem",
										"&.Mui-selected": {
											backgroundColor: "rgba(43, 185, 187, 0.1)", // Selected option bg color
										},											
										"&.Mui-selected:hover": {
											backgroundColor: "rgba(43, 185, 187, 0.2)", // Hover bg color for selected option
										},
										"& .MuiTypography-root": {
											fontSize: "14px",
										},
									}}
								>
									<Checkbox
										disabled={
											fromDashboard
												? tabState.tabs[tabTileProps.selectedTabId]
														.tilesInDashboard.length > 0
													? false
													: true
												: false
										}
										checked={selectedFilterGroups.includes(item)}
										name={item}
										style={{
											transform: "scale(0.7)",
											paddingRight: "0px",
											marginRight: "10px",
										}}
										sx={{
											"&.Mui-checked": {
												color: "#2bb9bb",
											},
										}}
										onChange={e => handleCBChange(e)}
									/>
									<ListItemText primary={chartGroup.groups[item].name} />
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</div>

				{!fromDashboard ? (
					<div
						title="Create New Filter Group"
						className="addFilterGroupButton"
						onClick={e => {
							if (!(selectedFilterGroups && selectedFilterGroups.length > 0)) {
								addChartFilterTabTileName(selectedDatasetID, propKey);
							}

							//let newGroupName = "Filter Group " + ((datasetGroupList?.length + 1) || 1);
							let numOfGroups = 0;

							if (
								Object.keys(chartGroup.groups) &&
								Object.keys(chartGroup.groups).length > 0
							) {
								numOfGroups = Object.keys(chartGroup.groups).length;
							}

							let newGroupName = getNewGroupName(numOfGroups + 1);
							let groupId =
								selectedDatasetID +
								"_" +
								newGroupName +
								new Date().getMilliseconds();
							addChartFilterGroupName(selectedDatasetID, groupId, newGroupName);
							collapseOtherGroups();
							updateChartFilterSelectedGroups(propKey, groupId);
						}}
					>
						<AddIcon />
					</div>
				) : null}
			</div>
			<div>
				{showFilters.map((group: groupProp, indx: number) => (
					<ChartFilterGroups
						key={indx}
						propKey={propKey}
						group={group}
						fromDashboard={fromDashboard}
					></ChartFilterGroups>
				))}
			</div>
      		
      <AcceptRejectDialog
        open={openDialog}
        acceptFunction={deleteFilterGroup}
        rejectFunction={() => {
          setOpenDialog(false);
          filterGroupToBeDeleted.current = null;
        }}
        closeFunction={() => {
          filterGroupToBeDeleted.current = null;
          setOpenDialog(false);
        }}
        heading="Are You Sure?"
        messages={[
          {
            text: `Are you sure you want to delete ${
              filterGroupToBeDeleted.current?.name || "This Filter Group"
            }?`,
            highlights: [
              {
                substring:
                  filterGroupToBeDeleted.current?.name || "This Filter Group",
                style: { fontWeight: "bold" },
              },
            ],
          },
          {
            text: "This action cannot be undone.",
            // style: { color: "yellow" },
          },
        ]}
        acceptText="Delete"
        rejectText="Cancel"
      />

      <NotificationDialog
        openAlert={openAlert}
        severity={"warning"}
        testMessage={
          "Cannot delete filterGroup. Atleast one filter group should be there"
        }
        onCloseAlert={() => {
          setOpenAlert(false);
          setAnchorEl(null);
        }}
      />
    </div>
  );

};

const mapStateToProps = (
  state: ChartPropertiesStateProps &
    ChartFilterGroupStateProps &
    TileRibbonStateProps &
    any
) => {
  return {
    chartProp: state.chartProperties,
    chartGroup: state.chartFilterGroup,
    dashBoardGroup: state.dashBoardFilterGroup,
    tileState: state.tileState,
    tabTileProps: state.tabTileProps,
    tabState: state.tabState,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
  return {
    setMenu: (menu: string) => dispatch(setSelectedControlMenu(menu)),
    addChartFilterGroupName: (
      selectedDatasetID: string,
      groupId: string,
      groupName: string
    ) =>
      dispatch(addChartFilterGroupName(selectedDatasetID, groupId, groupName)),

    updateChartFilterGroupsCollapsed: (groupId: string, collapsed: boolean) =>
      dispatch(updateChartFilterGroupsCollapsed(groupId, collapsed)),

    addChartFilterTabTileName: (
      selectedDatasetID: string,
      tabTileName: string
    ) => dispatch(addChartFilterTabTileName(selectedDatasetID, tabTileName)),

    updateChartFilterSelectedGroups: (groupId: string, filters: any) =>
      dispatch(updateChartFilterSelectedGroups(groupId, filters)),

    deleteChartFilterSelectedGroup: (tabTileName: string, groupIndex: number) =>
      dispatch(deleteChartFilterSelectedGroup(tabTileName, groupIndex)),

    updateDashBoardGroups: (groupId: string) =>
      dispatch(updateDashBoardGroups(groupId)),

    deleteDashBoardSelectedGroup: (groupId: string) =>
      dispatch(deleteDashBoardSelectedGroup(groupId)),

    deleteDashBoardSelectedGroupAllTabTiles: (groupId: string) =>
      dispatch(deleteDashBoardSelectedGroupAllTabTiles(groupId)),
    addDashBoardFilterGroupTabTiles: (groupId: string) =>
      dispatch(addDashBoardFilterGroupTabTiles(groupId)),
    setDashBoardFilterGroupsTabTiles: (
      groupId: string,
      selectedTabTiles: any
    ) => dispatch(setDashBoardFilterGroupsTabTiles(groupId, selectedTabTiles)),
    deleteFilterGroupFromChartFilterGroup: (filterGroupID: string) =>
      dispatch(deleteFilterGroupFromChartFilterGroup(filterGroupID)),
    deleteFilterGroupFromDashBoardFilterGroup: (filterGroupID: string) =>
      dispatch(deleteFilterGroupFromDashBoardFilterGroup(filterGroupID)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChartFilterGroupsContainer);
