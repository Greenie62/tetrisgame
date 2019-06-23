var gameapp=document.querySelector(".gameapp");
var playerbox=document.querySelector(".playerbox");
var loader=document.querySelector('.load-container');
var score=0;
var scoreDOM=document.querySelector("#score");
var scoreboard=document.querySelector(".scoreboard")
scoreboard.style.transition=1.5;
scoreboard.style.opacity=0;
var playerDOM=document.querySelector("#player");
var dropSound=new Audio('./sounds/woosh.wav')
var moveSound=new Audio('./sounds/tick.mp3')
var explosion=new Audio('./sounds/explosion.wav')

var down=document.querySelector('.down');
var left=document.querySelector(".left")
var right=document.querySelector('.right')
var rotateRight=document.querySelector('.rotate-right')
var rotateLeft=document.querySelector('.rotate-left')

var playerBtn=document.querySelector(".play-btn");

const canvas=document.querySelector("#tetris");
const context=canvas.getContext("2d");
var playerName=document.querySelector("input[type='text']")
context.scale(20,20);

context.fillStyle="black"
context.fillRect(0,0,canvas.width,canvas.height)


playerBtn.addEventListener("click",startGame)

function startGame(){

    playerDOM.innerHTML=playerName.value;


    loader.style.display='flex'
    playerbox.classList.toggle('bye-playerbox')

    setTimeout(()=>{
        gameapp.classList.toggle("see-gameapp")
        loader.style.display='none'
        playerbox.style.opacity=0;
        tetrisPlay()
    },2500)
}


function tetrisPlay(){

    function createPiece(piece){
        switch(piece){

            case "I":
            var matrix=[
                [0,1,0,0],
                [0,1,0,0],
                [0,1,0,0],
                [0,1,0,0]
            ]
            break;

            case "T":
            matrix=[
                [0,0,0],
                [2,2,2],
                [0,2,0]
            ]
            break;


            case "Z":
            matrix=[
                [0,0,0],
                [3,3,0],
                [0,3,3]
            ]
            break;


            case "S":
            matrix=[
                [0,0,0],
                [0,4,4],
                [4,4,0]
            ]
            break;


            case "O":
            matrix=[
                [5,5],
                [5,5]
            ]
            break;


            case "L":
            matrix=[
                [0,6,0],
                [0,6,0],
                [0,6,6]
            ]
            break;

            case "J":
            matrix=[
                [0,7,0],
                [0,7,0],
                [7,7,0]
            ]
        }
        return matrix;
    }

    var pieces="LSTOJIZ"
    var colors={
        1:"#2863c1",
        2:"#8d3bdb",
        3:"#db3bd0",
        4:"#db1342",
        5:"#20cedb",
        6:"#0fd870",
        7:"#391a66"
    }

    var player={
        matrix:createPiece(pieces[pieces.length * Math.random() | 0]),
        pos:{x:5,y:5}
    }

    function drawArena(h,w){
        var matrix=[];
        while(h--){
            matrix.push(new Array(w).fill(0))
        }
        return matrix;
    }

    var arena=drawArena(20,12);

    function merge(arena,player){
        player.matrix.forEach((row,y)=>{
            row.forEach((value,x)=>{
                if(value !== 0){
                    arena[y+player.pos.y][x+player.pos.x] = value
                }
            })
        })
    }

    function collide(arena,player){
        const [m,o] = [player.matrix, player.pos]
        for(let y=0;y<m.length;++y){
            for(let x=0;x<m[y].length;++x){
                if(m[y][x] !== 0 && (arena[y+o.y] && arena[y+o.y][x+o.x]) !== 0 ){
                    return true;
                }
            }
        }
        return false;
    }

    function rotate(matrix,dir){
        for(let y=0;y<matrix.length;++y){
            for(let x=0;x<y;++x){
                [
                    matrix[x][y],
                    matrix[y][x]
                ]  =
                [
                    matrix[y][x],
                    matrix[x][y]
                ]
            }
        }
        if(dir > 0){
            matrix.forEach(row=>row.reverse())
        }
        else{
            matrix.reverse()
        }
    }

    function playerRotate(dir){
        var pos=player.pos.x
        var offset=1;
        rotate(player.matrix,dir)

        while(collide(arena,player)){
            player.pos.x += offset;
            offset=-(offset+(offset > 0 ? 1 : -1))
            if(offset > player.matrix[0].length){
                player.pos.x=pos;
                rotate(player.matrix,dir)
                return;
            }
        }
    }

    function arenaSweep(){
        outer: for(let y=arena.length -1 ;y >0 ;--y){
            for(let x=0;x<arena[y].length;++x){
                if(arena[y][x] === 0){
                    continue outer
                }
            }
            let row=arena.splice(y,1)[0].fill(0)
            arena.unshift(row)
            ++y;
            score+=100;
            scoreDOM.innerHTML=score;
            explosion.play()
        }
    }

    function drawMatrix(matrix,offset){
        matrix.forEach((row,y)=>{
            row.forEach((value,x)=>{
                if(value !==0){
                    context.fillStyle=colors[value]
                    context.fillRect(x+ offset.x,
                                     y+ offset.y,
                                    1,1)
                }
            })
        })
    }
   
    function draw(){

        context.fillStyle="black"
        context.fillRect(0,0,canvas.width,canvas.height)
    drawMatrix(arena,{x:0,y:0})
    drawMatrix(player.matrix, player.pos)
    }

    var dropInterval=1000;
    var dropCounter=0;

    var lastTime=0

    function update(time=0){
        var deltaTime=time-lastTime;
        lastTime=time;

        dropCounter += deltaTime
        if(dropCounter > dropInterval){
            playerDrop()
        }
        draw()
        requestAnimationFrame(update)
    }

    update()

    document.onkeydown=function(e){
        switch(e.keyCode){
            
            case 37:
            playerMove(-1)
            break;

            case 39:
            playerMove(1)
            break;

            case 40:
            playerDrop()
            break;

            case 87:
            playerRotate(1)
            break;

            case 81:
            playerRotate(-1)
            break;
        }
    }

    function playerMove(dir){
        player.pos.x += dir;
        moveSound.play()
        if(collide(arena,player)){
            player.pos.x -= dir;
        }
    }


    function playerDrop(){
        player.pos.y++;
        dropSound.play()
        if(collide(arena,player)){
            player.pos.y--
            merge(arena,player)
            playerReset()
            arenaSweep()
        }
        dropCounter=0;
    }


    function playerReset(){
        player.pos.y=0;
        player.matrix=createPiece(pieces[pieces.length * Math.random() | 0])
        player.pos.x=(arena[0].length/2 | 0) - (player.matrix[0].length / 2 | 0)
     
    if(collide(arena,player)){
        if(score > 300){
            var li=document.createElement('li');
            scoreboard.style.opacity=1;
            li.appendChild(document.createTextNode("Player: " + playerName.value +  "  Score: " + score))
            document.getElementById("scoreboard").appendChild(li)
        }
        arena.forEach(row=>row.fill(0))
        score=0;
        scoreDOM=score;
    }
}

down.addEventListener("click",()=>{
    playerDrop()
})

left.addEventListener("click",()=>{
    playerMove(-1)
})

right.addEventListener("click",()=>{
    playerMove(1)
})

rotateLeft.addEventListener("click",()=>{
    playerRotate(-1)
})

rotateRight.addEventListener("click",()=>{
    playerRotate(1)
})



}