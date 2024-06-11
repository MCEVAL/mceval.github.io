import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib"

import React, { useCallback, useMemo, useRef, useEffect, useState } from "react"
import Grid from '@mui/material/Grid';
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css" // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css" // Theme
import "./LeaderboardComp.css"
import Box from "@mui/material/Box"
import Slider from "@mui/material/Slider"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"

import {
  getColumnDefs,
  getDateMarksFromTimestamps,
  getLeaderboard,
} from "./leaderboardLib"

import "./LeaderboardAgGrid.css"
import styles from "./Leaderboard.module.css"
const FONT_FAMILY = "'JetBrains Mono', monospace, 0.3em"

const Leaderboard = React.memo(function LeaderboardComponent(props: any) {
  // args from Streamlit
  let args = props.args;
  const [{ performances, models, date_marks, tasks}, page_idx]= args;


  const [isMobileCompressed, setIsMobileCompressed] = useState(window.innerWidth < 768);

  // const [data, setData] = useState(args);

  // console.log(props)
  // console.log(performances)
  // console.log(models)




  const modelsDict = useMemo(() => {
    return models.reduce((acc: any, model: any) => {
      acc[model.model_name] = model
      return acc
    }, {})
  }, [models])


  // ********* DateSlider *********

  // const dateMarks = getDateMarksFromTimestamps(date_marks)
  const [dateMarks, setDateMarks] = React.useState(() => getDateMarksFromTimestamps(date_marks));

  useEffect(() => {
    // console.log('Component re-rendered due to changes in date_marks:', date_marks);
    setDateMarks(getDateMarksFromTimestamps(date_marks));
  }, [date_marks]);

  const [dateStartAndEnd, setDateStartAndEnd] = React.useState<number[]>([
    dateMarks[4].value, // Right now, this is 2023-05-01
    dateMarks[dateMarks.length - 1].value,
  ])


  const dateSliderHandleChange = (
    event: Event,
    newValue: number | number[]
  ) => {
    const newValueArray = newValue as number[]
    setDateStartAndEnd(newValueArray)

    const newDf = getLeaderboard(
      performances,
      models,
      newValueArray[0],
      newValueArray[1]
    )

    const newRowData: any[] = []

    const res = (gridRef.current as any).api.forEachNode(function (node: any) {
      // Identify by the "Model" field
      const dfData = newDf.find((row) => row["Model"] === node.data["Model"])!

      const newData = node.data
      for (const key in dfData) {
        newData[key] = dfData[key as keyof typeof dfData]
      }

      newRowData.push(newData)
    })

    const resTransaction = (gridRef.current as any).api.applyTransaction({
      update: newRowData,
    })
  }

  function dateLabelFormat(value: number) {
    const index = dateMarks.findIndex((mark) => mark.value === value)
    return dateMarks[index].label
  }

  const dateAriaText = dateLabelFormat


  const leaderboard = useMemo(() => {
    return getLeaderboard(
      performances,
      models,
      //dateStartAndEnd[0],
      //dateStartAndEnd[1]
      0,0
    );
  }, [performances, models, dateStartAndEnd]);



  const numProblems = performances.filter(
    (result: any) =>
      //result["date"] >= dateStartAndEnd[0] &&
      //result["date"] <= dateStartAndEnd[1]
      result["date"] >= 0 &&
      result["date"] <= 1
  ).length;


  // df is an array of objects
  // Get the columns of df
  const columnNames = useMemo(() => {
    return Object.keys(leaderboard[0])
  }, [leaderboard]);

  // Object.keys(leaderboard[0])

  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
    }
  }, [])

  const rowClassRules = useMemo(() => {
    return {
      [styles.leaderboardModelContaminated]: (params: any) =>
        params.data["Contaminated"],
    }
  }, [])

  const gridRef = useRef()
  const [rowData, setRowData] = useState(leaderboard)

  useEffect(() => {
    // console.log('Component re-rendered due to changes in leaderboard:', leaderboard);
    setRowData(leaderboard);
  }, [leaderboard]);

  const [columnDefs, setColumnDefs] = useState(
    getColumnDefs(columnNames, modelsDict, page_idx)
  )

  useEffect(() => {
    // console.log('Component re-rendered due to changes in column:', columnNames, modelsDict);
    setColumnDefs(getColumnDefs(columnNames, modelsDict, page_idx));
  }, [columnNames, modelsDict]);

  // console.log(columnNames, modelsDict);
  // ********* Styles and return *********

  const muiTheme = createTheme({
    palette: {
      mode: props.theme.base,
    },
    typography: {
      fontFamily: FONT_FAMILY,
    },
  })

  const agGridTheme =
    props.theme.base === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz"

  const gridStyle = useMemo(
    () => ({
      //height: `${Math.min(42 * rowData.length, 1500)}px`, // Adjust 600 to your desired max height
      height:`${Math.min(50 * rowData.length, 1000)}px`,
      // height: "100%",
      "--ag-font-family": FONT_FAMILY,
      // minWidth: "760px",
      // maxWidth: "100%",
      // height: "1250px",
      overflow: "auto",
      margin: "auto",
    }),
    [rowData]
  )

  const autoSizeStrategy = {
    type: 'fitCellContents'
  }

  let groupDisplayType = 'groupRows';
  if (page_idx !== "infilling"){
    groupDisplayType = 'custom'
  }


  let message = `${numProblems} problems selected in the current time window.`;

  if (numProblems === 0) {
    message = "No problems selected in the current time window. Please select a different time window. ";
  }
  else if (numProblems < 100) {
    message += "Less than 100 problems selected. We recommend a larger time-window to get a more accurate leaderboard.";
  }
  else {
    message += "You can change start or end date to change the time window.";
  }

  message += "<br><br>We estimate cutoff dates based on release date and performance variation. Feel free to adjust the slider to see the leaderboard at different time windows. Please offer feedback if you find any issues!"


//display: numProblems === 0 ? "none" : "flex",
  return (
    <div style={{ width: "100%", height: "100%" }}>
      
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center",  height: "100%", width: "100%" }} id='flexGridWrapper'>
          <div style={{ flexGrow: "1", height: "100%", width: "100%", display: "flex", justifyContent: "center" }}> {/* Center the grid */}
            <div style={gridStyle} className={agGridTheme}>
              {/* @ts-ignore */}

              <AgGridReact
                
                ref={gridRef}
                rowData={rowData}
                columnDefs={columnDefs}
                groupDisplayType={groupDisplayType}
                defaultColDef={defaultColDef}
                rowClassRules={rowClassRules}
                rowSelection={"multiple"}
                enableCellTextSelection={true}
                tooltipShowDelay={0}
                autoSizeStrategy={autoSizeStrategy}
                onGridReady={(params) => {
                  params.api.sizeColumnsToFit()
                  params.api.autoSizeAllColumns(false)
                  params.api.resetRowHeights()
                }}
                onGridSizeChanged={(params) => {
                  params.api.sizeColumnsToFit()
                  params.api.autoSizeAllColumns(false)
                  params.api.resetRowHeights()
                }}
                onGridColumnsChanged={(params) => {
                  params.api.sizeColumnsToFit()
                  params.api.autoSizeAllColumns(false)
                  params.api.resetRowHeights()
                }}
                onRowDataUpdated={(params) => {
                  params.api.sizeColumnsToFit()
                  params.api.autoSizeAllColumns(false)
                  params.api.resetRowHeights()
                }}

              />
            </div>
          </div>
        </div>
      </div>
    </div >
  )
});

// // This line is changed from the original streamlit code
// export default withStreamlitConnection(Leaderboard)
export default Leaderboard
