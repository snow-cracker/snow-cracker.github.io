const $ = id => document.getElementById(id);
let currentList = planes;
let editIndex = -1;
let sliderImages = [];
let sliderItems = [];
let sliderIndex = 0;
let tempImageList = [];

if (localStorage.planeGallery) {
    try {
        planes = JSON.parse(localStorage.planeGallery);
        currentList = planes;
    } catch (e) {
        planes = [];
    }
}
render();

// 按注册号合并渲染
function render() {
    const gallery = $("gallery");
    gallery.innerHTML = "";
    if (!currentList) return;

    // 按 reg 分组
    const groups = {};
    currentList.forEach((item, idx) => {
        if (!item) return;
        const reg = (item.reg || 'unknown').trim();
        if (!groups[reg]) groups[reg] = [];
        groups[reg].push({ item, index: idx });
    });

    Object.values(groups).forEach(group => {
        const first = group[0].item;
        const firstImg = (first.images?.length > 0) ? first.images[0] : '';

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${firstImg}" style="width:100%;display:block;">
            <div class="info">
                <div>航司：${first.airline || '-'}</div>
                <div>机型：${first.model || '-'}</div>
                <div>注册号：${first.reg || '-'}</div>
                <button onclick="deleteGroup('${first.reg}', event)" 
                    style="margin-top:8px;background:#ff4444;color:white;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;">
                    删除本组
                </button>
            </div>
        `;
        card.onclick = (e) => {
            if (!e.target.closest('button')) openGroupDetail(group);
        };
        gallery.appendChild(card);
    });
}

// 删除整组（同注册号）
function deleteGroup(reg, e) {
    e.stopPropagation();
    if (!confirm('确定删除该注册号所有记录？')) return;
    planes = planes.filter(p => (p.reg || '').trim() !== reg.trim());
    localStorage.planeGallery = JSON.stringify(planes);
    currentList = planes;
    render();
}

// 打开合并后的详情
function openGroupDetail(group) {
    sliderItems = [];
    sliderImages = [];
    group.forEach(({ item, index }) => {
        (item.images || []).forEach(img => {
            sliderItems.push({ item, index });
            sliderImages.push(img);
        });
    });
    sliderIndex = 0;
    updateDetail();
    $("detailModal").style.display = "flex";
}

// 更新详情：图片 + 信息一起切换
function updateDetail() {
    const img = sliderImages[sliderIndex] || '';
    const { item } = sliderItems[sliderIndex] || { item: {} };
    $("detailImg").src = img;

    $("detailInfo").innerHTML = `
        <div>拍摄时间：${item.time || '-'}</div>
        <div>拍摄地点：${item.location || '-'}</div>
        <div>ICAO：${item.icao || '-'}</div>
        <div>航空公司：${item.airline || '-'}</div>
        <div>航司代码：${item.airlineCode || '-'}</div>
        <div>国家：${item.country || '-'}</div>
        <div>机型：${item.model || '-'}</div>
        <div>注册号：${item.reg || '-'}</div>
        <div>起降：${item.status || '-'}</div>
        <div>备注：${item.note || '-'}</div>
    `;
}

// 左右切换
function prevImg() {
    if (sliderItems.length === 0) return;
    sliderIndex = (sliderIndex - 1 + sliderItems.length) % sliderItems.length;
    updateDetail();
}
function nextImg() {
    if (sliderItems.length === 0) return;
    sliderIndex = (sliderIndex + 1) % sliderItems.length;
    updateDetail();
}

// 上传相关
function openUpload() {
    editIndex = -1;
    clearForm();
    $("uploadModal").style.display = "flex";
}
function closeUpload() { $("uploadModal").style.display = "none"; }

function clearForm() {
    $("time").value = $("location").value = $("icao").value = "";
    $("airline").value = $("airlineCode").value = $("country").value = "";
    $("model").value = "";
    $("reg").value = $("status").value = $("note").value = "";
    tempImageList = [];
    refreshPreview();
}

// 图片转 base64 永久保存
function addImages() {
    const files = $("imgFiles").files;
    const total = files.length;
    if (total === 0) return;
    let loaded = 0;

    for (let i = 0; i < total; i++) {
        const reader = new FileReader();
        reader.onload = e => {
            tempImageList.push(e.target.result);
            loaded++;
            if (loaded === total) refreshPreview();
        };
        reader.readAsDataURL(files[i]);
    }
}

function refreshPreview() {
    const wrap = $("previewWrapper");
    wrap.innerHTML = "";
    tempImageList.forEach((src, idx) => {
        const item = document.createElement("div");
        item.className = "preview-item";
        item.innerHTML = `
            <img src="${src}" style="width:100%;height:100%;object-fit:cover;">
            <button class="del-img" onclick="removeImage(${idx})">×</button>
        `;
        wrap.appendChild(item);
    });
}

function removeImage(index) {
    tempImageList.splice(index, 1);
    refreshPreview();
}

// 提交：同注册号自动合并
function submitPhoto() {
    if (tempImageList.length === 0) {
        alert("请选择图片");
        return;
    }

    const base = {
        time: $("time").value,
        location: $("location").value,
        icao: $("icao").value,
        airline: $("airline").value,
        airlineCode: $("airlineCode").value,
        country: $("country").value,
        model: $("model").value,
        reg: $("reg").value,
        status: $("status").value,
        note: $("note").value
    };

    // 一次上传多张 = 多条同注册号记录，自动合并展示
    tempImageList.forEach(img => {
        const data = { ...base, images: [img] };
        planes.unshift(data);
    });

    localStorage.planeGallery = JSON.stringify(planes);
    currentList = planes;
    closeUpload();
    render();
    alert("提交成功！同注册号自动合并");
}

// 编辑
function openEdit() {
    closeDetail();
    const { item, index } = sliderItems[sliderIndex] || {};
    if (!item) return;
    editIndex = index;

    $("time").value = item.time || "";
    $("location").value = item.location || "";
    $("icao").value = item.icao || "";
    $("airline").value = item.airline || "";
    $("airlineCode").value = item.airlineCode || "";
    $("country").value = item.country || "";
    $("model").value = item.model || "";
    $("reg").value = item.reg || "";
    $("status").value = item.status || "";
    $("note").value = item.note || "";
    tempImageList = [...(item.images || [])];
    refreshPreview();
    $("uploadModal").style.display = "flex";
}

// 全屏
function openFullScreen() {
    $("fullImg").src = sliderImages[sliderIndex] || '';
    $("fullModal").style.display = "flex";
}
function closeFullScreen() { $("fullModal").style.display = "none"; }
function closeDetail() { $("detailModal").style.display = "none"; }

// 搜索
function doSearch() {
    const kw = $("search").value.toLowerCase().split(' ').filter(Boolean);
    currentList = planes.filter(item => 
        kw.every(k => JSON.stringify(item).toLowerCase().includes(k))
    );
    render();
}

// 分类导航
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
