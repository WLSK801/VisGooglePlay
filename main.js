
    let store = {}

    function loadData() {
      return Promise.all([
        d3.csv("rating_aggre.csv"),
        d3.csv("category_aggre.csv"),
        d3.csv("rating_category.csv"),
        d3.csv("name.csv"),
        d3.csv("price.csv"),
        d3.csv("rev_rating.csv")
      ]).then(datasets => {
        store.rating = datasets[0];
        store.category = datasets[1];
        store.rc = datasets[2];
        store.name = datasets[3];
        store.price = datasets[4];
        store.review = datasets[5];

        return store;
      })
    }
    // showing data
    loadData().then(showData);

    // showing data function
    function showData() {
      //Get the routes from our store variable
      let rating = store.rating;
      let category = store.category;
      let rc = store.rc;
      let name = store.name;
      let price = store.price;
      let review = store.review;
      // Compute the number of routes per airline.
      //let airlines = groupByAirline(store.routes);

      // Draw airlines barchart
      drawRatingChart(rating);
      drawCategoryChart(category);
      drawRCChart(rc);
      drawNameChart(name);
      drawPriceChart(price);
      //drawReviewChart1(review);
      drawReviewChart(review);

    }

    // Q6
    function drawReviewChart(review) {
      let installs = ['10-', '10+', '50+', '100+', '500+', '1,000+', '5,000+', '10,000+', '50,000+',
        '100,000+', '500,000+', '1,000,000+', '5,000,000+',
        '10,000,000+', '50,000,000+', '100,000,000+'
      ];

      let config = getReviewConfig();
      let scales = getReviewScales(review, config, installs);

      drawDotReviewChart(review, scales, config);
      drawAxesReviewChart(review, scales, config);

      let reviewMedian = d3.nest()
        .key(function(d) {
          return d['Installs'];
        })
        .rollup(function(v) {
          return d3.median(v.map(a => parseFloat(a["Rating_num"])));
        })
        .object(review);
      let reviewMedian_order = [];
      installs.map(function(d) {
        reviewMedian_order.push({
          'Install': d,
          'Median': reviewMedian[d]
        });
      });
      drawLineMedianChart(reviewMedian_order, scales, config);
    }



    // Config for size
    function getReviewConfig() {
      let width = 800;
      let height = 400;
      let margin = {
        top: 10,
        bottom: 60,
        left: 140,
        right: 10
      }
      //The body is the are that will be occupied by the bars.
      let bodyHeight = height - margin.top - margin.bottom
      let bodyWidth = width - margin.left - margin.right

      //The container is the SVG where we will draw the chart. In our HTML is the svg tah with the id AirlinesChart
      let container = d3.select("#Q6")
      container
        .attr("width", width)
      container
        .attr("height", height)

      return {
        width,
        height,
        margin,
        bodyHeight,
        bodyWidth,
        container
      }
    }

    // get scale
    function getReviewScales(review, config, installs) {

      let {
        bodyWidth,
        bodyHeight
      } = config;

      let yScale = d3.scaleLinear()
        .range([bodyHeight, 0])
        .domain([0, 6])

      let xScale = d3.scaleBand()
        .range([0, bodyWidth])
        .domain(installs)
        .padding(0.2)


      return {
        xScale,
        yScale
      }
    }

    // draw dot
    function drawDotReviewChart(review, scales, config) {

      let {
        margin,
        container
      } = config;
      let {
        xScale,
        yScale
      } = scales
      let bandSize = xScale.bandwidth();
      let circles = container.selectAll("circle");
      circles.data(review)
        .enter()
        .append('circle')
        .attr("r", 1)
        .attr("cx", function(d) {
          return xScale(d['Installs']) - bandSize / 4 + bandSize / 2 * Math.random();
        })
        .attr("cy", function(d) {
          return yScale(parseFloat(d['Rating_num']));
        })
        .attr("fill", "#2a5599")
        .style("transform",
          `translate(${margin.left + bandSize / 2}px,${margin.top}px)`
        )

    }

    // draw axes
    function drawAxesReviewChart(review, scales, config) {
      let {
        xScale,
        yScale
      } = scales
      let {
        container,
        margin,
        height,
        bodyWidth,
        bodyHeight
      } = config;
      let axisX = d3.axisBottom(xScale)
        .ticks(5)

      container.append("g")
        .style("transform",
          `translate(${margin.left}px,${height - margin.bottom}px)`
        )
        .call(axisX)
        .selectAll("text")
        .attr("transform", "rotate(30)")
        .style("text-anchor", "start");

      let axisY = d3.axisLeft(yScale)

      container.append("g")
        .style("transform",
          `translate(${margin.left}px,${margin.top}px)`
        )
        .call(axisY);
      container.append("text")
        .attr("transform",
          "translate(" + (margin.left + bodyWidth / 2) + " ," +
          (height - margin.bottom + 50) + ")")
        .style("text-anchor", "middle")
        .text("Installs");

      container.append("text")
        .attr("transform",
          "translate(" + (margin.left - 80) + " ," +
          (height - margin.bottom - bodyHeight / 2) + ")")
        .style("text-anchor", "middle")
        .text("Review Rating");
    }

    // draw median
    function drawLineMedianChart(reviewMedian, scales, config) {
      let {
        margin,
        container
      } = config;
      let {
        xScale,
        yScale
      } = scales;
      let bandSize = xScale.bandwidth();
      let body = container.append("g")
        .style("transform",
          `translate(${margin.left + bandSize / 2}px,${margin.top}px)`
        )

      var line = d3.line()
        .x(function(d) {
          return xScale(d['Install']);
        })
        .y(function(d) {
          return yScale(parseFloat(d['Median']));
        });
      body.append('path')
        .datum(reviewMedian)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "steelblue");
    }

    // Q5
    function drawPriceChart(price) {
      let config = getPriceConfig();
      let scales = getPriceScales(price, config);

      drawDotPriceChart(price, scales, config);
      drawAxesPriceChart(price, scales, config);
    }

    // Config for size
    function getPriceConfig() {
      let width = 500;
      let height = 400;
      let margin = {
        top: 10,
        bottom: 50,
        left: 120,
        right: 10
      }
      //The body is the are that will be occupied by the bars.
      let bodyHeight = height - margin.top - margin.bottom
      let bodyWidth = width - margin.left - margin.right

      //The container is the SVG where we will draw the chart. In our HTML is the svg tah with the id AirlinesChart
      let container = d3.select("#Q5")
      container
        .attr("width", width)
      container
        .attr("height", height)

      return {
        width,
        height,
        margin,
        bodyHeight,
        bodyWidth,
        container
      }
    }

    // get scale
    function getPriceScales(price, config) {
      let {
        bodyWidth,
        bodyHeight
      } = config;
      let maximunReview = d3.max(price.map(a => parseFloat(a["Reviews"])))

      let yScale = d3.scaleLinear()
        .range([bodyHeight, 0])
        .domain([0, 200000])

      let maximunPrice = d3.max(price.map(a => parseFloat(a["Price_num"])))
      let xScale = d3.scaleLinear()
        .range([0, bodyWidth])
        .domain([0, 40])


      return {
        xScale,
        yScale
      }
    }

    // draw dot
    function drawDotPriceChart(price, scales, config) {
      let {
        margin,
        container
      } = config;
      let {
        xScale,
        yScale
      } = scales;
      let circles = container.selectAll("circle");
      circles.data(price)
        .enter()
        .append('circle')
        .attr("r", 2)
        .attr("cx", function(d) {
          return xScale(parseFloat(d['Price_num']));
        })
        .attr("cy", function(d) {
          return yScale(parseFloat(d['Reviews']));
        })
        .attr("fill", "#2a5599")
        .style("transform",
          `translate(${margin.left}px,${margin.top}px)`
        )

    }

    // draw axes
    function drawAxesPriceChart(price, scales, config) {
      let {
        xScale,
        yScale
      } = scales
      let {
        container,
        margin,
        height,
        bodyWidth,
        bodyHeight
      } = config;
      let axisX = d3.axisBottom(xScale)
        .ticks(5)

      container.append("g")
        .style("transform",
          `translate(${margin.left}px,${height - margin.bottom}px)`
        )
        .call(axisX)

      let axisY = d3.axisLeft(yScale)

      container.append("g")
        .style("transform",
          `translate(${margin.left}px,${margin.top}px)`
        )
        .call(axisY);
      container.append("text")
        .attr("transform",
          "translate(" + (margin.left + bodyWidth / 2) + " ," +
          (height - margin.bottom + 30) + ")")
        .style("text-anchor", "middle")
        .text("Price in dollar($)");

      container.append("text")
        .attr("transform",
          "translate(" + (margin.left - 80) + " ," +
          (height - margin.bottom - bodyHeight / 2) + ")")
        .style("text-anchor", "middle")
        .text("Reviews");
    }

    // Q4
    function drawNameChart(name) {
      let config = getNameConfig();
      let scales = getNameScales(name, config);

      drawLineNameChart(name, scales, config);
      drawAxesNameChart(name, scales, config);
    }

    // Config for size
    function getNameConfig() {
      let width = 500;
      let height = 400;
      let margin = {
        top: 10,
        bottom: 50,
        left: 120,
        right: 10
      }
      //The body is the are that will be occupied by the bars.
      let bodyHeight = height - margin.top - margin.bottom
      let bodyWidth = width - margin.left - margin.right

      //The container is the SVG where we will draw the chart. In our HTML is the svg tah with the id AirlinesChart
      let container = d3.select("#Q4")
      container
        .attr("width", width)
      container
        .attr("height", height)

      return {
        width,
        height,
        margin,
        bodyHeight,
        bodyWidth,
        container
      }
    }

    // get scale
    function getNameScales(rating, config) {
      let {
        bodyWidth,
        bodyHeight
      } = config;
      let maximunCount = d3.max(rating.map(a => parseFloat(a["mean"])))

      let yScale = d3.scaleLinear()
        .range([bodyHeight, 0])
        .domain([0, maximunCount])

      let xScale = d3.scaleBand()
        .range([0, bodyWidth])
        .domain(rating.map(a => a["name_length_merge"]))
        .padding(0.2)

      return {
        xScale,
        yScale
      }
    }

    // draw name
    function drawLineNameChart(name, scales, config) {
      let {
        margin,
        container
      } = config;
      let {
        xScale,
        yScale
      } = scales;
      let bandSize = xScale.bandwidth();
      let body = container.append("g")
        .style("transform",
          `translate(${margin.left + bandSize / 2}px,${margin.top}px)`
        )

      var line = d3.line()
        .x(function(d) {
          return xScale(d['name_length_merge']);
        })
        .y(function(d) {
          return yScale(parseFloat(d['mean']));
        });
      body.append('path')
        .datum(name)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "steelblue");
      let circles = container.selectAll("circle");
      circles.data(name)
        .enter()
        .append('circle')
        .attr("r", 4)
        .attr("cx", function(d) {
          return xScale(d['name_length_merge']);
        })
        .attr("cy", function(d) {
          return yScale(parseFloat(d['mean']));
        })
        .attr("fill", "#2a5599")
        .style("transform",
          `translate(${margin.left + bandSize / 2}px,${margin.top}px)`
        )
    }

    // draw axes
    function drawAxesNameChart(name, scales, config) {
      let {
        xScale,
        yScale
      } = scales
      let {
        container,
        margin,
        height,
        bodyWidth,
        bodyHeight
      } = config;
      let axisX = d3.axisBottom(xScale)
        .ticks(5)

      container.append("g")
        .style("transform",
          `translate(${margin.left}px,${height - margin.bottom}px)`
        )
        .call(axisX)

      let axisY = d3.axisLeft(yScale)

      container.append("g")
        .style("transform",
          `translate(${margin.left}px,${margin.top}px)`
        )
        .call(axisY);
      container.append("text")
        .attr("transform",
          "translate(" + (margin.left + bodyWidth / 2) + " ," +
          (height - margin.bottom + 30) + ")")
        .style("text-anchor", "middle")
        .text("Words number for App name");

      container.append("text")
        .attr("transform",
          "translate(" + (margin.left - 80) + " ," +
          (height - margin.bottom - bodyHeight / 2) + ")")
        .style("text-anchor", "middle")
        .text("Reviews");
    }
    // Q6
    function reviewProcessing(review, installs) {

      let review_arr = [];
      for (let i = 0; i < installs.length; i++) {
        review_arr.push([]);
      }
      review.map(app => {
        review_arr[installs.indexOf(app['Installs'])].push(app['Rating_num']);
      })
      return review_arr;
    }

    function drawReviewChart1(review) {
      let installs = ['10-', '10+', '50+', '100+', '500+', '1,000+', '5,000+', '10,000+', '50,000+',
        '100,000+', '500,000+', '1,000,000+', '5,000,000+',
        '10,000,000+', '50,000,000+', '100,000,000+'
      ];
      let data_raw = reviewProcessing(review, installs);
      let myChart = echarts.init(document.getElementById('Q6'));
      let data = echarts.dataTool.prepareBoxplotData(data_raw);

      option = {

        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '10%',
          right: '10%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          name: 'Installs',
          data: data.axisData,
          boundaryGap: true,
          nameGap: 30,
          splitArea: {
            show: false
          },
          axisLabel: {
            formatter: function(value, index) {

              return installs[index];
            }
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          name: 'Review Rating',
          max: 6,
          splitArea: {
            show: true
          }
        },
        series: [{
            name: 'boxplot',
            type: 'boxplot',
            data: data.boxData,
            tooltip: {
              formatter: function(param) {
                return [
                  'upper: ' + param.data[5],
                  'Q3: ' + param.data[4],
                  'median: ' + param.data[3],
                  'Q1: ' + param.data[2],
                  'lower: ' + param.data[1]
                ].join('<br/>');
              }
            }
          },
          {
            name: 'outlier',
            type: 'scatter',
            data: data.outliers
          }
        ]
      };
      myChart.setOption(option);
    }

    // Q3
    function drawRCChart(rc) {



      let config = getRCConfig();
      let scales = getRCScales(rc, config);

      drawBarsRCChart(rc, scales, config);
      drawAxesRCChart(rc, scales, config);
    }

    // Config for size
    function getRCConfig() {
      let width = 800;
      let height = 400;
      let margin = {
        top: 10,
        bottom: 100,
        left: 120,
        right: 90
      }
      //The body is the are that will be occupied by the bars.
      let bodyHeight = height - margin.top - margin.bottom
      let bodyWidth = width - margin.left - margin.right

      //The container is the SVG where we will draw the chart. In our HTML is the svg tah with the id AirlinesChart
      let container = d3.select("#Q3")
      container
        .attr("width", width)
      container
        .attr("height", height)

      return {
        width,
        height,
        margin,
        bodyHeight,
        bodyWidth,
        container
      }
    }

    // get scale
    function getRCScales(rc, config) {
      let {
        bodyWidth,
        bodyHeight
      } = config;
      let maximunCount = d3.max(rc.map(a => parseFloat(a["mean"])))

      let yScale = d3.scaleLinear()
        .range([bodyHeight, 0])
        .domain([0, maximunCount])

      let xScale = d3.scaleBand()
        .range([0, bodyWidth])
        .domain(rc.map(a => a["Category"]))
        .padding(0.2)

      return {
        xScale,
        yScale
      }
    }

    // draw bar
    function drawBarsRCChart(rc, scales, config) {
      let {
        margin,
        container,
        bodyWidth,
        bodyHeight
      } = config;
      let {
        xScale,
        yScale
      } = scales
      let body = container.append("g")
        .style("transform",
          `translate(${margin.left}px,${margin.top}px)`
        )

      let bars = body.selectAll(".bar")
        .data(rc)

      //Adding a rect tag for each airline
      let color_arr = ["#2a5599", "#c33b37", "rgb(242, 202, 18)"]
      bars.enter().append("rect")
        .attr("width", xScale.bandwidth())
        .attr("x", (d) => xScale(d["Category"]))
        .attr("y", (d) => yScale(d["mean"]))
        .attr("height", (d) => bodyHeight - yScale(d["mean"]))
        .attr("fill", function(d) {
          if (d['rating'] == 'Mature 17+') {
            return color_arr[0];
          } else if (d['rating'] == 'Teen') {
            return color_arr[1];
          } else {
            return color_arr[2];
          }

        })
        .attr("data-legend", function(d) {
          return d['rating'];
        });

      let ordinal = d3.scaleOrdinal()
        .domain(["Mature 17+", "Teen", "Everyone 10+"])
        .range(color_arr);
      container.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", "translate(" + (bodyWidth + 60) + ",20)");
      let legendOrdinal = d3.legendColor()
        .shape("path", d3.symbol().type(d3.symbolTriangle).size(80)())
        .shapePadding(10)
        .scale(ordinal);
      container.select(".legendOrdinal")
        .call(legendOrdinal);

    }

    // draw axes
    function drawAxesRCChart(rc, scales, config) {
      let {
        xScale,
        yScale
      } = scales
      let {
        container,
        margin,
        height,
        bodyHeight,
        bodyWidth
      } = config;
      let axisX = d3.axisBottom(xScale)
        .ticks(5);

      container.append("g")
        .style("transform",
          `translate(${margin.left}px,${height - margin.bottom}px)`
        )
        .call(axisX)
        .selectAll("text")
        .attr("transform", "rotate(30)")
        .style("text-anchor", "start");

      let axisY = d3.axisLeft(yScale)

      container.append("g")
        .style("transform",
          `translate(${margin.left}px,${margin.top}px)`
        )
        .call(axisY);
      container.append("text")
        .attr("transform",
          "translate(" + (margin.left + bodyWidth) + " ," +
          (height - margin.bottom + 90) + ")")
        .style("text-anchor", "middle")
        .text("Category");

      container.append("text")
        .attr("transform",
          "translate(" + (margin.left - 80) + " ," +
          (height - margin.bottom - bodyHeight + 20) + ")")
        .style("text-anchor", "middle")
        .text("Review");
    }

    // Q2
    function drawRatingChart(ratings) {

      ratings.sort(function(a, b) {
        return d3.descending(parseFloat(a["mean"]), parseFloat(b["mean"]))
      })

      let config = getRatingConfig();
      let scales = getRatingScales(ratings, config);

      drawBarsRatingChart(ratings, scales, config);
      drawAxesRatingChart(ratings, scales, config);
    }

    // Config for size
    function getRatingConfig() {
      let width = 600;
      let height = 400;
      let margin = {
        top: 10,
        bottom: 50,
        left: 120,
        right: 10
      }
      //The body is the are that will be occupied by the bars.
      let bodyHeight = height - margin.top - margin.bottom
      let bodyWidth = width - margin.left - margin.right

      //The container is the SVG where we will draw the chart. In our HTML is the svg tah with the id AirlinesChart
      let container = d3.select("#Q1")
      container
        .attr("width", width)
      container
        .attr("height", height)

      return {
        width,
        height,
        margin,
        bodyHeight,
        bodyWidth,
        container
      }
    }

    // get scale
    function getRatingScales(rating, config) {
      let {
        bodyWidth,
        bodyHeight
      } = config;
      let maximunCount = d3.max(rating.map(a => parseFloat(a["mean"])))

      let xScale = d3.scaleLinear()
        .range([0, bodyWidth])
        .domain([0, maximunCount])

      let yScale = d3.scaleBand()
        .range([0, bodyHeight])
        .domain(rating.map(a => a["Content Rating"]))
        .padding(0.2)

      return {
        xScale,
        yScale
      }
    }

    // draw bar
    function drawBarsRatingChart(rating, scales, config) {
      let {
        margin,
        container
      } = config;
      let {
        xScale,
        yScale
      } = scales
      let body = container.append("g")
        .style("transform",
          `translate(${margin.left}px,${margin.top}px)`
        )

      let bars = body.selectAll(".bar")
        .data(rating)

      //Adding a rect tag for each airline
      bars.enter().append("rect")
        .attr("height", yScale.bandwidth())
        .attr("y", (d) => yScale(d["Content Rating"]))
        .attr("width", (d) => xScale(d["mean"]))
        .attr("fill", "#2a5599")
    }

    // draw axes
    function drawAxesRatingChart(rating, scales, config) {
      let {
        xScale,
        yScale
      } = scales
      let {
        container,
        margin,
        height,
        bodyHeight,
        bodyWidth
      } = config;
      let axisX = d3.axisBottom(xScale)
        .ticks(5);

      container.append("g")
        .style("transform",
          `translate(${margin.left}px,${height - margin.bottom}px)`
        )
        .call(axisX)

      let axisY = d3.axisLeft(yScale)

      container.append("g")
        .style("transform",
          `translate(${margin.left}px,${margin.top}px)`
        )
        .call(axisY);
      container.append("text")
        .attr("transform",
          "translate(" + (margin.left + bodyWidth / 2) + " ," +
          (height - margin.bottom + 30) + ")")
        .style("text-anchor", "middle")
        .text("Reviews");

      container.append("text")
        .attr("transform",
          "translate(" + (margin.left - 80) + " ," +
          (height - margin.bottom - bodyHeight + 20) + ")")
        .style("text-anchor", "middle")
        .text("Rating");
    }

    // draw all element
    function drawCategoryChart(category) {
      category.sort(function(a, b) {
        return d3.descending(parseFloat(a["mean"]), parseFloat(b["mean"]))
      })
      let config = getCategoryConfig();
      let scales = getCategoryScales(category, config);

      drawBarsCategoryChart(category, scales, config);
      drawAxesCategoryChart(category, scales, config);
    }

    function getCategoryConfig() {
      let width = 500;
      let height = 400;
      let margin = {
        top: 10,
        bottom: 50,
        left: 160,
        right: 10
      }
      //The body is the are that will be occupied by the bars.
      let bodyHeight = height - margin.top - margin.bottom
      let bodyWidth = width - margin.left - margin.right

      //The container is the SVG where we will draw the chart. In our HTML is the svg tah with the id AirlinesChart
      let container = d3.select("#Q2")
      container
        .attr("width", width)
      container
        .attr("height", height)

      return {
        width,
        height,
        margin,
        bodyHeight,
        bodyWidth,
        container
      }
    }

    // get scale
    function getCategoryScales(category, config) {
      let {
        bodyWidth,
        bodyHeight
      } = config;
      let maximunCount = d3.max(category.map(a => parseFloat(a["mean"])))

      let xScale = d3.scaleLinear()
        .range([0, bodyWidth])
        .domain([0, maximunCount])

      let yScale = d3.scaleBand()
        .range([0, bodyHeight])
        .domain(category.map(a => a["Category"])) 
        .padding(0.2)


      return {
        xScale,
        yScale
      }
    }

    // draw bar
    function drawBarsCategoryChart(category, scales, config) {
      let {
        margin,
        container
      } = config;
      let {
        xScale,
        yScale
      } = scales
      let body = container.append("g")
        .style("transform",
          `translate(${margin.left}px,${margin.top}px)`
        )

      let bars = body.selectAll(".bar")
        .data(category)

      //Adding a rect tag for each airline
      bars.enter().append("rect")
        .attr("height", yScale.bandwidth())
        .attr("y", (d) => yScale(d["Category"]))
        .attr("width", (d) => xScale(d["mean"]))
        .attr("fill", "#2a5599")
    }

    // draw axes
    function drawAxesCategoryChart(category, scales, config) {
      let {
        xScale,
        yScale
      } = scales
      let {
        container,
        margin,
        height,
        bodyWidth,
        bodyHeight
      } = config;
      let axisX = d3.axisBottom(xScale)
        .ticks(5)

      container.append("g")
        .style("transform",
          `translate(${margin.left}px,${height - margin.bottom}px)`
        )
        .call(axisX)

      let axisY = d3.axisLeft(yScale)

      container.append("g")
        .style("transform",
          `translate(${margin.left}px,${margin.top}px)`
        )
        .call(axisY);
      container.append("text")
        .attr("transform",
          "translate(" + (margin.left + bodyWidth / 2) + " ," +
          (height - margin.bottom + 30) + ")")
        .style("text-anchor", "middle")
        .text("Reviews");

      container.append("text")
        .attr("transform",
          "translate(" + (margin.left - 120) + " ," +
          (height - margin.bottom - bodyHeight + 20) + ")")
        .style("text-anchor", "middle")
        .text("Category");
    }

