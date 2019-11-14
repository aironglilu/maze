let ctx;
let canvas;
let maze;
let mazeHeight;
let mazeWidth;
let player;
let n;//迷宫的大小


let isGoing = false;
function onLoad() {

  n = 20;
  canvas = document.getElementById("mainForm");
  ctx = canvas.getContext("2d");
  ctx.canvas.addEventListener('click', clickEvent, false);
  player = new Player();
  maze = new Maze(n, n, 30);
  document.addEventListener("keydown", onKeyDown);

  refreshTip();
}

class Player {

  constructor() {
    //横坐标
    this.col = 0;
    //纵坐标
    this.row = 0;
    //穿墙道具获取的数量，拥有道具时，提示玩家是否使用道具
    this.tools = 0;
    //获得金币数量
    this.coins = 0;
    //生命值初始化为3 ，遇到伤害-1, 值为0时，表示死完
    this.life = 3;

  }

}

class MazeCell {

  constructor(col, row) {
    this.col = col;
    this.row = row;

    this.eastWall = true;
    this.northWall = true;
    this.southWall = true;
    this.westWall = true;

    this.visited = false;
  }

}

class Maze {

  constructor(cols, rows, cellSize) {

    this.backgroundColor = "#ffffff";
    this.cols = cols;
    this.endColor = "#fefea8";
    this.mazeColor = "#000000";
    this.playerColor = "#0fa7ff";

    this.coinsColor = "gold";//金币的颜色
    this.toolsColor = "green";//道具的颜色
    this.monsterColor = "red";//怪物的颜色

    this.rows = rows;
    this.cellSize = cellSize;

    this.cells = [];

    this.generate()

  }

  generate() {

    mazeHeight = this.rows * this.cellSize;
    mazeWidth = this.cols * this.cellSize;

    canvas.height = mazeHeight;
    canvas.width = mazeWidth;
    canvas.style.height = mazeHeight;
    canvas.style.width = mazeWidth;

    for (let col = 0; col < this.cols; col++) {
      this.cells[col] = [];
      for (let row = 0; row < this.rows; row++) {
        this.cells[col][row] = new MazeCell(col, row);
      }
    }

    let rndCol = Math.floor(Math.random() * this.cols);
    let rndRow = Math.floor(Math.random() * this.rows);

    let stack = [];
    stack.push(this.cells[rndCol][rndRow]);

    let currCell;
    let dir;
    let foundNeighbor;
    let nextCell;


    while (this.hasUnvisited(this.cells)) {
      currCell = stack[stack.length - 1];
      currCell.visited = true;
      if (this.hasUnvisitedNeighbor(currCell)) {
        nextCell = null;
        foundNeighbor = false;
        do {
          dir = Math.floor(Math.random() * 4);
          var sign = Math.floor(Math.random() * (this.cols * 2));
          if (sign > 3 || currCell.attribute == 0) sign = 0;
          switch (dir) {
            case 0:
              if (currCell.col !== (this.cols - 1) && !this.cells[currCell.col + 1][currCell.row].visited) {
                currCell.eastWall = false;
                nextCell = this.cells[currCell.col + 1][currCell.row];
                nextCell.westWall = false;
                foundNeighbor = true;
                currCell.attribute = sign;
              }
              break;
            case 1:
              if (currCell.row !== 0 && !this.cells[currCell.col][currCell.row - 1].visited) {
                currCell.northWall = false;
                nextCell = this.cells[currCell.col][currCell.row - 1];
                nextCell.southWall = false;
                foundNeighbor = true;
                currCell.attribute = sign;
              }
              break;
            case 2:
              if (currCell.row !== (this.rows - 1) && !this.cells[currCell.col][currCell.row + 1].visited) {
                currCell.southWall = false;
                nextCell = this.cells[currCell.col][currCell.row + 1];
                nextCell.northWall = false;
                foundNeighbor = true;
                currCell.attribute = sign;
              }
              break;
            case 3:
              if (currCell.col !== 0 && !this.cells[currCell.col - 1][currCell.row].visited) {
                currCell.westWall = false;
                nextCell = this.cells[currCell.col - 1][currCell.row];
                nextCell.eastWall = false;
                foundNeighbor = true;
                currCell.attribute = sign;
              }
              break;
          }
          if (currCell.row == 0 && currCell.col == 0)
            currCell.attribute = 0;
          if (currCell.row == this.rows-1 && currCell.col == this.cols-1)
            currCell.attribute = 0;
          if (foundNeighbor) {
            stack.push(nextCell);
          }
        } while (!foundNeighbor)
      } else {
        currCell = stack.pop();
      }
    }

    this.redraw();

  }

