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
var collection = db.collection('gameRecord');
var collection_charenge = db.collection('challenges');
var auth = firebase.auth();
var batch = db.batch();
var loginUser = null;
var gameRecords = document.getElementById("gameRecords");
document.getElementById('login').addEventListener('click', function () {
    auth.signInAnonymously();
});
document.getElementById('logout').addEventListener('click', function () {
    auth.signOut();
});
auth.onAuthStateChanged(function (user) {
    if (user) {
        loginUser = user;
        collection.orderBy('created_at').onSnapshot(function (snapshot) {
            snapshot.docChanges().forEach(function (change) {
                if (change.type === 'added') {
                    var li = document.createElement('li');
                    li.textContent = change.doc.data().id + ' ' + change.doc.data().stones + ' ' + change.doc.data().uid;
                    gameRecords.appendChild(li);
                }
            });
        });
        console.log("login" + user.uid);
        document.getElementById('login').classList.add('hidden');
        document.getElementById('logout').classList.remove('hidden');
        document.getElementById('reset').classList.remove('hidden');
        document.getElementById('boxes').classList.remove('hidden');
        document.getElementById('gameRecords').classList.remove('hidden');
        return;
    }
    console.log("logout");
    loginUser = null;
    document.getElementById('login').classList.remove('hidden');
    document.getElementById('logout').classList.add('hidden');
    document.getElementById('reset').classList.add('hidden');
    document.getElementById('boxes').classList.add('hidden');
    document.getElementById('gameRecords').classList.add('hidden');
});
window.onload = function () {
    var nowStone = 'B';
    for (var row = 1; row <= 8; row++) {
        for (var column = 1; column <= 8; column++) {
            document.querySelector('.boxes').insertAdjacentHTML('beforeend', '<div class="box" id="' + row + column + '"></div>');
        }
    }
    document.getElementById('44').classList.add('B');
    document.getElementById('55').classList.add('B');
    document.getElementById('45').classList.add('W');
    document.getElementById('54').classList.add('W');
    Array.from(document.getElementsByClassName('box')).forEach(function (box) {
        box.addEventListener('click', function (e) {
            if (document.getElementById('yourTurn').classList.contains('hidden')) {
                alert('相手の番です。');
                return;
            }
            if (e.target.classList.contains('B') || e.target.classList.contains('W')) {
                alert('すでに石がある場所には置けません。');
                return;
            }
            var getId = e.target.getAttribute("id");
            var getRow = Number(getId) / 10 | 0;
            var getColumn = Number(getId) % 10;
            if (judge(getRow, getColumn, nowStone)) {
                collection.add({
                    stones: nowStone,
                    created_at: firebase.firestore.FieldValue.serverTimestamp(),
                    id: getId,
                    uid: loginUser.uid
                })
                    .then(function (doc) {
                    console.log(doc.id + ' added!');
                })["catch"](function (error) {
                    console.log(error);
                });
                e.target.classList.add(nowStone);
                nowStone = reverceStone(nowStone);
                document.getElementById('enemyTurn').classList.remove('hidden');
                document.getElementById('yourTurn').classList.add('hidden');
            }
            else {
                alert('ここには置けません。');
            }
        });
    });
    // DB に add されたら、それを反映させる。
    collection.orderBy('created_at').onSnapshot(function (snapshot) {
        snapshot.docChanges().forEach(function (change) {
            if (change.type === 'added') {
                // change.doc.data().id
                var pullRow = Number(change.doc.data().id) / 10 | 0;
                var pullColumn = Number(change.doc.data().id) % 10;
                if (document.getElementById(change.doc.data().id).classList.contains('B') || document.getElementById(change.doc.data().id).classList.contains('W')) {
                    return;
                }
                judge(pullRow, pullColumn, change.doc.data().stones);
                document.getElementById(change.doc.data().id).classList.add(change.doc.data().stones);
                nowStone = reverceStone(nowStone);
                if (loginUser.uid == change.doc.data().uid) {
                    document.getElementById('yourTurn').classList.add('hidden');
                    document.getElementById('enemyTurn').classList.remove('hidden');
                    return;
                }
                else {
                    document.getElementById('enemyTurn').classList.add('hidden');
                    document.getElementById('yourTurn').classList.remove('hidden');
                    return;
                }
                console.log(change.doc.data().uid);
            }
        });
    });
};
var reverceStone = function (nowStone) {
    if (nowStone == 'B') {
        return 'W';
    }
    else {
        return 'B';
    }
};
var changeStone = function (id) {
    if (document.getElementById(id).classList.contains('B')) {
        document.getElementById(id).classList.remove('B');
        document.getElementById(id).classList.add('W');
    }
    else if (document.getElementById(id).classList.contains('W')) {
        document.getElementById(id).classList.remove('W');
        document.getElementById(id).classList.add('B');
    }
};
var judge = function (row, column, nowStone) {
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
