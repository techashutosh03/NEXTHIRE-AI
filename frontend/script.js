const moodData = [
  { emoji: "😄", value: 64 },
  { emoji: "😍", value: 88 },
  { emoji: "😄", value: 64 },
  { emoji: "☺️", value: 52 },
  { emoji: "😡", value: 80 },
  { emoji: "😭", value: 68 },
  { emoji: "😔", value: 45 },
];

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderMoodBars() {
  const root = document.querySelector("#moodBars");
  root.innerHTML = moodData
    .map(
      (item) => `
        <div class="mood">
          <div class="mood-track">
            <div class="mood-fill" style="height: ${item.value}%"></div>
          </div>
          <span class="mood-emoji" aria-hidden="true">${item.emoji}</span>
        </div>
      `
    )
    .join("");
}

function drawTrendChart() {
  const canvas = document.querySelector("#trendChart");
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.floor(rect.width * dpr);
  const height = Math.floor(rect.height * dpr);

  canvas.width = width;
  canvas.height = height;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const padding = { top: 20, right: 18, bottom: 34, left: 50 };
  const chartWidth = rect.width - padding.left - padding.right;
  const chartHeight = rect.height - padding.top - padding.bottom;
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const values = [170, 345, 250, 255, 345, 288, 470];
  const maxValue = 600;
  const accent = "#c7c967";

  ctx.font = "12px Inter, sans-serif";
  ctx.textBaseline = "middle";

  for (let i = 0; i <= 6; i += 1) {
    const value = i * 100;
    const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
    ctx.strokeStyle = "rgba(255,255,255,0.065)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartWidth, y);
    ctx.stroke();
    ctx.fillStyle = "#aaa69d";
    ctx.textAlign = "right";
    ctx.fillText(value === 0 ? "0" : `${value}k`, padding.left - 18, y);
  }

  const points = values.map((value, index) => ({
    x: padding.left + (index / (values.length - 1)) * chartWidth,
    y: padding.top + chartHeight - (value / maxValue) * chartHeight,
  }));

  const area = new Path2D();
  area.moveTo(points[0].x, padding.top + chartHeight);
  points.forEach((point, index) => {
    if (index === 0) area.lineTo(point.x, point.y);
    else {
      const previous = points[index - 1];
      const midX = (previous.x + point.x) / 2;
      area.bezierCurveTo(midX, previous.y, midX, point.y, point.x, point.y);
    }
  });
  area.lineTo(points[points.length - 1].x, padding.top + chartHeight);
  area.closePath();

  const fill = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
  fill.addColorStop(0, "rgba(199, 201, 103, 0.34)");
  fill.addColorStop(1, "rgba(199, 201, 103, 0.04)");
  ctx.fillStyle = fill;
  ctx.fill(area);

  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else {
      const previous = points[index - 1];
      const midX = (previous.x + point.x) / 2;
      ctx.bezierCurveTo(midX, previous.y, midX, point.y, point.x, point.y);
    }
  });
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.stroke();

  labels.forEach((label, index) => {
    const x = padding.left + (index / (labels.length - 1)) * chartWidth;
    ctx.fillStyle = "#b7b3aa";
    ctx.textAlign = "center";
    ctx.fillText(label, x, rect.height - 14);
  });

  const friday = points[4];
  ctx.setLineDash([3, 5]);
  ctx.strokeStyle = "rgba(255,255,255,0.48)";
  ctx.beginPath();
  ctx.moveTo(friday.x, friday.y - 8);
  ctx.lineTo(friday.x, padding.top + chartHeight);
  ctx.stroke();
  ctx.setLineDash([]);

  const badgeWidth = 56;
  const badgeHeight = 34;
  const badgeX = friday.x - badgeWidth / 2;
  const badgeY = friday.y - 52;
  roundRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 8);
  ctx.fillStyle = "rgba(118, 119, 64, 0.78)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("470K", friday.x, badgeY + badgeHeight / 2);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

window.addEventListener("load", () => {
  initIcons();
  renderMoodBars();
  drawTrendChart();
});

window.addEventListener("resize", drawTrendChart);