  hasUnvisited() {
    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        if (!this.cells[col][row].visited) {
          return true;
        }
      }
    }
    return false;
  }

  hasUnvisitedNeighbor(mazeCell) {
    return ((mazeCell.col !== 0 && !this.cells[mazeCell.col - 1][mazeCell.row].visited) ||
      (mazeCell.col !== (this.cols - 1) && !this.cells[mazeCell.col + 1][mazeCell.row].visited) ||
      (mazeCell.row !== 0 && !this.cells[mazeCell.col][mazeCell.row - 1].visited) ||
      (mazeCell.row !== (this.rows - 1) && !this.cells[mazeCell.col][mazeCell.row + 1].visited));
  }

  redraw() {

    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, mazeHeight, mazeWidth);

    // ctx.fillStyle = this.endColor;
    // ctx.fillRect((this.cols - 1) * this.cellSize, (this.rows - 1) * this.cellSize, this.cellSize, this.cellSize);
    ctx.drawImage(endImg,(this.cols - 1) * this.cellSize, (this.rows - 1) * this.cellSize, this.cellSize, this.cellSize);

    ctx.strokeStyle = this.mazeColor;
    ctx.strokeRect(0, 0, mazeHeight, mazeWidth);

    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        if (this.cells[col][row].eastWall) {
          ctx.beginPath();
          ctx.moveTo((col + 1) * this.cellSize, row * this.cellSize);
          ctx.lineTo((col + 1) * this.cellSize, (row + 1) * this.cellSize);
          ctx.stroke();
        }
        if (this.cells[col][row].northWall) {
          ctx.beginPath();
          ctx.moveTo(col * this.cellSize, row * this.cellSize);
          ctx.lineTo((col + 1) * this.cellSize, row * this.cellSize);
          ctx.stroke();
        }
        if (this.cells[col][row].southWall) {
          ctx.beginPath();
          ctx.moveTo(col * this.cellSize, (row + 1) * this.cellSize);
          ctx.lineTo((col + 1) * this.cellSize, (row + 1) * this.cellSize);
          ctx.stroke();
        }
        if (this.cells[col][row].westWall) {
          ctx.beginPath();
          ctx.moveTo(col * this.cellSize, row * this.cellSize);
          ctx.lineTo(col * this.cellSize, (row + 1) * this.cellSize);
          ctx.stroke();
        }
        switch (this.cells[col][row].attribute) {
          case 1:
            // ctx.fillStyle = this.coinsColor;
            // ctx.fillRect((col * this.cellSize) + 2, (row * this.cellSize) + 2, this.cellSize - 4, this.cellSize - 4);
            ctx.drawImage(coinsImg,(col * this.cellSize) + 2, (row * this.cellSize) + 2, this.cellSize - 4, this.cellSize - 4)
            break;
          case 2:
            // ctx.fillStyle = this.toolsColor;
            // ctx.fillRect((col * this.cellSize) + 2, (row * this.cellSize) + 2, this.cellSize - 4, this.cellSize - 4);
            ctx.drawImage(toolsImg,(col * this.cellSize) + 2, (row * this.cellSize) + 2, this.cellSize - 4, this.cellSize - 4)
            break;
          case 3:
            // ctx.fillStyle = this.monsterColor;
            // ctx.fillRect((col * this.cellSize) + 2, (row * this.cellSize) + 2, this.cellSize - 4, this.cellSize - 4);
            ctx.drawImage(monsterImg,(col * this.cellSize) + 2, (row * this.cellSize) + 2, this.cellSize - 4, this.cellSize - 4)
            break;

          default:
            break;
        }
      }
    }

    
    ctx.drawImage(playerImg,(player.col * this.cellSize) + 2, (player.row * this.cellSize) + 2, this.cellSize - 4, this.cellSize - 4)

    //ctx.fillStyle = this.playerColor;
    // ctx.beginPath();
    // ctx.moveTo((player.col * this.cellSize) + 2, (player.row * this.cellSize) + this.cellSize - 2);
    // ctx.lineTo((player.col * this.cellSize) + (this.cellSize / 2), (player.row * this.cellSize) + 2);
    // ctx.lineTo((player.col * this.cellSize) + this.cellSize - 2, (player.row * this.cellSize) + this.cellSize - 2);
    // ctx.fill();
    //console.log((player.col * this.cellSize) + 14, (player.row * this.cellSize) + 2, this.cellSize - 4, this.cellSize - 4);
    //ctx.fillRect((player.col * this.cellSize) + 2, (player.row * this.cellSize) + 2, this.cellSize - 4, this.cellSize - 4);

    this.cells[player.col][player.row].attribute = 0;
    refreshTip();
  }


}

