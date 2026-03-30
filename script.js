const $ = id => document.getElementById(id);
let currentList = planes;
let editIndex = -1;
let sliderImages = [];
let sliderIndex = 0;
let tempImages = [];

if (localStorage.planeGallery) {
    planes = JSON.parse(localStorage.planeGallery);
    currentList = planes;
}
render();

function render() {
    const gallery = $("gallery");
    gallery.innerHTML = "";
    const groups = {};
    currentList.forEach(p => {
        const key = p.airline + p.model + p.fullModel + p.reg;
        if (!groups[key]) groups[key] = [];
        groups[key].push(p);
    });
    Object.values(groups).forEach(group => {
        const item = group[0];
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${item.images[0]}">
            <div class="info">
                <div>航司：${item.airline}</div>
                <div>机型：${item.model}</div>
                <div>${item.fullModel}</div>
                <div>注册号：${item.reg}</div>
            </div>
        `;
        card.onclick = () => openDetail(group);
        gallery.appendChild(card);
    });
}

function previewImages() {
    const files = $("imgFiles").files;
    tempImages = [];
    const area = $("previewArea");
    area.innerHTML = "";
    for (let i = 0; i < files.length; i++) {
        const url = URL.createObjectURL(files[i]);
        tempImages.push(url);
        const img = document.createElement("img");
        img.src = url;
        const del = document.createElement("button");
        del.innerText = "×";
        del.onclick = () => {
            tempImages.splice(i, 1);
            previewImages();
        };
        const box = document.createElement("span");
        box.appendChild(img);
        box.appendChild(del);
        area.appendChild(box);
    }
}

function openUpload() {
    editIndex = -1;
    clearForm();
    $("uploadModal").style.display = "block";
}

function closeUpload() {
    $("uploadModal").style.display = "none";
}

function clearForm() {
    $("time").value = "";
    $("location").value = "";
    $("icao").value = "";
    $("airline").value = "";
    $("airlineCode").value = "";
    $("country").value = "";
    $("model").value = "";
    $("fullModel").value = "";
    $("age").value = "";
    $("reg").value = "";
    $("status").value = "";
    $("note").value = "";
    $("imgFiles").value = "";
    tempImages = [];
    $("previewArea").innerHTML = "";
}

function submitPhoto() {
    const data = {
        time: $("time").value || "",
        location: $("location").value || "",
        icao: $("icao").value || "",
        airline: $("airline").value || "",
        airlineCode: $("airlineCode").value || "",
        country: $("country").value || "",
        model: $("model").value || "",
        fullModel: $("fullModel").value || "",
        age: $("age").value || "",
        reg: $("reg").value || "",
        status: $("status").value || "",
        note: $("note").value || "",
        images: [...tempImages]
    };
    if (editIndex >= 0) {
        planes[editIndex] = data;
    } else {
        planes.unshift(data);
    }
    localStorage.planeGallery = JSON.stringify(planes);
    currentList = planes;
    closeUpload();
    render();
    alert("提交成功！");
}

function doSearch() {
    const keywords = $("search").value.toLowerCase().split(" ").filter(k => k);
    currentList = planes.filter(item => {
        const text = JSON.stringify(item).toLowerCase();
        return keywords.every(k => text.includes(k));
    });
    render();
}

function openDetail(group) {
    sliderImages = [];
    group.forEach(g => sliderImages.push(...g.images));
    sliderIndex = 0;
    const target = group[0];
    editIndex = planes.findIndex(p =>
        p.time === target.time &&
        p.location === target.location &&
        p.reg === target.reg
    );
    updateDetail();
    $("detailModal").style.display = "block";
}

function updateDetail() {
    $("showImg").src = sliderImages[sliderIndex];
    const p = planes[editIndex];
    $("detailInfo").innerHTML = `
        <div>拍摄时间：${p.time}</div>
        <div>拍摄地点：${p.location}</div>
        <div>ICAO代码：${p.icao}</div>
        <div>航空公司：${p.airline}</div>
        <div>航司代码：${p.airlineCode}</div>
        <div>所属国家：${p.country}</div>
        <div>飞机机型：${p.model}</div>
        <div>具体机型：${p.fullModel}</div>
        <div>机龄：${p.age}</div>
        <div>飞机注册号：${p.reg}</div>
        <div>起降情况：${p.status}</div>
        <div>备注：${p.note}</div>
    `;
}

function prevImg() {
    sliderIndex--;
    if (sliderIndex < 0) sliderIndex = sliderImages.length - 1;
    updateDetail();
}

function nextImg() {
    sliderIndex++;
    if (sliderIndex >= sliderImages.length) sliderIndex = 0;
    updateDetail();
}

function closeDetail() {
    $("detailModal").style.display = "none";
}

function openEdit() {
    closeDetail();
    const p = planes[editIndex];
    $("time").value = p.time || "";
    $("location").value = p.location || "";
    $("icao").value = p.icao || "";
    $("airline").value = p.airline || "";
    $("airlineCode").value = p.airlineCode || "";
    $("country").value = p.country || "";
    $("model").value = p.model || "";
    $("fullModel").value = p.fullModel || "";
    $("age").value = p.age || "";
    $("reg").value = p.reg || "";
    $("status").value = p.status || "";
    $("note").value = p.note || "";
    tempImages = [...p.images];
    $("uploadModal").style.display = "block";
}

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

function navByTime() {
    const times = [...new Set(planes.map(p => p.time))].filter(Boolean).sort();
    subNav(times, t => {
        const locs = [...new Set(planes.filter(p => p.time === t).map(p => p.location))].filter(Boolean).sort();
        subNav(locs, l => {
            currentList = planes.filter(p => p.time === t && p.location === l);
            render();
        });
    });
}

function navByLocation() {
    const locs = [...new Set(planes.map(p => p.location))].filter(Boolean).sort();
    subNav(locs, l => {
        const times = [...new Set(planes.filter(p => p.location === l).map(p => p.time))].filter(Boolean).sort();
        subNav(times, t => {
            currentList = planes.filter(p => p.location === l && p.time === t);
            render();
        });
    });
}

function navByAirline() {
    subNav(["中国航司", "外国航司"], type => {
        const filtered = type === "中国航司"
            ? planes.filter(p => p.country === "中国")
            : planes.filter(p => p.country !== "中国");
        const airlines = [...new Set(filtered.map(p => p.airline))].filter(Boolean).sort();
        subNav(airlines, a => {
            currentList = planes.filter(p => p.airline === a);
            render();
        });
    });
}

function navByModel() {
    const models = [...new Set(planes.map(p => p.model))].filter(Boolean).sort();
    subNav(models, m => {
        const airlines = [...new Set(planes.filter(p => p.model === m).map(p => p.airline))].filter(Boolean).sort();
        subNav(airlines, a => {
            currentList = planes.filter(p => p.model === m && p.airline === a);
            render();
        });
    });
}
