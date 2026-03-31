let currentGroupReg = '';

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

function deleteGroup(reg) {
  if (!confirm('确定删除该注册号所有记录？删除后无法恢复')) return;
  planes = planes.filter(p => (p.reg || '').trim() !== reg.trim());
  localStorage.planeGallery = JSON.stringify(planes);
  currentList = planes;
  closeDetail();
  render();
}
