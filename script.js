// script.js
const $ = id => document.getElementById(id);
let currentList=[],editIndex=-1,sliderImages=[],sliderItems=[],sliderIndex=0,tempImageList=[],currentGroupReg='';

initDB(()=>{
    fetchRemoteData(()=>{
        currentList=planes;
        render();
    });
});

// ------------------- GitHub JSON 同步 -------------------
const GITHUB_USER = '你的用户名';
const GITHUB_REPO = 'snow-cracker';
const JSON_PATH = 'planes_data.json';
const GITHUB_TOKEN = '你的Token'; // 需要有 repo 权限

async function fetchRemoteData(callback){
    try{
        const res = await fetch(`https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${JSON_PATH}`);
        if(res.ok){
            const data = await res.json();
            planes = data;
            savePlanes();
            callback && callback();
        } else {
            callback && callback();
        }
    }catch(e){
        callback && callback();
    }
}

async function syncRemoteData(){
    try{
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(planes))));
        await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${JSON_PATH}`,{
            method:'PUT',
            headers:{
                'Authorization':'token '+GITHUB_TOKEN,
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                message:'update planes_data',
                content: content
            })
        });
    }catch(e){}
}

// ------------------- 其余 JS 功能与之前完全一样 -------------------
// render() / openUpload() / submitPhoto() / addImages() / IndexedDB 本地保存等功能
// 所有函数参考前面我给你的完整 IndexedDB 版本
// 唯一变化：submitPhoto() 提交成功后调用 syncRemoteData()
