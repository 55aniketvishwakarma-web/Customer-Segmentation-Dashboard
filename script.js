const customers = [
  { CustomerID: 1, Age: 22, AnnualIncome: 45000, SpendingScore: 88 },
  { CustomerID: 2, Age: 26, AnnualIncome: 52000, SpendingScore: 92 },
  { CustomerID: 3, Age: 24, AnnualIncome: 48000, SpendingScore: 81 },
  { CustomerID: 4, Age: 29, AnnualIncome: 61000, SpendingScore: 90 },
  { CustomerID: 5, Age: 27, AnnualIncome: 57000, SpendingScore: 86 },
  { CustomerID: 6, Age: 43, AnnualIncome: 42000, SpendingScore: 25 },
  { CustomerID: 7, Age: 51, AnnualIncome: 39000, SpendingScore: 19 },
  { CustomerID: 8, Age: 47, AnnualIncome: 46000, SpendingScore: 31 },
  { CustomerID: 9, Age: 56, AnnualIncome: 51000, SpendingScore: 22 },
  { CustomerID: 10, Age: 49, AnnualIncome: 44000, SpendingScore: 28 },
  { CustomerID: 11, Age: 38, AnnualIncome: 98000, SpendingScore: 82 },
  { CustomerID: 12, Age: 45, AnnualIncome: 115000, SpendingScore: 91 },
  { CustomerID: 13, Age: 41, AnnualIncome: 105000, SpendingScore: 87 },
  { CustomerID: 14, Age: 52, AnnualIncome: 128000, SpendingScore: 79 },
  { CustomerID: 15, Age: 36, AnnualIncome: 92000, SpendingScore: 85 },
  { CustomerID: 16, Age: 31, AnnualIncome: 30000, SpendingScore: 38 },
  { CustomerID: 17, Age: 34, AnnualIncome: 28000, SpendingScore: 29 },
  { CustomerID: 18, Age: 39, AnnualIncome: 35000, SpendingScore: 42 },
  { CustomerID: 19, Age: 28, AnnualIncome: 32000, SpendingScore: 35 },
  { CustomerID: 20, Age: 42, AnnualIncome: 37000, SpendingScore: 33 },
];
let result = { labels: [], centroids: [], iterations: 0 };
function norm(a) {
  let min = Math.min(...a),
    max = Math.max(...a);
  return a.map((v) => (max === min ? 0 : (v - min) / (max - min)));
}
function kmeans(data, k, x, y) {
  let xs = norm(data.map((d) => d[x])),
    ys = norm(data.map((d) => d[y])),
    cs = [],
    used = new Set();
  while (cs.length < k) {
    let i = Math.floor(Math.random() * data.length);
    if (!used.has(i)) {
      used.add(i);
      cs.push([xs[i], ys[i]]);
    }
  }
  let labels = new Array(data.length).fill(-1),
    its = 0;
  for (let t = 0; t < 100; t++) {
    its++;
    let changed = false;
    for (let i = 0; i < data.length; i++) {
      let best = 0,
        bd = Infinity;
      for (let c = 0; c < k; c++) {
        let dx = xs[i] - cs[c][0],
          dy = ys[i] - cs[c][1],
          dist = dx * dx + dy * dy;
        if (dist < bd) {
          bd = dist;
          best = c;
        }
      }
      if (labels[i] !== best) changed = true;
      labels[i] = best;
    }
    let sums = Array.from({ length: k }, () => [0, 0, 0]);
    for (let i = 0; i < data.length; i++) {
      sums[labels[i]][0] += xs[i];
      sums[labels[i]][1] += ys[i];
      sums[labels[i]][2]++;
    }
    let next = cs.map((c, i) =>
      sums[i][2] ? [sums[i][0] / sums[i][2], sums[i][1] / sums[i][2]] : c,
    );
    let move = cs.reduce(
      (s, c, i) =>
        s + Math.abs(c[0] - next[i][0]) + Math.abs(c[1] - next[i][1]),
      0,
    );
    cs = next;
    if (!changed || move < 0.00001) break;
  }
  return { labels, centroids: cs, iterations: its };
}
function run() {
  let k = +kValue.value,
    x = featureX.value,
    y = featureY.value;
  result = kmeans(customers, k, x, y);
  customers.forEach((d, i) => (d.cluster = result.labels[i]));
  status.textContent = `K-Means completed in ${result.iterations} iterations`;
  clusterCount.textContent = k;
  iterations.textContent = result.iterations;
  let counts = Array(k).fill(0);
  result.labels.forEach((c) => counts[c]++);
  largestCluster.textContent = Math.max(...counts);
  draw(x, y);
  summary(k);
  table();
  legend.innerHTML = Array.from(
    { length: k },
    (_, i) => `<span>Cluster ${i + 1}</span>`,
  ).join("");
}
function draw(x, y) {
  let c = document.getElementById("scatterCanvas"),
    r = c.getBoundingClientRect(),
    dpr = devicePixelRatio || 1;
  c.width = r.width * dpr;
  c.height = 360 * dpr;
  let ctx = c.getContext("2d");
  ctx.scale(dpr, dpr);
  let w = r.width,
    h = 360,
    p = 45,
    X = customers.map((d) => d[x]),
    Y = customers.map((d) => d[y]),
    xmin = Math.min(...X),
    xmax = Math.max(...X),
    ymin = Math.min(...Y),
    ymax = Math.max(...Y),
    sx = (v) => p + ((v - xmin) / (xmax - xmin || 1)) * (w - p * 1.6),
    sy = (v) => h - p - ((v - ymin) / (ymax - ymin || 1)) * (h - p * 1.5);
  ctx.strokeStyle = "#d9dee7";
  ctx.beginPath();
  ctx.moveTo(p, 15);
  ctx.lineTo(p, h - p);
  ctx.lineTo(w - 15, h - p);
  ctx.stroke();
  ctx.fillStyle = "#667085";
  ctx.font = "12px Arial";
  ctx.fillText(x, p, h - 8);
  ctx.save();
  ctx.translate(13, h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(y, 0, 0);
  ctx.restore();
  customers.forEach((d, i) => {
    ctx.beginPath();
    ctx.arc(sx(d[x]), sy(d[y]), 6, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${(result.labels[i] * 360) / Math.max(1, result.centroids.length) + 210},70%,50%)`;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.stroke();
  });
}
function summary(k) {
  clusterSummary.innerHTML = "";
  for (let c = 0; c < k; c++) {
    let g = customers.filter((d) => d.cluster === c);
    if (!g.length) continue;
    let a = g.reduce((s, d) => s + d.Age, 0) / g.length,
      inc = g.reduce((s, d) => s + d.AnnualIncome, 0) / g.length,
      sp = g.reduce((s, d) => s + d.SpendingScore, 0) / g.length;
    clusterSummary.innerHTML += `<div class="summary-row"><div class="summary-title">Cluster ${c + 1} — ${g.length} customers</div><div class="summary-values">Avg Age: ${a.toFixed(1)} • Avg Income: ₹${Math.round(inc).toLocaleString()} • Avg Spend: ${sp.toFixed(1)}</div></div>`;
  }
}
function table() {
  dataTable.innerHTML = customers
    .map(
      (d) =>
        `<tr><td>${d.CustomerID}</td><td>${d.Age}</td><td>₹${d.AnnualIncome.toLocaleString()}</td><td>${d.SpendingScore}</td><td><span class="badge">Cluster ${d.cluster + 1}</span></td></tr>`,
    )
    .join("");
}
runBtn.addEventListener("click", run);
[kValue, featureX, featureY].forEach((e) => e.addEventListener("change", run));
addEventListener("resize", () => draw(featureX.value, featureY.value));
