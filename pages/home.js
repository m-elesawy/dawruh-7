// =======================
// بداية كود صفحة الرئيسية منفصلة
// =======================

const ownerCard = document.querySelector('.menu-card[onclick*="navigate(\'owner\'"]');
if (ownerCard) {
    ownerCard.classList.add('blinking');
}

// لإيقاف التأثير في وقت لاحق:
// if (ownerCard) {
//     ownerCard.classList.remove('blinking');
// }

function getHomePageHtml() {
    const rec = currentUser;
    let html = `
        
		
		
		


		<div class="p-3 justify-content-between align-items-center">
		<div><h4 class="mb-3 text-primary text-center">لوحة المعلومات الرئيسية</h4></div>		

		<div class="alert alert-warning d-flex align-items-start shadow-sm rounded-3 px-4 py-3 mb-4" role="alert" style="background-color: #fff8e5; border: 1px solid #ffe58f;">
		  <i class="bi bi-exclamation-triangle-fill text-warning me-3 fs-4 mt-1"></i>
		  <div class="text-dark-emphasis">
			<div class="fs-6">يرجى العلم أنه لم يتم استلام مبلغ كاميرات المراقبة من الإدارة السابقة، لذلك لم تُدرج حساباتها في البرنامج.</div>
		  </div>
		</div>

		<div class="alert alert-warning d-flex align-items-start shadow-sm rounded-3 px-4 py-3 mb-4" role="alert" style="background-color: #ffe5e5; border: 1px solid #ff8f8f;">
		  <i class="bi bi-exclamation-triangle-fill text-warning me-3 fs-4 mt-1"></i>
		  <div class="text-dark-emphasis">
			
			<div class="fs-6">في حال وجود أي ملاحظة أو خطأ، نرجو منكم التواصل معنا لتصحيحه.</div>
		  </div>
		</div>
		
		
		<!--<div><button class="btn btn-outline-primary">رقم وحدتك هو ${rec["رقم الوحده"]} </button></div>-->
		</div>
		
		<div id="contentToPrint" class="p-3 bg-white rounded shadow-sm">
            <!-- بداية صفحة الرئيسية: بيانات الوحدة وتفاصيلها -->
            <!--<div class="alert alert-info text-center mb-4">هنا جميع التفاصيل المالية الخاصة بتحاد الملاك</div>-->
            ${getHomeDetailsHtml()}
        


	   <main class="container my-4">
        <!-- قائمة الصفحات الرئيسية -->
        <div id="mainMenu" class="">
            <div class="row">
				<div class="col-md-4 mb-4">
					<div class="card menu-card h-100 blinking" onclick="navigate('owner',event)">
						<div class="card-body text-center p-4">
							<i class="fas fa-building fa-3x text-secondary mb-3"></i>
							<h3>تفاصيل الوحدة رقم ${rec["رقم الوحده"]}</h3>
							<p class="text-muted">يعرض هذا القسم تقارير لجميع التفاصيل المالية الخاصة بوحدتك السكنية.</p>
						</div>
					</div>
				</div>
				
                <div class="col-md-4 mb-4">
                    <div class="card menu-card h-100" onclick="navigate('repair',event)">
                        <div class="card-body text-center p-4">
                            <i class="fas fa-tools fa-3x text-primary mb-3"></i>
                            <h3>الصيانة السنوية</h3>
                            <p class="text-muted">يعرض هذا القسم تقارير حول رسوم الصيانة السنوية ونظرة شاملة لكل الوحدات.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <div class="card menu-card h-100" onclick="navigate('violations',event)">
                        <div class="card-body text-center p-4">
                            <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                            <h3>الإيرادات والغرامات</h3>
                            <p class="text-muted">يعرض هذا القسم تقارير عن المساهمات المالية الاستثنائية المقدمة من السكان، سواء في أعمال التطوير أو تركيب الخزانات أو أي نفقات جماعية أو مساهمات أخرى.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <div class="card menu-card h-100" onclick="navigate('other',event)">
                        <div class="card-body text-center p-4">
                            <i class="fas fa-hand-holding-usd fa-3x text-success mb-3"></i>
                            <h3>المساهمات المالية</h3>
                            <p class="text-muted">يعرض هذا القسم تقارير حول المساهمات المالية المقدمة من السكان بشكل استثنائي.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <div class="card menu-card h-100" onclick="navigate('expenses',event)">
                        <div class="card-body text-center p-4">
                            <i class="fas fa-money-bill-wave fa-3x text-danger mb-3"></i>
                            <h3>المصروفات العمومية</h3>
                            <p class="text-muted">يعرض هذا القسم تقارير ونظرة شاملة ومفصلة لجميع المصروفات.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <div class="card menu-card h-100" onclick="navigate('summary',event)">
                        <div class="card-body text-center p-4">
                            <i class="fas fa-chart-pie fa-3x text-info mb-3"></i>
                            <h3>الصندوق</h3>
                            <p class="text-muted">يعرض هذا القسم تقارير حول حالة الصندوق وعرض إجمالي الإيرادات والمصروفات.</p>
                        </div>
                    </div>
                </div>



            </div>
        </div>

        <!-- المحتوى الديناميكي للصفحة -->
        <div id="pageContent"></div>
    </main>
       
	   
	   
	   </div>
	   

	
	
	
	
    `;
    return html;
}


// =======================
// بداية كود تفاصيل الوحدة الرئيسية
// =======================
function getHomeDetailsHtml() {
    const rec = currentUser;
    let html = `
        <h5 class="mb-3 text-center text-primary"> </h5>

    `;



  





    return html;
}
// =======================
// نهاية كود تفاصيل الوحدة الرئيسية
// =======================


