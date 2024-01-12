let _width = $(window).width();
let _height = $(window).height();
let width = 1 * _width;
let height = 1 * _height;
let padding = {'left': 0.1*width, 'bottom': 0.1*height, 'top': 0.1*height, 'right': 0.1*width};
let width_figure = width - padding.left - padding.right;  
let height_figure = height - padding.top - padding.bottom;
let fontFamily;
let x_attr = 'name';
let categories;
let duration = 500; // 动画持续时间
let allLocations;
let allNames;
let totalLocations;
let CaptionSize = 0.03 * height;
let TitleSize = 0.05 * height;
let TickSize = 0.015 * height;
let tooltip = d3.select("#tooltip");

// 定义图表边距
let margin = { top: TitleSize, right: TickSize, bottom: (TickSize+CaptionSize*1.1), left: (TickSize+CaptionSize*1.1)};
let svgWidth = width_figure / 2;
let svgHeight = height_figure;
let plotWidth = svgWidth - margin.left - margin.right;
let plotHeight = svgHeight - margin.top - margin.bottom;

// 定义悬浮时显示的文本
let caseTexts = {
    1: "case1：无放回随机均匀采样",
    2: "case2：重要性采样",
    3: "case3：单次打乱采样",
    4: "case4：随机打乱采样",
    5: "case5：按类别采样"
};

// 定义图例的文本和颜色
let legendData = [
    { caseIndex: 1, text: "无放回随机均匀采样", color: "hsl(0, 100%, 50%)" },
    { caseIndex: 2, text: "重要性采样", color: "hsl(72, 100%, 50%)" },
    { caseIndex: 3, text: "单次打乱采样", color: "hsl(144, 100%, 50%)" },
    { caseIndex: 4, text: "随机打乱采样", color: "hsl(216, 100%, 50%)" },
    { caseIndex: 5, text: "按类别采样", color: "hsl(288, 100%, 50%)" }
];

window.onload = function() {
    document.getElementById("slider1").style.width = "100%";
    document.getElementById("slider2").style.width = "100%";
};

