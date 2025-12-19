// 城市详情页功能

let allCities = []
let filteredCities = []

// 声明未声明的变量
async function loadGDPData() {
  // 模拟数据加载
  return {
    cities: [
      {
        id: 1,
        name: "北京",
        nameEn: "Beijing",
        region: "华北",
        population: 21886000,
        area: 16410.54,
        gdpData: [
          { year: 2019, gdp: 20000 },
          { year: 2020, gdp: 22000 },
          { year: 2021, gdp: 24000 },
          { year: 2022, gdp: 26000 },
          { year: 2023, gdp: 28000 },
        ],
      },
      {
        id: 2,
        name: "上海",
        nameEn: "Shanghai",
        region: "华东",
        population: 24281000,
        area: 6340.5,
        gdpData: [
          { year: 2019, gdp: 30000 },
          { year: 2020, gdp: 33000 },
          { year: 2021, gdp: 36000 },
          { year: 2022, gdp: 39000 },
          { year: 2023, gdp: 42000 },
        ],
      },
      // 其他城市数据...
    ],
  }
}

function getLatestGDP(city) {
  return city.gdpData[city.gdpData.length - 1].gdp
}

function getCityGrowthRate(city) {
  if (city.gdpData.length < 2) return 0
  const previousGDP = city.gdpData[city.gdpData.length - 2].gdp
  const latestGDP = getLatestGDP(city)
  return ((latestGDP - previousGDP) / previousGDP) * 100
}

function formatNumber(number, decimalPlaces = 0) {
  return number.toFixed(decimalPlaces)
}

function calculateCAGR(initialValue, finalValue, numberOfPeriods) {
  return Math.pow(finalValue / initialValue, 1 / numberOfPeriods) - 1
}

function calculateGrowthRate(currentValue, previousValue) {
  return ((currentValue - previousValue) / previousValue) * 100
}

function createLineChart(container, datasets) {
  // 模拟图表创建
  container.innerHTML = `<p>图表数据: ${JSON.stringify(datasets)}</p>`
}

document.addEventListener("DOMContentLoaded", async () => {
  const data = await loadGDPData()
  if (!data) {
    showError()
    return
  }

  allCities = data.cities
  filteredCities = [...allCities]

  renderCityGrid(filteredCities)
  initFilters()
  initModal()
})

// 显示错误信息
function showError() {
  const cityGrid = document.getElementById("cityGrid")
  cityGrid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--danger-color);">
      <h3>数据加载失败</h3>
      <p>请检查网络连接或刷新页面重试</p>
    </div>
  `
}

// 渲染城市卡片网格
function renderCityGrid(cities) {
  const cityGrid = document.getElementById("cityGrid")

  if (cities.length === 0) {
    cityGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
        <h3>未找到匹配的城市</h3>
        <p>请尝试其他搜索条件</p>
      </div>
    `
    return
  }

  cityGrid.innerHTML = cities
    .map((city, index) => {
      const latestGDP = getLatestGDP(city)
      const growthRate = getCityGrowthRate(city)
      const perCapitaGDP = (latestGDP / city.population) * 10000 // 转换为元

      return `
      <div class="city-card animate-slide" style="animation-delay: ${index * 0.05}s;" data-city-id="${city.id}">
        <div class="city-card-header">
          <div class="city-name">${city.name}</div>
          <div class="city-region">${city.nameEn} · ${city.region}</div>
        </div>
        <div class="city-card-body">
          <div class="city-stat-row">
            <span class="city-stat-label">2023年GDP</span>
            <span class="city-stat-value">${formatNumber(latestGDP)} 亿元</span>
          </div>
          <div class="city-stat-row">
            <span class="city-stat-label">同比增长</span>
            <span class="city-stat-value">
              <span class="growth-indicator ${growthRate >= 0 ? "positive" : "negative"}" style="font-size: 0.75rem;">
                ${growthRate >= 0 ? "↑" : "↓"} ${Math.abs(growthRate).toFixed(2)}%
              </span>
            </span>
          </div>
          <div class="city-stat-row">
            <span class="city-stat-label">人均GDP</span>
            <span class="city-stat-value">${formatNumber(perCapitaGDP / 10000, 2)} 万元</span>
          </div>
          <div class="city-stat-row">
            <span class="city-stat-label">常住人口</span>
            <span class="city-stat-value">${formatNumber(city.population, 0)} 万人</span>
          </div>
        </div>
      </div>
    `
    })
    .join("")

  // 添加点击事件
  document.querySelectorAll(".city-card").forEach((card) => {
    card.addEventListener("click", () => {
      const cityId = card.dataset.cityId
      const city = allCities.find((c) => c.id === cityId)
      if (city) showCityModal(city)
    })
  })
}

