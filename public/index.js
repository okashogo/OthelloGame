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
var collection = db.collection('record');
var collection_challenge = db.collection('challenges');
var querySnapshot = collection.where('stones', '==', 'B').get()
    .then(function (snapshot) {
    if (snapshot.empty) {
        console.log('No matching documents.');
        return;
    }
    snapshot.forEach(function (doc) {
        console.log(doc.id, '=>', doc.data());
    });
})["catch"](function (err) {
    console.log('Error getting documents', err);
});
var auth = firebase.auth();
var batch = db.batch();
var loginUser = null;
var enemyUser = null;
var challenge_index = document.getElementById("challenge_index");
var nickname = null;
var element_nickname = document.getElementById('input_nickname');
document.getElementById('login').addEventListener('click', function () {
    if (element_nickname.value) {
        auth.signInAnonymously();
        console.log(element_nickname.value);
        document.getElementById('input_nickname').classList.add('hidden');
        document.getElementById('nickname_message').innerHTML = 'ようこそ、<b id="nickname">' + element_nickname.value + '<b>さん';
        nickname = element_nickname.value;
        document.getElementById('nickname_message').classList.remove('hidden');
    }
    else {
        alert('ニックネームを入力してください');
    }
});
document.getElementById('logout').addEventListener('click', function () {
    auth.signOut();
});
auth.onAuthStateChanged(function (user) {
    // ログイン時の処理
    if (user) {
        if (nickname == null) {
            document.getElementById('nickname_message').classList.add('hidden');
            auth.signOut();
        }
        loginUser = user;
        console.log("aaa");
        console.log("login:" + user.uid);
        document.getElementById('login').classList.add('hidden');
        document.getElementById('submit_challenge').classList.remove('hidden');
        document.getElementById('challenge_index').classList.remove('hidden');
        document.getElementById('submit_apply').classList.remove('hidden');
        document.getElementById('input_challenge').classList.remove('hidden');
        document.getElementById('logout').classList.remove('hidden');
        document.getElementById('input_apply').classList.remove('hidden');
        return;
    }
    //ログアウト時の処理
    console.log("logout");
    loginUser = null;
    document.getElementById('input_nickname').classList.remove('hidden');
    document.getElementById('nickname_message').classList.add('hidden');
    document.getElementById('login').classList.remove('hidden');
    document.getElementById('submit_challenge').classList.add('hidden');
    document.getElementById('challenge_index').classList.add('hidden');
    document.getElementById('submit_apply').classList.add('hidden');
    document.getElementById('logout').classList.add('hidden');
    document.getElementById('yourTurn').classList.add('hidden');
    document.getElementById('boxes').classList.add('hidden');
    document.getElementById('input_challenge').classList.add('hidden');
    document.getElementById('input_apply').classList.add('hidden');
    document.getElementById('match_list').classList.add('hidden');
    document.getElementById('enemyTurn').classList.add('hidden');
    document.getElementById('yourTurn').classList.add('hidden');
});
var element = document.getElementById('input_challenge');
var value = element.value;
var my_challenge_id = null;
// 挑戦状ボタンを押したとき
document.getElementById('submit_challenge').addEventListener('click', function () {
    if (element.value) {
        console.log(element.value);
        collection_challenge.add({
            user_id: loginUser.uid,
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            enemy_id: 0,
            pass: element.value,
            challenge_nickname: nickname,
            apply_nickname: "nobody"
        })
            .then(function (doc) {
            console.log(doc.id + ":add!");
            my_challenge_id = doc.id;
            //console.log("aaa:"+my_challenge_id);
            document.getElementById('waiting').classList.remove('hidden');
            document.getElementById('input_challenge').classList.add('hidden');
            document.getElementById('submit_challenge').classList.add('hidden');
            document.getElementById('input_apply').classList.add('hidden');
            document.getElementById('submit_apply').classList.add('hidden');
        })["catch"](function (error) {
            console.log(error);
        });
    }
    else {
        alert('数字を入力してください');
    }
});
var element_apply = document.getElementById('input_apply');
var value_apply = element_apply.value;
//　申し込みをした時の処理
document.getElementById('submit_apply').addEventListener('click', function () {
    if (element_apply.value) {
        console.log(element_apply.value);
        var querySnapshot_1 = collection_challenge.where('enemy_id', '==', 0).where('pass', '==', element_apply.value).get()
            .then(function (snapshot) {
            if (snapshot.empty) {
                console.log('No matching documents.');
                return;
            }
            snapshot.forEach(function (doc) {
                collection_challenge.doc(doc.id)
                    //.where('pass', '==', element_apply.value)
                    .set({
                    user_id: doc.data().user_id,
                    enemy_id: loginUser.uid,
                    pass: doc.data().pass,
                    created_at: doc.data().created_at,
                    challenge_nickname: doc.data().challenge_nickname,
                    apply_nickname: nickname
                })
                    .then(function (snapshot) {
                    console.log('update!');
                    document.getElementById('match_list').classList.remove('hidden');
                    document.getElementById('match_list').insertAdjacentHTML('afterbegin', '<b class="player1">' + nickname + '</b> vs <b class="player2">' + doc.data().challenge_nickname + '</b>');
                    enemyUser = doc.data().user_id;
                    console.log('enemyUser: ' + enemyUser);
                    document.getElementById('yourTurn').classList.remove('hidden');
                    document.getElementById('boxes').classList.remove('hidden');
                    document.getElementById('input_challenge').classList.add('hidden');
                    document.getElementById('submit_challenge').classList.add('hidden');
                    document.getElementById('input_apply').classList.add('hidden');
                    document.getElementById('submit_apply').classList.add('hidden');
                })["catch"](function (err) {
                    console.log('Not update!');
                });
            });
        })["catch"](function (err) {
            console.log('Error getting documents', err);
        });
    }
    else {
        alert('数字を入力してください');
    }
});
window.onload = function () {
    var nowStone = 'B';
    var judgeCount = 0;
    for (var row = 1; row <= 8; row++) {
        for (var column = 1; column <= 8; column++) {
            document.querySelector('.boxes').insertAdjacentHTML('beforeend', '<div class="box" id="' + row + column + '"></div>');
        }
    }
    document.getElementById('44').classList.add('B');
    document.getElementById('55').classList.add('B');
    document.getElementById('45').classList.add('W');
    document.getElementById('54').classList.add('W');
    canPut(nowStone);
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
            judgeCount = 0;
            var result = [];
            for (var ii = -1; ii <= 1; ii++) {
                for (var jj = -1; jj <= 1; jj++) {
                    if (!(ii == 0 && jj == 0)) {
                        result = judge(getRow, getColumn, nowStone, ii, jj);
                        deprive(result);
                        judgeCount += result.length;
                    }
                }
            }
            if (judgeCount > 0) {
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
            if (canPut(nowStone) == 0) {
                document.getElementById('enemyTurn').classList.add('hidden');
                document.getElementById('yourTurn').classList.remove('hidden');
                nowStone = reverceStone(nowStone);
                if (canPut(nowStone) == 0) {
                    console.log("試合終了です。");
                }
            }
            else {
                removeCanPut();
            }
        });
    });
    // 挑戦状が申し込まれたら
    collection_challenge.onSnapshot(function (snapshot) {
        snapshot.docChanges().forEach(function (change) {
            if (change.type === 'modified' && my_challenge_id != null && change.doc.data().enemy_id != 0) {
                console.log('applyed!!!');
                console.log(change.doc.data().user_id);
                console.log(change.doc.data().enemy_id);
                document.getElementById('match_list').classList.remove('hidden');
                document.getElementById('match_list').insertAdjacentHTML('afterbegin', '<b class="player1">' + nickname + '</b> vs <b class="player2">' + change.doc.data().apply_nickname + '</b>');
                document.getElementById('waiting').classList.add('hidden');
                document.getElementById('input_challenge').classList.add('hidden');
                document.getElementById('submit_challenge').classList.add('hidden');
                document.getElementById('input_apply').classList.add('hidden');
                document.getElementById('submit_apply').classList.add('hidden');
                enemyUser = change.doc.data().enemy_id;
                console.log('enemyUser: ' + enemyUser);
                document.getElementById('yourTurn').classList.remove('hidden');
                document.getElementById('boxes').classList.remove('hidden');
            }
        });
    });
    // DB に add されたら、それを反映させる。
    collection.orderBy('created_at').onSnapshot(function (snapshot) {
        snapshot.docChanges().forEach(function (change) {
            if (loginUser != null) {
                if (change.type === 'added' && (change.doc.data().uid == loginUser.uid || change.doc.data().uid == enemyUser)) {
                    var pullRow = Number(change.doc.data().id) / 10 | 0;
                    var pullColumn = Number(change.doc.data().id) % 10;
                    if (document.getElementById(change.doc.data().id).classList.contains('B') || document.getElementById(change.doc.data().id).classList.contains('W')) {
                        return;
                    }
                    judgeCount = 0;
                    var result = [];
                    for (var ii = -1; ii <= 1; ii++) {
                        for (var jj = -1; jj <= 1; jj++) {
                            if (!(ii == 0 && jj == 0)) {
                                result = judge(pullRow, pullColumn, change.doc.data().stones, ii, jj);
                                deprive(result);
                                judgeCount += result.length;
                            }
                        }
                    }
                    document.getElementById(change.doc.data().id).classList.add(change.doc.data().stones);
                    nowStone = reverceStone(nowStone);
                    if (loginUser.uid == change.doc.data().uid) {
                        document.getElementById('yourTurn').classList.add('hidden');
                        document.getElementById('enemyTurn').classList.remove('hidden');
                        if (canPut(nowStone) == 0) {
                            document.getElementById('enemyTurn').classList.add('hidden');
                            document.getElementById('yourTurn').classList.remove('hidden');
                            nowStone = reverceStone(nowStone);
                            if (canPut(nowStone) == 0) {
                                console.log("試合終了です。");
                            }
                        }
                        else {
                            removeCanPut();
                        }
                        return;
                    }
                    else {
                        document.getElementById('enemyTurn').classList.add('hidden');
                        document.getElementById('yourTurn').classList.remove('hidden');
                        if (canPut(nowStone) == 0) {
                            alert('あなたはパスです。');
                            nowStone = reverceStone(nowStone);
                            document.getElementById('yourTurn').classList.add('hidden');
                            document.getElementById('enemyTurn').classList.remove('hidden');
                        }
                        return;
                    }
                }
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
var judge = function (row, column, nowStone, ii, jj) {
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
                return result;
            }
            else {
                break;
            }
        }
        else {
            jud = false;
        }
    }
    return [];
};
var deprive = function (result) {
    for (var i = 0; i < result.length; i++) {
        changeStone(result[i]);
    }
};
var canPut = function (nowStone) {
    var allConut = 0;
    var judgeCount = 0;
    var result = [];
    for (var i = 1; i <= 8; i++) {
        for (var j = 1; j <= 8; j++) {
            allConut += judgeCount;
            judgeCount = 0;
            result = [];
            var id = String(i) + String(j);
            document.getElementById(id).classList.remove('canPut');
            for (var ii = -1; ii <= 1; ii++) {
                for (var jj = -1; jj <= 1; jj++) {
                    if (!(ii == 0 && jj == 0)) {
                        result = judge(i, j, nowStone, ii, jj);
                        judgeCount += result.length;
                    }
                }
            }
            if (document.getElementById(id).classList.contains('B') || document.getElementById(id).classList.contains('W')) {
                judgeCount = 0;
            }
            if (judgeCount > 0) {
                document.getElementById(id).classList.add('canPut');
            }
        }
    }
    return allConut;
};
var removeCanPut = function () {
    var judgeCount = 0;
    var result = [];
    for (var i = 1; i <= 8; i++) {
        for (var j = 1; j <= 8; j++) {
            var id = String(i) + String(j);
            document.getElementById(id).classList.remove('canPut');
        }
    }
};
//window.onbeforeunload = function(e) {
//    var message = "ページを離れようとしています。よろしいですか？";
//    e.returnValue = message;
//}
