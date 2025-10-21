// 在沒有 OpenProcessing (OPC) 環境時提供簡單 shim，並設定預設變數
if (typeof OPC === 'undefined') {
    window.OPC = {
        slider: function (name, defaultValue /*, min, max, step */) {
            if (typeof window[name] === 'undefined') {
                window[name] = defaultValue;
            }
        }
    };
}

// 原本的 OPC 設定
/** OPC START **/
OPC.slider('seed', Math.floor(Math.random()*1000), 0, 1000);
OPC.slider('offset', 0.02, 0.001, 0.1, 0.01);
OPC.slider('speed', 0.001, 0, 0.002, 0.00001);
/** OPC END**/


let palette = ["#f4f1de" ,"#eae4d6" ,"#e9dbce" ];
let paletteSc=["#05668d","#028090","#00a896","#02c39a","#f0f3bd","#006d77","#83c5be","#edf6f9","#ffddd2","#e29578"];
let t = 0.0;

// --- 新增選單相關變數和物件 ---
let roundButton;      // 中心圓形按鈕 (資訊按鈕)
let sideMenu;         // 左側固定的選單容器
let unitOneButton;    // 側邊選單中「第一單元作品」的按鈕
let unitOneModal;     // 「第一單元作品」的模態介面
let exitUnitOneButton;// 退出「第一單元作品」的按鈕

// 用來儲存 p5.js 產生的滑塊物件 (這次沒用到，但保留結構)
let seedSlider;
let offsetSlider;
let speedSlider;
// --- 結束新增 ---

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB,360,100,100);
    
    // 設定所有介面元素
    setupSideMenu();
    setupRoundButtonAndModal();
    setupUnitOneModal(); // 新增設定「第一單元作品」介面的函數

    // 預設隱藏所有模態介面
    unitOneModal.hide();
    modalInterface.hide();
}

/**
 * 根據畫布大小計算圓形按鈕的精確位置
 */
function getRoundButtonPosition(btnSize) {
    // 最小圈 (i=0.4) 的中心點計算邏輯
    const i_min = 0.4; 
    let centerX = width / 2 + i_min - 10;
    let centerY = height / 2 - 10;
    
    // 按鈕的實際定位點
    let posX = centerX - btnSize / 2;
    let posY = centerY - btnSize / 2;
    
    return { x: posX, y: posY };
}

// ===================================
// 1. 設定 左側選單 (Side Menu)
// ===================================
function setupSideMenu() {
    sideMenu = createDiv();
    sideMenu.style('position', 'absolute');
    sideMenu.style('top', '0');
    sideMenu.style('left', '0');
    sideMenu.style('width', '180px'); // 固定寬度
    sideMenu.style('height', '100%');
    sideMenu.style('background-color', 'rgba(51, 51, 51, 0.9)'); // 深色半透明背景
    sideMenu.style('padding', '15px');
    sideMenu.style('color', '#fff');
    sideMenu.style('z-index', '99'); // 略低於模態視窗

    sideMenu.child(createElement('h4', '專案選單'));
    
    // 第一個按鈕：第一單元作品
    unitOneButton = createButton('💎 第一單元作品');
    unitOneButton.style('width', '100%');
    unitOneButton.style('margin-bottom', '10px');
    unitOneButton.style('padding', '10px');
    unitOneButton.style('background-color', '#007bff');
    unitOneButton.style('color', '#fff');
    unitOneButton.style('border', 'none');
    unitOneButton.style('cursor', 'pointer');
    unitOneButton.mousePressed(showUnitOneModal);
    sideMenu.child(unitOneButton);
    
    // 可以在這裡加入更多按鈕...
    // sideMenu.child(createButton('第二單元作品').style('width', '100%').style('padding', '10px'));
}

// ===================================
// 2. 設定 中央圓形按鈕 (資訊介面)
// (沿用上次的邏輯，但為了程式碼清晰度，拆分成獨立函數)
// ===================================
function setupRoundButtonAndModal() {
    // 圓形按鈕
    roundButton = createButton('i'); 
    const btnSize = 60; 
    roundButton.style('width', `${btnSize}px`);
    roundButton.style('height', `${btnSize}px`);
    roundButton.style('font-size', '24px');
    roundButton.style('line-height', `${btnSize}px`);
    roundButton.style('background-color', 'rgba(214, 209, 209, 0.9)');
    roundButton.style('border', '3px solid #b3aeaeff');
    roundButton.style('border-radius', '50%'); 
    roundButton.style('cursor', 'pointer');
    roundButton.mousePressed(showModal);
    
    const pos = getRoundButtonPosition(btnSize);
    roundButton.position(pos.x, pos.y);

    // 模態介面容器 (沿用上次的 modalInterface 變數來作為資訊介面)
    modalInterface = createDiv();
    modalInterface.style('position', 'absolute');
    modalInterface.style('top', '0');
    modalInterface.style('left', '0');
    modalInterface.style('width', '100%');
    modalInterface.style('height', '100%');
    modalInterface.style('background-color', 'rgba(245, 201, 230, 0.95)'); 
    modalInterface.style('z-index', '100'); 
    
    let contentDiv = createDiv();
    contentDiv.style('width', '350px'); 
    contentDiv.style('margin', '200px auto'); 
    contentDiv.style('background-color', '#fff'); 
    contentDiv.style('padding', '30px');
    contentDiv.style('border-radius', '15px');
    contentDiv.style('text-align', 'center');
    modalInterface.child(contentDiv);

    // 「嗨!我是邱禾葳」訊息
    let message = createElement('h1', '嗨!我是邱禾葳');
    message.style('color', '#05463bff');
    contentDiv.child(message);

    // 退出按鈕
    exitModalButton = createButton('X 關閉');
    exitModalButton.style('background-color', '#004d40');
    exitModalButton.style('color', '#fff');
    exitModalButton.style('border', 'none');
    exitModalButton.style('padding', '10px 20px');
    exitModalButton.style('border-radius', '5px');
    exitModalButton.style('cursor', 'pointer');
    exitModalButton.style('margin-top', '20px');
    exitModalButton.mousePressed(hideModal);
    contentDiv.child(exitModalButton); 
}

