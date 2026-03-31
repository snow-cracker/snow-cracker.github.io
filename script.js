const $ = id => document.getElementById(id);

let currentList = planes;
let editIndex = -1;
let sliderImages = [];
let sliderItems = [];
let sliderIndex = 0;
let tempImageList = [];
let currentGroupReg = '';

// 初始化 IndexedDB 并渲染
initDB(() => { currentList = planes; render(); });

// ------------------ 渲染画廊 ------------------
function render() {
    const gallery = $("gallery");
    gallery.innerHTML = "";
    if (!currentList) return;

    // 按注册号分组
    const groups = {};
    currentList.forEach((item, idx) => {
        if (!item) return;
        const reg = (item.reg || 'unknown').trim();
        if (!groups[reg]) groups[reg] = [];
        groups[reg].push({ item, index: idx });
    });

    Object.values(groups).forEach(group => {
        const first = group[0].item;
        const firstImg = first.images?.length > 0 ? first.images[0] : '';

        const card = document.createElement("div");
        card.className = "card";

        // 小磁贴封面：竖屏中央截取横屏比例
        card.innerHTML = `
            <img src="${firstImg}">
            <div class="info">
                <div>航空公司: ${first.airline || '-'}</div>
                <div>飞机机型: ${first.model || '-'}</div>
                <div>注册编号: ${first.reg || '-'}</div>
            </div>
        `;
        card.onclick = () => openGroupDetail(group);
        gallery.appendChild(card);
    });
}

// ------------------ 打开组详情 ------------------
function openGroupDetail(group) {
    sliderItems = [];
    sliderImages = [];
    currentGroupReg = '';

    group.forEach(({ item, index }) => {
        if (!currentGroupReg) currentGroupReg = item.reg || '';
        (item.images || []).forEach(img => {
            sliderItems.push({ item, index });
            sliderImages.push(img);
        });
    });

    sliderIndex = 0;
    updateDetail();
    $("detailModal").style.display = "flex";
}

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

// ------------------ 上传弹窗 ------------------
function openUpload() {
    editIndex = -1;
    clearForm();
    $("uploadModal").style.display = "flex";
}

function closeUpload() { $("uploadModal").style.display = "none"; }

function clearForm() {
    ["time","location","icao","airline","airlineCode","country","model","reg","status","note"].forEach(id => {
        if($(id)) $(id).value = "";
    });
    tempImageList = [];
    refreshPreview();
}

function addImages() {
    const files = $("imgFiles").files;
    if (!files.length) return;
    let loaded = 0;
    for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = e => {
            tempImageList.push(e.target.result);
            loaded++;
            if (loaded === files.length) refreshPreview();
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
        item.innerHTML = `<img src="${src}"><button class="del-img" onclick="removeImage(${idx})">×</button>`;
        wrap.appendChild(item);
    });
}

function removeImage(index) {
    tempImageList.splice(index,1);
    refreshPreview();
}

function submitPhoto() {
    if (!tempImageList.length) { alert("请选择图片"); return; }

    const base = {};
    ["time","location","icao","airline","airlineCode","country","model","reg","status","note"].forEach(id => {
        base[id] = $(id).value;
    });

    tempImageList.forEach(img => {
        const data = {...base, images:[img]};
        planes.unshift(data);
    });

    savePlanes();
    currentList = planes;
    closeUpload();
    render();
    alert("提交成功！同注册号自动合并");
}

// ------------------ 编辑 ------------------
function openEdit() {
    closeDetail();
    const { item, index } = sliderItems[sliderIndex] || {};
    if (!item) return;
    editIndex = index;

    ["time","location","icao","airline","airlineCode","country","model","reg","status","note"].forEach(id => {
        $(id).value = item[id] || "";
    });
    tempImageList = [...(item.images || [])];
    refreshPreview();
    $("uploadModal").style.display = "flex";
}

// ------------------ 详情全屏 ------------------
function openFullScreen() {
    $("fullImg").src = sliderImages[sliderIndex] || '';
    $("fullModal").style.display = "flex";
}
function closeFullScreen() { $("fullModal").style.display = "none"; }
function closeDetail() { $("detailModal").style.display = "none"; }

// ------------------ 删除 ------------------
function deleteGroup(reg) {
    if (!confirm('确定删除该注册号所有记录？删除后无法恢复')) return;
    planes = planes.filter(p => (p.reg||'').trim() !== reg.trim());
    savePlanes();
    currentList = planes;
    closeDetail();
    render();
}

// ------------------ 搜索 & 分类 ------------------
function doSearch() {
    const kw = $("search").value.toLowerCase().split(' ').filter(Boolean);
    currentList = planes.filter(item => kw.every(k => JSON.stringify(item).toLowerCase().includes(k)));
    render();
}

function setSubNav(items, onClick) {
    const box = $("subNav");
    box.innerHTML = "";
    const clearBtn = document.createElement("button");
    clearBtn.innerText = "清空";
    clearBtn.onclick = () => { currentList = planes; render(); };
    box.appendChild(clearBtn);

    items.forEach(item => {
        const btn = document.createElement("button");
        btn.innerText = item;
        btn.onclick = () => onClick(item);
        box.appendChild(btn);
    });
}

function navByTime() {
    const times = [...new Set(planes.map(p=>p.time).filter(Boolean))].sort();
    setSubNav(times, t => { currentList = planes.filter(p=>p.time===t); render(); });
}

function navByLocation() {
    const locs = [...new Set(planes.map(p=>p.location).filter(Boolean))].sort();
    setSubNav(locs, l => { currentList = planes.filter(p=>p.location===l); render(); });
}

function navByAirline() {
    setSubNav(["中国航司","外国航司"], type => {
        const filtered = type==="中国航司"? planes.filter(p=>p.country==="中国") : planes.filter(p=>p.country!=="中国");
        const airlines = [...new Set(filtered.map(p=>p.airline).filter(Boolean))].sort();
        setSubNav(airlines, a=>{ currentList = planes.filter(p=>p.airline===a); render(); });
    });
}

function navByModel() {
    const models = [...new Set(planes.map(p=>p.model).filter(Boolean))].sort();
    setSubNav(models, m => { currentList = planes.filter(p=>p.model===m); render(); });
}
