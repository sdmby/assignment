// 城市对比页功能

let allCities = []
let selectedCities = []
const MAX_SELECTIONS = 4
const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6"]

async function loadGDPData() {
  // 模拟加载数据
  return {
    cities: [
      {
        id: 1,
        name: "北京",
        gdpData: [
          { year: 2023, gdp: 3500 },
          { year: 2022, gdp: 3000 },
        ],
        population: 2188,
        area: 16410.54,
        region: "华北",
      },
      {
        id: 2,
        name: "上海",
        gdpData: [
          { year: 2023, gdp: 3900 },
          { year: 2022, gdp: 3400 },
        ],
        population: 2428,
        area: 6340.51,
        region: "华东",
      },
      {
        id: 3,
        name: "广州",
        gdpData: [
          { year: 2023, gdp: 3200 },
          { year: 2022, gdp: 2800 },
        ],
        population: 1743,
        area: 7434.43,
        region: "华南",
      },
      {
        id: 4,
        name: "深圳",
        gdpData: [
          { year: 2023, gdp: 3100 },
          { year: 2022, gdp: 2700 },
        ],
        population: 1344,
        area: 1999.0,
        region: "华南",
      },
    ],
  }
}

function getLatestGDP(city) {
  return city.gdpData[city.gdpData.length - 1].gdp
}

function getCityGrowthRate(city) {
  const currentGDP = getLatestGDP(city)
  const previousGDP = city.gdpData[city.gdpData.length - 2].gdp
  return ((currentGDP - previousGDP) / previousGDP) * 100
}

function calculateCAGR(startValue, endValue, years) {
  return Math.pow(endValue / startValue, 1 / years) - 1
}

function formatNumber(value, decimals = 2) {
  return value.toFixed(decimals)
}

function createHorizontalBarChart(container, data, options) {
  // 模拟创建柱状图
  container.innerHTML = `
    <div style="display: flex; flex-direction: column;">
      ${data
        .map(
          (item, i) => `
        <div style="display: flex; align-items: center;">
          <div style="width: ${item.value}px; height: 20px; background-color: ${item.color}; margin-right: 1rem;"></div>
          <span style="color: ${item.color};">${item.label}</span>
        </div>
      `,
        )
        .join("")}
    </div>
  `
}