// ===================================
// 3. 設定 「第一單元作品」介面
// ===================================
function setupUnitOneModal() {
    unitOneModal = createDiv();
    unitOneModal.style('position', 'absolute');
    unitOneModal.style('top', '0');
    unitOneModal.style('left', '0');
    unitOneModal.style('width', '100%');
    unitOneModal.style('height', '100%');
    
    // 作品介面的背景色 (例如：半透明紅色)
    unitOneModal.style('background-color', 'rgba(255, 50, 50, 0.95)'); 
    
    unitOneModal.style('z-index', '100'); 
    
    // 內容區域
    let contentDiv = createDiv();
    contentDiv.style('width', '60%'); 
    contentDiv.style('height', '60%');
    contentDiv.style('margin', '10% auto'); 
    contentDiv.style('background-color', '#fff'); 
    contentDiv.style('padding', '30px');
    contentDiv.style('border-radius', '10px');
    unitOneModal.child(contentDiv);
    
    // 標題
    contentDiv.child(createElement('h1', '第一單元作品'));
    contentDiv.child(createP('這是「第一單元作品」的詳細展示介面。您可以在這裡放置圖片、說明或連結。'));


    // 退出按鈕
    exitUnitOneButton = createButton('⬅️ 退出選單');
    exitUnitOneButton.style('background-color', '#333');
    exitUnitOneButton.style('color', '#fff');
    exitUnitOneButton.style('padding', '10px 20px');
    exitUnitOneButton.style('border', 'none');
    exitUnitOneButton.style('cursor', 'pointer');
    exitUnitOneButton.mousePressed(hideUnitOneModal);
    contentDiv.child(exitUnitOneButton); 
}


// ===================================
// 顯示/隱藏 邏輯
// ===================================

// 顯示資訊介面 (i 按鈕點擊)
function showModal() {
    modalInterface.show();
    roundButton.hide();
    noLoop(); 
}

// 隱藏資訊介面 (i 按鈕點擊)
function hideModal() {
    modalInterface.hide();
    roundButton.show();
    loop(); 
}

// 顯示「第一單元作品」介面 (側邊選單按鈕點擊)
function showUnitOneModal() {
    // 隱藏其他可能開啟的介面
    modalInterface.hide(); 
    roundButton.hide(); // 隱藏中央按鈕
    
    unitOneModal.show();
    noLoop(); 
}

// 隱藏「第一單元作品」介面
function hideUnitOneModal() {
    unitOneModal.hide();
    roundButton.show(); // 恢復中央按鈕
    loop(); 
}


function draw() {
    // 繪圖程式碼保持不變
    randomSeed(seed); 
    let cc = color(random(palette));
    background(cc || 255);
    let x = width / 2;
    let y = height / 2;
    for (let i = 0.4; i < 50; i += 0.4) { 
        noiseCircle(x, y, i);
    }
}

function noiseCircle(x, y, i) {
    let sc = color(random(paletteSc));
    push();
    stroke(sc);
    noFill();
    let rBase = pow(i, 2) / 10;
    let xInit = (x + i)-10; 
    let yInit = y - 10;

    let md = dist(mouseX, mouseY, width/2, height/2);
    let maxd = dist(0, 0, width/2, height/2);
    let spread = map(md, 0, maxd, 1, 4);
    
    let rDiv = width * offset * spread; 

    beginShape();
    for (let i = 0, points = 36, radian; i < points + 3; radian = i++/points) {
        let pN = noise(xInit + (rBase) * cos(TAU*radian) * (0.02), yInit + (rBase) * sin(TAU*radian) * 0.05+t); 
        let pR = (rBase) + rDiv * noise(pN);
        let pX = xInit + pR * cos(TAU*radian);
        let pY = yInit + pR * sin(TAU*radian);
        curveVertex(pX, pY);
    }
    endShape(CLOSE);

    pop();
    t+=speed; 
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // 窗口大小改變時，重新計算圓形按鈕的位置
    const btnSize = 60;
    const pos = getRoundButtonPosition(btnSize);
    roundButton.position(pos.x, pos.y);
    // 側邊選單會自動伸縮，無需調整位置
}
