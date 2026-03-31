// data.js
let planes = [];

// IndexedDB 本地存储
const DB_NAME = 'planeGalleryDB';
const DB_STORE = 'planes';
let db;

function initDB(callback){
    const request = indexedDB.open(DB_NAME,1);
    request.onupgradeneeded = function(e){
        db = e.target.result;
        if(!db.objectStoreNames.contains(DB_STORE)){
            db.createObjectStore(DB_STORE,{keyPath:'id',autoIncrement:true});
        }
    };
    request.onsuccess = function(e){
        db = e.target.result;
        loadPlanes(callback);
    };
    request.onerror = function(){ alert('数据库初始化失败'); }
}

function savePlanes(){
    if(!db) return;
    const tx = db.transaction(DB_STORE,'readwrite');
    const store = tx.objectStore(DB_STORE);
    store.clear().onsuccess = function(){
        planes.forEach(p=>store.add(p));
    };
}

// 拉取本地数据
function loadPlanes(callback){
    if(!db) return;
    const tx = db.transaction(DB_STORE,'readonly');
    const store = tx.objectStore(DB_STORE);
    const req = store.getAll();
    req.onsuccess = function(){
        planes = req.result;
        callback && callback();
    };
}
