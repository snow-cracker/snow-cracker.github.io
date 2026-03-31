const $ = id => document.getElementById(id);

let currentList = [], editIndex = -1, sliderImages = [], sliderItems = [], sliderIndex = 0, tempImageList = [], currentGroupReg = '';

// ---------------- IndexedDB 初始化 ----------------
initDB(() => {
    currentList = planes;
    render(); // 先渲染本地数据
    fetchRemoteData(); // 异步拉取远程 JSON，不阻断页面
});

// ---------------- 渲染函数 ----------------
function render() {
    const gallery = $('gallery');
    gallery.innerHTML = '';
    if (!currentList) return;

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
            <img src="${firstImg}" style="width:100%;display:block;">
            <div class="info">
                <div>航空公司：${first.airline || '-'}</div>
                <div>飞机机型：${first.model || '-'}</div>
                <div>注册编号：${first.reg || '-'}</div>
            </div>`;
        card.onclick = () => openGroupDetail(group);
        gallery.appendChild(card);
    });
}

// ---------------- 上传/编辑/删除 ----------------
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
    }
}

function refreshPreview() {
    const wrap = $('previewWrapper');
    wrap.innerHTML = '';
    tempImageList.forEach((src, idx) => {
        const item = document.createElement('div');
        item.className = 'preview-item';
        item.innerHTML = `<img src="${src}"><button class="del-img" onclick="removeImage(${idx})">×</button>`;
        wrap.appendChild(item);
    });
}

function removeImage(idx) { tempImageList.splice(idx,1); refreshPreview(); }

function submitPhoto() {
    if (!tempImageList.length) { alert("请选择图片"); return; }
    const base = {time:$('time').value,location:$('location').value,icao:$('icao').value,airline:$('airline').value,airlineCode:$('airlineCode').value,country:$('country').value,model:$('model').value,reg:$('reg').value,status:$('status').value,note:$('note').value};
    tempImageList.forEach(img => { planes.unshift({...base, images:[img]}); });
    savePlanes();
    currentList = planes;
    closeUpload();
    render();
    syncRemoteData(); // 异步同步远程 JSON
    alert("提交成功！同注册编号自动合并");
}

// ---------------- 详情页 ----------------
function openGroupDetail(group) {
    sliderItems=[]; sliderImages=[]; currentGroupReg='';
    group.forEach(({item,index})=>{
        if(!currentGroupReg) currentGroupReg = item.reg || '';
        (item.images||[]).forEach(img => { sliderItems.push({item,index}); sliderImages.push(img); });
    });
    sliderIndex=0; updateDetail(); $('detailModal').style.display='flex';
}

function updateDetail() {
    const img = sliderImages[sliderIndex] || '';
    const {item} = sliderItems[sliderIndex] || {item:{}};
    $('detailImg').src = img;
    $('detailInfo').innerHTML = `
        <div>拍摄时间：${item.time||'-'}</div>
        <div>拍摄地点：${item.location||'-'}</div>
        <div>ICAO：${item.icao||'-'}</div>
        <div>航空公司：${item.airline||'-'}</div>
        <div>航司代码：${item.airlineCode||'-'}</div>
        <div>所属国家：${item.country||'-'}</div>
        <div>飞机机型：${item.model||'-'}</div>
        <div>注册编号：${item.reg||'-'}</div>
        <div>起降情况：${item.status||'-'}</div>
        <div>备注：${item.note||'-'}</div>`;
}

function prevImg() { if(!sliderItems.length) return; sliderIndex=(sliderIndex-1+sliderItems.length)%sliderItems.length; updateDetail(); }
function nextImg() { if(!sliderItems.length) return; sliderIndex=(sliderIndex+1)%sliderItems.length; updateDetail(); }
function closeDetail() { $('detailModal').style.display='none'; }
function openEdit() { 
    closeDetail(); const {item,index} = sliderItems[sliderIndex]||{}; 
    if(!item) return; editIndex=index;
    ['time','location','icao','airline','airlineCode','country','model','reg','status','note'].forEach(id => { const el = $(id); if(el) el.value = item[id]||''; });
    tempImageList = [...(item.images||[])]; refreshPreview();
    $('uploadModal').style.display='flex';
}
function openFullScreen(){ $('fullImg').src = sliderImages[sliderIndex]||''; $('fullModal').style.display='flex'; }
function closeFullScreen(){ $('fullModal').style.display='none'; }

// ---------------- 搜索 ----------------
function doSearch() {
    const kw = $('search').value.toLowerCase().split(' ').filter(Boolean);
    currentList = kw.length ? planes.filter(item => kw.every(k => JSON.stringify(item).toLowerCase().includes(k))) : planes;
    render();
}

// ---------------- 子导航 + 清空按钮 ----------------
function setSubNav(items, onClick) {
    const box = $('subNav');
    box.innerHTML = '';

    const clearBtn = document.createElement('button');
    clearBtn.innerText = '清空';
    clearBtn.onclick = () => { currentList=planes; render(); box.innerHTML=''; };
    box.appendChild(clearBtn);

    items.forEach(item=>{
        const btn = document.createElement('button');
        btn.innerText = item;
        btn.onclick = ()=>{ onClick(item); };
        box.appendChild(btn);
    });
}

// ---------------- 分类 ----------------
function navByTime(){ const times=[...new Set(planes.map(p=>p.time).filter(Boolean))].sort(); setSubNav(times, t=>{ currentList = planes.filter(p=>p.time===t); render(); }); }
function navByLocation(){ const locs=[...new Set(planes.map(p=>p.location).filter(Boolean))].sort(); setSubNav(locs,l=>{ currentList=planes.filter(p=>p.location===l); render(); }); } 
function navByAirline(){ setSubNav(["中国航司","外国航司"], type=>{ const filtered = type==="中国航司"?planes.filter(p=>p.country==="中国"):planes.filter(p=>p.country!=="中国"); const airlines = [...new Set(filtered.map(p=>p.airline).filter(Boolean))].sort(); setSubNav(airlines, a=>{ currentList = planes.filter(p=>p.airline===a); render(); }); }); }
function navByModel(){ const models=[...new Set(planes.map(p=>p.model).filter(Boolean))].sort(); setSubNav(models,m=>{ currentList = planes.filter(p=>p.model===m); render(); }); }

// ---------------- GitHub JSON 同步 ----------------
async function fetchRemoteData(){ 
    try{ 
        const res = await fetch('planes_data.json'); 
        if(res.ok){ const data = await res.json(); planes=data; savePlanes(); render(); } 
    }catch(e){ console.log('远程 JSON 拉取失败，本地数据可用'); } 
}
async function syncRemoteData(){ 
    try{ /* GitHub API 同步逻辑，可根据 token 配置 */ }catch(e){} 
}
