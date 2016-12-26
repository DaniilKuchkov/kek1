//--------------------------------View-Begin-------------------------------
var view ={
	timer: document.getElementById('time'),
	steps: document.getElementById('steps'),
	startTimer: function () {
		var time = this.timer.innerHTML;
		return this.timer.innerHTML = +time+1;
	},
	showWin:function(){
		var table = document.querySelector('table');
		table.innerHTML = '<div id ="win"><h2>You Win!</h2> <p>Your steps :'
		+ steps.innerHTML +'</p> <p>Your time : '
		+ time.innerHTML +'</p> <button>Restart</button></div>';
	},
	createTable:function (matrix){
		var table = document.createElement('table');
		for(var i = 0;i < matrix.length;i++){
			var tr = document.createElement('tr');
			for(var j = 0;j < matrix[i].length;j++){
				var td = document.createElement('td');
				td.innerHTML = '<img src="'+matrix[i][j]+'"class="hidden" alt="cell image">';
				tr.appendChild(td);
			}
			table.appendChild(tr);
		}
		return table;
	},

	setCellActive : function(el){
		if(el.className == 'hidden'){
			el.className ='chosen';
		}
	},
	setCellHidden : function(el){
		if(el.className == 'chosen'){
			el.className = 'hidden';
		}
	},
	setCellCorrect : function(el){
		el.className = 'correct';
	}
};
//---------------------------------View-End--------------------------------

//--------------------------------Model-Begin------------------------------
var model ={
	imgArr:
	[
	'https://kde.link/test/0.png',
	'https://kde.link/test/1.png',
	'https://kde.link/test/2.png',
	'https://kde.link/test/3.png',
	'https://kde.link/test/4.png',
	'https://kde.link/test/5.png',
	'https://kde.link/test/6.png',
	'https://kde.link/test/7.png',
	'https://kde.link/test/8.png',
	'https://kde.link/test/9.png'
	],
	_metric: JSON.parse(ajaxGet('https://kde.link/test/get_field_size.php')),
	steps:0,
	open:0,
	win :false,
	transp : function(matrix){
		var newMatrix = [];
		for(var i = 0;i < matrix[0].length;i++){
			newMatrix[i] = [];
			for(var j = 0;j < matrix.length;j++){
				newMatrix[i][j] = matrix[j][i];
			}
		}
		return newMatrix;
	},
	createRandMatrix : function(arr,rows,cell){
		var matrix = [];
		var pairNumber = (!(rows%2) ? rows : cell);
		for(var i = 0;i < pairNumber/2;i++){
			var randomArr = arr.slice(0).sort(function(){
				return Math.round(Math.random())
			}).slice(0,(pairNumber == rows ? cell : rows));
			matrix[i] = randomArr;
			var randPos = Math.floor(Math.random()*(pairNumber/2)+pairNumber/2);
			while(matrix[randPos]){
				randPos = Math.floor(Math.random()*(pairNumber/2)+pairNumber/2);
			}
			matrix[randPos] = randomArr.slice(0);
			matrix[randPos].sort(function(){
				return Math.round(Math.random())
			});
		}
		return (pairNumber == cell) ? this.transp(matrix) : matrix;
	},
	addSteps:function(){
		document.getElementById('steps').textContent = this.steps;
	}
};
//--------------------------------Model-End--------------------------------

//-----------------------------Controller-Begin----------------------------
var controller = {
	check:false,
	prevTarget :'',
	prevTargetSrc:'',
	checkOnSame : function(target){
		if(this.prevTarget && this.prevTarget == target && view.setCellActive(this.prevTarget)){
			return;
		}
		if(target.classList.contains('hidden')){
			view.setCellActive(target);
			setTimeout(function(){
				if(this.check){
					this.check = false;
					if(target.getAttribute('src') == this.prevTargetSrc){
						model.open++;
						model.steps++;
						model.addSteps();
						view.setCellCorrect(target.parentNode);
						view.setCellCorrect(this.prevTarget.parentNode);
						if(model.open == model._metric.height * model._metric.width / 2){
							model.win = true;
							view.showWin();
						}
					}
					else{
						model.steps++;
						view.steps.textContent = model.steps;//
						view.setCellHidden(this.prevTarget);
						view.setCellHidden(target);
					}
				}
				else{
					this.prevTargetSrc = target.getAttribute('src');
					this.prevTarget = target;
					this.check = true;
				}
			}, 400);
		}
	}

};
//------------------------------Initialize-Begin-------------------------------
(function(){
	var app = {
		init:function(){
			this.main();
			this.event();
		},
		main:function(){
			var container = document.getElementById('conteiner');
			container.appendChild(view.createTable(model.createRandMatrix(model.imgArr,model._metric.height,model._metric.width)));
			setInterval(view.startTimer.bind(view),1000);
		},
		event: function(){
			var table = document.querySelector('table');
				table.addEventListener('click',function(event){
					var target = event.target;
					if(target.tagName == 'IMG'){
					controller.checkOnSame(target);
					}
					if(model.win && target.tagName == "BUTTON"){
						location.reload();
				}
		});
		}
	};
	app.init();
})();
//------------------------------Initialize-End----------------------------------
function ajaxGet(url){
	var XHR = ('onload' in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
	var get = new XHR();
	get.open('GET',url,false);
	get.send();
	return get.responseText;
}
