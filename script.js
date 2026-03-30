const $ = id => document.getElementById(id);
let current = planes;

// 本地存储（刷新不丢失）
if (localStorage.planeData) planes = JSON.parse(localStorage.planeData);
render();

// 打开/关闭上传弹窗
function openUpload() { $("uploadModal").style.display = "block"; }
function closeUpload() { $("uploadModal").style.display = "none"; }

// 提交上传（含ICAO字段）
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
  const wall = $("wall");
  wall.innerHTML = "";
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

// 搜索（空格分隔多关键词）
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
  for (let k of Object.keys(p)) {
    if (k !== "images") txt += `${k}：${p[k]}\n`;
  }
  txt += `\n图片数量：${imgs.length}`;
  alert(txt);
}

// 子导航按钮生成
function subNav(list, callback) {
  const box = $("subNav");
  box.innerHTML = "";
  list.forEach(item => {
    const btn = document.createElement("button");
    btn.innerText = item;
    btn.onclick = () => callback(item);
    box.appendChild(btn);
  });
}

// 导航：拍摄时间 → 拍摄地点
function navTime() {
  const times = [...new Set(planes.map(p => p.time))].sort();
  subNav(times, time => {
    current = planes.filter(p => p.time === time);
    const locations = [...new Set(current.map(p => p.location))].sort();
    subNav(locations, location => {
      current = planes.filter(p => p.time === time && p.location === location);
      render();
    });
  });
}

// 导航：拍摄地点 → 拍摄时间
function navLocation() {
  const locations = [...new Set(planes.map(p => p.location))].sort();
  subNav(locations, location => {
    current = planes.filter(p => p.location === location);
    const times = [...new Set(current.map(p => p.time))].sort();
    subNav(times, time => {
      current = planes.filter(p => p.location === location && p.time === time);
      render();
    });
  });
}

// 导航：航空公司（国籍判断：仅“中国”为中国航司，其余为外国）
function navAirline() {
  subNav(["中国航司", "外国航司"], type => {
    let filteredPlanes;
    if (type === "中国航司") {
      filteredPlanes = planes.filter(p => p.country === "中国");
    } else {
      filteredPlanes = planes.filter(p => p.country !== "中国");
    }
    const airlines = [...new Set(filteredPlanes.map(p => p.airline))].sort();
    subNav(airlines, airline => {
      current = planes.filter(p => p.airline === airline);
      const models = [...new Set(current.map(p => p.model))].sort();
      subNav(models, model => {
        current = planes.filter(p => p.airline === airline && p.model === model);
        render();
      });
    });
  });
}

// 导航：飞机机型 → 航空公司
function navModel() {
  const models = [...new Set(planes.map(p => p.model))].sort();
  subNav(models, model => {
    current = planes.filter(p => p.model === model);
    const airlines = [...new Set(current.map(p => p.airline))].sort();
    subNav(airlines, airline => {
      current = planes.filter(p => p.model === model && p.airline === airline);
      render();
    });
  });
}
