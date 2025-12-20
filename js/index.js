// 首页功能

document.addEventListener("DOMContentLoaded", async () => {
  const data = await loadGDPData()
  if (!data) {
    showError()
    return
  }

  renderStats(data)
  renderGDPBarChart(data)
  renderGDPTrendChart(data)
  renderGDPTable(data)
})

// 显示错误信息
function showError() {
  const statsGrid = document.getElementById("statsGrid")
  statsGrid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--danger-color);">
      <h3>数据加载失败</h3>
      <p>请检查网络连接或刷新页面重试</p>
    </div>
  `
}

// 渲染统计卡片
function renderStats(data) {
  const cities = data.cities
  const sortedByGDP = [...cities].sort((a, b) => getLatestGDP(b) - getLatestGDP(a))

  // 计算总GDP
  const totalGDP = cities.reduce((sum, city) => sum + getLatestGDP(city), 0)

  // 计算平均增长率
  const avgGrowth = cities.reduce((sum, city) => sum + getCityGrowthRate(city), 0) / cities.length

  // 最高GDP城市
  const topCity = sortedByGDP[0]

  // 最高增长率
  const maxGrowth = Math.max(...cities.map((city) => getCityGrowthRate(city)))

  const statsGrid = document.getElementById("statsGrid")
  statsGrid.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon blue">📊</div>
      <div class="stat-content">
        <div class="stat-label">Top 10 城市总GDP</div>
        <div class="stat-value">${formatNumber(totalGDP / 10000, 2)} 万亿</div>
        <div class="stat-change positive">2023年数据</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon green">📈</div>
      <div class="stat-content">
        <div class="stat-label">平均增长率</div>
        <div class="stat-value">${avgGrowth.toFixed(2)}%</div>
        <div class="stat-change ${avgGrowth >= 0 ? "positive" : "negative"}">
          ${avgGrowth >= 0 ? "↑" : "↓"} 同比
        </div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon orange">🏆</div>
      <div class="stat-content">
        <div class="stat-label">GDP最高城市</div>
        <div class="stat-value">${topCity.name}</div>
        <div class="stat-change positive">${formatNumber(getLatestGDP(topCity))} 亿元</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon purple">🚀</div>
      <div class="stat-content">
        <div class="stat-label">最高增长率</div>
        <div class="stat-value">${maxGrowth.toFixed(2)}%</div>
        <div class="stat-change positive">领跑全国</div>
      </div>
    </div>
  `
}

// 渲染GDP柱状图
function renderGDPBarChart(data) {
  const container = document.getElementById("gdpBarChart")
  const sortedCities = [...data.cities].sort((a, b) => getLatestGDP(b) - getLatestGDP(a))

  const chartData = sortedCities.map((city) => ({
    label: city.name,
    value: getLatestGDP(city),
  }))

  createHorizontalBarChart(container, chartData)
}

// 渲染GDP趋势图
function renderGDPTrendChart(data) {
  const container = document.getElementById("gdpTrendChart")
  const sortedCities = [...data.cities].sort((a, b) => getLatestGDP(b) - getLatestGDP(a))
  const top5 = sortedCities.slice(0, 5)

  const datasets = top5.map((city) => ({
    label: city.name,
    data: city.gdpData.map((d) => d.gdp),
  }))

  createLineChart(container, datasets)
}

// 渲染GDP表格
function renderGDPTable(data) {
  const tbody = document.getElementById("gdpTableBody")
  const sortedCities = [...data.cities].sort((a, b) => getLatestGDP(b) - getLatestGDP(a))

  tbody.innerHTML = sortedCities
    .map((city, index) => {
      const latestGDP = getLatestGDP(city)
      const growthRate = getCityGrowthRate(city)
      const sparklineData = city.gdpData.map((d) => d.gdp)

      return `
      <tr>
        <td class="rank">${index + 1}</td>
        <td>
          <strong>${city.name}</strong>
          <span style="color: var(--text-secondary); font-size: 0.875rem;"> ${city.nameEn}</span>
        </td>
        <td><span class="tag tag-blue">${city.region}</span></td>
        <td><strong>${formatNumber(latestGDP)}</strong></td>
        <td>
          <span class="growth-indicator ${growthRate >= 0 ? "positive" : "negative"}">
            <span class="growth-arrow">${growthRate >= 0 ? "↑" : "↓"}</span>
            ${Math.abs(growthRate).toFixed(2)}%
          </span>
        </td>
        <td id="sparkline-${city.id}"></td>
      </tr>
    `
    })
    .join("")

  // 添加迷你图
  sortedCities.forEach((city) => {
    const container = document.getElementById(`sparkline-${city.id}`)
    const sparklineData = city.gdpData.map((d) => d.gdp)
    container.appendChild(createSparkline(sparklineData, 30))
  })
}

