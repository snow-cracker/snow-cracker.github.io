const $ = id => document.getElementById(id);
let currentList=[],editIndex=-1,sliderImages=[],sliderItems=[],sliderIndex=0,tempImageList=[],currentGroupReg='';

initDB(()=>{
    currentList = planes;
    render();
});

// ------------------- 渲染函数 -------------------
function render(){
    const gallery=$('gallery'); gallery.innerHTML='';
    if(!currentList) return;
    const groups={};
    currentList.forEach((item,idx)=>{
        if(!item) return;
        const reg=(item.reg||'unknown').trim();
        if(!groups[reg]) groups[reg]=[];
        groups[reg].push({item,index:idx});
    });
    Object.values(groups).forEach(group=>{
        const first=group[0].item;
        const firstImg=(first.images?.length>0)?first.images[0]:'';
        const card=document.createElement('div'); card.className='card';
        card.innerHTML=`
            <img src="${firstImg}" style="width:100%;display:block;">
            <div class="info">
                <div>航空公司：${first.airline||'-'}</div>
                <div>飞机机型：${first.model||'-'}</div>
                <div>注册编号：${first.reg||'-'}</div>
            </div>`;
        card.onclick=()=>openGroupDetail(group);
        gallery.appendChild(card);
    });
}

// ------------------- 上传 / 编辑 / 删除 -------------------
function openUpload(){ editIndex=-1; clearForm(); $('uploadModal').style.display='flex'; }
function closeUpload(){ $('uploadModal').style.display='none'; }
function clearForm(){ ['time','location','icao','airline','airlineCode','country','model','reg','status','note'].forEach(id=>{ const el=$(id); if(el) el.value=''; }); tempImageList=[]; refreshPreview(); }
function addImages(){ const files=$('imgFiles').files; if(!files.length) return; let loaded=0; for(let i=0;i<files.length;i++){ const reader=new FileReader(); reader.onload=e=>{ tempImageList.push(e.target.result); loaded++; if(loaded===files.length) refreshPreview(); }; reader.readAsDataURL(files[i]); } }
function refreshPreview(){ const wrap=$('previewWrapper'); wrap.innerHTML=''; tempImageList.forEach((src,idx)=>{ const item=document.createElement('div'); item.className='preview-item'; item.innerHTML=`<img src="${src}"><button class="del-img" onclick="removeImage(${idx})">×</button>`; wrap.appendChild(item); }); }
function removeImage(idx){ tempImageList.splice(idx,1); refreshPreview(); }

function submitPhoto(){
    if(!tempImageList.length){ alert("请选择图片"); return; }
    const base={time:$('time').value,location:$('location').value,icao:$('icao').value,airline:$('airline').value,airlineCode:$('airlineCode').value,country:$('country').value,model:$('model').value,reg:$('reg').value,status:$('status').value,note:$('note').value};
    tempImageList.forEach(img=>{ planes.unshift({...base,images:[img]}); });
    savePlanes(); currentList=planes; closeUpload(); render();
    alert("提交成功！同注册编号自动合并");
}
