// 全局工具函数和共享功能

// 数据缓存
let cachedData = null

// 加载GDP数据
async function loadGDPData() {
  if (cachedData) return cachedData

  try {
    const response = await fetch("data/city-gdp.json")
    if (!response.ok) throw new Error("数据加载失败")
    cachedData = await response.json()
    return cachedData
  } catch (error) {
    console.error("加载数据出错:", error)
    return null
  }
}

// 格式化数字（添加千分位）
function formatNumber(num, decimals = 2) {
  return num.toLocaleString("zh-CN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

// 计算增长率
function calculateGrowthRate(current, previous) {
  if (!previous) return 0
  return ((current - previous) / previous) * 100
}

// 计算年均复合增长率 (CAGR)
function calculateCAGR(startValue, endValue, years) {
  if (startValue <= 0 || years <= 0) return 0
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100
}

// 获取城市最新GDP
function getLatestGDP(city) {
  const latestData = city.gdpData[city.gdpData.length - 1]
  return latestData ? latestData.gdp : 0
}

// 获取城市GDP增长率
function getCityGrowthRate(city) {
  const data = city.gdpData
  if (data.length < 2) return 0
  const latest = data[data.length - 1].gdp
  const previous = data[data.length - 2].gdp
  return calculateGrowthRate(latest, previous)
}

// 移动端菜单切换
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn")
  const navLinks = document.getElementById("navLinks")

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("active")
    })
  }
}

// 创建迷你柱状图（sparkline）
function createSparkline(data, maxHeight = 40) {
  const container = document.createElement("div")
  container.className = "sparkline"
  container.style.height = `${maxHeight}px`

  const maxValue = Math.max(...data)

  data.forEach((value, index) => {
    const bar = document.createElement("div")
    bar.className = "sparkline-bar"
    const height = (value / maxValue) * maxHeight
    bar.style.height = `${height}px`
    bar.title = `${value.toFixed(2)} 亿元`
    container.appendChild(bar)
  })

  return container
}

