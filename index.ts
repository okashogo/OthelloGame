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
const collection = db.collection('message');

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

collection.orderBy('created_at').get().then(snapshot => {
  snapshot.forEach(doc => {
      const li = document.createElement('li');
      li.textContent = doc.data().id + ' ' + doc.data().stones + ' ' + doc.data().created_at;
      messages.appendChild(li);
  });
});

interface ArrayConstructor {
    from(arrayLike: any, mapFn?, thisArg?): Array<any>;
}

window.onload = () => {

  let nowStone:string = 'black-stone'

  for (let row = 1; row <= 8; row++){
    for (let column = 1; column <= 8; column++){
      document.querySelector('.boxes').insertAdjacentHTML(
        'beforeend',
        '<div class="box" id="' + row + column + '"></div>'
      )
    }
  }

  document.getElementById('44').classList.add('black-stone')
  document.getElementById('55').classList.add('black-stone')
  document.getElementById('45').classList.add('white-stone')
  document.getElementById('54').classList.add('white-stone')

  Array.from(document.getElementsByClassName('box')).forEach(box => {
    box.addEventListener('click', (e) => {
      if (e.target.classList.contains('black-stone') || e.target.classList.contains('white-stone')){
        alert('すでに石がある場所には置けません。');
        return;
      }
      let getId = e.target.getAttribute("id");
      let getRow = Number(getId)/10 | 0;
      let getColumn = Number(getId)%10;

      if (judgeNorth(getRow, getColumn, nowStone)){

        collection.add({
          stones: nowStone,
          created_at: firebase.firestore.FieldValue.serverTimestamp(),
          id: getId
        })
        .then(doc => {
          console.log(doc.id + ' added!');
        })
        .catch(error => {
          console.log(error)
        })

        e.target.classList.add(nowStone);
        nowStone = reverceStone(nowStone);
      }
      else{
        alert('ここには置けません。');
      }
    })
  })
}

const reverceStone = (nowStone) => {
  if (nowStone == 'black-stone'){
    return 'white-stone'
  }
  else{
    return 'black-stone'
   }
}

const changeStone = (id) => {
  if(document.getElementById(id).classList.contains('black-stone')) {
    document.getElementById(id).classList.remove('black-stone')
    document.getElementById(id).classList.add('white-stone')
  }
  else if(document.getElementById(id).classList.contains('white-stone')){
    document.getElementById(id).classList.remove('white-stone')
    document.getElementById(id).classList.add('black-stone')
  }
}

const judgeNorth = (row, column, nowStone) => {
  var setJudge:number = 0
  for (var ii = -1; ii <= 1; ii++) {
    for (var jj = -1; jj <= 1; jj++) {
      if(!(ii == 0 && jj == 0)){
        var rowShift:number = row;
        var columnShift:number = column;
        var jud: boolean = true;
        var result:string[] = [];
        while(jud){
          rowShift += ii
          columnShift += jj
          var id:string = String(rowShift) + String(columnShift)
          if(document.getElementById(id) != null){
            if(document.getElementById(id).classList.contains(reverceStone(nowStone))){
              result.push(id);
            }
            else if(document.getElementById(id).classList.contains(nowStone)){
              deprive(result);
              setJudge += result.length;
              break;
            }
            else{
              break;
            }
          }
          else{
            jud = false;
          }
        }
      }
    }
  }

  return setJudge
}

const deprive = (result) => {
  for (var i = 0; i < result.length; i++){
    changeStone(result[i]);
  }
}
