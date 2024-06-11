import React from "react"
import styles from "./Leaderboard.module.css"
import { exec } from "child_process"

function mean(array: Array<number>) {
  return array.reduce((a, b) => a + b, 0) / array.length
}

function formatNumber(number: number) {
  return Number(number.toFixed(1))
}

function get_pass_at_1(
  results_df: Array<any>,
  model: string,
  start: number,
  end: number
) {
  // model and date filter
  /*
  const results = results_df.filter(
    (result) =>
      result["model"] === model &&
      result["date"] >= start &&
      result["date"] <= end
  )
  */
  const results = results_df.filter(
    (result) =>
      result["model"] === model
  )
  const dictionary: { [key: string]: any } = {};

  if (results.length > 0 && results[0] !== null) {
    Object.keys(results[0]).forEach(key => {
      dictionary[key] = parseFloat(mean(results.map((result) => result[key])).toFixed(3));
    });
  }else{
    console.log(`${model}: 不存在`);
  }

  return {
    dictionary
  }
}

function getLeaderboard(
  performances: Array<any>,
  models: Array<any>,
  start: number,
  end: number
) {
  return models
    //.filter((model) => model.release_date)
    .map((model) => {
      const { dictionary } = get_pass_at_1(
        performances,
        model.model_name,
        0,
        0
      )
      let output: { [key: string]: any } = {}
      output["Model"] = model.model_name
      //output["Estimated Cutoff For LiveCodeBench"] = "Estimated Cutoff For LiveCodeBench: " + new Date(model.release_date).toLocaleDateString()
      output["Contaminated"] = false 
      Object.keys(dictionary).forEach(key => {
        if (key != "model" && key != "date"){
          output[key] = dictionary[key]
        }
      });
      return output
    })
    .sort((a, b) => b["AVG"] - a["AVG"])
    .reduce(
      (
        acc: {
          results: Array<typeof model & { Rank: number | null }>
          rank: number
        },
        model
      ) => {
        let rank = null
        rank = acc.rank
        if (acc.results.length>0 && model.AVG != acc.results[acc.results.length - 1].AVG){
          acc.rank += 1
          rank = acc.rank
        }
        acc.results.push({
          Rank: rank,
          ...model,
        })
        return acc
      },
      { results: [], rank: 1 }
    ).results
}

function getDateMarksFromModels(models: Array<any>) {
  const modelDates = models
    .filter((model) => model.release_date)
    .map((model) => model.release_date)

  const uniqueDates = [
    // @ts-ignore
    ...new Set(modelDates),
    new Date("2024-01-01").getTime(),
  ]

  return uniqueDates
    .map((date) => ({
      value: date,
      label: new Date(date).toLocaleDateString(undefined, {
        timeZone: "UTC",
      }),
    }))
    .sort((a, b) => a.value - b.value)
}

function getDateMarksFromTimestamps(timestamps: Array<number>) {
  return timestamps.map((timestamp) => ({
    value: timestamp,
    label: new Date(timestamp).toLocaleDateString(undefined, {
      timeZone: "UTC",
    }),
  }))
}

function getColumnDefs(columnNames: Array<string>, modelsDict: any, page_idx : string) {
  // Format the columns into array of { field: "column_name" }
  return columnNames
    .map((column_name) => {
        if (column_name == "Model"){
          return {
            field: column_name,
            suppressMovable: true,
            cellClass: 'suppress-movable-col',
            flex: 2,
            pinned : "left",
            tooltipField: "Estimated Cutoff For LiveCodeBench",
          }
        }
        else if (column_name == "Rank"){
          return {
            field: column_name,
            suppressMovable: true,
            cellClass: 'suppress-movable-col',
          }
        }
        else if (column_name == "Estimated Cutoff For LiveCodeBench"){
          return null
        }
        else if (column_name == "Contaminated"){
          return null
        }
        else {
          let mwidth = 75
          if (column_name.length > 4){
            mwidth = 95
          }else if (column_name.length <3){
            mwidth = 70
          }
          if (column_name == "Scheme" || column_name == "VimL" || column_name == "Ruby"){
            mwidth = 105
          }
          // console.log("column_name", column_name, column_name.length, mwidth)
          return {
            field: column_name,
              minWidth: mwidth,
          }
        }
      }
    )
    .filter((columnDef) => columnDef !== null)
}

export { getDateMarksFromTimestamps, getLeaderboard, getColumnDefs }
