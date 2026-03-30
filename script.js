const $ = id => document.getElementById(id);
let current = planes;

// 本地存储（永不丢失）
if (localStorage.planeData) planes = JSON.parse(localStorage.planeData);
render();

// 打开上传弹窗
function openUpload() { $("uploadModal").style.display = "block"; }
function closeUpload() { $("uploadModal").style.display = "none"; }

// 提交上传（你要的投稿功能）
function submitPlane() {
  const files = $("imgFiles").files;
  const images = [];
  for (let f of files) images.push(URL.createObjectURL(f));

  const plane = {
    time: $("time").value,
    location: $("location").value,
    icao: $("icao").value,
    airline: $("airline").value,
    country: $("country").value,
    model: $("model").value,
    fullModel: $("fullModel").value,
    age: $("age").value,
    reg: $("reg").value,
    status: $("status").value,
    note: $("note").value,
    images: images
  };

  planes.unshift(plane);
  localStorage.planeData = JSON.stringify(planes);
  closeUpload();
  render();
  alert("上传成功！");
}

// 渲染照片墙（相同飞机自动合并）
function render() {
  const wall = $("wall"); wall.innerHTML = "";
  const groups = {};

  for (let p of current) {
    const key = p.airline + p.model + p.fullModel + p.reg;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }

  for (let g of Object.values(groups)) {
    const p = g[0];
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.images[0]}">
      <div class="info">
        <div>航司：${p.airline}</div>
        <div>机型：${p.model}</div>
        <div>${p.fullModel}</div>
        <div>注册号：${p.reg}</div>
      </div>`;
    card.onclick = () => showDetail(g);
    wall.appendChild(card);
  }
}

// 搜索（空格多关键词）
function search() {
  const kw = $("search").value.toLowerCase().split(" ").filter(i => i);
  current = planes.filter(p => {
    const txt = JSON.stringify(p).toLowerCase();
    return kw.every(k => txt.includes(k));
  });
  render();
}

// 详情页
function showDetail(list) {
  const p = list[0];
  const imgs = list.flatMap(i => i.images);
  let txt = "\n";
  for (let k of Object.keys(p)) txt += `${k}: ${p[k]}\n`;
  alert(txt + "图片数量：" + imgs.length);
}

// 导航功能（你要的多级联动）
function navTime() {
  const list = [...new Set(planes.map(i => i.time))].sort();
  sub(list, t => {
    current = planes.filter(i => i.time === t);
    const locs = [...new Set(current.map(i => i.location))].sort();
    sub(locs, l => {
      current = planes.filter(i => i.time === t && i.location === l);
      render();
    });
  });
}

function navLocation() {
  const list = [...new Set(planes.map(i => i.location))].sort();
  sub(list, l => {
    current = planes.filter(i => i.location === l);
    const times = [...new Set(current.map(i => i.time))].sort();
    sub(times, t => {
      current = planes.filter(i => i.location === l && i.time === t);
      render();
    });
  });
}

function navAirline() {
  sub(["中国航司", "外国航司"], t => {
    const cs = t === "中国航司" ? "中国" : "外国";
    const as = [...new Set(planes.filter(i => i.country === cs).map(i => i.airline))].sort();
    sub(as, a => {
      current = planes.filter(i => i.airline === a);
      const ms = [...new Set(current.map(i => i.model))].sort();
      sub(ms, m => {
        current = planes.filter(i => i.airline === a && i.model === m);
        render();
      });
    });
  });
}

function navModel() {
  const list = [...new Set(planes.map(i => i.model))].sort();
  sub(list, m => {
    current = planes.filter(i => i.model === m);
    const as = [...new Set(current.map(i => i.airline))].sort();
    sub(as, a => {
      current = planes.filter(i => i.model === m && i.airline === a);
      render();
    });
  });
}

function sub(list, cb) {
  const box = $("subNav"); box.innerHTML = "";
  list.forEach(i => {
    const b = document.createElement("button");
    b.innerText = i; b.onclick = () => cb(i);
    box.appendChild(b);
  });
}