function createLineChart(container, datasets, options) {
  // 模拟创建折线图
  container.innerHTML = `
    <div style="display: flex; flex-direction: column;">
      ${datasets
        .map(
          (dataset, i) => `
        <div style="display: flex; align-items: center;">
          <span style="color: ${options.colors[i]};">${dataset.label}</span>
          <div style="width: 100%; height: 20px; background-color: ${options.colors[i]}; margin-left: 1rem;">
            ${dataset.data.map((value) => `<span style="width: ${value}px; height: 100%; display: inline-block;"></span>`).join("")}
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `
}

document.addEventListener("DOMContentLoaded", async () => {
  const data = await loadGDPData()
  if (!data) {
    showError()
    return
  }

  allCities = data.cities
  renderCitySelector()
  initEventListeners()
})

// 显示错误信息
function showError() {
  const selector = document.getElementById("citySelector")
  selector.innerHTML = `
    <div style="text-align: center; padding: 2rem; color: var(--danger-color);">
      <h3>数据加载失败</h3>
      <p>请检查网络连接或刷新页面重试</p>
    </div>
  `
}

// 渲染城市选择器
function renderCitySelector() {
  const selector = document.getElementById("citySelector")
  const sortedCities = [...allCities].sort((a, b) => getLatestGDP(b) - getLatestGDP(a))

  selector.innerHTML = sortedCities
    .map(
      (city) => `
    <button class="city-select-btn" data-city-id="${city.id}">
      ${city.name}
    </button>
  `,
    )
    .join("")

  // 添加点击事件
  selector.querySelectorAll(".city-select-btn").forEach((btn) => {
    btn.addEventListener("click", () => toggleCitySelection(btn))
  })
}

// 切换城市选择
function toggleCitySelection(btn) {
  const cityId = btn.dataset.cityId
  const isSelected = btn.classList.contains("selected")

  if (isSelected) {
    // 取消选择
    btn.classList.remove("selected")
    selectedCities = selectedCities.filter((id) => id !== cityId)
  } else {
    // 添加选择
    if (selectedCities.length >= MAX_SELECTIONS) {
      alert(`最多只能选择${MAX_SELECTIONS}个城市进行对比`)
      return
    }
    btn.classList.add("selected")
    selectedCities.push(cityId)
  }

  updateButtonStates()
  updateComparison()
}

// 更新按钮状态
function updateButtonStates() {
  const buttons = document.querySelectorAll(".city-select-btn")
  buttons.forEach((btn) => {
    const isSelected = btn.classList.contains("selected")
    btn.disabled = !isSelected && selectedCities.length >= MAX_SELECTIONS
  })
}

// 初始化事件监听
function initEventListeners() {
  const clearBtn = document.getElementById("clearSelection")
  clearBtn.addEventListener("click", () => {
    selectedCities = []
    document.querySelectorAll(".city-select-btn").forEach((btn) => {
      btn.classList.remove("selected")
      btn.disabled = false
    })
    updateComparison()
  })
}

// 更新对比结果
function updateComparison() {
  const resultSection = document.getElementById("comparisonResult")
  const emptyState = document.getElementById("emptyState")

  if (selectedCities.length < 2) {
    resultSection.style.display = "none"
    emptyState.style.display = "block"
    return
  }

  resultSection.style.display = "block"
  emptyState.style.display = "none"

  const cities = selectedCities.map((id) => allCities.find((c) => c.id === id))

  renderComparisonBarChart(cities)
  renderComparisonLineChart(cities)
  renderComparisonTable(cities)
  renderGrowthComparison(cities)
}

// 渲染对比柱状图
function renderComparisonBarChart(cities) {
  const container = document.getElementById("comparisonBarChart")
  const data = cities.map((city, i) => ({
    label: city.name,
    value: getLatestGDP(city),
    color: COLORS[i],
  }))

  createHorizontalBarChart(container, data, { colors: COLORS })
}

// 渲染对比折线图
function renderComparisonLineChart(cities) {
  const container = document.getElementById("comparisonLineChart")
  const datasets = cities.map((city) => ({
    label: city.name,
    data: city.gdpData.map((d) => d.gdp),
  }))

  createLineChart(container, datasets, { colors: COLORS })
}

// 渲染对比表格
function renderComparisonTable(cities) {
  const thead = document.getElementById("comparisonTableHead")
  const tbody = document.getElementById("comparisonTableBody")

  // 表头
  thead.innerHTML = `
    <tr>
      <th>指标</th>
      ${cities
        .map(
          (city, i) => `
        <th style="color: ${COLORS[i]}">${city.name}</th>
      `,
        )
        .join("")}
    </tr>
  `

  // 表体
  const rows = [
    {
      label: "2023年GDP (亿元)",
      values: cities.map((city) => formatNumber(getLatestGDP(city))),
    },
    {
      label: "同比增长率",
      values: cities.map((city) => {
        const rate = getCityGrowthRate(city)
        return `<span class="growth-indicator ${rate >= 0 ? "positive" : "negative"}">${rate >= 0 ? "+" : ""}${rate.toFixed(2)}%</span>`
      }),
    },
    {
      label: "5年复合增长率 (CAGR)",
      values: cities.map((city) => {
        const cagr = calculateCAGR(city.gdpData[0].gdp, getLatestGDP(city), 4)
        return `${cagr.toFixed(2)}%`
      }),
    },
    {
      label: "常住人口 (万人)",
      values: cities.map((city) => formatNumber(city.population, 0)),
    },
    {
      label: "人均GDP (万元)",
      values: cities.map((city) => formatNumber(getLatestGDP(city) / city.population, 2)),
    },
    {
      label: "行政面积 (km²)",
      values: cities.map((city) => formatNumber(city.area, 0)),
    },
    {
      label: "GDP密度 (亿元/km²)",
      values: cities.map((city) => formatNumber(getLatestGDP(city) / city.area, 2)),
    },
    {
      label: "所属地区",
      values: cities.map((city) => `<span class="tag tag-blue">${city.region}</span>`),
    },
  ]

  tbody.innerHTML = rows
    .map(
      (row) => `
    <tr>
      <td><strong>${row.label}</strong></td>
      ${row.values.map((value) => `<td>${value}</td>`).join("")}
    </tr>
  `,
    )
    .join("")
}

// 渲染增长率对比
function renderGrowthComparison(cities) {
  const container = document.getElementById("growthComparison")

  const growthData = cities
    .map((city, i) => {
      const cagr = calculateCAGR(city.gdpData[0].gdp, getLatestGDP(city), 4)
      return {
        name: city.name,
        cagr: cagr,
        color: COLORS[i],
      }
    })
    .sort((a, b) => b.cagr - a.cagr)

  const maxCAGR = Math.max(...growthData.map((d) => d.cagr))

  container.innerHTML = `
    <div class="comparison-bars">
      ${growthData
        .map(
          (item) => `
        <div class="comparison-item">
          <div class="comparison-header">
            <span class="comparison-label" style="color: ${item.color}">${item.name}</span>
            <span class="comparison-value">${item.cagr.toFixed(2)}%</span>
          </div>
          <div class="comparison-track">
            <div class="comparison-bar" style="width: ${(item.cagr / maxCAGR) * 100}%; background: ${item.color};"></div>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
    <p style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.875rem;">
      * CAGR (Compound Annual Growth Rate) 年均复合增长率，反映城市GDP的长期增长趋势
    </p>
  `
}
