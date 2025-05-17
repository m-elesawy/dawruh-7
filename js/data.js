// data.js
// تحميل بيانات السكان من ملف JSON
function loadResidentsData() {
  fetch('seyanah.json')
    .then(res => res.json())
    .then(data => {
      residentsData = data;
      autoLoginCheck();
    })
    .catch(err => {
      alert('فشل تحميل بيانات السكان. تأكد من وجود الملف seyanah.json');
      console.error(err);
    });
}


 