// 创建水平柱状图
function createHorizontalBarChart(container, data, options = {}) {
  const { maxValue, colors = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6"] } = options
  const max = maxValue || Math.max(...data.map((d) => d.value))

  container.innerHTML = '<div class="horizontal-bar-chart"></div>'
  const chart = container.querySelector(".horizontal-bar-chart")

  data.forEach((item, index) => {
    const percentage = (item.value / max) * 100
    const color = colors[index % colors.length]

    const barItem = document.createElement("div")
    barItem.className = "h-bar-item"
    barItem.innerHTML = `
      <div class="h-bar-label">${item.label}</div>
      <div class="h-bar-track">
        <div class="h-bar" style="width: 0%; background: ${color};">
          <span class="h-bar-value">${formatNumber(item.value)} 亿</span>
        </div>
      </div>
    `
    chart.appendChild(barItem)

    // 动画效果
    setTimeout(() => {
      barItem.querySelector(".h-bar").style.width = `${percentage}%`
    }, index * 100)
  })
}

// 创建垂直柱状图
function createBarChart(container, data, options = {}) {
  const { maxValue, showLabels = true } = options
  const max = maxValue || Math.max(...data.map((d) => d.value))
  const chartHeight = container.clientHeight - 60

  container.innerHTML = '<div class="bar-chart"></div>'
  const chart = container.querySelector(".bar-chart")
  chart.style.height = `${chartHeight}px`

  data.forEach((item, index) => {
    const height = (item.value / max) * 100

    const barItem = document.createElement("div")
    barItem.className = "bar-item"
    barItem.innerHTML = `
      <div class="bar animate-grow" style="height: 0%;">
        <span class="bar-value">${formatNumber(item.value / 10000, 1)}万亿</span>
      </div>
      ${showLabels ? `<div class="bar-label">${item.label}</div>` : ""}
    `
    chart.appendChild(barItem)

    // 动画效果
    setTimeout(() => {
      barItem.querySelector(".bar").style.height = `${height}%`
    }, index * 100)
  })
}

// 创建简单折线图（使用SVG）
function createLineChart(container, datasets, options = {}) {
  const { years = [2019, 2020, 2021, 2022, 2023], colors = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"] } =
    options

  const padding = { top: 30, right: 20, bottom: 40, left: 60 }
  const width = container.clientWidth
  const height = container.clientHeight
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // 找出最大值
  let maxValue = 0
  datasets.forEach((dataset) => {
    dataset.data.forEach((value) => {
      if (value > maxValue) maxValue = value
    })
  })
  maxValue = maxValue * 1.1 // 留出10%边距

  // 创建SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("width", "100%")
  svg.setAttribute("height", "100%")
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`)

  // 添加渐变定义
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
  datasets.forEach((dataset, i) => {
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient")
    gradient.setAttribute("id", `gradient-${i}`)
    gradient.setAttribute("x1", "0%")
    gradient.setAttribute("y1", "0%")
    gradient.setAttribute("x2", "0%")
    gradient.setAttribute("y2", "100%")
    gradient.innerHTML = `
      <stop offset="0%" stop-color="${colors[i]}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${colors[i]}" stop-opacity="0"/>
    `
    defs.appendChild(gradient)
  })
  svg.appendChild(defs)

  // 绘制网格线
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartHeight / 4) * i
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
    line.setAttribute("x1", padding.left)
    line.setAttribute("y1", y)
    line.setAttribute("x2", width - padding.right)
    line.setAttribute("y2", y)
    line.setAttribute("class", "chart-grid")
    svg.appendChild(line)

    // Y轴标签
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text")
    label.setAttribute("x", padding.left - 10)
    label.setAttribute("y", y + 4)
    label.setAttribute("text-anchor", "end")
    label.setAttribute("class", "chart-axis")
    label.textContent = formatNumber(((maxValue / 4) * (4 - i)) / 10000, 1) + "万亿"
    svg.appendChild(label)
  }

  // X轴标签
  years.forEach((year, i) => {
    const x = padding.left + (chartWidth / (years.length - 1)) * i
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text")
    label.setAttribute("x", x)
    label.setAttribute("y", height - 10)
    label.setAttribute("text-anchor", "middle")
    label.setAttribute("class", "chart-axis")
    label.textContent = year
    svg.appendChild(label)
  })

  // 绘制每个数据集
  datasets.forEach((dataset, datasetIndex) => {
    const points = dataset.data.map((value, i) => {
      const x = padding.left + (chartWidth / (years.length - 1)) * i
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight
      return { x, y, value }
    })

    // 绘制填充区域
    const areaPath = document.createElementNS("http://www.w3.org/2000/svg", "path")
    let areaD = `M ${points[0].x} ${padding.top + chartHeight}`
    points.forEach((p) => {
      areaD += ` L ${p.x} ${p.y}`
    })
    areaD += ` L ${points[points.length - 1].x} ${padding.top + chartHeight} Z`
    areaPath.setAttribute("d", areaD)
    areaPath.setAttribute("fill", `url(#gradient-${datasetIndex})`)
    svg.appendChild(areaPath)

    // 绘制折线
    const linePath = document.createElementNS("http://www.w3.org/2000/svg", "path")
    let lineD = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      lineD += ` L ${points[i].x} ${points[i].y}`
    }
    linePath.setAttribute("d", lineD)
    linePath.setAttribute("fill", "none")
    linePath.setAttribute("stroke", colors[datasetIndex])
    linePath.setAttribute("stroke-width", "3")
    linePath.setAttribute("stroke-linecap", "round")
    linePath.setAttribute("stroke-linejoin", "round")
    svg.appendChild(linePath)

    // 绘制数据点
    points.forEach((point) => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      circle.setAttribute("cx", point.x)
      circle.setAttribute("cy", point.y)
      circle.setAttribute("r", "5")
      circle.setAttribute("fill", colors[datasetIndex])
      circle.setAttribute("stroke", "white")
      circle.setAttribute("stroke-width", "2")
      circle.setAttribute("class", "line-chart-dot")

      // 添加悬停效果
      circle.addEventListener("mouseenter", () => {
        circle.setAttribute("r", "8")
      })
      circle.addEventListener("mouseleave", () => {
        circle.setAttribute("r", "5")
      })

      svg.appendChild(circle)
    })
  })

  container.innerHTML = ""
  container.appendChild(svg)

  // 添加图例
  const legend = document.createElement("div")
  legend.className = "chart-legend"
  datasets.forEach((dataset, i) => {
    legend.innerHTML += `
      <div class="chart-legend-item">
        <span class="chart-legend-dot" style="background: ${colors[i]}"></span>
        <span>${dataset.label}</span>
      </div>
    `
  })
  container.appendChild(legend)
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu()
})
