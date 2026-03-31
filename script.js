const $ = id => document.getElementById(id);
let currentList = planes;
let editIndex = -1;
let sliderImages = [];
let sliderIndex = 0;
let tempImageList = [];

if (localStorage.planeGallery) {
    planes = JSON.parse(localStorage.planeGallery);
    currentList = planes;
}
render();

function render() {
    const gallery = $("gallery");
    gallery.innerHTML = "";
    currentList.forEach((item, idx) => {
        if (!item || !item.images || item.images.length === 0) return;
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${item.images[0]}">
            <div class="info">
                <div>航司：${item.airline || '-'}</div>
                <div>机型：${item.fullModel || '-'}</div>
                <div>注册号：${item.reg || '-'}</div>
            </div>
        `;
        card.onclick = () => openDetail(item, idx);
        gallery.appendChild(card);
    });
}

function openUpload() {
    editIndex = -1;
    clearForm();
    $("uploadModal").style.display = "flex";
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
    tempImageList = [];
    refreshPreview();
}

function addImages() {
    const files = $("imgFiles").files;
    for (let i = 0; i < files.length; i++) {
        const url = URL.createObjectURL(files[i]);
        tempImageList.push(url);
    }
    refreshPreview();
}

function refreshPreview() {
    const wrap = $("previewWrapper");
    wrap.innerHTML = "";
    tempImageList.forEach((src, idx) => {
        const item = document.createElement("div");
        item.className = "preview-item";
        item.innerHTML = `<img src="${src}"><button class="del-img" onclick="removeImage(${idx})">×</button>`;
        wrap.appendChild(item);
    });
}

function removeImage(index) {
    tempImageList.splice(index, 1);
    refreshPreview();
}

function submitPhoto() {
    if (tempImageList.length === 0) {
        alert("请至少选择一张图片");
        return;
    }
    const data = {
        time: $("time").value,
        location: $("location").value,
        icao: $("icao").value,
        airline: $("airline").value,
        airlineCode: $("airlineCode").value,
        country: $("country").value,
        model: $("model").value,
        fullModel: $("fullModel").value,
        age: $("age").value,
        reg: $("reg").value,
        status: $("status").value,
        note: $("note").value,
        images: [...tempImageList]
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

function openDetail(item, index) {
    if (!item || !item.images || item.images.length === 0) {
        alert("暂无图片");
        return;
    }
    sliderImages = item.images;
    sliderIndex = 0;
    editIndex = index;
    updateDetail();
    $("detailModal").style.display = "flex";
}

function updateDetail() {
    $("detailImg").src = sliderImages[sliderIndex];
    const p = planes[editIndex] || {};
    $("detailInfo").innerHTML = `
        <div>拍摄时间：${p.time || '-'}</div>
        <div>拍摄地点：${p.location || '-'}</div>
        <div>ICAO：${p.icao || '-'}</div>
        <div>航空公司：${p.airline || '-'}</div>
        <div>航司代码：${p.airlineCode || '-'}</div>
        <div>国家：${p.country || '-'}</div>
        <div>机型：${p.model || '-'}</div>
        <div>具体型号：${p.fullModel || '-'}</div>
        <div>机龄：${p.age || '-'}</div>
        <div>注册号：${p.reg || '-'}</div>
        <div>起降：${p.status || '-'}</div>
        <div>备注：${p.note || '-'}</div>
    `;
}

function prevImg() {
    sliderIndex = (sliderIndex - 1 + sliderImages.length) % sliderImages.length;
    updateDetail();
}

function nextImg() {
    sliderIndex = (sliderIndex + 1) % sliderImages.length;
    updateDetail();
}

function openFullScreen() {
    $("fullImg").src = sliderImages[sliderIndex];
    $("fullModal").style.display = "flex";
}

function closeFullScreen() {
    $("fullModal").style.display = "none";
}

function closeDetail() {
    $("detailModal").style.display = "none";
}

function openEdit() {
    closeDetail();
    const p = planes[editIndex] || {};
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
    tempImageList = [...(p.images || [])];
    refreshPreview();
    $("uploadModal").style.display = "flex";
}

function doSearch() {
    const keywords = $("search").value.toLowerCase().split(" ").filter(k => k);
    currentList = planes.filter(item => keywords.every(k =>
        JSON.stringify(item).toLowerCase().includes(k)
    ));
    render();
}

function setSubNav(items, onClick) {
    const box = $("subNav");
    box.innerHTML = "";
    items.forEach(item => {
        const btn = document.createElement("button");
        btn.innerText = item;
        btn.onclick = () => onClick(item);
        box.appendChild(btn);
    });
}

function navByTime() {
    const times = [...new Set(planes.map(p => p.time).filter(Boolean))].sort();
    setSubNav(times, t => {
        const locs = [...new Set(planes.filter(p => p.time === t).map(p => p.location).filter(Boolean))].sort();
        setSubNav(locs, l => {
            currentList = planes.filter(p => p.time === t && p.location === l);
            render();
        });
    });
}

function navByLocation() {
    const locs = [...new Set(planes.map(p => p.location).filter(Boolean))].sort();
    setSubNav(locs, l => {
        const times = [...new Set(planes.filter(p => p.location === l).map(p => p.time).filter(Boolean))].sort();
        setSubNav(times, t => {
            currentList = planes.filter(p => p.location === l && p.time === t);
            render();
        });
    });
}

function navByAirline() {
    setSubNav(["中国航司", "外国航司"], type => {
        const filtered = type === "中国航司"
            ? planes.filter(p => p.country === "中国")
            : planes.filter(p => p.country !== "中国");
        const airlines = [...new Set(filtered.map(p => p.airline).filter(Boolean))].sort();
        setSubNav(airlines, a => {
            currentList = planes.filter(p => p.airline === a);
            render();
        });
    });
}

function navByModel() {
    const models = [...new Set(planes.map(p => p.model).filter(Boolean))].sort();
    setSubNav(models, m => {
        const airlines = [...new Set(planes.filter(p => p.model === m).map(p => p.airline).filter(Boolean))].sort();
        setSubNav(airlines, a => {
            currentList = planes.filter(p => p.model === m && p.airline === a);
            render();
        });
    });
}
