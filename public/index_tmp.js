console.log('hello');

window.onload = () => {

  let nowStone = 'black-stone'

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
        console.log("aaa");
        alert('すでに石がある場所には置けません。');
        return;
      }
      let getId = e.target.getAttribute("id");
      let getRow = Number(getId)/10 | 0;
      let getColumn = Number(getId)%10;

      if (judgeNorth(getRow, getColumn, nowStone)){
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
  setJudge = 0
  for (ii = -1; ii <= 1; ii++) {
    for (jj = -1; jj <= 1; jj++) {
      if(!(ii == 0 && jj == 0)){
        rowShift = row
        columnShift = column
        jud = true;
        result = []
        while(jud){
          rowShift += ii
          columnShift += jj
          id = String(rowShift) + String(columnShift)
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
  for (i = 0; i < result.length; i++){
    changeStone(result[i]);
  }
}
