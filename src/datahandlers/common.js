import DataHandler from '../utils/DataHandler';

let dataHandlers = {
  /**
   * Given componentData or pipeLine data containing one or more series of data
   * Return each series as an array of objects where x is defined by specifying function 
   * and y is defined by a field name
   */
  fieldsToXYSeries: function (componentData, dashboardData, handler, e,  pipelineData) {
    let _data = pipelineData || componentData; 
    if(!_data.length) return [];
    if (!Array.isArray(_data[1])) _data = [_data]; // series data should be an array of array(s)
     
    let series = _data.map(series => {
      let x = handler.xField || 'x';
      let y = handler.field;
      return series.map(row => {
        return {y: row[handler.field], x: row[x]};
      });
      return series;
    });
    
    return series;
  },

  /**
   * Parse a field as a date.
   * handler = {
   *   field: 'field_name_to_parse',
   *   name: 'parseFieldDate'
   * }
   */
  parseDateField: function (componentData, dashboardData, handler, e, pipelineData) {
    let _data = pipelineData || componentData;
    return _data.map((row) => {
      row[handler.field] = Date.parse(row[handler.field]);
      return row;
    });
  },

  /**
   * Sometimes, as in the case of multi-components
   * we just want the event value from the filter
   * In this case, we return it using the following dataHandler
   **/
  getEventReturn: function (componentData, dashboardData, handler, e, pipelineData) {
    if (e) {
      return e.value;
    }
    return componentData; // if there is no event, we maintain the component data
  },

  getXYByQueryData: function (componentData, dashboardData, handler, e, pipelineData) {
    if (dashboardData && dashboardData[handler.queryKey]) {
      let localData = dashboardData[handler.queryKey].result.records;
      let output =  localData.map(row => {
        // use handler fields to select fields to return!
        let newRow = {};
        newRow[handler.xField] = row[handler.xField];
        newRow[handler.yField] = row[handler.yField];
        return newRow;
      });
      return [output];
    } else {
      return [];
    }
  },

  groupByRange: function (componentData, dashboardData, handler, e, pipelineData) {
    let data = pipelineData || componentData;
    let finalOutput = []; // array of series
    data.forEach(series => {
      let outputSeries = []; // an array of objects
      for (let i in handler.ranges) {
        let lowerBound = handler.ranges[i][0];
        let upperBound = handler.ranges[i][1];
        let xVal = lowerBound + ' - ' + upperBound;
        let yVal = 0;
        let groupedRow = {};
        // loop through vals for current range, if it's in the range, add to the running yVal sum;
        series.forEach(row => {
          // if it's in the range, add it to this range's sum
          if (row[handler.xField] >= lowerBound && row[handler.xField] <= upperBound) {
            yVal += parseInt(row[handler.yField]);
          }
        })
        
        groupedRow[handler.xField] = xVal;
        groupedRow[handler.yField] = yVal;
        outputSeries.push(groupedRow);
      }
      // now add our transformed series to the array of series for output
      finalOutput.push(outputSeries);
    });

    if (handler.isPieChart) {
      return finalOutput[0] || [];
    } else {
      return finalOutput;
    }
  },

  /* Create an array of data series' for use in NVD3 single-line type horizontal barChart
   * expects single series of objects as ranges
   * input (an array of objects): 
   * [{foo: 'bar'}, {foo:'baz'}]
   * ouput: NV3 consumable array of series where each object is its own series
   */
  seriesFromRanges: function (componentData, dashboardData, handler, e, pipelineData) {
    let data = pipelineData || componentData;
    if (data.length > 0) {
      let output = data[0].map((row, i) => {
        let newSeries = {};
        let newRow = [];
        let newItem = {};

        newSeries.key = row[handler.xField];
        newSeries.color = handler.colors[i];
        newItem.label  = handler.xLabel;
        newItem.value = row[handler.yField];
        newRow.push(newItem);
        newSeries.values = newRow;
        
        return newSeries;
      });
      return output;
    } else {
      return data;
    }
  },
  
  // given array of series, series is array of objects
  // pass array of new keys, iterate series and rekey objects
  // @@TODO currently only handles single series of form:
  // [ {key: val}, {key: val}, {key: val} ]
  rekeySeries: function (componentData, dashboardData, handler, e, pipelineData) {
    let data = pipelineData || componentData;
    if (data.length > 0) {
      let output = data[0].map((row) => {
        let rekeyed = {};
        Object.keys(row).forEach((k, i) => {
          rekeyed[handler.newKeys[i]] = row[k];
        });
        return rekeyed;
      });
      return output;
    } else {
      return [];
    }
  },
  
  // given array of fields (handler.fields) parse field values as ints
  parseInts: function (componentData, dashboardData, handler, e, pipelineData) {
    let data = pipelineData || componentData;
    data.forEach(series => {
      series.forEach(row => {
        handler.fields.forEach(field => {
          row[field] = parseInt(row[field]);
        })
      })
    });
    return data;
  },
  
  // @@TODO this should go in nvd3 data handlers
  // NVD3 Pie charts need a different shape for data - make it so
  toPieChartSeries: function (componentData, dashboardData, handler, e, pipelineData) {
    let data = pipelineData || componentData;
    if (data.length > 0) {
      return data[0];
    }
    return [];
  },

  changeFieldNames: function (componentData, dashboardData, handler, e, pipelineData) {
    let data = pipelineData || componentData;
    let _data = [];
    data.forEach(series => {
      let _series
      _series = series.map((row) => {
        row[handler.xField] = handler.fields[row[handler.xField]];
        return row;
      });
      _data.push(_series); 
    });
    return _data;
  },
}

for (let k in dataHandlers) {
  DataHandler.set(k, dataHandlers[k]);
}

export default dataHandlers;
