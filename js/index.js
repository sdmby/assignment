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

function createHorizontalBarChart(container, chartData) {
  // 模拟创建柱状图
  container.innerHTML = `<div>柱状图数据: ${JSON.stringify(chartData)}</div>`
}

function createLineChart(container, datasets) {
  // 模拟创建趋势图
  container.innerHTML = `<div>趋势图数据: ${JSON.stringify(datasets)}</div>`
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
