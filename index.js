console.log('hello');
var firebaseConfig = {
    apiKey: "AIzaSyCQwtJNcOqFbj1BftpmcnFeH-MN5JpRdjY",
    authDomain: "othellogame-ef760.firebaseapp.com",
    databaseURL: "https://othellogame-ef760.firebaseio.com",
    projectId: "othellogame-ef760",
    storageBucket: "othellogame-ef760.appspot.com",
    messagingSenderId: "59780453577",
    appId: "1:59780453577:web:e6094f34db81a8cc626918",
    measurementId: "G-EDBZG9EX0Q"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var collection = db.collection('message');
// collection.add({
//   message: 'test'
// })
// .then(doc => {
//   console.log(doc.id + ' added!');
// })
// .catch(error => {
//   console.log(error)
// })
var messages = document.getElementById("messages");
collection.orderBy('created_at').get().then(function (snapshot) {
    snapshot.forEach(function (doc) {
        var li = document.createElement('li');
        li.textContent = doc.data().id + ' ' + doc.data().stones + ' ' + doc.data().created_at;
        messages.appendChild(li);
    });
});
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
                collection.add({
                    stones: nowStone,
                    created_at: firebase.firestore.FieldValue.serverTimestamp(),
                    id: getId
                })
                    .then(function (doc) {
                    console.log(doc.id + ' added!');
                })["catch"](function (error) {
                    console.log(error);
                });
                e.target.classList.add(nowStone);
                nowStone = reverceStone(nowStone);
            }
            else {
                alert('ここには置けません。');
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
