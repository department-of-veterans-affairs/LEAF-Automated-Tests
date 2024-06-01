/**
 * Form Query Helper
 * 
 * LeafFormQuery is a globally available object on LEAF sites, and is an interface for ./api/form/query
 * Key features include:
 *  - Automatically splits large queries into multiple small ones, to improve UX
 *  - Mechanism to report progress (onProgress)
 *  - Programmatically build query
 */
var LeafFormQuery = function () {
  let query = {};
  let successCallback = null;
  let progressCallback = null;
  let rootURL = "";
  let useJSONP = false;
  let extraParams = "";
  let results = {};
  let batchSize = 500;
  let abortSignal;
  let firstRun = true; // keep track of query limit state, to align with user intent
  let origLimit, origLimitOffset;

  clearTerms();

  /**
   * Reset search terms
   * @memberOf LeafFormQuery
   */
  function clearTerms() {
    query = {};
    query.terms = [];
    query.joins = [];
    query.sort = {};
    query.getData = [];
  }

  /**
   * Add a new search term
   * @param {string} id - columnID
   * @param {string} operator - SQL comparison operator
   * @param {string} match - search term to match on
   * @param {string} gate - AND or OR gate
   * @memberOf LeafFormQuery
   */
  function addTerm(id = "title", operator = "=", match = "**", gate = "AND") {
    query.terms.push({id, operator, match, gate});
  }

  /**
   * Add a new search term for data table
   * @param {string} id - columnID / 'data' to search data table / 'dependencyID' to search records_dependencies data, matching on 'filled'
   * @param {string|number} indicatorID - indicatorID / dependencyID / "0" to search all indicators
   * @param {string} operator - SQL comparison operator
   * @param {string} match - search term to match on
   * @param {string} gate - AND or OR gate
   * @memberOf LeafFormQuery
   */
  function addDataTerm(id = "title", indicatorID = "0", operator = "=", match = "**", gate = "AND") {
    query.terms.push({id, indicatorID, operator, match, gate});
  }

  /**
   * Import query generated by formSearch
   * @param {object} - JSON query object generated by formSearch. 
   * Destructured properties are arrays: terms, joins, getData.  getData renamed to avoid collision w class method
   * @memberOf LeafFormQuery
   */
  function importQuery({ terms = [], joins = [], getData: getIndData = [] } = {}) {
    terms.forEach(t => {
      const {id, indicatorID, operator, match, gate} = t;
      const numTermProperties = (Object.keys(t).length);
      switch (numTermProperties) {
        case 3:
          addTerm(id, operator, match);
          break;
        case 4:
          if (gate === undefined) { //pre gate backwards compat, LEAF library
            addDataTerm(id, indicatorID, operator, match);
          } else {
            addTerm(id, operator, match, gate);
          }
          break;
        case 5:
          addDataTerm(id, indicatorID, operator, match, gate);
          break;
        default:
          console.log("Format error");
          break;
      }
    });
    joins.forEach(j => join(j));
    getIndData.forEach(ind => getData(ind));
  }

  /**
   * Limit number of results
   * @param {number} offset / limit
   * @param {number} limit (optional)
   * @memberOf LeafFormQuery
   */
  function setLimit(offset = 50, limit = 0) {
    firstRun = true;
    if (limit === 0) {
      query.limit = offset;
    } else {
      query.limit = limit;
      setLimitOffset(offset);
    }
  }

  /**
   * Limit number of results
   * @param {number} offset
   * @memberOf LeafFormQuery
   */
  function setLimitOffset(offset = 50) {
    query.limitOffset = offset;
  }

  /**
   * Join table
   * @param {string} table
   * @memberOf LeafFormQuery
   */
  function join(table = "") {
    if (table !== "" && query.joins.indexOf(table) == -1) {
      query.joins.push(table);
    }
  }

  /**
   * getData includes data associated with $indicatorID in the result set
   * @param {string|number|array} indicatorID
   * @memberOf LeafFormQuery
   */
  function getData(indicatorID = "") {
	if(Array.isArray(indicatorID)) {
		indicatorID.forEach(id => {
			getData(id);
		});
	}
	else if (indicatorID !== "" && query.getData.indexOf(indicatorID) == -1) {
	    query.getData.push(indicatorID);
	}
  }

  /**
   * @param {string} column
   * @param {string} direction
   * @memberOf LeafFormQuery
   */
  function sort(column = "date", direction = "DESC") {
    query.sort.column = column;
    query.sort.direction = direction;
  }

  /**
   * Update an existing search term
   * @param {string} id - columnID or "stepID"
   * @param {string} operator - SQL comparison operator
   * @param {string} match - search term to match on
   * @param {string} gate - AND or OR gate
   * @memberOf LeafFormQuery
   */
  function updateTerm(id = "title", operator = "=", match = "**", gate = "AND") {
    for (let i in query.terms) {
      if (query.terms[i].id == id && query.terms[i].operator == operator) {
        query.terms[i].match = match;
        query.terms[i].gate = gate;
        return;
      }
    }
    addTerm(id, operator, match, gate);
  }

  /**
   * Update an existing data search term
   * @param {string} id - columnID / 'data' to search data table / 'dependencyID' to search records_dependencies data, matching on 'filled'
   * @param {string} indicatorID - indicatorID / dependencyID
   * @param {string} operator - SQL comparison operator
   * @param {string} match - search term to match on
   * @param {string} gate - AND or OR gate
   * @memberOf LeafFormQuery
   */
  function updateDataTerm(id = "title", indicatorID = "0", operator = "=", match = "**", gate = "AND") {
    for (let i in query.terms) {
      if (
        query.terms[i].id == id &&
        query.terms[i].indicatorID == indicatorID &&
        query.terms[i].operator == operator
      ) {
        query.terms[i].match = match;
        query.terms[i].gate = gate;
        return;
      }
    }
    addDataTerm(id, indicatorID, operator, match, gate);
  }

  /**
   * Add extra parameters to the end of the query API URL
   * @param {string} params
   */
  function setExtraParams(params = "") {
    extraParams = params;
  }

  /**
   * @param {function} funct - Success callback (see format for jquery ajax success)
   * @memberOf LeafFormQuery
   */
  function onSuccess(funct = {}) {
    successCallback = funct;
  }

  /**
   * onProgress assigns a callback to be called on every getBulkData() iteration
   * @param {function} funct - funct(int Progress). Progress is the number of records that have been processed
   * @memberOf LeafFormQuery
   */
  function onProgress(funct = {}) {
    progressCallback = funct;
  }

  /**
   * setAbortSignal assigns a DOM AbortSignal to determine whether further getBulkData() iterations should be cancelled
   * @param {AbortSignal} signal
   * @memberOf LeafFormQuery
   */
  function setAbortSignal(signal) {
    abortSignal = signal;
  }

  /**
   * encodeReadableURI provides minimal character URI encoding, prioritizing readable URLs
   */
  function encodeReadableURI(url) {
    url = url.replaceAll('+', '%2b');
    return url;
  }

  /**
   * Execute search query in chunks
   * @param {number} limitOffset Used in subsequent recursive calls to track current offset
   * @returns Promise resolving to query response
   * @memberOf LeafFormQuery
   */
  function getBulkData(limitOffset = 0) {
    if (limitOffset === 0) {
      results = {};
    }
    limitOffset = parseInt(limitOffset);
    query.limit = batchSize;
    query.limitOffset = limitOffset;

    let el = document.createElement("div");
    el.innerHTML = JSON.stringify(query);

    const queryUrl = el.innerText;
    const dataType = useJSONP ? "jsonp" : "json";
    const urlParamJSONP = useJSONP ? "&format=jsonp" : "";
    return $.ajax({
      type: "GET",
      url: `${rootURL}api/form/query?q=${encodeReadableURI(queryUrl + extraParams + urlParamJSONP)}`,
      dataType: dataType,
      error: (err) => console.log(err)
    }).then((res, resStatus, resJqXHR) => {
      results = Object.assign(results, res);

      if ((Object.keys(res).length == batchSize
                || resJqXHR.getResponseHeader("leaf-query") == "continue")
            && !abortSignal?.aborted) {
        let newOffset = limitOffset + batchSize;
        if (typeof progressCallback == "function") {
          progressCallback(newOffset);
        }
        return getBulkData(newOffset);
      } else {
        if (typeof successCallback == "function") {
          successCallback(results, resStatus, resJqXHR);
        }
        return results;
      }
    });
  }

  /**
   * Execute search query
   * @returns $.ajax() object
   * @memberOf LeafFormQuery
   */
  function execute() {
    if(firstRun) {
        firstRun = false;
        origLimit = query.limit;
        origLimitOffset = query.limitOffset;
    } else {
        query.limit = origLimit;
        query.limitOffset = origLimitOffset;
    }

    if (query.getData != undefined && query.getData.length == 0) {
      delete query.getData;
    }
    if (query.limit == undefined || isNaN(query.limit) || parseInt(query.limit) > 1000 || !isFinite(query.limit)) {
      return getBulkData();
    }

    let el = document.createElement("div");
    el.innerHTML = JSON.stringify(query);
    
    const queryUrl = el.innerText;
    const dataType = useJSONP ? "jsonp" : "json";
    const urlParamJSONP = useJSONP ? "&format=jsonp" : "";
    return $.ajax({
      type: "GET",
      url: `${rootURL}api/form/query?q=${encodeReadableURI(queryUrl + extraParams + urlParamJSONP)}`,
      dataType: dataType,
      success: successCallback,
      error: (err) => console.log(err)
    });
  }

  return {
    clearTerms,
    addTerm,
    addDataTerm,
    importQuery,
    getQuery: () => query,
    getData,
    updateTerm,
    updateDataTerm,
    setQuery: (inc) => query = inc,
    setLimit,
    setLimitOffset,
    setRootURL: (url) => rootURL = url,
    getRootURL: () => rootURL,
    useJSONP: (state) => useJSONP = state,
    setExtraParams,
    join,
    sort,
    onSuccess,
    onProgress,
    setAbortSignal,
    execute
  };
};
