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
var auth = firebase.auth();
var batch = db.batch();
var loginUser = null;
var messages = document.getElementById("messages");
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
                    messages.appendChild(li);
                }
            });
        });
        console.log("login" + user.uid);
        document.getElementById('login').classList.add('hidden');
        document.getElementById('logout').classList.remove('hidden');
        document.getElementById('reset').classList.remove('hidden');
        document.getElementById('boxes').classList.remove('hidden');
        document.getElementById('messages').classList.remove('hidden');
        return;
    }
    console.log("logout");
    loginUser = null;
    document.getElementById('login').classList.remove('hidden');
    document.getElementById('logout').classList.add('hidden');
    document.getElementById('reset').classList.add('hidden');
    document.getElementById('boxes').classList.add('hidden');
    document.getElementById('messages').classList.add('hidden');
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
            if (document.getElementById('yourTurn').classList.contains('hidden')) {
                alert('相手の番です。');
                return;
            }
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
                if (document.getElementById(change.doc.data().id).classList.contains('black-stone') || document.getElementById(change.doc.data().id).classList.contains('white-stone')) {
                    return;
                }
                judgeNorth(pullRow, pullColumn, change.doc.data().stones);
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
                // if (loginUser.uid == change.doc.data().uid){
                //   console.log("次は相手の番です。")
                // }
                // else{
                //   console.log("次は相手の番です。")
                // }
                console.log(change.doc.data().uid);
            }
        });
    });
    //   document.getElementById('reset').addEventListener('click', () => {
    //     // console.log("aaa");
    //     // collection.docs.forEach(doc => {
    //     //     batch.delete(doc.ref);
    //     //   });
    //     // // collection.ref().remove();
    //     // collection.onSnapshot(snapshot => {
    //     //   snapshot.forEach(doc => {
    //     //     // doc.remove();
    //     //     // doc.data().remove())
    //     //     // console.log(collection.doc().delete());
    //     //     batch.delete(doc.ref);
    //     //   });
    //     // });
    //     deleteCollection(admin.firestore(), collection, 1);
    //     // firebase.database().ref().remove();
    //   });
    //
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
var admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.cert("/path/to/key.json"),
    databaseURL: 'https://xxxxxxxxxx.firebaseio.com'
});
var db2 = admin.firestore();
//firebaseのサイトにあるコード（少し改修）
var deleteCollection = function (db2, collectionRef, batchSize) {
    var query = collectionRef.orderBy('__name__').limit(batchSize);
    return new Promise(function (resolve, reject) {
        deleteQueryBatch(db2, query, batchSize, resolve, reject);
    });
};
//削除のメインコード
var deleteQueryBatch = function (db2, query, batchSize, resolve, reject) {
    query.get()
        .then(function (snapshot) {
        //検索結果が0件なら処理終わり
        if (snapshot.size == 0) {
            return 0;
        }
        //削除のメイン処理
        var batch = db2.batch();
        snapshot.docs.forEach(function (doc) {
            batch["delete"](doc.ref);
        });
        //一旦処理サイズをreturn
        return batch.commit().then(function () {
            return snapshot.size;
        });
    })
        .then(function (numDeleted) {
        //もう対象のデータが0なら処理終わり
        if (numDeleted == 0) {
            resolve();
            return;
        }
        //あだあるなら、再度処理
        process.nextTick(function () {
            deleteQueryBatch(db2, query, batchSize, resolve, reject);
        });
    })["catch"](reject);
};