// 假设这些函数在其他地方定义
async function loadGDPData() {
  // 模拟加载数据
  return {
    cities: [
      {
        id: 1,
        name: "北京",
        nameEn: "Beijing",
        region: "华北",
        gdpData: [{ year: 2023, gdp: 215360 }],
        latestGDP: 215360,
      },
      {
        id: 2,
        name: "上海",
        nameEn: "Shanghai",
        region: "华东",
        gdpData: [{ year: 2023, gdp: 356700 }],
        latestGDP: 356700,
      },
      // 其他城市数据
    ],
  }
}

function getLatestGDP(city) {
  return city.latestGDP
}

function getCityGrowthRate(city) {
  // 模拟计算增长率
  return Math.random() * 10 - 5
}

function formatNumber(number, decimals = 0) {
  return number.toFixed(decimals)
}

// 水平柱状图函数
function createHorizontalBarChart(container, chartData) {
    // 清空容器并移除加载状态
    container.innerHTML = '';
    
    // 创建canvas元素
    const canvas = document.createElement('canvas');
    canvas.id = 'gdpBarChartCanvas';
    canvas.style.width = '100%';
    canvas.style.height = '400px';
    container.appendChild(canvas);
    
    // 销毁之前的图表实例
    if (window.barChart) {
        window.barChart.destroy();
    }
    
    // 获取上下文
    const ctx = canvas.getContext('2d');
    
    // 只取前10个数据
    const top10Data = chartData.slice(0, 10);
    
    // 创建水平柱状图
    window.barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top10Data.map(item => item.label),
            datasets: [{
                label: 'GDP (亿元)',
                data: top10Data.map(item => item.value),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(199, 199, 199, 0.7)',
                    'rgba(83, 102, 255, 0.7)',
                    'rgba(40, 159, 64, 0.7)',
                    'rgba(210, 199, 199, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)',
                    'rgba(83, 102, 255, 1)',
                    'rgba(40, 159, 64, 1)',
                    'rgba(210, 199, 199, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // 水平柱状图
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: '2023年GDP排名 Top 10',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'GDP (亿元)'
                    }
                }
            }
        }
    });
}

// 折线图函数
function createLineChart(container, datasets) {
    // 清空容器
    container.innerHTML = '';
    
    // 创建canvas元素
    const canvas = document.createElement('canvas');
    canvas.id = 'gdpTrendChartCanvas';
    canvas.style.width = '100%';
    canvas.style.height = '400px';
    container.appendChild(canvas);
    
    // 销毁之前的图表实例
    if (window.trendChart) {
        window.trendChart.destroy();
    }
    
    // 获取上下文
    const ctx = canvas.getContext('2d');
    
    // 年份标签
    const years = [2019, 2020, 2021, 2022, 2023];
    
    // 创建折线图
    window.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: datasets.map((dataset, index) => ({
                label: dataset.label,
                data: dataset.data,
                borderColor: getChartColor(index),
                backgroundColor: getChartColor(index, 0.1),
                borderWidth: 3,
                fill: true,
                tension: 0.3
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Top 5 城市GDP增长趋势',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'GDP (亿元)'
                    }
                }
            }
        }
    });
}

// 获取图表颜色
function getChartColor(index, alpha = 1) {
    const colors = [
        'rgba(255, 99, 132, ALPHA)',     // 红色
        'rgba(54, 162, 235, ALPHA)',     // 蓝色
        'rgba(255, 206, 86, ALPHA)',     // 黄色
        'rgba(75, 192, 192, ALPHA)',     // 绿色
        'rgba(153, 102, 255, ALPHA)',    // 紫色
        'rgba(255, 159, 64, ALPHA)',     // 橙色
        'rgba(83, 102, 255, ALPHA)',     // 深蓝
        'rgba(40, 159, 64, ALPHA)',      // 深绿
        'rgba(210, 199, 199, ALPHA)',    // 灰色
        'rgba(199, 40, 64, ALPHA)'       // 深红
    ];
    
    const colorIndex = index % colors.length;
    return colors[colorIndex].replace('ALPHA', alpha);
}


function createSparkline(data, width) {
  // 模拟创建迷你图
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = 20
  const ctx = canvas.getContext("2d")
  ctx.fillStyle = "blue"
  ctx.fillRect(0, 0, width, 20)
  return canvas
}