var count = 0;
function onKeyDown(event) {
  count++;
  switch (event.keyCode) {
    case 37:
    case 65:
      if (!maze.cells[player.col][player.row].westWall) {
        player.col -= 1;
      }
      break;
    case 39:
    case 68:
      if (!maze.cells[player.col][player.row].eastWall) {
        player.col += 1;
      }
      break;
    case 40:
    case 83:
      if (!maze.cells[player.col][player.row].southWall) {
        player.row += 1;
      }
      break;
    case 38:
    case 87:
      if (!maze.cells[player.col][player.row].northWall) {
        player.row -= 1;
      }
      break;
    default:
      break;
  }
  maze.redraw();
}

var playerImg = new Image();
playerImg.src ="/img/hero.jpg";
var monsterImg = new Image();
monsterImg.src ="/img/monster.jpg";
var toolsImg = new Image();
toolsImg.src ="/img/heart.jpg";
var coinsImg = new Image();
coinsImg.src ="/img/gold.jpg";
var endImg = new Image();
endImg.src ="/img/terminus.jpg";




// var interval= setInterval(function () {

//   if (player.row == maze.rows - 1 && player.col == maze.cols - 1) {
//     document.getElementById('counter').innerText = "You win with " + count;
//   alert("你赢了!");
//   clearInterval(interval);
//   }
// }, 1000);


function onPress(el) {
  count++;
  switch (el) {
    case 3:
      if (!maze.cells[player.col][player.row].westWall) {
        player.col -= 1;
      }
      break;
    case 4:
      if (!maze.cells[player.col][player.row].eastWall) {
        player.col += 1;
      }
      break;
    case 2:
      if (!maze.cells[player.col][player.row].southWall) {
        player.row += 1;
      }
      break;
    case 1:
      if (!maze.cells[player.col][player.row].northWall) {
        player.row -= 1;
      }
      break;
    default:
      break;
  }
  maze.redraw();
}

function clickEvent(e) {
  if (isGoing) return;
  isGoing = true;
  var nextplayer = getEventPosition(e);
  console.log(nextplayer)

  BFS(player, nextplayer)

  function getEventPosition(ev) {
    var x, y;
    if (ev.layerX || ev.layerX == 0) {
      x = ev.layerX;
      y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      x = ev.offsetX;
      y = ev.offsetY;
    }
    x = parseInt(x / maze.cellSize);
    y = parseInt(y / maze.cellSize);
    return { col: x, row: y };
  }

}

class Position						//队列元素类型
{
  constructor() {
    this.x = 0;					//当前方块位置
    this.y = 0;					//当前方块位置
    this.pre = 0;       //前驱方块的下标
  }
};
let qu = [];
let V = [-1, 0, 1, 0];			//垂直偏移量
let H = [0, 1, 0, -1];			//水平偏移量,下标对应方位号0～3
let D = ['eastWall', 'northWall', 'westWall', 'southWall'];			//方向


