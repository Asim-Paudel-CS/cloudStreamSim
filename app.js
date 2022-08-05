window.onload = ()=>{
    const slope = new Image();
    slope.src = './Assets/Slopes.png'
    const cloud = new Image();
    cloud.src = './Assets/Cloud.png'
    const rain = new Image();
    rain.src = './Assets/Flow.png'
    const canvas = document.querySelector('canvas');
    const c = canvas.getContext('2d');
    
    //200X200 grid with 10X10 cells
    canvas.width = 2000;
    canvas.height = 2000;
    const gridSize = 100;
    const noColumns = canvas.width/gridSize;
    const noRows = canvas.height/gridSize;
    const centersOfGrid = []
    const centersOfStream = []
    let centerofCloud = [];
    let centerofFlow = [];

    let rowNum = 0;
    for (let y=gridSize/2;y<=canvas.width;y=y+gridSize){
        let colNum = 0;
        for (let x=gridSize/2;x<=canvas.height;x=x+gridSize){
            //create terrain
            let dir;
            if (x<=gridSize*noColumns/2){
                dir = getRndInteger(2,4)
            }
            else{
                dir = getRndInteger(4,6)
            }
            centersOfGrid.push([x,y,dir])
            //create flow
            centerofFlow.push([x,y,0])
            //create stream
            if (
                ((colNum==10)&&(rowNum>=8)&&(rowNum<=11))||((colNum==9)&&(rowNum>=12)&&(rowNum<=16))||((colNum==10)&&(rowNum>=17)&&(rowNum<=19))
                ){
                let arrValue;
                arrValue = centersOfGrid[rowNum*noColumns+colNum];
                centersOfGrid[rowNum*noColumns+colNum] = [arrValue[0],arrValue[1],4]
                centersOfStream.push([x,y,4]);
            }
            if (
                ((colNum==10)&&(rowNum==11))
                ){
                let arrValue;
                arrValue = centersOfGrid[rowNum*noColumns+colNum];
                centersOfGrid[rowNum*noColumns+colNum] = [arrValue[0],arrValue[1],5]
                centersOfStream.push([x,y,5]);
            }
            if(
                ((colNum==9)&&(rowNum==16))
                ){
                let arrValue;
                arrValue = centersOfGrid[rowNum*noColumns+colNum];
                centersOfGrid[rowNum*noColumns+colNum] = [arrValue[0],arrValue[1],3]
                centersOfStream.push([x,y,3]);
            }
            colNum++;
        }
    rowNum++;
    }
    let centerofFlowNext = JSON.parse(JSON.stringify(centerofFlow));

    
    function animate(){
        c.clearRect(0, 0, canvas.width, canvas.height);
        // window.requestAnimationFrame(animate);
        getMaxFlow(centerofFlow,gridSize,canvas);
        allRenders();
        function allRenders() {
            centersOfStream.forEach((value)=>{
                drawStream(c,slope,value[0],value[1],gridSize,value[2]);
            })
            centersOfGrid.forEach((value)=>{
                drawTerrain(c,slope,value[0],value[1],gridSize,value[2]);
            })
            try{flow()}catch{}
            centerofCloud = createCloud(3,3,gridSize,centerofCloud);
            centerofCloud.forEach((value)=>{
                drawClouds(c,cloud,value[0],value[1],gridSize);
            })
        }   
    }
    setInterval(animate,100);
    function flow(){
        let gridSize = 100;
        const freshRain = [];//[x,y,unitflow]
        // add new rain flow
        for(let i=0;i<=4;i++){
            for(let j=0;j<=4;j++){
                freshRain.push([centerofCloud[0][0]+gridSize*i,centerofCloud[0][1]+gridSize*j])
            }   
        }
        freshRain.forEach((value)=>{
            let arrayNumber = returnArrayNo(value[0],value[1],gridSize);
            centerofFlow[arrayNumber][2] = centerofFlow[arrayNumber][2] + 1;
        })
        for (let x=0;x<400;x++){
            if(centerofFlow[x][2]!==0){
                // draw flow
                drawFlow(c,rain,centerofFlow[x][0],centerofFlow[x][1],100,1);
            }
        }
        let str = updateflow();
        centerofFlow = JSON.parse(str);
    }
    
    function updateflow(){
        //move previous flows
        for (let x=0;x<400;x++){
            if(centerofFlow[x][2]!==0){
                let arrayNumberNew
                switch(centersOfGrid[x][2]){
                    case 2:
                        if((x+1)%20==0){
                            centerofFlowNext[x][2] = 0;
                        }else{
                            arrayNumberNew = returnArrayNo(centerofFlow[x][0]+gridSize,centerofFlow[x][1],gridSize)
                            centerofFlowNext[arrayNumberNew][2] = centerofFlow[x][2];
                            centerofFlowNext[x][2] = 0;
                        }
                        break;
                    case 3:
                        if((x+1)%20==0||x>379){
                            centerofFlowNext[x][2] = 0;
                        }else{
                            arrayNumberNew = returnArrayNo(centerofFlow[x][0]+gridSize,centerofFlow[x][1]+gridSize,gridSize)
                            centerofFlowNext[arrayNumberNew][2] = centerofFlow[x][2]
                            centerofFlowNext[x][2] = 0;
                        }
                        break;
                    case 4:
                        if(x>379){
                            centerofFlowNext[x][2] = 0;
                        }else{
                            arrayNumberNew = returnArrayNo(centerofFlow[x][0],centerofFlow[x][1]+gridSize,gridSize)
                            centerofFlowNext[arrayNumberNew][2] = centerofFlow[x][2]
                            centerofFlowNext[x][2] = 0;
                        }
                        break;
                    case 5:
                        if((x+19)%20==0||x>379){
                            centerofFlowNext[x][2] = 0;
                        }else{
                            arrayNumberNew = returnArrayNo(centerofFlow[x][0]-gridSize,centerofFlow[x][1]+gridSize,gridSize)
                            centerofFlowNext[arrayNumberNew][2] = centerofFlow[x][2]
                            centerofFlowNext[x][2] = 0;
                        }
                        break;
                    case 6:
                        if((x+19)%20==0){
                            centerofFlowNext[x][2] = 0;
                        }else{
                            arrayNumberNew = returnArrayNo(centerofFlow[x][0]-gridSize,centerofFlow[x][1],gridSize)
                            centerofFlowNext[arrayNumberNew][2] = centerofFlow[x][2]
                            centerofFlowNext[x][2] = 0;
                        }
                        break;
                }            
            }
        }
        return JSON.stringify(centerofFlowNext);
    }
}
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}
function drawSimple(c,myImg,xCenter,yCenter,size,orientation,color){
    const x = xCenter - size/2;
    const y = yCenter - size/2;
    c.beginPath();
    const lw = 1;
    c.lineWidth = lw;
    c.strokeStyle = color;
    c.rect(x+lw,y+lw,size-lw,size-lw);
    c.stroke();
    const pointer = {
        _up:0,_upRight:1,_right:2,_downRight:3,_down:4,_downLeft:5,_left:6,_upLeft:7,
        set pixelSize(size){
            this[0] = this.up = this._up*size;
            this[1] = this.upRight = this._upRight*size;
            this[2] = this.right = this._right*size;
            this[3] = this.downRight = this._downRight*size;
            this[4] = this.down = this._down*size;
            this[5] = this.downLeft = this._downLeft*size;
            this[6] = this.left = this._left*size;
            this[7] = this.upLeft = this._upLeft*size;
            }
    }
    pointer.pixelSize = 32;
    c.drawImage(
        myImg, // Specifies the image, canvas, or video element to use
        0, //	Optional. The x coordinate where to start clipping
        pointer[orientation], //	Optional. The y coordinate where to start clipping
        32, //	Optional. The width of the clipped image
        32, //	Optional. The height of the clipped image
        x, //	The x coordinate where to place the image on the canvas
        y, //	The y coordinate where to place the image on the canvas
        size, // Optional. The width of the image to use (stretch or reduce the image)
        size  //	Optional. The height of the image to use (stretch or reduce the image)
        );
}
function drawFlow(c,myImg,xCenter,yCenter,size=100){
    const x = xCenter - size/2;
    const y = yCenter - size/2;
    c.beginPath();
    const lw = 10;
    c.lineWidth = lw;
    c.strokeStyle = 'blue';
    c.rect(x+lw,y+lw,size-lw,size-lw);
    c.stroke();
    c.drawImage(
        myImg, // Specifies the image, canvas, or video element to use
        0, //	Optional. The x coordinate where to start clipping
        0, //	Optional. The y coordinate where to start clipping
        32, //	Optional. The width of the clipped image
        32, //	Optional. The height of the clipped image
        x, //	The x coordinate where to place the image on the canvas
        y, //	The y coordinate where to place the image on the canvas
        size, // Optional. The width of the image to use (stretch or reduce the image)
        size  //	Optional. The height of the image to use (stretch or reduce the image)
        );
}
function drawTerrain(c,myImg,xCenter,yCenter,size,orientation){
    drawSimple(c,myImg,xCenter,yCenter,size,orientation,'black');
}
function drawStream(c,myImg,xCenter,yCenter,size,orientation){
    const x = xCenter - size/2;
    const y = yCenter - size/2;
    c.beginPath();
    c.lineWidth = '10'
    c.fillStyle = 'aqua'
    c.rect(x+5,y+5,size-10,size-10);
    c.fill();
    drawSimple(c,myImg,xCenter,yCenter,size,orientation,'white');
}
function drawClouds(c,myImg,xCenter,yCenter,size){
    const x = xCenter - size/2;
    const y = yCenter - size/2;
    c.beginPath();
    const lw = 1;
    c.lineWidth = lw;
    c.strokeStyle = 'blue';
    c.rect(x+lw,y+lw,size-lw,size-lw);
    c.stroke();
    c.drawImage(
        myImg, // Specifies the image, canvas, or video element to use
        0, //	Optional. The x coordinate where to start clipping
        0, //	Optional. The y coordinate where to start clipping
        32, //	Optional. The width of the clipped image
        32, //	Optional. The height of the clipped image
        x, //	The x coordinate where to place the image on the canvas
        y, //	The y coordinate where to place the image on the canvas
        size*5, // Optional. The width of the image to use (stretch or reduce the image)
        size*5  //	Optional. The height of the image to use (stretch or reduce the image)
        );
}
function createCloud(colNum,rowNum,gridSize,previousClouds){
    let cloudArr = [];
    const xMin = (0)*gridSize+gridSize/2;
    const xMax = (15)*gridSize+gridSize/2;
    const yMin = (0)*gridSize+gridSize/2;
    const yMax = (7)*gridSize+gridSize/2;
    
    if(previousClouds.length == 0){
        cloudArr.push([(colNum)*gridSize+gridSize/2,(rowNum)*gridSize+gridSize/2])
        return cloudArr;
    }
    cloudArr = [...previousClouds]
    if(previousClouds.length == 1){
        dy = getRndInteger(-1,1);
        dx = getRndInteger(-1,1);
        cloudArr[0]=[cloudArr[0][0]+gridSize*dx,cloudArr[0][1]+gridSize*dy]
        if(
            cloudArr[0][0]<xMin||
            cloudArr[0][0]>xMax||
            cloudArr[0][1]<yMin||
            cloudArr[0][1]>yMax
            ){
            // console.log(cloudArr,previousClouds,xMin,xMax,yMin,yMax);
            return previousClouds;
            }
        else{
            return cloudArr;
        }
    }
}
function returnArrayNo(xCenter,yCenter,gridSize){
    const colNo = (xCenter-gridSize/2)/gridSize;
    const rowNo = (yCenter-gridSize/2)/gridSize;
    result = rowNo*20+colNo;
    return result;
}
function getMaxFlow(centerofFlow,gridSize,canvas){
    const max = [0,0,0,0,0,0,0,0,0,0,0,0];
    let value = 0;
    let rowNum = 0;
    for (let y=gridSize/2;y<=canvas.width;y=y+gridSize){
        let colNum = 0;
        for (let x=gridSize/2;x<=canvas.height;x=x+gridSize){
        let arrValue;
        arrValue = rowNum*canvas.width/gridSize+colNum;
        if (
            ((colNum==10)&&(rowNum>=8)&&(rowNum<=11))||((colNum==9)&&(rowNum>=12)&&(rowNum<=16))||((colNum==10)&&(rowNum>=17)&&(rowNum<=19))||((colNum==10)&&(rowNum==11))||((colNum==9)&&(rowNum==16))
            ){
            value = Math.max(centerofFlow[arrValue][2],value);
        }
        colNum++;
        }
    rowNum++;
    }
    if(document.getElementById('stream1Value').innerHTML<value){
        document.getElementById('stream1Value').innerHTML = `${value}`;
    }
}
