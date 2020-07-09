console.log('hello');

declare var firebase: any;

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
const db = firebase.firestore();
const collection = db.collection('gameRecord');
const collection_charenge = db.collection('challenges');

const auth = firebase.auth();
const batch = db.batch();
var loginUser = null;

var gameRecords = document.getElementById("gameRecords");

document.getElementById('login').addEventListener('click', () => {
  auth.signInAnonymously();
});

document.getElementById('logout').addEventListener('click', () => {
  auth.signOut();
});

auth.onAuthStateChanged(user => {
  if (user) {
    loginUser = user;
    collection.orderBy('created_at').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const li = document.createElement('li');
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

interface ArrayConstructor {
  from(arrayLike: any, mapFn?, thisArg?): Array<any>;
}

window.onload = () => {

  let nowStone: string = 'B';
  var setJudge: number = 0

  for (let row = 1; row <= 8; row++) {
    for (let column = 1; column <= 8; column++) {
      document.querySelector('.boxes').insertAdjacentHTML(
        'beforeend',
        '<div class="box" id="' + row + column + '"></div>'
      )
    }
  }

  document.getElementById('44').classList.add('B');
  document.getElementById('55').classList.add('B');
  document.getElementById('45').classList.add('W');
  document.getElementById('54').classList.add('W');

  canPut(nowStone);

  Array.from(document.getElementsByClassName('box')).forEach(box => {
    box.addEventListener('click', (e) => {
      if (document.getElementById('yourTurn').classList.contains('hidden')) {
        alert('相手の番です。');
        return;
      }
      if (e.target.classList.contains('B') || e.target.classList.contains('W')) {
        alert('すでに石がある場所には置けません。');
        return;
      }
      let getId = e.target.getAttribute("id");
      let getRow = Number(getId) / 10 | 0;
      let getColumn = Number(getId) % 10;

      setJudge = 0;
      var result: string[] = [];

      for (var ii = -1; ii <= 1; ii++) {
        for (var jj = -1; jj <= 1; jj++) {
          if (!(ii == 0 && jj == 0)) {
            result = judge(getRow, getColumn, nowStone, ii, jj);

            deprive(result);

            setJudge += result.length;
          }
        }
      }

      if (setJudge > 0) {

        collection.add({
          stones: nowStone,
          created_at: firebase.firestore.FieldValue.serverTimestamp(),
          id: getId,
          uid: loginUser.uid
        })
          .then(doc => {
            console.log(doc.id + ' added!');
          })
          .catch(error => {
            console.log(error)
          })

        e.target.classList.add(nowStone);
        nowStone = reverceStone(nowStone);
        document.getElementById('enemyTurn').classList.remove('hidden');
        document.getElementById('yourTurn').classList.add('hidden');

        if(canPut(nowStone) == 0){
          document.getElementById('enemyTurn').classList.add('hidden');
          document.getElementById('yourTurn').classList.remove('hidden');
          nowStone = reverceStone(nowStone);
          if(canPut(nowStone) == 0){
            console.log("試合終了です。")
          }
        }
      }
      else {
        alert('ここには置けません。');
      }

      removeCanPut();
    })
  })

  // DB に add されたら、それを反映させる。

  collection.orderBy('created_at').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        // change.doc.data().id
        var pullRow: number = Number(change.doc.data().id) / 10 | 0;
        var pullColumn: number = Number(change.doc.data().id) % 10;

        if (document.getElementById(change.doc.data().id).classList.contains('B') || document.getElementById(change.doc.data().id).classList.contains('W')) {
          return;
        }

        setJudge = 0;
        var result: string[] = [];
        for (var ii = -1; ii <= 1; ii++) {
          for (var jj = -1; jj <= 1; jj++) {
            if (!(ii == 0 && jj == 0)) {
              result = judge(pullRow, pullColumn, change.doc.data().stones, ii, jj);

              deprive(result);

              setJudge += result.length;
            }
          }
        }

        document.getElementById(change.doc.data().id).classList.add(change.doc.data().stones);
        nowStone = reverceStone(nowStone);

        if (loginUser.uid == change.doc.data().uid) {
          document.getElementById('yourTurn').classList.add('hidden');
          document.getElementById('enemyTurn').classList.remove('hidden');
          removeCanPut();
          if(canPut(nowStone) == 0){
            document.getElementById('enemyTurn').classList.add('hidden');
            document.getElementById('yourTurn').classList.remove('hidden');
            nowStone = reverceStone(nowStone);
            if(canPut(nowStone) == 0){
              console.log("試合終了です。")
            }
          }
          return;
        }
        else {
          document.getElementById('enemyTurn').classList.add('hidden');
          document.getElementById('yourTurn').classList.remove('hidden');
          if(canPut(nowStone) == 0){
            alert('あなたはパスです。');
            nowStone = reverceStone(nowStone);
            document.getElementById('yourTurn').classList.add('hidden');
            document.getElementById('enemyTurn').classList.remove('hidden');
          }
          return;
        }
      }
    });
  });
}


const reverceStone = (nowStone) => {
  if (nowStone == 'B') {
    return 'W'
  }
  else {
    return 'B'
  }
}

const changeStone = (id) => {
  if (document.getElementById(id).classList.contains('B')) {
    document.getElementById(id).classList.remove('B')
    document.getElementById(id).classList.add('W')
  }
  else if (document.getElementById(id).classList.contains('W')) {
    document.getElementById(id).classList.remove('W')
    document.getElementById(id).classList.add('B')
  }
}

const judge = (row, column, nowStone, ii, jj) => {
  var rowShift: number = row;
  var columnShift: number = column;
  var jud: boolean = true;
  var result: string[] = [];
  while (jud) {
    rowShift += ii
    columnShift += jj
    var id: string = String(rowShift) + String(columnShift)
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
}

const deprive = (result) => {
  for (var i = 0; i < result.length; i++) {
    changeStone(result[i]);
  }
}

const canPut = (nowStone) => {
  var allConut = 0;
  var setJudge = 0;
  var result: string[] = [];
  for (var i = 1; i <= 8; i++) {
    for (var j = 1; j <= 8; j++) {
      allConut += setJudge;
      setJudge = 0;
      result = [];
      var id: string = String(i) + String(j);
      document.getElementById(id).classList.remove('canPut');

      for (var ii = -1; ii <= 1; ii++) {
        for (var jj = -1; jj <= 1; jj++) {
          if (!(ii == 0 && jj == 0)) {
            result = judge(i, j, nowStone, ii, jj);
            setJudge += result.length;
          }
        }
      }

      if (document.getElementById(id).classList.contains('B') || document.getElementById(id).classList.contains('W')) {
        setJudge = 0;
      }

      if(setJudge > 0){
        document.getElementById(id).classList.add('canPut');
      }

    }
  }
  return allConut;
}

const removeCanPut = () => {
  var setJudge = 0;
  var result: string[] = [];
  for (var i = 1; i <= 8; i++) {
    for (var j = 1; j <= 8; j++) {
      var id: string = String(i) + String(j);
      document.getElementById(id).classList.remove('canPut');

    }
  }
}