function BFS(curr, des) {    //求从(x,y)出发的一条迷宫路径
  front = -1;
  rear = -1;				//初始化队头和队尾

  //Position p,p1,p2;
  var p = new Position(), p1 = new Position();
  p.x = curr.col;
  p.y = curr.row;
  p.pre = -1;			//建立入口结点
  maze.cells[p.x][p.y].sign = '*';

  rear++;
  qu[rear] = p;				//入口方块进队
  while (front != rear)				//队不空循环
  {
    front++; p1 = qu[front];		//出队方块p1;
    if (p1.x == des.col && p1.y == des.row)	//找到出口
    {
      disppath(front);		//输出路径
      return;
    }
    for (let k = 0; k < 4; k++)		//试探p1的每个相邻方位 为什么是4
    {
      let p2 = new Position();
      p2.x = p1.x + V[k];			//找到p1的相邻方块p2
      p2.y = p1.y + H[k];
      //if (p2.x>=0 && p2.y>=0 && p2.x<n && p2.y<n &&( Maze[p2.x][p2.y]=='O'||Maze[p2.x][p2.y]==' '))
      //if (p2.x>=0 && p2.y>=0 && p2.x<n && p2.y<n &&( Maze[p2.x][p2.y]!='X'&&Maze[p2.x][p2.y]!='*'))

      if (p2.x >= 0 && p2.y >= 0 && p2.x < n && p2.y < n && (!maze.cells[p2.x][p2.y][D[k]] && maze.cells[p2.x][p2.y].sign != '*')) {

        //方块p2有效并且可走
        //				

        maze.cells[p2.x][p2.y].sign = '*';	//改为'*'避免重复查找
        p2.pre = front;
        rear++;
        qu[rear] = p2;	//方块p2进队
        /*	
          */
      }
    }
  }
  isGoing = false;
}

function disppath(front)			//输出一条迷宫路径
{
  let i, j;
  for (i = 0; i < n; i++)				//将所有'*'改为'O'
    for (j = 0; j < n; j++)
      if (maze.cells[i][j].sign == '*')
        maze.cells[i][j].sign = 'O';
  let k = front;
  let path = [];
  while (k != -1)					//即路径上的方块改为' '
  {

    let mark = maze.cells[qu[k].x][qu[k].y];
    // switch (mark.sign) {
    //   case '1':
    //     coins++; break;
    //   case '2':
    //     tools++; break;
    //   case '3':
    //     life--;
    //     if (life == 0) console.log("Dead\n");
    //     break;
    // }
    //Mazebak[qu[k].x][qu[k].y]=' ';
    if (qu[k].x != player.col || qu[k].y != player.row)
      path.push(qu[k])
    //	k--;
    k = qu[k].pre;
  }
  var index = path.length - 1;
  if (index >= 0)
    go();
  else isGoing = false;
  for (let index = path.length - 1; index >= 0; index--) {
    const element = path[index];

  }
  function go() {
    if (player.life == 0) {
      alert('你死了');
      console.log("Dead\n");
      return;
    }
    if (player.row == maze.rows - 1 && player.col == maze.cols - 1) {
      document.getElementById('counter').innerText = "You win with " + count;
      alert("你赢了!");
      return;
    }
    if (index < 0) {
      isGoing = false;
      return
    }



    player.col = path[index].x;
    player.row = path[index].y;

    switch (maze.cells[player.col][player.row].attribute) {
      case 1:
        player.coins++; break;
      case 2:
        player.life++; break;
      case 3:
        player.life--;
        break;
    }
    refreshTip();
    maze.redraw();

    index--;

    setTimeout(go, 200);

  }
  //player = nextplayer

  // console.log("当前获得金币%d,道具%d,伤害%d\n", coins, tools, life);
  // for (i=0; i<n;i++)				//输出迷宫路径
  // {	console.log("    ");
  // 	for(let j=0; j<n;j++)
  //   console.log("%c",Mazebak[i][j]);
  // 	console.log("\n");
  // }

}

function refreshTip() {
  document.getElementById("sp_coin").innerHTML = (player.coins);
  document.getElementById("sp_blood").innerHTML = (player.life);
}