function set_ui() {
    // 设置字体
    let ua = navigator.userAgent.toLowerCase();
    fontFamily = "Khand-Regular";
    if (/\(i[^;]+;( U;)? CPU.+Mac OS X/gi.test(ua)) {
        fontFamily = "PingFangSC-Regular";
    }
    d3.select("body")
        .style("font-family", fontFamily);
}

function draw_fig1(data, learningRates, batchSizes) {
    // 为滑动条添加事件监听器
    d3.select("#slider1").on("input", function() {
        let sliderValue = d3.select("#slider1").property("value");
        let learningRate = learningRates[sliderValue]; // 获取当前的 learning_rate
        d3.select("#slider1-value").text(learningRate);
        updateCharts(data);
    });

    d3.select("#slider2").on("input", function() {
        let sliderValue = d3.select("#slider2").property("value");
        let batchSize = batchSizes[sliderValue]; // 获取当前的 batch_size
        d3.select("#slider2-value").text(batchSize);
        updateCharts(data);
    });

    // 初始图表绘制
    updateCharts(data);
}

function drawChartLeft(filteredData) {
    // 清除现有的图表
    d3.select("#chart-left svg").remove();

    // 设置 SVG 容器
    let svgLeft = d3.select("#chart-left").append("svg")
                    .attr("width", svgWidth)
                    .attr("height", svgHeight)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // 定义比例尺
    let xScale = d3.scaleLinear()
                   .domain(d3.extent(filteredData, d => d.epoch))
                   .range([0, plotWidth]);

    let yScale = d3.scaleLinear()
                   .domain([0, d3.max(filteredData, d => d.loss)])
                   .range([plotHeight, 0]);

    // 定义坐标轴
    let xAxis = d3.axisBottom(xScale);
    let yAxis = d3.axisLeft(yScale);

    svgLeft.append("g")
           .attr("transform", "translate(0," + plotHeight + ")")
           .call(xAxis)
           .selectAll("text")
           .style("font-size", TickSize);

    svgLeft.append("text")
           .attr("x", plotWidth / 2)
           .attr("y", plotHeight+CaptionSize+TickSize*1.1)
           .style("font-size", CaptionSize + "px")
           .attr("fill", "#000")
           .style("text-anchor", "middle")
           .text("Epoch");

    svgLeft.append("g")
           .call(yAxis)
           .selectAll("text")
           .style("font-size", TickSize);

    svgLeft.append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", -CaptionSize)
           .attr("x", -plotHeight / 2)
           .style("font-size", CaptionSize + "px")
           .attr("fill", "#000")
           .style("text-anchor", "middle")
           .text("Loss");

    // 添加标题
    svgLeft.append("text")
           .attr("x", plotWidth / 2)
           .attr("y", -CaptionSize*0.2)
           .attr("text-anchor", "middle")
           .style("font-size", CaptionSize + "px")
           .text("Training loss");

    // 绘制折线图
    for (let caseIndex = 1; caseIndex <= 5; caseIndex++) {
        let line = d3.line()
                     .x(d => xScale(d.epoch))
                     .y(d => yScale(d.loss));

        svgLeft.append("path")
                .datum(filteredData.filter(d => d.case_index == caseIndex))
                .attr("class", "line case" + caseIndex)
                .attr("fill", "none")
                .attr("stroke", `hsl(${(caseIndex - 1) * 72}, 100%, 50%)`)
                .attr("stroke-width", 1.5)
                .attr("d", line)
                .on("mouseover", function(event) {
                    d3.selectAll(".line").attr("stroke-width", 1.5); 
                    d3.selectAll(".case" + caseIndex)
                    .attr("stroke-width", 8)  
                    .raise();  

                    tooltip.style("visibility", "visible")
                        .html(caseTexts[caseIndex])
                        .style("left", (event.pageX - 0.12*width_figure) + "px")
                        .style("top", (event.pageY - 0.1*height_figure) + "px");
                })
                .on("mouseout", function() {
                    d3.selectAll(".case" + caseIndex).attr("stroke-width", 1.5); 
                    tooltip.style("visibility", "hidden");
                });
    }

    // 添加图例
    let legend = svgLeft.selectAll(".legend")
                        .data(legendData)
                        .enter().append("g")
                        .attr("class", "legend")
                        .attr("transform", function(d, i) { return "translate(0," + (i * TickSize * 1.2) + ")"; });

    // 绘制图例颜色方块
    legend.append("rect")
          .attr("x", plotWidth - TickSize)
          .attr("width", TickSize)
          .attr("height", TickSize)
          .style("fill", function(d) { return d.color; });

    // 添加图例文本
    legend.append("text")
          .attr("x", plotWidth - TickSize*1.2)
          .attr("y", TickSize/2)
          .attr("dy", ".35em")
          .attr("font-size", TickSize + "px")
          .style("text-anchor", "end")
          .text(function(d) { return d.text; });

}

function drawChartRight(filteredData) {
    // 清除现有的图表
    d3.select("#chart-right svg").remove();

    // 设置 SVG 容器
    let svgRight = d3.select("#chart-right").append("svg")
                    .attr("width", svgWidth)
                    .attr("height", svgHeight)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // 定义比例尺
    let xScale = d3.scaleLinear()
                   .domain(d3.extent(filteredData, d => d.epoch))
                   .range([0, plotWidth]);

    let yScale = d3.scaleLinear()
                   .domain([0, d3.max(filteredData, d => d.accuracy)])
                   .range([plotHeight, 0]);

    // 定义坐标轴
    let xAxis = d3.axisBottom(xScale);
    let yAxis = d3.axisLeft(yScale);

    svgRight.append("g")
           .attr("transform", "translate(0," + plotHeight + ")")
           .call(xAxis)
           .selectAll("text")
           .style("font-size", TickSize);

    svgRight.append("text")
           .attr("x", plotWidth / 2)
           .attr("y", plotHeight+CaptionSize+TickSize*1.1)
           .style("font-size", CaptionSize + "px")
           .attr("fill", "#000")
           .style("text-anchor", "middle")
           .text("Epoch");

    svgRight.append("g")
           .call(yAxis)
           .selectAll("text")
           .style("font-size", TickSize);

    svgRight.append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", -CaptionSize)
           .attr("x", -plotHeight / 2)
           .style("font-size", CaptionSize + "px")
           .attr("fill", "#000")
           .style("text-anchor", "middle")
           .text("Accuracy");

    // 添加标题
    svgRight.append("text")
           .attr("x", plotWidth / 2)
           .attr("y", -CaptionSize*0.2)
           .attr("text-anchor", "middle")
           .style("font-size", CaptionSize + "px")
           .text("Test Accuracy");

    // 绘制折线图
    for (let caseIndex = 1; caseIndex <= 5; caseIndex++) {
        let line = d3.line()
                     .x(d => xScale(d.epoch))
                     .y(d => yScale(d.accuracy));

        svgRight.append("path")
                .datum(filteredData.filter(d => d.case_index == caseIndex))
                .attr("class", "line case" + caseIndex)
                .attr("fill", "none")
                .attr("stroke", `hsl(${(caseIndex - 1) * 72}, 100%, 50%)`)
                .attr("stroke-width", 1.5)
                .attr("d", line)
                .on("mouseover", function(event) {
                    d3.selectAll(".line").attr("stroke-width", 1.5); 
                    d3.selectAll(".case" + caseIndex)
                    .attr("stroke-width", 8)  
                    .raise();  

                    tooltip.style("visibility", "visible")
                        .html(caseTexts[caseIndex])
                        .style("left", (event.pageX - 0.12*width_figure) + "px")
                        .style("top", (event.pageY - 0.1*height_figure) + "px");
                })
                .on("mouseout", function() {
                    d3.selectAll(".case" + caseIndex).attr("stroke-width", 1.5); 
                    tooltip.style("visibility", "hidden");
                });
    }

    // 添加图例
    let legend = svgRight.selectAll(".legend")
                        .data(legendData)
                        .enter().append("g")
                        .attr("class", "legend")
                        .attr("transform", function(d, i) { return "translate(0," + (plotHeight*0.85 + i * TickSize * 1.2) + ")"; });

    // 绘制图例颜色方块
    legend.append("rect")
          .attr("x", plotWidth - TickSize)
          .attr("width", TickSize)
          .attr("height", TickSize)
          .style("fill", function(d) { return d.color; });

    // 添加图例文本
    legend.append("text")
          .attr("x", plotWidth - TickSize*1.2)
          .attr("y", TickSize/2)
          .attr("dy", ".35em")
          .attr("font-size", TickSize + "px")
          .style("text-anchor", "end")
          .text(function(d) { return d.text; });
}

function updateCharts(data) {
    let learningRate = d3.select("#slider1-value").text();
    let batchSize = d3.select("#slider2-value").text();
    let filteredData = data.filter(d => d.learning_rate == learningRate && d.batch_size == batchSize);
    drawChartLeft(filteredData);
    drawChartRight(filteredData);
}

function main() {
    set_ui();

    d3.csv(data_file).then(function(loadedData) {
        data = loadedData;
        console.log(data);
    
        // 解析和排序数据
        let learningRates = [...new Set(data.map(d => +d.learning_rate))].sort((a, b) => a - b);
        let batchSizes = [...new Set(data.map(d => +d.batch_size))].sort((a, b) => a - b);
    
        // 创建和配置滑动条
        createSlider('#slider1', learningRates, '#slider1-value');
        createSlider('#slider2', batchSizes, '#slider2-value');

        // 调用 draw_fig1 来初始化图表和滑动条
        draw_fig1(data, learningRates, batchSizes);
    });
    

}

main()