// 初始化筛选功能
function initFilters() {
  const searchInput = document.getElementById("searchInput")
  const regionFilter = document.getElementById("regionFilter")
  const sortBy = document.getElementById("sortBy")

  const applyFilters = () => {
    const searchTerm = searchInput.value.toLowerCase()
    const region = regionFilter.value
    const sort = sortBy.value

    // 筛选
    filteredCities = allCities.filter((city) => {
      const matchSearch = city.name.toLowerCase().includes(searchTerm) || city.nameEn.toLowerCase().includes(searchTerm)
      const matchRegion = !region || city.region === region
      return matchSearch && matchRegion
    })

    // 排序
    switch (sort) {
      case "gdp-desc":
        filteredCities.sort((a, b) => getLatestGDP(b) - getLatestGDP(a))
        break
      case "gdp-asc":
        filteredCities.sort((a, b) => getLatestGDP(a) - getLatestGDP(b))
        break
      case "growth-desc":
        filteredCities.sort((a, b) => getCityGrowthRate(b) - getCityGrowthRate(a))
        break
      case "name":
        filteredCities.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"))
        break
    }

    renderCityGrid(filteredCities)
  }

  searchInput.addEventListener("input", applyFilters)
  regionFilter.addEventListener("change", applyFilters)
  sortBy.addEventListener("change", applyFilters)
}

// 初始化模态框
function initModal() {
  const modal = document.getElementById("cityModal")
  const closeBtn = document.getElementById("modalClose")

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none"
  })

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none"
    }
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      modal.style.display = "none"
    }
  })
}

// 显示城市详情模态框
function showCityModal(city) {
  const modal = document.getElementById("cityModal")
  const modalCityName = document.getElementById("modalCityName")
  const modalBody = document.getElementById("modalBody")

  const latestGDP = getLatestGDP(city)
  const growthRate = getCityGrowthRate(city)
  const perCapitaGDP = (latestGDP / city.population) * 10000
  const cagr = calculateCAGR(city.gdpData[0].gdp, latestGDP, 4)

  modalCityName.textContent = `${city.name} (${city.nameEn})`

  modalBody.innerHTML = `
    <div class="modal-stats">
      <div class="modal-stat">
        <div class="modal-stat-value">${formatNumber(latestGDP)}</div>
        <div class="modal-stat-label">2023年GDP (亿元)</div>
      </div>
      <div class="modal-stat">
        <div class="modal-stat-value" style="color: ${growthRate >= 0 ? "var(--success-color)" : "var(--danger-color)"}">
          ${growthRate >= 0 ? "+" : ""}${growthRate.toFixed(2)}%
        </div>
        <div class="modal-stat-label">同比增长</div>
      </div>
      <div class="modal-stat">
        <div class="modal-stat-value">${formatNumber(perCapitaGDP / 10000, 2)} 万</div>
        <div class="modal-stat-label">人均GDP (元)</div>
      </div>
      <div class="modal-stat">
        <div class="modal-stat-value">${cagr.toFixed(2)}%</div>
        <div class="modal-stat-label">5年复合增长率</div>
      </div>
    </div>
    
    <p class="modal-description">${city.description}</p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
      <div style="background: var(--background-color); padding: 1rem; border-radius: var(--radius-md);">
        <div style="color: var(--text-secondary); font-size: 0.875rem;">常住人口</div>
        <div style="font-size: 1.25rem; font-weight: 600;">${formatNumber(city.population, 0)} 万人</div>
      </div>
      <div style="background: var(--background-color); padding: 1rem; border-radius: var(--radius-md);">
        <div style="color: var(--text-secondary); font-size: 0.875rem;">行政面积</div>
        <div style="font-size: 1.25rem; font-weight: 600;">${formatNumber(city.area, 0)} km²</div>
      </div>
    </div>
    
    <h4 class="modal-chart-title">GDP历年变化趋势</h4>
    <div id="modalChart" style="height: 200px;"></div>
    
    <h4 class="modal-chart-title" style="margin-top: 1.5rem;">历年GDP数据</h4>
    <table class="data-table">
      <thead>
        <tr>
          <th>年份</th>
          <th>GDP (亿元)</th>
          <th>同比增长</th>
        </tr>
      </thead>
      <tbody>
        ${city.gdpData
          .map((d, i) => {
            const growth = i > 0 ? calculateGrowthRate(d.gdp, city.gdpData[i - 1].gdp) : 0
            return `
            <tr>
              <td>${d.year}</td>
              <td>${formatNumber(d.gdp)}</td>
              <td>
                ${
                  i > 0
                    ? `
                  <span class="growth-indicator ${growth >= 0 ? "positive" : "negative"}" style="font-size: 0.75rem;">
                    ${growth >= 0 ? "↑" : "↓"} ${Math.abs(growth).toFixed(2)}%
                  </span>
                `
                    : "-"
                }
              </td>
            </tr>
          `
          })
          .join("")}
      </tbody>
    </table>
  `

  // 渲染图表
  setTimeout(() => {
    const chartContainer = document.getElementById("modalChart")
    createLineChart(chartContainer, [
      {
        label: city.name,
        data: city.gdpData.map((d) => d.gdp),
      },
    ])
  }, 100)

  modal.style.display = "flex"
}
