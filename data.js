// data.js
let planes = [];

// 从 localStorage 读取数据
if (localStorage.planeGallery) {
    try {
        planes = JSON.parse(localStorage.planeGallery);
    } catch (e) {
        planes = [];
    }
}
