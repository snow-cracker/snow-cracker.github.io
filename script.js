const $ = id => document.getElementById(id);
let currentList = planes;
let editIndex = -1;
let sliderImages = [];
let sliderItems = [];
let sliderIndex = 0;
let tempImageList = [];
let currentGroupReg = '';

// 初始化
if(planes) render();

// ---------------- 渲染 ----------------
function render() {
    const gallery = $('gallery');
    gallery.innerHTML = '';
    if (!currentList || !currentList.length) return;

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
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${firstImg}">
            <div class="info">
                <div>航空公司：${first.airline || '-'}</div>
                <div>飞机机型：${first.model || '-'}</div>
                <div>注册编号：${first.reg || '-'}</div>
            </div>`;
        card.onclick = () => openGroupDetail(group);
        gallery.appendChild(card);
    });
}

// ---------------- 删除本组 ----------------
function deleteGroup(reg) {
    if (!confirm('确定删除该注册号所有图片？删除后无法恢复')) return;
    planes = planes.filter(p => (p.reg || 'unknown').trim() !== reg.trim());
    savePlanes();
    currentList = planes;
    closeDetail();
    render();
}

// ---------------- 详情页 ----------------
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
    $('detailModal').style.display = 'flex';
}

// 🔥 修复：更新详情（切换图片时信息也跟着换）
function updateDetail() {
    if (!sliderItems.length) return;

    const { item } = sliderItems[sliderIndex] || { item: {} };
    const img = sliderImages[sliderIndex] || '';

    $('detailImg').src = img;
    $('detailInfo').innerHTML = `
        <div>拍摄时间：${item.time || '-'}</div>
        <div>拍摄地点：${item.location || '-'}</div>
        <div>ICAO：${item.icao || '-'}</div>
        <div>航空公司：${item.airline || '-'}</div>
        <div>航司代码：${item.airlineCode || '-'}</div>
        <div>所属国家：${item.country || '-'}</div>
        <div>飞机机型：${item.model || '-'}</div>
        <div>注册编号：${item.reg || '-'}</div>
        <div>起降情况：${item.status || '-'}</div>
        <div>备注：${item.note || '-'}</div>`;
}

// 🔥 修复：左右箭头可循环切换
function prevImg() {
    if (!sliderItems.length) return;
    sliderIndex = (sliderIndex - 1 + sliderItems.length) % sliderItems.length;
    updateDetail();
}

function nextImg() {
    if (!sliderItems.length) return;
    sliderIndex = (sliderIndex + 1) % sliderItems.length;
    updateDetail();
}

// ---------------- 上传 ----------------
function openUpload() { editIndex = -1; clearForm(); $('uploadModal').style.display = 'flex'; }
function closeUpload() { $('uploadModal').style.display = 'none'; }

function clearForm() {
    ['time','location','icao','airline','airlineCode','country','model','reg','status','note'].forEach(id => { const el = $(id); if(el) el.value = ''; });
    tempImageList = [];
    refreshPreview();
}

function addImages() {
    const files = $('imgFiles').files;
    if (!files.length) return;
    let loaded = 0;
    for (let i=0;i<files.length;i++) {
        const reader = new FileReader();
        reader.onload = e => { tempImageList.push(e.target.result); loaded++; if(loaded===files.length) refreshPreview(); };
        reader.readAsDataURL(files[i]);
