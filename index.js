console.log('hello');
window.onload = function () {
    var nowStone = 'black-stone';
    for (var row = 1; row <= 8; row++) {
        for (var column = 1; column <= 8; column++) {
            document.querySelector('.boxes').insertAdjacentHTML('beforeend', '<div class="box" id="' + row + column + '"></div>');
        }
    }
    document.getElementById('44').classList.add('black-stone');
    document.getElementById('55').classList.add('black-stone');
    document.getElementById('45').classList.add('white-stone');
    document.getElementById('54').classList.add('white-stone');
    Array.from(document.getElementsByClassName('box')).forEach(function (box) {
        box.addEventListener('click', function (e) {
            if (e.target.classList.contains('black-stone') || e.target.classList.contains('white-stone')) {
                alert('すでに石がある場所には置けません。');
                return;
            }
            var getId = e.target.getAttribute("id");
            var getRow = Number(getId) / 10 | 0;
            var getColumn = Number(getId) % 10;
            if (judgeNorth(getRow, getColumn, nowStone)) {
                e.target.classList.add(nowStone);
                nowStone = reverceStone(nowStone);
            }
            else {
                alert('ここには置けません。');
                return;
            }
        });
    });
};
var reverceStone = function (nowStone) {
    if (nowStone == 'black-stone') {
        return 'white-stone';
    }
    else {
        return 'black-stone';
    }
};
var changeStone = function (id) {
    if (document.getElementById(id).classList.contains('black-stone')) {
        document.getElementById(id).classList.remove('black-stone');
        document.getElementById(id).classList.add('white-stone');
    }
    else if (document.getElementById(id).classList.contains('white-stone')) {
        document.getElementById(id).classList.remove('white-stone');
        document.getElementById(id).classList.add('black-stone');
    }
};
var judgeNorth = function (row, column, nowStone) {
    var setJudge = 0;
    for (var ii = -1; ii <= 1; ii++) {
        for (var jj = -1; jj <= 1; jj++) {
            if (!(ii == 0 && jj == 0)) {
                var rowShift = row;
                var columnShift = column;
                var jud = true;
                var result = [];
                while (jud) {
                    rowShift += ii;
                    columnShift += jj;
                    var id = String(rowShift) + String(columnShift);
                    if (document.getElementById(id) != null) {
                        if (document.getElementById(id).classList.contains(reverceStone(nowStone))) {
                            result.push(id);
                        }
                        else if (document.getElementById(id).classList.contains(nowStone)) {
                            deprive(result);
                            setJudge += result.length;
                            break;
                        }
                        else {
                            break;
                        }
                    }
                    else {
                        jud = false;
                    }
                }
            }
        }
    }
    return setJudge;
};
var deprive = function (result) {
    for (var i = 0; i < result.length; i++) {
        changeStone(result[i]);
    }
};
