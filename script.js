import {
    getDatabase,        // 🎯 Khởi tạo kết nối tới Realtime Database
    ref,                // 📍 Tạo tham chiếu (đường dẫn) đến một node trong database

    // --- Thao tác ghi & đọc dữ liệu ---
    set,                // ✍️ Ghi đè toàn bộ dữ liệu tại vị trí (xóa những dữ liệu cũ không được khai báo)
    update,             // 🛠️ Cập nhật một phần dữ liệu (giữ nguyên phần không cập nhật)
    get,                // 📥 Lấy dữ liệu một lần (trả về snapshot)
    child,

    // --- Thêm & xóa dữ liệu ---
    push,               // ➕ Thêm node con mới với key tự động (hay dùng trong danh sách chat, comment...)
    remove,             // ❌ Xóa dữ liệu tại một node

    // --- Lắng nghe sự kiện thay đổi dữ liệu theo thời gian thực ---
    onValue,            // 👂 Lắng nghe mọi thay đổi tại một node (bất kỳ thay đổi nào cũng gọi callback)
    onChildAdded,       // 🧩 Khi có node con mới được thêm vào
    onChildChanged,     // 🔄 Khi một node con bị thay đổi giá trị
    onChildRemoved,     // 🗑️ Khi một node con bị xóa
    off,                // 🔇 Hủy đăng ký lắng nghe sự kiện (dùng khi không cần lắng nghe nữa)

    // --- Transaction & thời gian ---
    runTransaction,     // 🔁 Cập nhật dữ liệu theo cách an toàn khi có thể có xung đột (ví dụ đếm số lượt like)
    serverTimestamp,    // 🕒 Ghi thời gian từ server Firebase (không lệ thuộc giờ máy người dùng)

    // --- Truy vấn dữ liệu ---
    query,              // 🔍 Dùng để tạo truy vấn (kết hợp các hàm lọc/sắp xếp bên dưới)
    orderByChild,       // 🔠 Sắp xếp theo giá trị của một thuộc tính con
    orderByKey,         // 🔑 Sắp xếp theo key
    orderByValue,       // 📊 Sắp xếp theo giá trị chính của node

    limitToFirst,       // 📏 Giới hạn lấy N phần tử đầu tiên
    limitToLast,        // 📏 Giới hạn lấy N phần tử cuối cùng
    startAt,            // 🔽 Bắt đầu lấy từ giá trị >= (ví dụ: startAt(5))
    endAt,              // 🔼 Kết thúc ở giá trị <=
    equalTo             // 🎯 Chỉ lấy các node có giá trị bằng một giá trị nào đó
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";


// Truy cập cơ sở dữ liệu Firebase
const db = getDatabase();  // Không cần khởi tạo lại

//Hàm ghi dữ liệu lên Firebase
var userDataOld = {};
var userDataNew = {};
let isFinalLoadData = false;

var keyLogin = ""
let isOut = false;
function checkUserLogins() {
    if (!isFinalLoadData) return;

    const userDataRef = ref(db, 'allUsers/' + username);

    get(userDataRef).then(snapshot => {
        let data = snapshot.val();

        if (data.keyLogin !== keyLogin) {
            //Có người khác đăng nhập vào
            console.log("Có người khác đã đăng nhập vào")
            isOut = true;
            //Tạo popup đếm ngược
            const countdownPopup = document.createElement("div");
            countdownPopup.id = "countdownPopup"; // Thêm ID để truy cập dễ dàng
            countdownPopup.style.position = "fixed";
            countdownPopup.style.top = "50%";
            countdownPopup.style.left = "50%";
            countdownPopup.style.transform = "translate(-50%, -50%)";
            countdownPopup.style.padding = "20px";
            countdownPopup.style.backgroundColor = "#ffcc00";
            countdownPopup.style.color = "#000";
            countdownPopup.style.borderRadius = "10px";
            countdownPopup.style.fontSize = "24px";
            countdownPopup.style.zIndex = "1000";
            countdownPopup.style.textAlign = "center";
            countdownPopup.innerHTML = "Có người đăng nhập vào. Bạn sẽ bị thoát trong <span id='countdown'>10</span> giây.";
            document.body.appendChild(countdownPopup);

            // 4️⃣ Chạy bộ đếm ngược từ 10 → 1
            let countdown = 10;
            let countdownInterval = setInterval(() => {
                const countdownElement = document.getElementById("countdown");
                if (countdownElement) {
                    countdownElement.innerText = countdown;
                }

                countdown--;
                if (countdown < 0) {
                    clearInterval(countdownInterval);
                    countdownInterval = null;
                    window.location.reload();
                }
            }, 1000);
        }
    })
}

function saveDataUserToFirebase() {
    const userDataRef = ref(db, 'allUsers/' + username);

    if (!isFinalLoadData) return;

    // Kiểm tra các giá trị khác
    if (endGame) {
        [typeGameConquest.skillBattle, typeGameConquest.battlePetUseSlotRound].forEach((obj) => {
            Object.values(obj).forEach((skill) => {
                skill.COOLDOWN[4] = 0;
                skill.DAME[3] = 0;
                skill.HEAL[3] = 0;
                skill.SHIELD[3] = 0;
                skill.BURN[3] = 0;
                skill.POISON[3] = 0;
                skill.CRIT[3] = 0;
            });
        });
    }

    // Tạo dữ liệu người dùng
    let userPetIDs = {}
    if (!userPet) {
        userPet = {}
    } else {
        userPetIDs = Object.fromEntries(
            Object.entries(userPet).map(([key, pet]) => {
                const { URLimg, ...rest } = pet;  // Loại URLimg ra
                return [key, rest];  // Trả về cặp key và rest (pet không có URLimg)
            })
        );
        // Kiểm tra nếu userPetIDsOld không có bất kỳ phần tử nào
        if (Object.keys(userPetIDs).length < 1) {
            userPetIDs = {};  // Đặt lại thành đối tượng rỗng thay vì mảng
        }
    }

    let battleUserPetIDs = {}
    if (Object.keys(typeGameConquest.battleUserPet).length < 1) {
        battleUserPetIDs = {}; // Tránh trường hợp không có battle pet
    } else {
        battleUserPetIDs = Object.fromEntries(
            Object.entries(typeGameConquest.battleUserPet).map(([key, pet]) => {
                const { URLimg, ...rest } = pet;  // Loại URLimg ra
                return [key, rest];  // Trả về cặp key và rest (pet không có URLimg)
            })
        );
    }

    let battleUserPetRoundIDs = {}
    if (Object.keys(typeGameConquest.battleUserPetRound).length < 1) {
        battleUserPetRoundIDs = {}; // Tránh trường hợp không có battle pet round
    } else {
        battleUserPetRoundIDs = Object.fromEntries(
            Object.entries(typeGameConquest.battleUserPetRound).map(([key, pet]) => {
                const { URLimg, ...rest } = pet;  // Loại URLimg ra
                return [key, rest];  // Trả về cặp key và rest (pet không có URLimg)
            })
        );
    }

    let allBattleUsersData = {
        typeGameConquest: {
            ...typeGameConquest,
            battleUserPetRound: battleUserPetRoundIDs,
            battleUserPet: battleUserPetIDs
        },
        typeGameSolo5Mon,
        typeGameGuess
    };

    // Tạo dữ liệu mới
    userDataNew = {
        passwordUser: password,
        nameUser: nameUser,
        activateUser: activateUser,
        telUser: telUser,
        pointRank: pointRank,
        goldUser: goldUser,
        // staminaUser: staminaUser,
        weightBagUser: weightBagUser,
        // luckyMeet5Mon: luckyMeet5Mon,
        diamondUser: diamondUser,
        onGame: onGame,
        infoStartGame: infoStartGame,
        characterUser: characterUser,
        allCharacterUser: allCharacterUser,
        userPet: userPetIDs,
        battleData: allBattleUsersData,
        isBan: isBan,
        timeOnline: timeOnline,
        onlineLasted: onlineLasted,
        weekOnline: weekOnline,
        ticketsUser: ticketsUser,
        vipTicket: vipTicket,
        idSkillRND: idSkillRND,
        todayCheckin: todayCheckin,
        weekCheckin: weekCheckin,
        giftCheckinComplete: giftCheckinComplete,
        questDay: questDay,
        questWeek: questWeek,
        questWeekend: questWeekend
    };

    //Kiểm tra và lưu userDataNew
    if (JSON.stringify(userDataOld) !== JSON.stringify(userDataNew)) {
        // Lưu dữ liệu vào Firebase
        let dataUpdate = { ...userDataNew, staminaUser: staminaUser, luckyMeet5Mon: luckyMeet5Mon };

        update(userDataRef, dataUpdate)
            .then(() => {
                console.log("🟢 Dữ liệu đã được lưu!");
                userDataOld = { ...userDataNew }; // Cập nhật userDataOld sau khi lưu
            })
            .catch((error) => {
                console.error("❌ Lỗi khi lưu dữ liệu:", error);
            });

        // Kiểm tra nếu pointRank là số, thì chuyển thành object mặc định
        if (typeof pointRank === 'number') {
            pointRank = {
                typeGameConquest: pointRank,
                typeGameSolo5Mon: 0,
                typeGameGuess: 0
            };
        }

        const rankDataRef = ref(db, 'rankGame/' + username + '/rankPoint');
        update(rankDataRef, pointRank)
            .then(() => {
                console.log("✅ Cập nhật rank của bạn");
            })
            .catch((error) => {
                console.error("❌ Lỗi khi lưu rank của bạn", error);
            });

    }

}

// Hàm để thiết lập lắng nghe sự kiện cho tất cả input
function setupAutoUpdate() {
    // Lắng nghe tất cả sự kiện input, change và click trong toàn bộ trang
    document.addEventListener('input', function () {
        checkUserLogins();
        saveDataUserToFirebase(); // Lắng nghe sự kiện input
    });

    document.addEventListener('change', function () {
        checkUserLogins();
        saveDataUserToFirebase(); // Lắng nghe sự kiện thay đổi (đối với các input select, checkbox...)
    });

    document.addEventListener('click', function () {
        checkUserLogins();
        saveDataUserToFirebase(); // Nếu bạn muốn theo dõi click (ví dụ như nút, checkbox...)
    });

    // Lắng nghe sự kiện kéo thả
    document.addEventListener('dragstart', function () {
        checkUserLogins();
        saveDataUserToFirebase(); // Khi bắt đầu kéo thả
    });

    document.addEventListener('dragover', function (event) {
        event.preventDefault(); // Cho phép thả vào vị trí
    });

    document.addEventListener('drop', function (event) {
        event.preventDefault(); // Ngừng hành động mặc định
        checkUserLogins();
        saveDataUserToFirebase(); // Khi thả đối tượng
    });
}



// Gọi setupAutoUpdate() để thiết lập lắng nghe sự kiện khi trang load
setupAutoUpdate();

// 🔥 Hàm đọc dữ liệu từ Firebase
var allDataUser = "";
function readDataUser() {
    if (!username) {
        console.error("⚠️ Username không hợp lệ!");
        return;
    }

    const userRef = ref(db, "allUsers/" + username);

    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            allDataUser = snapshot.val();
            console.log("📄 Dữ liệu người dùng đã lưu vào biến:", allDataUser);
        } else {
            console.log("⚠️ Không tìm thấy dữ liệu!");
        }
    }).catch((error) => {
        console.error("❌ Lỗi khi đọc dữ liệu:", error);
    });
}

// 🔥 Hàm theo dõi dữ liệu thay đổi (Realtime)
function listenForUserChanges() {
    const userRef = ref(db, "allUsers/" + username);

    onValue(userRef, (snapshot) => {
        console.log("🔄 Cập nhật dữ liệu:", snapshot.val());
    });
}

//Biến cục bộ
var allPets = [];
var allComps = []; //Mảng toàn bộ Comps
var allCharacter = {}; //Mảng lưu nhân vật
var allQuestData = {}; //Mảng lưu nhiệm vụ

var effectsSkill = {}; // Tạo đối tượng để lưu các Effect Skill và mô tả tương ứng
var effectsInternal = {}; // Tạo đối tượng để lưu các Effect Internal và mô tả tương ứng
var effectsSellUp = {}; // Tạo đối tượng để lưu các Effect SellUp và mô tả tương ứng
// Load toàn bộ dữ liệu chỉ trong 1 lần gọi

var rankGame = {}

function updateRankGameToFB() {
    const allUsersRef = ref(db, 'allUsers');

    get(allUsersRef)
        .then(snapshot => {
            if (!snapshot.exists()) {
                console.error("❌ allUsers không tồn tại");
                return;
            }

            const allUsers = snapshot.val();
            const rankGame = {};

            for (const username in allUsers) {
                if (allUsers.hasOwnProperty(username)) {
                    const user = allUsers[username];
                    let userPointRank = user.pointRank;

                    // Nếu pointRank là số thì cập nhật lại cả allUsers
                    if (typeof userPointRank === 'number') {
                        const fixedRank = {
                            typeGameConquest: userPointRank,
                            typeGameGuess: 0,
                            typeGameSolo5Mon: 0
                        };

                        // Cập nhật lại cho user đó trong allUsers
                        const userRef = ref(db, 'allUsers/' + username + '/pointRank');
                        set(userRef, fixedRank)
                            .then(() => {
                                console.log(`✅ Đã sửa pointRank của ${username} thành object trong allUsers.`);
                            })
                            .catch(error => {
                                console.error(`❌ Lỗi khi sửa pointRank của ${username}:`, error);
                            });

                        userPointRank = fixedRank;
                    } else {
                        // Nếu là object thì đảm bảo đủ 3 trường
                        userPointRank = {
                            typeGameConquest: userPointRank?.typeGameConquest ?? 0,
                            typeGameGuess: userPointRank?.typeGameGuess ?? 0,
                            typeGameSolo5Mon: userPointRank?.typeGameSolo5Mon ?? 0
                        };
                    }

                    // Dữ liệu cho rankGame
                    rankGame[username] = {
                        rankPoint: userPointRank
                    };
                }
            }

            // Ghi rankGame mới vào Firebase
            set(ref(db, 'rankGame'), rankGame)
                .then(() => {
                    console.log('✅ rankGame đã được cập nhật thành công trên Firebase.');
                })
                .catch(error => {
                    console.error('❌ Lỗi khi ghi rankGame vào Firebase:', error);
                });
        })
        .catch(error => {
            console.error("❌ Lỗi khi lấy allUsers:", error);
        });
}


function loadAllData() {

    const dbRef = ref(db);

    Promise.all([
        get(child(dbRef, 'allCharacter')),
        get(child(dbRef, 'allQuestData')),
        get(child(dbRef, 'allPets')),
        get(child(dbRef, 'defaultHP')),
        get(child(dbRef, 'allComps')),
        get(child(dbRef, 'skillDescriptions')),
    ]).then(([charSnap, questSnap, petsSnap, hpSnap, compsSnap, skillSnap]) => {
        allCharacter = charSnap.val() || [];
        allQuestData = questSnap.val() || {};
        allPets = petsSnap.val() || [];
        defaultHP = hpSnap.val();
        allComps = compsSnap.val() || [];
        console.log("allComps", allComps);

        const skillDescriptions = skillSnap.val() || {};
        const effectsSkillArray = skillDescriptions.effectsSkill || [];
        const effectsInternalArray = skillDescriptions.effectsInternal || [];
        const effectsSellUpArray = skillDescriptions.effectsSellUp || [];

        effectsSkill = effectsSkillArray.reduce((acc, item) => {
            acc[item.name] = {
                dameSkill: item.dameSkill,
                descriptionSkill: item.descriptionSkill
            };
            return acc;
        }, {});

        effectsInternal = effectsInternalArray.reduce((acc, item) => {
            acc[item.name] = {
                dameInternal: item.dameInternal,
                descriptionInternal: item.descriptionInternal
            };
            return acc;
        }, {});

        effectsSellUp = effectsSellUpArray.reduce((acc, item) => {
            acc[item.name] = {
                dameSellUp: item.dameSellUp,
                descriptionSellUp: item.descriptionSellUp
            };
            return acc;
        }, {});

        console.log(effectsSkill, effectsInternal, effectsSellUp);
        console.log("allPets", allPets);
        console.log("allCharacter", allCharacter);
        console.log("allComps", allComps);
    }).catch(error => {
        console.error("Error loading data from Firebase:", error);
    });
}

function loadAllComp() {
    function updatePowerScale(allPets, objectsToUpdate) {
        // Duyệt qua từng object trong mảng objectsToUpdate
        for (const obj of objectsToUpdate) {
                const item = obj;
                // console.log("item", item)
                // console.log("item.ID", item.ID)
                const matchedPet = allPets.find(pet => pet.ID === item.ID);

                if (matchedPet) {
                    console.log("Vào đây matchedPet", matchedPet)
                    // Gán lại POWER.SCALE theo allPets
                    if (!item.POWER) item.POWER = {};
                    item.POWER.SCALE = matchedPet.POWER.SCALE;

                    item.PRICE = matchedPet.PRICE

                    //Gắn lại EFFECT 
                    item.EFFECT = matchedPet.EFFECT
                    item.SELLUP = matchedPet.SELLUP
                    item.INTERNAL = matchedPet.INTERNAL
                    item.TYPE = matchedPet.TYPE

                    let powerINT = scalePower5Mon(item.POWER.INT);

                    if (item.EFFECT.includes("Attacking")) {
                        item.DAME[0] = Math.round(powerINT.dame * item.POWER.SCALE)
                    } else {
                        item.DAME[0] = 0
                    }

                    if (item.EFFECT.includes("Healing")) {
                        item.HEAL[0] = Math.round(powerINT.heal * item.POWER.SCALE)
                    } else {
                        item.HEAL[0] = 0
                    }

                    if (item.EFFECT.includes("Shield")) {
                        item.SHIELD[0] = Math.round(powerINT.shield * item.POWER.SCALE)
                    } else {
                        item.SHIELD[0] = 0
                    }

                    if (item.EFFECT.includes("Burn")) {
                        item.BURN[0] = Math.round(powerINT.burn * item.POWER.SCALE)
                    } else {
                        item.BURN[0] = 0
                    }

                    if (item.EFFECT.includes("Poison")) {
                        item.POISON[0] = Math.round(powerINT.poison * item.POWER.SCALE)
                    } else {
                        item.POISON[0] = 0
                    }

                    //Tính cooldown
                    let agi = item.POWER.AGI;
                    let minC = 8;
                    let maxC = 20;

                    let scaleC = Math.max(5, 170 - Math.floor((agi - 200) / 9)); // giảm dần, min là 5

                    let valueC = ((maxC - minC) / (1 + agi / scaleC) * 1000) * (2 - item.POWER.SCALE);

                    //tính crit
                    let luk = item.POWER.LUK;
                    let maxCrit = 60;
                    let scaleCrit = 1500; // tùy chỉnh
                    let valueCrit = maxCrit * luk / (luk + scaleCrit);
                    valueCrit = Math.min(maxCrit, Math.max(0, valueCrit));
                    valueCrit = Math.round(valueCrit * item.POWER.SCALE); 

                    //tính def
                    let def = item.POWER.DEF;
                    let maxDef = 90;
                    let scaleDef = 475; // tùy chỉnh
                    let valueDef = maxDef * def / (def + scaleDef);
                    valueDef = Math.min(maxDef, Math.max(0, valueDef));
                    valueDef = Math.round(valueDef * item.POWER.SCALE);

                    item.DEF[0] = valueDef
                    item.CRIT[0] = valueCrit
                    item.COOLDOWN[0] = Math.ceil(valueC)
                    item.URLimg = matchedPet.URLimg
                }
        }
    }
    
    const compUpdateRef = ref(db, `allCompsRound`);

    get(compUpdateRef).then((snapshot) => {
        const allCompsRound = snapshot.val() || {};
        
        for (const roundKey in allCompsRound) {
            const compInRound = allCompsRound[roundKey];
    
            // Bỏ qua nếu compInRound không phải object
            if (typeof compInRound !== 'object' || compInRound === null) continue;
    
            for (const compKey in compInRound) {
                const comp = compInRound[compKey];
    
                if (!comp || typeof comp.slotSkillComp !== 'object') continue;
    
                const skillKeys = Object.keys(comp.slotSkillComp);
                const skillObjects = skillKeys.map(key => comp.slotSkillComp[key]);
    
                updatePowerScale(allPets, skillObjects);
    
                const updatedSlotSkillComp = {};
                skillKeys.forEach((key, index) => {
                    updatedSlotSkillComp[key] = skillObjects[index];
                });
                comp.slotSkillComp = updatedSlotSkillComp;
            }
        }
    
        return set(compUpdateRef, allCompsRound);
    })
    .then(() => console.log("✅ Cập nhật allCompsByRound thành công"))
    .catch(err => console.error("❌ Lỗi cập nhật allCompsByRound:", err));

}

//Khai báo các biến
//Thông tin User
var username = "";
var password = "";
var nameUser = "";
var telUser = "";
var activateUser = "";
var emailUser = "";
var goldUser = 0;
var staminaUser = 0; // Khởi tạo staminaUser
var weightBagUser = 0;
var luckyMeet5Mon = 0;
var diamondUser = 0;

var pointRank = { typeGameConquest: 0, typeGameSolo5Mon: 0, typeGameGuess: 0 }
var characterUser = "";
var allCharacterUser = [];
var isBan = "";
var timeOnline = "";
var newTimeOnline = "";
var onlineLasted = "";
var weekOnline = ""
var newWeekOnline = "";
var ticketsUser = 0;
var vipTicket = "Thường";
var pointRankComp = "";
var todayCheckin = "";
var weekCheckin = { cn: 0, t2: 0, t3: 0, t4: 0, t5: 0, t6: 0, t7: 0 };
var giftCheckinComplete = ""
var questDay = { qd1: [0, "No"], qd2: [0, "No"], qd3: [0, "No"], qd4: [0, "No"], qd5: [0, "No"], qd6: [0, "No"] };;
var questWeek = { qw1: [0, "No"], qw2: [0, "No"], qw3: [0, "No"], qw4: [0, "No"], qw5: [0, "No"], qw6: [0, "No"] };;
var questWeekend = { qwe1: [0, "No"], qwe2: [0, "No"], qwe3: [0, "No"], qwe4: [0, "No"], qwe5: [0, "No"], qwe6: [0, "No"] };;

//Chế độ game
var onGame = 0;
var infoStartGame = { typeGame: "Conquest", modeGame: "Normal", difficultyGame: "Easy", roundGame: 1, stepGame: 0, winStreak: 0, } //type game: Conquest (chinh phục), Solo5Mon (đối kháng), Guess (Dự đoán) //modeGame: Guide, Normal, Rank //difficultyGame: Easy, Normal, Hard, Very Hard, Hell


//Pet mà user có (trong sheet User)
var userPet = {}; //pet để hiển thị ở tủ đồ

//Hp của người chơi (nếu round = 1 thì auto Hp = 300; còn round > 1 thì Hp được lấy từ googleSheet)
var defaultHP = 0;
var maxHpUp = 0;
var idSkillRND = 0; //ID random tạo id cho div skill

//Chỉ số trong game
//Điểm nhận được qua mỗi round
let modeGamePoint = 0;

//Thông tin của người chơi
var nowHpBattleMy = 0;
var nowShieldBattleMy = 0;
var nowBurnBattleMy = 0;
var nowPoisonBattleMy = 0;

//Thông tin chỉ số 
var nowHpBattleComp = 0;
var nowShieldBattleComp = 0;
var nowBurnBattleComp = 0;
var nowPoisonBattleComp = 0;

let isLogin = false;
var defaultSTT5Mon = {
    ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg: {Lv1: "", Lv2: "", Lv3: "", Lv4: ""},
    LEVEL: 0, POWER: { ATK: 0, DEF: 0, AGI: 0, INT: 0, LUK: 0, HP: 0, SCALE: 0 }, DAME: [0, 0, 0, 0, 0, 0], DEF: [0, 0, 0, 0, 0, 0],
    HEAL: [0, 0, 0, 0, 0, 0], SHIELD: [0, 0, 0, 0, 0, 0], BURN: [0, 0, 0, 0, 0, 0], POISON: [0, 0, 0, 0, 0, 0], 
    CRIT: [0, 0, 0, 0, 0, 0], COOLDOWN: [0, 0, 0, 0, 0, 0], PRICE: 0,
};

var defaultSTT5MonInBattle = {
    ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg: {Lv1: "", Lv2: "", Lv3: "", Lv4: ""},
    LEVEL: 0, POWER: { ATK: 0, DEF: 0, AGI: 0, INT: 0, LUK: 0, HP: 0, SCALE: 0 }, DAME: [0, 0, 0, 0, 0, 0], DEF: [0, 0, 0, 0, 0, 0],
    HEAL: [0, 0, 0, 0, 0, 0], SHIELD: [0, 0, 0, 0, 0, 0], BURN: [0, 0, 0, 0, 0, 0], POISON: [0, 0, 0, 0, 0, 0], 
    CRIT: [0, 0, 0, 0, 0, 0], COOLDOWN: [0, 0, 0, 0, 0, 0], PRICE: 0, PRICESELL: 0,
};

var typeGameGuess = {}
var typeGameSolo5Mon = {}
var typeGameConquest = {
    winBattle: 0,
    loseBattle: 0,
    pointBattle: 0,
    reRoll: 0,
    reRollPrice: 0,
    starUser: 0,
    selectCharacterBattle: "",
    slowB: 0,
    upCooldownB: 0,
    dameCritB: 0,
    slowA: 0,
    upCooldownA: 0,
    dameCritA: 0,
    selectSkillShop: 0,
    usernameComp: "",
    idComp: "",
    nameComp: "",
    maxHpBattleComp: 0,
    winComp: 0,
    loseComp: 0,
    selectCharacterComp: "",
    battleUserPet: [""],
    maxHpBattle: 0,
    // slotLock: {skill1B: false, skill2B: false, skill3B: true, skill4B: true, skill5B: true, skill6B: true, skill7B: true, skill8B: true, skill9B: true},
    battleUserPetRound: [""],
    battlePetUseSlotRound: {
        skill1B: defaultSTT5MonInBattle,
        skill2B: defaultSTT5MonInBattle,
        skill3B: defaultSTT5MonInBattle,
        skill4B: defaultSTT5MonInBattle,
        skill5B: defaultSTT5MonInBattle,
        skill6B: defaultSTT5MonInBattle,
        skill7B: defaultSTT5MonInBattle,
        skill8B: defaultSTT5MonInBattle,
        skill9B: defaultSTT5MonInBattle,
    },
    battlePetInShop: {
        battleShop1: defaultSTT5MonInBattle,
        battleShop2: defaultSTT5MonInBattle,
        battleShop3: defaultSTT5MonInBattle,
        battleShop4: defaultSTT5MonInBattle,
        battleShop5: defaultSTT5MonInBattle,
    },
    battlePetInInventory: {
        battleInv1: defaultSTT5MonInBattle,
        battleInv2: defaultSTT5MonInBattle,
        battleInv3: defaultSTT5MonInBattle,
        battleInv4: defaultSTT5MonInBattle,
        battleInv5: defaultSTT5MonInBattle,
        battleInv6: defaultSTT5MonInBattle,
        battleInv7: defaultSTT5MonInBattle,
        battleInv8: defaultSTT5MonInBattle,
        battleInv9: defaultSTT5MonInBattle,
    },
    skillBattle: {
        skill1A: defaultSTT5MonInBattle,
        skill2A: defaultSTT5MonInBattle,
        skill3A: defaultSTT5MonInBattle,
        skill4A: defaultSTT5MonInBattle,
        skill5A: defaultSTT5MonInBattle,
        skill6A: defaultSTT5MonInBattle,
        skill7A: defaultSTT5MonInBattle,
        skill8A: defaultSTT5MonInBattle,
        skill9A: defaultSTT5MonInBattle,
        skill1B: defaultSTT5MonInBattle,
        skill2B: defaultSTT5MonInBattle,
        skill3B: defaultSTT5MonInBattle,
        skill4B: defaultSTT5MonInBattle,
        skill5B: defaultSTT5MonInBattle,
        skill6B: defaultSTT5MonInBattle,
        skill7B: defaultSTT5MonInBattle,
        skill8B: defaultSTT5MonInBattle,
        skill9B: defaultSTT5MonInBattle,
    },
};

function loadDataForUser() {
    const userDataRef = ref(db, `allUsers/${username}`); // Truy cập đường dẫn dữ liệu người dùng

    const rankGameData = ref(db, 'rankGame');

    get(rankGameData)
        .then(snapshot => {
            if (!snapshot.exists()) {
                console.error("Dữ liệu không tồn tại trong Firebase.");
                rankGame = {};  // Khởi tạo biến rankGame nếu chưa có dữ liệu
                return;
            }

            const data = snapshot.val();

            if (!data) {
                console.error("Dữ liệu trả về từ Firebase là null hoặc undefined.");
                return;
            }

            rankGame = data;
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu từ Firebase:", error);
        });

    // Sử dụng `get` để lấy dữ liệu từ Firebase
    get(userDataRef)
        .then((snapshot) => {
            if (!snapshot.exists()) {
                console.error("Dữ liệu không tồn tại trong Firebase.");
                return;
            }

            const data = snapshot.val(); // Lấy dữ liệu

            // Kiểm tra nếu dữ liệu trả về hợp lệ
            if (!data) {
                console.error("Dữ liệu trả về từ Firebase là null hoặc undefined.");
                return;
            }

            // Cập nhật thông tin game
            typeGameConquest = { ...typeGameConquest, ...data.battleData.typeGameConquest };
            typeGameGuess = { ...typeGameGuess, ...data.battleData.typeGameGuess };
            typeGameSolo5Mon = { ...typeGameSolo5Mon, ...data.battleData.typeGameSolo5Mon };
            if (!data.battleData.typeGameConquest.battleUserPet) {
                typeGameConquest.battleUserPet = {}; // Nếu chưa có, tạo mới
            }

            if (!data.battleData.typeGameConquest.battleUserPetRound) {
                typeGameConquest.battleUserPetRound = {}; // Nếu chưa có, tạo mới
            }

            // Lấy danh sách pet của người dùng
            if (!data.userPet) {
                userPet = {}; // Nếu chưa có, tạo mới userPet là một đối tượng trống
            } else {
                userPet = Object.entries(data.userPet).map(([key, pet]) => {
                    const matched = allPets.find(p => p.ID === pet.ID && Number(p.LEVEL) === 1);
                    if (matched) {
                        return [key, { ...pet, URLimg: matched.URLimg }];
                    }
                    return [key, pet];
                });

                // Bước 2: Chuyển mảng [key, value] trở lại object
                userPet = Object.fromEntries(userPet) ?? {};
            }
            console.log("userPet", userPet)

            // Cập nhật các thông tin cơ bản
            goldUser = data.goldUser;
            staminaUser = data.staminaUser;
            weightBagUser = data.weightBagUser || 100;
            luckyMeet5Mon = data.luckyMeet5Mon || 5;
            diamondUser = data.diamondUser || 0;
            infoStartGame = { ...infoStartGame, ...data.infoStartGame } || { typeGame: "Conquest", modeGame: "Normal", difficultyGame: "Easy", roundGame: 1, stepGame: 0, winStreak: 0 };
            activateUser = data.activateUser;
            characterUser = data.characterUser;

            
        console.log(allCharacter)
        console.log(characterUser)
        document.getElementById("playerHunter").src = allCharacter[characterUser].urlIMG
        
            allCharacterUser = data.allCharacterUser;
            onGame = data.onGame;
            idSkillRND = data.idSkillRND;
            pointRank = data.pointRank || { typeGameConquest: 0, typeGameSolo5Mon: 0, typeGameGuess: 0 };
            nameUser = data.nameUser;
            isBan = data.isBan;
            timeOnline = data.timeOnline;
            onlineLasted = data.onlineLasted;
            allCharacterUser = data.allCharacterUser || ["C0001"];

            weekOnline = data.weekOnline && data.weekOnline !== "" ? data.weekOnline : getISOWeek(new Date());

            // Cập nhật thông tin tuần và thời gian hiện tại
            newWeekOnline = getISOWeek(new Date());
            let now = new Date();
            now.setHours(now.getHours() + 7); // Cộng thêm 7 giờ cho múi giờ Việt Nam
            newTimeOnline = now.toISOString().split('T')[0];

            restoreStamina(timeOnline);

            console.log("timeOnline", timeOnline);
            console.log("newTimeOnline", newTimeOnline);
            console.log("weekOnline", weekOnline);
            console.log("newWeekOnline", newWeekOnline);

            // Các thông tin khác
            ticketsUser = data.ticketsUser;
            vipTicket = data.vipTicket === "No" ? "Thường" : data.vipTicket;
            todayCheckin = data.todayCheckin || "No";
            weekCheckin = { ...weekCheckin, ...data.weekCheckin } || { cn: 0, t2: 0, t3: 0, t4: 0, t5: 0, t6: 0, t7: 0 };
            giftCheckinComplete = data.giftCheckinComplete || "";
            questDay = { ...questDay, ...data.questDay } || { qd1: [0, "No"], qd2: [0, "No"], qd3: [0, "No"], qd4: [0, "No"], qd5: [0, "No"], qd6: [0, "No"] };
            questWeek = { ...questWeek, ...data.questWeek } || { qw1: [0, "No"], qw2: [0, "No"], qw3: [0, "No"], qw4: [0, "No"], qw5: [0, "No"], qw6: [0, "No"] };
            questWeekend = { ...questWeekend, ...data.questWeekend } || { qwe1: [0, "No"], qwe2: [0, "No"], qwe3: [0, "No"], qwe4: [0, "No"], qwe5: [0, "No"], qwe6: [0, "No"] };

            // Lấy thông tin battle pets         
            typeGameConquest.battleUserPet = !data.battleData?.typeGameConquest?.battleUserPet
                ? {}
                : Object.fromEntries(
                    Object.entries(data.battleData.typeGameConquest.battleUserPet).map(([key, pet]) => {
                        const matched = allPets.find(p => p.ID === pet.ID && Number(p.LEVEL) === 1);
                        return [key, matched ? { ...pet, URLimg: matched.URLimg } : pet];
                    })
                );


            // Cập nhật UI
            document.getElementById("textNameComp").innerText = typeGameConquest.nameComp;

            // Kiểm tra điểm rank của đối thủ
            Object.keys(rankGame).forEach((key) => {
                if (key === typeGameConquest.usernameComp) {
                    pointRankComp = rankGame[key].rankPoint.typeGameConquest;
                    console.log("pointRankComp", pointRankComp);
                }
            });

            typeGameConquest.battleUserPetRound = !data.battleData?.typeGameConquest?.battleUserPetRound
                ? {}
                : Object.fromEntries(
                    Object.entries(data.battleData.typeGameConquest.battleUserPetRound).map(([key, pet]) => {
                        const matched = allPets.find(p => p.ID === pet.ID && Number(p.LEVEL) === 1);
                        return [key, matched ? { ...pet, URLimg: matched.URLimg } : pet];
                    })
                );

            // Cập nhật UI thông tin người dùng
            document.getElementById("nameUser").innerText = `${nameUser}`;
            resetGoldAndTicket();
            isFinalLoadData = true;
            updateStamina();
            hideLoading();

            // Hiển thị popup nếu user chưa chọn nhân vật
            if (!characterUser || characterUser === "") {
                openPopupSelectCharacter(true);
                if (guideMode) showStepGuide(0);
            }

            // Reset checkin và nhiệm vụ
            resetDayorWeek();


            //Lưu data vào dataUserOld
            if (endGame) {
                [typeGameConquest.skillBattle, typeGameConquest.battlePetUseSlotRound].forEach((obj) => {
                    Object.values(obj).forEach((skill) => {
                        skill.COOLDOWN[4] = 0;
                        skill.DAME[3] = 0;
                        skill.HEAL[3] = 0;
                        skill.SHIELD[3] = 0;
                        skill.BURN[3] = 0;
                        skill.POISON[3] = 0;
                        skill.CRIT[3] = 0;
                    });
                });
            }

            // Tạo dữ liệu người dùng //+++
            let userPetIDsOld = Object.fromEntries(
                Object.entries(userPet).map(([key, pet]) => {
                    const { URLimg, ...rest } = pet;  // Loại URLimg ra
                    return [key, rest];  // Trả về cặp key và rest (pet không có URLimg)
                })
            );

            // Kiểm tra nếu userPetIDsOld không có bất kỳ phần tử nào
            if (Object.keys(userPetIDsOld).length < 1) {
                userPetIDsOld = {};  // Đặt lại thành đối tượng rỗng thay vì mảng
            }

            let battleUserPetIDsOld = Object.fromEntries(
                Object.entries(typeGameConquest.battleUserPet).map(([key, pet]) => {
                    const { URLimg, ...rest } = pet;  // Loại URLimg ra
                    return [key, rest];  // Trả về cặp key và rest (pet không có URLimg)
                })
            );

            if (Object.keys(battleUserPetIDsOld).length < 1) {
                battleUserPetIDsOld = {};
            }

            let battleUserPetRoundIDsOld = Object.fromEntries(
                Object.entries(typeGameConquest.battleUserPetRound).map(([key, pet]) => {
                    const { URLimg, ...rest } = pet;  // Loại URLimg ra
                    return [key, rest];  // Trả về cặp key và rest (pet không có URLimg)
                })
            );

            if (Object.keys(battleUserPetRoundIDsOld).length < 1) {
                battleUserPetRoundIDsOld = {};
            }

            let allBattleUsersData = {
                typeGameConquest: {
                    ...typeGameConquest,
                    battleUserPetRound: battleUserPetRoundIDsOld,
                    battleUserPet: battleUserPetIDsOld
                },
                typeGameSolo5Mon,
                typeGameGuess
            };

            function updatePowerScale(allPets, objectsToUpdate) {
                // Duyệt qua từng object trong mảng objectsToUpdate
                for (const obj of objectsToUpdate) {
                    // Duyệt qua từng key trong object đó
                    Object.keys(obj).forEach(key => {
                        const item = obj[key];
                        const matchedPet = allPets.find(pet => pet.ID === item.ID);
                        if (matchedPet) {
                            // Gán lại POWER.SCALE theo allPets
                            if (!item.POWER) item.POWER = {};
                            item.POWER.SCALE = matchedPet.POWER.SCALE;

                            item.PRICE = matchedPet.PRICE

                            //Gắn lại EFFECT 
                            item.EFFECT = matchedPet.EFFECT
                            item.SELLUP = matchedPet.SELLUP
                            item.INTERNAL = matchedPet.INTERNAL
                            item.TYPE = matchedPet.TYPE

                            let powerINT = scalePower5Mon(item.POWER.INT);

                            if (item.EFFECT.includes("Attacking")) {
                                item.DAME[0] = Math.round(powerINT.dame * item.POWER.SCALE)
                            } else {
                                item.DAME[0] = 0
                            }

                            if (item.EFFECT.includes("Healing")) {
                                item.HEAL[0] = Math.round(powerINT.heal * item.POWER.SCALE)
                            } else {
                                item.HEAL[0] = 0
                            }

                            if (item.EFFECT.includes("Shield")) {
                                item.SHIELD[0] = Math.round(powerINT.shield * item.POWER.SCALE)
                            } else {
                                item.SHIELD[0] = 0
                            }

                            if (item.EFFECT.includes("Burn")) {
                                item.BURN[0] = Math.round(powerINT.burn * item.POWER.SCALE)
                            } else {
                                item.BURN[0] = 0
                            }

                            if (item.EFFECT.includes("Poison")) {
                                item.POISON[0] = Math.round(powerINT.poison * item.POWER.SCALE)
                            } else {
                                item.POISON[0] = 0
                            }

                            //Tính cooldown
                            let agi = item.POWER.AGI;
                            let minC = 8;
                            let maxC = 20;

                            let scaleC = Math.max(5, 170 - Math.floor((agi - 200) / 9)); // giảm dần, min là 5

                            let valueC = ((maxC - minC) / (1 + agi / scaleC) * 1000) * (2 - item.POWER.SCALE);

                            //tính crit
                            let luk = item.POWER.LUK;
                            let maxCrit = 60;
                            let scaleCrit = 1500; // tùy chỉnh
                            let valueCrit = maxCrit * luk / (luk + scaleCrit);
                            valueCrit = Math.min(maxCrit, Math.max(0, valueCrit));
                            valueCrit = Math.round(valueCrit * item.POWER.SCALE);

                            //tính def
                            let def = item.POWER.DEF;
                            let maxDef = 90;
                            let scaleDef = 475; // tùy chỉnh
                            let valueDef = maxDef * def / (def + scaleDef);
                            valueDef = Math.min(maxDef, Math.max(0, valueDef));
                            valueDef = Math.round(valueDef * item.POWER.SCALE);

                            item.DEF[0] = valueDef
                            item.CRIT[0] = valueCrit
                            item.COOLDOWN[0] = Math.ceil(valueC)
                            item.URLimg = matchedPet.URLimg
                        }
                    });
                }
            }


            // Lấy toàn bộ slotSkillComp từ allComps (dạng object), cùng với các object còn lại
            const allSkillSources = [
                typeGameConquest.battlePetInShop,
                typeGameConquest.battlePetUseSlotRound,
                typeGameConquest.battleUserPet,
                typeGameConquest.battleUserPetRound,
                typeGameConquest.skillBattle,
                userPet,
            ];

            // Gọi hàm xử lý tất cả
            updatePowerScale(allPets, allSkillSources);

            // Lặp qua từng phần tử trong allComps để cập nhập lại comps

            userDataOld = {
                passwordUser: password,
                nameUser: nameUser,
                activateUser: activateUser,
                telUser: telUser,
                pointRank: pointRank,
                goldUser: goldUser,
                // staminaUser: staminaUser,
                weightBagUser: weightBagUser,
                // luckyMeet5Mon: luckyMeet5Mon,
                diamondUser: diamondUser,
                onGame: onGame,
                infoStartGame: infoStartGame,
                characterUser: characterUser,
                allCharacterUser: allCharacterUser,
                userPet: userPetIDsOld,
                battleData: allBattleUsersData,
                isBan: isBan,
                timeOnline: timeOnline,
                onlineLasted: onlineLasted,
                weekOnline: weekOnline,
                ticketsUser: ticketsUser,
                vipTicket: vipTicket,
                idSkillRND: idSkillRND,
                todayCheckin: todayCheckin,
                weekCheckin: weekCheckin,
                giftCheckinComplete: giftCheckinComplete,
                questDay: questDay,
                questWeek: questWeek,
                questWeekend: questWeekend
            };

            console.log("userDataOld", userDataOld)


        })
        .catch(error => {
            console.error("Lỗi khi tải dữ liệu từ Firebase:", error);
        });
}

//Tăng stamina cho user mỗi khi đăng nhập hoặc quay lại
let staminaInterval = null; // dùng để lưu ID của setInterval

function startStaminaRegen() {
    console.log("Bắt đầu hồi thể lực");
    if (staminaInterval) return; // tránh tạo nhiều interval

    staminaInterval = setInterval(() => {
        if (staminaUser < 1000) {
            staminaUser += 1;
            updateStamina();

            let now = new Date();
            now.setHours(now.getHours() + 7); // múi giờ VN
            onlineLasted = now.toISOString();

            console.log("🔥 Hồi 1 thể lực");
        }
    }, 1 * 60 * 1000); // 1 phút
}

function stopStaminaRegen() {
    if (staminaInterval) {
        clearInterval(staminaInterval);
        staminaInterval = null;
        console.log("🛑 Đã dừng hồi thể lực");
    }
}

function restoreStamina() {
    if (!onlineLasted) return;

    let now = new Date();
    now.setHours(now.getHours() + 7);

    let last = new Date(onlineLasted);
    let diffMs = now - last;
    let diffMin = Math.floor(diffMs / (1000 * 60));

    let staminaToAdd = Math.floor(diffMin / 1);
    if (staminaToAdd > 1000) staminaToAdd = 1000
    if (staminaToAdd > 0) {
        staminaUser += staminaToAdd;
        if (staminaUser > 1000) {
            staminaUser = 1000

        } else {
            messageOpen(`🔥 Đã hồi ${staminaToAdd} thể lực lúc bạn offline!`);
        }
        updateStamina();
    }
}


//Hàm tính tuần trong năm
function getISOWeek(date) {
    // Tạo đối tượng Date theo giờ Việt Nam (UTC+7)
    let d = new Date(date.getTime() + 7 * 60 * 60 * 1000);

    // Đưa về đầu ngày theo giờ Việt Nam
    d.setHours(0, 0, 0, 0);

    // Đưa về thứ 5 của tuần đó
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));

    // Lấy ngày đầu năm theo giờ Việt Nam
    let yearStart = new Date(d.getFullYear(), 0, 1);
    yearStart.setHours(0, 0, 0, 0); // Đảm bảo cũng là 0h theo giờ Việt Nam

    // Tính số tuần trong năm
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function resetDayorWeek() {
    // Kiểm tra nếu đã qua ngày mới
    if (newTimeOnline !== timeOnline) {
        console.log("Ngày mới! Reset biến daily...");
        todayCheckin = "No";
        questDay = { qd1: [0, "No"], qd2: [0, "No"], qd3: [0, "No"], qd4: [0, "No"], qd5: [0, "No"], qd6: [0, "No"] };
        staminaUser = 1000;
        // Kiểm tra nếu hôm nay là thứ 2, reset thêm biến tuần
        timeOnline = newTimeOnline
        if (weekOnline !== newWeekOnline) {
            console.log("Đầu tuần mới! Reset biến weekly...");
            weekCheckin = { cn: 0, t2: 0, t3: 0, t4: 0, t5: 0, t6: 0, t7: 0 };
            giftCheckinComplete = "";
            questWeek = { qw1: [0, "No"], qw2: [0, "No"], qw3: [0, "No"], qw4: [0, "No"], qw5: [0, "No"], qw6: [0, "No"] };
            questWeekend = { qwe1: [0, "No"], qwe2: [0, "No"], qwe3: [0, "No"], qwe4: [0, "No"], qwe5: [0, "No"], qwe6: [0, "No"] };
            weekOnline = newWeekOnline
        }
    }
}

//Battle
var endGame = true;

//Khai bào biến để lưu ID cooldown
var animationFrameIds = [];
let skillsSleepA = { skill1A: 0, skill2A: 0, skill3A: 0, skill4A: 0, skill5A: 0, skill6A: 0, skill7A: 0, skill8A: 0, skill9A: 0 };
let skillsDeleteA = { skill1A: 0, skill2A: 0, skill3A: 0, skill4A: 0, skill5A: 0, skill6A: 0, skill7A: 0, skill8A: 0, skill9A: 0 };
let skillsSleepB = { skill1B: 0, skill2B: 0, skill3B: 0, skill4B: 0, skill5B: 0, skill6B: 0, skill7B: 0, skill8B: 0, skill9B: 0 };
let skillsDeleteB = { skill1B: 0, skill2B: 0, skill3B: 0, skill4B: 0, skill5B: 0, skill6B: 0, skill7B: 0, skill8B: 0, skill9B: 0 };

function userSkillA(skillKey, isComp) {
    const skillElement = document.getElementById(skillKey);
    let overlayDiv = null;

    // for (const child of skillElement.children) {
    //     if (child.classList.contains("skillCooldownOverlay") || child.classList.contains("skillCooldownOverlayLV")) {
    //         overlayDiv = child;
    //         break;
    //     }
    // }

    //Tính mutilcast=> đánh liên tiếp
    let doubleSkill = Math.max(typeGameConquest.skillBattle[skillKey].COOLDOWN[1] + typeGameConquest.skillBattle[skillKey].COOLDOWN[2] + typeGameConquest.skillBattle[skillKey].COOLDOWN[3], 1)
    Object.keys(effectsSkill).forEach((effectSkill) => {
        if (typeGameConquest.skillBattle[skillKey].EFFECT.includes(effectSkill)) {
            for (let d = 1; d <= doubleSkill; d++) {
                setTimeout(() => {
                    useSkill(skillKey, effectSkill, overlayDiv, isComp);
                }, 350 * (d - 1)); // Thực hiện sử dụng skill với delay tăng dần
            }
        }
    });
}
function baseAttack(skillKey, isComp) {
    // Kiểm tra skill có tồn tại không
    if (!typeGameConquest.skillBattle[skillKey] || !typeGameConquest.skillBattle[skillKey].ID) {
        return;
    }

    if (endGame === true) {
        stopSkillGame()
        return;
    }

    const skill = document.getElementById(skillKey);
    const overlay = skill.querySelector('.skillCooldownOverlay');

    const cooldownTime = typeGameConquest.skillBattle[skillKey].COOLDOWN[0];

    // Ưu tiên kiểm tra trạng thái Sleep/delete
    let skillsSleep = isComp ? skillsSleepA : skillsSleepB;
    let skillsDelete = isComp ? skillsDeleteA : skillsDeleteB;
    let skillsSpeed = isComp ? skillsSpeedA : skillsSpeedB;

    if (skillsDelete[skillKey] === 1) {
        return; // Bỏ qua nếu bị xoá
    }

    // Đặt lại trạng thái overlay ban đầu
    overlay.style.transitionDuration = '0ms'; // Không có hiệu ứng chuyển tiếp ban đầu
    overlay.style.transform = 'scaleY(1)';    // Đặt overlay đầy (hiện full)

    // Khởi tạo thời gian bắt đầu hồi chiêu
    let startTime = Date.now();
    let elapsedTime = 0;

    function updateCooldown() {
        // Nếu game đã kết thúc, không làm gì nữa
        if (endGame) return;

        if (skillsSleep[skillKey] > 0) {
            // Đang bị sleep, không cập nhật elapsedTime, giữ nguyên startTime
            setTimeout(updateCooldown, 100); // Kiểm tra lại sau 100ms
            return;
        } else {
            const skillChild = skill.querySelector('.skill');
            if (skillChild && skillChild.classList.contains('sleep')) {
                skillChild.classList.remove('sleep');
                console.log(`${skillKey} đã hết sleep và class 'sleep' đã được xóa`);
            }
        }

        const now = Date.now();
        const delta = now - startTime;
        startTime = now;

        //Khởi tạo biến cooldown
        let hasteMultiplier = 1;
        if (skillsSpeed[skillKey] > 0) { //Nếu tăng tốc
            hasteMultiplier = 2;
            const skillChild = skill.querySelector('.skillCooldownOverlay');
            skill.style.boxShadow = '0 0 10px 3px rgba(255, 0, 0, 0.75)';
            skill.style.animation = 'speedGlow 1.5s infinite alternate';
            if (skillChild) {
                skillChild.style.background = 'linear-gradient(to bottom, #ff0404, #ff040438, #ff040438, #ff040438, #ff040438, #ff040438, #ff0404)'
            }
        } else if (skillsSpeed[skillKey] < 0) { //Nếu slow
            hasteMultiplier = 0.5;
            const skillChild = skill.querySelector('.skillCooldownOverlay');
            skill.style.boxShadow = '0 0 10px 3px rgba(0, 233, 255, 0.75)';
            skill.style.animation = 'slowGlow 1.5s infinite alternate';
            if (skillChild) {
                skillChild.style.background = 'linear-gradient(to bottom, #04b7ff, #04a0ff38, #04a0ff38, #04a0ff38, #04a0ff38, #04a0ff38, #04b7ff)';
            }

        } else if (skillsSpeed[skillKey] === 0) { //Không gì
            hasteMultiplier = 1;
            const skillChild = skill.querySelector('.skillCooldownOverlay');
            skill.style.boxShadow = '';
            skill.style.animation = '';
            if (skillChild) {
                skillChild.style.background = 'linear-gradient(to bottom, #f9ff04, #f9ff0438, #f9ff0438, #f9ff0438, #f9ff0438, #f9ff0438, #f9ff04)';
            }
        }

        elapsedTime += delta * hasteMultiplier;

        const progress = Math.min(elapsedTime / cooldownTime, 1);
        overlay.style.transform = `scaleY(${1 - progress})`;

        if (progress < 1) {
            const frameId = requestAnimationFrame(updateCooldown);
            animationFrameIds.push(frameId);
        } else {
            //Kiểm tra xem endgame chưa, nếu chưa => Tiếp tục vòng hồi chiêu
            if (endGame === false) {
                baseAttack(skillKey, isComp);
                // Khi hết thời gian hồi chiêu, kích hoạt đòn đánh thường
                // === Xác định mục tiêu ===
                let targetAttackFirst = isComp ? skillKey.slice(0, -1) + "B" : skillKey.slice(0, -1) + "A";

                // Nếu mục tiêu đầu tiên còn sống
                if (curentHpAll5Mon[targetAttackFirst] > 0) {
                    console.log(`Tấn công mục tiêu: ${targetAttackFirst}`);
                    // Tính số lần đánh
                    let doubleAttack = Math.max(
                        typeGameConquest.skillBattle[skillKey].COOLDOWN[1] +
                        typeGameConquest.skillBattle[skillKey].COOLDOWN[2] +
                        typeGameConquest.skillBattle[skillKey].COOLDOWN[3], 1
                    );

                    for (let d = 1; d <= doubleAttack; d++) {
                        setTimeout(() => {
                            const baseScale = 1;
                            const scaleSTR = baseScale * Math.log10(typeGameConquest.skillBattle[skillKey].POWER.STR);
                            let valuePower = 0.12 * typeGameConquest.skillBattle[skillKey].POWER.STR / scaleSTR + 1

                            let baseDame = Math.round(valuePower * typeGameConquest.skillBattle[skillKey].POWER.SCALE);

                            let defTargetAttack = typeGameConquest.skillBattle[targetAttackFirst].DEF.reduce((a, b) => a + b, 0) / 100;

                            let critDame = 1;
                            let upCritDame = isComp ? typeGameConquest.dameCritA : typeGameConquest.dameCritB
                            let critPoint = typeGameConquest.skillBattle[skillKey].CRIT.reduce((a, b) => a + b, 0); // Tính tổng điểm chí mạng

                            // Random từ 1 -> 100
                            let randomValue = Math.floor(Math.random() * 100); // Random số nguyên từ 1 đến 100

                            // Kiểm tra nếu randomValue <= critPoint thì kích hoạt chí mạng
                            let dameCritWithEffect = 0;
                            if (typeGameConquest.skillBattle[skillKey].EFFECT.includes("doubleDameCrit")) {
                                dameCritWithEffect = 3
                            } else {
                                dameCritWithEffect = 2
                            }

                            let isCrit = false;
                            if (randomValue <= critPoint) {
                                critDame = dameCritWithEffect + upCritDame / 100;
                                isCrit = true;
                            } else {
                                critDame = 1;
                                isCrit = false;
                            }

                            let dameSkill = Math.round(baseDame * (1 - defTargetAttack) * critDame);

                            if (skillsDelete[skillKey] === 1 || skillsSleep[skillKey] > 0) {

                            } else {
                                baseAttacking(skillKey, dameSkill, isCrit, targetAttackFirst);
                                let rageGain = calculateRageGainFromSkill(typeGameConquest.skillBattle[skillKey]);
                                typeGameConquest.skillBattle[skillKey].COOLDOWN[4] += rageGain / doubleAttack;
                                //Tăng nộ cho skillKey
                                if (typeGameConquest.skillBattle[skillKey].COOLDOWN[4] >= 100) { //Đủ nộ
                                    typeGameConquest.skillBattle[skillKey].COOLDOWN[4] -= 100;
                                    userSkillA(skillKey, isComp)
                                }
                                updateHpAndRageBar5Mon();
                            }

                        }, d * 200); // delay mỗi lần 200ms
                    }

                } else {
                    // Nếu mục tiêu chính đã chết, tìm mục tiêu khác
                    const skillIndex = parseInt(skillKey.replace(/[^0-9]/g, ""));
                    const side = isComp ? "B" : "A";

                    let indices = [];
                    for (let i = skillIndex + 1; i <= 9; i++) indices.push(i);
                    for (let i = 1; i < skillIndex; i++) indices.push(i);

                    let found = false;
                    for (let i of indices) {
                        let targetKey = `skill${i}${side}`;
                        if (typeGameConquest.skillBattle[targetKey] && curentHpAll5Mon[targetKey] > 0) {
                            targetAttackFirst = targetKey;
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        let doubleAttack = Math.max(
                            typeGameConquest.skillBattle[skillKey].COOLDOWN[1] +
                            typeGameConquest.skillBattle[skillKey].COOLDOWN[2] +
                            typeGameConquest.skillBattle[skillKey].COOLDOWN[3], 1
                        );

                        for (let d = 1; d <= doubleAttack; d++) {
                            setTimeout(() => {
                                const baseScale = 1;
                                const scaleSTR = baseScale * Math.log10(typeGameConquest.skillBattle[skillKey].POWER.STR);
                                let valuePower = 0.12 * typeGameConquest.skillBattle[skillKey].POWER.STR / scaleSTR + 1

                                let baseDame = Math.round(valuePower * typeGameConquest.skillBattle[skillKey].POWER.SCALE);

                                let critDame = 1;
                                let upCritDame = isComp ? typeGameConquest.dameCritA : typeGameConquest.dameCritB
                                let critPoint = typeGameConquest.skillBattle[skillKey].CRIT.reduce((a, b) => a + b, 0); // Tính tổng điểm chí mạng

                                // Random từ 1 -> 100
                                let randomValue = Math.floor(Math.random() * 100); // Random số nguyên từ 1 đến 100

                                // Kiểm tra nếu randomValue <= critPoint thì kích hoạt chí mạng
                                let dameCritWithEffect = 0;
                                if (typeGameConquest.skillBattle[skillKey].EFFECT.includes("doubleDameCrit")) {
                                    dameCritWithEffect = 3
                                } else {
                                    dameCritWithEffect = 2
                                }

                                let isCrit = false;
                                if (randomValue <= critPoint) {
                                    critDame = dameCritWithEffect + upCritDame / 100;
                                    isCrit = true;
                                } else {
                                    critDame = 1;
                                    isCrit = false;
                                }

                                // let dameSkill = Math.ceil(baseDame * critDame);
                                let dameSkill = Math.round(baseDame);

                                if (skillsDelete[skillKey] === 1 || skillsSleep[skillKey] > 0) {

                                } else {
                                    skillAttacking(skillKey, dameSkill, isCrit);
                                    let rageGain = calculateRageGainFromSkill(typeGameConquest.skillBattle[skillKey]);
                                    typeGameConquest.skillBattle[skillKey].COOLDOWN[4] += rageGain / doubleAttack;
                                    //Tăng nộ cho skillKey
                                    if (typeGameConquest.skillBattle[skillKey].COOLDOWN[4] >= 100) { //Đủ nộ
                                        typeGameConquest.skillBattle[skillKey].COOLDOWN[4] -= 100;
                                        userSkillA(skillKey, isComp)
                                    }
                                    updateHpAndRageBar5Mon();
                                }
                            }, d * 200); // delay mỗi lần 200ms
                        }
                    } else {

                        // Tiếp tục tấn công như ở trên
                        let doubleAttack = Math.max(
                            typeGameConquest.skillBattle[skillKey].COOLDOWN[1] +
                            typeGameConquest.skillBattle[skillKey].COOLDOWN[2] +
                            typeGameConquest.skillBattle[skillKey].COOLDOWN[3], 1
                        );

                        for (let d = 1; d <= doubleAttack; d++) {
                            setTimeout(() => {
                                const baseScale = 1;
                                const scaleSTR = baseScale * Math.log10(typeGameConquest.skillBattle[skillKey].POWER.STR);
                                let valuePower = 0.12 * typeGameConquest.skillBattle[skillKey].POWER.STR / scaleSTR + 1

                                let baseDame = Math.round(valuePower * typeGameConquest.skillBattle[skillKey].POWER.SCALE);

                                let defTargetAttack = typeGameConquest.skillBattle[targetAttackFirst].DEF.reduce((a, b) => a + b, 0) / 100;

                                let critDame = 1;
                                let upCritDame = isComp ? typeGameConquest.dameCritA : typeGameConquest.dameCritB
                                let critPoint = typeGameConquest.skillBattle[skillKey].CRIT.reduce((a, b) => a + b, 0); // Tính tổng điểm chí mạng

                                // Random từ 1 -> 100
                                let randomValue = Math.floor(Math.random() * 100); // Random số nguyên từ 1 đến 100

                                // Kiểm tra nếu randomValue <= critPoint thì kích hoạt chí mạng
                                let dameCritWithEffect = 0;
                                if (typeGameConquest.skillBattle[skillKey].EFFECT.includes("doubleDameCrit")) {
                                    dameCritWithEffect = 3
                                } else {
                                    dameCritWithEffect = 2
                                }

                                let isCrit = false;
                                if (randomValue <= critPoint) {
                                    critDame = dameCritWithEffect + upCritDame / 100;
                                    isCrit = true;
                                } else {
                                    critDame = 1;
                                    isCrit = false;
                                }

                                let dameSkill = Math.round(baseDame * (1 - defTargetAttack) * critDame);

                                if (skillsDelete[skillKey] === 1 || skillsSleep[skillKey] > 0) {

                                } else {
                                    baseAttacking(skillKey, dameSkill, isCrit, targetAttackFirst);
                                    let rageGain = calculateRageGainFromSkill(typeGameConquest.skillBattle[skillKey]);
                                    typeGameConquest.skillBattle[skillKey].COOLDOWN[4] += rageGain / doubleAttack;
                                    //Tăng nộ cho skillKey
                                    if (typeGameConquest.skillBattle[skillKey].COOLDOWN[4] >= 100) { //Đủ nộ
                                        typeGameConquest.skillBattle[skillKey].COOLDOWN[4] -= 100;
                                        userSkillA(skillKey, isComp)
                                    }
                                    updateHpAndRageBar5Mon();
                                }
                            }, d * 200); // delay mỗi lần 200ms
                        }
                    }

                }
            } else {
                stopSkillGame()
                return;
            }
        }
    }

    // Bắt đầu vòng lặp cập nhật cooldown
    const frameId = requestAnimationFrame(updateCooldown);
    animationFrameIds.push(frameId); // Lưu ID

}

function calculateRageGainFromSkill(skillData) {
    function getScaledRage(stat, multiplier) {
        return multiplier * Math.sqrt(stat || 0);
    }

    function getInvertedRage(stat, multiplier) {
        // Nếu stat thấp → giá trị cao
        const maxStat = 1000; // giới hạn max giả định (có thể điều chỉnh)
        const safeStat = Math.min(stat || 0, maxStat);
        return multiplier * Math.sqrt(maxStat - safeStat);
    }

    const stats = skillData.POWER || {};

    let rageGain = Math.floor(
        getScaledRage(stats.STR, 0.1) +
        getScaledRage(stats.DEF, 0.3) +
        getScaledRage(stats.INT, 0.1) +
        getInvertedRage(stats.AGI, 0.2) + // dùng hệ số mới và công thức ngược
        getScaledRage(stats.LUK, 0.1) +
        getScaledRage(stats.HP, 0.3)
    );

    return rageGain;
}



// Hàm đánh thường baseAttack
function baseAttacking(skillKey, dameSkill, isCrit, targetAttack) {
    const teamAorB = skillKey.includes('A') ? 'TeamA' : 'TeamB';
    const skill = document.getElementById(skillKey);
    const skillsDelete = teamAorB === 'TeamA' ? skillsDeleteB : skillsDeleteA
    const isComp = teamAorB === 'TeamA' ? true : false

    // Hiệu ứng cho thanh skill 
    if (teamAorB == 'TeamA') { //bên A
        skill.classList.add('attackingSkillA');
        setTimeout(() => skill.classList.remove('attackingSkillA'), 500);
    } else { //bên B
        skill.classList.add('attackingSkillB');
        setTimeout(() => skill.classList.remove('attackingSkillB'), 500);
    }

    // Tạo hiệu ứng mũi tên/nắm đấm
    const target = document.getElementById(targetAttack);  // Đối tượng bị tấn công

    // Tạo mũi tên/nắm đấm
    let attackEffect = document.createElement('div');
    if (teamAorB === "TeamA") {
        // attackEffect.classList.add('attackEffectOfA');
        attackEffect.classList.add('baseAttackEffect')
        attackEffect.style.transform = "rotate(180deg)";
    } else {
        // attackEffect.classList.add('attackEffectOfB');
        attackEffect.classList.add('baseAttackEffect');
    }

    // new Audio('sound/attack.mp3').play(); //Âm thanh tấn công

    const battleScreen = document.getElementById('battleScreen');
    battleScreen.appendChild(attackEffect);

    // Tính tọa độ trung tâm skill và target tương đối với battleScreen
    const { x: skillX, y: skillY } = getCenterRelativeToContainer(skill, battleScreen);
    const { x: targetX, y: targetY } = getCenterRelativeToContainer(target, battleScreen);

    // Đặt vị trí ban đầu của mũi tên
    attackEffect.style.position = 'absolute';
    attackEffect.style.left = `${skillX}px`;
    attackEffect.style.top = `${skillY}px`;

    const effectRect = attackEffect.getBoundingClientRect();
    const effectWidth = effectRect.width;
    const effectHeight = effectRect.height;

    // Tạo hiệu ứng bay
    const moveEffect = () => {
        const duration = 500;
        const deltaX = targetX - skillX - effectWidth / 2;
        const deltaY = targetY - skillY - effectHeight / 2;

        // Tính góc giữa 2 điểm, đổi từ radian sang độ
        const angleInRadians = Math.atan2(deltaY, deltaX);
        const angleInDegrees = angleInRadians * (180 / Math.PI) + 90;

        attackEffect.style.transition = `transform ${duration}ms ease-out`;
        attackEffect.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${angleInDegrees}deg)`;

        // Xóa phần tử sau khi hiệu ứng kết thúc
        setTimeout(() => {
            attackEffect.remove();
            attackEffect = null;
            effectNumberAtBaseAttack(targetAttack, dameSkill, "Attacking", isCrit);

            //Trừ máu target
            curentHpAll5Mon[targetAttack] -= dameSkill

            if (curentHpAll5Mon[targetAttack] <= 0) {
                skillsDelete[targetAttack] = 1
                const skillChild = target.querySelector('.skill');
                if (skillChild) {
                    skillChild.classList.add('delete');
                }
            }
            updateHpAndRageBar5Mon();
        }, duration);
    };

    // Bắt đầu hiệu ứng di chuyển
    setTimeout(moveEffect, 100); // Chờ một chút sau khi hiệu ứng skill bắt đầu
}

//Hàm tính tọa độ mục tiêu mũi tên/nắm đấm
const getCenterRelativeToContainer = (el, container) => {
    let offsetX = 0;
    let offsetY = 0;
    let current = el;

    // Cộng dồn tất cả offset từ el đến container
    while (current && current !== container) {
        offsetX += current.offsetLeft;
        offsetY += current.offsetTop;
        current = current.offsetParent;
    }

    return {
        x: offsetX + el.offsetWidth / 2,
        y: offsetY + el.offsetHeight / 2
    };
};



//Hàm update HpBar5Mon và rageBar5Mon
function updateHpAndRageBar5Mon() {
    for (let i = 1; i <= 9; i++) {
        const keyA = `skill${i}A`;
        const keyB = `skill${i}B`;

        [keyA, keyB].forEach(skillKey => {
            const skillKeyS = skillKey.charAt(0).toUpperCase() + skillKey.slice(1);

            // Lấy currentHp và maxHp từ maxHpAll5Mon và curentHpAll5Mon
            const currentHp = curentHpAll5Mon[skillKey] || 0;
            const maxHp = maxHpAll5Mon[skillKey] || 1; // Dùng maxHpAll5Mon để tính

            // Tính phần trăm HP chính xác
            const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
            const hpElement = document.getElementById(`hp${skillKeyS}`);
            if (hpElement) {
                hpElement.style.width = `${hpPercent}%`;
            }

            // Update Rage Bar
            const rageData = typeGameConquest?.skillBattle?.[skillKey]?.COOLDOWN?.[4] ?? 0;
            const ragePercent = Math.max(0, Math.min(100, rageData));
            const rageElement = document.getElementById(`rage${skillKeyS}`);
            if (rageElement) {
                rageElement.style.width = `${ragePercent}%`;
            }
        });
    }
}

// Hàm sử dụng skill Attacking
function skillAttacking(skillId, dameSkill, isCrit) {
    const teamAorB = skillId.includes('A') ? 'TeamA' : 'TeamB';
    var imgTeam = skillId.includes('A') ? 'TeamB' : 'TeamA';
    const skill = document.getElementById(skillId);

    // Hiệu ứng cho thanh skill 
    if (teamAorB == 'TeamA') { //bên A
        skill.classList.add('attackingSkillA');
        setTimeout(() => skill.classList.remove('attackingSkillA'), 500);
    } else { //bên B
        skill.classList.add('attackingSkillB');
        setTimeout(() => skill.classList.remove('attackingSkillB'), 500);
    }

    // Xử lý tấn công
    const targetSide = skillId.includes('A') ? 'hpBarB' : 'hpBarA';


    // Tạo hiệu ứng mũi tên/nắm đấm
    const target = document.getElementById(imgTeam);  // Đối tượng bị tấn công

    // Tạo mũi tên/nắm đấm
    let attackEffect = document.createElement('div');
    if (imgTeam === "TeamB") {
        // attackEffect.classList.add('attackEffectOfA');
        attackEffect.classList.add('attackEffect')
    } else {
        // attackEffect.classList.add('attackEffectOfB');
        attackEffect.classList.add('attackEffect');
        attackEffect.style.transform = "rotate(90deg)";
    }

    const battleScreen = document.getElementById('battleScreen');
    battleScreen.appendChild(attackEffect);

    // Tính tọa độ trung tâm skill và target tương đối với battleScreen
    const { x: skillX, y: skillY } = getCenterRelativeToContainer(skill, battleScreen);
    const { x: targetX, y: targetY } = getCenterRelativeToContainer(target, battleScreen);

    // Đặt vị trí ban đầu của mũi tên
    attackEffect.style.position = 'absolute';
    attackEffect.style.left = `${skillX}px`;
    attackEffect.style.top = `${skillY}px`;

    const effectRect = attackEffect.getBoundingClientRect();
    const effectWidth = effectRect.width;
    const effectHeight = effectRect.height;

    // Tạo hiệu ứng bay
    const moveEffect = () => {
        const duration = 500;
        const deltaX = targetX - skillX - effectWidth / 2;
        const deltaY = targetY - skillY - effectHeight / 2;

        attackEffect.style.transition = `transform ${duration}ms ease-out`;
        if (imgTeam === "TeamB") {
            attackEffect.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        } else {
            attackEffect.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(90deg)`;
        }

        // Xóa phần tử sau khi hiệu ứng kết thúc
        setTimeout(() => {
            attackEffect.remove();
            attackEffect = null;
            effectNumberAtAttack(skillId, dameSkill, "Attacking", isCrit);
            applyDamage(targetSide, dameSkill, "Dame");
            //Hiệu ứng bị tấn công
            const teamAtk = skillId.includes('A') ? 'TeamA' : 'TeamB';

            applyAtkEffect(teamAtk);


        }, duration);
    };


    // Bắt đầu hiệu ứng di chuyển
    setTimeout(moveEffect, 100); // Chờ một chút sau khi hiệu ứng skill bắt đầu
}

// Hàm sử dụng skill Heal healing
function skillHealing(skillId, dameSkill, isCrit) {
    const teamAorB = skillId.includes('A') ? 'TeamA' : 'TeamB';
    var imgTeam = skillId.includes('A') ? 'TeamA' : 'TeamB';
    const skill = document.getElementById(skillId);

    // Hiệu ứng cho thanh skill 
    if (teamAorB == 'TeamA') { //bên A
        skill.classList.add('attackingSkillA');
        setTimeout(() => skill.classList.remove('attackingSkillA'), 500);
    } else { //bên B
        skill.classList.add('attackingSkillB');
        setTimeout(() => skill.classList.remove('attackingSkillB'), 500);
    }

    // Xử lý tấn công
    const targetSide = skillId.includes('A') ? 'hpBarA' : 'hpBarB';


    // Tạo hiệu ứng mũi tên/nắm đấm
    const target = document.getElementById(imgTeam);  // Đối tượng bị tấn công

    // Tạo mũi tên/nắm đấm
    let attackEffect = document.createElement('div');
    if (imgTeam === "TeamA") {
        attackEffect.classList.add('healEffect'); // Class CSS để định dạng hiệu ứng
    } else {
        attackEffect.classList.add('healEffect'); // Class CSS để định dạng hiệu ứng
    }

    const battleScreen = document.getElementById('battleScreen');
    battleScreen.appendChild(attackEffect);

    // Tính tọa độ trung tâm skill và target tương đối với battleScreen
    const { x: skillX, y: skillY } = getCenterRelativeToContainer(skill, battleScreen);
    const { x: targetX, y: targetY } = getCenterRelativeToContainer(target, battleScreen);

    // Đặt vị trí ban đầu của mũi tên
    attackEffect.style.position = 'absolute';
    attackEffect.style.left = `${skillX}px`;
    attackEffect.style.top = `${skillY}px`;

    const effectRect = attackEffect.getBoundingClientRect();
    const effectWidth = effectRect.width;
    const effectHeight = effectRect.height;

    // Tạo hiệu ứng bay
    const moveEffect = () => {
        const duration = 500;
        const deltaX = targetX - skillX - effectWidth / 2;
        const deltaY = targetY - skillY - effectHeight / 2;

        attackEffect.style.transition = `transform ${duration}ms ease-out`;
        attackEffect.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // Xóa phần tử sau khi hiệu ứng kết thúc
        setTimeout(() => {
            attackEffect.remove();
            attackEffect = null;
            effectNumberAtAttack(skillId, dameSkill, "Heal", isCrit);
            applyDamage(targetSide, dameSkill, "Heal");
            //Hiệu ứng bị tấn công
            const teamAtk = skillId.includes('A') ? 'TeamB' : 'TeamA';

            applyAtkEffect(teamAtk);


        }, duration);
    };


    // Bắt đầu hiệu ứng di chuyển
    setTimeout(moveEffect, 100); // Chờ một chút sau khi hiệu ứng skill bắt đầu
}

// Hàm sử dụng skill Shield
function skillShield(skillId, dameSkill, isCrit) {
    const teamAorB = skillId.includes('A') ? 'TeamA' : 'TeamB';
    var imgTeam = skillId.includes('A') ? 'TeamA' : 'TeamB';
    const skill = document.getElementById(skillId);

    // Hiệu ứng cho thanh skill 
    if (teamAorB == 'TeamA') { //bên A
        skill.classList.add('attackingSkillA');
        setTimeout(() => skill.classList.remove('attackingSkillA'), 500);
    } else { //bên B
        skill.classList.add('attackingSkillB');
        setTimeout(() => skill.classList.remove('attackingSkillB'), 500);
    }

    // Xử lý tấn công
    const targetSide = skillId.includes('A') ? 'hpBarA' : 'hpBarB';

    // Tạo hiệu ứng mũi tên/nắm đấm
    const target = document.getElementById(imgTeam);  // Đối tượng bị tấn công

    // Tạo mũi tên/nắm đấm
    let attackEffect = document.createElement('div');
    if (imgTeam === "TeamA") {
        attackEffect.classList.add('shieldEffect'); // Class CSS để định dạng hiệu ứng
    } else {
        attackEffect.classList.add('shieldEffect'); // Class CSS để định dạng hiệu ứng
    }

    const battleScreen = document.getElementById('battleScreen');
    battleScreen.appendChild(attackEffect);

    // Tính tọa độ trung tâm skill và target tương đối với battleScreen
    const { x: skillX, y: skillY } = getCenterRelativeToContainer(skill, battleScreen);
    const { x: targetX, y: targetY } = getCenterRelativeToContainer(target, battleScreen);

    // Đặt vị trí ban đầu của mũi tên
    attackEffect.style.position = 'absolute';
    attackEffect.style.left = `${skillX}px`;
    attackEffect.style.top = `${skillY}px`;

    const effectRect = attackEffect.getBoundingClientRect();
    const effectWidth = effectRect.width;
    const effectHeight = effectRect.height;

    // Tạo hiệu ứng bay
    const moveEffect = () => {
        const duration = 500;
        const deltaX = targetX - skillX - effectWidth / 2;
        const deltaY = targetY - skillY - effectHeight / 2;

        attackEffect.style.transition = `transform ${duration}ms ease-out`;
        attackEffect.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // Xóa phần tử sau khi hiệu ứng kết thúc
        setTimeout(() => {
            attackEffect.remove();
            attackEffect = null;
            effectNumberAtAttack(skillId, dameSkill, "Shield", isCrit);
            applyDamage(targetSide, dameSkill, "Shield");

            //Hiệu ứng bị tấn công
            const teamAtk = skillId.includes('A') ? 'TeamB' : 'TeamA';

            applyAtkEffect(teamAtk);


        }, duration);
    };


    // Bắt đầu hiệu ứng di chuyển
    setTimeout(moveEffect, 100); // Chờ một chút sau khi hiệu ứng skill bắt đầu
}

// Hàm sử dụng skill Burn
function skillBurn(skillId, dameSkill, isCrit) {
    const teamAorB = skillId.includes('A') ? 'TeamA' : 'TeamB';
    var imgTeam = skillId.includes('A') ? 'TeamB' : 'TeamA';
    const skill = document.getElementById(skillId);

    // Hiệu ứng cho thanh skill 
    if (teamAorB == 'TeamA') { //bên A
        skill.classList.add('attackingSkillA');
        setTimeout(() => skill.classList.remove('attackingSkillA'), 500);
    } else { //bên B
        skill.classList.add('attackingSkillB');
        setTimeout(() => skill.classList.remove('attackingSkillB'), 500);
    }

    // Xử lý tấn công
    const targetSideId = skillId.includes('A') ? 'hpBarB' : 'hpBarA';
    const effectContainerId = targetSideId === "hpBarA" ? "effectContainerA" : "effectContainerB";
    const effectContainer = document.querySelector(`#${effectContainerId}`);




    // Tạo hiệu ứng mũi tên/nắm đấm
    const target = document.getElementById(imgTeam);  // Đối tượng bị tấn công

    // Tạo mũi tên/nắm đấm
    let attackEffect = document.createElement('div');
    if (imgTeam === "TeamB") {
        attackEffect.classList.add('burnEffect'); // Class CSS để định dạng hiệu ứng
    } else {
        attackEffect.classList.add('burnEffect'); // Class CSS để định dạng hiệu ứng
    }

    const battleScreen = document.getElementById('battleScreen');
    battleScreen.appendChild(attackEffect);

    // Tính tọa độ trung tâm skill và target tương đối với battleScreen
    const { x: skillX, y: skillY } = getCenterRelativeToContainer(skill, battleScreen);
    const { x: targetX, y: targetY } = getCenterRelativeToContainer(target, battleScreen);

    // Đặt vị trí ban đầu của mũi tên
    attackEffect.style.position = 'absolute';
    attackEffect.style.left = `${skillX}px`;
    attackEffect.style.top = `${skillY}px`;

    const effectRect = attackEffect.getBoundingClientRect();
    const effectWidth = effectRect.width;
    const effectHeight = effectRect.height;

    // Tạo hiệu ứng bay
    const moveEffect = () => {
        const duration = 500;
        const deltaX = targetX - skillX - effectWidth / 2;
        const deltaY = targetY - skillY - effectHeight / 2;

        attackEffect.style.transition = `transform ${duration}ms ease-out`;
        attackEffect.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // Xóa phần tử sau khi hiệu ứng kết thúc
        setTimeout(() => {
            attackEffect.remove();
            attackEffect = null;
            effectNumberAtAttack(skillId, dameSkill, "Burn", isCrit);
            //Cộng burn cho đối thủ
            if (teamAorB == 'TeamB') {
                nowBurnBattleComp += dameSkill
            } else {
                nowBurnBattleMy += dameSkill
            }
            updateHpbar();

            //Hiệu ứng bị tấn công
            const teamAtk = skillId.includes('A') ? 'TeamA' : 'TeamB';

            applyAtkEffect(teamAtk);


        }, duration);
    };


    // Bắt đầu hiệu ứng di chuyển
    setTimeout(moveEffect, 100); // Chờ một chút sau khi hiệu ứng skill bắt đầu
}

// Hàm sử dụng skill Poison
function skillPoison(skillId, dameSkill, isCrit) {
    const teamAorB = skillId.includes('A') ? 'TeamA' : 'TeamB';
    var imgTeam = skillId.includes('A') ? 'TeamB' : 'TeamA';
    const skill = document.getElementById(skillId);

    // Hiệu ứng cho thanh skill 
    if (teamAorB == 'TeamA') { //bên A
        skill.classList.add('attackingSkillA');
        setTimeout(() => skill.classList.remove('attackingSkillA'), 500);
    } else { //bên B
        skill.classList.add('attackingSkillB');
        setTimeout(() => skill.classList.remove('attackingSkillB'), 500);
    }

    // Xử lý tấn công
    const targetSideId = skillId.includes('A') ? 'hpBarB' : 'hpBarA';
    const effectContainerId = targetSideId === "hpBarA" ? "effectContainerA" : "effectContainerB";
    const effectContainer = document.querySelector(`#${effectContainerId}`);

    // Tạo hiệu ứng mũi tên/nắm đấm
    const target = document.getElementById(imgTeam);  // Đối tượng bị tấn công

    // Tạo mũi tên/nắm đấm
    let attackEffect = document.createElement('div');
    if (imgTeam === "TeamB") {
        attackEffect.classList.add('poisonEffect'); // Class CSS để định dạng hiệu ứng
    } else {
        attackEffect.classList.add('poisonEffect'); // Class CSS để định dạng hiệu ứng
    }

    const battleScreen = document.getElementById('battleScreen');
    battleScreen.appendChild(attackEffect);

    // Tính tọa độ trung tâm skill và target tương đối với battleScreen
    const { x: skillX, y: skillY } = getCenterRelativeToContainer(skill, battleScreen);
    const { x: targetX, y: targetY } = getCenterRelativeToContainer(target, battleScreen);

    // Đặt vị trí ban đầu của mũi tên
    attackEffect.style.position = 'absolute';
    attackEffect.style.left = `${skillX}px`;
    attackEffect.style.top = `${skillY}px`;

    const effectRect = attackEffect.getBoundingClientRect();
    const effectWidth = effectRect.width;
    const effectHeight = effectRect.height;

    // Tạo hiệu ứng bay
    const moveEffect = () => {
        const duration = 500;
        const deltaX = targetX - skillX - effectWidth / 2;
        const deltaY = targetY - skillY - effectHeight / 2;

        attackEffect.style.transition = `transform ${duration}ms ease-out`;
        attackEffect.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // Xóa phần tử sau khi hiệu ứng kết thúc
        setTimeout(() => {
            attackEffect.remove();
            attackEffect = null;
            effectNumberAtAttack(skillId, dameSkill, "Poison", isCrit);
            //Cộng poison cho đối thủ
            if (teamAorB == 'TeamB') {
                nowPoisonBattleComp += dameSkill
            } else {
                nowPoisonBattleMy += dameSkill
            }
            updateHpbar();
            //Hiệu ứng bị tấn công
            const teamAtk = skillId.includes('A') ? 'TeamA' : 'TeamB';
            applyAtkEffect(teamAtk);


        }, duration);
    };


    // Bắt đầu hiệu ứng di chuyển
    setTimeout(moveEffect, 100); // Chờ một chút sau khi hiệu ứng skill bắt đầu
}


let cooldownQueueComp = 0; // Mảng để lưu các thời gian kết thúc tạm dừng cooldown của người chơi
let cooldownQueueMy = 0; // Mảng để lưu các thời gian kết thúc tạm dừng cooldown của đối thủ

// Skill đóng băng (tạm dừng cooldown)
function skillFreeze(skillId, timeFreeze, isComp) {
    const teamAorB = skillId.includes('A') ? 'TeamA' : 'TeamB';
    var imgTeam = skillId.includes('A') ? 'TeamB' : 'TeamA';
    const skill = document.getElementById(skillId);

    // Hiệu ứng cho thanh skill 
    if (teamAorB == 'TeamA') { //bên A
        skill.classList.add('attackingSkillA');
        setTimeout(() => skill.classList.remove('attackingSkillA'), 500);
    } else { //bên B
        skill.classList.add('attackingSkillB');
        setTimeout(() => skill.classList.remove('attackingSkillB'), 500);
    }

    // Xử lý tấn công
    const targetSideId = skillId.includes('A') ? 'hpBarB' : 'hpBarA';
    const effectContainerId = targetSideId === "hpBarA" ? "cooldownTimeSkillA" : "cooldownTimeSkillB";
    const effectContainer = document.querySelector(`#${effectContainerId}`);


    // Tạo hiệu ứng mũi tên/nắm đấm
    const target = document.getElementById(imgTeam);  // Đối tượng bị tấn công

    // Tạo mũi tên/nắm đấm
    let attackEffect = document.createElement('div');
    if (imgTeam === "TeamB") {
        attackEffect.classList.add('freezeEffect'); // Class CSS để định dạng hiệu ứng
    } else {
        attackEffect.classList.add('freezeEffect'); // Class CSS để định dạng hiệu ứng
    }

    const battleScreen = document.getElementById('battleScreen');
    battleScreen.appendChild(attackEffect);

    // Tính tọa độ trung tâm skill và target tương đối với battleScreen
    const { x: skillX, y: skillY } = getCenterRelativeToContainer(skill, battleScreen);
    const { x: targetX, y: targetY } = getCenterRelativeToContainer(target, battleScreen);

    // Đặt vị trí ban đầu của mũi tên
    attackEffect.style.position = 'absolute';
    attackEffect.style.left = `${skillX}px`;
    attackEffect.style.top = `${skillY}px`;

    const effectRect = attackEffect.getBoundingClientRect();
    const effectWidth = effectRect.width;
    const effectHeight = effectRect.height;

    // Tạo hiệu ứng bay
    const moveEffect = () => {
        const duration = 500;
        const deltaX = targetX - skillX - effectWidth / 2;
        const deltaY = targetY - skillY - effectHeight / 2;

        attackEffect.style.transition = `transform ${duration}ms ease-out`;
        attackEffect.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // Xóa phần tử sau khi hiệu ứng kết thúc
        setTimeout(() => {
            attackEffect.remove();
            attackEffect = null;
            effectHpBarUpdate(effectContainer, timeFreeze, "Freeze");

            pauseCooldown(timeFreeze, isComp); // Cộng thêm thời gian tạm dừng cho đối thủ hoặc người chơi
            console.log(`Cooldown paused for ${timeFreeze / 1000} seconds!`);
            updateSttForSkillAffter();
            //Hiệu ứng bị tấn công
            const teamAtk = skillId.includes('A') ? 'TeamA' : 'TeamB';
            applyAtkEffect(teamAtk);

        }, duration);
    };

    // Bắt đầu hiệu ứng di chuyển
    setTimeout(moveEffect, 100); // Chờ một chút sau khi hiệu ứng skill bắt đầu
}

function pauseCooldown(timeFreeze, isComp) {
    if (!isComp) { //nếu skill vào đối thủ
        cooldownQueueComp += timeFreeze; // Cộng thêm thời gian vào tổng của đối thủ
        console.log("cooldownQueueComp", cooldownQueueComp, isComp)
    } else { //nếu skill vào mình
        cooldownQueueMy += timeFreeze; // Cộng thêm thời gian vào tổng của người chơi
        console.log("cooldownQueueMy", cooldownQueueMy, isComp)
    }
}


//Skill giúp 2 skill bên cạnh kích hoạt 1 lần
function skillchargerSkill(skillKey, isComp, typeSkill) {
    const teamAorB = skillKey.includes('A') ? 'TeamA' : 'TeamB';
    const skill = document.getElementById(skillKey);

    // Hiệu ứng cho thanh skill 
    if (teamAorB == 'TeamA') { //bên A
        skill.classList.add('attackingSkillA');
        setTimeout(() => skill.classList.remove('attackingSkillA'), 500);
    } else { //bên B
        skill.classList.add('attackingSkillB');
        setTimeout(() => skill.classList.remove('attackingSkillB'), 500);
    }

    // Xác định vị trí của skill hiện tại
    let skillIndex = parseInt(skillKey.match(/\d+/)[0]); // Lấy số thứ tự từ skillKey
    let adjacentSlots = [];

    if (typeSkill === "Right") {
        if (skillIndex + 1 <= 9) {
            adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
        }
    }

    if (typeSkill === "Left") {
        if (skillIndex - 1 >= 1) {
            adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
        }
    }

    if (typeSkill === "LeftRight") {
        // Kiểm tra và thêm các slot liền kề hợp lệ
        if (skillIndex - 1 >= 1) {
            adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
        }
        if (skillIndex + 1 <= 9) {
            adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
        }
    }
    if (typeSkill === "All") {
        if (isComp === true) {
            adjacentSlots = [
                'skill1A', 'skill2A', 'skill3A', 'skill4A', 'skill5A', 'skill6A', 'skill7A', 'skill8A', 'skill9A',
            ]
        } else {
            adjacentSlots = [
                'skill1B', 'skill2B', 'skill3B', 'skill4B', 'skill5B', 'skill6B', 'skill7B', 'skill8B', 'skill9B',
            ]
        }
    }

    if (typeSkill === "Type") {
        for (let skill in typeGameConquest.skillBattle) {
            if (isComp === true) {
                if (
                    skill !== skillKey &&                  // Không trùng skillKey
                    skill.endsWith("A") &&                 // Kết thúc bằng "A"
                    typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) // TYPE giống nhau
                ) {
                    adjacentSlots.push(skill)
                }
            } else {
                if (
                    skill !== skillKey &&                  // Không trùng skillKey
                    skill.endsWith("B") &&                 // Kết thúc bằng "B"
                    typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) // TYPE giống nhau
                ) {
                    adjacentSlots.push(skill)
                }
            }
        }
    }

    //Loại trừ các skill có trùng EFFECT với skill này
    let myEffect = ['ChargerSkillAll', 'ChargerSkillLeftRight', 'ChargerSkillLeft', 'ChargerSkillRight', 'ChargerSkillType']

    // Duyệt qua các slot liền kề và kích hoạt skill tương ứng
    adjacentSlots.forEach(adjacentKey => {
        let skillsSleep = isComp ? skillsSleepA : skillsSleepB
        let skillsDelete = isComp ? skillsDeleteA : skillsDeleteB
        // let limitSkills = isComp? limitSkillsA : limitSkillsB
        if (typeGameConquest.skillBattle[adjacentKey] && typeGameConquest.skillBattle[adjacentKey].ID !== ""
            // && limitSkills[adjacentKey] <= 10
            && skillsSleep[adjacentKey] === 0 && skillsDelete[adjacentKey] === 0
        ) {

            // // Ưu tiên kiểm tra trạng thái Sleep/delete
            // if (skillsSleep[adjacentKey] === 1) {
            //   skillsSleep[adjacentKey] = 0
            //   const skillElement = document.getElementById(adjacentKey);
            //   if (skillElement) {
            //     const skillChild = skillElement.querySelector('.skill');
            //     if (skillChild && skillChild.classList.contains('sleep')) {
            //       skillChild.classList.remove('sleep');
            //     }
            //   }
            //   return; // Bỏ qua skill này
            // }

            // if (skillsDelete[adjacentKey] === 1) {
            //   skillsDelete[adjacentKey] = 0
            //   console.log(`Skill ${adjacentKey} đã bị xóa!`);
            //   return; // Bỏ qua skill này
            // }

            let adjacentEffectSkill = typeGameConquest.skillBattle[adjacentKey].EFFECT;
            for (let effect of adjacentEffectSkill) {
                if (!myEffect.includes(effect)) {
                    userSkillA(adjacentKey, isComp);
                    break; // Thoát khỏi vòng lặp ngay khi gọi xong startSkill.
                }
            }
        }
    });
}

//Skill tăng dame cho pet khác
function skillUpDame(skillKey, dameSkill, isComp, typeEffect) {
    const teamAorB = skillKey.includes('A') ? 'TeamA' : 'TeamB';
    const skill = document.getElementById(skillKey);

    // Xác định vị trí của skill hiện tại
    let skillIndex = parseInt(skillKey.match(/\d+/)[0]); // Lấy số thứ tự từ skillKey

    // Kiểm tra và thêm các slot liền kề hợp lệ
    let adjacentSlots = [];
    if (typeEffect === "LeftRight") {
        if (skillIndex - 1 >= 1) {
            adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
        }
        if (skillIndex + 1 <= 9) {
            adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
        }
    } else if (typeEffect === "Left") {
        if (skillIndex - 1 >= 1) {
            adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
        }
    } else if (typeEffect === "Right") {
        if (skillIndex + 1 <= 9) {
            adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
        }
    } else if (typeEffect === "All") {
        for (let s = 1; s <= 9; s++) {
            if (skillIndex !== s) {
                adjacentSlots.push(`skill${s}${isComp ? 'A' : 'B'}`);
            }
        }
    } else if (typeEffect === "Self") {
        adjacentSlots.push(`skill${skillIndex}${isComp ? 'A' : 'B'}`);
    } else if (typeEffect === "Type") {
        for (let skill in typeGameConquest.skillBattle) {
            if (isComp === true) {
                if (
                    skill !== skillKey &&                  // Không trùng skillKey
                    skill.endsWith("A") &&                 // Kết thúc bằng "A"
                    typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) && // TYPE giống nhau
                    typeGameConquest.skillBattle[skill].EFFECT.includes("Attacking") //Bao gồm attacking
                ) {
                    adjacentSlots.push(skill)
                }
            } else {
                if (
                    skill !== skillKey &&                  // Không trùng skillKey
                    skill.endsWith("B") &&                 // Kết thúc bằng "B"
                    typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) && // TYPE giống nhau
                    typeGameConquest.skillBattle[skill].EFFECT.includes("Attacking") //Bao gồm attacking
                ) {
                    adjacentSlots.push(skill)
                }
            }
        }
    }


    // Kiểm tra nếu không có slot hợp lệ thì không làm gì
    if (adjacentSlots.length === 0) return;

    // Hiệu ứng cho thanh skill 
    if (teamAorB == 'TeamA') { //bên A
        skill.classList.add('attackingSkillA');
        setTimeout(() => skill.classList.remove('attackingSkillA'), 500);
    } else { //bên B
        skill.classList.add('attackingSkillB');
        setTimeout(() => skill.classList.remove('attackingSkillB'), 500);
    }

    // Duyệt qua các slot liền kề và kích hoạt skill tương ứng
    adjacentSlots.forEach(adjacentKey => {
        if (typeGameConquest.skillBattle[adjacentKey] && typeGameConquest.skillBattle[adjacentKey].ID !== "") {
            if (typeGameConquest.skillBattle[adjacentKey].EFFECT.includes("Attacking")) {
                typeGameConquest.skillBattle[adjacentKey].DAME[3] += dameSkill
            }
        }
    });
    updateSttForSkillAffter();
}

//Skill tăng chỉ số heal cho pet khác
function skillUpHeal(skillKey, dameSkill, isComp, typeEffect) {
    const teamAorB = skillKey.includes('A') ? 'TeamA' : 'TeamB';
    const skill = document.getElementById(skillKey);

    // Xác định vị trí của skill hiện tại
    let skillIndex = parseInt(skillKey.match(/\d+/)[0]); // Lấy số thứ tự từ skillKey

    // Kiểm tra và thêm các slot liền kề hợp lệ
    let adjacentSlots = [];
    if (typeEffect === "LeftRight") {
        if (skillIndex - 1 >= 1) {
            adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
        }
        if (skillIndex + 1 <= 9) {
            adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
        }
    } else if (typeEffect === "Left") {
        if (skillIndex - 1 >= 1) {
            adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
        }
    } else if (typeEffect === "Right") {
        if (skillIndex + 1 <= 9) {
            adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
        }
    } else if (typeEffect === "All") {
        for (let s = 1; s <= 9; s++) {
            if (skillIndex !== s) {
                adjacentSlots.push(`skill${s}${isComp ? 'A' : 'B'}`);
            }
        }
    } else if (typeEffect === "Self") {
        adjacentSlots.push(`skill${skillIndex}${isComp ? 'A' : 'B'}`);
    } else if (typeEffect === "Type") {
        for (let skill in typeGameConquest.skillBattle) {
            if (isComp === true) {
                if (
                    skill !== skillKey &&                  // Không trùng skillKey
                    skill.endsWith("A") &&                 // Kết thúc bằng "A"
                    typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) && // TYPE giống nhau
                    typeGameConquest.skillBattle[skill].EFFECT.includes("Healing") //Bao gồm attacking
                ) {
                    adjacentSlots.push(skill)
                }
            } else {
                if (
                    skill !== skillKey &&                  // Không trùng skillKey
                    skill.endsWith("B") &&                 // Kết thúc bằng "B"
                    typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) && // TYPE giống nhau
                    typeGameConquest.skillBattle[skill].EFFECT.includes("Healing") //Bao gồm attacking
                ) {
                    adjacentSlots.push(skill)
                }
            }
        }
    }

    // Kiểm tra nếu không có slot hợp lệ thì không làm gì
    if (adjacentSlots.length === 0) return;

    // Hiệu ứng cho thanh skill 
    if (teamAorB == 'TeamA') { //bên A
        skill.classList.add('attackingSkillA');
        setTimeout(() => skill.classList.remove('attackingSkillA'), 500);
    } else { //bên B
        skill.classList.add('attackingSkillB');
        setTimeout(() => skill.classList.remove('attackingSkillB'), 500);
    }

    // Duyệt qua các slot liền kề và kích hoạt skill tương ứng
    adjacentSlots.forEach(adjacentKey => {
        if (typeGameConquest.skillBattle[adjacentKey] && typeGameConquest.skillBattle[adjacentKey].ID !== "") {
            if (typeGameConquest.skillBattle[adjacentKey].EFFECT.includes("Healing")) {
                typeGameConquest.skillBattle[adjacentKey].HEAL[3] += dameSkill
            }
        }
    });
    updateSttForSkillAffter();
}

//Skill tăng chỉ số shield cho pet khác
function skillUpShield(skillKey, dameSkill, isComp, typeEffect) {
    const teamAorB = skillKey.includes('A') ? 'TeamA' : 'TeamB';
    const skill = document.getElementById(skillKey);

    // Xác định vị trí của skill hiện tại
    let skillIndex = parseInt(skillKey.match(/\d+/)[0]); // Lấy số thứ tự từ skillKey

    // Kiểm tra và thêm các slot liền kề hợp lệ
    let adjacentSlots = [];
    if (typeEffect === "LeftRight") {
        if (skillIndex - 1 >= 1) {
            adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
        }
        if (skillIndex + 1 <= 9) {
            adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
        }
    } else if (typeEffect === "Left") {
        if (skillIndex - 1 >= 1) {
            adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
        }
    } else if (typeEffect === "Right") {
        if (skillIndex + 1 <= 9) {
            adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
        }
    } else if (typeEffect === "All") {
        for (let s = 1; s <= 9; s++) {
            if (skillIndex !== s) {
                adjacentSlots.push(`skill${s}${isComp ? 'A' : 'B'}`);
            }
        }
    } else if (typeEffect === "Self") {
        adjacentSlots.push(`skill${skillIndex}${isComp ? 'A' : 'B'}`);
    } else if (typeEffect === "Type") {
        for (let skill in typeGameConquest.skillBattle) {
            if (isComp === true) {
                if (
                    skill !== skillKey &&                  // Không trùng skillKey
                    skill.endsWith("A") &&                 // Kết thúc bằng "A"
                    typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) && // TYPE giống nhau
                    typeGameConquest.skillBattle[skill].EFFECT.includes("Shield") //Bao gồm attacking
                ) {
                    adjacentSlots.push(skill)
                }
            } else {
                if (
                    skill !== skillKey &&                  // Không trùng skillKey
                    skill.endsWith("B") &&                 // Kết thúc bằng "B"
                    typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) && // TYPE giống nhau
                    typeGameConquest.skillBattle[skill].EFFECT.includes("Shield") //Bao gồm attacking
                ) {
                    adjacentSlots.push(skill)
                }
            }
        }
    }

    // Kiểm tra nếu không có slot hợp lệ thì không làm gì
    if (adjacentSlots.length === 0) return;

    // Hiệu ứng cho thanh skill 
    if (teamAorB == 'TeamA') { //bên A
        skill.classList.add('attackingSkillA');
        setTimeout(() => skill.classList.remove('attackingSkillA'), 500);
    } else { //bên B
        skill.classList.add('attackingSkillB');
        setTimeout(() => skill.classList.remove('attackingSkillB'), 500);
    }

    // Duyệt qua các slot liền kề và kích hoạt skill tương ứng
    adjacentSlots.forEach(adjacentKey => {
        if (typeGameConquest.skillBattle[adjacentKey] && typeGameConquest.skillBattle[adjacentKey].ID !== "") {
            if (typeGameConquest.skillBattle[adjacentKey].EFFECT.includes("Shield")) {
                typeGameConquest.skillBattle[adjacentKey].SHIELD[3] += dameSkill
            }
        }
    });
    updateSttForSkillAffter();
}

//Skill tăng chỉ số burn cho pet khác
function skillUpBurn(skillKey, dameSkill, isComp, typeEffect) {
    const teamAorB = skillKey.includes('A') ? 'TeamA' : 'TeamB';
    const skill = document.getElementById(skillKey);

    // Xác định vị trí của skill hiện tại
    let skillIndex = parseInt(skillKey.match(/\d+/)[0]); // Lấy số thứ tự từ skillKey

    // Kiểm tra và thêm các slot liền kề hợp lệ
    let adjacentSlots = [];
    if (typeEffect === "LeftRight") {
        if (skillIndex - 1 >= 1) {
            adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
        }
        if (skillIndex + 1 <= 9) {
            adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
        }
    } else if (typeEffect === "Left") {
        if (skillIndex - 1 >= 1) {
            adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
        }
    } else if (typeEffect === "Right") {
        if (skillIndex + 1 <= 9) {
            adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
        }
    } else if (typeEffect === "All") {
        for (let s = 1; s <= 9; s++) {
            if (skillIndex !== s) {
                adjacentSlots.push(`skill${s}${isComp ? 'A' : 'B'}`);
            }
        }
    } else if (typeEffect === "Self") {
        adjacentSlots.push(`skill${skillIndex}${isComp ? 'A' : 'B'}`);
    } else if (typeEffect === "Type") {
        for (let skill in typeGameConquest.skillBattle) {
            if (isComp === true) {
                if (
                    skill !== skillKey &&                  // Không trùng skillKey
                    skill.endsWith("A") &&                 // Kết thúc bằng "A"
                    typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) && // TYPE giống nhau
                    typeGameConquest.skillBattle[skill].EFFECT.includes("Burn") //Bao gồm attacking
                ) {
                    adjacentSlots.push(skill)
                }
            } else {
                if (
                    skill !== skillKey &&                  // Không trùng skillKey
                    skill.endsWith("B") &&                 // Kết thúc bằng "B"
                    typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) && // TYPE giống nhau
                    typeGameConquest.skillBattle[skill].EFFECT.includes("Burn") //Bao gồm attacking
                ) {
                    adjacentSlots.push(skill)
                }
            }
        }
    }

    // Kiểm tra nếu không có slot hợp lệ thì không làm gì
    if (adjacentSlots.length === 0) return;

    // Hiệu ứng cho thanh skill 
    if (teamAorB == 'TeamA') { //bên A
        skill.classList.add('attackingSkillA');
        setTimeout(() => skill.classList.remove('attackingSkillA'), 500);
    } else { //bên B
        skill.classList.add('attackingSkillB');
        setTimeout(() => skill.classList.remove('attackingSkillB'), 500);
    }

    // Duyệt qua các slot liền kề và kích hoạt skill tương ứng
    adjacentSlots.forEach(adjacentKey => {
        if (typeGameConquest.skillBattle[adjacentKey] && typeGameConquest.skillBattle[adjacentKey].ID !== "") {
            if (typeGameConquest.skillBattle[adjacentKey].EFFECT.includes("Burn")) {
                typeGameConquest.skillBattle[adjacentKey].BURN[3] += dameSkill
            }
        }
    });
    updateSttForSkillAffter();
}

//Skill tăng chỉ số poison cho pet khác
function skillUpPoison(skillKey, dameSkill, isComp, typeEffect) {
    const teamAorB = skillKey.includes('A') ? 'TeamA' : 'TeamB';
    const skill = document.getElementById(skillKey);

    // Xác định vị trí của skill hiện tại
    let skillIndex = parseInt(skillKey.match(/\d+/)[0]); // Lấy số thứ tự từ skillKey

    // Kiểm tra và thêm các slot liền kề hợp lệ
    let adjacentSlots = [];
    if (typeEffect === "LeftRight") {
        if (skillIndex - 1 >= 1) {
            adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
        }
        if (skillIndex + 1 <= 9) {
            adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
        }
    } else if (typeEffect === "Left") {
        if (skillIndex - 1 >= 1) {
            adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
        }
    } else if (typeEffect === "Right") {
        if (skillIndex + 1 <= 9) {
            adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
        }
    } else if (typeEffect === "All") {
        for (let s = 1; s <= 9; s++) {
            if (skillIndex !== s) {
                adjacentSlots.push(`skill${s}${isComp ? 'A' : 'B'}`);
            }
        }
    } else if (typeEffect === "Self") {
        adjacentSlots.push(`skill${skillIndex}${isComp ? 'A' : 'B'}`);
    } else if (typeEffect === "Type") {
        for (let skill in typeGameConquest.skillBattle) {
            if (isComp === true) {
                if (
                    skill !== skillKey &&                  // Không trùng skillKey
                    skill.endsWith("A") &&                 // Kết thúc bằng "A"
                    typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) && // TYPE giống nhau
                    typeGameConquest.skillBattle[skill].EFFECT.includes("Poison") //Bao gồm attacking
                ) {
                    adjacentSlots.push(skill)
                }
            } else {
                if (
                    skill !== skillKey &&                  // Không trùng skillKey
                    skill.endsWith("B") &&                 // Kết thúc bằng "B"
                    typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) && // TYPE giống nhau
                    typeGameConquest.skillBattle[skill].EFFECT.includes("Poison") //Bao gồm attacking
                ) {
                    adjacentSlots.push(skill)
                }
            }
        }
    }

    // Kiểm tra nếu không có slot hợp lệ thì không làm gì
    if (adjacentSlots.length === 0) return;

    // Hiệu ứng cho thanh skill 
    if (teamAorB == 'TeamA') { //bên A
        skill.classList.add('attackingSkillA');
        setTimeout(() => skill.classList.remove('attackingSkillA'), 500);
    } else { //bên B
        skill.classList.add('attackingSkillB');
        setTimeout(() => skill.classList.remove('attackingSkillB'), 500);
    }

    // Duyệt qua các slot liền kề và kích hoạt skill tương ứng
    adjacentSlots.forEach(adjacentKey => {
        if (typeGameConquest.skillBattle[adjacentKey] && typeGameConquest.skillBattle[adjacentKey].ID !== "") {
            if (typeGameConquest.skillBattle[adjacentKey].EFFECT.includes("Poison")) {
                typeGameConquest.skillBattle[adjacentKey].POISON[3] += dameSkill
            }
        }
    });
    updateSttForSkillAffter();
}

//Skill tăng chỉ số crit cho pet khác
function skillUpCrit(skillKey, dameSkill, isComp, typeEffect) {
    const teamAorB = skillKey.includes('A') ? 'TeamA' : 'TeamB';
    const skill = document.getElementById(skillKey);

    // Xác định vị trí của skill hiện tại
    let skillIndex = parseInt(skillKey.match(/\d+/)[0]); // Lấy số thứ tự từ skillKey

    // Kiểm tra và thêm các slot liền kề hợp lệ
    let adjacentSlots = [];
    if (typeEffect === "LeftRight") {
        if (skillIndex - 1 >= 1) {
            adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
        }
        if (skillIndex + 1 <= 9) {
            adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
        }
    } else if (typeEffect === "Left") {
        if (skillIndex - 1 >= 1) {
            adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
        }
    } else if (typeEffect === "Right") {
        if (skillIndex + 1 <= 9) {
            adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
        }
    } else if (typeEffect === "All") {
        for (let s = 1; s <= 9; s++) {
            if (skillIndex !== s) {
                adjacentSlots.push(`skill${s}${isComp ? 'A' : 'B'}`);
            }
        }
    } else if (typeEffect === "Self") {
        adjacentSlots.push(`skill${skillIndex}${isComp ? 'A' : 'B'}`);
    } else if (typeEffect === "Type") {
        for (let skill in typeGameConquest.skillBattle) {
            if (isComp === true) {
                if (
                    skill !== skillKey &&                  // Không trùng skillKey
                    skill.endsWith("A") &&                 // Kết thúc bằng "A"
                    typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) // TYPE giống nhau
                ) {
                    adjacentSlots.push(skill)
                }
            } else {
                if (
                    skill !== skillKey &&                  // Không trùng skillKey
                    skill.endsWith("B") &&                 // Kết thúc bằng "B"
                    typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) // TYPE giống nhau
                ) {
                    adjacentSlots.push(skill)
                }
            }
        }
    }

    // Kiểm tra nếu không có slot hợp lệ thì không làm gì
    if (adjacentSlots.length === 0) return;

    // Hiệu ứng cho thanh skill 
    if (teamAorB == 'TeamA') { //bên A
        skill.classList.add('attackingSkillA');
        setTimeout(() => skill.classList.remove('attackingSkillA'), 500);
    } else { //bên B
        skill.classList.add('attackingSkillB');
        setTimeout(() => skill.classList.remove('attackingSkillB'), 500);
    }

    // Duyệt qua các slot liền kề và kích hoạt skill tương ứng
    adjacentSlots.forEach(adjacentKey => {
        if (typeGameConquest.skillBattle[adjacentKey] && typeGameConquest.skillBattle[adjacentKey].ID !== "") {
            typeGameConquest.skillBattle[adjacentKey].CRIT[3] += dameSkill
        }
    });
}
//+++

//Skill tăng chỉ số shield skill bằng shield đang được tạo hiện tại
function skillUpShieldWithNowShield(isComp) {
    updateSttForSkillAffter();
    let shieldNow = isComp ? nowShieldBattleComp : nowShieldBattleMy

    // Tăng shield cho các skill có effect "UpShieldWithNowShield"
    for (const skill in typeGameConquest.skillBattle) {
        const isCorrectSkill = isComp ? skill.endsWith("A") : skill.endsWith("B");
        const hasEffect = typeGameConquest.skillBattle[skill]?.EFFECT.includes("UpShieldWithNowShield");

        if (isCorrectSkill && hasEffect) {
            if (typeGameConquest.skillBattle[skill].EFFECT.includes("Attacking")) {
                // let damePlus = shieldNow===0?typeGameConquest.skillBattle[skill].SHIELD.reduce((a, b) => a + b, 0)||0:0
                typeGameConquest.skillBattle[skill].DAME[4] = shieldNow
            }

            if (typeGameConquest.skillBattle[skill].EFFECT.includes("Healing")) {
                // let damePlus = shieldNow===0?typeGameConquest.skillBattle[skill].SHIELD.reduce((a, b) => a + b, 0)||0:0
                typeGameConquest.skillBattle[skill].HEAL[4] = shieldNow
            }
        }
    }
    updateSttForSkillAffter();
}

//Skill vô hiệu hóa (đóng băng) skill địch
function skillSleepSkills(skillKey, dameSkill, isComp, qtyTarget) {
    const teamAorB = skillKey.includes('A') ? 'TeamA' : 'TeamB';
    var imgTeam = skillKey.includes('A') ? 'TeamB' : 'TeamA';
    const skill = document.getElementById(skillKey);

    // Hiệu ứng cho thanh skill 
    if (teamAorB == 'TeamA') { //bên A
        skill.classList.add('attackingSkillA');
        setTimeout(() => skill.classList.remove('attackingSkillA'), 500);
    } else { //bên B
        skill.classList.add('attackingSkillB');
        setTimeout(() => skill.classList.remove('attackingSkillB'), 500);
    }

    // Xử lý tấn công
    const targetSideId = skillKey.includes('A') ? 'hpBarB' : 'hpBarA';
    const effectContainerId = targetSideId === "hpBarA" ? "cooldownTimeSkillA" : "cooldownTimeSkillB";
    const effectContainer = document.querySelector(`#${effectContainerId}`);

    // Mảng chứa các chỉ số của skillsSleep có giá trị là 0
    let sleepSkills = [];
    let skillsSleep = isComp ? skillsSleepB : skillsSleepA; // Tự động chọn mảng phù hợp
    let skillsDelete = isComp ? skillsDeleteB : skillsDeleteA; // Tự động chọn mảng phù hợp

    // Lặp qua đối tượng skillsSleep để chọn các skill (không cần kiểm tra đã bị sleep hay chưa)
    for (let skill in skillsSleep) {
        if (typeGameConquest.skillBattle[skill]?.ID && skillsDelete[skill] === 0) {
            sleepSkills.push(skill);
            console.log("Skill có thể sleep:", skill);
        }
    }

    // Lấy các skill ngẫu nhiên từ sleepSkills để thay đổi giá trị thành 1 (sleep)
    let selectedSkills = [];
    while (selectedSkills.length < qtyTarget && sleepSkills.length > 0) { //sleep với số lượng qtyTarget
        let randIndex = Math.floor(Math.random() * sleepSkills.length); // Chọn một index ngẫu nhiên
        const selectedSkill = sleepSkills[randIndex]; // Lấy key skill từ mảng sleepSkills
        selectedSkills.push(selectedSkill); // Thêm key skill vào danh sách đã chọn
        sleepSkills.splice(randIndex, 1); // Xóa skill đã chọn khỏi mảng
    }

    // In ra các kỹ năng được chọn
    console.log("selectedSkills", selectedSkills);

    // Đổi giá trị trong skillsSleep tại các skill đã chọn từ 0 thành 1, và tăng dần theo dameSkill
    selectedSkills.forEach(skill => {
        skillsSleep[skill] += dameSkill; // Thêm dameSkill vào skillsSleep[skill] (tăng thời gian ngủ)
        console.log("Skill đã Sleep:", skill, skillsSleep); // Kiểm tra skill bị Sleep
    });

    // Tạo hiệu ứng mũi tên/nắm đấm cho các chỉ số SleepSkills bị chọn
    selectedSkills.forEach(skillKeyToSleep => {
        const targetSkill = document.getElementById(skillKeyToSleep); // Lấy id tương ứng của skill đối phương
        if (targetSkill) {

            // Tạo mũi tên/nắm đấm
            let attackEffect = document.createElement('div');
            if (imgTeam === "TeamB") {
                attackEffect.classList.add('sleepEffect'); // Class CSS để định dạng hiệu ứng
            } else {
                attackEffect.classList.add('sleepEffect'); // Class CSS để định dạng hiệu ứng
            }

            const battleScreen = document.getElementById('battleScreen');
            battleScreen.appendChild(attackEffect);

            // Tính tọa độ trung tâm skill và target tương đối với battleScreen
            const { x: skillX, y: skillY } = getCenterRelativeToContainer(skill, battleScreen);
            const { x: targetX, y: targetY } = getCenterRelativeToContainer(targetSkill, battleScreen);

            // Đặt vị trí ban đầu của mũi tên
            attackEffect.style.position = 'absolute';
            attackEffect.style.left = `${skillX}px`;
            attackEffect.style.top = `${skillY}px`;

            const effectRect = attackEffect.getBoundingClientRect();
            const effectWidth = effectRect.width;
            const effectHeight = effectRect.height;

            // Tạo hiệu ứng bay
            const moveEffect = () => {
                const duration = 500;
                const deltaX = targetX - skillX - effectWidth / 2;
                const deltaY = targetY - skillY - effectHeight / 2;

                attackEffect.style.transition = `transform ${duration}ms ease-out`;
                attackEffect.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

                const skillChild = targetSkill.querySelector('.skill');
                // Kiểm tra nếu tìm thấy phần tử, thêm class 'Sleep'
                if (skillChild) {
                    skillChild.classList.add('sleep');
                }
                // Xóa phần tử sau khi hiệu ứng kết thúc
                setTimeout(() => {
                    attackEffect.remove();
                    attackEffect = null;
                }, duration);
            };

            // Bắt đầu hiệu ứng di chuyển
            setTimeout(moveEffect, 100); // Chờ một chút sau khi hiệu ứng skill bắt đầu

            // Xác định skillSleep object đang dùng
            const skillsSleep = isComp ? skillsSleepB : skillsSleepA;

            // Kiểm tra nếu đã có sleepTimerElement thì không tạo lại
            let sleepTimerElement = targetSkill.querySelector('.sleepTimer');

            if (!sleepTimerElement) {
                // Nếu chưa có, tạo mới
                sleepTimerElement = document.createElement('div');
                sleepTimerElement.classList.add('sleepTimer');

                // Style trực tiếp
                sleepTimerElement.style.position = 'absolute';
                sleepTimerElement.style.top = '60%';
                sleepTimerElement.style.left = '50%';
                sleepTimerElement.style.transform = 'translate(-50%, -50%)';
                sleepTimerElement.style.fontSize = '12px';
                sleepTimerElement.style.color = 'white';
                sleepTimerElement.style.background = 'rgba(183, 179, 179, 0.62)';
                sleepTimerElement.style.padding = '1px 3px';
                sleepTimerElement.style.borderRadius = '4px';
                sleepTimerElement.style.zIndex = '2';
                sleepTimerElement.style.pointerEvents = 'none';
                sleepTimerElement.style.fontWeight = 'bold';

                targetSkill.appendChild(sleepTimerElement);
            }

            // Trước khi setInterval mới
            if (targetSkill.sleepIntervalId) {
                clearInterval(targetSkill.sleepIntervalId);
                targetSkill.sleepIntervalId = null;
            }

            // Cập nhật hiệu ứng và lưu ID interval
            targetSkill.sleepIntervalId = setInterval(() => {
                const currentSleep = skillsSleep[skillKeyToSleep];

                if (currentSleep > 0) {
                    sleepTimerElement.textContent = Math.ceil(currentSleep / 1000);
                    let skillsSpeed = isComp ? skillsSpeedB : skillsSpeedA
                    if (skillsSpeed[skillKeyToSleep] > 0) {
                        skillsSleep[skillKeyToSleep] = Math.max(0, currentSleep - 200 * 2);
                    } else if (skillsSpeed[skillKeyToSleep] < 0) {
                        skillsSleep[skillKeyToSleep] = Math.max(0, currentSleep - 200 / 2);
                    } else {
                        skillsSleep[skillKeyToSleep] = Math.max(0, currentSleep - 200);
                    }

                } else {
                    clearInterval(targetSkill.sleepIntervalId);
                    targetSkill.sleepIntervalId = null;
                    sleepTimerElement.remove();
                    sleepTimerElement = null;
                }
            }, 200);

        }
    });
}

//Skill vô hiệu hóa (đóng băng) skill địch
function skillDeleteSkills(skillKey, dameSkill, isComp) {
    const teamAorB = skillKey.includes('A') ? 'TeamA' : 'TeamB';
    var imgTeam = skillKey.includes('A') ? 'TeamB' : 'TeamA';
    const skill = document.getElementById(skillKey);

    // Hiệu ứng cho thanh skill 
    if (teamAorB == 'TeamA') { //bên A
        skill.classList.add('attackingSkillA');
        setTimeout(() => skill.classList.remove('attackingSkillA'), 500);
    } else { //bên B
        skill.classList.add('attackingSkillB');
        setTimeout(() => skill.classList.remove('attackingSkillB'), 500);
    }

    // Xử lý tấn công
    const targetSideId = skillKey.includes('A') ? 'hpBarB' : 'hpBarA';
    const effectContainerId = targetSideId === "hpBarA" ? "cooldownTimeSkillA" : "cooldownTimeSkillB";
    const effectContainer = document.querySelector(`#${effectContainerId}`);

    // Mảng chứa các chỉ số của skillsDelete có giá trị là 0
    let deleteSkills = [];
    let skillsDelete = isComp ? skillsDeleteB : skillsDeleteA; // Tự động chọn mảng phù hợp

    // Lặp qua đối tượng skillsDelete để chọn các chỉ số có giá trị 0 (chưa bị delete)
    for (let skill in skillsDelete) {
        if (skillsDelete[skill] === 0 && typeGameConquest.skillBattle[skill]?.ID && typeGameConquest.skillBattle[skill].LEVEL <= typeGameConquest.skillBattle[skillKey].LEVEL && !typeGameConquest.skillBattle[skill].EFFECT.includes("BKBDelete")) {
            deleteSkills.push(skill);  // Thêm key vào danh sách skill có thể delete
            console.log(`Skill có thể delete:`, skill);
        }
    }

    let countDameSkill = 0;
    if (dameSkill >= deleteSkills.length) {
        countDameSkill = deleteSkills.length
    } else {
        countDameSkill = dameSkill
    }

    // Lấy các skill cần delete
    let selectedSkills = [];
    for (let i = 0; i < countDameSkill; i++) {
        if (deleteSkills.length > 0) {
            let randIndex = Math.floor(Math.random() * deleteSkills.length); // Chọn skill ngẫu nhiên
            const selectedSkill = deleteSkills[randIndex];
            selectedSkills.push(selectedSkill); // Thêm vào danh sách đã chọn
            deleteSkills.splice(randIndex, 1); // Xóa khỏi danh sách các skill có thể chọn
        }
    }

    // Đảm bảo không chọn thêm skill
    // if (selectedSkills.length > dameSkill) {
    //   selectedSkills = selectedSkills.slice(0, dameSkill);
    // }

    // Cập nhật trạng thái delete cho các skill
    selectedSkills.forEach(skill => {
        skillsDelete[skill] = 1; // Đặt trạng thái delete
        console.log("Skill đã delete:", skill);
    });

    // Tạo hiệu ứng mũi tên/nắm đấm cho các chỉ số deleteSkills bị chọn
    selectedSkills.forEach(skillKeyToDelete => {
        const targetSkill = document.getElementById(skillKeyToDelete); // Lấy id tương ứng của skill đối phương
        if (targetSkill) {

            // Tạo mũi tên/nắm đấm
            let attackEffect = document.createElement('div');
            if (imgTeam === "TeamB") {
                attackEffect.classList.add('deleteEffect'); // Class CSS để định dạng hiệu ứng
            } else {
                attackEffect.classList.add('deleteEffect'); // Class CSS để định dạng hiệu ứng
            }

            const battleScreen = document.getElementById('battleScreen');
            battleScreen.appendChild(attackEffect);

            // Tính tọa độ trung tâm skill và target tương đối với battleScreen
            const { x: skillX, y: skillY } = getCenterRelativeToContainer(skill, battleScreen);
            const { x: targetX, y: targetY } = getCenterRelativeToContainer(targetSkill, battleScreen);

            // Đặt vị trí ban đầu của mũi tên
            attackEffect.style.position = 'absolute';
            attackEffect.style.left = `${skillX}px`;
            attackEffect.style.top = `${skillY}px`;

            const effectRect = attackEffect.getBoundingClientRect();
            const effectWidth = effectRect.width;
            const effectHeight = effectRect.height;

            // Tạo hiệu ứng bay
            const moveEffect = () => {
                const duration = 500;
                const deltaX = targetX - skillX - effectWidth / 2;
                const deltaY = targetY - skillY - effectHeight / 2;

                attackEffect.style.transition = `transform ${duration}ms ease-out`;
                attackEffect.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

                const skillChild = targetSkill.querySelector('.skill');
                // Kiểm tra nếu tìm thấy phần tử, thêm class 'delete'
                if (skillChild) {
                    skillChild.classList.add('delete');
                }
                // Xóa phần tử sau khi hiệu ứng kết thúc
                setTimeout(() => {
                    attackEffect.remove();
                    attackEffect = null;
                }, duration);
            };

            // Bắt đầu hiệu ứng di chuyển
            setTimeout(moveEffect, 100); // Chờ một chút sau khi hiệu ứng skill bắt đầu
        }
    });
}

//Skill tăng tốc 
let skillsSpeedA = { skill1A: 0, skill2A: 0, skill3A: 0, skill4A: 0, skill5A: 0, skill6A: 0, skill7A: 0, skill8A: 0, skill9A: 0 };
let skillsSpeedB = { skill1B: 0, skill2B: 0, skill3B: 0, skill4B: 0, skill5B: 0, skill6B: 0, skill7B: 0, skill8B: 0, skill9B: 0 };

function skillSpeedUp(skillKey, dameSkill, isComp, qtyTarget) {

    const skill = document.getElementById(skillKey)
    const teamAorB = skillKey.includes('A') ? 'TeamA' : 'TeamB';
    var imgTeam = skillKey.includes('A') ? 'TeamA' : 'TeamB';

    // Hiệu ứng cho thanh skill 
    if (teamAorB == 'TeamA') { //bên A
        skill.classList.add('attackingSkillA');
        setTimeout(() => skill.classList.remove('attackingSkillA'), 500);
    } else { //bên B
        skill.classList.add('attackingSkillB');
        setTimeout(() => skill.classList.remove('attackingSkillB'), 500);
    }

    // Mảng chứa các chỉ số của skillsHaste có giá trị là 0
    let hasteSkills = [];
    let skillsSpeed = isComp ? skillsSpeedA : skillsSpeedB; // Tự động chọn mảng phù hợp
    let skillsDelete = isComp ? skillsDeleteA : skillsDeleteB; // Tự động chọn mảng phù hợp

    // Lặp qua đối tượng skillsSpeed để chọn các skill (không cần kiểm tra đã tăng tốc hay chưa)
    for (let skill in skillsSpeed) {
        if (typeGameConquest.skillBattle[skill]?.ID && skillsDelete[skill] === 0 && skill !== skillKey) {
            hasteSkills.push(skill);
            console.log("Skill có thể tăng tốc:", skill);
        }
    }

    // Lấy các skill ngẫu nhiên từ hasteSkills để thay đổi giá trị thành 1
    let selectedSkills = [];
    while (selectedSkills.length < qtyTarget && hasteSkills.length > 0) { //haste với số lượng qtyTarget
        let randIndex = Math.floor(Math.random() * hasteSkills.length); // Chọn một index ngẫu nhiên
        const selectedSkill = hasteSkills[randIndex]; // Lấy key skill từ mảng hasteSkills
        selectedSkills.push(selectedSkill); // Thêm key skill vào danh sách đã chọn
        hasteSkills.splice(randIndex, 1); // Xóa skill đã chọn khỏi mảng
    }

    // In ra các kỹ năng được chọn
    console.log("selectedSkills", selectedSkills);

    // Đổi giá trị trong skillsSpeed tại các skill đã chọn từ 0 thành 1, và tăng dần theo dameSkill
    selectedSkills.forEach(skill => {
        skillsSpeed[skill] += dameSkill; // Thêm dameSkill vào skillsSpeed[skill] (tăng thời gian ngủ)
        console.log("Skill đã tăng tốc:", skill, skillsSpeed); // Kiểm tra skill tăng tốc
    });

    // Tạo hiệu ứng mũi tên/nắm đấm cho các chỉ số HasteSkills bị chọn
    selectedSkills.forEach(skillKeyToHaste => {
        const targetSkill = document.getElementById(skillKeyToHaste); // Lấy id tương ứng của skill đối phương
        if (targetSkill) {

            // Tạo mũi tên/nắm đấm
            let attackEffect = document.createElement('div');
            if (imgTeam === "TeamB") {
                attackEffect.classList.add('speedUpEffect'); // Class CSS để định dạng hiệu ứng
            } else {
                attackEffect.classList.add('speedUpEffect'); // Class CSS để định dạng hiệu ứng
            }

            const battleScreen = document.getElementById('battleScreen');
            battleScreen.appendChild(attackEffect);

            // Tính tọa độ trung tâm skill và target tương đối với battleScreen
            const { x: skillX, y: skillY } = getCenterRelativeToContainer(skill, battleScreen);
            const { x: targetX, y: targetY } = getCenterRelativeToContainer(targetSkill, battleScreen);

            // Đặt vị trí ban đầu của mũi tên
            attackEffect.style.position = 'absolute';
            attackEffect.style.left = `${skillX}px`;
            attackEffect.style.top = `${skillY}px`;

            const effectRect = attackEffect.getBoundingClientRect();
            const effectWidth = effectRect.width;
            const effectHeight = effectRect.height;

            // Tạo hiệu ứng bay
            const moveEffect = () => {
                const duration = 500;
                const deltaX = targetX - skillX - effectWidth / 2;
                const deltaY = targetY - skillY - effectHeight / 2;

                attackEffect.style.transition = `transform ${duration}ms ease-out`;
                attackEffect.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

                // Xóa phần tử sau khi hiệu ứng kết thúc
                setTimeout(() => {
                    attackEffect.remove();
                    attackEffect = null;
                }, duration);
            };

            // Bắt đầu hiệu ứng di chuyển
            setTimeout(moveEffect, 100); // Chờ một chút sau khi hiệu ứng skill bắt đầu

            // Kiểm tra nếu đã có hasteTimerElement thì không tạo lại
            let hasteTimerElement = targetSkill.querySelector('.hasteTimer');

            if (!hasteTimerElement) {
                // Nếu chưa có, tạo mới
                hasteTimerElement = document.createElement('div');
                hasteTimerElement.classList.add('hasteTimer');

                // Style trực tiếp
                hasteTimerElement.style.position = 'absolute';
                hasteTimerElement.style.top = '40%';
                hasteTimerElement.style.left = '50%';
                hasteTimerElement.style.transform = 'translate(-50%, -50%)';
                hasteTimerElement.style.fontSize = '12px';
                hasteTimerElement.style.color = 'white';
                hasteTimerElement.style.background = 'rgba(244, 48, 48, 0.62)';
                hasteTimerElement.style.padding = '1px 3px';
                hasteTimerElement.style.borderRadius = '4px';
                hasteTimerElement.style.zIndex = '2';
                hasteTimerElement.style.pointerEvents = 'none';
                hasteTimerElement.style.fontWeight = 'bold';

                targetSkill.appendChild(hasteTimerElement);
            }
            // Trước khi setInterval mới
            if (targetSkill.hasteIntervalId) {
                clearInterval(targetSkill.hasteIntervalId);
                targetSkill.hasteIntervalId = null;
            }

            // Cập nhật hiệu ứng và lưu ID interval
            targetSkill.hasteIntervalId = setInterval(() => {
                const currentHaste = skillsSpeed[skillKeyToHaste];

                // Giảm dần nhưng không vượt qua 0
                skillsSpeed[skillKeyToHaste] = Math.max(0, currentHaste - 500);

                // Cập nhật hiển thị thời gian còn lại
                hasteTimerElement.textContent = Math.ceil(skillsSpeed[skillKeyToHaste] / 1000);

                // Nếu skillsSpeed đã về 0, dừng hiệu ứng và xóa timer
                if (skillsSpeed[skillKeyToHaste] === 0) {
                    clearInterval(targetSkill.hasteIntervalId);
                    targetSkill.hasteIntervalId = null;
                    hasteTimerElement.remove();
                    hasteTimerElement = null;
                }
            }, 500);


        }
    });
}


function skillSlow(skillKey, dameSkill, isComp, qtyTarget) {
    const skill = document.getElementById(skillKey)
    const teamAorB = skillKey.includes('A') ? 'TeamA' : 'TeamB';
    var imgTeam = skillKey.includes('A') ? 'TeamB' : 'TeamA';

    // Hiệu ứng cho thanh skill 
    if (teamAorB == 'TeamA') { //bên A
        skill.classList.add('attackingSkillA');
        setTimeout(() => skill.classList.remove('attackingSkillA'), 500);
    } else { //bên B
        skill.classList.add('attackingSkillB');
        setTimeout(() => skill.classList.remove('attackingSkillB'), 500);
    }

    // Mảng chứa các chỉ số của skillsSlow có giá trị là 0
    let slowSkills = [];
    let skillsSpeed = isComp ? skillsSpeedB : skillsSpeedA; // Tự động chọn mảng phù hợp
    let skillsDelete = isComp ? skillsDeleteB : skillsDeleteA; // Tự động chọn mảng phù hợp

    // Lặp qua đối tượng skillsSpeed để chọn các skill
    for (let skill in skillsSpeed) {
        if (typeGameConquest.skillBattle[skill]?.ID && skillsDelete[skill] === 0) {
            slowSkills.push(skill);
            console.log("Skill có thể làm chậm:", skill);
        }
    }

    // Lấy các skill ngẫu nhiên từ slowSkills để thay đổi giá trị thành 1
    let selectedSkills = [];
    while (selectedSkills.length < qtyTarget && slowSkills.length > 0) { //slow với số lượng qtyTarget
        let randIndex = Math.floor(Math.random() * slowSkills.length); // Chọn một index ngẫu nhiên
        const selectedSkill = slowSkills[randIndex]; // Lấy key skill từ mảng slowSkills
        selectedSkills.push(selectedSkill); // Thêm key skill vào danh sách đã chọn
        slowSkills.splice(randIndex, 1); // Xóa skill đã chọn khỏi mảng
    }

    // In ra các kỹ năng được chọn
    console.log("selectedSkills", selectedSkills);

    // Đổi giá trị trong skillsSpeed tại các skill đã chọn từ 0 thành 1, và tăng dần theo dameSkill
    selectedSkills.forEach(skill => {
        skillsSpeed[skill] -= dameSkill; // Thêm dameSkill vào skillsSpeed[skill] (tăng thời gian ngủ)
        console.log("Skill đã làm chậm:", skill, skillsSpeed); // Kiểm tra skill tăng tốc
    });

    // Tạo hiệu ứng mũi tên/nắm đấm cho các chỉ số SlowSkills bị chọn
    selectedSkills.forEach(skillKeyToSlow => {
        const targetSkill = document.getElementById(skillKeyToSlow); // Lấy id tương ứng của skill đối phương
        if (targetSkill) {

            // Tạo mũi tên/nắm đấm
            let attackEffect = document.createElement('div');
            if (imgTeam === "TeamB") {
                attackEffect.classList.add('slowEffect'); // Class CSS để định dạng hiệu ứng
            } else {
                attackEffect.classList.add('slowEffect'); // Class CSS để định dạng hiệu ứng
            }

            const battleScreen = document.getElementById('battleScreen');
            battleScreen.appendChild(attackEffect);

            // Tính tọa độ trung tâm skill và target tương đối với battleScreen
            const { x: skillX, y: skillY } = getCenterRelativeToContainer(skill, battleScreen);
            const { x: targetX, y: targetY } = getCenterRelativeToContainer(targetSkill, battleScreen);

            // Đặt vị trí ban đầu của mũi tên
            attackEffect.style.position = 'absolute';
            attackEffect.style.left = `${skillX}px`;
            attackEffect.style.top = `${skillY}px`;

            const effectRect = attackEffect.getBoundingClientRect();
            const effectWidth = effectRect.width;
            const effectHeight = effectRect.height;

            // Tạo hiệu ứng bay
            const moveEffect = () => {
                const duration = 500;
                const deltaX = targetX - skillX - effectWidth / 2;
                const deltaY = targetY - skillY - effectHeight / 2;

                attackEffect.style.transition = `transform ${duration}ms ease-out`;
                attackEffect.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

                // Xóa phần tử sau khi hiệu ứng kết thúc
                setTimeout(() => {
                    attackEffect.remove();
                    attackEffect = null;
                }, duration);
            };

            // Bắt đầu hiệu ứng di chuyển
            setTimeout(moveEffect, 100); // Chờ một chút sau khi hiệu ứng skill bắt đầu

            // Kiểm tra nếu đã có slowTimerElement thì không tạo lại
            let slowTimerElement = targetSkill.querySelector('.slowTimer');

            if (!slowTimerElement) {
                // Nếu chưa có, tạo mới
                slowTimerElement = document.createElement('div');
                slowTimerElement.classList.add('slowTimer');

                // Style trực tiếp
                slowTimerElement.style.position = 'absolute';
                slowTimerElement.style.top = '40%';
                slowTimerElement.style.left = '50%';
                slowTimerElement.style.transform = 'translate(-50%, -50%)';
                slowTimerElement.style.fontSize = '12px';
                slowTimerElement.style.color = 'white';
                slowTimerElement.style.background = 'rgba(78, 207, 246, 0.62)';
                slowTimerElement.style.padding = '1px 3px';
                slowTimerElement.style.borderRadius = '4px';
                slowTimerElement.style.zIndex = '2';
                slowTimerElement.style.pointerEvents = 'none';
                slowTimerElement.style.fontWeight = 'bold';

                targetSkill.appendChild(slowTimerElement);
            }

            // Trước khi setInterval mới
            if (targetSkill.slowIntervalId) {
                clearInterval(targetSkill.slowIntervalId);
                targetSkill.slowIntervalId = null;
            }

            // Cập nhật hiệu ứng và lưu ID interval
            targetSkill.slowIntervalId = setInterval(() => {
                const currentSlow = skillsSpeed[skillKeyToSlow];

                if (currentSlow < 0) {
                    skillsSpeed[skillKeyToSlow] = Math.min(0, currentSlow + 500);
                    slowTimerElement.textContent = Math.ceil(Math.abs(skillsSpeed[skillKeyToSlow] / 1000).toFixed(0));
                } else {
                    clearInterval(targetSkill.slowIntervalId);
                    targetSkill.slowIntervalId = null;
                    slowTimerElement.remove();
                    slowTimerElement = null;
                }
            }, 500);

        }
    });
}

//Hàm hiển thị số sát thương đánh thường baseAttack
function effectNumberAtBaseAttack(targetAttack, dameSkill, effect, isCrit) {
    let effectNumberDiv = document.createElement('div');

    const effectContainer = document.getElementById(targetAttack);

    // Thêm class tùy theo loại hiệu ứng
    if (effect === "Poison") {
        effectNumberDiv.classList.add('effect', 'poison');
        effectNumberDiv.innerText = `+${dameSkill}`; // Hiển thị số cho poison
    } else if (effect === "Burn") {
        effectNumberDiv.classList.add('effect', 'burn');
        effectNumberDiv.innerText = `+${dameSkill}`; // Hiển thị số cho burn
    } else if (effect === "Attacking") {
        effectNumberDiv.classList.add('effect', 'damage');
        effectNumberDiv.innerText = `-${dameSkill}`; // Hiển thị số cho burn
    } else if (effect === "Shield") {
        effectNumberDiv.classList.add('effect', 'shield');
        effectNumberDiv.innerText = `+${dameSkill}`; // Hiển thị số cho burn
    } else if (effect === "Heal") {
        effectNumberDiv.classList.add('effect', 'heal');
        effectNumberDiv.innerText = `+${dameSkill}`; // Hiển thị số cho burn
    }

    if (isCrit) {
        effectNumberDiv.style.backgroundImage = "url('https://cdn-icons-png.freepik.com/256/7380/7380434.png?semt=ais_hybrid')";
        effectNumberDiv.style.backgroundSize = "60px 60px";  // Hoặc "cover" tùy thuộc vào cách bạn muốn hình ảnh được phóng to.
        effectNumberDiv.style.backgroundRepeat = "no-repeat";  // Đảm bảo hình không bị lặp lại.
        effectNumberDiv.style.backgroundPosition = "center";  // Đặt hình giữa phần tử.
        effectNumberDiv.style.fontSize = "40px";
    }


    // Tạo một vị trí ngẫu nhiên nhỏ để số sẽ xuất hiện với hiệu ứng
    const randomX = Math.random() * 80 - 40; // Tạo hiệu ứng di chuyển ±40px
    const randomY = Math.random() * 80 - 40;


    // Đặt vị trí của số sát thương tại vị trí của container
    // effectNumberDiv.style.position = 'absolute';
    effectNumberDiv.style.transform = `translate(${randomX}px, ${randomY}px)`;
    effectNumberDiv.style.fontSize = '20px';  // Đặt kích thước chữ
    effectNumberDiv.style.zIndex = '200';     // Đảm bảo số luôn nằm trên các phần tử khác
    effectNumberDiv.style.animation = 'fadeOut 1.5s ease-in-out forwards';  // Thêm hiệu ứng di chuyển

    // Thêm vào container của effect
    effectContainer.appendChild(effectNumberDiv);

    // Cập nhật lại thanh HP (nếu có)
    updateHpbar();

    // Xóa số sau khi hiệu ứng hoàn tất
    setTimeout(() => {
        effectNumberDiv.remove();
        effectNumberDiv = null;
    }, 1500);  // Sau 1.5s, số sẽ biến mất
}


//Hàm hiển thị số sát thương cộng thêm của burn/poison bay số ở User Main
function effectNumberAtAttack(skillId, dameSkill, effect, isCrit) {
    let effectNumberDiv = document.createElement('div');

    // Xử lý tấn công
    const targetSideId = skillId.includes('A') ? 'hpBarB' : 'hpBarA';
    let effectContainerId = "";
    if (effect === "Shield" || effect === "Heal") {
        effectContainerId = targetSideId === "hpBarA" ? "localtionB" : "localtionA";
    } else {
        effectContainerId = targetSideId === "hpBarA" ? "localtionA" : "localtionB";
    }

    const effectContainer = document.getElementById(effectContainerId);

    // Thêm class tùy theo loại hiệu ứng
    if (effect === "Poison") {
        effectNumberDiv.classList.add('effect', 'poison');
        effectNumberDiv.innerText = `+${dameSkill}`; // Hiển thị số cho poison
    } else if (effect === "Burn") {
        effectNumberDiv.classList.add('effect', 'burn');
        effectNumberDiv.innerText = `+${dameSkill}`; // Hiển thị số cho burn
    } else if (effect === "Attacking") {
        effectNumberDiv.classList.add('effect', 'damage');
        effectNumberDiv.innerText = `-${dameSkill}`; // Hiển thị số cho burn
    } else if (effect === "Shield") {
        effectNumberDiv.classList.add('effect', 'shield');
        effectNumberDiv.innerText = `+${dameSkill}`; // Hiển thị số cho burn
    } else if (effect === "Heal") {
        effectNumberDiv.classList.add('effect', 'heal');
        effectNumberDiv.innerText = `+${dameSkill}`; // Hiển thị số cho burn
    }

    if (isCrit) {
        effectNumberDiv.style.backgroundImage = "url('https://cdn-icons-png.freepik.com/256/7380/7380434.png?semt=ais_hybrid')";
        effectNumberDiv.style.backgroundSize = "60px 60px";  // Hoặc "cover" tùy thuộc vào cách bạn muốn hình ảnh được phóng to.
        effectNumberDiv.style.backgroundRepeat = "no-repeat";  // Đảm bảo hình không bị lặp lại.
        effectNumberDiv.style.backgroundPosition = "center";  // Đặt hình giữa phần tử.
        effectNumberDiv.style.fontSize = "40px";
    }


    // Tạo một vị trí ngẫu nhiên nhỏ để số sẽ xuất hiện với hiệu ứng
    const randomX = Math.random() * 80 - 40; // Tạo hiệu ứng di chuyển ±40px
    const randomY = Math.random() * 80 - 40;


    // Đặt vị trí của số sát thương tại vị trí của container
    // effectNumberDiv.style.position = 'absolute';
    effectNumberDiv.style.transform = `translate(${randomX}px, ${randomY}px)`;
    effectNumberDiv.style.fontSize = '20px';  // Đặt kích thước chữ
    effectNumberDiv.style.zIndex = '200';     // Đảm bảo số luôn nằm trên các phần tử khác
    effectNumberDiv.style.animation = 'fadeOut 1.5s ease-in-out forwards';  // Thêm hiệu ứng di chuyển

    // Thêm vào container của effect
    effectContainer.appendChild(effectNumberDiv);

    // Cập nhật lại thanh HP (nếu có)
    updateHpbar();

    // Xóa số sau khi hiệu ứng hoàn tất
    setTimeout(() => {
        effectNumberDiv.remove();
        effectNumberDiv = null;
    }, 1500);  // Sau 1.5s, số sẽ biến mất
}


// Hàm áp dụng sát thương
function applyDamage(targetSideId, dameSkill, effect) {
    const targetSide = document.querySelector(`#${targetSideId}`);
    const hpBar = targetSide.querySelector('.hpFill');
    const hpText = targetSide.querySelector('.hpText');
    const shieldText = targetSide.querySelector('.shieldText');
    const shieldBar = targetSide.querySelector('.shieldFill');

    // Lấy `effectContainer`
    const effectContainerId = targetSideId === "hpBarA" ? "effectContainerA" : "effectContainerB";
    const effectContainer = document.querySelector(`#${effectContainerId}`);

    let currentHp, currentShield, maxHp;

    // Xác định thông tin bên cần áp dụng
    if (targetSideId === "hpBarA") {
        currentHp = nowHpBattleComp;
        currentShield = nowShieldBattleComp;
        maxHp = typeGameConquest.maxHpBattleComp;
    } else if (targetSideId === "hpBarB") {
        currentHp = nowHpBattleMy;
        currentShield = nowShieldBattleMy;
        maxHp = (typeGameConquest.maxHpBattle + maxHpUp);
    }

    // Xử lý khi hồi máu
    if (effect === "Heal") {
        currentHp = Math.min(currentHp + dameSkill, maxHp); // Giới hạn HP không vượt quá max HP
        if (targetSideId === "hpBarA") {
            nowPoisonBattleComp = Math.max(0, nowPoisonBattleComp - 1);
        } else {
            nowPoisonBattleMy = Math.max(0, nowPoisonBattleMy - 1);
        }
    } else if (effect === "Dame" || effect === "Burn" || effect === "overTime") {
        if (currentShield > 0) {
            // Trừ sát thương vào Shield trước
            const remainingDamage = Math.max(dameSkill - currentShield, 0);
            currentShield = Math.max(currentShield - dameSkill, 0);
            // Trừ sát thương dư vào HP nếu Shield bị phá
            currentHp = Math.max(currentHp - remainingDamage, 0);
        } else {
            // Nếu không còn Shield, trừ thẳng vào HP
            currentHp = Math.max(currentHp - dameSkill, 0);
        }
    } else if (effect === "Poison") {
        // Xử lý khi gây sát thương Poison
        currentHp = Math.max(currentHp - dameSkill, 0);
    } else if (effect === "Shield") {
        currentShield = Math.max(currentShield + dameSkill, 0);
        if (targetSideId === "hpBarA") {
            nowBurnBattleComp = Math.max(0, nowBurnBattleComp - 1);
        } else {
            nowBurnBattleMy = Math.max(0, nowBurnBattleMy - 1);
        }
    }

    updateHpbar();


    // Cập nhật biến toàn cục
    if (targetSideId === "hpBarA") {
        nowHpBattleComp = currentHp;
        nowShieldBattleComp = currentShield;
    } else if (targetSideId === "hpBarB") {
        nowHpBattleMy = currentHp;
        nowShieldBattleMy = currentShield;
    }

    // Hiệu ứng bay số
    if (dameSkill <= 0) {

    } else {
        effectHpBarUpdate(effectContainer, dameSkill, effect);
    }
}



// Function tạo hiệu ứng trừ máu/cộng máu hiện ra khi bị trừ/cộng ở thanh Hp
function effectHpBarUpdate(effectContainer, dameSkill, effect) {
    let effectDiv = document.createElement('div');
    //Thêm hiệu ứng vào div
    if (effect === "Burn") {
        effectDiv.classList.add('effect', 'burn')
        effectDiv.innerText = `-${dameSkill}`
    } else if (effect === "overTime") {
        effectDiv.classList.add('effect', 'damage')
        effectDiv.innerText = `-${dameSkill}`
    } else if (effect === "Poison") {
        effectDiv.classList.add('effect', 'poison')
        effectDiv.innerText = `-${dameSkill}`
    } else if (effect === "Freeze") {
        effectDiv.classList.add('effect', 'freeze')
        effectDiv.innerText = `❄${dameSkill / 1000}s`
    }

    // Tạo giá trị ngẫu nhiên cho vị trí bên trong .effectContainer
    const containerWidth = effectContainer.offsetWidth;
    const containerHeight = effectContainer.offsetHeight;

    // Random top và left trong phạm vi của container
    const randomX = Math.random() * containerWidth; // Giá trị ngẫu nhiên trong phạm vi width của container
    const randomY = Math.random() * containerHeight; // Giá trị ngẫu nhiên trong phạm vi height của container
    const randomTop = randomY - (effectDiv.offsetHeight / 2); // Điều chỉnh lại vị trí top để căn giữa
    const randomLeft = randomX - (effectDiv.offsetWidth / 2); // Điều chỉnh lại vị trí left để căn giữa

    // Gán trực tiếp các giá trị random vào style của effect
    effectDiv.style.top = `${randomTop}px`;
    effectDiv.style.left = `${randomLeft}px`;
    // effectDiv.style.setProperty('animation', 'flyRandom 1s ease-in-out');

    const maxOffset = 60; // Tối đa ±30px
    const randomXe = (Math.random() - 0.5) * maxOffset;
    const randomYe = (Math.random() - 0.5) * maxOffset;

    // Gán giá trị ngẫu nhiên vào style
    effectDiv.style.setProperty('--end-x', `${randomXe}px`);
    effectDiv.style.setProperty('--end-y', `${randomYe}px`);
    effectDiv.style.animation = 'flyRandom 1.5s ease-in-out forwards';

    // Thêm vào container
    effectContainer.appendChild(effectDiv);
    updateHpbar();
    // Xóa sau 2s
    setTimeout(() => {
        effectDiv.remove();
        effectDiv = null;
    }, 2000);
}


function applyAtkEffect(teamAtk) {
    let teamElement = document.getElementById(teamAtk); // 'TeamA' hoặc 'TeamB'
    let teamHit = teamAtk === 'TeamA' ? 'TeamB' : 'TeamA';

    //Hiệu ứng cho bên bị tấn công
    if (teamHit == 'TeamA') {
        document.getElementById(teamHit).classList.add('hit');
    } else {
        document.getElementById(teamHit).classList.add('hit');
    }

    // Sau một khoảng thời gian (ví dụ 0.3s), loại bỏ hiệu ứng
    setTimeout(function () {
        if (teamHit == 'TeamA') {
            document.getElementById(teamHit).classList.remove('hit');
        } else {
            document.getElementById(teamHit).classList.remove('hit');
        }
    }, 300);

}

function createInfo5mon() {
    document.querySelectorAll(".skill").forEach((skill) => {
        if (!skill.dataset.hasEvent) {
            skill.addEventListener("click", function (event) {
                // Ngừng sự kiện click lan rộng
                event.stopPropagation();

                // Lấy ID skill
                const skillId = skill.parentElement?.id || "";
                const slotSkill = skill.parentElement?.parentElement?.id || "";

                const popup = document.getElementById("popupSTT5MonInBattle");
                const overlay = document.getElementById("popupOverlay");

                let skillInfo = null;
                console.log("skillId:", skillId);
                console.log("slotSkill:", slotSkill);

                if (slotSkill === "battleShop" && typeGameConquest.battlePetInShop?.[skillId]) {
                    skillInfo = typeGameConquest.battlePetInShop[skillId];
                } else if (slotSkill === "battleInventory" && typeGameConquest.battlePetInInventory?.[skillId]) {
                    skillInfo = typeGameConquest.battlePetInInventory[skillId];
                } else if ((slotSkill === "skillBarB" || slotSkill === "skillBarA") && typeGameConquest.skillBattle?.[skillId]) {
                    skillInfo = typeGameConquest.skillBattle[skillId];
                    console.log("vào đây:", skillInfo);
                } else if (slotSkill === "skillBarBfn") {
                    skillInfo = skillFinalGame[skillId];
                } else if (slotSkill === "slotGacha") {
                    skillInfo = randomPet[skillId];
                }

                // Hiển thị thông tin skill
                for (let k = 1; k <= 4; k++) {
                    document.getElementById(`popupSTT5MonInBattleLV${k}`).style.background = "firebrick";
                }

                document.getElementById(`popupSTT5MonInBattleLV${skillInfo.LEVEL}`).style.background = "rebeccapurple";

                setupPopupInfo5MonInBattle(skillInfo, skillInfo.LEVEL);

                for (let s = 1; s <= 4; s++) {
                    const el = document.getElementById(`popupSTT5MonInBattleLV${s}`);
                    if (!el) continue;
                    el.onclick = () => {
                        setupPopupInfo5MonInBattle(skillInfo, s);
                        for (let p = 1; p <= 4; p++) {
                            document.getElementById(`popupSTT5MonInBattleLV${p}`).style.background = "firebrick";
                        }
                        
                        el.style.background = "rebeccapurple";

                    };
                }


                // Hiển thị popup
                popup.style.display = "flex";
                overlay.style.display = "flex";

                // Đóng popup khi bấm nền mờ (gán sự kiện một lần duy nhất)
                if (!overlay.dataset.hasEvent) {
                    overlay.addEventListener("click", () => {
                        popup.style.display = "none";
                        overlay.style.display = "none";
                    });
                    overlay.dataset.hasEvent = "true";
                }
            });

            // Đánh dấu đã gán sự kiện
            skill.dataset.hasEvent = "true";
        }
    });
}


//Tạo popup hiển thị thông tin user/comp
let popupVisible = false; // Biến theo dõi trạng thái hiển thị của popup

function showPopupInfo(element, type) {
    const popup = document.getElementById("popupInfoMyOrComp");
    const nameElement = document.getElementById("popupInfoName");
    const desc1Element = document.getElementById("popupInfoDesc1");
    const desc2Element = document.getElementById("popupInfoDesc2");

    // Dữ liệu để hiển thị (Có thể lấy từ các nguồn dữ liệu khác nhau)
    let name = '';
    let desc1 = '';
    let desc2 = '';

    desc1 += `<span style="color: black; font-weight: bold; font-size: 12px;">Thông tin nhân vật:</span>`


    if (type === "user") {

        for (let i = 0; i < allCharacter.length; i++) {
            if (allCharacter[i].id === typeGameConquest.selectCharacterBattle) {
                if (allCharacter[i].hpMax > 0) {
                    desc1 += `<span style="font-size:10px;">Tăng <a style="color:green">10Hp</a> sau mỗi vòng đấu</span>`;
                }
                if (allCharacter[i].upDame > 0) {
                    desc1 += `<span style="font-size:10px;">Tăng <a style="color:red">${allCharacter[i].upDame} sát thương</a> cho tất cả 5mon sau mỗi vòng đấu</span>`;
                }
                if (allCharacter[i].upHeal > 0) {
                    desc1 += `<span style="font-size:10px;">Tăng <a style="color:lime">${allCharacter[i].upHeal} chỉ số hồi Hp</a> cho tất cả 5mon sau mỗi vòng đấu</span>`;
                }
                if (allCharacter[i].upShield > 0) {
                    desc1 += `<span style="font-size:10px;">Tăng <a style="color:blue">${allCharacter[i].upShield} chỉ số tạo giáp</a> cho tất cả 5mon sau mỗi vòng đấu</span>`;
                }
                if (allCharacter[i].upBurn > 0) {
                    desc1 += `<span style="font-size:10px;">Tăng <a style="color:orange">${allCharacter[i].upBurn} sát thương đốt</a> cho tất cả 5mon sau mỗi vòng đấu</span>`;
                }
                if (allCharacter[i].upPoison > 0) {
                    desc1 += `<span style="font-size:10px;">Tăng <a style="color:purple">${allCharacter[i].upPoison} gây độc</a> cho tất cả 5mon sau mỗi vòng đấu</span>`;
                }
                if (allCharacter[i].upCrit > 0) {
                    desc1 += `<span style="font-size:10px;">Tăng <a style="color:red">${allCharacter[i].upCrit} chỉ số chí mạng</a> 5mon sau mỗi vòng đấu</span>`;
                }
                if (allCharacter[i].upMulti > 0) {
                    desc1 += `<span style="font-size:10px;">Tăng <a style="color:purple">${allCharacter[i].upMulti} liên kích</a> cho một 5mon sau mỗi 3 vòng đấu</span>`;
                }
                if (allCharacter[i].upCooldown > 0) {
                    desc1 += `<span style="font-size:10px;">Tăng <a style="color:blue">${allCharacter[i].upCooldown / 1000}s tốc độ</a> của bản thân sau mỗi vòng đấu (hiện tại: ${typeGameConquest.upCooldownB / 1000}s)</span>`;
                }
                if (allCharacter[i].slow > 0) {
                    desc1 += `<span style="font-size:10px;">Giảm <a style="color:blue">${allCharacter[i].slow / 1000}s tốc độ</a> của đối thủ sau mỗi vòng đấu (hiện tại: ${typeGameConquest.slowB / 1000}s)</span>`;
                }
                if (allCharacter[i].dameCrit > 0) {
                    desc1 += `<span style="font-size:10px;">Tăng <a style="color:red">${allCharacter[i].dameCrit}% sát thương chí mạng</a> sau mỗi vòng đấu (hiện tại: ${typeGameConquest.dameCritB}%)</span>`;
                }
            }
        }

        let pointRankIndex = ""
        if (infoStartGame.typeGame === "Conquest") {
            pointRankIndex = pointRank.typeGameConquest
        } else if (infoStartGame.typeGame === "Solo5Mon") {
            pointRankIndex = pointRank.typeGameSolo5Mon
        } else if (infoStartGame.typeGame === "Guess") {
            pointRankIndex = pointRank.typeGameGuess
        }

        name = `<span style="display: flex; justify-content: space-between; flex-direction: row; align-items: center;">
            <a>${nameUser}</a>
            <a style="font-size:11px;">[Điểm xếp hạng: ${pointRankIndex}]<span style="color: red;"> [Top: 1]</span></a>
        </span>
        <span style="color: #4504b3; font-weight: bold; font-size: 12px;">[Vòng đấu hiện tại: <span style="color: red;">${infoStartGame.roundGame}</span>] [Điểm cả trận: <span style="color: red;">${typeGameConquest.pointBattle} điểm</span>]</span>
        <span style="color: #4504b3; font-weight: bold; font-size: 12px;">
        [Nếu thắng: <span style="color: red;">+${((1 * infoStartGame.roundGame) + infoStartGame.winStreak) * modeGamePoint} điểm</span>]
        [Nếu thua: <span style="color: red;">-${1 * infoStartGame.roundGame} điểm</span>]</span>`;
        desc2 += `<a style="font-size:11px;">(Điểm cả trận chỉ được cộng vào điểm xếp hạng khi bạn thoát trận đấu)</a>`;  // Nối thêm nội dung vào desc2
        //+++
    } else if (type === "comp") {
        for (let i = 0; i < allCharacter.length; i++) {
            if (allCharacter[i].id === typeGameConquest.selectCharacterComp) {
                if (allCharacter[i].hpMax > 0) {
                    desc1 += `<span style="font-size:10px;">Tăng <a style="color:green">10Hp</a> sau mỗi vòng đấu</span>`;
                }
                if (allCharacter[i].upDame > 0) {
                    desc1 += `<span style="font-size:10px;">Tăng <a style="color:red">${allCharacter[i].upDame} sát thương</a> cho tất cả 5mon sau mỗi vòng đấu</span>`;
                }
                if (allCharacter[i].upHeal > 0) {
                    desc1 += `<span style="font-size:10px;">Tăng <a style="color:lime">${allCharacter[i].upHeal} chỉ số hồi Hp</a> cho tất cả 5mon sau mỗi vòng đấu</span>`;
                }
                if (allCharacter[i].upShield > 0) {
                    desc1 += `<span style="font-size:10px;">Tăng <a style="color:blue">${allCharacter[i].upShield} chỉ số tạo giáp</a> cho tất cả 5mon sau mỗi vòng đấu</span>`;
                }
                if (allCharacter[i].upBurn > 0) {
                    desc1 += `<span style="font-size:10px;">Tăng <a style="color:orange">${allCharacter[i].upBurn} sát thương đốt</a> cho tất cả 5mon sau mỗi vòng đấu</span>`;
                }
                if (allCharacter[i].upPoison > 0) {
                    desc1 += `<span style="font-size:10px;">Tăng <a style="color:purple">${allCharacter[i].upPoison} gây độc</a> cho tất cả 5mon sau mỗi vòng đấu</span>`;
                }
                if (allCharacter[i].upCrit > 0) {
                    desc1 += `<span style="font-size:10px;">Tăng <a style="color:red">${allCharacter[i].upCrit} chỉ số chí mạng</a> 5mon sau mỗi vòng đấu</span>`;
                }
                if (allCharacter[i].upMulti > 0) {
                    desc1 += `<span style="font-size:10px;">Tăng <a style="color:purple">${allCharacter[i].upMulti} liên kích</a> cho một 5mon sau mỗi 3 vòng đấu</span>`;
                }
                if (allCharacter[i].upCooldown > 0) {
                    desc1 += `<span style="font-size:10px;">Tăng <a style="color:blue">${allCharacter[i].upCooldown / 1000}s tốc độ</a> của bản thân sau mỗi vòng đấu (hiện tại: ${typeGameConquest.upCooldownA / 1000}s)</span>`;
                }
                if (allCharacter[i].slow > 0) {
                    desc1 += `<span style="font-size:10px;">Giảm <a style="color:blue">${allCharacter[i].slow / 1000}s tốc độ</a> của đối thủ sau mỗi vòng đấu (hiện tại: ${typeGameConquest.slowA / 1000}s)</span>`;
                }
                if (allCharacter[i].dameCrit > 0) {
                    desc1 += `<span style="font-size:10px;">Tăng <a style="color:red">${allCharacter[i].dameCrit}% sát thương chí mạng</a> sau mỗi vòng đấu (hiện tại: ${typeGameConquest.dameCritA}%)</span>`;
                }
            }
        }
        name = `<span style="display: flex; justify-content: space-between; flex-direction: row;">
            <a>${typeGameConquest.nameComp}</a>
            <a style="font-size:11px;">[Điểm xếp hạng: ${pointRankComp}]<span style="color: red;"> [Rank: 1]</span></a>
        </span>
        <span style="color: #4504b3; font-weight: bold; font-size: 12px;">[Vòng đấu hiện tại: <span style="color: red;">${infoStartGame.roundGame}</span>]</span>
        <span style="color: #4504b3; font-weight: bold; font-size: 12px;">[Nếu thắng: <span style="color: red;">+${((1 * infoStartGame.roundGame) + infoStartGame.winStreak) * modeGamePoint} điểm</span>]
        [Nếu thua: <span style="color: red;">-${1 * infoStartGame.roundGame} điểm</span>]</span>`;

        desc2 += `<a style="font-size:9px;">(Điểm cả trận chỉ được cộng vào điểm xếp hạng khi bạn thoát trận đấu)</a>`;  // Nối thêm nội dung vào desc2
    }


    // Cập nhật thông tin vào popup
    nameElement.innerHTML = name;
    desc1Element.innerHTML = desc1;
    desc2Element.innerHTML = desc2;

    // Tính toán vị trí popup
    const rect = element.getBoundingClientRect();

    // Tạm thời hiển thị popup để lấy chiều cao chính xác
    popup.style.display = 'flex';

    // Lấy chiều cao của popup sau khi nó đã được hiển thị
    const popupHeight = popup.offsetHeight; // hoặc popup.clientHeight

    // Đặt vị trí popup dựa trên element được click
    if (type === "user") {
        // Nếu click vào User, hiển thị trên ảnh người chơi
        popup.style.top = rect.top - popupHeight - 10 + "px";  // Đặt trên element
        popup.style.left = rect.left + "px";  // Đặt bên trái của element
    } else if (type === "comp") {
        // Nếu click vào Comp, hiển thị dưới ảnh đối thủ
        popup.style.top = rect.bottom + 10 + "px";  // Đặt dưới element
        popup.style.left = rect.left + "px";  // Đặt bên trái của element
    }

    // Sau khi tính toán xong, ẩn popup trở lại (để không làm ảnh hưởng layout)
    popup.style.display = 'none';

    // Nếu popup đã hiển thị, đóng nó
    if (popupVisible) {
        popup.style.display = "none";
        popupVisible = false; // Đặt trạng thái popup về false
    } else {
        // Nếu popup chưa hiển thị, hiển thị nó
        popup.style.display = "flex";
        popupVisible = true; // Đặt trạng thái popup về true
    }
}

// Lắng nghe sự kiện click trên các thẻ
document.getElementById("imageContainerUser").addEventListener("click", function (event) {
    showPopupInfo(this, "user");  // Hiển thị thông tin cho người chơi
    event.stopPropagation(); // Ngừng sự kiện truyền lên parent để tránh đóng popup khi click vào các phần tử con
});

document.getElementById("imageContainerComp").addEventListener("click", function (event) {
    showPopupInfo(this, "comp");  // Hiển thị thông tin cho đối thủ
    event.stopPropagation(); // Ngừng sự kiện truyền lên parent để tránh đóng popup khi click vào các phần tử con
});

// Lắng nghe sự kiện click bất kỳ để đóng popup
document.addEventListener('click', function () {
    const popup = document.getElementById('popupInfoMyOrComp');
    if (popup.style.display === 'flex') {
        popup.style.display = 'none';
    }
});

// Lắng nghe sự kiện click toàn bộ trang để ẩn popup khi click ở bất kỳ đâu ngoài popup
document.addEventListener('click', function () {
    const popup = document.getElementById('popupSTT');
    if (popup.style.display === 'flex') {
        popup.style.display = 'none';
    }
});

//Tạo hiệu ứng skill theo level
function highlightSkillLevel() {
    document.querySelectorAll('.skill').forEach(skillElement => {
        let skillData;
        let skillKey = skillElement.parentElement.id;

        console.log("skillKey là ", skillKey)

        if (skillElement.parentElement.parentElement.id === 'battleShop') {

        }

        if (skillElement.parentElement.parentElement.id === 'battleInventory') {
            skillData = typeGameConquest.battlePetInInventory[skillKey];
        }

        if (skillElement.parentElement.parentElement.id === 'skillBarB') {
            skillData = typeGameConquest.skillBattle[skillKey];
        }

        console.log("skillData là ", skillData)

        // Nếu không tìm được dữ liệu => bỏ qua
        if (!skillData) return;

        // Tìm div con có class levelSkillText và starSkillText
        const levelTextDiv = skillElement.querySelector('.levelSkillText');
        const starTextDiv = skillElement.querySelector('.starSkillText');

        levelTextDiv.innerText = skillData.LEVEL;
        starTextDiv.innerText = skillData.PRICESELL + skillData.PRICE; // Ưu tiên PRICESELL nếu có

        // Tô màu theo level
        const levelSkillColorDiv = skillElement.querySelector('.levelSkillColor');

        if (levelSkillColorDiv) {
            switch (skillData.LEVEL) {
                case 1:
                    levelSkillColorDiv.style.color = "#531515";
                    break;
                case 2:
                    levelSkillColorDiv.style.color = "#8c0b0b";
                    break;
                case 3:
                    levelSkillColorDiv.style.color = "#c00d0d";
                    break;
                case 4:
                    levelSkillColorDiv.style.color = "red";
                    break;
            }
        }
    });
}

//Hàm kiểm tra các thẻ trong battle có thể update level được không
function checkUpdateLevel() {
    const allSkillDivs = document.querySelectorAll('.skill');

    // 🔁 RESET: Xoá tất cả hiệu ứng cũ và icon nâng cấp
    document.querySelectorAll('.updateSkillLevel').forEach(div => {
        div.classList.remove('updateSkillLevel');
    });

    document.querySelectorAll('.upgrade-icon').forEach(icon => {
        icon.remove();
    });

    // 🧭 Nguồn dữ liệu
    let allSources = [
        { dom: document.getElementById('skillBarB'), data: typeGameConquest.battlePetUseSlotRound },
        { dom: document.getElementById('battleInventory'), data: typeGameConquest.battlePetInInventory },
        { dom: document.getElementById('battleShop'), data: typeGameConquest.battlePetInShop }
    ];

    if (infoStartGame.stepGame > 1) {
        allSources = [
            { dom: document.getElementById('skillBarB'), data: typeGameConquest.battlePetUseSlotRound },
            { dom: document.getElementById('battleInventory'), data: typeGameConquest.battlePetInInventory },
        ];
    } else {
        allSources = [
            { dom: document.getElementById('skillBarB'), data: typeGameConquest.battlePetUseSlotRound },
            { dom: document.getElementById('battleInventory'), data: typeGameConquest.battlePetInInventory },
            { dom: document.getElementById('battleShop'), data: typeGameConquest.battlePetInShop }
        ];
    }


    allSkillDivs.forEach(skillDiv => {
        const parentWithId = skillDiv.parentElement;
        const thisSkill = skillDiv
        if (!parentWithId) return;
        const parentId = parentWithId.id;

        // Tìm nguồn chứa skill này
        let currentData = null;
        for (const source of allSources) {
            if (source.dom.contains(skillDiv)) {
                currentData = source.data;
                break;
            }
        }

        if (!currentData || !currentData[parentId]) return;

        const currentSkill = currentData[parentId];
        if (!currentSkill || currentSkill.ID === "") return;

        // So sánh với tất cả nguồn còn lại
        for (const otherSource of allSources) {

            for (const [otherKey, otherSkill] of Object.entries(otherSource.data)) {
                if (!otherSkill || otherSkill.ID === "") continue;

                //Bỏ qua chính mình
                if (currentData === otherSource.data && parentId === otherKey) continue;

                if (
                    otherSkill.ID === currentSkill.ID &&
                    otherSkill.LEVEL === currentSkill.LEVEL &&
                    otherSkill !== currentSkill
                ) {

                    // ✅ Thêm hiệu ứng vào div cha
                    thisSkill.classList.add('updateSkillLevel');

                    if (!parentWithId.querySelector('.upgrade-icon')) {
                        const upgradeIcon = document.createElement('span');
                        upgradeIcon.className = 'upgrade-icon';
                        upgradeIcon.textContent = '^';
                        parentWithId.appendChild(upgradeIcon);
                    }
                }
            }
        }
    });
}


//Load event cho skill
function loadEventSkillBattle() {
    const skills = document.querySelectorAll(".skill");
    const slots = document.querySelectorAll(".slotSkill");
    const shopSell = document.getElementById("shopSell"); // ID của vùng bán skill

    let dragImage; // Khai báo dragImage ở phạm vi rộng hơn

    skills.forEach(skill => {
        skill.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", skill.id);
            skill.classList.add("dragging");

            // Tạo drag image tạm thời
            dragImage = skill.cloneNode(true); // Sao chép phần tử skill
            dragImage.style.position = "absolute";
            dragImage.style.top = "-9999px"; // Đẩy ra khỏi màn hình
            dragImage.style.left = "-9999px";
            dragImage.style.width = "80px";
            dragImage.style.height = "105px";
            dragImage.style.opacity = "1"; // Làm mờ hình ảnh kéo


            document.body.appendChild(dragImage); // Thêm vào body để tránh ảnh hưởng bố cục

            // Gán drag image vào sự kiện
            e.dataTransfer.setDragImage(dragImage, skill.offsetWidth / 2, skill.offsetHeight / 2);

            const popup = document.getElementById('popupSTT');
            popup.style.display = 'none';

            // slots.forEach(slot => {
            //   if (!slot.classList.contains("occupied")) {
            //     slot.classList.add("highlight");
            //   }
            // });

            if (skill.parentElement.parentElement.id !== "battleShop") {
                shopSell.style.background = "#fd1239"
            }

            //Tạo highligt nâng cấp
            if (skill.parentElement.parentElement.id === "battleShop") { // Nằm trong shop
                // Phát sáng ở trong tủ đồ
                for (let o in typeGameConquest.battlePetInInventory) {
                    let element = document.getElementById(o); // Tìm phần tử với ID là o
                    if (element && o !== skill.parentElement.id) {
                        if (
                            typeGameConquest.battlePetInShop[skill.parentElement.id].ID === typeGameConquest.battlePetInInventory[o].ID &&
                            typeGameConquest.battlePetInShop[skill.parentElement.id].LEVEL === typeGameConquest.battlePetInInventory[o].LEVEL
                            && typeGameConquest.battlePetInInventory[o].LEVEL < 4) {
                            element.classList.add("updateSkill");
                        } else if (!element.classList.contains("occupied")) {
                            element.classList.add("highlight");
                        }
                    }
                }
                // //Phát sáng ở trong slot
                for (let o in typeGameConquest.battlePetUseSlotRound) {
                    let element = document.getElementById(o); // Tìm phần tử với ID là o
                    if (element && o !== skill.parentElement.id) {
                        if (
                            typeGameConquest.battlePetInShop[skill.parentElement.id].ID === typeGameConquest.battlePetUseSlotRound[o].ID &&
                            typeGameConquest.battlePetInShop[skill.parentElement.id].LEVEL === typeGameConquest.battlePetUseSlotRound[o].LEVEL
                            && typeGameConquest.battlePetUseSlotRound[o].LEVEL < 4) {
                            element.classList.add("updateSkill");
                        } else if (!element.classList.contains("occupied")) {
                            element.classList.add("highlight");
                        }
                    }
                }
            } else if (skill.parentElement.parentElement.id === "battleInventory") { //Nằm trong tủ đồ
                //Phát sáng ở trong tủ đồ 
                for (let o in typeGameConquest.battlePetInInventory) {
                    let element = document.getElementById(o); // Tìm phần tử với ID là o
                    if (element && o !== skill.parentElement.id) {
                        if (
                            typeGameConquest.battlePetInInventory[skill.parentElement.id].ID === typeGameConquest.battlePetInInventory[o].ID &&
                            typeGameConquest.battlePetInInventory[skill.parentElement.id].LEVEL === typeGameConquest.battlePetInInventory[o].LEVEL
                            && typeGameConquest.battlePetInInventory[o].LEVEL < 4) {
                            element.classList.add("updateSkill");
                        } else if (!element.classList.contains("occupied")) {
                            element.classList.add("highlight");
                        }
                    }
                }
                // //Phát sáng ở trong slot
                for (let o in typeGameConquest.battlePetUseSlotRound) {
                    let element = document.getElementById(o); // Tìm phần tử với ID là o
                    if (element && o !== skill.parentElement.id) {
                        if (
                            typeGameConquest.battlePetInInventory[skill.parentElement.id].ID === typeGameConquest.battlePetUseSlotRound[o].ID &&
                            typeGameConquest.battlePetInInventory[skill.parentElement.id].LEVEL === typeGameConquest.battlePetUseSlotRound[o].LEVEL
                            && typeGameConquest.battlePetUseSlotRound[o].LEVEL < 4) {
                            element.classList.add("updateSkill");
                        } else if (!element.classList.contains("occupied")) {
                            element.classList.add("highlight");
                        }
                    }
                }


            } else if (skill.parentElement.parentElement.id === "skillBarB") {//Nằm trong slotskill
                //Phát sáng ở trong tủ đồ 
                for (let o in typeGameConquest.battlePetInInventory) {
                    let element = document.getElementById(o); // Tìm phần tử với ID là o
                    if (element && o !== skill.parentElement.id) {
                        if (
                            typeGameConquest.battlePetUseSlotRound[skill.parentElement.id].ID === typeGameConquest.battlePetInInventory[o].ID &&
                            typeGameConquest.battlePetUseSlotRound[skill.parentElement.id].LEVEL === typeGameConquest.battlePetInInventory[o].LEVEL
                            && typeGameConquest.battlePetInInventory[o].LEVEL < 4) {
                            element.classList.add("updateSkill");
                        } else if (!element.classList.contains("occupied")) {
                            element.classList.add("highlight");
                        }
                    }
                }
                // //Phát sáng ở trong slot
                for (let o in typeGameConquest.battlePetUseSlotRound) {
                    let element = document.getElementById(o); // Tìm phần tử với ID là o
                    if (element && o !== skill.parentElement.id) {
                        if (
                            typeGameConquest.battlePetUseSlotRound[skill.parentElement.id].ID === typeGameConquest.battlePetUseSlotRound[o].ID &&
                            typeGameConquest.battlePetUseSlotRound[skill.parentElement.id].LEVEL === typeGameConquest.battlePetUseSlotRound[o].LEVEL
                            && typeGameConquest.battlePetUseSlotRound[o].LEVEL < 4) {
                            element.classList.add("updateSkill");
                        } else if (!element.classList.contains("occupied")) {
                            element.classList.add("highlight");
                        }
                    }
                }
            }

        });

        skill.addEventListener("dragend", () => {
            // Xóa drag image khỏi DOM
            if (dragImage) {
                document.body.removeChild(dragImage);
                dragImage = null; // Reset biến để tránh lỗi
            }
            skill.classList.remove("dragging");
            slots.forEach(slot => slot.classList.remove("highlight"));
            slots.forEach(slot => slot.classList.remove("updateSkill"));
            shopSell.style.background = "#f86e85"
        });
    });
}

//Load event cho các slot trong game
function loadEventSlotBattle() {
    const slots = document.querySelectorAll(".slotSkill");
    const shopSell = document.getElementById("shopSell"); // ID của vùng bán skill

    //Sự kiện kéo skill vào slot skill
    const allSlotSkillsB = [
        ...document.querySelectorAll("#skill1B"),
        ...document.querySelectorAll("#skill2B"),
        ...document.querySelectorAll("#skill3B"),
        ...document.querySelectorAll("#skill4B"),
        ...document.querySelectorAll("#skill5B"),
        ...document.querySelectorAll("#skill6B"),
        ...document.querySelectorAll("#skill7B"),
        ...document.querySelectorAll("#skill8B"),
        ...document.querySelectorAll("#skill9B"),
    ];

    // Sử dụng forEach trên tất cả các phần tử đã gộp
    allSlotSkillsB.forEach(slot => {
        slot.addEventListener("dragover", (e) => {
            e.preventDefault(); // Cho phép kéo vào
        });

        slot.addEventListener("dragenter", () => {
            if (!slot.classList.contains("occupied")) {
                slot.style.backgroundColor = "#e8f5e9"; // Làm nổi bật slot
            }
        });

        slot.addEventListener("dragleave", () => {
            if (!slot.classList.contains("occupied")) {
                slot.style.backgroundColor = ""; // Đặt lại màu nền khi rời khỏi slot
            }
        });


        slot.addEventListener("drop", (e) => {
            e.preventDefault();
            const skillId = e.dataTransfer.getData("text/plain");
            let skill = document.getElementById(skillId);


            const parentSlot = skill.parentElement;
            //Lấy thông tin của skill target để nâng cấp

            // Kiểm tra nếu skill được kéo và thả lại đúng slot cũ
            if (slot === parentSlot) {
                return;
            }

            // Kéo từ shop xuống
            if (parentSlot.parentElement.id == "battleShop") {
                //Kiểm tra nếu không đủ star
                if (typeGameConquest.starUser < typeGameConquest.battlePetInShop[skill.parentElement.id].PRICE) {
                    messageOpen(`Không đủ <i class="fa-solid fa-splotch"></i>, cần có ${typeGameConquest.battlePetInShop[skill.parentElement.id].PRICE} <i class="fa-solid fa-splotch"></i>`)
                    slot.style.backgroundColor = ""
                    return;
                }

                if (slot.classList.contains("occupied")) { // Kiểm tra slot có skill chưa
                    //Kiểm tra xem có phải là đá cường hóa không
                    if (typeGameConquest.battlePetInShop[skill.parentElement.id].EFFECT.includes("stoneUpMulti")) {
                        typeGameConquest.battlePetUseSlotRound[slot.id].COOLDOWN[2] += 1
                        typeGameConquest.battlePetUseSlotRound[slot.id].PRICESELL += typeGameConquest.battlePetInShop[skill.parentElement.id].PRICE
                        typeGameConquest.skillBattle[slot.id].PRICESELL = typeGameConquest.battlePetUseSlotRound[slot.id].PRICESELL

                        typeGameConquest.starUser -= typeGameConquest.battlePetInShop[skill.parentElement.id].PRICE

                        // Xóa kỹ năng khỏi battlePetInShop
                        typeGameConquest.battlePetInShop[skill.parentElement.id] = defaultSTT5Mon;
                        let index = skill.parentElement.id.match(/\d+$/)?.[0]; // lấy số ở cuối skill.parentElement.id
                        let skillLock = `LockBattleShop${index}`;
                        LockBattleShop[skillLock] = false;
                        document.getElementById(skillLock).style.color = 'rgb(255 161 115)'

                        // Xóa kỹ năng html shop (div skill Shop)
                        skill.remove();
                        skill = null;

                        //Nâng data-skill LEVEL lên để tạo highlight
                        const skillDiv = slot.querySelector(".skill"); // Lấy div skill con
                        if (skillDiv) {
                            const skillData = JSON.parse(skillDiv.dataset.skill); // Lấy data-skill
                            skillData.LEVEL += 1; // Tăng LEVEL lên
                            skillDiv.dataset.skill = JSON.stringify(skillData); // Cập nhật lại data-skill

                        }
                        highlightSkillLevel();
                        resetMaxHpBattle();
                        updateSttForSkillAffter();
                        checkUpdateLevel();

                        typeGameConquest.selectSkillShop += 1
                        document.getElementById("starUser").innerText = typeGameConquest.starUser;
                    } else if (
                        (typeGameConquest.battlePetInShop[skill.parentElement.id].ID === typeGameConquest.skillBattle[slot.id].ID 
                        && Number(typeGameConquest.battlePetInShop[skill.parentElement.id].LEVEL) === Number(typeGameConquest.skillBattle[slot.id].LEVEL) 
                        && Number(typeGameConquest.skillBattle[slot.id].LEVEL) < 4)
                        ||
                        typeGameConquest.battlePetInShop[skill.parentElement.id].EFFECT.includes("stoneUpLevel")
                        ) {

                        //Nâng cấp
                        typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL += 1
                        
                        typeGameConquest.battlePetUseSlotRound[slot.id].POWER.STR += Math.round(50 * typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL * typeGameConquest.battlePetUseSlotRound[slot.id].LVUPSCALE.STR)
                        typeGameConquest.battlePetUseSlotRound[slot.id].POWER.DEF += Math.round(50 * typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL * typeGameConquest.battlePetUseSlotRound[slot.id].LVUPSCALE.DEF)
                        typeGameConquest.battlePetUseSlotRound[slot.id].POWER.INT += Math.round(50 * typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL * typeGameConquest.battlePetUseSlotRound[slot.id].LVUPSCALE.INT)
                        typeGameConquest.battlePetUseSlotRound[slot.id].POWER.AGI += Math.round(50 * typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL * typeGameConquest.battlePetUseSlotRound[slot.id].LVUPSCALE.AGI)
                        typeGameConquest.battlePetUseSlotRound[slot.id].POWER.LUK += Math.round(50 * typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL * typeGameConquest.battlePetUseSlotRound[slot.id].LVUPSCALE.LUK)
                        typeGameConquest.battlePetUseSlotRound[slot.id].POWER.HP += Math.round(50 * typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL * typeGameConquest.battlePetUseSlotRound[slot.id].LVUPSCALE.HP)
                        
                        let power5MonUpdate = update5MonBattle(typeGameConquest.battlePetUseSlotRound[slot.id])

                        typeGameConquest.battlePetUseSlotRound[slot.id].DAME[0] = power5MonUpdate.dame
                        typeGameConquest.battlePetUseSlotRound[slot.id].DEF[0] = power5MonUpdate.def
                        typeGameConquest.battlePetUseSlotRound[slot.id].HEAL[0] = power5MonUpdate.heal
                        typeGameConquest.battlePetUseSlotRound[slot.id].SHIELD[0] = power5MonUpdate.shield
                        typeGameConquest.battlePetUseSlotRound[slot.id].BURN[0] = power5MonUpdate.burn
                        typeGameConquest.battlePetUseSlotRound[slot.id].POISON[0] = power5MonUpdate.poison
                        typeGameConquest.battlePetUseSlotRound[slot.id].CRIT[0] = power5MonUpdate.crit
                        typeGameConquest.battlePetUseSlotRound[slot.id].COOLDOWN[0] = power5MonUpdate.cooldown
                        typeGameConquest.skillBattle[slot.id].LEVEL = typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL
                        typeGameConquest.skillBattle[slot.id].DAME[0] = typeGameConquest.battlePetUseSlotRound[slot.id].DAME[0]
                        typeGameConquest.skillBattle[slot.id].DEF[0] = typeGameConquest.battlePetUseSlotRound[slot.id].DEF[0]
                        typeGameConquest.skillBattle[slot.id].HEAL[0] = typeGameConquest.battlePetUseSlotRound[slot.id].HEAL[0]
                        typeGameConquest.skillBattle[slot.id].SHIELD[0] = typeGameConquest.battlePetUseSlotRound[slot.id].SHIELD[0]
                        typeGameConquest.skillBattle[slot.id].BURN[0] = typeGameConquest.battlePetUseSlotRound[slot.id].BURN[0]
                        typeGameConquest.skillBattle[slot.id].POISON[0] = typeGameConquest.battlePetUseSlotRound[slot.id].POISON[0]
                        typeGameConquest.skillBattle[slot.id].CRIT[0] = typeGameConquest.battlePetUseSlotRound[slot.id].CRIT[0]
                        typeGameConquest.skillBattle[slot.id].COOLDOWN[0] = typeGameConquest.battlePetUseSlotRound[slot.id].COOLDOWN[0]

                        typeGameConquest.battlePetUseSlotRound[slot.id].PRICESELL += typeGameConquest.battlePetInShop[skill.parentElement.id].PRICE
                        typeGameConquest.skillBattle[slot.id].PRICESELL = typeGameConquest.battlePetUseSlotRound[slot.id].PRICESELL

                        typeGameConquest.starUser -= typeGameConquest.battlePetInShop[skill.parentElement.id].PRICE

                        // Xóa kỹ năng khỏi battlePetInShop
                        typeGameConquest.battlePetInShop[skill.parentElement.id] = defaultSTT5Mon;
                        let index = skill.parentElement.id.match(/\d+$/)?.[0]; // lấy số ở cuối skill.parentElement.id
                        let skillLock = `LockBattleShop${index}`;
                        LockBattleShop[skillLock] = false;
                        document.getElementById(skillLock).style.color = 'rgb(255 161 115)'

                        // Xóa kỹ năng html shop (div skill Shop)
                        skill.remove();
                        skill = null;

                        //Nâng data-skill LEVEL lên để tạo highlight
                        const skillDiv = slot.querySelector(".skill"); // Lấy div skill con
                        if (skillDiv) {
                            const skillData = JSON.parse(skillDiv.dataset.skill); // Lấy data-skill
                            skillData.LEVEL += 1; // Tăng LEVEL lên
                            skillDiv.dataset.skill = JSON.stringify(skillData); // Cập nhật lại data-skill

                        }
                        highlightSkillLevel();
                        resetMaxHpBattle();
                        updateSttForSkillAffter();
                        checkUpdateLevel();

                        typeGameConquest.selectSkillShop += 1
                        document.getElementById("starUser").innerText = typeGameConquest.starUser;
                    } else {

                    }

                } else {

                    if (typeGameConquest.battlePetInShop[skill.parentElement.id].ID.startsWith("S")) {
                        //Nếu là đá cường hóa
                        return;
                    }

                    // Lấy ID của pet chuẩn bị thêm vào
                    const newPetID = typeGameConquest.battlePetInShop[skill.parentElement.id].ID;

                    // Kiểm tra xem đã tồn tại pet có cùng ID trong skillBattle chưa
                    let isDuplicate = false;

                    //Kiểm tra slot 1 -> 9 xem đã có pet nào trùng ID chưa
                    for (const key of Object.keys(typeGameConquest.skillBattle)) {
                        if (key.endsWith("B") && typeGameConquest.skillBattle[key].ID === newPetID) {
                            isDuplicate = true;
                            break;
                        }
                    }

                    // Nếu không bị trùng ID thì cho thêm
                    if (!isDuplicate) {
                        typeGameConquest.starUser -= typeGameConquest.battlePetInShop[skill.parentElement.id].PRICE
                        typeGameConquest.battlePetUseSlotRound[slot.id] = typeGameConquest.battlePetInShop[skill.parentElement.id];
                        typeGameConquest.battlePetUseSlotRound[slot.id].PRICE = 0
                        
                        typeGameConquest.skillBattle[slot.id] = typeGameConquest.battlePetUseSlotRound[slot.id]

                        typeGameConquest.battlePetInShop[skill.parentElement.id] = defaultSTT5Mon;
                        let index = skill.parentElement.id.match(/\d+$/)?.[0]; // lấy số ở cuối skill.parentElement.id
                        let skillLock = `LockBattleShop${index}`;
                        LockBattleShop[skillLock] = false;
                        document.getElementById(skillLock).style.color = 'rgb(255 161 115)'

                        slot.prepend(skill);
                        slot.classList.add("occupied");
                        slot.style.backgroundColor = "";
                        highlightSkillLevel();
                        resetMaxHpBattle();
                        updateSttForSkillAffter();
                        checkUpdateLevel();

                        typeGameConquest.selectSkillShop += 1;
                        document.getElementById("starUser").innerText = typeGameConquest.starUser;
                    } else {
                        // Nếu trùng thì chỉ reset màu slot
                        slot.style.backgroundColor = "";
                    }
                }
            } else if (parentSlot.parentElement.id == "battleInventory") {//Kéo từ tủ đồ xuống
                console.log("Kéo từ tủ đồ 1")
                if (slot.classList.contains("occupied")) { // Kiểm tra slot có skill chưa
                    if (typeGameConquest.battlePetInInventory[skill.parentElement.id].EFFECT.includes("stoneUpMulti")) {
                        typeGameConquest.battlePetUseSlotRound[slot.id].COOLDOWN[2] += 1
                        typeGameConquest.battlePetUseSlotRound[slot.id].PRICESELL += typeGameConquest.battlePetInShop[skill.parentElement.id].PRICE
                        typeGameConquest.skillBattle[slot.id].PRICESELL = typeGameConquest.battlePetUseSlotRound[slot.id].PRICESELL

                        typeGameConquest.starUser -= typeGameConquest.battlePetInInventory[skill.parentElement.id].PRICE

                        // Xóa kỹ năng khỏi battlePetInInventory
                        typeGameConquest.battlePetInInventory[skill.parentElement.id] = defaultSTT5Mon;

                        //Chuyển slot cũ thành trống
                        parentSlot.classList.remove("occupied")

                        // Xóa kỹ năng html shop (div skill Shop)
                        skill.remove();
                        skill = null;

                        const skillDiv = slot.querySelector(".skill"); // Lấy div skill con
                        if (skillDiv) {
                            const skillData = JSON.parse(skillDiv.dataset.skill); // Lấy data-skill
                            skillData.LEVEL += 1; // Tăng LEVEL lên
                            skillDiv.dataset.skill = JSON.stringify(skillData); // Cập nhật lại data-skill

                        }
                        highlightSkillLevel();
                        resetMaxHpBattle();
                        updateSttForSkillAffter();
                        checkUpdateLevel();
                    } else if (
                        (typeGameConquest.battlePetInInventory[skill.parentElement.id].ID === typeGameConquest.skillBattle[slot.id].ID && 
                        Number(typeGameConquest.battlePetInInventory[skill.parentElement.id].LEVEL) === Number(typeGameConquest.skillBattle[slot.id].LEVEL) && 
                        Number(typeGameConquest.skillBattle[slot.id].LEVEL) < 4)
                        ||
                        typeGameConquest.battlePetInInventory[skill.parentElement.id].EFFECT.includes("stoneUpLevel")
                        ) {
                        console.log("Kéo từ tủ đồ 2 - nâng cấp")

                        //Nâng cấp
                        typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL += 1
                        typeGameConquest.battlePetUseSlotRound[slot.id].POWER.STR += Math.round(50 * typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL * typeGameConquest.battlePetUseSlotRound[slot.id].LVUPSCALE.STR)
                        typeGameConquest.battlePetUseSlotRound[slot.id].POWER.DEF += Math.round(50 * typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL * typeGameConquest.battlePetUseSlotRound[slot.id].LVUPSCALE.DEF)
                        typeGameConquest.battlePetUseSlotRound[slot.id].POWER.INT += Math.round(50 * typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL * typeGameConquest.battlePetUseSlotRound[slot.id].LVUPSCALE.INT)
                        typeGameConquest.battlePetUseSlotRound[slot.id].POWER.AGI += Math.round(50 * typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL * typeGameConquest.battlePetUseSlotRound[slot.id].LVUPSCALE.AGI)
                        typeGameConquest.battlePetUseSlotRound[slot.id].POWER.LUK += Math.round(50 * typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL * typeGameConquest.battlePetUseSlotRound[slot.id].LVUPSCALE.LUK)
                        typeGameConquest.battlePetUseSlotRound[slot.id].POWER.HP += Math.round(50 * typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL * typeGameConquest.battlePetUseSlotRound[slot.id].LVUPSCALE.HP)

                        let power5MonUpdate = update5MonBattle(typeGameConquest.battlePetUseSlotRound[slot.id])

                        typeGameConquest.battlePetUseSlotRound[slot.id].DAME[0] = power5MonUpdate.dame
                        typeGameConquest.battlePetUseSlotRound[slot.id].DEF[0] = power5MonUpdate.def
                        typeGameConquest.battlePetUseSlotRound[slot.id].HEAL[0] = power5MonUpdate.heal
                        typeGameConquest.battlePetUseSlotRound[slot.id].SHIELD[0] = power5MonUpdate.shield
                        typeGameConquest.battlePetUseSlotRound[slot.id].BURN[0] = power5MonUpdate.burn
                        typeGameConquest.battlePetUseSlotRound[slot.id].POISON[0] = power5MonUpdate.poison
                        typeGameConquest.battlePetUseSlotRound[slot.id].CRIT[0] = power5MonUpdate.crit
                        typeGameConquest.battlePetUseSlotRound[slot.id].COOLDOWN[0] = power5MonUpdate.cooldown
                        typeGameConquest.skillBattle[slot.id].LEVEL = typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL
                        typeGameConquest.skillBattle[slot.id].DAME[0] = typeGameConquest.battlePetUseSlotRound[slot.id].DAME[0]
                        typeGameConquest.skillBattle[slot.id].DEF[0] = typeGameConquest.battlePetUseSlotRound[slot.id].DEF[0]
                        typeGameConquest.skillBattle[slot.id].HEAL[0] = typeGameConquest.battlePetUseSlotRound[slot.id].HEAL[0]
                        typeGameConquest.skillBattle[slot.id].SHIELD[0] = typeGameConquest.battlePetUseSlotRound[slot.id].SHIELD[0]
                        typeGameConquest.skillBattle[slot.id].BURN[0] = typeGameConquest.battlePetUseSlotRound[slot.id].BURN[0]
                        typeGameConquest.skillBattle[slot.id].POISON[0] = typeGameConquest.battlePetUseSlotRound[slot.id].POISON[0]
                        typeGameConquest.skillBattle[slot.id].CRIT[0] = typeGameConquest.battlePetUseSlotRound[slot.id].CRIT[0]
                        typeGameConquest.skillBattle[slot.id].COOLDOWN[0] = typeGameConquest.battlePetUseSlotRound[slot.id].COOLDOWN[0]

                        if (typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL === 2) {
                            typeGameConquest.battlePetUseSlotRound[slot.id].PRICESELL += typeGameConquest.battlePetInInventory[skill.parentElement.id].PRICE
                        } else {
                            typeGameConquest.battlePetUseSlotRound[slot.id].PRICESELL += typeGameConquest.battlePetInInventory[skill.parentElement.id].PRICESELL + typeGameConquest.battlePetInInventory[skill.parentElement.id].PRICE
                        }
                        typeGameConquest.skillBattle[slot.id].PRICESELL = typeGameConquest.battlePetUseSlotRound[slot.id].PRICESELL

                        // Xóa kỹ năng khỏi battlePetInInventory
                        typeGameConquest.battlePetInInventory[skill.parentElement.id] = defaultSTT5Mon;

                        //Chuyển slot cũ thành trống
                        parentSlot.classList.remove("occupied")

                        // Xóa kỹ năng html shop (div skill Shop)
                        skill.remove();
                        skill = null;

                        const skillDiv = slot.querySelector(".skill"); // Lấy div skill con
                        if (skillDiv) {
                            const skillData = JSON.parse(skillDiv.dataset.skill); // Lấy data-skill
                            skillData.LEVEL += 1; // Tăng LEVEL lên
                            skillDiv.dataset.skill = JSON.stringify(skillData); // Cập nhật lại data-skill

                        }
                        highlightSkillLevel();
                        resetMaxHpBattle();
                        updateSttForSkillAffter();
                        checkUpdateLevel();

                    } else {
                        // Đổi chỗ dữ liệu trong typeGameConquest.skillBattle và battlePetInInventory 
                        const tempSkill = typeGameConquest.battlePetInInventory[skill.parentElement.id];
                        const targetSkill = typeGameConquest.skillBattle[slot.id];
                        // Kiểm tra xem skill này đã có trong skillBattle chưa (chỉ kiểm các key kết thúc bằng "B")
                        let existsInBattle = false;
                        for (const key in typeGameConquest.skillBattle) {
                            console.log()
                            if (key.endsWith("B") && typeGameConquest.skillBattle[key].ID === tempSkill.ID && key !== slot.id) {
                                existsInBattle = true;
                                break;
                            }
                        }

                        if (existsInBattle) {
                            console.warn("Skill đã tồn tại trong skillBattle, không thể hoán đổi.");
                            return; // Dừng thao tác đổi chỗ
                        } else {
                            typeGameConquest.battlePetInInventory[skill.parentElement.id] = targetSkill;
                            typeGameConquest.skillBattle[slot.id] = tempSkill;
                            typeGameConquest.battlePetUseSlotRound[slot.id] = typeGameConquest.skillBattle[slot.id]

                            // Đổi chỗ skill trong HTML
                            const currentSkill = slot.querySelector(".skill") // Skill hiện tại trong slot
                            const parentSkill = skill; // Skill từ parentSlot

                            if (currentSkill && parentSkill) {
                                const parentSlot = parentSkill.parentElement;
                                parentSlot.appendChild(currentSkill); // Đưa skill từ slot vào parentSlot
                                slot.appendChild(parentSkill); // Đưa skill từ parentSlot vào slot
                                console.warn("Đã hoán đổi 2.");
                            }
                            console.log("Kéo từ tủ đồ 5 - đổi chỗ", typeGameConquest.battlePetInInventory, typeGameConquest.skillBattle);
                            highlightSkillLevel();
                            resetMaxHpBattle();
                            updateSttForSkillAffter();
                            checkUpdateLevel();
                        }

                    }

                } else {
                    if (typeGameConquest.battlePetInInventory[skill.parentElement.id].ID.startsWith("S")) {
                        //Kiểm tra xem có phải đá nâng cấp không
                        return;
                    }
                    
                    console.log("Kéo từ tủ đồ 4")
                    // Lấy ID của pet chuẩn bị thêm vào
                    const newPetID = typeGameConquest.battlePetInInventory[skill.parentElement.id].ID;

                    // Kiểm tra xem đã tồn tại pet có cùng ID trong skillBattle chưa
                    let isDuplicate = false;

                    //Kiểm tra slot 1 -> 9 xem đã có pet nào trùng ID chưa
                    for (const key of Object.keys(typeGameConquest.skillBattle)) {
                        if (key.endsWith("B") && typeGameConquest.skillBattle[key].ID === newPetID) {
                            isDuplicate = true;
                            break;
                        }
                    }

                    // Nếu không bị trùng ID thì cho thêm
                    if (!isDuplicate) {
                        typeGameConquest.battlePetUseSlotRound[slot.id] = typeGameConquest.battlePetInInventory[skill.parentElement.id];
                        typeGameConquest.skillBattle[slot.id] = typeGameConquest.battlePetInInventory[skill.parentElement.id];

                        typeGameConquest.battlePetInInventory[skill.parentElement.id] = defaultSTT5Mon;
                        parentSlot.classList.remove("occupied")

                        slot.prepend(skill);

                        slot.classList.add("occupied");
                        slot.style.backgroundColor = "";
                        highlightSkillLevel();
                        resetMaxHpBattle();
                        updateSttForSkillAffter();
                        checkUpdateLevel();
                    } else {
                        // Nếu trùng thì chỉ reset màu slot
                        slot.style.backgroundColor = "";
                    }
                }

            } else if (parentSlot.parentElement.id == "skillBarB") {

                if (slot.classList.contains("occupied")) { // Kiểm tra slot có skill chưa

                    if (typeGameConquest.skillBattle[skill.parentElement.id].ID === typeGameConquest.skillBattle[slot.id].ID && Number(typeGameConquest.skillBattle[skill.parentElement.id].LEVEL) === Number(typeGameConquest.skillBattle[slot.id].LEVEL) && Number(typeGameConquest.skillBattle[slot.id].LEVEL) < 4) {

                        //Nâng cấp
                        typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL += 1
                        typeGameConquest.battlePetUseSlotRound[slot.id].POWER.STR += Math.round(50 * typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL * typeGameConquest.battlePetUseSlotRound[slot.id].LVUPSCALE.STR)
                        typeGameConquest.battlePetUseSlotRound[slot.id].POWER.DEF += Math.round(50 * typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL * typeGameConquest.battlePetUseSlotRound[slot.id].LVUPSCALE.DEF)
                        typeGameConquest.battlePetUseSlotRound[slot.id].POWER.INT += Math.round(50 * typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL * typeGameConquest.battlePetUseSlotRound[slot.id].LVUPSCALE.INT)
                        typeGameConquest.battlePetUseSlotRound[slot.id].POWER.AGI += Math.round(50 * typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL * typeGameConquest.battlePetUseSlotRound[slot.id].LVUPSCALE.AGI)
                        typeGameConquest.battlePetUseSlotRound[slot.id].POWER.LUK += Math.round(50 * typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL * typeGameConquest.battlePetUseSlotRound[slot.id].LVUPSCALE.LUK)
                        typeGameConquest.battlePetUseSlotRound[slot.id].POWER.HP += Math.round(50 * typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL * typeGameConquest.battlePetUseSlotRound[slot.id].LVUPSCALE.HP)
                        let power5MonUpdate = update5MonBattle(typeGameConquest.battlePetUseSlotRound[slot.id])

                        typeGameConquest.battlePetUseSlotRound[slot.id].DAME[0] = power5MonUpdate.dame
                        typeGameConquest.battlePetUseSlotRound[slot.id].DEF[0] = power5MonUpdate.def
                        typeGameConquest.battlePetUseSlotRound[slot.id].HEAL[0] = power5MonUpdate.heal
                        typeGameConquest.battlePetUseSlotRound[slot.id].SHIELD[0] = power5MonUpdate.shield
                        typeGameConquest.battlePetUseSlotRound[slot.id].BURN[0] = power5MonUpdate.burn
                        typeGameConquest.battlePetUseSlotRound[slot.id].POISON[0] = power5MonUpdate.poison
                        typeGameConquest.battlePetUseSlotRound[slot.id].CRIT[0] = power5MonUpdate.crit
                        typeGameConquest.battlePetUseSlotRound[slot.id].COOLDOWN[0] = power5MonUpdate.cooldown
                        typeGameConquest.skillBattle[slot.id].LEVEL = typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL
                        typeGameConquest.skillBattle[slot.id].DAME[0] = typeGameConquest.battlePetUseSlotRound[slot.id].DAME[0]
                        typeGameConquest.skillBattle[slot.id].DEF[0] = typeGameConquest.battlePetUseSlotRound[slot.id].DEF[0]
                        typeGameConquest.skillBattle[slot.id].HEAL[0] = typeGameConquest.battlePetUseSlotRound[slot.id].HEAL[0]
                        typeGameConquest.skillBattle[slot.id].SHIELD[0] = typeGameConquest.battlePetUseSlotRound[slot.id].SHIELD[0]
                        typeGameConquest.skillBattle[slot.id].BURN[0] = typeGameConquest.battlePetUseSlotRound[slot.id].BURN[0]
                        typeGameConquest.skillBattle[slot.id].POISON[0] = typeGameConquest.battlePetUseSlotRound[slot.id].POISON[0]
                        typeGameConquest.skillBattle[slot.id].CRIT[0] = typeGameConquest.battlePetUseSlotRound[slot.id].CRIT[0]
                        typeGameConquest.skillBattle[slot.id].COOLDOWN[0] = typeGameConquest.battlePetUseSlotRound[slot.id].COOLDOWN[0]

                        if (typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL === 2) {
                            typeGameConquest.battlePetUseSlotRound[slot.id].PRICESELL += typeGameConquest.skillBattle[skill.parentElement.id].PRICE
                        } else {
                            typeGameConquest.battlePetUseSlotRound[slot.id].PRICESELL += typeGameConquest.skillBattle[skill.parentElement.id].PRICESELL + typeGameConquest.skillBattle[skill.parentElement.id].PRICE
                        }
                        typeGameConquest.skillBattle[slot.id].PRICESELL = typeGameConquest.battlePetUseSlotRound[slot.id].PRICESELL

                        // Xóa kỹ năng khỏi typeGameConquest.skillBattle
                        typeGameConquest.skillBattle[skill.parentElement.id] = defaultSTT5Mon;
                        typeGameConquest.battlePetUseSlotRound[skill.parentElement.id] = defaultSTT5Mon; // Xóa kỹ năng khỏi battlePetUseSlotRound


                        //Chuyển slot cũ thành trống
                        parentSlot.classList.remove("occupied")

                        // Xóa kỹ năng html shop (div skill Shop)
                        skill.remove();
                        skill = null;

                        const skillDiv = slot.querySelector(".skill"); // Lấy div skill con
                        if (skillDiv) {
                            const skillData = JSON.parse(skillDiv.dataset.skill); // Lấy data-skill
                            skillData.LEVEL += 1; // Tăng LEVEL lên
                            skillDiv.dataset.skill = JSON.stringify(skillData); // Cập nhật lại data-skill

                        }
                        highlightSkillLevel();
                        resetMaxHpBattle();
                        updateSttForSkillAffter();
                        checkUpdateLevel();

                    } else {

                        // Đổi chỗ dữ liệu trong typeGameConquest.skillBattle và battlePetInInventory
                        const tempSkill1 = typeGameConquest.skillBattle[skill.parentElement.id];
                        const tempSkill2 = typeGameConquest.battlePetUseSlotRound[skill.parentElement.id];

                        typeGameConquest.skillBattle[skill.parentElement.id] = typeGameConquest.skillBattle[slot.id];
                        typeGameConquest.skillBattle[slot.id] = tempSkill1;

                        typeGameConquest.battlePetUseSlotRound[skill.parentElement.id] = typeGameConquest.battlePetUseSlotRound[slot.id];
                        typeGameConquest.battlePetUseSlotRound[slot.id] = tempSkill2;

                        // Đổi chỗ skill trong HTML
                        const currentSkill = slot.querySelector(".skill"); // Skill hiện tại trong slot
                        const parentSkill = skill; // Skill từ parentSlot

                        if (currentSkill && parentSkill) {
                            const parentSlot = parentSkill.parentElement;
                            parentSlot.appendChild(currentSkill); // Đưa skill từ slot vào parentSlot
                            slot.appendChild(parentSkill); // Đưa skill từ parentSlot vào slot
                        }
                        highlightSkillLevel();
                        resetMaxHpBattle();
                        updateSttForSkillAffter();
                        checkUpdateLevel();
                        console.log("Kéo từ tủ đồ 5 - đổi chỗ", typeGameConquest.battlePetInInventory, typeGameConquest.skillBattle);

                    }

                } else {


                    //Thêm skill vào battlePetUseSlotRound
                    typeGameConquest.battlePetUseSlotRound[slot.id] = typeGameConquest.skillBattle[skill.parentElement.id]


                    typeGameConquest.skillBattle[slot.id] = typeGameConquest.skillBattle[skill.parentElement.id]


                    typeGameConquest.skillBattle[skill.parentElement.id] = defaultSTT5Mon; // Xóa kỹ năng khỏi typeGameConquest.skillBattle
                    typeGameConquest.battlePetUseSlotRound[skill.parentElement.id] = defaultSTT5Mon; // Xóa kỹ năng khỏi battlePetUseSlotRound


                    //Chuyển slot cũ thành trống
                    parentSlot.classList.remove("occupied")

                    //Chuyển slot mới thành đầy
                    slot.prepend(skill);
                    slot.classList.add("occupied");
                    slot.style.backgroundColor = "";
                    highlightSkillLevel();
                    resetMaxHpBattle();
                    updateSttForSkillAffter();
                    checkUpdateLevel();
                }
            } else {
                slot.style.backgroundColor = "";
            }
            //Cập nhật chỉ số tăng từ bị động Internal [2]
            internalUp();
            resetHp5Mon();
            updateHpAndRageBar5Mon();
        });
    });

    //Sự kiện kéo vào tủ đồ
    const allSlotSkillInventory = [
        ...document.querySelectorAll("#battleInv1"),
        ...document.querySelectorAll("#battleInv2"),
        ...document.querySelectorAll("#battleInv3"),
        ...document.querySelectorAll("#battleInv4"),
        ...document.querySelectorAll("#battleInv5"),
        ...document.querySelectorAll("#battleInv6"),
        ...document.querySelectorAll("#battleInv7"),
        ...document.querySelectorAll("#battleInv8"),
        ...document.querySelectorAll("#battleInv9"),
        ...document.querySelectorAll("#battleInv10"),
    ];

    // Sử dụng forEach trên tất cả các phần tử đã gộp
    allSlotSkillInventory.forEach(slot => {
        slot.addEventListener("dragover", (e) => {
            e.preventDefault(); // Cho phép kéo vào
        });

        slot.addEventListener("dragenter", () => {
            if (!slot.classList.contains("occupied")) {
                slot.style.backgroundColor = "#e8f5e9"; // Làm nổi bật slot
            }
        });

        slot.addEventListener("dragleave", () => {
            if (!slot.classList.contains("occupied")) {
                slot.style.backgroundColor = ""; // Đặt lại màu nền khi rời khỏi slot
            }
        });

        slot.addEventListener("drop", (e) => {
            e.preventDefault();
            const skillId = e.dataTransfer.getData("text/plain");
            let skill = document.getElementById(skillId);

            const parentSlot = skill.parentElement;
            //Lấy thông tin của skill target để nâng cấp

            // Kiểm tra nếu skill được kéo và thả lại đúng slot cũ
            if (slot === parentSlot) {
                return;
            }

            // Kéo từ shop xuống
            if (parentSlot.parentElement.id == "battleShop") {
                //Kiểm tra nếu không đủ star
                if (typeGameConquest.starUser < typeGameConquest.battlePetInShop[skill.parentElement.id].PRICE) {
                    messageOpen(`Không đủ <i class="fa-solid fa-splotch"></i>, cần có ${typeGameConquest.battlePetInShop[skill.parentElement.id].PRICE} <i class="fa-solid fa-splotch"></i>`)
                    slot.style.backgroundColor = ""
                    return;
                }

                if (slot.classList.contains("occupied")) { // Kiểm tra slot có skill chưa
                    if (typeGameConquest.battlePetInShop[skill.parentElement.id].EFFECT.includes("stoneUpMulti")) {
                        typeGameConquest.battlePetInInventory[slot.id].COOLDOWN[2] += 1
                        typeGameConquest.battlePetInInventory[slot.id].PRICESELL += typeGameConquest.battlePetInShop[skill.parentElement.id].PRICE

                        typeGameConquest.starUser -= typeGameConquest.battlePetInShop[skill.parentElement.id].PRICE

                        // Xóa kỹ năng khỏi battlePetInShop
                        typeGameConquest.battlePetInShop[skill.parentElement.id] = defaultSTT5Mon;
                        let index = skill.parentElement.id.match(/\d+$/)?.[0]; // lấy số ở cuối skill.parentElement.id
                        let skillLock = `LockBattleShop${index}`;
                        LockBattleShop[skillLock] = false;
                        document.getElementById(skillLock).style.color = 'rgb(255 161 115)'

                        // Xóa kỹ năng html shop (div skill Shop)
                        skill.remove();
                        skill = null;

                        const skillDiv = slot.querySelector(".skill"); // Lấy div skill con
                        if (skillDiv) {
                            const skillData = JSON.parse(skillDiv.dataset.skill); // Lấy data-skill
                            skillData.LEVEL += 1; // Tăng LEVEL lên
                            skillDiv.dataset.skill = JSON.stringify(skillData); // Cập nhật lại data-skill
                        }

                        highlightSkillLevel();
                        resetMaxHpBattle();
                        updateSttForSkillAffter();
                        checkUpdateLevel();

                        typeGameConquest.selectSkillShop += 1
                        document.getElementById("starUser").innerText = typeGameConquest.starUser;

                    } else if (
                        (typeGameConquest.battlePetInShop[skill.parentElement.id].ID == typeGameConquest.battlePetInInventory[slot.id].ID && 
                        Number(typeGameConquest.battlePetInShop[skill.parentElement.id].LEVEL) === Number(typeGameConquest.battlePetInInventory[slot.id].LEVEL))
                        ||
                        typeGameConquest.battlePetInShop[skill.parentElement.id].EFFECT.includes("stoneUpLevel")
                        ) {

                        //Nâng cấp
                        typeGameConquest.battlePetInInventory[slot.id].LEVEL += 1
                        typeGameConquest.battlePetInInventory[slot.id].POWER.STR += Math.round(50 * typeGameConquest.battlePetInInventory[slot.id].LEVEL * typeGameConquest.battlePetInInventory[slot.id].LVUPSCALE.STR)
                        typeGameConquest.battlePetInInventory[slot.id].POWER.DEF += Math.round(50 * typeGameConquest.battlePetInInventory[slot.id].LEVEL * typeGameConquest.battlePetInInventory[slot.id].LVUPSCALE.DEF)
                        typeGameConquest.battlePetInInventory[slot.id].POWER.INT += Math.round(50 * typeGameConquest.battlePetInInventory[slot.id].LEVEL * typeGameConquest.battlePetInInventory[slot.id].LVUPSCALE.INT)
                        typeGameConquest.battlePetInInventory[slot.id].POWER.AGI += Math.round(50 * typeGameConquest.battlePetInInventory[slot.id].LEVEL * typeGameConquest.battlePetInInventory[slot.id].LVUPSCALE.AGI)
                        typeGameConquest.battlePetInInventory[slot.id].POWER.LUK += Math.round(50 * typeGameConquest.battlePetInInventory[slot.id].LEVEL * typeGameConquest.battlePetInInventory[slot.id].LVUPSCALE.LUK)
                        typeGameConquest.battlePetInInventory[slot.id].POWER.HP += Math.round(50 * typeGameConquest.battlePetInInventory[slot.id].LEVEL * typeGameConquest.battlePetInInventory[slot.id].LVUPSCALE.HP)

                        let power5MonUpdate = update5MonBattle(typeGameConquest.battlePetInInventory[slot.id])

                        typeGameConquest.battlePetInInventory[slot.id].DAME[0] = power5MonUpdate.dame
                        typeGameConquest.battlePetInInventory[slot.id].DEF[0] = power5MonUpdate.def
                        typeGameConquest.battlePetInInventory[slot.id].HEAL[0] = power5MonUpdate.heal
                        typeGameConquest.battlePetInInventory[slot.id].SHIELD[0] = power5MonUpdate.shield
                        typeGameConquest.battlePetInInventory[slot.id].BURN[0] = power5MonUpdate.burn
                        typeGameConquest.battlePetInInventory[slot.id].POISON[0] = power5MonUpdate.poison
                        typeGameConquest.battlePetInInventory[slot.id].CRIT[0] = power5MonUpdate.crit
                        typeGameConquest.battlePetInInventory[slot.id].COOLDOWN[0] = power5MonUpdate.cooldown

                        typeGameConquest.battlePetInInventory[slot.id].PRICESELL += typeGameConquest.battlePetInShop[skill.parentElement.id].PRICE

                        typeGameConquest.starUser -= typeGameConquest.battlePetInShop[skill.parentElement.id].PRICE

                        // Xóa kỹ năng khỏi battlePetInShop
                        typeGameConquest.battlePetInShop[skill.parentElement.id] = defaultSTT5Mon;
                        let index = skill.parentElement.id.match(/\d+$/)?.[0]; // lấy số ở cuối skill.parentElement.id
                        let skillLock = `LockBattleShop${index}`;
                        LockBattleShop[skillLock] = false;
                        document.getElementById(skillLock).style.color = 'rgb(255 161 115)'

                        // Xóa kỹ năng html shop (div skill Shop)
                        skill.remove();
                        skill = null;

                        const skillDiv = slot.querySelector(".skill"); // Lấy div skill con
                        if (skillDiv) {
                            const skillData = JSON.parse(skillDiv.dataset.skill); // Lấy data-skill
                            skillData.LEVEL += 1; // Tăng LEVEL lên
                            skillDiv.dataset.skill = JSON.stringify(skillData); // Cập nhật lại data-skill
                        }

                        highlightSkillLevel();
                        resetMaxHpBattle();
                        updateSttForSkillAffter();
                        checkUpdateLevel();

                        typeGameConquest.selectSkillShop += 1
                        document.getElementById("starUser").innerText = typeGameConquest.starUser;
                    } else {
                    }

                } else {
                    typeGameConquest.starUser -= typeGameConquest.battlePetInShop[skill.parentElement.id].PRICE

                    //Thêm skill vào battlePetUseSlotRound
                    typeGameConquest.battlePetInInventory[slot.id] = typeGameConquest.battlePetInShop[skill.parentElement.id]
                    typeGameConquest.battlePetInInventory[slot.id].PRICE = 0;
                    typeGameConquest.battlePetInShop[skill.parentElement.id] = defaultSTT5Mon; // Xóa kỹ năng khỏi battlePetInShop
                    let index = skill.parentElement.id.match(/\d+$/)?.[0]; // lấy số ở cuối skill.parentElement.id
                    let skillLock = `LockBattleShop${index}`;
                    LockBattleShop[skillLock] = false;
                    document.getElementById(skillLock).style.color = 'rgb(255 161 115)'

                    //Chuyển slot mới thành đầy    
                    slot.prepend(skill);
                    slot.classList.add("occupied");
                    slot.style.backgroundColor = "";
                    highlightSkillLevel();
                    resetMaxHpBattle();
                    updateSttForSkillAffter();
                    checkUpdateLevel();


                    typeGameConquest.selectSkillShop += 1

                    document.getElementById("starUser").innerText = typeGameConquest.starUser;
                }

            } else if (parentSlot.parentElement.id == "battleInventory") {//Kéo từ tủ đồ sang
                if (slot.classList.contains("occupied")) { // Kiểm tra slot có skill chưa
                    if (typeGameConquest.battlePetInInventory[skill.parentElement.id].EFFECT.includes("stoneUpMulti")) {
                        typeGameConquest.battlePetInInventory[slot.id].COOLDOWN[2] += 1
                        typeGameConquest.battlePetInInventory[slot.id].PRICESELL += typeGameConquest.battlePetInInventory[skill.parentElement.id].PRICE

                        // Xóa kỹ năng khỏi battlePetInInventory
                        // Xóa kỹ năng khỏi battlePetInInventory
                        typeGameConquest.battlePetInInventory[skill.parentElement.id] = defaultSTT5Mon;

                        //Chuyển slot cũ thành trống
                        parentSlot.classList.remove("occupied")

                        // Xóa kỹ năng html shop (div skill Shop)
                        skill.remove();
                        skill = null;

                        const skillDiv = slot.querySelector(".skill"); // Lấy div skill con
                        if (skillDiv) {
                            const skillData = JSON.parse(skillDiv.dataset.skill); // Lấy data-skill
                            skillData.LEVEL += 1; // Tăng LEVEL lên
                            skillDiv.dataset.skill = JSON.stringify(skillData); // Cập nhật lại data-skill
                        }
                        highlightSkillLevel();
                        resetMaxHpBattle();
                        updateSttForSkillAffter();
                        checkUpdateLevel();

                    } else if (
                        (typeGameConquest.battlePetInInventory[skill.parentElement.id].ID == typeGameConquest.battlePetInInventory[slot.id].ID && 
                        Number(typeGameConquest.battlePetInInventory[skill.parentElement.id].LEVEL) === Number(typeGameConquest.battlePetInInventory[slot.id].LEVEL))
                        || typeGameConquest.battlePetInInventory[skill.parentElement.id].EFFECT.includes("stoneUpLevel")
                        ) {

                        //Nâng cấp
                        typeGameConquest.battlePetInInventory[slot.id].LEVEL += 1
                        typeGameConquest.battlePetInInventory[slot.id].POWER.STR += Math.round(50 * typeGameConquest.battlePetInInventory[slot.id].LEVEL * typeGameConquest.battlePetInInventory[slot.id].LVUPSCALE.STR)
                        typeGameConquest.battlePetInInventory[slot.id].POWER.DEF += Math.round(50 * typeGameConquest.battlePetInInventory[slot.id].LEVEL * typeGameConquest.battlePetInInventory[slot.id].LVUPSCALE.DEF)
                        typeGameConquest.battlePetInInventory[slot.id].POWER.INT += Math.round(50 * typeGameConquest.battlePetInInventory[slot.id].LEVEL * typeGameConquest.battlePetInInventory[slot.id].LVUPSCALE.INT)
                        typeGameConquest.battlePetInInventory[slot.id].POWER.AGI += Math.round(50 * typeGameConquest.battlePetInInventory[slot.id].LEVEL * typeGameConquest.battlePetInInventory[slot.id].LVUPSCALE.AGI)
                        typeGameConquest.battlePetInInventory[slot.id].POWER.LUK += Math.round(50 * typeGameConquest.battlePetInInventory[slot.id].LEVEL * typeGameConquest.battlePetInInventory[slot.id].LVUPSCALE.LUK)
                        typeGameConquest.battlePetInInventory[slot.id].POWER.HP += Math.round(50 * typeGameConquest.battlePetInInventory[slot.id].LEVEL * typeGameConquest.battlePetInInventory[slot.id].LVUPSCALE.HP)

                        let power5MonUpdate = update5MonBattle(typeGameConquest.battlePetInInventory[slot.id])

                        typeGameConquest.battlePetInInventory[slot.id].DAME[0] = power5MonUpdate.dame
                        typeGameConquest.battlePetInInventory[slot.id].DEF[0] = power5MonUpdate.def
                        typeGameConquest.battlePetInInventory[slot.id].HEAL[0] = power5MonUpdate.heal
                        typeGameConquest.battlePetInInventory[slot.id].SHIELD[0] = power5MonUpdate.shield
                        typeGameConquest.battlePetInInventory[slot.id].BURN[0] = power5MonUpdate.burn
                        typeGameConquest.battlePetInInventory[slot.id].POISON[0] = power5MonUpdate.poison
                        typeGameConquest.battlePetInInventory[slot.id].CRIT[0] = power5MonUpdate.crit
                        typeGameConquest.battlePetInInventory[slot.id].COOLDOWN[0] = power5MonUpdate.cooldown

                        if (typeGameConquest.battlePetInInventory[slot.id].LEVEL === 2) {
                            typeGameConquest.battlePetInInventory[slot.id].PRICESELL += typeGameConquest.battlePetInInventory[skill.parentElement.id].PRICE
                        } else {
                            typeGameConquest.battlePetInInventory[slot.id].PRICESELL += typeGameConquest.battlePetInInventory[skill.parentElement.id].PRICESELL + typeGameConquest.battlePetInInventory[skill.parentElement.id].PRICE
                        }

                        // Xóa kỹ năng khỏi battlePetInInventory
                        typeGameConquest.battlePetInInventory[skill.parentElement.id] = defaultSTT5Mon;

                        //Chuyển slot cũ thành trống
                        parentSlot.classList.remove("occupied")

                        // Xóa kỹ năng html shop (div skill Shop)
                        skill.remove();
                        skill = null;

                        const skillDiv = slot.querySelector(".skill"); // Lấy div skill con
                        if (skillDiv) {
                            const skillData = JSON.parse(skillDiv.dataset.skill); // Lấy data-skill
                            skillData.LEVEL += 1; // Tăng LEVEL lên
                            skillDiv.dataset.skill = JSON.stringify(skillData); // Cập nhật lại data-skill
                        }
                        highlightSkillLevel();
                        resetMaxHpBattle();
                        updateSttForSkillAffter();
                        checkUpdateLevel();

                    } else {

                        // Đổi chỗ dữ liệu trong typeGameConquest.skillBattle và battlePetInInventory
                        const tempSkill = typeGameConquest.battlePetInInventory[skill.parentElement.id];

                        typeGameConquest.battlePetInInventory[skill.parentElement.id] = typeGameConquest.battlePetInInventory[slot.id];
                        typeGameConquest.battlePetInInventory[slot.id] = tempSkill;

                        // Đổi chỗ skill trong HTML
                        const currentSkill = slot.querySelector(".skill"); // Skill hiện tại trong slot
                        const parentSkill = skill; // Skill từ parentSlot

                        if (currentSkill && parentSkill) {
                            const parentSlot = parentSkill.parentElement;
                            parentSlot.appendChild(currentSkill); // Đưa skill từ slot vào parentSlot
                            slot.appendChild(parentSkill); // Đưa skill từ parentSlot vào slot
                        }
                        highlightSkillLevel();
                        resetMaxHpBattle();
                        updateSttForSkillAffter();
                        checkUpdateLevel();
                        console.log("Kéo từ tủ đồ 5 - đổi chỗ", typeGameConquest.battlePetInInventory, typeGameConquest.skillBattle);
                    }

                } else {

                    //Thêm skill vào battlePetInInventory
                    typeGameConquest.battlePetInInventory[slot.id] = typeGameConquest.battlePetInInventory[skill.parentElement.id]

                    typeGameConquest.battlePetInInventory[skill.parentElement.id] = defaultSTT5Mon; // Xóa kỹ năng khỏi battlePetInInventory
                    //Chuyển slot cũ thành trống
                    parentSlot.classList.remove("occupied")

                    //Chuyển slot mới thành đầy
                    slot.prepend(skill);
                    slot.classList.add("occupied");
                    slot.style.backgroundColor = "";
                    highlightSkillLevel();
                    resetMaxHpBattle();
                    updateSttForSkillAffter();
                    checkUpdateLevel();
                }

            } else if (parentSlot.parentElement.id == "skillBarB") {
                if (slot.classList.contains("occupied")) { // Kiểm tra slot có skill chưa
                    if (typeGameConquest.skillBattle[skill.parentElement.id].ID == typeGameConquest.battlePetInInventory[slot.id].ID && Number(typeGameConquest.skillBattle[skill.parentElement.id].LEVEL) === Number(typeGameConquest.battlePetInInventory[slot.id].LEVEL)) {

                        //Nâng cấp
                        typeGameConquest.battlePetInInventory[slot.id].LEVEL += 1
                        typeGameConquest.battlePetInInventory[slot.id].POWER.STR += Math.round(50 * typeGameConquest.battlePetInInventory[slot.id].LEVEL * typeGameConquest.battlePetInInventory[slot.id].LVUPSCALE.STR)
                        typeGameConquest.battlePetInInventory[slot.id].POWER.DEF += Math.round(50 * typeGameConquest.battlePetInInventory[slot.id].LEVEL * typeGameConquest.battlePetInInventory[slot.id].LVUPSCALE.DEF)
                        typeGameConquest.battlePetInInventory[slot.id].POWER.INT += Math.round(50 * typeGameConquest.battlePetInInventory[slot.id].LEVEL * typeGameConquest.battlePetInInventory[slot.id].LVUPSCALE.INT)
                        typeGameConquest.battlePetInInventory[slot.id].POWER.AGI += Math.round(50 * typeGameConquest.battlePetInInventory[slot.id].LEVEL * typeGameConquest.battlePetInInventory[slot.id].LVUPSCALE.AGI)
                        typeGameConquest.battlePetInInventory[slot.id].POWER.LUK += Math.round(50 * typeGameConquest.battlePetInInventory[slot.id].LEVEL * typeGameConquest.battlePetInInventory[slot.id].LVUPSCALE.LUK)
                        typeGameConquest.battlePetInInventory[slot.id].POWER.HP += Math.round(50 * typeGameConquest.battlePetInInventory[slot.id].LEVEL * typeGameConquest.battlePetInInventory[slot.id].LVUPSCALE.HP)

                        let power5MonUpdate = update5MonBattle(typeGameConquest.battlePetInInventory[slot.id])

                        typeGameConquest.battlePetInInventory[slot.id].DAME[0] = power5MonUpdate.dame
                        typeGameConquest.battlePetInInventory[slot.id].DEF[0] = power5MonUpdate.def
                        typeGameConquest.battlePetInInventory[slot.id].HEAL[0] = power5MonUpdate.heal
                        typeGameConquest.battlePetInInventory[slot.id].SHIELD[0] = power5MonUpdate.shield
                        typeGameConquest.battlePetInInventory[slot.id].BURN[0] = power5MonUpdate.burn
                        typeGameConquest.battlePetInInventory[slot.id].POISON[0] = power5MonUpdate.poison
                        typeGameConquest.battlePetInInventory[slot.id].CRIT[0] = power5MonUpdate.crit
                        typeGameConquest.battlePetInInventory[slot.id].COOLDOWN[0] = power5MonUpdate.cooldown

                        if (typeGameConquest.battlePetInInventory[slot.id].LEVEL === 2) {
                            typeGameConquest.battlePetInInventory[slot.id].PRICESELL += typeGameConquest.skillBattle[skill.parentElement.id].PRICE
                        } else {
                            typeGameConquest.battlePetInInventory[slot.id].PRICESELL += typeGameConquest.skillBattle[skill.parentElement.id].PRICESELL + typeGameConquest.skillBattle[skill.parentElement.id].PRICE
                        }

                        // Xóa kỹ năng khỏi typeGameConquest.skillBattle
                        typeGameConquest.skillBattle[skill.parentElement.id] = defaultSTT5Mon;
                        typeGameConquest.battlePetUseSlotRound[skill.parentElement.id] = defaultSTT5Mon; // Xóa kỹ năng khỏi battlePetUseSlotRound

                        //Chuyển slot cũ thành trống
                        parentSlot.classList.remove("occupied")

                        // Xóa kỹ năng html shop (div skill Shop)
                        skill.remove();
                        skill = null;

                        const skillDiv = slot.querySelector(".skill"); // Lấy div skill con
                        if (skillDiv) {
                            const skillData = JSON.parse(skillDiv.dataset.skill); // Lấy data-skill
                            skillData.LEVEL += 1; // Tăng LEVEL lên
                            skillDiv.dataset.skill = JSON.stringify(skillData); // Cập nhật lại data-skill
                        }
                        highlightSkillLevel();
                        resetMaxHpBattle();
                        updateSttForSkillAffter();
                        checkUpdateLevel();

                    } else {
                        // Đổi chỗ dữ liệu trong typeGameConquest.skillBattle và battlePetInInventory
                        const tempSkill = typeGameConquest.skillBattle[skill.parentElement.id];
                        const targetSkill = typeGameConquest.battlePetInInventory[slot.id]
                        // Kiểm tra xem skill này đã có trong skillBattle chưa (chỉ kiểm các key kết thúc bằng "B")
                        let existsInBattle = false;
                        for (const key in typeGameConquest.skillBattle) {
                            if (key.endsWith("B") && typeGameConquest.skillBattle[key].ID === targetSkill.ID && key !== skill.parentElement.id) {
                                existsInBattle = true;
                                break;
                            }
                        }

                        if (existsInBattle) {
                            console.warn("Skill đã tồn tại trong skillBattle, không thể hoán đổi.");
                            return; // Dừng thao tác đổi chỗ
                        } else {
                            typeGameConquest.skillBattle[skill.parentElement.id] = targetSkill
                            typeGameConquest.battlePetUseSlotRound[skill.parentElement.id] = targetSkill
                            typeGameConquest.battlePetInInventory[slot.id] = tempSkill;

                            // Đổi chỗ skill trong HTML
                            const currentSkill = slot.querySelector(".skill"); // Skill hiện tại trong slot
                            const parentSkill = skill; // Skill từ parentSlot

                            if (currentSkill && parentSkill) {
                                const parentSlot = parentSkill.parentElement;
                                parentSlot.appendChild(currentSkill); // Đưa skill từ slot vào parentSlot
                                slot.appendChild(parentSkill); // Đưa skill từ parentSlot vào slot
                                console.warn("Đã hoán đổi1.");
                            }
                            highlightSkillLevel();
                            resetMaxHpBattle();
                            updateSttForSkillAffter();
                            checkUpdateLevel();
                            console.log("Kéo từ tủ đồ 5 - đổi chỗ", typeGameConquest.battlePetInInventory, typeGameConquest.skillBattle);
                        }
                    }


                } else {

                    //Thêm skill vào battlePetInInventory
                    typeGameConquest.battlePetInInventory[slot.id] = typeGameConquest.skillBattle[skill.parentElement.id]

                    typeGameConquest.skillBattle[skill.parentElement.id] = defaultSTT5Mon; // Xóa kỹ năng khỏi typeGameConquest.skillBattle
                    typeGameConquest.battlePetUseSlotRound[skill.parentElement.id] = defaultSTT5Mon; // Xóa kỹ năng khỏi battlePetUseSlotRound

                    //Chuyển slot cũ thành trống
                    parentSlot.classList.remove("occupied")

                    //Chuyển slot mới thành đầy
                    slot.prepend(skill);
                    slot.classList.add("occupied");
                    slot.style.backgroundColor = "";
                    highlightSkillLevel();
                    resetMaxHpBattle();
                    updateSttForSkillAffter();
                    checkUpdateLevel();
                }
                internalUp();
                resetHp5Mon();
                updateHpAndRageBar5Mon();
            } else {
                slot.style.backgroundColor = "";
            }
        });
    });

    //Bán skill
    shopSell.addEventListener('dragover', (event) => {
        event.preventDefault(); // Cho phép thả
    });

    shopSell.addEventListener('drop', (event) => {
        event.preventDefault(); // Ngăn hành vi mặc định
        const skillId = event.dataTransfer.getData("text/plain"); // Lấy ID kỹ năng
        let skillElement = document.getElementById(skillId);

        if (skillElement) {
            if (skillElement.parentElement.parentElement.id !== "battleShop") {

                //Xóa ở trong mảng
                //Skill bán ở trong tủ đồ
                if (skillElement.parentElement.parentElement.id === "battleInventory") {
                    let skillSell = typeGameConquest.battlePetInInventory[skillElement.parentElement.id]
                    typeGameConquest.battlePetInInventory[skillElement.parentElement.id] = defaultSTT5Mon;
                    //Cộng atk/heal/shield/burn/poison khi bán skill
                    skillSell.SELLUP.forEach(sellUpEffect => {
                        sellUpSkill(skillSell, sellUpEffect);
                    });
                    typeGameConquest.starUser += skillSell.PRICE + skillSell.PRICESELL
                }

                //Skill bán ở slot skill
                if (skillElement.parentElement.parentElement.id === "skillBarB") {
                    let skillSell = typeGameConquest.battlePetUseSlotRound[skillElement.parentElement.id]
                    typeGameConquest.battlePetUseSlotRound[skillElement.parentElement.id] = defaultSTT5Mon;

                    typeGameConquest.skillBattle[skillElement.parentElement.id] = typeGameConquest.battlePetUseSlotRound[skillElement.parentElement.id]
                    //Cộng atk/heal/shield/burn/poison khi bán skill

                    typeGameConquest.starUser += skillSell.PRICE + skillSell.PRICESELL

                    skillSell.SELLUP.forEach(sellUpEffect => {
                        sellUpSkill(skillSell, sellUpEffect);
                    });
                    internalUp();
                }

                //Xử lý các 5Mon có sellUpPrice
                Object.keys(typeGameConquest.battlePetUseSlotRound).forEach((key) => {
                    if (typeGameConquest.battlePetUseSlotRound[key].INTERNAL.includes("sellUpPrice")) {
                        typeGameConquest.battlePetUseSlotRound[key].PRICESELL += 1;
                        typeGameConquest.skillBattle[key].PRICESELL = typeGameConquest.battlePetUseSlotRound[key].PRICESELL;      
                    }
                });
                
                Object.keys(typeGameConquest.battlePetInInventory).forEach((key) => {
                    if (typeGameConquest.battlePetInInventory[key].INTERNAL.includes("sellUpPrice")) {
                        typeGameConquest.battlePetInInventory[key].PRICESELL += 1;
                    }
                });

                // Xử lý logic bán kỹ năng
                skillElement.parentElement.classList.remove("occupied")
                skillElement.remove(); // Xóa skill khỏi giao diện
                skillElement = null;

            }
            slots.forEach(slot => slot.classList.remove("highlight"));
            slots.forEach(slot => slot.classList.remove("updateSkill"));

            shopSell.style.background = "#f86e85"
            document.getElementById('starUser').innerText = typeGameConquest.starUser;
        }
        highlightSkillLevel();
        resetMaxHpBattle();
        updateSttForSkillAffter();
        checkUpdateLevel(); 
        internalUp();
        resetHp5Mon();
        updateHpAndRageBar5Mon();
    });
};

//Hàm update 5Mon trong battle
function update5MonBattle(skill) {

    let powerINT = scalePower5Mon(skill.POWER.INT);

    let dame = 0, heal = 0, shield = 0, burn = 0, poison = 0;

    // Áp dụng scaleSTR vào các phép tính hiệu ứng
    if (skill.EFFECT.includes("Attacking")) {
        dame = Math.round(powerINT.dame * skill.POWER.SCALE);  // Giảm dần khi STR tăng
    }
    if (skill.EFFECT.includes("Healing")) {
        heal = Math.round(powerINT.heal * skill.POWER.SCALE);  // Giảm dần khi STR tăng
    }
    if (skill.EFFECT.includes("Shield")) {
        shield = Math.round(powerINT.shield * skill.POWER.SCALE);  // Giảm dần khi STR tăng
    }
    if (skill.EFFECT.includes("Burn")) {
        burn = Math.round(powerINT.burn * skill.POWER.SCALE);  // Giảm dần khi STR tăng
    }
    if (skill.EFFECT.includes("Poison")) {
        poison = Math.round(powerINT.poison * skill.POWER.SCALE);  // Giảm dần khi STR tăng
    }

    //Tính cooldown
    let agi = skill.POWER.AGI;
    let minC = 8;
    let maxC = 20;

    let scaleC = Math.max(5, 170 - Math.floor((agi - 200) / 9)); // giảm dần, min là 5

    let valueC = ((maxC - minC) / (1 + agi / scaleC) * 1000) * (2 - skill.POWER.SCALE);


    //tính crit
    let luk = skill.POWER.LUK;
    let maxCrit = 60;
    let scaleCrit = 1500; // tùy chỉnh
    let valueCrit = maxCrit * luk / (luk + scaleCrit);
    valueCrit = Math.min(maxCrit, Math.max(0, valueCrit));
    valueCrit = Math.round(valueCrit * skill.POWER.SCALE);

    //tính def
    let def = skill.POWER.DEF;
    let maxDef = 90;
    let scaleDef = 475; // tùy chỉnh
    let valueDef = maxDef * def / (def + scaleDef);
    valueDef = Math.min(maxDef, Math.max(0, valueDef));
    valueDef = Math.round(valueDef * skill.POWER.SCALE);

    return {
        dame: dame,
        heal: heal,
        shield: shield,
        burn: burn,
        poison: poison,
        crit: valueCrit,
        def: Math.round(valueDef * 100) / 100,
        cooldown: Math.ceil(valueC)
    }
}


//Hàm tăng điểm khi bán skill +++
function sellUpSkill(skill, sellUpEffect) {
    const sellUpDame = eval(effectsSellUp[sellUpEffect].dameSellUp)

    if (sellUpEffect === "SUpHp") {
        typeGameConquest.maxHpBattle += sellUpDame
        nowHpBattleMy = (typeGameConquest.maxHpBattle + maxHpUp);
        updateHpbar();
    }

    if (sellUpEffect === "SUpDameAll") {
        for (let i in typeGameConquest.battlePetUseSlotRound) {
            const data = typeGameConquest.battlePetUseSlotRound[i];
            if (data.EFFECT.includes("Attacking")) {
                data.DAME[1] += sellUpDame
                updateSttForSkillAffter();
            }
        }
    }

    if (sellUpEffect === "SUpDameLeft") {
        for (let i in typeGameConquest.battlePetUseSlotRound) {
            const data = typeGameConquest.battlePetUseSlotRound[i];
            if (data.EFFECT.includes("Attacking") && data.ID !== "") {
                data.DAME[1] += sellUpDame
                updateSttForSkillAffter();
                break;
            }
        }
    }

    if (sellUpEffect === "SUpHealAll") {
        for (let i in typeGameConquest.battlePetUseSlotRound) {
            const data = typeGameConquest.battlePetUseSlotRound[i];
            if (data.EFFECT.includes("Healing")) {
                data.HEAL[1] += sellUpDame
                updateSttForSkillAffter();
            }
        }
    }

    if (sellUpEffect === "SUpHealLeft") {
        for (let i in typeGameConquest.battlePetUseSlotRound) {
            const data = typeGameConquest.battlePetUseSlotRound[i];
            if (data.EFFECT.includes("Healing") && data.ID !== "") {
                data.HEAL[1] += sellUpDame
                updateSttForSkillAffter();
                break;
            }
        }
    }
    if (sellUpEffect === "SUpShieldAll") {
        for (let i in typeGameConquest.battlePetUseSlotRound) {
            const data = typeGameConquest.battlePetUseSlotRound[i];
            if (data.EFFECT.includes("Shield")) {
                data.SHIELD[1] += sellUpDame
                updateSttForSkillAffter();
            }
        }
    }

    if (sellUpEffect === "SUpShieldLeft") {
        for (let i in typeGameConquest.battlePetUseSlotRound) {
            const data = typeGameConquest.battlePetUseSlotRound[i];
            if (data.EFFECT.includes("Shield") && data.ID !== "") {
                data.SHIELD[1] += sellUpDame
                updateSttForSkillAffter();
                break;
            }
        }
    }
    if (sellUpEffect === "SUpBurnAll") {
        for (let i in typeGameConquest.battlePetUseSlotRound) {
            const data = typeGameConquest.battlePetUseSlotRound[i];
            if (data.EFFECT.includes("Burn")) {
                data.BURN[1] += sellUpDame
                updateSttForSkillAffter();
            }
        }
    }

    if (sellUpEffect === "SUpBurnLeft") {
        for (let i in typeGameConquest.battlePetUseSlotRound) {
            const data = typeGameConquest.battlePetUseSlotRound[i];
            if (data.EFFECT.includes("Burn") && data.ID !== "") {
                data.BURN[1] += sellUpDame
                updateSttForSkillAffter();
                break;
            }
        }
    }
    if (sellUpEffect === "SUpPoisonAll") {
        for (let i in typeGameConquest.battlePetUseSlotRound) {
            const data = typeGameConquest.battlePetUseSlotRound[i];
            if (data.EFFECT.includes("Poison")) {
                data.POISON[1] += sellUpDame
                updateSttForSkillAffter();
            }
        }
    }

    if (sellUpEffect === "SUpPoisonLeft") {
        for (let i in typeGameConquest.battlePetUseSlotRound) {
            const data = typeGameConquest.battlePetUseSlotRound[i];
            if (data.EFFECT.includes("Poison") && data.ID !== "") {
                data.POISON[1] += sellUpDame
                updateSttForSkillAffter();
                break;
            }
        }
    }
    if (sellUpEffect === "SUpCritAll") {
        for (let i in typeGameConquest.battlePetUseSlotRound) {
            const data = typeGameConquest.battlePetUseSlotRound[i];
            data.CRIT[1] += sellUpDame
        }
    }

    if (sellUpEffect === "SUpCritLeft") {
        for (let i in typeGameConquest.battlePetUseSlotRound) {
            const data = typeGameConquest.battlePetUseSlotRound[i];
            if (data.ID !== "") {
                data.CRIT[1] += sellUpDame
                break;
            }
        }
    }
    if (sellUpEffect === "SUpMutilLeft") {
        for (let i in typeGameConquest.battlePetUseSlotRound) {
            const data = typeGameConquest.battlePetUseSlotRound[i];
            if (data.ID !== "") {
                data.COOLDOWN[2] += Number(sellUpDame)
                updateSttForSkillAffter();
                break;
            }
        }
    }
    console.log("battlePetUseSlotRound", typeGameConquest.battlePetUseSlotRound)
}

//Hàm tăng chỉ số dựa vào nội tại Internal
function internalUp() {

    maxHpUp = 0;
    nowHpBattleMy = (typeGameConquest.maxHpBattle + maxHpUp);
    updateHpbar();
    document.querySelector('#hpBarB').querySelector('.hpText').textContent = (typeGameConquest.maxHpBattle + maxHpUp)

    //Cho tất cả các chỉ số trong skillbattle và battleinventory [2] về 0 hết
    Object.keys(typeGameConquest.skillBattle).forEach((key) => {
        if (key.endsWith("B") &&
            typeGameConquest.skillBattle[key].ID !== "") {
            typeGameConquest.skillBattle[key].DAME[2] = 0;
            typeGameConquest.skillBattle[key].HEAL[2] = 0;
            typeGameConquest.skillBattle[key].SHIELD[2] = 0;
            typeGameConquest.skillBattle[key].BURN[2] = 0;
            typeGameConquest.skillBattle[key].POISON[2] = 0;
            typeGameConquest.skillBattle[key].CRIT[2] = 0;
            typeGameConquest.skillBattle[key].COOLDOWN[3] = 0;
        }
    });

    Object.keys(typeGameConquest.battlePetInInventory).forEach((key) => {
        if (typeGameConquest.battlePetInInventory[key].ID !== "") {
            typeGameConquest.battlePetInInventory[key].DAME[2] = 0;
            typeGameConquest.battlePetInInventory[key].HEAL[2] = 0;
            typeGameConquest.battlePetInInventory[key].SHIELD[2] = 0;
            typeGameConquest.battlePetInInventory[key].BURN[2] = 0;
            typeGameConquest.battlePetInInventory[key].POISON[2] = 0;
            typeGameConquest.battlePetInInventory[key].CRIT[2] = 0;
            typeGameConquest.battlePetInInventory[key].COOLDOWN[3] = 0;
        }
    });

    //Tăng chỉ số dựa theo slot
    Object.keys(typeGameConquest.skillBattle).forEach((key) => {
        //chuyển thành skill
        let skill = typeGameConquest.skillBattle[key]
        if (key.endsWith("B") &&
            typeGameConquest.skillBattle[key].ID !== "") {

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpMaxHeal")) {
                const internalUpDame = eval(effectsInternal["IntUpMaxHeal"].dameInternal)
                maxHpUp += internalUpDame
                nowHpBattleMy = (typeGameConquest.maxHpBattle + maxHpUp);
                updateHpbar();
                document.querySelector('#hpBarB').querySelector('.hpText').textContent = (typeGameConquest.maxHpBattle + maxHpUp)
            }

            //////////////////Attacking
            /////////////////////

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpDameAll")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpDameAll"].dameInternal)
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Attacking") &&
                        skill !== key) {
                        typeGameConquest.skillBattle[skill].DAME[2] += internalUpDame
                    };
                });
            }
            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpDameLeft")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpDameLeft"].dameInternal)
                const slotKey = parseInt(key.replace(/\D/g, ""));
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        skill.startsWith(`skill${slotKey - 1}`) &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Attacking") &&
                        skill !== key) {
                        typeGameConquest.skillBattle[skill].DAME[2] += internalUpDame
                    };
                });
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpDameLeftMost")) {
                const internalUpDame = eval(effectsInternal["IntUpDameLeftMost"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Attacking") &&
                        skill !== key &&
                        parseInt(skill.replace(/\D/g, "")) < slotKey) {
                        typeGameConquest.skillBattle[skill].DAME[2] += internalUpDame
                        break;
                    };
                };
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpDameLeftAll")) {
                const internalUpDame = eval(effectsInternal["IntUpDameLeftAll"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Attacking") &&
                        parseInt(skill.replace(/\D/g, "")) < slotKey &&
                        skill !== key
                    ) {
                        typeGameConquest.skillBattle[skill].DAME[2] += internalUpDame;
                        // Thoát vòng lặp khi đạt đến `slotKey`
                    }
                }
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpDameRight")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpDameRight"].dameInternal)
                const slotKey = parseInt(key.replace(/\D/g, ""));
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        skill.startsWith(`skill${slotKey + 1}`) &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Attacking") &&
                        skill !== key) {
                        typeGameConquest.skillBattle[skill].DAME[2] += internalUpDame
                    };
                });
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpDameRightMost")) {
                const internalUpDame = eval(effectsInternal["IntUpDameRightMost"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));

                // Duyệt qua các skill và tìm skill bên phải nhất
                for (const skill of Object.keys(typeGameConquest.skillBattle).reverse()) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Attacking") &&
                        skill !== key &&
                        parseInt(skill.replace(/\D/g, "")) > slotKey
                    ) {
                        typeGameConquest.skillBattle[skill].DAME[2] += internalUpDame;
                        break; // Thoát vòng lặp ngay khi tìm thấy skill hợp lệ
                    }
                }
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpDameRightAll")) {
                const internalUpDame = eval(effectsInternal["IntUpDameRightAll"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        parseInt(skill.replace(/\D/g, "")) > slotKey &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Attacking") &&
                        skill !== key
                    ) {
                        typeGameConquest.skillBattle[skill].DAME[2] += internalUpDame;
                    }
                }
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpDameLeftRight")) {
                const internalUpDame = eval(effectsInternal["IntUpDameLeftRight"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Attacking") &&
                        skill !== key
                    ) {
                        const currentSlot = parseInt(skill.replace(/\D/g, ""));
                        // Tăng chỉ số DAME[2] cho slot bên trái hoặc bên phải (với điều kiện hợp lệ)
                        if (
                            (currentSlot === slotKey - 1 && slotKey > 1) || // Bên trái, trừ trường hợp slotKey là 1
                            (currentSlot === slotKey + 1 && slotKey < 9)    // Bên phải, trừ trường hợp slotKey là 9
                        ) {
                            typeGameConquest.skillBattle[skill].DAME[2] += internalUpDame;
                        }
                    }
                }
            }
            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpDameType")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpDameType"].dameInternal)
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Attacking") &&
                        skill !== key &&
                        typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[key].TYPE.includes(type))
                    ) {
                        typeGameConquest.skillBattle[skill].DAME[2] += internalUpDame
                    };
                });
            }

            //////////////////Heal
            /////////////////////

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpHealAll")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpHealAll"].dameInternal)
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Healing") &&
                        skill !== key) {
                        typeGameConquest.skillBattle[skill].HEAL[2] += internalUpDame
                    };
                });
            }
            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpHealLeft")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpHealLeft"].dameInternal)
                const slotKey = parseInt(key.replace(/\D/g, ""));
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        skill.startsWith(`skill${slotKey - 1}`) &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Healing") &&
                        skill !== key) {
                        typeGameConquest.skillBattle[skill].HEAL[2] += internalUpDame
                    };
                });
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpHealLeftMost")) {
                const internalUpDame = eval(effectsInternal["IntUpHealLeftMost"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Healing") &&
                        skill !== key &&
                        parseInt(skill.replace(/\D/g, "")) < slotKey) {
                        typeGameConquest.skillBattle[skill].HEAL[2] += internalUpDame
                        break;
                    };
                };
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpHealLeftAll")) {
                const internalUpDame = eval(effectsInternal["IntUpHealLeftAll"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Healing") &&
                        parseInt(skill.replace(/\D/g, "")) < slotKey &&
                        skill !== key
                    ) {
                        typeGameConquest.skillBattle[skill].HEAL[2] += internalUpDame;
                        // Thoát vòng lặp khi đạt đến `slotKey`
                    }
                }
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpHealRight")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpHealRight"].dameInternal)
                const slotKey = parseInt(key.replace(/\D/g, ""));
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        skill.startsWith(`skill${slotKey + 1}`) &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Healing") &&
                        skill !== key) {
                        typeGameConquest.skillBattle[skill].HEAL[2] += internalUpDame
                    };
                });
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpHealRightMost")) {
                const internalUpDame = eval(effectsInternal["IntUpHealRightMost"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));

                // Duyệt qua các skill và tìm skill bên phải nhất
                for (const skill of Object.keys(typeGameConquest.skillBattle).reverse()) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Healing") &&
                        skill !== key &&
                        parseInt(skill.replace(/\D/g, "")) > slotKey
                    ) {
                        typeGameConquest.skillBattle[skill].HEAL[2] += internalUpDame;
                        break; // Thoát vòng lặp ngay khi tìm thấy skill hợp lệ
                    }
                }
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpHealRightAll")) {
                const internalUpDame = eval(effectsInternal["IntUpHealRightAll"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        parseInt(skill.replace(/\D/g, "")) > slotKey &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Healing") &&
                        skill !== key
                    ) {
                        typeGameConquest.skillBattle[skill].HEAL[2] += internalUpDame;
                    }
                }
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpHealLeftRight")) {
                const internalUpDame = eval(effectsInternal["IntUpHealLeftRight"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Healing") &&
                        skill !== key
                    ) {
                        const currentSlot = parseInt(skill.replace(/\D/g, ""));
                        // Tăng chỉ số HEAL[2] cho slot bên trái hoặc bên phải (với điều kiện hợp lệ)
                        if (
                            (currentSlot === slotKey - 1 && slotKey > 1) || // Bên trái, trừ trường hợp slotKey là 1
                            (currentSlot === slotKey + 1 && slotKey < 9)    // Bên phải, trừ trường hợp slotKey là 9
                        ) {
                            typeGameConquest.skillBattle[skill].HEAL[2] += internalUpDame;
                        }
                    }
                }
            }
            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpHealType")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpHealType"].dameInternal)
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Healing") &&
                        skill !== key &&
                        typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[key].TYPE.includes(type))
                    ) {
                        typeGameConquest.skillBattle[skill].HEAL[2] += internalUpDame
                    };
                });
            }

            ////////////Shield
            /////////////////
            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpShieldAll")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpShieldAll"].dameInternal)
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Shield") &&
                        skill !== key) {
                        typeGameConquest.skillBattle[skill].SHIELD[2] += internalUpDame
                    };
                });
            }
            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpShieldLeft")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpShieldLeft"].dameInternal)
                const slotKey = parseInt(key.replace(/\D/g, ""));
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        skill.startsWith(`skill${slotKey - 1}`) &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Shield") &&
                        skill !== key) {
                        typeGameConquest.skillBattle[skill].SHIELD[2] += internalUpDame
                    };
                });
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpShieldLeftMost")) {
                const internalUpDame = eval(effectsInternal["IntUpShieldLeftMost"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Shield") &&
                        skill !== key &&
                        parseInt(skill.replace(/\D/g, "")) < slotKey) {
                        typeGameConquest.skillBattle[skill].SHIELD[2] += internalUpDame
                        break;
                    };
                };
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpShieldLeftAll")) {
                const internalUpDame = eval(effectsInternal["IntUpShieldLeftAll"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Shield") &&
                        parseInt(skill.replace(/\D/g, "")) < slotKey &&
                        skill !== key
                    ) {
                        typeGameConquest.skillBattle[skill].SHIELD[2] += internalUpDame;
                        // Thoát vòng lặp khi đạt đến `slotKey`
                    }
                }
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpShieldRight")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpShieldRight"].dameInternal)
                const slotKey = parseInt(key.replace(/\D/g, ""));
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        skill.startsWith(`skill${slotKey + 1}`) &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Shield") &&
                        skill !== key) {
                        typeGameConquest.skillBattle[skill].SHIELD[2] += internalUpDame
                    };
                });
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpShieldRightMost")) {
                const internalUpDame = eval(effectsInternal["IntUpShieldRightMost"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));

                // Duyệt qua các skill và tìm skill bên phải nhất
                for (const skill of Object.keys(typeGameConquest.skillBattle).reverse()) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Shield") &&
                        skill !== key &&
                        parseInt(skill.replace(/\D/g, "")) > slotKey
                    ) {
                        typeGameConquest.skillBattle[skill].SHIELD[2] += internalUpDame;
                        break; // Thoát vòng lặp ngay khi tìm thấy skill hợp lệ
                    }
                }
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpShieldRightAll")) {
                const internalUpDame = eval(effectsInternal["IntUpShieldRightAll"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        parseInt(skill.replace(/\D/g, "")) > slotKey &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Shield") &&
                        skill !== key
                    ) {
                        typeGameConquest.skillBattle[skill].SHIELD[2] += internalUpDame;
                    }
                }
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpShieldLeftRight")) {
                const internalUpDame = eval(effectsInternal["IntUpShieldLeftRight"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Shield") &&
                        skill !== key
                    ) {
                        const currentSlot = parseInt(skill.replace(/\D/g, ""));
                        // Tăng chỉ số SHIELD[2] cho slot bên trái hoặc bên phải (với điều kiện hợp lệ)
                        if (
                            (currentSlot === slotKey - 1 && slotKey > 1) || // Bên trái, trừ trường hợp slotKey là 1
                            (currentSlot === slotKey + 1 && slotKey < 9)    // Bên phải, trừ trường hợp slotKey là 9
                        ) {
                            typeGameConquest.skillBattle[skill].SHIELD[2] += internalUpDame;
                        }
                    }
                }
            }
            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpShieldType")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpShieldType"].dameInternal)
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Shield") &&
                        skill !== key &&
                        typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[key].TYPE.includes(type))
                    ) {
                        typeGameConquest.skillBattle[skill].SHIELD[2] += internalUpDame
                    };
                });
            }

            /////////////Burn
            ////////////////
            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpBurnAll")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpBurnAll"].dameInternal)
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Burn") &&
                        skill !== key) {
                        typeGameConquest.skillBattle[skill].BURN[2] += internalUpDame
                    };
                });
            }
            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpBurnLeft")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpBurnLeft"].dameInternal)
                const slotKey = parseInt(key.replace(/\D/g, ""));
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        skill.startsWith(`skill${slotKey - 1}`) &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Burn") &&
                        skill !== key) {
                        typeGameConquest.skillBattle[skill].BURN[2] += internalUpDame
                    };
                });
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpBurnLeftMost")) {
                const internalUpDame = eval(effectsInternal["IntUpBurnLeftMost"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Burn") &&
                        skill !== key &&
                        parseInt(skill.replace(/\D/g, "")) < slotKey) {
                        typeGameConquest.skillBattle[skill].BURN[2] += internalUpDame
                        break;
                    };
                };
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpBurnLeftAll")) {
                const internalUpDame = eval(effectsInternal["IntUpBurnLeftAll"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Burn") &&
                        parseInt(skill.replace(/\D/g, "")) < slotKey &&
                        skill !== key
                    ) {
                        typeGameConquest.skillBattle[skill].BURN[2] += internalUpDame;
                        // Thoát vòng lặp khi đạt đến `slotKey`
                    }
                }
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpBurnRight")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpBurnRight"].dameInternal)
                const slotKey = parseInt(key.replace(/\D/g, ""));
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        skill.startsWith(`skill${slotKey + 1}`) &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Burn") &&
                        skill !== key) {
                        typeGameConquest.skillBattle[skill].BURN[2] += internalUpDame
                    };
                });
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpBurnRightMost")) {
                const internalUpDame = eval(effectsInternal["IntUpBurnRightMost"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));

                // Duyệt qua các skill và tìm skill bên phải nhất
                for (const skill of Object.keys(typeGameConquest.skillBattle).reverse()) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Burn") &&
                        skill !== key &&
                        parseInt(skill.replace(/\D/g, "")) > slotKey
                    ) {
                        typeGameConquest.skillBattle[skill].BURN[2] += internalUpDame;
                        break; // Thoát vòng lặp ngay khi tìm thấy skill hợp lệ
                    }
                }
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpBurnRightAll")) {
                const internalUpDame = eval(effectsInternal["IntUpBurnRightAll"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        parseInt(skill.replace(/\D/g, "")) > slotKey &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Burn") &&
                        skill !== key
                    ) {
                        typeGameConquest.skillBattle[skill].BURN[2] += internalUpDame;
                    }
                }
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpBurnLeftRight")) {
                const internalUpDame = eval(effectsInternal["IntUpBurnLeftRight"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Burn") &&
                        skill !== key
                    ) {
                        const currentSlot = parseInt(skill.replace(/\D/g, ""));
                        // Tăng chỉ số BURN[2] cho slot bên trái hoặc bên phải (với điều kiện hợp lệ)
                        if (
                            (currentSlot === slotKey - 1 && slotKey > 1) || // Bên trái, trừ trường hợp slotKey là 1
                            (currentSlot === slotKey + 1 && slotKey < 9)    // Bên phải, trừ trường hợp slotKey là 9
                        ) {
                            typeGameConquest.skillBattle[skill].BURN[2] += internalUpDame;
                        }
                    }
                }
            }
            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpBurnType")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpBurnType"].dameInternal)
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Burn") &&
                        skill !== key &&
                        typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[key].TYPE.includes(type))
                    ) {
                        typeGameConquest.skillBattle[skill].BURN[2] += internalUpDame
                    };
                });
            }

            /////////Poison
            ///////////////

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpPoisonAll")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpPoisonAll"].dameInternal)
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Poison") &&
                        skill !== key) {
                        typeGameConquest.skillBattle[skill].POISON[2] += internalUpDame
                    };
                });
            }
            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpPoisonLeft")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpPoisonLeft"].dameInternal)
                const slotKey = parseInt(key.replace(/\D/g, ""));
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        skill.startsWith(`skill${slotKey - 1}`) &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Poison") &&
                        skill !== key) {
                        typeGameConquest.skillBattle[skill].POISON[2] += internalUpDame
                    };
                });
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpPoisonLeftMost")) {
                const internalUpDame = eval(effectsInternal["IntUpPoisonLeftMost"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Poison") &&
                        skill !== key &&
                        parseInt(skill.replace(/\D/g, "")) < slotKey) {
                        typeGameConquest.skillBattle[skill].POISON[2] += internalUpDame
                        break;
                    };
                };
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpPoisonLeftAll")) {
                const internalUpDame = eval(effectsInternal["IntUpPoisonLeftAll"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Poison") &&
                        parseInt(skill.replace(/\D/g, "")) < slotKey &&
                        skill !== key
                    ) {
                        typeGameConquest.skillBattle[skill].POISON[2] += internalUpDame;
                        // Thoát vòng lặp khi đạt đến `slotKey`
                    }
                }
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpPoisonRight")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpPoisonRight"].dameInternal)
                const slotKey = parseInt(key.replace(/\D/g, ""));
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        skill.startsWith(`skill${slotKey + 1}`) &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Poison") &&
                        skill !== key) {
                        typeGameConquest.skillBattle[skill].POISON[2] += internalUpDame
                    };
                });
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpPoisonRightMost")) {
                const internalUpDame = eval(effectsInternal["IntUpPoisonRightMost"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));

                // Duyệt qua các skill và tìm skill bên phải nhất
                for (const skill of Object.keys(typeGameConquest.skillBattle).reverse()) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Poison") &&
                        skill !== key &&
                        parseInt(skill.replace(/\D/g, "")) > slotKey
                    ) {
                        typeGameConquest.skillBattle[skill].POISON[2] += internalUpDame;
                        break; // Thoát vòng lặp ngay khi tìm thấy skill hợp lệ
                    }
                }
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpPoisonRightAll")) {
                const internalUpDame = eval(effectsInternal["IntUpPoisonRightAll"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        parseInt(skill.replace(/\D/g, "")) > slotKey &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Poison") &&
                        skill !== key
                    ) {
                        typeGameConquest.skillBattle[skill].POISON[2] += internalUpDame;
                    }
                }
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpPoisonLeftRight")) {
                const internalUpDame = eval(effectsInternal["IntUpPoisonLeftRight"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Poison") &&
                        skill !== key
                    ) {
                        const currentSlot = parseInt(skill.replace(/\D/g, ""));
                        // Tăng chỉ số POISON[2] cho slot bên trái hoặc bên phải (với điều kiện hợp lệ)
                        if (
                            (currentSlot === slotKey - 1 && slotKey > 1) || // Bên trái, trừ trường hợp slotKey là 1
                            (currentSlot === slotKey + 1 && slotKey < 9)    // Bên phải, trừ trường hợp slotKey là 9
                        ) {
                            typeGameConquest.skillBattle[skill].POISON[2] += internalUpDame;
                        }
                    }
                }
            }
            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpPoisonType")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpPoisonType"].dameInternal)
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        typeGameConquest.skillBattle[skill].EFFECT.includes("Poison") &&
                        skill !== key &&
                        typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[key].TYPE.includes(type))
                    ) {
                        typeGameConquest.skillBattle[skill].POISON[2] += internalUpDame
                    };
                });
            }

            ///////////Crit
            ///////////////
            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpCritAll")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpCritAll"].dameInternal)
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        skill !== key) {
                        typeGameConquest.skillBattle[skill].CRIT[2] += internalUpDame
                    };
                });
            }
            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpCritLeft")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpCritLeft"].dameInternal)
                const slotKey = parseInt(key.replace(/\D/g, ""));
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        skill.startsWith(`skill${slotKey - 1}`) &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        skill !== key) {
                        typeGameConquest.skillBattle[skill].CRIT[2] += internalUpDame
                    };
                });
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpCritLeftMost")) {
                const internalUpDame = eval(effectsInternal["IntUpCritLeftMost"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        skill !== key &&
                        parseInt(skill.replace(/\D/g, "")) < slotKey) {
                        typeGameConquest.skillBattle[skill].CRIT[2] += internalUpDame
                        break;
                    };
                };
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpCritLeftAll")) {
                const internalUpDame = eval(effectsInternal["IntUpCritLeftAll"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        parseInt(skill.replace(/\D/g, "")) < slotKey &&
                        skill !== key
                    ) {
                        typeGameConquest.skillBattle[skill].CRIT[2] += internalUpDame;
                        // Thoát vòng lặp khi đạt đến `slotKey`
                    }
                }
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpCritRight")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpCritRight"].dameInternal)
                const slotKey = parseInt(key.replace(/\D/g, ""));
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        skill.startsWith(`skill${slotKey + 1}`) &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        skill !== key) {
                        typeGameConquest.skillBattle[skill].CRIT[2] += internalUpDame
                    };
                });
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpCritRightMost")) {
                const internalUpDame = eval(effectsInternal["IntUpCritRightMost"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));

                // Duyệt qua các skill và tìm skill bên phải nhất
                for (const skill of Object.keys(typeGameConquest.skillBattle).reverse()) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        skill !== key &&
                        parseInt(skill.replace(/\D/g, "")) > slotKey
                    ) {
                        typeGameConquest.skillBattle[skill].CRIT[2] += internalUpDame;
                        break; // Thoát vòng lặp ngay khi tìm thấy skill hợp lệ
                    }
                }
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpCritRightAll")) {
                const internalUpDame = eval(effectsInternal["IntUpCritRightAll"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        parseInt(skill.replace(/\D/g, "")) > slotKey &&
                        skill !== key
                    ) {
                        typeGameConquest.skillBattle[skill].CRIT[2] += internalUpDame;
                    }
                }
            }

            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpCritLeftRight")) {
                const internalUpDame = eval(effectsInternal["IntUpCritLeftRight"].dameInternal);
                const slotKey = parseInt(key.replace(/\D/g, ""));
                for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                    if (
                        skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        skill !== key
                    ) {
                        const currentSlot = parseInt(skill.replace(/\D/g, ""));
                        // Tăng chỉ số CRIT[2] cho slot bên trái hoặc bên phải (với điều kiện hợp lệ)
                        if (
                            (currentSlot === slotKey - 1 && slotKey > 1) || // Bên trái, trừ trường hợp slotKey là 1
                            (currentSlot === slotKey + 1 && slotKey < 9)    // Bên phải, trừ trường hợp slotKey là 9
                        ) {
                            typeGameConquest.skillBattle[skill].CRIT[2] += internalUpDame;
                        }
                    }
                }
            }
            if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpCritType")) {
                //tính Dame cộng thêm
                const internalUpDame = eval(effectsInternal["IntUpCritType"].dameInternal)
                Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                    if (skill.endsWith("B") &&
                        key.endsWith("B") &&
                        typeGameConquest.skillBattle[skill].ID !== "" &&
                        skill !== key &&
                        typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[key].TYPE.includes(type))
                    ) {
                        typeGameConquest.skillBattle[skill].CRIT[2] += internalUpDame
                    };
                });
            }
        }

        ///////////Multi cast
        /////////////////////
        if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpMultiAll")) {
            //tính Dame cộng thêm
            const internalUpDame = eval(effectsInternal["IntUpMultiAll"].dameInternal)
            Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                if (skill.endsWith("B") &&
                    key.endsWith("B") &&
                    typeGameConquest.skillBattle[skill].ID !== "" &&
                    skill !== key) {
                    typeGameConquest.skillBattle[skill].COOLDOWN[3] += internalUpDame
                };
            });
        }

        if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpMultiLeft")) {
            //tính Dame cộng thêm
            const internalUpDame = eval(effectsInternal["IntUpMultiLeft"].dameInternal)
            const slotKey = parseInt(key.replace(/\D/g, ""));
            Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                if (skill.endsWith("B") &&
                    key.endsWith("B") &&
                    skill.startsWith(`skill${slotKey - 1}`) &&
                    typeGameConquest.skillBattle[skill].ID !== "" &&
                    skill !== key) {
                    typeGameConquest.skillBattle[skill].COOLDOWN[3] += internalUpDame
                };
            });
        }

        if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpMultiLeftMost")) {
            const internalUpDame = eval(effectsInternal["IntUpMultiLeftMost"].dameInternal);
            const slotKey = parseInt(key.replace(/\D/g, ""));
            for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                if (skill.endsWith("B") &&
                    key.endsWith("B") &&
                    typeGameConquest.skillBattle[skill].ID !== "" &&
                    skill !== key &&
                    parseInt(skill.replace(/\D/g, "")) < slotKey) {
                    typeGameConquest.skillBattle[skill].COOLDOWN[3] += internalUpDame
                    break;
                };
            };
        }

        if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpMultiLeftAll")) {
            const internalUpDame = eval(effectsInternal["IntUpMultiLeftAll"].dameInternal);
            const slotKey = parseInt(key.replace(/\D/g, ""));
            for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                if (
                    skill.endsWith("B") &&
                    key.endsWith("B") &&
                    typeGameConquest.skillBattle[skill].ID !== "" &&
                    parseInt(skill.replace(/\D/g, "")) < slotKey &&
                    skill !== key
                ) {
                    typeGameConquest.skillBattle[skill].COOLDOWN[3] += internalUpDame;
                    // Thoát vòng lặp khi đạt đến `slotKey`
                }
            }
        }

        if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpMultiRight")) {
            //tính Dame cộng thêm
            const internalUpDame = eval(effectsInternal["IntUpMultiRight"].dameInternal)
            const slotKey = parseInt(key.replace(/\D/g, ""));
            Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                if (skill.endsWith("B") &&
                    key.endsWith("B") &&
                    skill.startsWith(`skill${slotKey + 1}`) &&
                    typeGameConquest.skillBattle[skill].ID !== "" &&
                    skill !== key) {
                    typeGameConquest.skillBattle[skill].COOLDOWN[3] += internalUpDame
                };
            });
        }

        if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpMultiRightMost")) {
            const internalUpDame = eval(effectsInternal["IntUpMultiRightMost"].dameInternal);
            const slotKey = parseInt(key.replace(/\D/g, ""));

            // Duyệt qua các skill và tìm skill bên phải nhất
            for (const skill of Object.keys(typeGameConquest.skillBattle).reverse()) {
                if (
                    skill.endsWith("B") &&
                    key.endsWith("B") &&
                    typeGameConquest.skillBattle[skill].ID !== "" &&
                    skill !== key &&
                    parseInt(skill.replace(/\D/g, "")) > slotKey
                ) {
                    typeGameConquest.skillBattle[skill].COOLDOWN[3] += internalUpDame;
                    break; // Thoát vòng lặp ngay khi tìm thấy skill hợp lệ
                }
            }
        }

        if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpMultiRightAll")) {
            const internalUpDame = eval(effectsInternal["IntUpMultiRightAll"].dameInternal);
            const slotKey = parseInt(key.replace(/\D/g, ""));
            for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                if (
                    skill.endsWith("B") &&
                    key.endsWith("B") &&
                    typeGameConquest.skillBattle[skill].ID !== "" &&
                    parseInt(skill.replace(/\D/g, "")) > slotKey &&
                    skill !== key
                ) {
                    typeGameConquest.skillBattle[skill].COOLDOWN[3] += internalUpDame;
                }
            }
        }

        if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpMultiLeftRight")) {
            const internalUpDame = eval(effectsInternal["IntUpMultiLeftRight"].dameInternal);
            const slotKey = parseInt(key.replace(/\D/g, ""));
            for (const skill of Object.keys(typeGameConquest.skillBattle)) {
                if (
                    skill.endsWith("B") &&
                    key.endsWith("B") &&
                    typeGameConquest.skillBattle[skill].ID !== "" &&
                    skill !== key
                ) {
                    const currentSlot = parseInt(skill.replace(/\D/g, ""));
                    // Tăng chỉ số COOLDOWN[3] cho slot bên trái hoặc bên phải (với điều kiện hợp lệ)
                    if (
                        (currentSlot === slotKey - 1 && slotKey > 1) || // Bên trái, trừ trường hợp slotKey là 1
                        (currentSlot === slotKey + 1 && slotKey < 9)    // Bên phải, trừ trường hợp slotKey là 9
                    ) {
                        typeGameConquest.skillBattle[skill].COOLDOWN[3] += internalUpDame;
                    }
                }
            }
        }
        if (typeGameConquest.skillBattle[key].INTERNAL.includes("IntUpMultiType")) {
            //tính Dame cộng thêm
            const internalUpDame = eval(effectsInternal["IntUpMultiType"].dameInternal)
            Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
                if (skill.endsWith("B") &&
                    key.endsWith("B") &&
                    typeGameConquest.skillBattle[skill].ID !== "" &&
                    skill !== key &&
                    typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[key].TYPE.includes(type))
                ) {
                    typeGameConquest.skillBattle[skill].COOLDOWN[3] += internalUpDame
                };
            });
        }
        //++++
    });
    updateSttForSkillAffter();
}

//hàm mở đóng các nút trong giao diện chính
function showOrHiddenDiv(idDiv) {
    const allDivs = {
        menuStartGame: [document.getElementById("menuStartGame"), "Right"],
        bagInventory: [document.getElementById("bagInventory"), "Right"],
        rankBoard: [document.getElementById("rankBoard"), "Left"],
        popupQuestBoard: [document.getElementById("popupQuestBoard"), "Right"],
        menuContainer: [document.getElementById("menuContainer"), "Right"],
        hunterBoard: [document.getElementById("hunterBoard"), "Right"],
        popupBag: [document.getElementById("popupBag"), "Right"],
        popupShop: [document.getElementById("popupShop"), "Left"],
        popupSelectHunt: [document.getElementById("popupSelectHunt"), "Left"],
    };

    const mainDiv = allDivs[idDiv] ? allDivs[idDiv][0] : "";

    const direction = allDivs[idDiv] ? allDivs[idDiv][1] : "";
    let newTranslateX = direction === "Left" ? "-1200px" : "1200px";

    // Ẩn tất cả div khác theo hướng đã định
    Object.entries(allDivs).forEach(([key, [div, dir]]) => {
        if (div && div !== mainDiv) {
            div.classList.remove("showDiv");
            div.classList.add("hiddenDiv");
            div.style.setProperty("--translateX", dir === "Left" ? "-1200px" : "1200px");
        }
    });

    // Kiểm tra nếu idDiv không tồn tại trong allDivs thì báo lỗi và thoát
    if (!allDivs[idDiv] || mainDiv === "") {
        console.error(`Không tìm thấy ID: ${idDiv}`);
        return;
    }

    // Toggle trạng thái của mainDiv
    if (mainDiv.classList.contains("showDiv")) {
        mainDiv.classList.remove("showDiv");
        mainDiv.classList.add("hiddenDiv");
        mainDiv.style.setProperty("--translateX", newTranslateX);
    } else {
        mainDiv.classList.add("showDiv");
        mainDiv.classList.remove("hiddenDiv");
        mainDiv.style.setProperty("--translateX", "0px");
    }

    if (idDiv === "popupShop") {
        switchTabShop('gacha');
    }
}

//Vào game
//Logic:
//Khởi đầu -> hiện shop + tủ đồ -> lấy đồ -> sắp xếp
//Bắt đầu trận -> bấm nút bắt đầu đấu -> đóng tủ đồ + shop + hiện thanh đếm + hiện đối thủ
//Đánh xong -> Thắng -> ẩn đối thủ + ẩn thanh đếm + hiện shop + hiện tủ đồ -> lấy đồ sắp xếp -> Tiếp tục/Thoát trận
//Thua/thoát trận -> thoát game + hiện bảng thành tích -> cộng/trừ điểm xếp hạng của user
//Bấm tiếp tục -> Ẩn shop + hiện đối thủ (ẩn 1 nửa bài) -> sắp xếp bài -> Tiếp tục/Thoát trận
//Thoát trận -> thoát game + hiện bảng thành tích -> cộng trừ/điểm xếp hạng của user
//Bắt đầu trận đấu -> Ẩn tủ đồ + Ẩn shop + Hiện thanh đếm + hiện đối thủ -> Thắng lại tiếp tục...

//Mở menu chọn chế độ chơi

function openMenuStartGame() {

    if (onGame !== 0) { //Mở menu để hiển thị tiếp tục game
        openPopupContinueGame();
        return;
    } else {
        changeButtonMenuStartGame();
        showOrHiddenDiv("menuStartGame");
    }
}

function openPopupContinueGame() {
    document.getElementById("popupContinueGame").style.display = "flex";
    document.getElementById("popupOverlay").style.display = "block";

    const descPopupContinueGame = document.getElementById("descPopupContinueGame");

    let typeGameDesc, modeGameDesc, difficultyGameDesc;

    // Xác định chế độ chơi
    switch (infoStartGame.typeGame) {
        case "Conquest": typeGameDesc = "Chinh phục"; break;
        case "Solo5Mon": typeGameDesc = "Đối kháng"; break;
        case "Guess": typeGameDesc = "Dự đoán"; break;
        default: typeGameDesc = "Không xác định";
    }

    // Xác định kiểu chơi
    switch (infoStartGame.modeGame) {
        case "Guide": modeGameDesc = "Tập luyện"; break;
        case "Normal": modeGameDesc = "Đánh thường"; break;
        case "Rank": modeGameDesc = "Xếp hạng"; break;
        default: modeGameDesc = "Không xác định";
    }

    // Xác định độ khó
    switch (infoStartGame.difficultyGame) {
        case "Easy": difficultyGameDesc = "Dễ"; break;
        case "Normal": difficultyGameDesc = "Thường"; break;
        case "Hard": difficultyGameDesc = "Khó"; break;
        case "Very Hard": difficultyGameDesc = "Siêu khó"; break;
        case "Hell": difficultyGameDesc = "Địa ngục"; break;
        default: difficultyGameDesc = "Không xác định";
    }

    let descOutGameRound1 = ""
    if (infoStartGame.roundGame <= 1 && infoStartGame.typeGame === "Conquest" && infoStartGame.modeGame === "Rank") {
        descOutGameRound1 = "Nếu bỏ cuộc ngay tại vòng 1, bạn sẽ bị trừ 10 điểm xếp hạng"
    } else {
        descOutGameRound1 = ""
    }

    // Hiển thị thông tin trong popup
    let desc = `
<span>Hiện tại bạn đang ở trong một trận đấu:</span><br>
<span>⚔️ Chế độ: <a style="color:rebeccapurple">${typeGameDesc} (${modeGameDesc})</a></span><br>
<span>⚔️ Độ khó: <a style="color:rebeccapurple">${difficultyGameDesc}</a></span><br>
<span>⚔️ Vòng đấu hiện tại: <a style="color:rebeccapurple">${infoStartGame.roundGame} (Thắng: ${typeGameConquest.winBattle} / Thua ${typeGameConquest.loseBattle})</a></span><br>
<span>⚔️ Phần thưởng hiện có:</span><br>
<span style="display: flex; flex-direction: row; justify-content: center; gap: 5px; font-weight: bold; width: 100%; color: rebeccapurple;">
<span> <i class="fa-solid fa-medal"></i>: <a>${typeGameConquest.pointBattle}</a> </span>
<span> <i class="fa-solid fa-gem"></i>: <a>0</a> </span>
<span> <i class="fa-solid fa-coins"></i>: <a>0</a> </span>
</span><br>
<span style="color:red">${descOutGameRound1}</span>

`;

    descPopupContinueGame.innerHTML = desc;

    if (infoStartGame.typeGame === "Conquest") {
        document.getElementById("continueGameButton").onclick = () => openGameRank();
        document.getElementById("exitGameButton").onclick = () => outGameRank();
    }

}

function closePopupContinueGame() {
    document.getElementById("popupContinueGame").style.display = "none";
    document.getElementById("popupOverlay").style.display = "none";
}


function changeButtonMenuStartGame() {

    document.getElementById("valueButtonTypeGame1").style.background = "#c25c5c";
    document.getElementById("valueButtonTypeGame2").style.background = "#c25c5c";
    document.getElementById("valueButtonTypeGame3").style.background = "#c25c5c";
    document.getElementById("valueButtonModeGame1").style.background = "#c25c5c";
    document.getElementById("valueButtonModeGame2").style.background = "#c25c5c";
    document.getElementById("valueButtonModeGame3").style.background = "#c25c5c";
    document.getElementById("valueButtonDifficultyGame1").style.background = "#c25c5c";
    document.getElementById("valueButtonDifficultyGame2").style.background = "#c25c5c";
    document.getElementById("valueButtonDifficultyGame3").style.background = "#c25c5c";
    document.getElementById("valueButtonDifficultyGame4").style.background = "#c25c5c";
    document.getElementById("valueButtonDifficultyGame5").style.background = "#c25c5c";

    document.getElementById("valueButtonTypeGame1").style.border = "0px solid";
    document.getElementById("valueButtonTypeGame2").style.border = "0px solid";
    document.getElementById("valueButtonTypeGame3").style.border = "0px solid";
    document.getElementById("valueButtonModeGame1").style.border = "0px solid";
    document.getElementById("valueButtonModeGame2").style.border = "0px solid";
    document.getElementById("valueButtonModeGame3").style.border = "0px solid";
    document.getElementById("valueButtonDifficultyGame1").style.border = "0px solid";
    document.getElementById("valueButtonDifficultyGame2").style.border = "0px solid";
    document.getElementById("valueButtonDifficultyGame3").style.border = "0px solid";
    document.getElementById("valueButtonDifficultyGame4").style.border = "0px solid";
    document.getElementById("valueButtonDifficultyGame5").style.border = "0px solid";

    let descGameRankTypeGame = ""
    let descGameRankModeGame = ""
    let descGameRankdifficultyGame = ""

    let descGameRank = ""
    document.getElementById("descGameRank").innerHTML = "";

    if (infoStartGame.typeGame === "Conquest") {
        document.getElementById("valueButtonTypeGame1").style.border = "2px solid";
        document.getElementById("valueButtonTypeGame1").style.background = "firebrick";
        descGameRankTypeGame = `<span>Chế độ: Chinh phục (Hiện tại chỉ mở đấu xếp hạng)</span>`;
    } else {
        document.getElementById("valueButtonTypeGame1").style.border = "0px solid";
        document.getElementById("valueButtonTypeGame1").style.background = "#c25c5c";
    }

    if (infoStartGame.typeGame === "Solo5Mon") {
        document.getElementById("valueButtonTypeGame2").style.border = "2px solid";
        document.getElementById("valueButtonTypeGame2").style.background = "firebrick";
        descGameRankTypeGame = `<span>Chế độ: Đối kháng (Chưa mở)</span>`;
    } else {
        document.getElementById("valueButtonTypeGame2").style.border = "0px solid";
        document.getElementById("valueButtonTypeGame2").style.background = "#c25c5c";
    }

    if (infoStartGame.typeGame === "Guess") {
        document.getElementById("valueButtonTypeGame3").style.border = "2px solid";
        document.getElementById("valueButtonTypeGame3").style.background = "firebrick";
        descGameRankTypeGame = `<span>Chế độ: Dự đoán (Chưa mở)</span>`;
    } else {
        document.getElementById("valueButtonTypeGame3").style.border = "0px solid";
        document.getElementById("valueButtonTypeGame3").style.background = "#c25c5c";
    }

    if (infoStartGame.modeGame === "Guide") {
        document.getElementById("valueButtonModeGame1").style.border = "2px solid";
        document.getElementById("valueButtonModeGame1").style.background = "firebrick";
        descGameRankModeGame = `<span>Loại: Đấu tập</span>`;
    } else {
        document.getElementById("valueButtonModeGame1").style.border = "0px solid";
        document.getElementById("valueButtonModeGame1").style.background = "#c25c5c";
    }

    if (infoStartGame.modeGame === "Normal") {
        document.getElementById("valueButtonModeGame2").style.border = "2px solid";
        document.getElementById("valueButtonModeGame2").style.background = "firebrick";
        descGameRankModeGame = `<span>Loại: Đấu thường</span>`;
    } else {
        document.getElementById("valueButtonModeGame2").style.border = "0px solid";
        document.getElementById("valueButtonModeGame2").style.background = "#c25c5c";
    }

    if (infoStartGame.modeGame === "Rank") {
        document.getElementById("valueButtonModeGame3").style.border = "2px solid";
        document.getElementById("valueButtonModeGame3").style.background = "firebrick";
        descGameRankModeGame = `<span>Loại: Đấu xếp hạng (yêu cầu có 20 5Mon trở lên)</span>`;
        descGameRank = `Đấu xếp hạng để nhận điểm xếp hạng (<i class="fa-solid fa-medal"></i>), người có thứ hạng cao mỗi mùa sẽ nhận được phần thưởng`;
    } else {
        document.getElementById("valueButtonModeGame3").style.border = "0px solid";
        document.getElementById("valueButtonModeGame3").style.background = "#c25c5c";
    }

    if (infoStartGame.difficultyGame === "Easy") {
        document.getElementById("valueButtonDifficultyGame1").style.border = "1px solid";
        document.getElementById("valueButtonDifficultyGame1").style.background = "firebrick";
        descGameRankdifficultyGame = `<span>Độ khó: Dễ (x1 điểm <i class="fa-solid fa-medal"></i> khi đấu xếp hạng)</span>`;
    } else {
        document.getElementById("valueButtonDifficultyGame1").style.border = "0px solid";
        document.getElementById("valueButtonDifficultyGame1").style.background = "#c25c5c";
    }

    if (infoStartGame.difficultyGame === "Normal") {
        document.getElementById("valueButtonDifficultyGame2").style.border = "1px solid";
        document.getElementById("valueButtonDifficultyGame2").style.background = "firebrick";
        descGameRankdifficultyGame = `<span>Độ khó: Thường (x1.2 điểm <i class="fa-solid fa-medal"></i> khi đấu xếp hạng)</span>`;
    } else {
        document.getElementById("valueButtonDifficultyGame2").style.border = "0px solid";
        document.getElementById("valueButtonDifficultyGame2").style.background = "#c25c5c";
    }

    if (infoStartGame.difficultyGame === "Hard") {
        document.getElementById("valueButtonDifficultyGame3").style.border = "1px solid";
        document.getElementById("valueButtonDifficultyGame3").style.background = "firebrick";
        descGameRankdifficultyGame = `<span>Độ khó: Khó (x1.5 điểm <i class="fa-solid fa-medal"></i> khi đấu xếp hạng)</span>`;
    } else {
        document.getElementById("valueButtonDifficultyGame3").style.border = "0px solid";
        document.getElementById("valueButtonDifficultyGame3").style.background = "#c25c5c";
    }

    if (infoStartGame.difficultyGame === "Very Hard") {
        document.getElementById("valueButtonDifficultyGame4").style.border = "1px solid";
        document.getElementById("valueButtonDifficultyGame4").style.background = "firebrick";
        descGameRankdifficultyGame = `<span>Độ khó: Siêu khó (x2 điểm <i class="fa-solid fa-medal"></i> khi đấu xếp hạng)</span>`;
    } else {
        document.getElementById("valueButtonDifficultyGame4").style.border = "0px solid";
        document.getElementById("valueButtonDifficultyGame4").style.background = "#c25c5c";
    }

    if (infoStartGame.difficultyGame === "Hell") {
        document.getElementById("valueButtonDifficultyGame5").style.border = "1px solid";
        document.getElementById("valueButtonDifficultyGame5").style.background = "firebrick";
        descGameRankdifficultyGame = `<span>Độ khó: Địa ngục (x3 điểm <i class="fa-solid fa-medal"></i> khi đấu xếp hạng)</span>`;

    } else {
        document.getElementById("valueButtonDifficultyGame5").style.border = "0px solid";
        document.getElementById("valueButtonDifficultyGame5").style.background = "#c25c5c";
    }

    document.getElementById("descGameRank").innerHTML = `
<div>${descGameRankTypeGame}</div>
<div>${descGameRankModeGame}</div>
<div>${descGameRankdifficultyGame}</div>
<div>${descGameRank}</div>
`;

}

function checkButtonTypeGame(value) {
    infoStartGame.typeGame = value
    infoStartGame.modeGame = "No"
    infoStartGame.difficultyGame = "No"
    changeButtonMenuStartGame();
}

function checkButtonModeGame(value) {
    infoStartGame.modeGame = value
    changeButtonMenuStartGame();
}

function checkButtonDifficultyGame(value) {
    infoStartGame.difficultyGame = value
    changeButtonMenuStartGame();
}

function startGame() {
    closeMap();
    if (infoStartGame.typeGame === "Conquest") {
        if (infoStartGame.modeGame === "Guide") {

        } else if (infoStartGame.modeGame === "Normal") {

        } else if (infoStartGame.modeGame === "Rank") {
            if (infoStartGame.difficultyGame === "No") {
                messageOpen("Vui lòng lựa chọn độ khó")
                return;
            }
            openGameRank();
        } else {
            messageOpen("Hãy lựa chọn tập luyện hoặc đánh thường hoặc xếp hạng")
        }
    } else if (infoStartGame.typeGame === "Solo5Mon") {
        if (infoStartGame.modeGame === "Guide") {

        } else if (infoStartGame.modeGame === "Normal") {

        } else if (infoStartGame.modeGame === "Rank") {

        } else {
            messageOpen("Hãy lựa chọn tập luyện hoặc đánh thường hoặc xếp hạng")
        }
    } else if (infoStartGame.typeGame === "Guess") {
        if (infoStartGame.modeGame === "Guide") {

        } else if (infoStartGame.modeGame === "Normal") {

        } else if (infoStartGame.modeGame === "Rank") {

        } else {
            messageOpen("Hãy lựa chọn tập luyện hoặc đánh thường hoặc xếp hạng")
        }
    } else {
        messageOpen("Hãy lựa chọn chế độ chơi")
    }

}


function openGameRank() {
    closePopupContinueGame();

    if (Object.entries(typeGameConquest.battleUserPet).length < 20 && onGame === 0) {
        messageOpen("5Mon bạn mang theo không đủ, vui lòng chọn đủ 20 5Mon để tiến hành chiến đấu!")
        showOrHiddenDiv("Close")
        openBag();
        return;
    }
    showOrHiddenDiv("Close")

    console.log("Open Game executed");
    startLoading();


    setTimeout(() => {
        //Ẩn trang chủ
        document.getElementById('mainScreen').style.display = "none";
        document.getElementById('battleScreen').style.display = "flex";

        const shopZone = document.getElementById('shopZone');
        const compZone = document.getElementById('compZone');
        const timeZone = document.getElementById('timeZone');
        const inventoryZone = document.getElementById('inventoryZone');
        //Hiện shop
        shopZone.style.display = "flex";
        //Hiện tủ đồ
        inventoryZone.style.display = "flex";
        //Ẩn đối thủ
        compZone.style.display = "none";
        //Ẩn timeZone 
        timeZone.style.display = "none";

        // Thực hiện logic của openGame ở đây
        const buttonNextStep = document.getElementById('nextStepGame');

        //Chế độ dễ/bình thường/khó
        if (infoStartGame.modeGame === "Normal") {
            modeGamePoint = 1.2;
        } else if (infoStartGame.modeGame === "Hard") {
            modeGamePoint = 1.5;
        } else if (infoStartGame.modeGame === "Very Hard") {
            modeGamePoint = 2;
        } else if (infoStartGame.modeGame === "Hell") {
            modeGamePoint = 3;
        } else {
            modeGamePoint = 1;
        }

        //Reset Lock shop
        for (let k = 1; k <= 5; k++) {
            LockBattleShop[`LockBattleShop${k}`] = false;
            document.getElementById(`LockBattleShop${k}`).style.color = 'rgb(255 161 115)'
        }

        //Trường hợp onGame của người chơi = 0
        if (onGame === 0 && infoStartGame.stepGame === 0) {

            //Reset Hp 
            resetMaxHpBattle();

            typeGameConquest.reRoll = 0;
            typeGameConquest.reRollPrice = 0
            typeGameConquest.starUser = 2;

            //Gán HP
            nowHpBattleMy = (typeGameConquest.maxHpBattle + maxHpUp);
            document.querySelector('#hpBarB').querySelector('.hpText').textContent = (typeGameConquest.maxHpBattle + maxHpUp);

            typeGameConquest.battleUserPetRound = typeGameConquest.battleUserPet
            console.log("So sánh onGame === 0?")

            //Chọn nhân vật
            typeGameConquest.selectCharacterBattle = characterUser;

            //Tạo ra 4 skill
            randomSkillinShop();

            //Load thông tin đối thủ => random đối thủ
            //Lọc lấy tất cả các đối thủ có số round = 1
            const roundCompRef = ref(db, `allCompsRound/round${infoStartGame.roundGame}`);
            get(roundCompRef).then(snapshot => {
                let candidates = (snapshot.val() || []).filter(comp => comp !== null);

                console.log("Các đối thủ có thể random", candidates);
                if (candidates.length > 0) {
                    // Random một đối thủ từ danh sách đã lọc
                    let randomIndex = Math.floor(Math.random() * candidates.length);
                    let selectedComp = candidates[randomIndex];

                    typeGameConquest.usernameComp = selectedComp.usernameComp;
                    typeGameConquest.idComp = selectedComp.idComp;
                    typeGameConquest.nameComp = selectedComp.nameComp;
                    typeGameConquest.winComp = selectedComp.winComp;
                    typeGameConquest.loseComp = selectedComp.loseComp;
                    typeGameConquest.selectCharacterComp = selectedComp.selectCharacterComp;
                    typeGameConquest.dameCritA = selectedComp.dameCritA;
                    typeGameConquest.slowA = selectedComp.slowA;
                    typeGameConquest.upCooldownA = selectedComp.upCooldownA;
                    typeGameConquest.maxHpBattleComp = selectedComp.maxHpBattleComp;
                    
                    document.getElementById("textNameComp").innerText = typeGameConquest.nameComp;  
                    // Gán thông tin kỹ năng của đối thủ vào typeGameConquest.skillBattle
                    for (let i = 1; i <= 9; i++) {
                        const skillKey = `skill${i}A`;
                        if (selectedComp.slotSkillComp[skillKey]) {

                            if (selectedComp.slotSkillComp[skillKey].ID) {
                                let sLvUpSTR, sLvUpDEF, sLvUpINT, sLvUpAGI, sLvUpLUK, sLvUpHP
                                sLvUpSTR = getScaleLevelUp(selectedComp.slotSkillComp[skillKey].POWER.STR);
                                sLvUpDEF = getScaleLevelUp(selectedComp.slotSkillComp[skillKey].POWER.DEF);
                                sLvUpINT = getScaleLevelUp(selectedComp.slotSkillComp[skillKey].POWER.INT);
                                sLvUpAGI = getScaleLevelUp(selectedComp.slotSkillComp[skillKey].POWER.AGI);
                                sLvUpLUK = getScaleLevelUp(selectedComp.slotSkillComp[skillKey].POWER.LUK);
                                sLvUpHP = getScaleLevelUp(selectedComp.slotSkillComp[skillKey].POWER.HP);
                                
                                selectedComp.slotSkillComp[skillKey].LVUPSCALE = {STR: sLvUpSTR, DEF: sLvUpDEF, INT: sLvUpINT, AGI: sLvUpAGI, LUK: sLvUpLUK, HP: sLvUpHP}
                            }

                            typeGameConquest.skillBattle[skillKey] = { ...selectedComp.slotSkillComp[skillKey] };
                        }
                    }

                    //pointrank cho comp
                    Object.keys(rankGame).forEach((key) => {
                        if (key === typeGameConquest.usernameComp) {
                            pointRankComp = rankGame[key].rankPoint.typeGameConquest;
                        }
                    });

                    console.log("Đối thủ đã chọn:", selectedComp);
                    console.log("Kỹ năng đã gán vào typeGameConquest.skillBattle:", typeGameConquest.skillBattle);
                } else {
                    console.log("Không tìm thấy đối thủ có cùng roundComp với roundGame.");
                }

                //Khởi tạo skill cho các slot skill1A -> 9A
                createSkill("skillComp");
                onGame = 1;
                infoStartGame.stepGame = 1;

                //Đổi nút tiếp tục thành => onclick="nextStepGame1()"
                buttonNextStep.onclick = () => nextStepGame1();
                buttonNextStep.innerText = "Tiếp tục"

                
            });
        } else {
            //Trường hợp round của người chơi > 0
            nowHpBattleMy = (typeGameConquest.maxHpBattle + maxHpUp);
            document.querySelector('#hpBarB').querySelector('.hpText').textContent = (typeGameConquest.maxHpBattle + maxHpUp);

            //load thông tin của mình từ battlePetUseSlotRound sang cho typeGameConquest.skillBattle
            for (let skillKey = 0; skillKey < Object.keys(typeGameConquest.battlePetUseSlotRound).length; skillKey++) {
                let key = Object.keys(typeGameConquest.battlePetUseSlotRound)[skillKey]; // Lấy key thực tế từ Object.keys()
                let skill = typeGameConquest.battlePetUseSlotRound[key]; // Lấy giá trị skill dựa trên key
                if (skill.ID) {
                    typeGameConquest.skillBattle[key] = typeGameConquest.battlePetUseSlotRound[key]
                }
            }

            //Khởi tạo skill trong các slot shop
            createSkill("shop");

            //Khởi tạo skill cho các slot inv1 -> 10
            createSkill("inventory");

            //Load load slot skill
            createSkill("slotSkill");

            //Load thông tin đối thủ

            //Khởi tạo skill cho các slot skill1A -> 9A
            createSkill("skillComp");

            if (infoStartGame.stepGame === 1) {
                buttonNextStep.onclick = () => nextStepGame1();
                buttonNextStep.innerText = "Tiếp tục"
            } else if (infoStartGame.stepGame === 2) {
                nextStepGame1();
                buttonNextStep.onclick = () => startBattle();
                buttonNextStep.innerText = "⚔️ Chiến đấu"
            } else if (infoStartGame.stepGame === 3) {
                nextStepGame1();
                startBattle();
            }

        }

        //Load cho các slot skill
        loadEventSlotBattle();
        internalUp();
        resetHp5Mon();
        updateHpAndRageBar5Mon();
        updateHpbar();

        // loadSlotLock();

        document.getElementById('qtyResetShop').innerText = typeGameConquest.reRollPrice;
        document.getElementById('starUser').innerText = typeGameConquest.starUser;

        //Hiển thị số trận win/lose trong hpUser
        document.getElementById("hpUserWinOrLose").innerHTML = `${typeGameConquest.winBattle}/${typeGameConquest.loseBattle}`;
        // Giảm hpUser (Giới hạn tối đa 10 lần thua)
        let maxLose = 10; // Số lần thua tối đa
        let perWinLose = typeGameConquest.loseBattle <= maxLose ? 100 - (typeGameConquest.loseBattle * 10) : 0; // Trừ 10% cho mỗi lần thua
        // Cập nhật chiều rộng thanh HP
        document.getElementById("hpUser").style.width = `${perWinLose}%`;
        // Nếu người chơi hết HP, bạn có thể thêm xử lý thua cuộc
        if (typeGameConquest.loseBattle >= maxLose) {
            console.log("Game Over! Người chơi đã thua tối đa 10 lần.");
        }
        settingScreenBattle();
    }, 1000);
    endLoading();
}

function resetMaxHpBattle() {
    // let allHP5Mon = 0;
    // Object.values(typeGameConquest.battlePetUseSlotRound).forEach(slot => {
    //     if (slot.POWER && typeof slot.POWER.HP === "number") {
    //         allHP5Mon += slot.POWER.HP;
    //     }
    // });

    typeGameConquest.maxHpBattle = defaultHP + maxHpUp;
}



function nextStepGame1() {
    infoStartGame.stepGame = 2;
    checkUpdateLevel();
    console.log("Next Step Game 1 executed");
    startLoading();
    setTimeout(() => {
        const shopZone = document.getElementById('shopZone');
        const compZone = document.getElementById('compZone');
        const timeZone = document.getElementById('timeZone');
        const inventoryZone = document.getElementById('inventoryZone');
        const buttonNextStep = document.getElementById('nextStepGame');

        //Chuyển skill của đối thủ không kéo được
        const skillBattleOn = document.querySelectorAll('.skill');
        skillBattleOn.forEach((skill) => {
            if (skill.parentElement.parentElement.id === "skillBarA") {
                skill.setAttribute('draggable', 'false');
            }
        });

        //Ẩn shop
        shopZone.style.display = "none";
        //Hiện tủ đồ
        inventoryZone.style.display = "flex";
        //Hiện đối thủ
        compZone.style.display = "flex";
        //Ẩn timeZone 
        timeZone.style.display = "none";

        //Xóa skill trong shop
        Object.keys(typeGameConquest.battlePetInShop).forEach((skill) => {
            let index = skill.match(/\d+$/)?.[0]; // lấy số ở cuối skill.parentElement.id
            let skillLock = `LockBattleShop${index}`;
            if (LockBattleShop[skillLock] === false) {
                typeGameConquest.battlePetInShop[skill] = defaultSTT5Mon; // Xóa kỹ năng khỏi battlePetInShop
                LockBattleShop[skillLock] = false;
                document.getElementById(skillLock).style.color = 'rgb(255 161 115)'
            }
        });

        //Lấy thông tin đối thủ
        //Lấy chỉ số
        //HP
        document.querySelector('#hpBarA').querySelector('.hpText').textContent = typeGameConquest.maxHpBattleComp;
        document.querySelector('#hpBarA').querySelector('.hpFill').style.width = "100%";
        nowHpBattleComp = typeGameConquest.maxHpBattleComp;

        //Đổi nút tiếp tục thành => onclick="startBattle()"
        buttonNextStep.onclick = () => startBattle();
        buttonNextStep.innerText = "⚔️ Chiến đấu"
    }, 1000);
    endLoading();
}


let curentHpAll5Mon = {
    skill1A: 0,
    skill2A: 0,
    skill3A: 0,
    skill4A: 0,
    skill5A: 0,
    skill6A: 0,
    skill7A: 0,
    skill8A: 0,
    skill9A: 0,

    skill1B: 0,
    skill2B: 0,
    skill3B: 0,
    skill4B: 0,
    skill5B: 0,
    skill6B: 0,
    skill7B: 0,
    skill8B: 0,
    skill9B: 0,
}

let maxHpAll5Mon = {
    skill1A: 0,
    skill2A: 0,
    skill3A: 0,
    skill4A: 0,
    skill5A: 0,
    skill6A: 0,
    skill7A: 0,
    skill8A: 0,
    skill9A: 0,

    skill1B: 0,
    skill2B: 0,
    skill3B: 0,
    skill4B: 0,
    skill5B: 0,
    skill6B: 0,
    skill7B: 0,
    skill8B: 0,
    skill9B: 0,
}

function resetHp5Mon() {
    Object.keys(maxHpAll5Mon).forEach((skill) => {
        if (
            typeGameConquest.skillBattle[skill] &&
            typeGameConquest.skillBattle[skill].POWER
        ) {
            if (typeGameConquest.skillBattle[skill].POWER.HP <= 0) {
                maxHpAll5Mon[skill] = 0;
            } else {
                const baseScale = 1;
                const scaleHP = baseScale * Math.log10(typeGameConquest.skillBattle[skill].POWER.HP);
                let valuePower = 2 * typeGameConquest.skillBattle[skill].POWER.HP / scaleHP + 100;

                let baseHP = Math.round(valuePower);

                maxHpAll5Mon[skill] = baseHP || 0;
            }
        }
    });

    // ✅ Sao chép kết quả sau khi tính toán
    curentHpAll5Mon = { ...maxHpAll5Mon };

    [typeGameConquest.skillBattle, typeGameConquest.battlePetUseSlotRound].forEach((obj) => {
        Object.values(obj).forEach((skill) => {
            skill.COOLDOWN[4] = 0;
            skill.DAME[3] = 0;
            skill.HEAL[3] = 0;
            skill.SHIELD[3] = 0;
            skill.BURN[3] = 0;
            skill.POISON[3] = 0;
            skill.CRIT[3] = 0;
        });
    });

    updateHpAndRageBar5Mon();
}

function startBattle() {
    startLoading();
    infoStartGame.stepGame = 3;

    setTimeout(() => {
        console.log("Start Battle executed");
        //Lưu thông tin người dùng, trận đấu
        //Reset thông số shield/burn/poison của 2 team
        nowShieldBattleMy = 0;
        nowBurnBattleMy = 0;
        nowPoisonBattleMy = 0;
        nowShieldBattleComp = 0;
        nowBurnBattleComp = 0;
        nowPoisonBattleComp = 0;

        //Tính HP cho tất cả các 5Mon 2 bên
        resetHp5Mon();

        //Chuyển tất cả skill không kéo được
        const skillBattleOn = document.querySelectorAll('.skill');
        skillBattleOn.forEach((skill) => {
            skill.setAttribute('draggable', 'false');
            console.log("Chuyển về không kéo được")
        });
        const slotBattleOn = document.querySelectorAll('.slotSkill');
        slotBattleOn.forEach((slot) => {
            slot.classList.add("occupied")
            console.log("Chuyển về slot không đưa skill vào được")
        });

        //Xóa tất cả các hiệu ứng uplevel
        document.querySelectorAll('.updateSkillLevel').forEach(div => {
            div.classList.remove('updateSkillLevel');
        });

        document.querySelectorAll('.upgrade-icon').forEach(icon => {
            icon.remove();
        });

        updateHpbar();
        setTimeout(() => {
            battleStartTime(true);
            // cooldownSkillBattleB();
            // cooldownSkillBattleA();
        }, 3000);
        const shopZone = document.getElementById('shopZone');
        const compZone = document.getElementById('compZone');
        const timeZone = document.getElementById('timeZone');
        const inventoryZone = document.getElementById('inventoryZone');

        endGame = false;

        //Ẩn shop
        shopZone.style.display = "none";
        //Ẩn tủ đồ
        inventoryZone.style.display = "none";
        //Hiện đối thủ
        compZone.style.display = "flex";
        //Hiện timeZone 
        timeZone.style.display = "flex";

        // Bắt đầu vòng lặp cooldown skill
        for (let s = 1; s <= 9; s++) {
            const skillB = typeGameConquest.skillBattle[`skill${s}B`];
            if (skillB.COOLDOWN[0] > 0) {
                baseAttack(`skill${s}B`, false);
            }

            const skillA = typeGameConquest.skillBattle[`skill${s}A`];
            if (skillA.COOLDOWN[0] > 0) {
                baseAttack(`skill${s}A`, true);
            }
        }

        //đạt điều kiện thì chiến thắng và gọi endBattle() => dừng tất cả cooldown và trừ máu

        //Đổi nút tiếp tục thành => onclick="startBattle()"

    }, 2000);
    endLoading();
}



let intervalID = null;
let intervalIdOverTime = null;

function endBattle(whoWin, pointsThisRound) {
    const shopZone = document.getElementById('shopZone');
    const compZone = document.getElementById('compZone');
    const timeZone = document.getElementById('timeZone');
    const inventoryZone = document.getElementById('inventoryZone');
    const buttonNextStep = document.getElementById('nextStepGame');

    //Cộng điểm / trừ điểm
    if (whoWin === "Comp") {
        typeGameConquest.loseBattle += 1;
        typeGameConquest.pointBattle -= pointsThisRound;
    } else {
        typeGameConquest.winBattle += 1;
        typeGameConquest.pointBattle += pointsThisRound;
    }

    //Tìm nhân vật để tăng chỉ số mỗi round cho người chơi user
    upSTTRoundWithCharacter();

    //Cộng star mỗi round
    const bonusStars = Math.floor(typeGameConquest.starUser / 5);
    typeGameConquest.starUser += infoStartGame.roundGame + 1 + bonusStars;
    document.getElementById("starUser").innerText = typeGameConquest.starUser;
    
    //Tăng round
    infoStartGame.roundGame += 1 //Tăng round sau khi endBattle
    //Reset Battle time

    clearInterval(intervalID)
    intervalID = null;
    document.getElementById('cooldownBarContainer').classList.remove('comp');
    //Reset hiệu ứng trừ máu khi over time
    clearInterval(intervalIdOverTime)
    intervalIdOverTime = null
    damageOverTime = 1 //+++++++++

    //Reset thông số shield/burn/poison của 2 team
    nowShieldBattleMy = 0;
    nowBurnBattleMy = 0;
    nowPoisonBattleMy = 0;
    nowShieldBattleComp = 0;
    nowBurnBattleComp = 0;
    nowPoisonBattleComp = 0;

    skillsSleepA = { skill1A: 0, skill2A: 0, skill3A: 0, skill4A: 0, skill5A: 0, skill6A: 0, skill7A: 0, skill8A: 0, skill9A: 0 };
    skillsSleepB = { skill1B: 0, skill2B: 0, skill3B: 0, skill4B: 0, skill5B: 0, skill6B: 0, skill7B: 0, skill8B: 0, skill9B: 0 };
    skillsDeleteA = { skill1A: 0, skill2A: 0, skill3A: 0, skill4A: 0, skill5A: 0, skill6A: 0, skill7A: 0, skill8A: 0, skill9A: 0 };
    skillsDeleteB = { skill1B: 0, skill2B: 0, skill3B: 0, skill4B: 0, skill5B: 0, skill6B: 0, skill7B: 0, skill8B: 0, skill9B: 0 };
    // limitSkillsA = {skill1A: 0,skill2A: 0,skill3A: 0,skill4A: 0,skill5A: 0,skill6A: 0,skill7A: 0,skill8A: 0,skill9A: 0};
    // limitSkillsB = {skill1B: 0,skill2B: 0,skill3B: 0,skill4B: 0,skill5B: 0,skill6B: 0,skill7B: 0,skill8B: 0,skill9B: 0};
    skillQueueMirror = {};
    skillQueue = {};
    countSkillQueue = 0;
    countSkillQueueMirror = 0;

    skillsSpeedA = { skill1A: 0, skill2A: 0, skill3A: 0, skill4A: 0, skill5A: 0, skill6A: 0, skill7A: 0, skill8A: 0, skill9A: 0 };
    skillsSpeedB = { skill1B: 0, skill2B: 0, skill3B: 0, skill4B: 0, skill5B: 0, skill6B: 0, skill7B: 0, skill8B: 0, skill9B: 0 };

    // Xóa tất cả các thẻ div có class "sleepTimer"
    ['sleepTimer', 'hasteTimer', 'slowTimer'].forEach(timerClass => {
        document.querySelectorAll(`.${timerClass}`).forEach(timerEl => {
            const skillEl = timerEl.parentElement;

            // Tên biến intervalId tương ứng với từng loại
            let intervalKey = '';
            if (timerClass === 'sleepTimer') intervalKey = 'sleepIntervalId';
            else if (timerClass === 'hasteTimer') intervalKey = 'hasteIntervalId';
            else if (timerClass === 'slowTimer') intervalKey = 'slowIntervalId';

            if (skillEl && skillEl[intervalKey]) {
                clearInterval(skillEl[intervalKey]);
                skillEl[intervalKey] = null;
            }

            timerEl.remove();
        });
    });


    //reset Hp5Mon
    resetHp5Mon();

    console.log("skillQueueMirror", skillQueueMirror, skillQueue)
    Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
        const skillElement = document.getElementById(skill);
        if (skillElement) {
            const skillChild = skillElement.querySelector('.skill');
            if (skillChild && skillChild.classList.contains('sleep')) {
                skillChild.classList.remove('sleep');
            }
        }
    });

    Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
        const skillElement = document.getElementById(skill);
        if (skillElement) {
            const skillChild = skillElement.querySelector('.skill');
            if (skillChild && skillChild.classList.contains('delete')) {
                skillChild.classList.remove('delete');
            }
        }
    });

    //Reset thời gian chiến đấu
    cooldownDuration = 90; //++++++++
    decrementPercent = 100;
    cooldownRemaining = cooldownDuration; // Thời gian còn lại


    endGame = true;
    infoStartGame.stepGame = 1;
    //Thêm điểm win round vào biến điểm cho user + tăng thêm 1 round lên + lưu data người chơi vào data

    //Random đồ trong shop
    //3 đồ trong biến petBattle, 1 đồ random từ compPet

    //Xóa toàn bộ thông tin comp round cũ => load comp round mới

    //Hiện shop
    shopZone.style.display = "flex";
    //Hiện tủ đồ
    inventoryZone.style.display = "flex";
    //Ẩn đối thủ
    compZone.style.display = "none";
    //Ẩn timeZone 
    timeZone.style.display = "none";

    //reset Hp người chơi
    //HP
    document.querySelector('#hpBarB').querySelector('.hpText').textContent = (typeGameConquest.maxHpBattle + maxHpUp);
    document.querySelector('#hpBarB').querySelector('.hpFill').style.width = "100%";
    nowHpBattleMy = (typeGameConquest.maxHpBattle + maxHpUp);
    nowShieldBattleMy = 0;
    document.querySelector('#hpBarB').querySelector('.shieldText').textContent = "";
    document.querySelector('#hpBarB').querySelector('.shieldFill').style.width = "0%";
    console.log("Win - reset Hp của ta:", nowHpBattleMy)

    //Đổi nút tiếp tục thành => onclick="nextStepGame1()"
    buttonNextStep.onclick = () => nextStepGame1();
    buttonNextStep.innerText = "Tiếp tục"

    //Chuyển skill về kéo được
    const skillBattleOn = document.querySelectorAll('.skill');
    skillBattleOn.forEach((skill) => {
        if (skill.parentElement.parentElement.id === "skillBarA") {

        } else {
            skill.setAttribute('draggable', 'true');
            console.log("Chuyển về kéo được")
        }
    });
    const slotBattleOn = document.querySelectorAll('.slotSkill');
    slotBattleOn.forEach((slot) => {
        // Kiểm tra nếu có phần tử con với class 'skill'
        const hasSkill = Array.from(slot.children).some(child => child.classList.contains('skill'));

        if (hasSkill) {
            console.log('Slot này có chứa skill!');
            // Thực hiện logic khi slot có phần tử con là skill
        } else {
            console.log('Slot này không có chứa skill!');
            slot.classList.remove("occupied")
            // Thực hiện logic khi slot không có phần tử con là skill
        }
    });


    console.log("Thông tin mới", typeGameConquest.skillBattle)
    updateSttForSkillAffter();

    //Chuyển hiển thị nộ về 0 hết
    const overlays = document.querySelectorAll('.skillCooldownOverlay');
    overlays.forEach((overlay) => {
        overlay.style.transitionDuration = '0ms'; // Không có hiệu ứng chuyển tiếp ban đầu
        overlay.style.transform = 'scaleY(0)';    // Đặt overlay đầy (hiện full)
    });

    //Random tìm đối thủ mới
    const roundCompRef = ref(db, `allCompsRound/round${infoStartGame.roundGame}`);
    get(roundCompRef).then(snapshot => {
        let candidates = (snapshot.val() || []).filter(comp => comp !== null);
        
        console.log("Các đối thủ có thể random", candidates);
        if (candidates.length > 0) {
            // Random một đối thủ từ danh sách đã lọc
            let randomIndex = Math.floor(Math.random() * candidates.length);
            let selectedComp = candidates[randomIndex];
            typeGameConquest.usernameComp = selectedComp.usernameComp;
            typeGameConquest.idComp = selectedComp.idComp;
            typeGameConquest.nameComp = selectedComp.nameComp;
            typeGameConquest.winComp = selectedComp.winComp;
            typeGameConquest.loseComp = selectedComp.loseComp;
            typeGameConquest.maxHpBattleComp = selectedComp.maxHpBattleComp;
            document.getElementById("textNameComp").innerText = typeGameConquest.nameComp;
            // Gán thông tin kỹ năng của đối thủ vào typeGameConquest.skillBattle
            for (let i = 1; i <= 9; i++) {
                const skillKey = `skill${i}A`;
                if (selectedComp.slotSkillComp[skillKey]) {
                    typeGameConquest.skillBattle[skillKey] = { ...selectedComp.slotSkillComp[skillKey] };
                }
            }

            //pointrank cho comp
            Object.keys(rankGame).forEach((key) => {
                if (key === typeGameConquest.usernameComp) {
                    pointRankComp = rankGame[key].rankPoint.typeGameConquest;
                }
            });

            console.log("Đối thủ đã chọn:", selectedComp);
            console.log("Kỹ năng đã gán vào typeGameConquest.skillBattle:", typeGameConquest.skillBattle);
        } else {
            console.log("Không tìm thấy đối thủ có cùng roundComp với roundGame.");
        }

        for (let s = 1; s <= 9; s++) {
            document.querySelector(`#skill${s}A`).innerHTML = `<div class="skillCooldownOverlay"></div>`
        }

        //Khởi tạo skill cho các slot skill1A -> 9A
        createSkill("skillComp");
    });

    //Tắt thông báo chiến thắng/thua cuộc
    const resultScreen = document.getElementById('resultScreen');
    resultScreen.classList.add('hidden'); // Hiển thị màn hình

    //Reset nộ và dame + thêm trong trận cho tất cả
    Object.values(typeGameConquest.skillBattle).forEach((skill) => {
        skill.COOLDOWN[4] = 0;
        skill.DAME[3] = 0;
        skill.HEAL[3] = 0;
        skill.SHIELD[3] = 0;
        skill.BURN[3] = 0;
        skill.POISON[3] = 0;
        skill.CRIT[3] = 0;
    });

    //Hiển thị số trận win/lose trong hpUser
    document.getElementById("hpUserWinOrLose").innerHTML = `${typeGameConquest.winBattle}/${typeGameConquest.loseBattle}`;
    // Giảm hpUser (Giới hạn tối đa 10 lần thua)
    let maxLose = 10; // Số lần thua tối đa
    let perWinLose = typeGameConquest.loseBattle <= maxLose ? 100 - (typeGameConquest.loseBattle * 10) : 0; // Trừ 10% cho mỗi lần thua
    // Cập nhật chiều rộng thanh HP
    document.getElementById("hpUser").style.width = `${perWinLose}%`;
    // Nếu người chơi hết HP, bạn có thể thêm xử lý thua cuộc
    if (typeGameConquest.loseBattle >= maxLose) {
        console.log("Game Over! Người chơi đã thua tối đa 10 lần.");
    }

    updateHpbar();
}

function upSTTRoundWithCharacter() {
    let addMultiFn = 0;
    //+++++
    //Kiểm tra xem nhân vật battle là gì
    for (let i = 0; i < allCharacter.length; i++) {
        if (allCharacter[i].id === typeGameConquest.selectCharacterBattle) {

            typeGameConquest.maxHpBattle += allCharacter[i].hpMax

            Object.keys(typeGameConquest.skillBattle).forEach((key) => {
                if (typeGameConquest.skillBattle[key].ID !== "" &&
                    key.endsWith("B")) {
                    if (typeGameConquest.skillBattle[key].DAME[0] > 0 && allCharacter[i].upDame > 0) {
                        typeGameConquest.skillBattle[key].DAME[1] += allCharacter[i].upDame
                    }
                    if (typeGameConquest.skillBattle[key].HEAL[0] > 0 && allCharacter[i].upHeal > 0) {
                        typeGameConquest.skillBattle[key].HEAL[1] += allCharacter[i].upHeal
                    }
                    if (typeGameConquest.skillBattle[key].SHIELD[0] > 0 && allCharacter[i].upShield > 0) {
                        typeGameConquest.skillBattle[key].SHIELD[1] += allCharacter[i].upShield
                    }
                    if (typeGameConquest.skillBattle[key].BURN[0] > 0 && allCharacter[i].upBurn > 0) {
                        typeGameConquest.skillBattle[key].BURN[1] += allCharacter[i].upBurn
                    }
                    if (typeGameConquest.skillBattle[key].POISON[0] > 0 && allCharacter[i].upPoison > 0) {
                        typeGameConquest.skillBattle[key].POISON[1] += allCharacter[i].upPoison
                    }
                    if (typeGameConquest.skillBattle[key].CRIT[0] > 0 && allCharacter[i].upCrit > 0) {
                        typeGameConquest.skillBattle[key].CRIT[1] += allCharacter[i].upCrit
                    }
                    //Sau 3 round thì mới cộng multi ngẫu nhiên 1 5mon

                    // if (typeGameConquest.skillBattle[key].COOLDOWN[1] > 0 && allCharacter[i].upMulti > 0 && infoStartGame.roundGame % 3 === 0 && addMultiFn === 0) {
                    //     // Lọc danh sách các skill kết thúc bằng "B"
                    //     const skillBKeys = Object.keys(typeGameConquest.skillBattle).filter(key1 =>
                    //         typeGameConquest.skillBattle[key1].ID !== "" && key1.endsWith("B")
                    //     );

                    //     if (skillBKeys.length > 0) {
                    //         // Chọn ngẫu nhiên một skill từ danh sách
                    //         const randomKey = skillBKeys[Math.floor(Math.random() * skillBKeys.length)];

                    //         // Cập nhật COOLDOWN của skill ngẫu nhiên
                    //         typeGameConquest.skillBattle[randomKey].COOLDOWN[2] += allCharacter[i].upMulti;
                    //         addMultiFn = 1;

                    //         console.log(`Skill "${randomKey}" được random và cập nhật COOLDOWN!`);
                    //     } else {
                    //         console.log("Không có skill nào kết thúc bằng 'B'.");
                    //     }
                    // }
                }
            });

            if (allCharacter[i].upCooldown > 0) {
                typeGameConquest.upCooldownB += allCharacter[i].upCooldown
            }
            if (allCharacter[i].slow > 0) {
                typeGameConquest.slowB += allCharacter[i].slow
            }
            if (allCharacter[i].dameCrit > 0) {
                typeGameConquest.dameCritB += allCharacter[i].dameCrit
            }

            updateSttForSkillAffter();
            break;
        }
    }
}

function stopSkillGame() {
    // Chọn tất cả các phần tử có class .skillCooldownOverlay
    const overlays = document.querySelectorAll('.skillCooldownOverlay');

    // Duyệt qua từng phần tử và thay đổi trực tiếp thuộc tính background
    overlays.forEach((overlay) => {
        overlay.style.transitionDuration = '0ms'; // Không có hiệu ứng chuyển tiếp ban đầu
        overlay.style.transform = 'scaleY(0)';    // Đặt overlay đầy (hiện full)
    });

    // Hủy tất cả requestAnimationFrame
    animationFrameIds.forEach(frameId => cancelAnimationFrame(frameId));
    animationFrameIds = []; // Xóa toàn bộ ID đã lưu

    console.log("Background changed to none");
}

//Khi thoát hoặc thua trận trong game
function outGameRank() {
    closePopupContinueGame();

    startLoading();
    setTimeout(() => {

        //Cộng điểm rank & reset điểm trong game
        if (infoStartGame.roundGame <= 1) {
            pointRank.typeGameConquest -= 10;
        } else {
            pointRank.typeGameConquest += typeGameConquest.pointBattle;
        }

        resetOutGame();

        typeGameConquest.pointBattle = 0;

        // Xóa hết skill trong slot
        Object.keys(typeGameConquest.skillBattle).forEach((key) => {
            typeGameConquest.skillBattle[key] = defaultSTT5Mon;
        });

        Object.keys(typeGameConquest.battlePetUseSlotRound).forEach((key) => {
            typeGameConquest.battlePetUseSlotRound[key] = defaultSTT5Mon;
        });

        // Xóa hết skill trong inventory
        Object.keys(typeGameConquest.battlePetInInventory).forEach((key) => {
            typeGameConquest.battlePetInInventory[key] = defaultSTT5Mon;
        });

        // Xóa skill trong shop
        Object.keys(typeGameConquest.battlePetInShop).forEach((key) => {
            typeGameConquest.battlePetInShop[key] = defaultSTT5Mon;
            let index = key.match(/\d+$/)?.[0]; // lấy số ở cuối skill.parentElement.id
            let skillLock = `LockBattleShop${index}`;
            LockBattleShop[skillLock] = false;
            document.getElementById(skillLock).style.color = 'rgb(255 161 115)'
        });

        //Xóa toàn bộ div skill
        for (let i = 1; i <= 9; i++) {
            const skillCompSlot = `skill${i}A`;
            const skillCompDiv = document.querySelector(`#${skillCompSlot}`);
            skillCompDiv.innerHTML = `<div class="skillCooldownOverlay"></div>`
        }

        for (let i = 1; i <= 9; i++) {
            const skillCompSlot = `skill${i}B`;
            const skillCompDiv = document.querySelector(`#${skillCompSlot}`);
            skillCompDiv.innerHTML = `<div class="skillCooldownOverlay"></div>`

            skillCompDiv.classList.remove("occupied")
        }

        for (let i = 0; i < 9; i++) {
            const skillCompSlot = `battleInv${i + 1}`;
            const skillCompDiv = document.querySelector(`#${skillCompSlot}`);
            skillCompDiv.innerHTML = ""
            skillCompDiv.classList.remove("occupied")
        }

        for (let i = 0; i < 5; i++) {
            const skillCompSlot = `battleShop${i + 1}`;
            const skillCompDiv = document.querySelector(`#${skillCompSlot}`);
            skillCompDiv.innerHTML = ""
        }

        loadAllData();

        //reset biến random id skill
        idSkillRND = 0;

        document.getElementById("mainScreen").style.display = "flex";
        document.getElementById("battleScreen").style.display = "none";
        document.getElementById('nextStepGame').onclick = () => nextStepGame1();
        document.getElementById('nextStepGame').innerText = "Tiếp tục"
        resetGoldAndTicket();
        closePopupSetting();
    }, 1000);
    endLoading();
}

let LockBattleShop = {
    LockBattleShop1: false,
    LockBattleShop2: false,
    LockBattleShop3: false,
    LockBattleShop4: false,
    LockBattleShop5: false,
}
//Lọc 5mon shop - khóa 5mon shop
function lock5MonShop(item) {
    let index = item.match(/\d+$/)?.[0]; // lấy số ở cuối skill.parentElement.id
    let skill = `battleShop${index}`;

    if (typeGameConquest.battlePetInShop[skill]?.ID) {
        if (LockBattleShop[item] === true) {
            LockBattleShop[item] = false;
            document.getElementById(item).style.color = 'rgb(255 161 115)';
        } else {
            LockBattleShop[item] = true;
            document.getElementById(item).style.color = 'rgb(255 85 0)';
        }
    }
}

function reRollShop() { //++++++++++++++
    const resetButton = document.getElementById("resetShop");

    if (typeGameConquest.starUser >= typeGameConquest.reRollPrice) {
        randomSkillinShop();
        typeGameConquest.starUser -= typeGameConquest.reRollPrice
        typeGameConquest.reRoll += 1
        typeGameConquest.reRollPrice += typeGameConquest.reRoll
        document.getElementById("qtyResetShop").innerText = typeGameConquest.reRollPrice;
        document.getElementById("starUser").innerText = typeGameConquest.starUser;
    } else {
        messageOpen(`Không đủ sao để làm mới, cần ${typeGameConquest.reRollPrice} <i class="fa-solid fa-splotch"></i>`)
    }
}
//Hàm random skill
function randomSkillinShop() {
    const battleUserPetRound1 = structuredClone(typeGameConquest.battleUserPetRound);

    // Khởi tạo các slot shop
    for (let i = 0; i < 5; i++) {
        //Kiểm tra xem có lock shop không
        if (LockBattleShop[`LockBattleShop${i + 1}`] === false) {
            typeGameConquest.battlePetInShop[`battleShop${i + 1}`] = defaultSTT5Mon
        }
    }

    // Lấy toàn bộ danh sách kỹ năng
    const allSkills = Object.values(battleUserPetRound1);

    // Lưu trữ danh sách kỹ năng đã chọn theo ID (để tránh trùng)
    let selectedSkillIDs = [];

    for (let i = 0; i < 5; i++) {
        //Kiểm tra xem có lock shop không
        if (LockBattleShop[`LockBattleShop${i + 1}`] === true) {
            continue;
        }

        const availableSkills = allSkills.filter(skill => !selectedSkillIDs.includes(skill.ID));

        if (availableSkills.length === 0) {
            console.warn("Không còn kỹ năng nào để chọn!");
            break;
        }

        const randomIndex = Math.floor(Math.random() * availableSkills.length);
        const selectedSkill = availableSkills[randomIndex];

        selectedSkillIDs.push(selectedSkill.ID); // Ghi lại ID đã chọn

        selectedSkill.PRICESELL = 0;
        let sLvUpSTR, sLvUpDEF, sLvUpINT, sLvUpAGI, sLvUpLUK, sLvUpHP
        sLvUpSTR = getScaleLevelUp(selectedSkill.POWER.STR);
        sLvUpDEF = getScaleLevelUp(selectedSkill.POWER.DEF);
        sLvUpINT = getScaleLevelUp(selectedSkill.POWER.INT);
        sLvUpAGI = getScaleLevelUp(selectedSkill.POWER.AGI);
        sLvUpLUK = getScaleLevelUp(selectedSkill.POWER.LUK);
        sLvUpHP = getScaleLevelUp(selectedSkill.POWER.HP);
        
        selectedSkill.LVUPSCALE = {STR: sLvUpSTR, DEF: sLvUpDEF, INT: sLvUpINT, AGI: sLvUpAGI, LUK: sLvUpLUK, HP: sLvUpHP}
        console.log("selectedSkill", selectedSkill)
        // Đặt vào UI
        const shopSlot = `battleShop${i + 1}`;
        const shopDiv = document.querySelector(`#${shopSlot}`);

        let URLimg = selectedSkill.URLimg[`Lv${selectedSkill.LEVEL}`] || selectedSkill.URLimg['Lv1'];
        
        if (shopDiv) {
            shopDiv.innerHTML = `
            <div 
            id="skill${idSkillRND}" 
            class="skill"
            draggable="true"
            style="background-image: url('${URLimg}')"
            data-skill='{"ID": "${selectedSkill.ID}", "LEVEL": ${selectedSkill.LEVEL}}'>
            </div>`;

            let dameSkillText = ``;
            const dameSkillDiv = document.querySelector(`#skill${idSkillRND}`);

            if (dameSkillDiv) {
                if (selectedSkill.DAME[0] > 0) {
                    dameSkillText += `<div class="skill-dame">${Number(selectedSkill.DAME[0])}</div>`;
                }
                if (selectedSkill.HEAL[0] > 0) {
                    dameSkillText += `<div class="skill-heal">${Number(selectedSkill.HEAL[0])}</div>`;
                }
                if (selectedSkill.SHIELD[0] > 0) {
                    dameSkillText += `<div class="skill-shield">${Number(selectedSkill.SHIELD[0])}</div>`;
                }
                if (selectedSkill.BURN[0] > 0) {
                    dameSkillText += `<div class="skill-burn">${Number(selectedSkill.BURN[0])}</div>`;
                }
                if (selectedSkill.POISON[0] > 0) {
                    dameSkillText += `<div class="skill-poison">${Number(selectedSkill.POISON[0])}</div>`;
                }
                if (selectedSkill.EFFECT.includes("Freeze")) {
                    dameSkillText += `<div class="skill-freeze">${Number(selectedSkill.COOLDOWN[0] / 2 / 1000 * selectedSkill.LEVEL)}</div>`;
                }

                dameSkillDiv.innerHTML = `
                <div class="levelSkillColor" style="position: absolute;font-size: 16px;font-weight: bold;color: #d80789;text-shadow: 0px 1px 2px #0000008a;top: -8px;right: -8px;">
                <i class="fa-solid fa-diamond"></i>
                <span class="levelSkillText" style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);font-size: 12px;color: white;font-weight: bold;">${selectedSkill.LEVEL}</span>
                </div>

                <div class="dameSkillText" style="display: flex; flex-direction: row; align-items: center;">
                ${dameSkillText}
                </div>

                <div style="position: absolute;font-size: 18px;font-weight: bold;color: rgb(0 88 255);text-shadow: 1px 1px 2px #140a03;
                top: -6px; left: -6px; z-index: 1;">
                    <i class="fa-solid fa-splotch" style="
                        position: absolute;
                    "></i>
                    <span class="starSkillText" style="position: absolute;font-size: 10px;color: #ffffff;
                    font-weight: bold;min-width: 25px;top: 2px;left: -3px;
                    ">
                        ${selectedSkill.PRICESELL + selectedSkill.PRICE || selectedSkill.PRICE}
                    </span>
                </div>`
                    ;


            }
        }

        typeGameConquest.battlePetInShop[shopSlot] = selectedSkill;
        console.log("battlePetInShop2", typeGameConquest.battlePetInShop);

        idSkillRND += 1;
    }

    //Tạo highlight cho skill theo level
    highlightSkillLevel();

    //Load event cho các slot
    loadEventSkillBattle();

    //Load event click hiện info cho các skill
    createInfo5mon();

    //Kiểm tra có skill nào có thể update không
    checkUpdateLevel();
}

function randomSkillinShop1() {
    //Copy tạo ra các skill để random từ battleUserPetRound
    console.log("battleUserPet", typeGameConquest.battleUserPet)
    console.log("battleUserPetRound", typeGameConquest.battleUserPetRound)


    const battleUserPetRound1 = structuredClone(typeGameConquest.battleUserPetRound);
    // var rareLv1 = [95,90,85,80,70,60,45,25,10,5,4,3,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    // var rareLv2 = [5,10,15,20,25,30,40,49,58,59,54,49,38,29,20,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    // var rareLv3 = [0,0,0,0,5,10,15,25,30,33,38,43,50,55,60,65,70,60,50,40,30,20,10,0,0,0,0,0,0,0];
    // var rareLv4 = [0,0,0,0,0,0,0,1,2,3,4,5,10,15,20,25,30,40,50,60,70,80,90,100,100,100,100,100,100,100];
    var rareLv1 = [100, 100, 100, 100, 95, 94, 93, 92, 91, 90, 88, 86, 84, 82, 79.8, 76.5, 72.9, 69.3, 65.7, 62.1, 57.5, 53.0, 48.5, 44, 43.4, 42.8, 42.3, 41.8, 41.3, 40]
    var rareLv2 = [0, 0, 0, 0, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 23, 26, 29, 32, 35, 39, 43, 47, 51, 51, 51, 51, 51, 51, 51];
    var rareLv3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.3, 0.8, 1.3, 1.8, 2.3, 2.8, 3.2, 3.6, 4, 4.4, 4.8, 5.1, 5.4, 5.7, 6];
    var rareLv4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.2, 1.4, 1.6, 1.8, 2, 3];

    let selectedSkills = [];  // Danh sách lưu trữ các ID kỹ năng đã chọn
    typeGameConquest.battlePetInShop = {
        battleShop1: defaultSTT5MonInBattle,
        battleShop2: defaultSTT5MonInBattle,
        battleShop3: defaultSTT5MonInBattle,
        battleShop4: defaultSTT5MonInBattle,
        battleShop5: defaultSTT5MonInBattle,
    };

    for (let i = 0; i < 5; i++) {
        // 1. Tính tần suất xuất hiện của ID
        const idFrequency = {};
        [...Object.values(typeGameConquest.battlePetUseSlotRound), ...Object.values(typeGameConquest.battlePetInInventory)].forEach(pet => {
            idFrequency[pet.ID] = (idFrequency[pet.ID] || 0) + 1;
        });
        // 2. Tạo trọng số cho từng Level
        const levelWeights = [
            { level: 1, weight: rareLv1[Number(infoStartGame.roundGame) - 1] },
            { level: 2, weight: rareLv2[Number(infoStartGame.roundGame) - 1] },
            { level: 3, weight: rareLv3[Number(infoStartGame.roundGame) - 1] },
            { level: 4, weight: rareLv4[Number(infoStartGame.roundGame) - 1] },
        ];
        const totalLevelWeight = levelWeights.reduce((sum, item) => sum + item.weight, 0);

        // 3. Random trọng số Level
        const randomLevelWeight = Math.random() * totalLevelWeight;
        let cumulativeLevelWeight = 0;
        let selectedLevel = 1;
        for (let item of levelWeights) {
            cumulativeLevelWeight += item.weight;
            if (randomLevelWeight < cumulativeLevelWeight) {
                selectedLevel = item.level;
                break;
            }
        }

        // 4. Lọc kỹ năng theo Level
        const filteredSkillsByLevel = Object.values(battleUserPetRound1).filter(skill => skill.LEVEL === selectedLevel);
        if (filteredSkillsByLevel.length === 0) {
            console.warn(`Không tìm thấy kỹ năng nào cho Level ${selectedLevel}`);
            continue;
        }

        // 5. Tạo trọng số ID
        const idWeights = filteredSkillsByLevel.map(skill => {
            const frequency = idFrequency[skill.ID] || 0; // Tần suất xuất hiện
            const idWeight = Math.max(1, 20 / (1 + frequency)); // Trọng số ngược với tần suất
            return { skill, weight: idWeight };
        });

        // 6. Tính tổng trọng số ID
        const totalIDWeight = idWeights.reduce((sum, item) => sum + item.weight, 0);

        // 7. Random trọng số ID
        const randomIDWeight = Math.random() * totalIDWeight;
        let cumulativeIDWeight = 0;
        let selectedSkill = null;
        for (let item of idWeights) {
            cumulativeIDWeight += item.weight;
            if (randomIDWeight < cumulativeIDWeight) {
                selectedSkill = item.skill;
                break;
            }
        }

        if (!selectedSkill) {
            console.warn(`Không chọn được kỹ năng phù hợp cho Level ${selectedLevel}`);
            continue;
        }

        // 8. Kiểm tra xem kỹ năng này đã được chọn quá 2 lần chưa
        const skillCount = selectedSkills.filter(skill => skill.ID === selectedSkill.ID && skill.LEVEL === selectedSkill.LEVEL).length;
        if (skillCount >= 1) {
            i--; // Giảm i để thử lại vòng lặp này
            continue;
        }

        // Thêm kỹ năng vào danh sách đã chọn
        selectedSkills.push(selectedSkill);

        // 9. Đặt kỹ năng vào slot shop
        const shopSlot = `battleShop${i + 1}`;
        const shopDiv = document.querySelector(`#${shopSlot}`);

        let URLimg = selectedSkill.URLimg[`Lv${selectedSkill.LEVEL}`] || selectedSkill.URLimg['Lv1'];
        
        if (shopDiv) {
            shopDiv.innerHTML = `
  <div 
    id="skill${idSkillRND}" 
    class="skill"
    draggable="true"
    style="background-image: url('${URLimg}')"
    data-skill='{"ID": "${selectedSkill.ID}", "LEVEL": ${selectedSkill.LEVEL}}'>
  </div>`;

            let dameSkillText = ``; // Dùng let có thể thay đổi được biến, còn dùng const không được

            const dameSkillDiv = document.querySelector(`#skill${idSkillRND}`);
            if (dameSkillDiv) {

                if (selectedSkill.DAME[0] > 0) { //Skill dame
                    dameSkillText += `<div class="skill-dame">${Number(selectedSkill.DAME[0])}</div>`;
                }
                if (selectedSkill.HEAL[0] > 0) { //Skill heal
                    dameSkillText += `<div class="skill-heal">${Number(selectedSkill.HEAL[0])}</div>`;
                }
                if (selectedSkill.SHIELD[0] > 0) { //Skill shield
                    dameSkillText += `<div class="skill-shield">${Number(selectedSkill.SHIELD[0])}</div>`;
                }
                if (selectedSkill.BURN[0] > 0) { //Skill BURN
                    dameSkillText += `<div class="skill-burn">${Number(selectedSkill.BURN[0])}</div>`;
                }
                if (selectedSkill.POISON[0] > 0) { //Skill Poison
                    dameSkillText += `<div class="skill-poison">${Number(selectedSkill.POISON[0])}</div>`;
                }
                if (selectedSkill.EFFECT.includes("Freeze")) { //Skill đóng băng freeze
                    dameSkillText += `<div class="skill-freeze">${Number(selectedSkill.COOLDOWN[0] / 2 / 1000 * selectedSkill.LEVEL)}</div>`;
                }
            }

            // Gắn nội dung vào dameSkillDiv
            dameSkillDiv.innerHTML =
                `
            <div class="levelSkillColor" style="position: absolute;font-size: 16px;font-weight: bold;color: #d80789;text-shadow: 0px 1px 2px #0000008a;top: -8px;right: -8px;">
            <i class="fa-solid fa-diamond"></i>
            <span class="levelSkillText" style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);font-size: 12px;color: white;font-weight: bold;">${selectedSkill.LEVEL}</span>
            </div>
            
            <div class="dameSkillText" style="display: flex; flex-direction: row; align-items: center;">
            ${dameSkillText}
            </div>
            <div style="position: absolute;font-size: 18px;font-weight: bold;color: rgb(0 88 255);text-shadow: 1px 1px 2px #140a03;
            top: -6px; left: -6px; z-index: 1;">
                <i class="fa-solid fa-splotch" style="
                    position: absolute;
                "></i>
                <span class="starSkillText" style="position: absolute;font-size: 10px;color: #ffffff;
                font-weight: bold;min-width: 25px;top: 2px;left: -3px;
                ">
                    ${selectedSkill.PRICESELL + selectedSkill.PRICE || selectedSkill.PRICE}
                </span>
            </div>`;

        }
        // Cập nhật thông tin vào battlePetInShop
        typeGameConquest.battlePetInShop[shopSlot] = selectedSkill;
        console.log("battlePetInShop2", typeGameConquest.battlePetInShop)
        // Tăng idSkillRND để tạo ID duy nhất cho mỗi skill
        idSkillRND += 1;
    }

    //Tạo highlight cho skill theo level
    highlightSkillLevel();

    //Load event cho các slot
    loadEventSkillBattle();

    //Load event click hiện info cho các skill
    createInfo5mon();

    //Kiểm tra xem có skill nào có thể update không
    checkUpdateLevel();
}

//Hàm tạo comp => tạo skill cho comp skill1A -> 9A
function createSkill(slotDiv) {

    let lengthSlot = 0;
    if (slotDiv === "shop") {
        lengthSlot = 5
    } else {
        lengthSlot = 9
    }

    let skillItem = slotDiv === "shop" ? typeGameConquest.battlePetInShop : slotDiv === "inventory" ? typeGameConquest.battlePetInInventory : slotDiv === "slotSkillFn" ? skillFinalGame : typeGameConquest.skillBattle

    for (let i = 0; i < lengthSlot; i++) {
        console.log("Vào đây 1")
        const skillCompSlot = slotDiv === "shop" ? `battleShop${i + 1}` : slotDiv === "skillComp" ? `skill${i + 1}A` : slotDiv === "inventory" ? `battleInv${i + 1}` : slotDiv === "slotSkillFn" ? `skill${i + 1}Bfn` : `skill${i + 1}B`;

        let skillCompDiv = document.querySelector(`#${skillCompSlot}`);
        let URLimg = skillItem[skillCompSlot].URLimg[`Lv${skillItem[skillCompSlot].LEVEL}`] || skillItem[skillCompSlot].URLimg['Lv1']; 
        
        if ((skillCompDiv && skillItem[skillCompSlot] && skillItem[skillCompSlot].ID)) {
            console.log("Vào đây 2")
            skillCompDiv.innerHTML += `
    <div 
      id="skill${idSkillRND}" 
      class="skill"
      draggable="true"
      style="background-image: url('${URLimg}')"
      data-skill='{"ID": "${skillItem[skillCompSlot].ID}", "LEVEL": ${skillItem[skillCompSlot].LEVEL}}'>
    </div>`;
            let dameSkillText = ``; // Dùng let có thể thay đổi được biến, còn dùng const không được

            const dameSkillDiv = document.querySelector(`#skill${idSkillRND}`);
            if (dameSkillDiv) {
                if (skillItem[skillCompSlot]?.DAME?.[0] > 0) { // Skill dame
                    dameSkillText += `<div class="skill-dame">${Number(skillItem[skillCompSlot].DAME.reduce((a, b) => a + b, 0) || 0)}</div>`;
                }
                if (skillItem[skillCompSlot]?.HEAL?.[0] > 0) { // Skill heal
                    dameSkillText += `<div class="skill-heal">${Number(skillItem[skillCompSlot].HEAL.reduce((a, b) => a + b, 0) || 0)}</div>`;
                }
                if (skillItem[skillCompSlot]?.SHIELD?.[0] > 0) { // Skill shield
                    dameSkillText += `<div class="skill-shield">${Number(skillItem[skillCompSlot].SHIELD.reduce((a, b) => a + b, 0) || 0)}</div>`;
                }
                if (skillItem[skillCompSlot]?.BURN?.[0] > 0) { // Skill BURN
                    dameSkillText += `<div class="skill-burn">${Number(skillItem[skillCompSlot].BURN.reduce((a, b) => a + b, 0) || 0)}</div>`;
                }
                if (skillItem[skillCompSlot]?.POISON?.[0] > 0) { // Skill Poison
                    dameSkillText += `<div class="skill-poison">${Number(skillItem[skillCompSlot].POISON.reduce((a, b) => a + b, 0) || 0)}</div>`;
                }
                if (skillItem[skillCompSlot]?.EFFECT?.includes("Freeze")) { // Skill đóng băng freeze
                    dameSkillText += `<div class="skill-freeze">${Number(skillItem[skillCompSlot].COOLDOWN?.[0] / 2 / 1000 * skillItem[skillCompSlot].LEVEL)}</div>`;
                }
            }

            let levelSkillColor = "#531515"

            if (skillItem[skillCompSlot].LEVEL === 4) {
                levelSkillColor = "red"
            } else if (skillItem[skillCompSlot].LEVEL === 3) {
                levelSkillColor = "#c00d0d"
            } else if (skillItem[skillCompSlot].LEVEL === 2) {
                levelSkillColor = "#8c0b0b"
            } else {
                levelSkillColor = "#531515"
            }

            // Gắn nội dung vào dameSkillDiv
            dameSkillDiv.innerHTML =
                `
            <div class="levelSkillColor" style="position: absolute;font-size: 16px;font-weight: bold;color: ${levelSkillColor};text-shadow: 0px 1px 2px #0000008a;top: -8px;right: -8px;">
            <i class="fa-solid fa-diamond"></i>
            <span class="levelSkillText" style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);font-size: 12px;color: white;font-weight: bold;">${skillItem[skillCompSlot].LEVEL}</span>
            </div>
            
            <div class="dameSkillText" style="display: flex; flex-direction: row; align-items: center;">
            ${dameSkillText}
            </div>
            <div style="position: absolute;font-size: 18px;font-weight: bold;color: rgb(0 88 255);text-shadow: 1px 1px 2px #140a03;
            top: -6px; left: -6px; z-index: 1;">
                <i class="fa-solid fa-splotch" style="
                    position: absolute;
                "></i>
                <span class="starSkillText" style="position: absolute;font-size: 10px;color: #ffffff;
                font-weight: bold;min-width: 25px;top: 2px;left: -3px;
                ">
                    ${skillItem[skillCompSlot].PRICESELL + skillItem[skillCompSlot].PRICE || skillItem[skillCompSlot].PRICE}
                </span>
            </div>`;


            //Gắn cho div cha trạng thái đã lấp đầy
            skillCompDiv.classList.add("occupied");
        }
        // Tăng idSkillRND để tạo ID duy nhất cho mỗi skill
        idSkillRND += 1;
    }
    //Tạo highlight cho skill theo level
    highlightSkillLevel();

    //Load event cho các slot
    loadEventSkillBattle();

    //Load event click hiện info cho các skill
    createInfo5mon();

    //Kiểm tra xem có skill nào có thể update không
    checkUpdateLevel();
}

//Cập nhật thông tin skill khi ở tủ đồ và ở slot skill khi di chuyển skill
//update hiển thị chỉ số skill
function updateSttForSkillAffter() {

    const divSkillDameTexts = document.querySelectorAll(".dameSkillText");

    if (!divSkillDameTexts || divSkillDameTexts.length === 0) {
        console.warn("Không tìm thấy div nào với class 'dameSkillText'.");
        return;
    }

    divSkillDameTexts.forEach((divSkillDameText) => {
        const idDivParent = divSkillDameText.parentElement?.parentElement?.id;
        const idDivParentOfParent = divSkillDameText.parentElement?.parentElement?.parentElement?.id;

        if (!idDivParent) {
            return;
        }

        let matchingSlot = null;

        if (idDivParentOfParent === "skillBarB" || idDivParentOfParent === "skillBarA") {
            matchingSlot = typeGameConquest.skillBattle[idDivParent];

            if (!matchingSlot) {
                console.warn(`Không tìm thấy dữ liệu cho: ${idDivParent} tại slot skill`);
                return;
            }

            let dameSkill, healSkill, shieldSkill, burnSkill, poisonSkill, freezeSkill, multiSkill;

            if (endGame === false) { // Trong trận đấu
                dameSkill = (matchingSlot.DAME.reduce((a, b) => a + b, 0) || 0);
                healSkill = (matchingSlot.HEAL.reduce((a, b) => a + b, 0) || 0);
                shieldSkill = (matchingSlot.SHIELD.reduce((a, b) => a + b, 0) || 0);
                burnSkill = (matchingSlot.BURN.reduce((a, b) => a + b, 0) || 0);
                poisonSkill = (matchingSlot.POISON.reduce((a, b) => a + b, 0) || 0);
                freezeSkill = ((matchingSlot.COOLDOWN[0] / 2 / 1000 || 0) + (matchingSlot.COOLDOWN[4] / 1000 || 0)) * matchingSlot.LEVEL
                multiSkill = (matchingSlot.COOLDOWN[1] || 0) + (matchingSlot.COOLDOWN[2] || 0) + (matchingSlot.COOLDOWN[3] || 0);
            } else { // Ngoài trận đấu
                dameSkill = (matchingSlot.DAME[0] || 0) + (matchingSlot.DAME[1] || 0) + (matchingSlot.DAME[2] || 0);
                healSkill = (matchingSlot.HEAL[0] || 0) + (matchingSlot.HEAL[1] || 0) + (matchingSlot.HEAL[2] || 0);
                shieldSkill = (matchingSlot.SHIELD[0] || 0) + (matchingSlot.SHIELD[1] || 0) + (matchingSlot.SHIELD[2] || 0);
                burnSkill = (matchingSlot.BURN[0] || 0) + (matchingSlot.BURN[1] || 0) + (matchingSlot.BURN[2] || 0);
                poisonSkill = (matchingSlot.POISON[0] || 0) + (matchingSlot.POISON[1] || 0) + (matchingSlot.POISON[2] || 0);
                freezeSkill = (matchingSlot.COOLDOWN[0] / 2 / 1000 || 0) * matchingSlot.LEVEL
                multiSkill = (matchingSlot.COOLDOWN[1] || 0) + (matchingSlot.COOLDOWN[2] || 0) + (matchingSlot.COOLDOWN[3] || 0)
            }

            if (!dameSkill && !healSkill && !shieldSkill && !burnSkill && !poisonSkill && !freezeSkill) {
                console.warn(`Không tìm thấy chỉ số dame/heal/shield/burn/poison cho: ${idDivParent}`);
                return;
            }

            const idDivDame = divSkillDameText.children;

            Array.from(idDivDame).forEach((child) => {
                const updateWithFlash = (newValue, className) => {
                    if (child.classList.contains(className)) {
                        if (child.innerText != newValue) {
                            child.innerText = newValue;
                            child.classList.add("hit");
                            setTimeout(() => child.classList.remove("hit"), 800); // Xóa class sau 0.8 giây
                        }
                    }
                };

                updateWithFlash(dameSkill, "skill-dame");
                updateWithFlash(healSkill, "skill-heal");
                updateWithFlash(shieldSkill, "skill-shield");
                updateWithFlash(burnSkill, "skill-burn");
                updateWithFlash(poisonSkill, "skill-poison");
                updateWithFlash(freezeSkill, "skill-freeze");
            });

        } else if (idDivParentOfParent === "battleInventory") {
            matchingSlot = typeGameConquest.battlePetInInventory[idDivParent];

            if (!matchingSlot) {
                console.warn(`Không tìm thấy dữ liệu cho: ${idDivParent} tại slot skill`);
                return;
            }

            const dameSkill = (matchingSlot.DAME[0] || 0) + (matchingSlot.DAME[1] || 0);
            const healSkill = (matchingSlot.HEAL[0] || 0) + (matchingSlot.HEAL[1] || 0);
            const shieldSkill = (matchingSlot.SHIELD[0] || 0) + (matchingSlot.SHIELD[1] || 0);
            const burnSkill = (matchingSlot.BURN[0] || 0) + (matchingSlot.BURN[1] || 0);
            const poisonSkill = (matchingSlot.POISON[0] || 0) + (matchingSlot.POISON[1] || 0);
            const freezeSkill = (matchingSlot.COOLDOWN[0] / 2 / 1000 || 0) * matchingSlot.LEVEL
            const multiSkill = (matchingSlot.COOLDOWN[1] || 0) + (matchingSlot.COOLDOWN[2] || 0) + (matchingSlot.COOLDOWN[3] || 0);
            if (!dameSkill && !healSkill && !shieldSkill && !burnSkill && !poisonSkill && !freezeSkill) {
                console.warn(`Không tìm thấy chỉ số dame/heal/shield/burn/poison cho: ${idDivParent}`);
                return;
            }

            const idDivDame = divSkillDameText.children;

            Array.from(idDivDame).forEach((child) => {
                const updateWithFlash = (newValue, className) => {
                    if (child.classList.contains(className)) {
                        if (child.innerText != newValue) {
                            child.innerText = newValue;
                            child.classList.add("hit");
                            setTimeout(() => child.classList.remove("hit"), 800); // Xóa class sau 0.8 giây
                        }
                    }
                };

                updateWithFlash(dameSkill, "skill-dame");
                updateWithFlash(healSkill, "skill-heal");
                updateWithFlash(shieldSkill, "skill-shield");
                updateWithFlash(burnSkill, "skill-burn");
                updateWithFlash(poisonSkill, "skill-poison");
                updateWithFlash(freezeSkill, "skill-freeze");
                updateWithFlash(multiSkill, "skill-multi");
            });
        }
    });
    createInfo5mon();
}



let cooldownDuration = 90; // Số giây thanh sẽ giảm từ đầy đến hết //++++++++++
let decrementPercent = 100;
let cooldownRemaining = cooldownDuration; // Thời gian còn lại
let damageOverTime = 1; // Sát thương ban đầu


// Lấy các thành phần DOM
const cooldownBar = document.getElementById('cooldownBar');
const cooldownTime = document.getElementById('cooldownTime');

// Khởi động thanh cooldown
let intervalIDBurnOrPoison;
function battleStartTime(init = true) {
    const interval = 100; // Cập nhật thanh mỗi 100ms

    // Nếu là khởi tạo, đặt các giá trị ban đầu
    if (init) {
        decrementPercent = 100; // Thanh bắt đầu từ 100%
        cooldownRemaining = cooldownDuration; // Đặt thời gian còn lại về giá trị ban đầu
        cooldownBar.style.width = '100%'; // Đặt thanh về đầy đủ
    }

    // Bắt đầu interval
    intervalID = setInterval(() => {
        if (pauseBattle) return; // Dừng logic nếu game đang pause

        cooldownRemaining -= interval / 1000; // Giảm thời gian còn lại
        decrementPercent -= 100 / (cooldownDuration * (1000 / interval)); // Tính % giảm mỗi lần

        // Cập nhật UI
        cooldownBar.style.width = `${Math.max(decrementPercent, 0)}%`; // Giảm chiều rộng
        cooldownTime.textContent = `${Math.ceil(cooldownRemaining)}`; // Hiển thị thời gian còn lại

        // Dừng khi hết thời gian hoặc game kết thúc
        if (cooldownRemaining <= 0 || endGame === true) {
            clearInterval(intervalID); // Dừng cập nhật
            intervalID = null;
            cooldownTime.textContent = 'Hết thời gian!';
            document.getElementById('cooldownBarContainer').classList.add('comp');
            overTimeBattle();
        }
        if (nowHpBattleComp < 100 || nowHpBattleMy < 100) {
            checkWinOrLose();
        }
    }, interval);

    intervalIDBurnOrPoison = setInterval(() => {
        if (pauseBattle) return; // Dừng logic nếu game đang pause

        if (nowPoisonBattleComp > 0) {
            applyPoison("hpBarA");
        }
        if (nowBurnBattleComp > 0) {
            applyBurn("hpBarA");
        }
        if (nowPoisonBattleMy > 0) {
            applyPoison("hpBarB");
        }
        if (nowBurnBattleMy > 0) {
            applyBurn("hpBarB");
        }

        //Tăng nộ cho 5Mon 2 bên
        Object.keys(typeGameConquest.skillBattle).forEach((skillKey) => {
            const skill = typeGameConquest.skillBattle[skillKey];

            if (skill.ID && skill.IDcreate) {
                const cooldown0 = skill.COOLDOWN?.[0] || 0;

                // Dùng sqrt-based scale, tối đa cộng 10
                const scaledGain = Math.max(1, Math.floor(10 * Math.sqrt(cooldown0) / Math.sqrt(20000)));

                skill.COOLDOWN[4] += scaledGain;
            }
        });

        updateHpAndRageBar5Mon();



        if (endGame === true) {
            clearInterval(intervalIDBurnOrPoison); // Dừng cập nhật
            intervalIDBurnOrPoison = null;
        }
    }, 1500);
}

//Khi hết thời gian battle => trừ máu dần của cả 2 team
function overTimeBattle() {
    const hpBarA = document.querySelector('#hpBarA .hpFill');
    const shieldBarA = document.querySelector('#hpBarA .shieldFill');
    const hpBarB = document.querySelector('#hpBarB .hpFill');
    const shieldBarB = document.querySelector('#hpBarB .shieldFill');

    // Lấy `effectContainer`
    const effectContainerA = document.querySelector(`#effectContainerA`);
    const effectContainerB = document.querySelector(`#effectContainerB`);

    intervalIdOverTime = setInterval(() => {
        if (pauseBattle === true) {
            return;
        }
        if (endGame === true) {
            clearInterval(intervalIdOverTime);
            intervalIdOverTime = null;
            return;
        }

        //Trừ Hp comp trước (A)
        applyDamage('hpBarA', damageOverTime, "overTime");
        applyDamage('hpBarB', damageOverTime, "overTime");

        // Tăng sát thương
        damageOverTime += 2;

        if (nowHpBattleComp < 100 || nowHpBattleMy < 100) {
            checkWinOrLose();
        }

    }, 500); // Mỗi 0,5 giây
}

//Cập nhật hiển thị hpBar của 2 team 
function updateHpbar() {
    // Lấy team A
    const targetSideA = document.querySelector('#hpBarA');
    if (targetSideA) {
        const hpBarA = targetSideA.querySelector('.hpFill');
        const hpTextA = targetSideA.querySelector('.hpText');
        const shieldBarA = targetSideA.querySelector('.shieldFill');
        const shieldTextA = targetSideA.querySelector('.shieldText');
        const burnTextA = targetSideA.querySelector('.burnText');
        const poisonTextA = targetSideA.querySelector('.poisonText');

        // Tính % HP và Shield
        const hpPercentageA = (nowHpBattleComp / typeGameConquest.maxHpBattleComp) * 100;
        const shieldPercentageA = Math.min((nowShieldBattleComp / typeGameConquest.maxHpBattleComp) * 100, 100);

        // Cập nhật thanh HP và Shield cho team A
        hpBarA.style.width = `${hpPercentageA}%`;
        hpTextA.textContent = nowHpBattleComp;

        shieldBarA.style.width = `${shieldPercentageA}%`;
        shieldTextA.textContent = nowShieldBattleComp > 0 ? nowShieldBattleComp : "";
        if (nowShieldBattleComp > 0) {
            targetSideA.style.background = "linear-gradient(to bottom, #60caff, rgb(0 0 0 / 35%), rgb(0 0 0 / 35%), rgb(0 0 0 / 35%), #81edff)"
        } else {
            targetSideA.style.background = "rgb(0 0 0 / 35%)"
        }

        burnTextA.textContent = nowBurnBattleComp > 0 ? nowBurnBattleComp : "";
        if (nowBurnBattleComp > 0) {
            targetSideA.classList.add("hpBarBurnEffect")
        } else {
            targetSideA.classList.remove("hpBarBurnEffect")
        }

        poisonTextA.textContent = nowPoisonBattleComp > 0 ? nowPoisonBattleComp : "";
        if (nowPoisonBattleComp > 0) {
            hpBarA.style.background = "linear-gradient(to right, #96077d, #dd04f7)"
        } else {
            hpBarA.style.background = "linear-gradient(to right, #0ba227, #87ff04)"
        }

        //Skill tăng chỉ số shield bằng số shield được tạo
        const updateShieldChange = (newValue) => {
            if (hpTextA.textContent != newValue) {
                skillUpShieldWithNowShield(true);
            }
        };
        updateShieldChange(nowShieldBattleComp)
        updateSttForSkillAffter();
    }

    // Lấy team B
    const targetSideB = document.querySelector('#hpBarB');
    if (targetSideB) {
        const hpBarB = targetSideB.querySelector('.hpFill');
        const hpTextB = targetSideB.querySelector('.hpText');
        const shieldBarB = targetSideB.querySelector('.shieldFill');
        const shieldTextB = targetSideB.querySelector('.shieldText');
        const burnTextB = targetSideB.querySelector('.burnText');
        const poisonTextB = targetSideB.querySelector('.poisonText');

        // Tính % HP và Shield
        const hpPercentageB = (nowHpBattleMy / (typeGameConquest.maxHpBattle + maxHpUp)) * 100;
        const shieldPercentageB = Math.min((nowShieldBattleMy / (typeGameConquest.maxHpBattle + maxHpUp)) * 100, 100);

        // Cập nhật thanh HP và Shield cho team B
        hpBarB.style.width = `${hpPercentageB}%`;
        hpTextB.textContent = nowHpBattleMy;

        shieldBarB.style.width = `${shieldPercentageB}%`;
        shieldTextB.textContent = nowShieldBattleMy > 0 ? nowShieldBattleMy : "";
        if (nowShieldBattleMy > 0) {
            targetSideB.style.background = "linear-gradient(to bottom, #60caff, rgb(0 0 0 / 35%), rgb(0 0 0 / 35%), rgb(0 0 0 / 35%), #81edff)"
        } else {
            targetSideB.style.background = "rgb(0 0 0 / 35%)"
        }

        burnTextB.textContent = nowBurnBattleMy > 0 ? nowBurnBattleMy : "";
        if (nowBurnBattleMy > 0) {
            targetSideB.classList.add("hpBarBurnEffect")
        } else {
            targetSideB.classList.remove("hpBarBurnEffect")
        }

        poisonTextB.textContent = nowPoisonBattleMy > 0 ? nowPoisonBattleMy : "";
        if (nowPoisonBattleMy > 0) {
            hpBarB.style.background = "linear-gradient(to right, #96077d, #dd04f7)"
        } else {
            hpBarB.style.background = "linear-gradient(to right, #0ba227, #87ff04)"
        }

        //Skill tăng chỉ số shield bằng số shield được tạo
        const updateShieldChange = (newValue) => {
            if (hpTextB.textContent != newValue) {
                skillUpShieldWithNowShield(false);
            }
        };
        updateShieldChange(nowShieldBattleMy)
        updateSttForSkillAffter();
    }
}

function applyBurn(hpBar) {
    let dameBurn = hpBar === "hpBarA" ? nowBurnBattleComp : nowBurnBattleMy;
    if (hpBar === "hpBarA") {
        dameBurn = nowBurnBattleComp;
        applyDamage(hpBar, dameBurn, "Burn");
        nowBurnBattleComp = Math.max(0, nowBurnBattleComp - 1);
    } else {
        dameBurn = nowBurnBattleMy;
        applyDamage(hpBar, dameBurn, "Burn");
        nowBurnBattleMy = Math.max(0, nowBurnBattleMy - 1);
    }

    updateHpbar();
}

function applyPoison(hpBar) {
    let damePoison = hpBar === "hpBarA" ? nowPoisonBattleComp : nowPoisonBattleMy;
    if (hpBar === "hpBarA") {
        damePoison = nowPoisonBattleComp;
        applyDamage(hpBar, damePoison, "Poison");
        nowPoisonBattleComp = Math.max(0, nowPoisonBattleComp - 1);
    } else {
        damePoison = nowPoisonBattleMy;
        applyDamage(hpBar, damePoison, "Poison");
        nowPoisonBattleMy = Math.max(0, nowPoisonBattleMy - 1);
    }
    updateHpbar();
    if (endGame === true || pauseBattle === true) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

var winLoseDefault = 10;
function checkWinOrLose() {
    // Sử dụng setInterval để kiểm tra HP của hai bên mỗi 100ms
    // Kiểm tra nếu HP của máy bằng hoặc dưới 0 (người chơi thắng)
    if (nowHpBattleComp <= 0 && endGame === false) {
        console.log("Người chơi thắng!");
        clearInterval(intervalID)
        intervalID = null;
        clearInterval(intervalIdOverTime)
        intervalID = null;
        clearInterval(intervalIDBurnOrPoison)
        intervalIDBurnOrPoison = null;
        endGame = true;

        updateHpbar();
        resetHp5Mon();
        updateSttForSkillAffter();

        if (typeGameConquest.winBattle < winLoseDefault) {
            randomSkillinShop();
        }
        showResultScreen(true)
    }
    // Kiểm tra nếu HP của người chơi bằng hoặc dưới 0 (người chơi thua)
    else if (nowHpBattleMy <= 0 && endGame === false) {
        console.log("Người chơi thua!");
        clearInterval(intervalID)
        intervalID = null;
        clearInterval(intervalIdOverTime)
        intervalID = null;
        clearInterval(intervalIDBurnOrPoison)
        intervalIDBurnOrPoison = null;
        endGame = true;
        infoStartGame.winStreak = 0;

        updateHpbar();
        resetHp5Mon();
        updateSttForSkillAffter();
        if (typeGameConquest.loseBattle < winLoseDefault) {
            randomSkillinShop();
        }
        showResultScreen(false)
    }
}

let skillQueueMirror = {}; // Hàng đợi cho mỗi skill phản đòn
let countSkillQueueMirror = 0;
function startSkillMirror(skillKey, isComp, effect) {

    // let limitSkills = isComp ? limitSkillsB : limitSkillsA;
    let skillsSleep = isComp ? skillsSleepB : skillsSleepA
    let skillsDelete = isComp ? skillsDeleteB : skillsDeleteA
    let isRound = infoStartGame.roundGame
    const effectPairs = [
        { mirrorEffect: "MirrorAttacking", baseEffect: "Attacking" },
        { mirrorEffect: "MirrorHealing", baseEffect: "Healing" },
        { mirrorEffect: "MirrorShield", baseEffect: "Shield" },
        { mirrorEffect: "MirrorBurn", baseEffect: "Burn" },
        { mirrorEffect: "MirrorPoison", baseEffect: "Poison" },
        { mirrorEffect: "MirrorFreeze", baseEffect: "Freeze" },
        { mirrorEffect: "MirrorSleepSkills", baseEffect: "SleepSkill1" },
        { mirrorEffect: "MirrorSleepSkills", baseEffect: "SleepSkill2" },
        { mirrorEffect: "MirrorSleepSkills", baseEffect: "SleepSkill3" },
        { mirrorEffect: "MirrorSleepSkills", baseEffect: "SleepSkill4" },
        { mirrorEffect: "MirrorSpeedUp", baseEffect: "SpeedUp1" },
        { mirrorEffect: "MirrorSpeedUp", baseEffect: "SpeedUp2" },
        { mirrorEffect: "MirrorSpeedUp", baseEffect: "SpeedUp3" },
        { mirrorEffect: "MirrorSpeedUp", baseEffect: "SpeedUp4" },
        { mirrorEffect: "MirrorSlowSkill", baseEffect: "SlowSkill1" },
        { mirrorEffect: "MirrorSlowSkill", baseEffect: "SlowSkill2" },
        { mirrorEffect: "MirrorSlowSkill", baseEffect: "SlowSkill3" },
        { mirrorEffect: "MirrorSlowSkill", baseEffect: "SlowSkill4" },
    ];

    if (!effectPairs.some(({ baseEffect }) => baseEffect === effect)) {
        console.warn(`Effect ${effect} không được hỗ trợ trong danh sách baseEffect.`);
        return; // Thoát ra nếu không có baseEffect nào trùng
    }

    Object.keys(typeGameConquest.skillBattle).forEach((key) => {
        if ((isComp ? key.endsWith("B") : key.endsWith("A"))) {
            for (const { mirrorEffect, baseEffect } of effectPairs) {
                if (
                    typeGameConquest.skillBattle[key].EFFECT.some((effect) => effect === mirrorEffect) &&
                    typeGameConquest.skillBattle[skillKey].EFFECT.some((effect) => effect === baseEffect)
                    // && limitSkills[key] <= 10
                ) {
                    // limitSkills[key] += 1;

                    if (!skillQueueMirror[key]) {
                        skillQueueMirror[key] = Promise.resolve(); // Khởi tạo hàng đợi nếu chưa có
                    }
                    if (countSkillQueueMirror >= 300) {
                        console.log("đã lớn hơn 100", countSkillQueueMirror)
                        countSkillQueueMirror -= 1;
                        return;
                    }
                    skillQueueMirror[key] = skillQueueMirror[key]
                        .then(() => new Promise((resolve) => setTimeout(resolve, 350)))
                        .then(() => {
                            if (endGame || skillsSleep[key] === 1 || skillsDelete[key] === 1) {
                                Object.keys(skillQueueMirror).forEach((key) => {
                                    skillQueueMirror = Promise.resolve(); // Reset hàng đợi

                                });
                                return; // Kiểm tra lại sau delay
                            }

                            if (isRound === infoStartGame.roundGame && skillsSleep[key] === 0 && skillsDelete[key] === 0 && countSkillQueueMirror < 300) {
                                isComp
                                    ? userSkillA(key, false)
                                    : userSkillA(key, true);
                                countSkillQueueMirror += 1;
                                console.log(`Kích hoạt skill phản đòn: ${key}`);
                            }

                        });
                    break;
                }
            }
        }
    });
}

let skillQueue = {}; // Hàng đợi cho mỗi skill
let countSkillQueue = 0;
function startSkillResonance(skillKey, isComp, effect) {

    // const limitSkills = isComp ? limitSkillsA : limitSkillsB;
    let skillsSleep = isComp ? skillsSleepA : skillsSleepB
    let skillsDelete = isComp ? skillsDeleteA : skillsDeleteB
    let isRound = 0;
    const effectPairs = [
        { reEffect: "ReAttacking", baseEffect: "Attacking" },
        { reEffect: "ReHealing", baseEffect: "Healing" },
        { reEffect: "ReShield", baseEffect: "Shield" },
        { reEffect: "ReBurn", baseEffect: "Burn" },
        { reEffect: "RePoison", baseEffect: "Poison" },
        { reEffect: "ReFreeze", baseEffect: "Freeze" },
        { reEffect: "ReBeforeSkill", baseEffect: "BeforeSkill" },
        { reEffect: "ReAfterSkill", baseEffect: "AfterSkill" },
        { reEffect: "ReBeforeAfterSkill", baseEffect: "BeforeAfterSkill" },
        { reEffect: "ReType", baseEffect: "TypeSkill" },
        { reEffect: "ReSpeedUp", baseEffect: "SpeedUp1" },
        { reEffect: "ReSpeedUp", baseEffect: "SpeedUp2" },
        { reEffect: "ReSpeedUp", baseEffect: "SpeedUp3" },
        { reEffect: "ReSpeedUp", baseEffect: "SpeedUp4" },
        { reEffect: "ReSlowSkill", baseEffect: "SlowSkill1" },
        { reEffect: "ReSlowSkill", baseEffect: "SlowSkill2" },
        { reEffect: "ReSlowSkill", baseEffect: "SlowSkill3" },
        { reEffect: "ReSlowSkill", baseEffect: "SlowSkill4" },
    ];

    Object.keys(typeGameConquest.skillBattle).forEach((key) => {
        if (key !== skillKey && ((isComp ? key.endsWith("A") : key.endsWith("B")))) {
            for (const { reEffect, baseEffect } of effectPairs) {

                // Logic xử lý nếu hiệu ứng có mặt trong skillKey
                if (reEffect === "ReBeforeSkill" || reEffect === "ReAfterSkill" || reEffect === "ReBeforeAfterSkill" || reEffect === "ReType") {
                    let slotSkillKey = parseInt(skillKey.match(/\d+/)[0], 10);  // Chuyển đổi thành số
                    let slotKey = parseInt(key.match(/\d+/)[0], 10);  // Chuyển đổi thành số

                    // Xử lý hiệu ứng ReBeforeSkill
                    if (reEffect === "ReBeforeAfterSkill" && typeGameConquest.skillBattle[key].EFFECT.includes("ReBeforeAfterSkill")) {
                        // Kiểm tra nếu slotSkillKey nhỏ hơn slotKey (tức là skill này là trước skill hiện tại)
                        if (slotSkillKey === slotKey - 1 || slotSkillKey === slotKey + 1) {
                            console.log("Vào đây 1 lần")

                            // Khi skill có ReBeforeSkill, kích hoạt kỹ năng nếu slotSkillKey < slotKey
                            if (!skillQueue[key]) {
                                skillQueue[key] = Promise.resolve(); // Khởi tạo hàng đợi nếu chưa có
                            }

                            if (countSkillQueue >= 300) {
                                countSkillQueue -= 1
                                console.log("Vượt giới hạn hàng chờ countSkillQueue")
                                return;
                            }

                            isRound = infoStartGame.roundGame;
                            skillQueue[key] = skillQueue[key]
                                .then(() => new Promise((resolve) => setTimeout(resolve, 350))) // Thêm delay giữa các skill
                                .then(() => {
                                    if (endGame || skillsSleep[key] === 1 || skillsDelete[key] === 1) {
                                        Object.keys(skillQueue).forEach((key) => {
                                            skillQueue[key] = Promise.resolve(); // Reset hàng đợi
                                        });
                                        return;
                                    }

                                    // Nếu có overlayDivComp thì kích hoạt kỹ năng
                                    if (isRound === infoStartGame.roundGame && skillsSleep[key] === 0 && skillsDelete[key] === 0 && countSkillQueue < 300) {
                                        userSkillA(key, isComp);
                                        countSkillQueue += 1
                                    }
                                });
                        }
                    }

                    // Xử lý hiệu ứng ReBeforeSkill
                    if (reEffect === "ReBeforeSkill" && typeGameConquest.skillBattle[key].EFFECT.includes("ReBeforeSkill")) {
                        // Kiểm tra nếu slotSkillKey nhỏ hơn slotKey (tức là skill này là trước skill hiện tại)
                        if (slotSkillKey === slotKey - 1) {
                            // Khi skill có ReBeforeSkill, kích hoạt kỹ năng nếu slotSkillKey < slotKey
                            if (!skillQueue[key]) {
                                skillQueue[key] = Promise.resolve(); // Khởi tạo hàng đợi nếu chưa có
                            }
                            if (countSkillQueue >= 300) {
                                countSkillQueue -= 1
                                console.log("Vượt giới hạn hàng chờ countSkillQueue")
                                return;
                            }
                            isRound = infoStartGame.roundGame;
                            skillQueue[key] = skillQueue[key]
                                .then(() => new Promise((resolve) => setTimeout(resolve, 350))) // Thêm delay giữa các skill
                                .then(() => {
                                    if (endGame || skillsSleep[key] === 1 || skillsDelete[key] === 1) {
                                        Object.keys(skillQueue).forEach((key) => {
                                            skillQueue[key] = Promise.resolve(); // Reset hàng đợi
                                        });
                                        return;
                                    }

                                    // Nếu có overlayDivComp thì kích hoạt kỹ năng
                                    if (isRound === infoStartGame.roundGame && skillsSleep[key] === 0 && skillsDelete[key] === 0 && countSkillQueue < 300) {
                                        userSkillA(key, isComp);
                                        countSkillQueue += 1
                                    }
                                });
                        }
                    }

                    // Xử lý hiệu ứng ReAfterSkill
                    if (reEffect === "ReAfterSkill" && typeGameConquest.skillBattle[key].EFFECT.includes("ReAfterSkill")) {
                        // Kiểm tra nếu slotSkillKey lớn hơn slotKey (tức là skill này là sau skill hiện tại)
                        if (slotSkillKey === (slotKey + 1)) {
                            // Khi skill có ReAfterSkill, kích hoạt kỹ năng nếu slotSkillKey > slotKey
                            if (!skillQueue[key]) {
                                skillQueue[key] = Promise.resolve(); // Khởi tạo hàng đợi nếu chưa có
                            }
                            if (countSkillQueue >= 300) {
                                countSkillQueue -= 1
                                console.log("Vượt giới hạn hàng chờ countSkillQueue")
                                return;
                            }
                            isRound = infoStartGame.roundGame;
                            skillQueue[key] = skillQueue[key]
                                .then(() => new Promise((resolve) => setTimeout(resolve, 350))) // Thêm delay giữa các skill
                                .then(() => {
                                    if (endGame || skillsSleep[key] === 1 || skillsDelete[key] === 1) {
                                        Object.keys(skillQueue).forEach((key) => {
                                            skillQueue[key] = Promise.resolve(); // Reset hàng đợi
                                        });
                                        return;
                                    }

                                    // Nếu có overlayDivComp thì kích hoạt kỹ năng
                                    if (isRound === infoStartGame.roundGame && skillsSleep[key] === 0 && skillsDelete[key] === 0 && countSkillQueue < 300) {
                                        userSkillA(key, isComp);
                                        countSkillQueue += 1
                                    }
                                });
                        }
                    }
                    if (reEffect === "ReType" && typeGameConquest.skillBattle[key].EFFECT.includes("ReType")) {
                        // Kiểm tra nếu slotSkillKey có Type giống type của key thì kích hoạt key
                        if (typeGameConquest.skillBattle[skillKey].TYPE.some(type => typeGameConquest.skillBattle[key].TYPE.includes(type))) {
                            // Khi skill có ReAfterSkill, kích hoạt kỹ năng nếu slotSkillKey > slotKey
                            if (!skillQueue[key]) {
                                skillQueue[key] = Promise.resolve(); // Khởi tạo hàng đợi nếu chưa có
                            }
                            if (countSkillQueue >= 300) {
                                countSkillQueue -= 1
                                console.log("Vượt giới hạn hàng chờ countSkillQueue")
                                return;
                            }
                            isRound = infoStartGame.roundGame;
                            skillQueue[key] = skillQueue[key]
                                .then(() => new Promise((resolve) => setTimeout(resolve, 350))) // Thêm delay giữa các skill
                                .then(() => {
                                    if (endGame || skillsSleep[key] === 1 || skillsDelete[key] === 1) {
                                        Object.keys(skillQueue).forEach((key) => {
                                            skillQueue[key] = Promise.resolve(); // Reset hàng đợi
                                        });
                                        return;
                                    }

                                    // Nếu có overlayDivComp thì kích hoạt kỹ năng
                                    if (isRound === infoStartGame.roundGame && skillsSleep[key] === 0 && skillsDelete[key] === 0 && countSkillQueue < 300) {
                                        userSkillA(key, isComp);
                                        countSkillQueue += 1
                                    }
                                });
                        }
                    }
                } else {
                    if (!effectPairs.some(({ baseEffect }) => baseEffect === effect)) {
                        console.warn(`Effect ${effect} không được hỗ trợ trong danh sách baseEffect.`);
                        return; // Thoát ra nếu không có baseEffect nào trùng
                    }
                    if (
                        typeGameConquest.skillBattle[key].EFFECT.includes(reEffect) &&
                        typeGameConquest.skillBattle[skillKey].EFFECT.includes(baseEffect)
                        // && limitSkills[key] <= 10
                    ) {
                        // limitSkills[key] += 1;

                        if (!skillQueue[key]) {
                            skillQueue[key] = Promise.resolve(); // Khởi tạo hàng đợi nếu chưa có
                        }
                        if (countSkillQueue >= 300) {
                            countSkillQueue -= 1
                            console.log("Vượt giới hạn hàng chờ countSkillQueue")
                            return;
                        }
                        isRound = infoStartGame.roundGame;
                        skillQueue[key] = skillQueue[key]
                            .then(() => new Promise((resolve) => setTimeout(resolve, 350))) // Thêm delay giữa các skill
                            .then(() => {
                                if (endGame || skillsSleep[key] === 1 || skillsDelete[key] === 1) {
                                    Object.keys(skillQueue).forEach((key) => {
                                        skillQueue[key] = Promise.resolve(); // Reset hàng đợi
                                    });
                                    return;
                                }

                                if (isRound === infoStartGame.roundGame && skillsSleep[key] === 0 && skillsDelete[key] === 0 && countSkillQueue < 300) {
                                    userSkillA(key, isComp);
                                    countSkillQueue += 1
                                }
                            });
                        break;
                    }
                }
            }
        }
    });
}


//Function useskill
function useSkill(skillKey, effect, overlayDiv, isComp) {
    // Tính tỷ lệ chí mạng
    let critDame = 1;
    let upCritDame = isComp ? typeGameConquest.dameCritA : typeGameConquest.dameCritB
    let critPoint = typeGameConquest.skillBattle[skillKey].CRIT.reduce((a, b) => a + b, 0); // Tính tổng điểm chí mạng

    // Random từ 1 -> 100
    let randomValue = Math.floor(Math.random() * 100); // Random số nguyên từ 1 đến 100

    // Kiểm tra nếu randomValue <= critPoint thì kích hoạt chí mạng
    let dameCritWithEffect = 0;
    if (typeGameConquest.skillBattle[skillKey].EFFECT.includes("doubleDameCrit")) {
        dameCritWithEffect = 3
    } else {
        dameCritWithEffect = 2
    }

    let isCrit = false;
    if (randomValue <= critPoint) {
        critDame = dameCritWithEffect + upCritDame / 100;
        isCrit = true;
    } else {
        critDame = 1;
        isCrit = false;
    }

    // kiểm tra skill có trong effectsSkill không
    if (!effectsSkill[effect]) {
        console.error(`Effect skill ${effect} không được hỗ trợ trong effectsSkill`);
        return;
    }

    // Tính dameSkill dựa theo effectsSkill
    let skill = typeGameConquest.skillBattle[skillKey] //Chuyển thành skill vì trong googleshet là skill.DAME....
    const dameSkill = Math.ceil(eval(effectsSkill[effect].dameSkill) * critDame)

    // Xử lý logic theo loại effectsSkill
    switch (effect) {
        case "Attacking": skillAttacking(skillKey, dameSkill, isCrit);
            break;
        case "Healing": skillHealing(skillKey, dameSkill, isCrit);
            break;
        case "Shield": skillShield(skillKey, dameSkill, isCrit);
            break;
        case "Burn": skillBurn(skillKey, dameSkill, isCrit);
            break;
        case "Poison": skillPoison(skillKey, dameSkill, isCrit);
            break;
        case "Freeze": skillFreeze(skillKey, dameSkill, isComp);
            break;
        case "Burn": skillBurn(skillKey, dameSkill, isCrit);
            break;
        case "ChargerSkillAll": skillchargerSkill(skillKey, isComp, "All");
            break;
        case "ChargerSkillLeftRight": skillchargerSkill(skillKey, isComp, "LeftRight");
            break;
        case "ChargerSkillLeft": skillchargerSkill(skillKey, isComp, "Left");
            break;
        case "ChargerSkillRight": skillchargerSkill(skillKey, isComp, "Right");
            break;
        case "ChargerSkillType": skillchargerSkill(skillKey, isComp, "Type");
            break;
        case "UpDameAll": skillUpDame(skillKey, dameSkill, isComp, "All");
            break;
        case "UpDameLeftRight": skillUpDame(skillKey, dameSkill, isComp, "LeftRight");
            break;
        case "UpDameLeft": skillUpDame(skillKey, dameSkill, isComp, "Left");
            break;
        case "UpDameRight": skillUpDame(skillKey, dameSkill, isComp, "Right");
            break;
        case "UpDameSelf": skillUpDame(skillKey, dameSkill, isComp, "Self");
            break;
        case "UpDameType": skillUpDame(skillKey, dameSkill, isComp, "Type");
            break;
        case "UpHealAll": skillUpHeal(skillKey, dameSkill, isComp, "All");
            break;
        case "UpHealLeftRight": skillUpHeal(skillKey, dameSkill, isComp, "LeftRight");
            break;
        case "UpHealLeft": skillUpHeal(skillKey, dameSkill, isComp, "Left");
            break;
        case "UpHealRight": skillUpHeal(skillKey, dameSkill, isComp, "Right");
            break;
        case "UpHealSelf": skillUpHeal(skillKey, dameSkill, isComp, "Self");
            break;
        case "UpHealType": skillUpHeal(skillKey, dameSkill, isComp, "Type");
            break;
        case "UpShieldAll": skillUpShield(skillKey, dameSkill, isComp, "All");
            break;
        case "UpShieldLeftRight": skillUpShield(skillKey, dameSkill, isComp, "LeftRight");
            break;
        case "UpShieldLeft": skillUpShield(skillKey, dameSkill, isComp, "Left");
            break;
        case "UpShieldRight": skillUpShield(skillKey, dameSkill, isComp, "Right");
            break;
        case "UpShieldSelf": skillUpShield(skillKey, dameSkill, isComp, "Self");
            break;
        case "UpShieldType": skillUpShield(skillKey, dameSkill, isComp, "Type");
            break;
        case "UpBurnAll": skillUpBurn(skillKey, dameSkill, isComp, "All");
            break;
        case "UpBurnLeftRight": skillUpBurn(skillKey, dameSkill, isComp, "LeftRight");
            break;
        case "UpBurnLeft": skillUpBurn(skillKey, dameSkill, isComp, "Left");
            break;
        case "UpBurnRight": skillUpBurn(skillKey, dameSkill, isComp, "Right");
            break;
        case "UpBurnSelf": skillUpBurn(skillKey, dameSkill, isComp, "Self");
            break;
        case "UpBurnType": skillUpBurn(skillKey, dameSkill, isComp, "Type");
            break;
        case "UpPoisonAll": skillUpPoison(skillKey, dameSkill, isComp, "All");
            break;
        case "UpPoisonLeftRight": skillUpPoison(skillKey, dameSkill, isComp, "LeftRight");
            break;
        case "UpPoisonLeft": skillUpPoison(skillKey, dameSkill, isComp, "Left");
            break;
        case "UpPoisonRight": skillUpPoison(skillKey, dameSkill, isComp, "Right");
            break;
        case "UpPoisonSelf": skillUpPoison(skillKey, dameSkill, isComp, "Self");
            break;
        case "UpPoisonType": skillUpPoison(skillKey, dameSkill, isComp, "Type");
            break;
        case "UpCritAll": skillUpCrit(skillKey, dameSkill, isComp, "All");
            break;
        case "UpCritLeftRight": skillUpCrit(skillKey, dameSkill, isComp, "LeftRight");
            break;
        case "UpCritLeft": skillUpCrit(skillKey, dameSkill, isComp, "Left");
            break;
        case "UpCritRight": skillUpCrit(skillKey, dameSkill, isComp, "Right");
            break;
        case "UpCritSelf": skillUpCrit(skillKey, dameSkill, isComp, "Self");
            break;
        case "UpCritType": skillUpCrit(skillKey, dameSkill, isComp, "Type");
            break;
        case "SleepSkill1": skillSleepSkills(skillKey, dameSkill, isComp, 1);
            break;
        case "SleepSkill2": skillSleepSkills(skillKey, dameSkill, isComp, 2);
            break;
        case "SleepSkill3": skillSleepSkills(skillKey, dameSkill, isComp, 3);
            break;
        case "SleepSkill4": skillSleepSkills(skillKey, dameSkill, isComp, 4);
            break;
        case "DeleteSkills": skillDeleteSkills(skillKey, dameSkill, isComp);
            break;
        case "SpeedUp1": skillSpeedUp(skillKey, dameSkill, isComp, 1);
            break;
        case "SpeedUp2": skillSpeedUp(skillKey, dameSkill, isComp, 2);
            break;
        case "SpeedUp3": skillSpeedUp(skillKey, dameSkill, isComp, 3);
            break;
        case "SpeedUp4": skillSpeedUp(skillKey, dameSkill, isComp, 4);
            break;
        case "SlowSkill1": skillSlow(skillKey, dameSkill, isComp, 1);
            break;
        case "SlowSkill2": skillSlow(skillKey, dameSkill, isComp, 2);
            break;
        case "SlowSkill3": skillSlow(skillKey, dameSkill, isComp, 3);
            break;
        case "SlowSkill4": skillSlow(skillKey, dameSkill, isComp, 4);
            break;

        default:
            console.warn(`Effect skill ${effect} chưa có xử lý cụ thể`);
    }
    // Cập nhật rage (chung cho tất cả các skill)
    // if (!skillKey.startsWith("skill9")) {
    //     updateRage(skillKey, overlayDiv, isComp);
    // }
    startSkillMirror(skillKey, isComp, effect);
    startSkillResonance(skillKey, isComp, effect);
}

function showResultScreen(isWin) {
    const resultScreen = document.getElementById('resultScreen');
    const resultText = document.getElementById('resultText');
    const pointResultText = document.getElementById('pointResultText');
    const buttonEndGame = document.getElementById('buttonEndGame');

    typeGameConquest.reRoll = 0;
    typeGameConquest.reRollPrice = 0;

    typeGameConquest.selectSkillShop = 0;

    document.getElementById("qtyResetShop").innerText = typeGameConquest.reRollPrice;
    document.getElementById("starUser").innerText = typeGameConquest.starUser;

    // Reset các biến toàn cục


    damageOverTime = 1;

    // Biến để tính điểm trong vòng này
    let pointsThisRound;

    // Hiển thị resultScreen
    if (isWin) {
        resultText.innerText = 'Chiến Thắng!';
        createNewComp(true);

        // Tính điểm cộng cho user
        pointsThisRound = ((1 * infoStartGame.roundGame) + infoStartGame.winStreak) * modeGamePoint;
        infoStartGame.winStreak += 1;

        if (infoStartGame.winStreak === 5) {
            checkQuest("questConquestRankWinStreak5");
        }

        // Hiển thị điểm mới với điểm cộng thêm
        pointResultText.innerText = `Điểm hiện có: ${typeGameConquest.pointBattle} (+${pointsThisRound})`;

        // Chuyển onclick thành hàm gọi endBattle với tham số "My"
        if (typeGameConquest.winBattle >= winLoseDefault) {
            buttonEndGame.onclick = () => finalGame("win", pointsThisRound);
        } else {
            buttonEndGame.onclick = () => endBattle("My", pointsThisRound);
        }
    } else {
        createNewComp(false);
        resultText.innerText = 'Thua Cuộc!';

        // Tính điểm trừ cho user
        pointsThisRound = (1 * infoStartGame.roundGame);

        // Hiển thị điểm mới với điểm bị trừ
        pointResultText.innerText = `Điểm hiện có: ${typeGameConquest.pointBattle} (-${pointsThisRound})`;

        if (typeGameConquest.loseBattle >= winLoseDefault) {
            buttonEndGame.onclick = () => finalGame("lose", pointsThisRound);
        } else {
            // Chuyển onclick thành hàm gọi endBattle với tham số "Comp"
            buttonEndGame.onclick = () => endBattle("Comp", pointsThisRound);
        }
    }
    resultScreen.classList.remove('hidden'); // Hiển thị màn hình
}

var skillFinalGame = {};

function finalGame(winOrLose, pointsThisRound) {

    //Chuyền skill từ typeGameConquest.skillBattle vào skillFinalGame
    skillFinalGame = Object.fromEntries(
        Object.entries(typeGameConquest.skillBattle)
            .filter(([key]) => key.endsWith("B")) // Chỉ lấy các key kết thúc bằng 'B'
            .map(([key, value]) => [`${key}fn`, value]) // Đổi tên key
    );
    console.log("skillFinalGame", skillFinalGame)

    const resultScreen = document.getElementById('resultScreen');
    const finalGameScreen = document.getElementById('finalGameScreen');
    const winFinalGameText = document.getElementById('winFinalGameText');
    const loseFinalGameText = document.getElementById('loseFinalGameText');
    const pointFinalGameText = document.getElementById('pointFinalGameText');
    const goldFinalGameText = document.getElementById('goldFinalGameText');
    const diamondFinalGameText = document.getElementById('diamondFinalGameText');
    const popupOverlay = document.getElementById("popupOverlay")

    const buttonFinalGame = document.getElementById('buttonFinalGame');

    let textWin = winOrLose === "win" ? 1 : 0

    winFinalGameText.innerText = `${typeGameConquest.winBattle}`;
    let textLose = winOrLose === "lose" ? 1 : 0
    loseFinalGameText.innerText = `${typeGameConquest.loseBattle}`;

    pointFinalGameText.innerText = `${typeGameConquest.pointBattle + pointsThisRound}`;
    goldFinalGameText.innerText = `0`;
    diamondFinalGameText.innerText = `0`;

    //Tạo skill vao slot final game
    createSkill("slotSkillFn");

    buttonFinalGame.onclick = () => finalGameButton(winOrLose, pointsThisRound);
    resultScreen.classList.add('hidden');

    finalGameScreen.style.display = "flex";
}

function finalGameButton(winOrLose, pointsThisRound) {
    finalGameScreen.style.display = "none";
    //Chuyển hết skillBarBFn về rỗng
    document.querySelectorAll(".slotSkillFn").forEach(slot => {
        slot.innerHTML = "";
    });

    //Cộng điểm / trừ điểm
    if (winOrLose === "lose") {
        typeGameConquest.pointBattle -= pointsThisRound;
    } else {
        typeGameConquest.pointBattle += pointsThisRound;
    }

    //Nhiệm vụ hoàn thành 1 trận đấu xếp hạng chế độ Chinh Phục
    checkQuest("questConquestRankFinal");

    if (infoStartGame.roundGame >= 5) { //Đấu qua 5 vòng trong trận đấu xếp hạng
        checkQuest("questConquestRankRound5");
    }
    if (infoStartGame.roundGame >= 10) { //Đấu qua 10 vòng trong trận đấu xếp hạng
        checkQuest("questConquestRankRound10");
    }
    if (typeGameConquest.winBattle >= 5) { //Đấu qua 10 vòng trong trận đấu xếp hạng
        checkQuest("questConquestRankWin5");
    }
    if (typeGameConquest.winBattle >= 10) { //Đấu qua 10 vòng trong trận đấu xếp hạng
        checkQuest("questConquestRankWin10");
    }

    outGameRank();
}


// function detectDevTools() {
//     let start = new Date();
//     debugger; // Developer Tools sẽ gây ra chậm trễ khi thực thi lệnh này
//     let end = new Date();

//     if (end - start > 100) { // Phát hiện chậm trễ bất thường
//         alert("Hệ thống đã phát hiện bạn đã thay đổi thông tin của game để cố gắng gian lận!!.");
//         window.location.href = "https://www.google.com"; // Chuyển hướng sang Google
//     }
// }

// // Kiểm tra thường xuyên để phát hiện Developer Tools
// setInterval(detectDevTools, 1000);

let pauseBattle = false;
document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
        if (isFinalLoadData && !isOut) {
            let now = new Date();
            now.setHours(now.getHours() + 7); // Cộng múi giờ VN nếu cần
            onlineLasted = now.toISOString();

            saveDataUserToFirebase();
            stopStaminaRegen();

        }
        isLogin = false;
    } else {
        if (isFinalLoadData && !isOut) {
            checkUserLogins();
            restoreStamina();
            startStaminaRegen();
        }
        isLogin = true;
    }

    if (endGame === false) {
        if (document.hidden) {
            console.log("Người dùng đã chuyển tab trong lúc chiến đấu");
            pauseBattle = true;

            let now = new Date();
            now.setHours(now.getHours() + 7); // Cộng múi giờ VN nếu cần
            onlineLasted = now.toISOString();
            stopStaminaRegen();

        } else {
            console.log("Người dùng đã quay lại tab.");
            setTimeout(() => {
                pauseBattle = false;
                restoreStamina();
                startStaminaRegen();
            }, 1000)
            // Gọi hàm xử lý khi quay lại tab
        }
    }
});

function createNewComp1(isWin) {
    const firebaseCompRef = ref(db, "allComps");  // Tham chiếu đến allComps trong Firebase
    const ratioWinCheck = 25;

    // Lấy dữ liệu từ Firebase Realtime Database
    get(firebaseCompRef)
        .then(snapshot => {
            let data = snapshot.val();
            if (!data) {
                data = {}; // Nếu Firebase rỗng, khởi tạo object trống
            }

            // Lọc bỏ các entry có giá trị null
            let dataArray = Object.entries(data)
                .filter(([key, value]) => value !== null)  // Giữ lại các entry có giá trị khác null
                .reduce((acc, [key, value]) => {
                    acc[key] = value; // Chuyển về object
                    return acc;
                }, {});

            console.log("dataArray", dataArray);
            console.log("data", data);

            // Lấy tất cả các idComp hiện có
            let existingIds = Object.values(data).map(comp => comp.idComp);
            let maxId = Math.max(...existingIds, 0);

            // Tạo một dãy số từ 0 đến maxId
            let allIds = Array.from({ length: maxId + 1 }, (_, i) => i);

            // Tìm số idComp bị thiếu
            let missingId = allIds.find(id => !existingIds.includes(id));

            // Nếu không có số bị thiếu, tạo idComp mới là maxId + 1
            let idNewComp = missingId !== undefined ? missingId : maxId + 1;

            let ratioWinComp = 0;
            let fullGame = 0;

            // Duyệt qua danh sách Comp để tìm idComp phù hợp
            Object.keys(dataArray).forEach(compKey => {
                let comp = dataArray[compKey];

                if (comp.idComp === typeGameConquest.idComp) {
                    // Nếu tìm thấy comp có cùng idComp, cập nhật winUser hoặc loseUser
                    if (isWin) {
                        comp.loseUser += 1;
                    } else {
                        comp.winUser += 1;
                    }
                    fullGame = comp.loseUser + comp.winUser;
                    ratioWinComp = (comp.winUser / fullGame) * 100;

                    // Nếu tỷ lệ thắng < 25%, xóa Comp này khỏi Firebase
                    if (ratioWinComp < ratioWinCheck && fullGame > 10) {
                        const compRef = ref(db, `allComps/${compKey}`);
                        remove(compRef)  // Xóa comp khỏi Firebase
                            .then(() => {
                                console.log("Đã xóa Comp có ID:", compKey, "vì tỷ lệ thắng < 25%");
                                // Xóa comp khỏi allComps ngay lập tức
                                allComps = allComps.filter(item => item !== null && item.idComp !== typeGameConquest.idComp);
                                console.log("allComps", allComps);
                            })
                            .catch(error => console.error("Lỗi khi xóa Comp:", error));
                    } else {
                        // Gửi cập nhật lên Firebase nếu không bị xóa
                        const compRef = ref(db, `allComps/${compKey}`);
                        update(compRef, {
                            winUser: comp.winUser,
                            loseUser: comp.loseUser,
                            ratioWinComp: ratioWinComp
                        }).then(() => console.log("Cập nhật winUser/loseUser thành công"));
                    }
                }
            });

            // Tạo Comp mới nếu chưa có idComp này
            let newBattlePetUseSlotRound = Object.keys(typeGameConquest.battlePetUseSlotRound).reduce((newObj, key) => {
                let newKey = key.replace(/B$/, 'A');
                let skillData = typeGameConquest.battlePetUseSlotRound[key];

                // Clone sâu để tránh ảnh hưởng dữ liệu gốc
                let clonedSkillData = JSON.parse(JSON.stringify(skillData));

                // Các field dạng số cần kiểm tra NaN/Infinity
                const numericFields = ['COOLDOWN', 'HEAL', 'DAME', 'SHIELD', 'POISON', 'CRIT', 'DEF'];

                numericFields.forEach(field => {
                    if (Array.isArray(clonedSkillData[field])) {
                        clonedSkillData[field] = clonedSkillData[field].map(val =>
                            isFinite(val) ? val : 0
                        );
                    }
                });

                // Các field như EFFECT thì giữ nguyên
                if (Array.isArray(clonedSkillData['EFFECT'])) {
                    clonedSkillData['EFFECT'] = clonedSkillData['EFFECT'].map(val =>
                        typeof val === 'string' ? val : ''
                    );
                }

                newObj[newKey] = clonedSkillData;
                return newObj;
            }, {});

            let hpNewComp = typeGameConquest.maxHpBattle + maxHpUp;
            let newCompData = {
                usernameComp: username,
                roundComp: infoStartGame.roundGame,
                slotSkillComp: newBattlePetUseSlotRound,
                maxHpBattleComp: hpNewComp,
                nameComp: nameUser,
                winComp: typeGameConquest.winBattle,
                loseComp: typeGameConquest.loseBattle,
                selectCharacterComp: typeGameConquest.selectCharacterBattle,
                dameCritA: typeGameConquest.dameCritB,
                slowA: typeGameConquest.slowB,
                upCooldownA: typeGameConquest.upCooldownB,
                idComp: idNewComp,
                winUser: 0,
                loseUser: 0,
                ratioWinComp: 0,
            };

            // Thêm comp mới vào Firebase
            const newCompRef = ref(db, `allComps/${idNewComp}`);
            set(newCompRef, newCompData)
                .then(() => {
                    console.log("Comp mới đã được lưu vào Firebase với ID:", idNewComp);
                })
                .catch(error => {
                    console.error("Lỗi khi lưu Comp vào Firebase:", error);
                });
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu allComps:", error);
        });
}


function createNewComp(isWin) {
    const currentRound = infoStartGame.roundGame;
    const firebaseCompRef = ref(db, `allCompsRound/round${currentRound}`);
    const firebaseIdNewCompRef = ref(db, "allCompsRound/idNewComp");
    const ratioWinCheck = 25;

    function getNextCompId(currentId) {
        const numPart = parseInt(currentId.replace("Comp", ""), 10);
        return "Comp" + (numPart + 1);
    }

    return get(firebaseIdNewCompRef)
        .then(snapshot => {
            let idNewComp = snapshot.val();

            if (!idNewComp) {
                idNewComp = "Comp1";
                return set(firebaseIdNewCompRef, idNewComp).then(() => idNewComp);
            } else {
                return idNewComp;
            }
        })
        .then(idNewComp => {
            console.log("ID hiện tại lấy từ Firebase là:", idNewComp);

            // Tạo ID mới và cập nhật Firebase
            const newIdComp = getNextCompId(idNewComp);
            return set(firebaseIdNewCompRef, newIdComp).then(() => newIdComp);
        })
        .then(newIdComp => {
            return get(firebaseCompRef).then(snapshot => {
                let compList = snapshot.val() || [];
                compList = compList.filter(comp => comp !== null);

                let existingIndex = compList.findIndex(comp =>
                    comp.usernameComp === username && comp.idComp === typeGameConquest.idComp
                );

                if (existingIndex !== -1) {
                    let comp = compList[existingIndex];
                    if (isWin) {
                        comp.loseUser += 1;
                    } else {
                        comp.winUser += 1;
                    }

                    let fullGame = comp.loseUser + comp.winUser;
                    let ratioWinComp = (comp.winUser / fullGame) * 100;

                    if (ratioWinComp < ratioWinCheck && fullGame > 10) {
                        compList.splice(existingIndex, 1);
                        console.log("Đã xóa comp vì tỷ lệ thắng thấp.");
                    } else {
                        comp.ratioWinComp = ratioWinComp;
                        compList[existingIndex] = comp;
                        console.log("Cập nhật comp thành công.");
                    }
                }

                let newBattlePetUseSlotRound = Object.keys(typeGameConquest.battlePetUseSlotRound).reduce((newObj, key) => {
                    let newKey = key.replace(/B$/, 'A');
                    let skillData = typeGameConquest.battlePetUseSlotRound[key];

                    // Clone sâu để tránh ảnh hưởng dữ liệu gốc
                    let clonedSkillData = JSON.parse(JSON.stringify(skillData));

                    // Các field dạng số cần kiểm tra NaN/Infinity
                    const numericFields = ['COOLDOWN', 'HEAL', 'DAME', 'SHIELD', 'POISON', 'CRIT', 'DEF'];

                    numericFields.forEach(field => {
                        if (Array.isArray(clonedSkillData[field])) {
                            clonedSkillData[field] = clonedSkillData[field].map(val =>
                                isFinite(val) ? val : 0
                            );
                        }
                    });

                    // Các field như EFFECT thì giữ nguyên
                    if (Array.isArray(clonedSkillData['EFFECT'])) {
                        clonedSkillData['EFFECT'] = clonedSkillData['EFFECT'].map(val =>
                            typeof val === 'string' ? val : ''
                        );
                    }

                    newObj[newKey] = clonedSkillData;
                    return newObj;
                }, {});

                // Thêm comp mới với ID mới
                let newComp = {
                    usernameComp: username,
                    roundComp: currentRound,
                    slotSkillComp: newBattlePetUseSlotRound,
                    maxHpBattleComp: typeGameConquest.maxHpBattle + maxHpUp,
                    nameComp: nameUser,
                    winComp: typeGameConquest.winBattle,
                    loseComp: typeGameConquest.loseBattle,
                    selectCharacterComp: typeGameConquest.selectCharacterBattle,
                    dameCritA: typeGameConquest.dameCritB,
                    slowA: typeGameConquest.slowB,
                    upCooldownA: typeGameConquest.upCooldownB,
                    idComp: newIdComp,
                    winUser: 0,
                    loseUser: 0,
                    ratioWinComp: 0
                };
                compList.push(newComp);
                console.log("Đã thêm comp mới:", newComp);
                

                return set(firebaseCompRef, compList);
            });
        })
        .catch(error => {
            console.error("Lỗi trong createNewComp:", error);
        });
}


function startLoading() {
    const loadingScreen = document.getElementById("loadingScreen");
    const leftGate = document.getElementById("leftGate");
    const rightGate = document.getElementById("rightGate");

    // Hiển thị màn hình loading và bắt đầu tối dần
    loadingScreen.style.display = "block";
    loadingScreen.style.animation = "fadeToDark 1s forwards";

    // Đóng cửa sau khi màn hình bắt đầu tối
    setTimeout(() => {
        leftGate.style.transform = "translateX(0)";
        rightGate.style.transform = "translateX(0)";
    }, 300); // Nửa giây sau khi bắt đầu fade
}

function endLoading() {
    const loadingScreen = document.getElementById("loadingScreen");
    const leftGate = document.getElementById("leftGate");
    const rightGate = document.getElementById("rightGate");

    // Mở cửa ra
    setTimeout(() => {
        leftGate.style.transform = "translateX(-100%)";
        rightGate.style.transform = "translateX(100%)";
    }, 2000); // Đợi 1 giây để cửa đã đóng

    // Làm sáng màn hình và ẩn loading
    setTimeout(() => {
        loadingScreen.style.animation = "fadeToLight 1s forwards";
    }, 2500); // Sáng màn hình sau khi cửa mở

    setTimeout(() => {
        loadingScreen.style.display = "none"; // Ẩn màn hình loading
    }, 3000); // Đợi thêm để hiệu ứng sáng hoàn tất
}


//Show trang đăng ký đăng nhập quên mật khẩu
function switchTabWelcomPage(tab) {
    const container = document.getElementById('welcomePage');
    const newForm = document.getElementById('form-' + tab);

    // Nếu form đang hiển thị là form được chọn lại => không làm gì
    if (newForm.style.display === 'block') return;

    // Bước 1: lấy chiều cao hiện tại
    const startHeight = container.offsetHeight;

    // Ẩn tất cả form
    document.getElementById('form-login').style.display = 'none';
    document.getElementById('form-register').style.display = 'none';
    document.getElementById('form-forgot').style.display = 'none';

    // Hiện form mới để đo chiều cao
    newForm.style.display = 'block';
    const endHeight = newForm.offsetHeight;

    // Bước 2: đặt lại height ban đầu
    container.style.height = startHeight + 'px';
    container.style.transition = 'height 1s ease';
    void container.offsetHeight; // ép reflow

    // Bước 3: đặt height mới -> trigger animation
    container.style.height = endHeight + 60 + 'px';

    // Cập nhật viền tab
    document.getElementById('tab-login').style.borderBottom = 'none';
    document.getElementById('tab-register').style.borderBottom = 'none';
    document.getElementById('tab-forgot').style.borderBottom = 'none';
    document.getElementById('tab-' + tab).style.borderBottom = '2px solid #5C67F2';
}

//ĐĂNG KÝ
function register() {
    showLoading();
    var usernameRegister = document.getElementById("registerUsername").value;
    var passwordRegister = document.getElementById("registerPassword").value;
    var name = document.getElementById("registerName").value;
    var email = document.getElementById("registerEmail").value;
    var tel = document.getElementById("registerTel").value;
    var keyActive = document.getElementById("registerKey").value;
    var messageElement = document.getElementById("registerMessage"); // Phần tử thông báo
    var messageElementLogin = document.getElementById("loginMessage");

    // Biểu thức chính quy chỉ cho phép chữ cái, số và dấu gạch dưới (_), không chứa dấu cách
    var validCharRegex = /^[a-zA-Z0-9_]+$/;
    // Biểu thức chính quy chỉ cho phép số cho số điện thoại
    var validPhoneRegex = /^[0-9]+$/;
    // Biểu thức chính quy cho email hợp lệ (cơ bản)
    var validEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Kiểm tra điều kiện ký tự hợp lệ cho username và password, không chứa dấu cách
    if (!validCharRegex.test(usernameRegister) || usernameRegister.includes(' ')) {
        messageElement.innerText = "Tài khoản không được chứa ký tự đặc biệt hoặc khoảng trắng.";
        hideLoading()
        return;
    }

    if (!validCharRegex.test(passwordRegister) || passwordRegister.includes(' ')) {
        messageElement.innerText = "Mật khẩu không được chứa ký tự đặc biệt hoặc khoảng trắng.";
        hideLoading()
        return;
    }

    // Kiểm tra điều kiện hợp lệ cho email
    if (!validEmailRegex.test(email) || email.includes(' ')) {
        messageElement.innerText = "Email không hợp lệ hoặc chứa khoảng trắng.";
        hideLoading()
        return;
    }

    // Kiểm tra điều kiện hợp lệ cho số điện thoại: chỉ có số, không chứa khoảng trắng, và phải có đúng 10 ký tự
    if (!validPhoneRegex.test(tel) || tel.includes(' ') || tel.length !== 10) {
        messageElement.innerText = "Số điện thoại phải là 10 chữ số và không chứa khoảng trắng.";
        hideLoading()
        return;
    }

    // Kiểm tra điều kiện hợp lệ cho mã kích hoạt
    // if (keyActive.includes(' ')) {
    //     messageElement.innerText = "Mã kích hoạt không được để trống";
    //     hideLoading()
    //     return;
    // }

    // Kiểm tra tài khoản có tồn tại không

    get(ref(db, `allUsers`)).then(snapshot => {
        const data = snapshot.val();

        if (data && data.hasOwnProperty(usernameRegister)) {
            // Username đã tồn tại
            messageElement.innerText = "Tài khoản đã có người đăng ký, vui lòng sử dụng tài khoản khác!";
            hideLoading();
        } else {
            // Username chưa tồn tại → tiếp tục tạo tài khoản
            console.log("✅ Username hợp lệ, chưa có ai dùng.");

            get(ref(db, `keyActiveData`)).then(snapshot => {
                let keyActiveData = snapshot.val();

                let typeActiveKey = "Thường";
                const itemKey = keyActiveData.find(item => item.key === keyActive);  // Tìm phần tử có key === keyActive

                if (itemKey) {  // Nếu tìm thấy phần tử
                    // Nếu tìm thấy phần tử, gán typeActiveKey với typeKey của phần tử đó
                    typeActiveKey = itemKey.typeKey;
                }

                var battlePetUseSlotRound = { //pet đang dùng tại slotskill
                    skill1B: defaultSTT5MonInBattle,
                    skill2B: defaultSTT5MonInBattle,
                    skill3B: defaultSTT5MonInBattle,
                    skill4B: defaultSTT5MonInBattle,
                    skill5B: defaultSTT5MonInBattle,
                    skill6B: defaultSTT5MonInBattle,
                    skill7B: defaultSTT5MonInBattle,
                    skill8B: defaultSTT5MonInBattle,
                    skill9B: defaultSTT5MonInBattle,
                };
                var battlePetInInventory = {
                    battleInv1: defaultSTT5MonInBattle,
                    battleInv2: defaultSTT5MonInBattle,
                    battleInv3: defaultSTT5MonInBattle,
                    battleInv4: defaultSTT5MonInBattle,
                    battleInv5: defaultSTT5MonInBattle,
                    battleInv6: defaultSTT5MonInBattle,
                    battleInv7: defaultSTT5MonInBattle,
                    battleInv8: defaultSTT5MonInBattle,
                    battleInv9: defaultSTT5MonInBattle,
                }; //pet có trong slot tủ đồ
                var skillBattle = { //Khay Pet sử dụng
                    skill1A: defaultSTT5MonInBattle,
                    skill2A: defaultSTT5MonInBattle,
                    skill3A: defaultSTT5MonInBattle,
                    skill4A: defaultSTT5MonInBattle,
                    skill5A: defaultSTT5MonInBattle,
                    skill6A: defaultSTT5MonInBattle,
                    skill7A: defaultSTT5MonInBattle,
                    skill8A: defaultSTT5MonInBattle,
                    skill9A: defaultSTT5MonInBattle,
                    skill1B: defaultSTT5MonInBattle,
                    skill2B: defaultSTT5MonInBattle,
                    skill3B: defaultSTT5MonInBattle,
                    skill4B: defaultSTT5MonInBattle,
                    skill5B: defaultSTT5MonInBattle,
                    skill6B: defaultSTT5MonInBattle,
                    skill7B: defaultSTT5MonInBattle,
                    skill8B: defaultSTT5MonInBattle,
                    skill9B: defaultSTT5MonInBattle,
                };

                var battlePetInShop = {
                    battleShop1: defaultSTT5MonInBattle,
                    battleShop2: defaultSTT5MonInBattle,
                    battleShop3: defaultSTT5MonInBattle,
                    battleShop4: defaultSTT5MonInBattle,
                    battleShop5: defaultSTT5MonInBattle,
                };

                const typeGameConquest = {
                    winBattle: 0,
                    loseBattle: 0,
                    pointBattle: 0,
                    reRoll: 0,
                    reRollPrice: 0,
                    starUser: 0,
                    selectCharacterBattle: "",
                    slowB: 0,
                    upCooldownB: 0,
                    dameCritB: 0,
                    slowA: 0,
                    upCooldownA: 0,
                    dameCritA: 0,
                    selectSkillShop: 0,
                    usernameComp: "",
                    idComp: "",
                    nameComp: "",
                    maxHpBattleComp: 0,
                    winComp: 0,
                    loseComp: 0,
                    selectCharacterComp: "",
                    battleUserPet: [""],
                    maxHpBattle: 0,
                    // slotLock: {skill1B: false, skill2B: false, skill3B: true, skill4B: true, skill5B: true, skill6B: true, skill7B: true, skill8B: true, skill9B: true},
                    battleUserPetRound: [""],
                    battlePetUseSlotRound: battlePetUseSlotRound,
                    battlePetInShop: battlePetInShop,
                    battlePetInInventory: battlePetInInventory,
                    skillBattle: skillBattle
                }

                const typeGameSolo5Mon = {}
                const typeGameGuess = {}
                const infoStartGame = { typeGame: "No", modeGame: "No", difficultyGame: "No", roundGame: 1, stepGame: 0, winStreak: 0, }

                const allBattleUsersData = { typeGameConquest, typeGameSolo5Mon, typeGameGuess }

                var userData = {
                    passwordUser: passwordRegister,
                    nameUser: name,
                    telUser: tel,
                    activateUser: "Yes",
                    keyLogin: 0,
                    pointRank: { typeGameConquest: 0, typeGameSolo5Mon: 0, typeGameGuess: 0 },
                    goldUser: 0,
                    staminaUser: 0,
                    weightBagUser: 100,
                    luckyMeet5Mon: 5,
                    diamondUser: 0,
                    characterUser: "",
                    allCharacterUser: [],
                    userPet: [""],
                    battleData: allBattleUsersData,
                    isBan: "No",
                    timeOnline: "",
                    onlineLasted: "",
                    weekOnline: "",
                    ticketsUser: 0,
                    vipTicket: typeActiveKey,
                    onGame: 0,
                    infoStartGame: infoStartGame,
                    idSkillRND: 0,
                    todayCheckin: "No",
                    weekCheckin: { t2: 0, t3: 0, t4: 0, t5: 0, t6: 0, t7: 0, cn: 0 },
                    giftCheckinComplete: "",
                    questDay: { qd1: [0, "No"], qd2: [0, "No"], qd3: [0, "No"], qd4: [0, "No"], qd5: [0, "No"], qd6: [0, "No"] },
                    questWeek: { qw1: [0, "No"], qw2: [0, "No"], qw3: [0, "No"], qw4: [0, "No"], qw5: [0, "No"], qw6: [0, "No"] },
                    questWeekend: { qwe1: [0, "No"], qwe2: [0, "No"], qwe3: [0, "No"], qwe4: [0, "No"], qwe5: [0, "No"], qwe6: [0, "No"] }
                };


                // Thực hiện tạo tài khoản
                const userRef = ref(db, `allUsers/${usernameRegister}`);
                set(userRef, userData)
                    .then(() => {
                        messageElementLogin.innerText = "Đăng ký thành công";
                        document.getElementById("loginUsername").value = usernameRegister;
                        document.getElementById("loginPassword").value = passwordRegister;
                        document.getElementById("registerPage").style.opacity = 0;
                        setTimeout(() => {
                            document.getElementById("registerPage").style.display = "none";
                        }, 1500);
                        hideLoading();
                    })
                    .catch((error) => {
                        console.error("❌ Lỗi khi tạo tài khoản:", error);
                        messageElement.innerText = "Đã xảy ra lỗi khi đăng ký tài khoản.";
                        hideLoading();
                    });

                // Cập nhật keyActiveData sau khi đăng ký nếu có dùng keyActive
                if (keyActive && keyActive !== "") {
                    let updatedKeyActiveData = keyActiveData.filter(item => item.key !== keyActive);

                    // Nếu không còn key nào, thêm key mặc định
                    if (updatedKeyActiveData.length === 0) {
                        updatedKeyActiveData = [{ key: "JEAEF!@H%ZXZ", typeKey: "Vàng" }];
                    }

                    update(ref(db), { keyActiveData: updatedKeyActiveData })
                        .then(() => {
                            console.log("✅ Cập nhật keyActiveData thành công!");
                        })
                        .catch((error) => {
                            console.error("❌ Lỗi khi cập nhật keyActiveData:", error);
                        });
                }
            })


            const userRankData = {
                [usernameRegister]: { rankPoint: { typeGameConquest: 0, typeGameGuess: 0, typeGameSolo5Mon: 0 } }
            };


            update(ref(db, 'rankGame'), userRankData)
                .then(() => {
                    console.log("✅ Đã thêm hoặc cập nhật rankGame cho người dùng:", usernameRegister);
                })
                .catch(err => {
                    console.error("❌ Lỗi khi cập nhật rankGame:", err);
                });

        }
    }).catch(error => {
        messageElement.innerText = "Lỗi đăng ký, vui lòng thử lại!";
        console.error("Lỗi:", error);
        hideLoading();
    });

}


//ĐĂNG NHẬP
//Đăng nhập khi đúng tài khoản
function login(isTest) {
    showLoading();
    loadAllData();
    var usernameLogin = document.getElementById("loginUsername").value;
    var passwordLogin = document.getElementById("loginPassword").value;
    if (isTest) {
        usernameLogin = "vanviettest";
        passwordLogin = "123456";
    }
    var firebaseUserRef = ref(db, 'allUsers/' + usernameLogin); // Reference tới Firebase Realtime Database

    // Sử dụng get() để lấy dữ liệu
    get(firebaseUserRef)
        .then(snapshot => {
            if (!snapshot.exists()) {
                var messageElement = document.getElementById("loginMessage");
                messageElement.innerText = "Tài khoản chưa được đăng ký!";
                hideLoading();
                return;
            }

            var userData = snapshot.val(); // Dữ liệu người dùng

            var messageElement = document.getElementById("loginMessage");

            if (userData.passwordUser !== passwordLogin) {
                messageElement.innerText = "Mật khẩu không đúng!";
                hideLoading();
                return;
            }

            if (userData.activateUser === "No") {
                messageElement.innerText = "Tài khoản chưa được kích hoạt, vui lòng đợi hoặc liên hệ hỗ trợ!";
                hideLoading();
                return;
            }

            // ✅ Đăng nhập thành công, cập nhật trạng thái online
            let newKey = Math.floor(1000000000 + Math.random() * 9000000000)
            keyLogin = newKey;

            set(firebaseUserRef, {
                ...userData,
                keyLogin: newKey,
            })
                .then(() => {
                    username = usernameLogin;
                    password = passwordLogin;

                    loadDataForUser(); // Load dữ liệu người dùng

                    document.getElementById("welcomePage").style.display = "none";
                    document.getElementById("mainScreen").style.display = "flex";

                    document.getElementById("loginUsername").value = "";
                    document.getElementById("loginPassword").value = "";
                    openFullscreen();
                    loadMap();
                    startStaminaRegen();
                    // loadAllComp();
                });

            hideLoading();

            // Xóa thông báo sau 3 giây
            setTimeout(() => {
                messageElement.innerText = "";
            }, 3000);
        })
        .catch(error => {
            console.error("Lỗi khi đăng nhập:", error);
            document.getElementById("loginMessage").innerText = "Lỗi hệ thống, vui lòng thử lại!";
            hideLoading();
        });
}

window.login = login;

let allCharacterLoad = [];
let characterSelect;
let indexCharacterSelect = 0;

function openPopupSelectCharacter(newAccount) {
    if (newAccount) { // Nếu là tài khoản mới
        allCharacterLoad = [
            allCharacter["C0001"],
            allCharacter["C0002"]
        ];
        indexCharacterSelect = 0;
        characterSelect = allCharacter["C0001"];
    } else { // Nếu là bấm vào thay đổi nhân vật
        allCharacterLoad = allCharacterUser
            .map(id => allCharacter[id])
            .filter(char => char); // bỏ qua undefined nếu id không tồn tại
    
        indexCharacterSelect = allCharacterLoad.findIndex(char => char.id === characterUser);
        if (indexCharacterSelect === -1) indexCharacterSelect = 0;
    
        characterSelect = allCharacterLoad[indexCharacterSelect];
    }

    showDescCharacterSelect(characterSelect);

    document.getElementById("popupSelectCharacter").style.display = "flex";
    console.log("allCharacterLoad", allCharacterLoad);
}

function prevShowCharacterSelect() {
    indexCharacterSelect = (indexCharacterSelect - 1 + allCharacterLoad.length) % allCharacterLoad.length;
    characterSelect = allCharacterLoad[indexCharacterSelect];
    showDescCharacterSelect(characterSelect);
}

function nextShowCharacterSelect() {
    indexCharacterSelect = (indexCharacterSelect + 1) % allCharacterLoad.length;
    characterSelect = allCharacterLoad[indexCharacterSelect];
    showDescCharacterSelect(characterSelect);
}
    
function showDescCharacterSelect(characterSelect) {
    document.getElementById("imgCharacterSelect").src = characterSelect.urlIMG
    document.getElementById("nameCharacter").innerText = characterSelect.name
    
    let sttCharacter = ""
    if (characterSelect.hpMax > 0) {
        sttCharacter +=  `<span>Tăng <a style="color:green">${characterSelect.hpMax} sinh mệnh tối đa</a> cho nhân vật sau mỗi vòng đấu</span>`;
    }
    if (characterSelect.upDame > 0) {
        sttCharacter += `<span>Tăng <a style="color:red">${characterSelect.upDame} sát thương</a> cho tất cả 5mon sau mỗi vòng đấu</span>`;
    }
    if (characterSelect.upHeal > 0) {
        sttCharacter += `<span>Tăng <a style="color:lime">${characterSelect.upHeal} chỉ số hồi Hp</a> cho tất cả 5mon sau mỗi vòng đấu</span>`;
    }
    if (characterSelect.upShield > 0) {
        sttCharacter += `<span>Tăng <a style="color:blue">${characterSelect.upShield} chỉ số tạo giáp</a> cho tất cả 5mon sau mỗi vòng đấu</span>`;
    }
    if (characterSelect.upBurn > 0) {
        sttCharacter += `<span>Tăng <a style="color:orange">${characterSelect.upBurn} sát thương đốt</a> cho tất cả 5mon sau mỗi vòng đấu</span>`;
    }
    if (characterSelect.upPoison > 0) {
        sttCharacter += `<span>Tăng <a style="color:purple">${characterSelect.upPoison} gây độc</a> cho tất cả 5mon sau mỗi vòng đấu</span>`;
    }
    if (characterSelect.upCrit > 0) {
        sttCharacter += `<span>Tăng <a style="color:red">${characterSelect.upCrit} chỉ số chí mạng</a> 5mon sau mỗi vòng đấu</span>`;
    }
    if (characterSelect.upCooldown > 0) {
        sttCharacter += `<span>Tăng <a style="color:blue">${characterSelect.upCooldown / 1000}s tốc độ</a> của bản thân sau mỗi vòng đấu (hiện tại: ${typeGameConquest.upCooldownB / 1000}s)</span>`;
    }
    if (characterSelect.dameCrit > 0) {
        sttCharacter += `<span>Tăng <a style="color:red">${characterSelect.dameCrit}% sát thương chí mạng</a> sau mỗi vòng đấu (hiện tại: ${typeGameConquest.dameCritB}%)</span>`;
    }
    
    document.getElementById("descCharacterSelect").innerHTML = `
    <div>
        ${characterSelect.desc}
    </div>
    <div style="display: flex; text-align: justify; flex-direction: column; align-items: flex-start; justify-content: flex-start;
    gap: 5px;">
        <span style="font-weight: bold">Chỉ số:</span>
        ${sttCharacter}
    </div>
    `
}

function selectCharacterForUser() {
    characterUser = characterSelect.id
    document.getElementById("playerHunter").src= characterSelect.urlIMG
    document.getElementById("popupSelectCharacter").style.display = "none";
}

//LOADING
function showLoading() {
    document.getElementById("loadingOverlay").style.animation = 'fadeIn 1s ease-out';
    document.getElementById("loadingOverlay").style.display = "flex";
}

function hideLoading() {
    document.getElementById("loadingOverlay").style.animation = 'fadeOut 1s ease-in-out forwards';
    setTimeout(() => {
        document.getElementById("loadingOverlay").style.display = "none";
    }, 1000); // Thời gian (3000 ms = 3 giây)
}

let sortBagLeft = "";
let sortBagRight = "";

function chosenSortBagLeft(sort, divID) {

    const allButtonSort = {
        buttonSSR: { div: document.getElementById("buttonSSR") },
        buttonSS: { div: document.getElementById("buttonSS") },
        buttonS: { div: document.getElementById("buttonS") },
        buttonA: { div: document.getElementById("buttonA") },
        buttonB: { div: document.getElementById("buttonB") },
        buttonC: { div: document.getElementById("buttonC") },
        buttonD: { div: document.getElementById("buttonD") },
        buttonAll: { div: document.getElementById("buttonAll") },
    }

    Object.values(allButtonSort).forEach((button, index) => {
        let divAll = button.div
        divAll.style.background = "rgb(222, 109, 62)" //Reset về màu cũ
    })

    document.getElementById(divID).style.background = "rgb(181 27 27)"

    sortBagLeft = sort
    loadItemBagLeft(sortBagLeft);
}

function openBag() {

    showOrHiddenDiv('popupBag');
    if (!sortBagLeft || sortBagLeft === "") {
        chosenSortBagLeft("All", "buttonAll")
    } else {
        let divButton
        if (sortBagLeft === "All") {
            divButton = "buttonAll"
        } else {
            divButton = `button${sortBagLeft}`
        }
        chosenSortBagLeft(sortBagLeft, divButton)
    }

    if (!sortBagRight || sortBagRight === "") {
        loadItemBagRight("Conquest");
    } else {
        loadItemBagRight(sortBagRight);
    }

    document.getElementById("bagPages").addEventListener("drop", handleDropBag);
    document.getElementById("inventoryPages").addEventListener("drop", handleDropInventory);

    if (document.getElementById("overlayPopupBag").style.display === "block") {
        document.getElementById("overlayPopupBag").style.display = "none";
    } else {
        document.getElementById("overlayPopupBag").style.display = "block";
    }
}

function loadItemBagLeft(sort) {
    sortBagLeft = sort
    const boardBagLeft = document.getElementById("boardBagLeft")
    const containerId = "inventoryPages";
    let userPetSort
    if (sort === "All") {
        userPetSort = Object.values(userPet).sort((a, b) => a.ID.localeCompare(b.ID));
    } else {
        userPetSort = Object.values(userPet)
            .filter(pet => pet.RARE === sort)
            .sort((a, b) => a.ID.localeCompare(b.ID));
    }

    boardBagLeft.innerHTML = ""

    Object.values(userPetSort).forEach((item, index) => {
        const prefix = "inventory"
        const skillDiv = document.createElement("div");
        skillDiv.id = `${prefix}${index + 1}`;
        skillDiv.style.width = "65px";
        skillDiv.style.height = "76px";
        skillDiv.style.cursor = "grab"; // Sửa cú pháp
        skillDiv.style.borderRadius = "5px"; // Sửa cú pháp (border-radius => borderRadius)
        skillDiv.style.textAlign = "center"; // Sửa cú pháp (text-align => textAlign)
        skillDiv.style.background = "#3b3b56"; // Dùng đúng cú pháp
        skillDiv.style.backgroundSize = "cover";
        skillDiv.style.backgroundPosition = "center";
        skillDiv.style.backgroundRepeat = "no-repeat";
        skillDiv.style.position = "relative";
        skillDiv.style.border = "2px solid rebeccapurple";
        skillDiv.style.outline = "4px solid #ff973a";
        skillDiv.onmouseover = function () {
            this.style.transform = "scale(1.05)";
        };
        skillDiv.onmouseout = function () {
            this.style.transform = "scale(1)";
        };
        let URLimg = item.URLimg[`Lv${item.LEVEL}`] || item.URLimg['Lv1'];
        
        skillDiv.style.backgroundImage = `url(${URLimg})`; // Đặt URL hình ảnh
        skillDiv.draggable = true; // Đặt thuộc tính draggable
        skillDiv.dataset.id = item.ID; // Gắn dữ liệu ID
        skillDiv.dataset.idcreate = item.IDcreate; // Gắn dữ liệu ID

        skillDiv.className = "skill5MonInBag";
        skillDiv.dataset.source = containerId; // Gắn dữ liệu nguồn


        let dameSkillText = ``; // Dùng let có thể thay đổi được biến, còn dùng const không được

        if (item.DAME[0] > 0) { //Skill dame
            dameSkillText += `<div class="skill-dame">${Number(item.DAME[0])}</div>`;
        }
        if (item.HEAL[0] > 0) { //Skill heal
            dameSkillText += `<div class="skill-heal">${Number(item.HEAL[0])}</div>`;
        }
        if (item.SHIELD[0] > 0) { //Skill shield
            dameSkillText += `<div class="skill-shield">${Number(item.SHIELD[0])}</div>`;
        }
        if (item.BURN[0] > 0) { //Skill BURN
            dameSkillText += `<div class="skill-burn">${Number(item.BURN[0])}</div>`;
        }
        if (item.POISON[0] > 0) { //Skill Poison
            dameSkillText += `<div class="skill-poison">${Number(item.POISON[0])}</div>`;
        }
        if (item.EFFECT.includes("Freeze")) { //Skill đóng băng freeze
            dameSkillText += `<div class="skill-freeze">${Number(item.COOLDOWN[0] / 2 / 1000 * item.LEVEL)}</div>`;
        }

        boardBagLeft.appendChild(skillDiv);

        // Gắn nội dung vào slotDiv
        skillDiv.innerHTML =
            `<div class="dameSkillText" style="display: flex; flex-direction: row; align-items: center;">
                      ${dameSkillText}
                      </div>
                      <div style="position: absolute;font-size: 10px;font-weight: bold;color: rgb(83, 21, 21);text-shadow: 2px 1px 2px #140a03;top: 5px;right: 8px; z-index: 2">
                        <span style="position: absolute;top: -8px;left: 8px;transform: translate(-50%, -50%);font-size: 12px; padding: 1px; color: #ffd600; font-weight: bold; background: #ff0000;min-width: 15px; border-radius: 5px;">${item.RARE}</span>
                      </div>`;

        //Kiểm tra xem đã trang bị chưa
        const hasEquipped = Object.values(typeGameConquest.battleUserPet).some(pet => pet.ID === item.ID);

        if (hasEquipped) {
            const ownedOverlay = document.createElement("div");
            ownedOverlay.textContent = "Đã dùng";
            ownedOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.3);
                color: white;
                font-size: 14px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 10px;
                pointer-events: none;
            `;
            skillDiv.appendChild(ownedOverlay);
        }

        skillDiv.addEventListener("dragstart", (event) => {
            const data = {
                skillId: item.IDcreate, // truyền IDcreate
                source: "inventoryPages"
            };
            event.dataTransfer.setData("text/plain", JSON.stringify(data));
        });

        skillDiv.addEventListener("click", (e) => {
            // Xóa popup nút nếu đã có
            const existingPopup = document.querySelector(".item-action-popup");
            if (existingPopup) existingPopup.remove();

            // Tạo popup container
            let popup = document.createElement("div");
            popup.className = "item-action-popup";
            popup.style.position = "relative";
            popup.style.display = "flex";
            popup.style.flexDirection = "column";
            popup.style.gap = "5px";
            popup.style.zIndex = "10";
            popup.style.background = "#04040454";
            popup.style.height = "100%";
            popup.style.justifyContent = "center";

            // Nút Thông tin
            let infoBtn = document.createElement("button");
            infoBtn.innerText = "Thông tin";
            infoBtn.style.padding = "3px";
            infoBtn.style.cursor = "pointer";
            infoBtn.style.background = "#4da6ff";
            infoBtn.style.color = "#fff";
            infoBtn.style.border = "none";
            infoBtn.style.borderRadius = "3px";
            infoBtn.style.boxShadow = "1px 1px 2px #000000c4";
            infoBtn.addEventListener("click", () => {
                setupClickPopupInfo5MonBag(item, "inventory", item.LEVEL);

                for (let k = 1; k <= 4; k++) {
                    document.getElementById(`popupSTT5MonLV${k}`).style.background = "firebrick";
                }

                document.getElementById(`popupSTT5MonLV${item.LEVEL}`).style.background = "rebeccapurple";

                infoBtn.remove();
                infoBtn = null;
                popup.remove();
                popup = null;
            });

            // Nút gắn vào
            let addBtn = document.createElement("button");
            addBtn.innerText = "Gắn vào";
            addBtn.style.padding = "3px";
            addBtn.style.cursor = "pointer";
            addBtn.style.background = "#ff4d4d";
            addBtn.style.color = "#fff";
            addBtn.style.border = "none";
            addBtn.style.borderRadius = "3px";
            addBtn.style.boxShadow = "1px 1px 2px #000000c4";
            addBtn.addEventListener("click", () => {
                if (Object.values(typeGameConquest.battleUserPet).length >= 40) {
                    messageOpen('Hành lý đã đầy');
                    return;
                }

                const newKey = item.IDcreate;

                // Nếu chưa tồn tại key IDcreate
                if (typeGameConquest.battleUserPet[newKey]) {
                    messageOpen('Hành lý đã có 5Mon này rồi');
                    return;
                } else {
                    // Kiểm tra xem đã tồn tại pet có cùng ID hay chưa
                    const isDuplicate = Object.values(typeGameConquest.battleUserPet).some(pet => pet.ID === item.ID);

                    if (isDuplicate) {
                        messageOpen('Hành lý đã có 5Mon này rồi');
                        return;
                    }

                    // Nếu không trùng thì thêm vào
                    typeGameConquest.battleUserPet[newKey] = item;
                    loadItemBagRight(sortBagRight);
                    loadItemBagLeft(sortBagLeft)
                    addBtn.remove();
                    addBtn = null;
                    popup.remove();
                    popup = null;
                }
            });

            // Thêm nút vào popup
            popup.appendChild(infoBtn);
            popup.appendChild(addBtn);

            // Xoá popup nếu click ngoài
            document.addEventListener("click", function docClick(e) {
                if (popup && !popup.contains(e.target) && e.target !== skillDiv) {
                    addBtn.remove()
                    addBtn = null;
                    infoBtn.remove();
                    infoBtn = null;
                    popup.remove();
                    popup = null;
                    document.removeEventListener("click", docClick);
                }
            });

            for (let s = 1; s <= 4; s++) {
                const el = document.getElementById(`popupSTT5MonLV${s}`);
                if (!el) continue;
                el.onclick = () => {
                    setupClickPopupInfo5MonBag(item, "inventory", s);
                    for (let k = 1; k <= 4; k++) {
                        document.getElementById(`popupSTT5MonLV${k}`).style.background = "firebrick";
                    }
                    
                    el.style.background = "rebeccapurple";

                };
            }
            
            // Thêm vào skillDiv
            skillDiv.appendChild(popup);
        });

    });

    document.getElementById("weightBagLeftText").innerText = `${Object.values(userPet).length}/${weightBagUser}`
    document.getElementById("weightBagLeft").style.width = `${Math.min(Object.values(userPet).length / weightBagUser * 100, 100)}%`
}

function handleDropBag(event) {
    event.preventDefault();
    const data = JSON.parse(event.dataTransfer.getData("text/plain"));
    const { skillId: skillIDcreate, source } = data;
    console.log("??right")
    if (Object.values(typeGameConquest.battleUserPet).length >= 40) {
        messageOpen('Hành lý đã đầy')
        return;
    }

    if (source === "inventoryPages") {
        // Tìm skill trong userPet theo IDcreate
        const skill = Object.values(userPet).find((s) => s.IDcreate === skillIDcreate);

        if (!skill) {
            console.log("Skill không tồn tại trong userPet!");
            return;
        }

        const skillID = skill.ID;

        // Kiểm tra xem đã có skill này trong battle chưa (theo ID hoặc IDcreate)
        const battleList = Object.values(typeGameConquest.battleUserPet);
        const alreadyInBag = battleList.some((s) => s.ID === skillID || s.IDcreate === skillIDcreate);

        if (!alreadyInBag) {
            // Gán theo key là IDcreate
            typeGameConquest.battleUserPet[skillIDcreate] = skill;
            loadItemBagLeft(sortBagLeft);
            loadItemBagRight(sortBagRight);
        } else {
            console.log("Skill đã có trong bag rồi!");
        }
    }
}


function handleDropInventory(event) {
    event.preventDefault();
    const data = JSON.parse(event.dataTransfer.getData("text/plain"));
    const { skillId, source, item } = data;
    console.log("??left")
    if (source === "bagPages") {
        const skillIDcreate = item.IDcreate;

        if (typeGameConquest.battleUserPet[skillIDcreate]) {
            delete typeGameConquest.battleUserPet[skillIDcreate];
            loadItemBagLeft(sortBagLeft);
            loadItemBagRight(sortBagRight);
        } else {
            console.log("Skill không tồn tại trong bag!");
        }
    }
}


function loadItemBagRight(sort) {
    sortBagRight = sort;
    const boardBagRight = document.getElementById("boardBagRight")
    const containerId = "bagPages";
    const battleUserPet = sort === "Conquest" ? typeGameConquest.battleUserPet : typeGameSolo5Mon.battleUserPet
    let battleUserPetSort = Object.values(battleUserPet).sort((a, b) => a.ID.localeCompare(b.ID));
    battleUserPetSort = Object.fromEntries(
        battleUserPetSort.map(item => [item.IDcreate, item])
    );

    console.log("battleUserPetSort", battleUserPetSort)
    boardBagRight.innerHTML = ""

    Object.values(battleUserPetSort).forEach((item, index) => {
        const prefix = "bag"
        const skillDiv = document.createElement("div");
        skillDiv.id = `${prefix}${index + 1}`;
        skillDiv.style.width = "65px";
        skillDiv.style.height = "76px";
        skillDiv.style.cursor = "grab"; // Sửa cú pháp
        skillDiv.style.borderRadius = "5px"; // Sửa cú pháp (border-radius => borderRadius)
        skillDiv.style.textAlign = "center"; // Sửa cú pháp (text-align => textAlign)
        skillDiv.style.background = "#3b3b56"; // Dùng đúng cú pháp
        skillDiv.style.backgroundSize = "cover";
        skillDiv.style.backgroundPosition = "center";
        skillDiv.style.backgroundRepeat = "no-repeat";
        skillDiv.style.position = "relative";
        skillDiv.style.border = "2px solid rebeccapurple";
        skillDiv.style.outline = "4px solid #ff973a";
        skillDiv.onmouseover = function () {
            this.style.transform = "scale(1.05)";
        };
        skillDiv.onmouseout = function () {
            this.style.transform = "scale(1)";
        };
        let URLimg = item.URLimg[`Lv${item.LEVEL}`] || item.URLimg['Lv1'];
        skillDiv.style.backgroundImage = `url(${URLimg})`; // Đặt URL hình ảnh
        skillDiv.draggable = true; // Đặt thuộc tính draggable
        skillDiv.dataset.id = item.ID; // Gắn dữ liệu ID
        skillDiv.dataset.idcreate = item.IDcreate; // Gắn dữ liệu ID
        skillDiv.className = "skill5MonInBag";
        skillDiv.dataset.source = containerId; // Gắn dữ liệu nguồn

        let dameSkillText = ``; // Dùng let có thể thay đổi được biến, còn dùng const không được

        if (item.DAME[0] > 0) { //Skill dame
            dameSkillText += `<div class="skill-dame">${Number(item.DAME[0])}</div>`;
        }
        if (item.HEAL[0] > 0) { //Skill heal
            dameSkillText += `<div class="skill-heal">${Number(item.HEAL[0])}</div>`;
        }
        if (item.SHIELD[0] > 0) { //Skill shield
            dameSkillText += `<div class="skill-shield">${Number(item.SHIELD[0])}</div>`;
        }
        if (item.BURN[0] > 0) { //Skill BURN
            dameSkillText += `<div class="skill-burn">${Number(item.BURN[0])}</div>`;
        }
        if (item.POISON[0] > 0) { //Skill Poison
            dameSkillText += `<div class="skill-poison">${Number(item.POISON[0])}</div>`;
        }
        if (item.EFFECT.includes("Freeze")) { //Skill đóng băng freeze
            dameSkillText += `<div class="skill-freeze">${Number(item.COOLDOWN[0] / 2 / 1000 * item.LEVEL)}</div>`;
        }

        boardBagRight.appendChild(skillDiv);

        // Gắn nội dung vào slotDiv
        skillDiv.innerHTML =
            `<div class="dameSkillText" style="display: flex; flex-direction: row; align-items: center;">
                      ${dameSkillText}
                      </div>
                      <div style="position: absolute;font-size: 10px;font-weight: bold;color: rgb(83, 21, 21);text-shadow: 2px 1px 2px #140a03;top: 5px;right: 8px; z-index: 2">
                        <span style="position: absolute;top: -8px;left: 8px;transform: translate(-50%, -50%);font-size: 12px; padding: 1px; color: #ffd600; font-weight: bold; background: #ff0000;min-width: 15px; border-radius: 5px;">${item.RARE}</span>
                      </div>`;

        skillDiv.addEventListener("dragstart", (event) => {
            const data = {
                skillId: item.IDcreate,
                source: "bagPages",
                item: item // truyền full object để dùng lại
            };
            event.dataTransfer.setData("text/plain", JSON.stringify(data));
        });

        skillDiv.addEventListener("click", (e) => {
            // Xóa popup nút nếu đã có
            const existingPopup = document.querySelector(".item-action-popup");
            if (existingPopup) existingPopup.remove();

            // Tạo popup container
            let popup = document.createElement("div");
            popup.className = "item-action-popup";
            popup.style.position = "relative";
            popup.style.display = "flex";
            popup.style.flexDirection = "column";
            popup.style.gap = "5px";
            popup.style.zIndex = "10";
            popup.style.background = "#04040454";
            popup.style.height = "100%";
            popup.style.justifyContent = "center";

            // Nút Thông tin
            let infoBtn = document.createElement("button");
            infoBtn.innerText = "Thông tin";
            infoBtn.style.padding = "3px";
            infoBtn.style.cursor = "pointer";
            infoBtn.style.background = "#4da6ff";
            infoBtn.style.color = "#fff";
            infoBtn.style.border = "none";
            infoBtn.style.borderRadius = "3px";
            infoBtn.style.boxShadow = "1px 1px 2px #000000c4";
            infoBtn.addEventListener("click", () => {
                setupClickPopupInfo5MonBag(item, "bag", item.LEVEL);

                for (let k = 1; k <= 4; k++) {
                    document.getElementById(`popupSTT5MonLV${k}`).style.background = "firebrick";
                }

                document.getElementById(`popupSTT5MonLV${item.LEVEL}`).style.background = "rebeccapurple";
                infoBtn.remove();
                infoBtn = null;
                popup.remove();
                popup = null;
            });

            // Nút Tháo ra
            let removeBtn = document.createElement("button");
            removeBtn.innerText = "Tháo";
            removeBtn.style.padding = "3px";
            removeBtn.style.cursor = "pointer";
            removeBtn.style.background = "#ff4d4d";
            removeBtn.style.color = "#fff";
            removeBtn.style.border = "none";
            removeBtn.style.borderRadius = "3px";
            removeBtn.style.boxShadow = "1px 1px 2px #000000c4";
            removeBtn.addEventListener("click", () => {
                for (const key in typeGameConquest.battleUserPet) {
                    if (typeGameConquest.battleUserPet[key].IDcreate === item.IDcreate) {
                        delete typeGameConquest.battleUserPet[key];  // Xoá pet ra khỏi object
                        loadItemBagRight(sortBagRight)
                        loadItemBagLeft(sortBagLeft)
                        removeBtn.remove()
                        removeBtn = null;
                        popup.remove();
                        popup = null;
                        break;
                    }
                }
            });

            // Thêm nút vào popup
            popup.appendChild(infoBtn);
            popup.appendChild(removeBtn);

            // Xoá popup nếu click ngoài
            document.addEventListener("click", function docClick(e) {
                if (popup && !popup.contains(e.target) && e.target !== skillDiv) {
                    removeBtn.remove()
                    removeBtn = null;
                    infoBtn.remove();
                    infoBtn = null;
                    popup.remove();
                    popup = null;
                    document.removeEventListener("click", docClick);
                }
            });


            for (let s = 1; s <= 4; s++) {
                const el = document.getElementById(`popupSTT5MonLV${s}`);
                if (!el) continue;
                el.onclick = () => {
                    setupClickPopupInfo5MonBag(item, "bag", s);
                    for (let k = 1; k <= 4; k++) {
                        document.getElementById(`popupSTT5MonLV${k}`).style.background = "firebrick";
                    }
                    
                    el.style.background = "rebeccapurple";

                };
            }
        
            // Thêm vào skillDiv
            skillDiv.appendChild(popup);
        });
    });

    document.getElementById("weightBagRightText").innerText = `${Object.values(typeGameConquest.battleUserPet).length}/40`
    document.getElementById("weightBagRight").style.width = `${Math.min(Object.values(typeGameConquest.battleUserPet).length / 40 * 100, 100)}%`
}


//Hàm tính stat nâng cấp 5mon
function updateStatWhenLevelUp(skill, level, power, isInBattle) {
    let powerBonus

    if (isInBattle) {
        let lvUpScale = skill.LVUPSCALE[power.toUpperCase()]
        let lv1 = 0
        let lv2 = Math.round(50 * 2 * lvUpScale)
        let lv3 = Math.round(50 * 3 * lvUpScale)
        let lv4 = Math.round(50 * 4 * lvUpScale)


        if (skill.LEVEL === 4) {
            if (level === 0) {
                powerBonus = 0
            } else if (level === -1) {
                powerBonus = -lv4
            } else if (level === -2) {
                powerBonus = -lv4 - lv3
            } else if (level === -3) {
                powerBonus = -lv4 -lv3 -lv2
            } 
        } else if (skill.LEVEL === 3) {
            if (level === 1) {
                powerBonus = lv4
            } else if (level === 0) {
                powerBonus = 0
            } else if (level === -1) {
                powerBonus = -lv3
            } else if (level === -2) {
                powerBonus = -lv3 - lv2
            }
        } else if (skill.LEVEL === 2) {
            if (level === 2) {
                powerBonus = lv4 + lv3
            } else if (level === 1) {
                powerBonus = lv3
            } else if (level === 0) {
                powerBonus = 0
            } else if (level === -1) {
                powerBonus = -lv2
            }
        } else if (skill.LEVEL === 1) {
            if (level === 3) {
                powerBonus = lv4 + lv3 + lv2
            } else if (level === 2) {
                powerBonus = lv3 + lv2
            } else if (level === 1) {
                powerBonus = lv2
            } else if (level === 0) {
                powerBonus = 0
            }
        }
 
    } else {
        let sLvUPPower

        if (power==='str') {
            sLvUPPower = getScaleLevelUp(skill.POWER.STR);
        } else if (power==='def') {
            sLvUPPower = getScaleLevelUp(skill.POWER.DEF);
        } else if (power==='int') {
            sLvUPPower = getScaleLevelUp(skill.POWER.INT);
        } else if (power==='agi') {
            sLvUPPower = getScaleLevelUp(skill.POWER.AGI);
        } else if (power==='luk') {
            sLvUPPower = getScaleLevelUp(skill.POWER.LUK);
        } else if (power==='hp') {
            sLvUPPower = getScaleLevelUp(skill.POWER.HP);
        }

        if (level === 1) {
            powerBonus = 0
        } else if (level === 2) {
            powerBonus = Math.round(50 * 2 * sLvUPPower)
        } else if (level === 3) {
            powerBonus = Math.round((50 * 2 * sLvUPPower) + (50 * 3 * sLvUPPower))
        } else if (level === 4) {
            powerBonus = Math.round((50 * 2 * sLvUPPower) + (50 * 3 * sLvUPPower) + (50 * 4 * sLvUPPower))
        } else if (level === 0) {
            powerBonus = 0
        } else if (level === -1) {
            powerBonus = Math.round(-(50 * 2 * sLvUPPower))
        } else if (level === -2) {
            powerBonus = Math.round(-((50 * 2 * sLvUPPower) + (50 * 3 * sLvUPPower)))
        } else if (level === -3) {
            powerBonus = Math.round(-((50 * 2 * sLvUPPower) + (50 * 3 * sLvUPPower) + (50 * 4 * sLvUPPower)))
        }
    }

    console.log("powerBonus", powerBonus)
    return powerBonus || 0;
}


function setupClickPopupInfo5MonBag(item, prefix, level) {
    const popup = document.getElementById("popupSTT5Mon");
    const overlay = document.getElementById("popupOverlay");

    let URLimg = item.URLimg[`Lv${item.LEVEL}`] || item.URLimg['Lv1'];
    
    let colorLevel = "#531515";
    if (level === 2) {
        colorLevel = "#8c0b0b"
    } else if (level === 3) {
        colorLevel = "#c00d0d"
    } else if (level === 4) {
        colorLevel = "red"
    } else {
        colorLevel = "#531515"
    }
    
    const powerStatsSTR = updateStatWhenLevelUp(item, level, 'str');
    const powerStatsDEF = updateStatWhenLevelUp(item, level, 'def');
    const powerStatsINT = updateStatWhenLevelUp(item, level, 'int');
    const powerStatsAGI = updateStatWhenLevelUp(item, level, 'agi');
    const powerStatsLUK = updateStatWhenLevelUp(item, level, 'luk');
    const powerStatsHP = updateStatWhenLevelUp(item, level, 'hp');

    let str, def, int, agi, luk, hp, allStat;
    str = Math.round(item.POWER.STR + powerStatsSTR)
    def = Math.round(item.POWER.DEF + powerStatsDEF)
    int = Math.round(item.POWER.INT + powerStatsINT)
    agi = Math.round(item.POWER.AGI + powerStatsAGI)
    luk = Math.round(item.POWER.LUK + powerStatsLUK)
    hp = Math.round(item.POWER.HP + powerStatsHP)
    allStat = str + def + int + agi + luk + hp
    
    let powerINT = scalePower5Mon(int);

    let dame = 0, heal = 0, shield = 0, burn = 0, poison = 0;

    // Áp dụng scaleSTR vào các phép tính hiệu ứng
    if (item.EFFECT.includes("Attacking")) {
        dame = Math.round(powerINT.dame * item.POWER.SCALE) + item.DAME[1] + item.DAME[2] + item.DAME[3] + item.DAME[4];  // Giảm dần khi STR tăng
    }
    if (item.EFFECT.includes("Healing")) {
        heal = Math.round(powerINT.heal * item.POWER.SCALE) + item.HEAL[1] + item.HEAL[2] + item.HEAL[3] + item.HEAL[4];  // Giảm dần khi STR tăng
    }
    if (item.EFFECT.includes("Shield")) {
        shield = Math.round(powerINT.shield * item.POWER.SCALE) + item.SHIELD[1] + item.SHIELD[2] + item.SHIELD[3] + item.SHIELD[4];  // Giảm dần khi STR tăng
    }
    if (item.EFFECT.includes("Burn")) {
        burn = Math.round(powerINT.burn * item.POWER.SCALE) + item.BURN[1] + item.BURN[2] + item.BURN[3] + item.BURN[4];  // Giảm dần khi STR tăng
    }
    if (item.EFFECT.includes("Poison")) {
        poison = Math.round(powerINT.poison * item.POWER.SCALE) + item.POISON[1] + item.POISON[2] + item.POISON[3] + item.POISON[4];  // Giảm dần khi STR tăng
    }

    //Tính cooldown
    let minC = 8;
    let maxC = 20;
    let scaleC = Math.max(5, 170 - Math.floor((agi - 200) / 9)); // giảm dần, min là 5
    let valueC = ((maxC - minC) / (1 + agi / scaleC) * 1000) * (2 - item.POWER.SCALE);


    //tính crit
    let maxCrit = 60;
    let scaleCrit = 1500; // tùy chỉnh
    let valueCrit = maxCrit * luk / (luk + scaleCrit);
    valueCrit = Math.min(maxCrit, Math.max(0, valueCrit));
    valueCrit = Math.round(valueCrit * item.POWER.SCALE);

    //tính def
    let maxDef = 90;
    let scaleDef = 475; // tùy chỉnh
    let valueDef = maxDef * def / (def + scaleDef);
    valueDef = Math.min(maxDef, Math.max(0, valueDef));
    valueDef = Math.round(valueDef * item.POWER.SCALE);

    let crit = Math.round(valueCrit + item.CRIT[1] + item.CRIT[2] + item.CRIT[3]);
    let defFn = Math.round(valueDef * 100) / 100;
    let cooldown = Math.ceil(valueC);
    
    document.getElementById("imgPopupSTT5Mon").style.backgroundImage = "url('" + URLimg + "')";
    document.getElementById("namePopupSTT5Mon").textContent = item.NAME;
    document.getElementById("allStats5Mon").textContent = `⚔️: ${allStat}`;
    document.getElementById("levelTextPopupSTT5Mon").textContent = level;
    document.getElementById("rareTextPopupSTT5Mon").textContent = item.RARE;
    document.getElementById("priceTextPopupSTT5Mon").textContent = item.PRICE;
    document.getElementById("levelColorPopupSTT5Mon").style.color = colorLevel

    let descTextItem = "";
    // Type
    let typeInfo = "";
    item.TYPE.forEach(type => {
        typeInfo += `<a style=" background: rebeccapurple; padding: 2px 4px; border-radius: 4px; color: #ffffff;">${type}</a>`
    });

    // Cập nhật thông tin trong popup
    descTextItem += `
        <div style="display: flex; justify-content: space-between; flex-direction: row; align-items: center; width: 100%">
            <div style="display: flex; justify-content: space-between; flex-direction: row; align-items: center; gap: 3px; width: 100%">
                <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-hand-fist"></i>: ${str}</span>
                <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-shield"></i>: ${def}</span>
                <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-brain"></i>: ${int}</span>
                <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-bolt"></i></i>: ${agi}</span>
                <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-clover"></i>: ${luk}</span>
                <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-heart"></i>: ${hp}</span>
            </div>
        </div>`

    const scaleSTR = 1 * Math.log10(str);
    let valuePowerSTR = 0.12 * str / scaleSTR + 1
    let baseDame = Math.round(valuePowerSTR * item.POWER.SCALE);

    const scaleHP = 1 * Math.log10(hp);
    let valuePowerHP = 2 * hp / scaleHP + 100;
    let baseHP = Math.round(valuePowerHP * item.POWER.SCALE);

    descTextItem += `
            <span style="display: flex;font-weight: bold;font-size: 12px;padding: 2px 0px;color: black;gap: 5px;flex-direction: row;align-content: center;
            justify-content: space-between;align-items: center; width: 100%;">
            <span>
                [Máu: <a style="color:red; font-weight: bold;">${baseHP}</a>]
            </span>
            <span style="display: flex; gap: 5px;"> 
                <span style="display: flex; gap: 3px; flex-direction: row; align-content: center; justify-content: center; align-items: center;">
                    ${typeInfo}
                </span>
            </span>
            </span>
            <span style="font-weight: bold;margin-top: 5px;">[Đánh thường][Tốc độ: ${cooldown / 1000 || ''} giây][Liên kích: x${Math.max(item.COOLDOWN[1] + item.COOLDOWN[2] + item.COOLDOWN[3], 1)}]</span>
            <span >Gây <a style="color: red; font-weight: bold;">${baseDame} sát thương </a> cho 5Mon đối thủ (ưu tiên 5Mon đối diện)</span>
            `

    let descInfo = "";
    let countDescInfo = 1;
    if (item.EFFECT.length === 1) {
        item.EFFECT.forEach((effect) => {
            if (effectsSkill[effect]) {
                // Lấy chuỗi mô tả ban đầu
                let rawDesc = effectsSkill[effect].descriptionSkill;

                // Thay thế skill.POWER.X thành viết thường tương ứng
                rawDesc = rawDesc
                    .replace(/skill\.POWER\.STR/g, 'str')
                    .replace(/skill\.POWER\.DEF/g, 'def')
                    .replace(/skill\.POWER\.INT/g, 'int')
                    .replace(/skill\.POWER\.AGI/g, 'agi')
                    .replace(/skill\.POWER\.LUK/g, 'luk')
                    .replace(/skill\.POWER\.HP/g,  'hp')
                    .replace(/skill\.DAME\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'dame')
                    .replace(/skill\.HEAL\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'heal')
                    .replace(/skill\.SHIELD\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'shield')
                    .replace(/skill\.BURN\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'burn')
                    .replace(/skill\.POISON\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'poison');
                
                // Tạo hàm từ chuỗi đã xử lý
                const dynamicDescription = new Function("skill", "str", "def", "int", "agi", "luk", "hp", "dame", "heal", "shield", "burn", "poison", `return \`${rawDesc}\`;`);
        
                descInfo += dynamicDescription(item,str,def,int,agi,luk,hp,dame,heal,shield,burn,poison);
            }
        });

    } else {
        item.EFFECT.forEach((effect) => {
            if (effectsSkill[effect]) {
                // Lấy chuỗi mô tả ban đầu
                let rawDesc = effectsSkill[effect].descriptionSkill;
        
                // Thay thế skill.POWER.X thành viết thường tương ứng
                rawDesc = rawDesc
                    .replace(/skill\.POWER\.STR/g, 'str')
                    .replace(/skill\.POWER\.DEF/g, 'def')
                    .replace(/skill\.POWER\.INT/g, 'int')
                    .replace(/skill\.POWER\.AGI/g, 'agi')
                    .replace(/skill\.POWER\.LUK/g, 'luk')
                    .replace(/skill\.POWER\.HP/g,  'hp')
                    .replace(/skill\.DAME\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'dame')
                    .replace(/skill\.HEAL\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'heal')
                    .replace(/skill\.SHIELD\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'shield')
                    .replace(/skill\.BURN\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'burn')
                    .replace(/skill\.POISON\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'poison');
        
                // Tạo hàm từ chuỗi đã xử lý
                const dynamicDescription = new Function("skill", "str", "def", "int", "agi", "luk", "hp", "dame", "heal", "shield", "burn", "poison", `return \`${rawDesc}\`;`);
        
                // Truyền các giá trị vào hàm
                descInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countDescInfo})</span> ${dynamicDescription(item,str,def,int,agi,luk,hp,dame,heal,shield,burn,poison)}</span>`;
                countDescInfo += 1;
            }
        });
    }

    let internalInfo = "";
    let countInternalInfo = 1;
    if (item.INTERNAL.length === 1) {
        item.INTERNAL.forEach((internal) => {
            if (effectsInternal[internal]) {

                let rawDesc = effectsInternal[internal].descriptionInternal;

                // Thay thế skill.POWER.X thành viết thường tương ứng
                rawDesc = rawDesc
                    .replace(/skill\.POWER\.STR/g, 'str')
                    .replace(/skill\.POWER\.DEF/g, 'def')
                    .replace(/skill\.POWER\.INT/g, 'int')
                    .replace(/skill\.POWER\.AGI/g, 'agi')
                    .replace(/skill\.POWER\.LUK/g, 'luk')
                    .replace(/skill\.POWER\.HP/g,  'hp')
                    .replace(/skill\.DAME\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'dame')
                    .replace(/skill\.HEAL\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'heal')
                    .replace(/skill\.SHIELD\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'shield')
                    .replace(/skill\.BURN\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'burn')
                    .replace(/skill\.POISON\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'poison');
                
                // Tạo hàm từ chuỗi đã xử lý
                const dynamicDescription = new Function("skill", "str", "def", "int", "agi", "luk", "hp", "dame", "heal", "shield", "burn", "poison", `return \`${rawDesc}\`;`);
                
                internalInfo += dynamicDescription(item,str,def,int,agi,luk,hp,dame,heal,shield,burn,poison);
            }
        });
    } else {
        item.INTERNAL.forEach((internal) => {
            if (effectsInternal[internal]) {
                // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                let rawDesc = effectsInternal[internal].descriptionInternal;

                // Thay thế skill.POWER.X thành viết thường tương ứng
                rawDesc = rawDesc
                    .replace(/skill\.POWER\.STR/g, 'str')
                    .replace(/skill\.POWER\.DEF/g, 'def')
                    .replace(/skill\.POWER\.INT/g, 'int')
                    .replace(/skill\.POWER\.AGI/g, 'agi')
                    .replace(/skill\.POWER\.LUK/g, 'luk')
                    .replace(/skill\.POWER\.HP/g,  'hp')
                    .replace(/skill\.DAME\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'dame')
                    .replace(/skill\.HEAL\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'heal')
                    .replace(/skill\.SHIELD\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'shield')
                    .replace(/skill\.BURN\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'burn')
                    .replace(/skill\.POISON\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'poison');
                
                // Tạo hàm từ chuỗi đã xử lý
                const dynamicDescription = new Function("skill", "str", "def", "int", "agi", "luk", "hp", "dame", "heal", "shield", "burn", "poison", `return \`${rawDesc}\`;`);
                
                internalInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countInternalInfo})</span> ${dynamicDescription(item,str,def,int,agi,luk,hp,dame,heal,shield,burn,poison)}</span>`;
                countInternalInfo += 1;
            }
        });
    }

    //Chí mạng info
    let critInfo = ""
    if (crit > 0) {
        critInfo = `[Tỷ lệ chí mạng: <span style="color: red; font-weight: bold">${crit}%</span>]`;
    }
    // Gán nội dung vào phần tử HTML
    //Tính nộ
    function getScaledRage(stat, multiplier) {
        return multiplier * Math.sqrt(stat || 0);
    }

    function getInvertedRage(stat, multiplier) {
        // Nếu stat thấp → giá trị cao
        const maxStat = 1000; // giới hạn max giả định (có thể điều chỉnh)
        const safeStat = Math.min(stat || 0, maxStat);
        return multiplier * Math.sqrt(maxStat - safeStat);
    }
    
    let rageGain = Math.floor(
        getScaledRage(str, 0.1) +
        getScaledRage(def, 0.3) +
        getScaledRage(int, 0.1) +
        getInvertedRage(agi, 0.2) + // dùng hệ số mới và công thức ngược
        getScaledRage(luk, 0.1) +
        getScaledRage(hp, 0.3)
    );
    rageGain = parseFloat(rageGain.toFixed(2));
    
    if (descInfo !== "") {
        descTextItem +=
            `<span style="font-weight: bold; margin-top: 5px;">[Kỹ năng chủ động][+Nộ: ${rageGain}][Liên kích: x${Math.max(item.COOLDOWN[1] + item.COOLDOWN[2] + item.COOLDOWN[3], 1)}]</span>
        <span style="display: flex;flex-direction: column; gap: 3px;">${descInfo.trim()}</span>
        <span>${critInfo.trim()}</span>`;
    } else {
        descTextItem += "";
    }

    if (internalInfo !== "") {
        descTextItem +=
            `<span style="font-weight: bold; margin-top: 5px;">[Kỹ năng bị động]</span>
            <span style="display: flex;flex-direction: column; gap: 3px;">${internalInfo.trim()}</span>`
    } else {
        descTextItem += "";
    }

    //Sellup info
    let sellUpInfo = "";
    let countSellUpInfo = 1;
    if (item.SELLUP.length === 1) {
        item.SELLUP.forEach((sellup) => {
            if (effectsSellUp[sellup]) {
                let rawDesc = effectsSellUp[sellup].descriptionSellUp;

                // Thay thế skill.POWER.X thành viết thường tương ứng
                rawDesc = rawDesc
                    .replace(/skill\.POWER\.STR/g, 'str')
                    .replace(/skill\.POWER\.DEF/g, 'def')
                    .replace(/skill\.POWER\.INT/g, 'int')
                    .replace(/skill\.POWER\.AGI/g, 'agi')
                    .replace(/skill\.POWER\.LUK/g, 'luk')
                    .replace(/skill\.POWER\.HP/g,  'hp')
                    .replace(/skill\.DAME\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'dame')
                    .replace(/skill\.HEAL\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'heal')
                    .replace(/skill\.SHIELD\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'shield')
                    .replace(/skill\.BURN\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'burn')
                    .replace(/skill\.POISON\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'poison');
                
                // Tạo hàm từ chuỗi đã xử lý
                const dynamicDescription = new Function("skill", "str", "def", "int", "agi", "luk", "hp", "dame", "heal", "shield", "burn", "poison", `return \`${rawDesc}\`;`);

                sellUpInfo += dynamicDescription(item,str,def,int,agi,luk,hp,dame,heal,shield,burn,poison);
            }
        });
    } else {
        item.SELLUP.forEach((sellup) => {
            if (effectsSellUp[sellup]) {
                let rawDesc = effectsSellUp[sellup].descriptionSellUp;

                // Thay thế skill.POWER.X thành viết thường tương ứng
                rawDesc = rawDesc
                    .replace(/skill\.POWER\.STR/g, 'str')
                    .replace(/skill\.POWER\.DEF/g, 'def')
                    .replace(/skill\.POWER\.INT/g, 'int')
                    .replace(/skill\.POWER\.AGI/g, 'agi')
                    .replace(/skill\.POWER\.LUK/g, 'luk')
                    .replace(/skill\.POWER\.HP/g,  'hp')
                    .replace(/skill\.DAME\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'dame')
                    .replace(/skill\.HEAL\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'heal')
                    .replace(/skill\.SHIELD\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'shield')
                    .replace(/skill\.BURN\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'burn')
                    .replace(/skill\.POISON\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'poison');
                
                // Tạo hàm từ chuỗi đã xử lý
                const dynamicDescription = new Function("skill", "str", "def", "int", "agi", "luk", "hp", "dame", "heal", "shield", "burn", "poison", `return \`${rawDesc}\`;`);
                
                sellUpInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countSellUpInfo})</span> ${dynamicDescription(item,str,def,int,agi,luk,hp,dame,heal,shield,burn,poison)}</span>`;
                countSellUpInfo += 1;
            }
        });
    }

    if (sellUpInfo !== "") {
        descTextItem += `<span style="font-weight: bold; margin-top: 5px;">[Thả đi nhận được]</span>
        <span style="display: flex;flex-direction: column; gap: 3px;">${sellUpInfo.trim()}</span>`;
    } else {
        descTextItem += "";
    }

    document.getElementById("descPopupSTT5Mon").innerHTML = descTextItem;
    document.getElementById("IDcreate5MonPopupSTT5Mon").innerText = `${item.IDcreate}`;

    if (prefix === "bag") {
        document.getElementById("buttonPopupSTT5Mon").innerText = "Tháo ra"
        document.getElementById("buttonPopupSTT5Mon").onclick = () => {
            for (const key in typeGameConquest.battleUserPet) {
                if (typeGameConquest.battleUserPet[key].IDcreate === item.IDcreate) {
                    delete typeGameConquest.battleUserPet[key];  // Xoá pet ra khỏi object
                    loadItemBagRight(sortBagRight)
                    popup.style.display = "none";
                    overlay.style.display = "none";
                    break;
                }
            }
        };
    } else {
        document.getElementById("buttonPopupSTT5Mon").innerText = "Thả đi"
        document.getElementById("buttonPopupSTT5Mon").onclick = () => {
            for (const key in userPet) {
                const hasEquipped = Object.values(typeGameConquest.battleUserPet).some(pet => pet.IDcreate === item.IDcreate);

                if (hasEquipped) {
                    messageOpen("5mon đang được sử dụng nên không thể thả");
                    return;
                }

                if (userPet[key].IDcreate === item.IDcreate && !hasEquipped) {
                    messageOpen("Đã thả 5mon");
                    delete userPet[key];  // Xoá pet ra khỏi object
                    loadItemBagLeft(sortBagLeft)
                    popup.style.display = "none";
                    overlay.style.display = "none";
                    break;
                }
            }

            if (prefix === "skillGacha") {
                // Làm trống randomPet
                for (const key in randomPet) {
                    if (randomPet[key].IDcreate === item.IDcreate) {
                        randomPet[key] = defaultSTT5Mon;
                    }
                }

                for (let i = 0; i < 5; i++) {
                    if (randomPet[`skill${i + 1}S`].ID === "") {
                        document.getElementById(`skill${i + 1}S`).innerHTML = "?";
                        document.getElementById(`skill${i + 1}S`).classList.remove("comp");
                        document.getElementById(`skill${i + 1}S`).style.overflow = "hidden";
                    }
                }
            }
        };
    }

    popup.style.display = "block";
    overlay.style.display = "block";

    // Đóng popup khi bấm nút đóng hoặc click vào nền mờ
    [overlay].forEach(element => {
        element.addEventListener("click", (event) => {
            if (popup.style.display === "block") {
                popup.style.display = "none";
                overlay.style.display = "none";
            }
        });
    });
}

function showUpWeightBag() {

    // Xóa nếu đã tồn tại popup cũ
    const oldPopup = document.getElementById('popupOverlayWeightBag');
    if (oldPopup) {
        oldPopup.remove();
        oldPopup = null;
    }


    // Tạo lớp nền mờ
    const overlay = document.createElement('div');
    overlay.id = 'popupOverlayWeightBag';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 9999;
    overlay.style.animation = 'fadeIn 0.3s ease';

    // Tạo hộp popup
    const popup = document.createElement('div');
    popup.style.backgroundColor = '#fff';
    popup.style.padding = '25px 30px';
    popup.style.borderRadius = '12px';
    popup.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
    popup.style.textAlign = 'center';
    popup.style.maxWidth = '300px';
    popup.style.fontFamily = 'sans-serif';
    popup.style.animation = 'slideUp 0.3s ease';

    popup.innerHTML = `
        <p style="font-size: 16px; margin-bottom: 20px;">Dùng <strong>100 kim cương</strong> để tăng <strong>10 ô chứa</strong>?</p>
        <div style="display: flex; justify-content: center; gap: 10px;">
            <button id="confirmUpWeight" style="
                padding: 8px 16px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                transition: background-color 0.2s;
            ">Đồng ý</button>
            <button id="cancelUpWeight" style="
                padding: 8px 16px;
                background-color: #f44336;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                transition: background-color 0.2s;
            ">Hủy</button>
        </div>
    `;

    // Gắn popup vào overlay
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Hiệu ứng CSS
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        #confirmUpWeight:hover {
            background-color: #45a049;
        }
        #cancelUpWeight:hover {
            background-color: #e53935;
        }
    `;
    document.head.appendChild(style);

    // Xử lý sự kiện nút
    document.getElementById('confirmUpWeight').onclick = function () {
        upWeightBag();
        document.body.removeChild(overlay);
    };
    document.getElementById('cancelUpWeight').onclick = function () {
        document.body.removeChild(overlay);
    };
}

function upWeightBag() {
    if (diamondUser < 100) {
        messageOpen('Không đủ kim cương')
        return;
    } else {
        weightBagUser += 10
        document.getElementById("weightBagLeftText").innerText = `${Object.values(userPet).length}/${weightBagUser}`
        document.getElementById("weightBagLeft").style.width = `${Math.min(Object.values(userPet).length / weightBagUser * 100, 100)}%`
        resetGoldAndTicket();
    }
}



function resetOutGame() {
    //Hp của người chơi (nếu round = 1 thì auto Hp = 300; còn round > 1 thì Hp được lấy từ googleSheet)
    maxHpUp = 0;

    resetMaxHpBattle();
    idSkillRND = 0; //ID random tạo id cho div skill

    //Chỉ số trong game
    //Điểm nhận được qua mỗi round
    infoStartGame.winStreak = 0;
    typeGameConquest.winBattle = 0;
    typeGameConquest.loseBattle = 0;
    modeGamePoint = 0;
    infoStartGame.typeGame = "No";
    infoStartGame.modeGame = "No";
    infoStartGame.difficultyGame = "No";

    onGame = 0;
    infoStartGame.stepGame = 0;
    endGame = true;
    infoStartGame.roundGame = 1;
    typeGameConquest.selectSkillShop = 0;

    typeGameConquest.reRoll = 0;
    typeGameConquest.reRollPrice = 0;
    typeGameConquest.starUser = 0;

    //Thông tin của người chơi
    nowHpBattleMy = 0;
    nowShieldBattleMy = 0;
    nowBurnBattleMy = 0;
    nowPoisonBattleMy = 0;

    //Thông tin chỉ số 
    typeGameConquest.maxHpBattleComp = 0;
    nowHpBattleComp = 0;
    nowShieldBattleComp = 0;
    nowBurnBattleComp = 0;
    nowPoisonBattleComp = 0;

    skillsSleepA = { skill1A: 0, skill2A: 0, skill3A: 0, skill4A: 0, skill5A: 0, skill6A: 0, skill7A: 0, skill8A: 0, skill9A: 0 };
    skillsSleepB = { skill1B: 0, skill2B: 0, skill3B: 0, skill4B: 0, skill5B: 0, skill6B: 0, skill7B: 0, skill8B: 0, skill9B: 0 };
    skillsDeleteA = { skill1A: 0, skill2A: 0, skill3A: 0, skill4A: 0, skill5A: 0, skill6A: 0, skill7A: 0, skill8A: 0, skill9A: 0 };
    skillsDeleteB = { skill1B: 0, skill2B: 0, skill3B: 0, skill4B: 0, skill5B: 0, skill6B: 0, skill7B: 0, skill8B: 0, skill9B: 0 };
    // limitSkillsA = {skill1A: 0,skill2A: 0,skill3A: 0,skill4A: 0,skill5A: 0,skill6A: 0,skill7A: 0,skill8A: 0,skill9A: 0};
    // limitSkillsB = {skill1B: 0,skill2B: 0,skill3B: 0,skill4B: 0,skill5B: 0,skill6B: 0,skill7B: 0,skill8B: 0,skill9B: 0};
    skillsSpeedA = { skill1A: 0, skill2A: 0, skill3A: 0, skill4A: 0, skill5A: 0, skill6A: 0, skill7A: 0, skill8A: 0, skill9A: 0 };
    skillsSpeedB = { skill1B: 0, skill2B: 0, skill3B: 0, skill4B: 0, skill5B: 0, skill6B: 0, skill7B: 0, skill8B: 0, skill9B: 0 };

    skillQueueMirror = {};
    skillQueue = {};
    countSkillQueue = 0;
    countSkillQueueMirror = 0;

    Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
        const skillElement = document.getElementById(skill);
        if (skillElement) {
            const skillChild = skillElement.querySelector('.skill');
            if (skillChild && skillChild.classList.contains('sleep')) {
                skillChild.classList.remove('sleep');
            }
        }
    });

    Object.keys(typeGameConquest.skillBattle).forEach((skill) => {
        const skillElement = document.getElementById(skill);
        if (skillElement) {
            const skillChild = skillElement.querySelector('.skill');
            if (skillChild && skillChild.classList.contains('delete')) {
                skillChild.classList.remove('delete');
            }
        }
    });

    typeGameConquest.slowB = 0;
    typeGameConquest.dameCritB = 0;
    typeGameConquest.upCooldownB = 0;
    typeGameConquest.slowA = 0;
    typeGameConquest.dameCritA = 0;
    typeGameConquest.upCooldownA = 0;
    typeGameConquest.skillBattle = { //Khay Pet sử dụng
        skill1A: defaultSTT5MonInBattle,
        skill2A: defaultSTT5MonInBattle,
        skill3A: defaultSTT5MonInBattle,
        skill4A: defaultSTT5MonInBattle,
        skill5A: defaultSTT5MonInBattle,
        skill6A: defaultSTT5MonInBattle,
        skill7A: defaultSTT5MonInBattle,
        skill8A: defaultSTT5MonInBattle,
        skill9A: defaultSTT5MonInBattle,
        skill1B: defaultSTT5MonInBattle,
        skill2B: defaultSTT5MonInBattle,
        skill3B: defaultSTT5MonInBattle,
        skill4B: defaultSTT5MonInBattle,
        skill5B: defaultSTT5MonInBattle,
        skill6B: defaultSTT5MonInBattle,
        skill7B: defaultSTT5MonInBattle,
        skill8B: defaultSTT5MonInBattle,
        skill9B: defaultSTT5MonInBattle,
    };

    typeGameConquest.battlePetUseSlotRound = { //pet đang dùng tại slotskill
        skill1B: defaultSTT5MonInBattle,
        skill2B: defaultSTT5MonInBattle,
        skill3B: defaultSTT5MonInBattle,
        skill4B: defaultSTT5MonInBattle,
        skill5B: defaultSTT5MonInBattle,
        skill6B: defaultSTT5MonInBattle,
        skill7B: defaultSTT5MonInBattle,
        skill8B: defaultSTT5MonInBattle,
        skill9B: defaultSTT5MonInBattle,
    };

    typeGameConquest.battlePetInInventory = {
        battleInv1: defaultSTT5MonInBattle,
        battleInv2: defaultSTT5MonInBattle,
        battleInv3: defaultSTT5MonInBattle,
        battleInv4: defaultSTT5MonInBattle,
        battleInv5: defaultSTT5MonInBattle,
        battleInv6: defaultSTT5MonInBattle,
        battleInv7: defaultSTT5MonInBattle,
        battleInv8: defaultSTT5MonInBattle,
        battleInv9: defaultSTT5MonInBattle,
    }; //pet có trong slot tủ đồ

    typeGameConquest.battlePetInShop = {
        battleShop1: defaultSTT5MonInBattle,
        battleShop2: defaultSTT5MonInBattle,
        battleShop3: defaultSTT5MonInBattle,
        battleShop4: defaultSTT5MonInBattle,
        battleShop5: defaultSTT5MonInBattle,
    };
}

function setupPopupInfo5MonInBattle(skillInfo, level) {

    for (let k = 1; k <= 4; k++) {
        document.getElementById(`popupSTT5MonInBattleLV${k}`).style.background = "firebrick";
    }

    document.getElementById(`popupSTT5MonInBattleLV${skillInfo.LEVEL}`).style.background = "rebeccapurple";

    let URLimg = skillInfo.URLimg[`Lv${skillInfo.LEVEL}`] || skillInfo.URLimg['Lv1'];
    
    let colorLevel = "#531515";
    if (level === 2) {
        colorLevel = "#8c0b0b"
    } else if (level === 3) {
        colorLevel = "#c00d0d"
    } else if (level === 4) {
        colorLevel = "red"
    } else {
        colorLevel = "#531515"
    }

        //Xét level hiện tại so với level
    let levelSum = level - skillInfo.LEVEL
    console.log("levelSum", levelSum)
    const powerStatsSTR = updateStatWhenLevelUp(skillInfo, levelSum, 'str', true)
    const powerStatsDEF = updateStatWhenLevelUp(skillInfo, levelSum, 'def', true)
    const powerStatsINT = updateStatWhenLevelUp(skillInfo, levelSum, 'int', true)
    const powerStatsAGI = updateStatWhenLevelUp(skillInfo, levelSum, 'agi', true)
    const powerStatsLUK = updateStatWhenLevelUp(skillInfo, levelSum, 'luk', true)
    const powerStatsHP = updateStatWhenLevelUp(skillInfo, levelSum, 'hp', true)

    let str, def, int, agi, luk, hp, allStat;
    str = Math.round(skillInfo.POWER.STR + powerStatsSTR)
    def = Math.round(skillInfo.POWER.DEF + powerStatsDEF)
    int = Math.round(skillInfo.POWER.INT + powerStatsINT)
    agi = Math.round(skillInfo.POWER.AGI + powerStatsAGI)
    luk = Math.round(skillInfo.POWER.LUK + powerStatsLUK)
    hp = Math.round(skillInfo.POWER.HP + powerStatsHP)

    allStat = str + def + int + agi + luk + hp
    
    let powerINT = scalePower5Mon(int);

    let dame = 0, heal = 0, shield = 0, burn = 0, poison = 0;

    // Áp dụng scaleSTR vào các phép tính hiệu ứng
    if (skillInfo.EFFECT.includes("Attacking")) {
        dame = Math.round(powerINT.dame * skillInfo.POWER.SCALE) + skillInfo.DAME[1] + skillInfo.DAME[2] + skillInfo.DAME[3] + skillInfo.DAME[4];  // Giảm dần khi STR tăng
    }
    if (skillInfo.EFFECT.includes("Healing")) {
        heal = Math.round(powerINT.heal * skillInfo.POWER.SCALE) + skillInfo.HEAL[1] + skillInfo.HEAL[2] + skillInfo.HEAL[3] + skillInfo.HEAL[4];  // Giảm dần khi STR tăng
    }
    if (skillInfo.EFFECT.includes("Shield")) {
        shield = Math.round(powerINT.shield * skillInfo.POWER.SCALE) + skillInfo.SHIELD[1] + skillInfo.SHIELD[2] + skillInfo.SHIELD[3] + skillInfo.SHIELD[4];  // Giảm dần khi STR tăng
    }
    if (skillInfo.EFFECT.includes("Burn")) {
        burn = Math.round(powerINT.burn * skillInfo.POWER.SCALE) + skillInfo.BURN[1] + skillInfo.BURN[2] + skillInfo.BURN[3] + skillInfo.BURN[4];  // Giảm dần khi STR tăng
    }
    if (skillInfo.EFFECT.includes("Poison")) {
        poison = Math.round(powerINT.poison * skillInfo.POWER.SCALE) + skillInfo.POISON[1] + skillInfo.POISON[2] + skillInfo.POISON[3] + skillInfo.POISON[4];  // Giảm dần khi STR tăng
    }

    //Tính cooldown
    let minC = 8;
    let maxC = 20;
    let scaleC = Math.max(5, 170 - Math.floor((agi - 200) / 9)); // giảm dần, min là 5
    let valueC = ((maxC - minC) / (1 + agi / scaleC) * 1000) * (2 - skillInfo.POWER.SCALE);

    //tính crit
    let maxCrit = 60;
    let scaleCrit = 1500; // tùy chỉnh
    let valueCrit = maxCrit * luk / (luk + scaleCrit);
    valueCrit = Math.min(maxCrit, Math.max(0, valueCrit));
    valueCrit = Math.round(valueCrit * skillInfo.POWER.SCALE);

    //tính def
    let maxDef = 90;
    let scaleDef = 475; // tùy chỉnh
    let valueDef = maxDef * def / (def + scaleDef);
    valueDef = Math.min(maxDef, Math.max(0, valueDef));
    valueDef = Math.round(valueDef * skillInfo.POWER.SCALE);

    let crit = Math.round(valueCrit + skillInfo.CRIT[1] + skillInfo.CRIT[2] + skillInfo.CRIT[3]);
    let defFn = Math.round(valueDef * 100) / 100;
    let cooldown = Math.ceil(valueC);

    document.getElementById("imgPopupSTT5MonInBattle").style.backgroundImage = "url('" + URLimg + "')";
    document.getElementById("namePopupSTT5MonInBattle").textContent = skillInfo.NAME;
    document.getElementById("allStats5MonInBattle").textContent = `⚔️: ${allStat}`;
    document.getElementById("levelTextPopupSTT5MonInBattle").textContent = level;
    document.getElementById("rareTextPopupSTT5MonInBattle").textContent = skillInfo.RARE;
    document.getElementById("priceTextPopupSTT5MonInBattle").textContent = skillInfo.PRICESELL + skillInfo.PRICE || skillInfo.PRICE;
    document.getElementById("levelColorPopupSTT5MonInBattle").style.color = colorLevel


    let descTextItem = "";
    // Type
    let typeInfo = "";
    skillInfo.TYPE.forEach(type => {
        typeInfo += `<a style=" background: rebeccapurple; padding: 2px 4px; border-radius: 4px; color: #ffffff;">${type}</a>`
    });

    // Cập nhật thông tin trong popup
    descTextItem += `
    <div style="display: flex; justify-content: space-between; flex-direction: row; align-items: center; width: 100%">
        <div style="display: flex; justify-content: space-between; flex-direction: row; align-items: center; gap: 3px; width: 100%">
            <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-hand-fist"></i>: ${str}</span>
            <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-shield"></i>: ${def}</span>
            <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-brain"></i>: ${int}</span>
            <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-bolt"></i>: ${agi}</span>
            <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-clover"></i>: ${luk}</span>
            <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-heart"></i>: ${hp}</span>
        </div>
    </div>`

    const scaleSTR = 1 * Math.log10(str);
    let valuePowerSTR = 0.12 * str / scaleSTR + 1
    let baseDame = Math.round(valuePowerSTR * skillInfo.POWER.SCALE);

    const scaleHP = 1 * Math.log10(hp);
    let valuePowerHP = 2 * hp / scaleHP + 100;
    let baseHP = Math.round(valuePowerHP * skillInfo.POWER.SCALE);

    descTextItem += `
    <span style="display: flex;font-weight: bold;font-size: 12px;padding: 2px 0px;color: black;gap: 5px;flex-direction: row;align-content: center;
    justify-content: space-between;align-items: center; width: 100%;">
    <span>
        [Máu: <a style="color:red; font-weight: bold;">${baseHP}</a>]
    </span>
    <span style="display: flex; gap: 5px;"> 
        <span style="display: flex; gap: 3px; flex-direction: row; align-content: center; justify-content: center; align-items: center;">
            ${typeInfo}
        </span>
    </span>
    </span>
    <span style="font-weight: bold;margin-top: 5px;">[Đánh thường][Tốc độ: ${cooldown  / 1000 || ''} giây][Liên kích: x${Math.max(skillInfo.COOLDOWN[1] + skillInfo.COOLDOWN[2] + skillInfo.COOLDOWN[3], 1)}]</span>
    <span>Gây <a style="color: red; font-weight: bold">${baseDame} sát thương </a> cho 5Mon đối thủ (ưu tiên 5Mon đối diện)</span>
    `

    let descInfo = "";
    let countDescInfo = 1;
    if (skillInfo.EFFECT.length === 1) {
        skillInfo.EFFECT.forEach((effect) => {
            if (effectsSkill[effect]) {
                // Lấy chuỗi mô tả ban đầu
                let rawDesc = effectsSkill[effect].descriptionSkill;

                // Thay thế skill.POWER.X thành viết thường tương ứng
                rawDesc = rawDesc
                    .replace(/skill\.POWER\.STR/g, 'str')
                    .replace(/skill\.POWER\.DEF/g, 'def')
                    .replace(/skill\.POWER\.INT/g, 'int')
                    .replace(/skill\.POWER\.AGI/g, 'agi')
                    .replace(/skill\.POWER\.LUK/g, 'luk')
                    .replace(/skill\.POWER\.HP/g,  'hp')
                    .replace(/skill\.DAME\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'dame')
                    .replace(/skill\.HEAL\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'heal')
                    .replace(/skill\.SHIELD\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'shield')
                    .replace(/skill\.BURN\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'burn')
                    .replace(/skill\.POISON\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'poison');
                
                // Tạo hàm từ chuỗi đã xử lý
                const dynamicDescription = new Function("skill", "str", "def", "int", "agi", "luk", "hp", "dame", "heal", "shield", "burn", "poison", `return \`${rawDesc}\`;`);
        
                descInfo += dynamicDescription(skillInfo,str,def,int,agi,luk,hp,dame,heal,shield,burn,poison);
            }
        });

    } else {
        skillInfo.EFFECT.forEach((effect) => {
            if (effectsSkill[effect]) {
                // Lấy chuỗi mô tả ban đầu
                let rawDesc = effectsSkill[effect].descriptionSkill;
        
                // Thay thế skill.POWER.X thành viết thường tương ứng
                rawDesc = rawDesc
                    .replace(/skill\.POWER\.STR/g, 'str')
                    .replace(/skill\.POWER\.DEF/g, 'def')
                    .replace(/skill\.POWER\.INT/g, 'int')
                    .replace(/skill\.POWER\.AGI/g, 'agi')
                    .replace(/skill\.POWER\.LUK/g, 'luk')
                    .replace(/skill\.POWER\.HP/g,  'hp')
                    .replace(/skill\.DAME\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'dame')
                    .replace(/skill\.HEAL\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'heal')
                    .replace(/skill\.SHIELD\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'shield')
                    .replace(/skill\.BURN\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'burn')
                    .replace(/skill\.POISON\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'poison');
        
                // Tạo hàm từ chuỗi đã xử lý
                const dynamicDescription = new Function("skill", "str", "def", "int", "agi", "luk", "hp", "dame", "heal", "shield", "burn", "poison", `return \`${rawDesc}\`;`);
        
                // Truyền các giá trị vào hàm
                descInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countDescInfo})</span> ${dynamicDescription(skillInfo,str,def,int,agi,luk,hp,dame,heal,shield,burn,poison)}</span>`;
                countDescInfo += 1;
            }
        });
    }


    let internalInfo = "";
    let countInternalInfo = 1;
    if (skillInfo.INTERNAL.length === 1) {
        skillInfo.INTERNAL.forEach((internal) => {
            if (effectsInternal[internal]) {

                let rawDesc = effectsInternal[internal].descriptionInternal;

                // Thay thế skill.POWER.X thành viết thường tương ứng
                rawDesc = rawDesc
                    .replace(/skill\.POWER\.STR/g, 'str')
                    .replace(/skill\.POWER\.DEF/g, 'def')
                    .replace(/skill\.POWER\.INT/g, 'int')
                    .replace(/skill\.POWER\.AGI/g, 'agi')
                    .replace(/skill\.POWER\.LUK/g, 'luk')
                    .replace(/skill\.POWER\.HP/g,  'hp')
                    .replace(/skill\.DAME\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'dame')
                    .replace(/skill\.HEAL\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'heal')
                    .replace(/skill\.SHIELD\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'shield')
                    .replace(/skill\.BURN\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'burn')
                    .replace(/skill\.POISON\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'poison');
                
                // Tạo hàm từ chuỗi đã xử lý
                const dynamicDescription = new Function("skill", "str", "def", "int", "agi", "luk", "hp", "dame", "heal", "shield", "burn", "poison", `return \`${rawDesc}\`;`);
                
                internalInfo += dynamicDescription(skillInfo,str,def,int,agi,luk,hp,dame,heal,shield,burn,poison);
            }
        });
    } else {
        skillInfo.INTERNAL.forEach((internal) => {
            if (effectsInternal[internal]) {
                // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                let rawDesc = effectsInternal[internal].descriptionInternal;

                // Thay thế skill.POWER.X thành viết thường tương ứng
                rawDesc = rawDesc
                    .replace(/skill\.POWER\.STR/g, 'str')
                    .replace(/skill\.POWER\.DEF/g, 'def')
                    .replace(/skill\.POWER\.INT/g, 'int')
                    .replace(/skill\.POWER\.AGI/g, 'agi')
                    .replace(/skill\.POWER\.LUK/g, 'luk')
                    .replace(/skill\.POWER\.HP/g,  'hp')
                    .replace(/skill\.DAME\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'dame')
                    .replace(/skill\.HEAL\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'heal')
                    .replace(/skill\.SHIELD\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'shield')
                    .replace(/skill\.BURN\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'burn')
                    .replace(/skill\.POISON\.reduce\(\(a, b\) => a \+ b, 0\)/g, 'poison');
                
                // Tạo hàm từ chuỗi đã xử lý
                const dynamicDescription = new Function("skill", "str", "def", "int", "agi", "luk", "hp", "dame", "heal", "shield", "burn", "poison", `return \`${rawDesc}\`;`);
                
                internalInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countInternalInfo})</span> ${dynamicDescription(skillInfo,str,def,int,agi,luk,hp,dame,heal,shield,burn,poison)}</span>`;
                countInternalInfo += 1;
            }
        });
    }


    //Chí mạng info
    let critPercent = crit + skillInfo.CRIT[1] + skillInfo.CRIT[2] + skillInfo.CRIT[3] + skillInfo.CRIT[4]
    let critInfo = ""
    if (critPercent > 0) {
        critInfo = `[Tỷ lệ chí mạng: <span style="color: red; font-weight: bold">${critPercent}%</span>]`;
    }

    // Gán nội dung vào phần tử HTML
    function getScaledRage(stat, multiplier) {
        return multiplier * Math.sqrt(stat || 0);
    }

    function getInvertedRage(stat, multiplier) {
        // Nếu stat thấp → giá trị cao
        const maxStat = 1000; // giới hạn max giả định (có thể điều chỉnh)
        const safeStat = Math.min(stat || 0, maxStat);
        return multiplier * Math.sqrt(maxStat - safeStat);
    }
    
    let rageGain = Math.floor(
        getScaledRage(str, 0.1) +
        getScaledRage(def, 0.3) +
        getScaledRage(int, 0.1) +
        getInvertedRage(agi, 0.2) + // dùng hệ số mới và công thức ngược
        getScaledRage(luk, 0.1) +
        getScaledRage(hp, 0.3)
    );
    rageGain = parseFloat(rageGain.toFixed(2));


    if (descInfo !== "") {
        descTextItem +=
            `<span style="font-weight: bold; margin-top: 5px;">[Kỹ năng chủ động][+Nộ: ${rageGain}][Liên kích: x${Math.max(skillInfo.COOLDOWN[1] + skillInfo.COOLDOWN[2] + skillInfo.COOLDOWN[3], 1)}]</span>
<span style="display: flex;flex-direction: column; gap: 3px;">${descInfo.trim()}</span>
<span>${critInfo.trim()}</span>`;
    } else {
        descTextItem += "";
    }

    if (internalInfo !== "") {
        descTextItem +=
            `<span style="font-weight: bold; margin-top: 5px;">[Kỹ năng bị động]</span>
<span style="display: flex;flex-direction: column; gap: 3px;">${internalInfo.trim()}</span>`
    } else {
        descTextItem += "";
    }

    //Sellup info
    let sellUpInfo = "";
    let countSellUpInfo = 1;
    if (skillInfo.SELLUP.length === 1) {
        skillInfo.SELLUP.forEach((sellup) => {
            if (effectsSellUp[sellup]) {
                // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                const dynamicDescription = new Function("skill", `return \`${effectsSellUp[sellup].descriptionSellUp}\`;`);
                sellUpInfo += dynamicDescription(skillInfo)
            }
        });
    } else {
        skillInfo.SELLUP.forEach((sellup) => {
            if (effectsSellUp[sellup]) {
                // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                const dynamicDescription = new Function("skill", `return \`${effectsSellUp[sellup].descriptionSellUp}\`;`);
                sellUpInfo +=
                    `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countSellUpInfo})</span>
  ${dynamicDescription(skillInfo)}</span>`;
                countSellUpInfo += 1;
            }
        });
    }

    if (sellUpInfo !== "") {
        descTextItem += `<span style="font-weight: bold; margin-top: 5px;">[Thả đi nhận được]</span>
<span style="display: flex;flex-direction: column; gap: 3px;">${sellUpInfo.trim()}</span>`;
    } else {
        descTextItem += "";
    }

    document.getElementById("descPopupSTT5MonInBattle").innerHTML = descTextItem;
}


//Check người dùng offline
window.addEventListener("beforeunload", function (event) {
    if (isFinalLoadData && !isOut) {
        saveDataUserToFirebase("Out");
    }
});

//Nút setting main
function openPopupSettingMain() {
    const popup = document.getElementById('popupSettingMain');
    if (popup.style.display === "flex") {
        popup.style.display = "none";
    } else {
        popup.style.display = "flex";
        selectButtonSettingMain('Âm thanh');
    }
}

function selectButtonSettingMain(select) {
    const allSelect = {
        buttonSettingMainMusic: document.getElementById('buttonSettingMainMusic'),
    };

    // Reset màu tất cả các nút
    Object.values(allSelect).forEach(button => {
        button.style.background = "rgb(248, 150, 116)";
    });

    // Hiện phần điều chỉnh âm thanh
    document.getElementById('musicControlsBoardBG').style.display = "flex";

    if (select === "Âm thanh") {
        document.getElementById('musicControlsBoardBG').style.display = "flex";
        document.getElementById('buttonSettingMainMusic').style.background = "rgb(235, 32, 32)";
    }
}


//Nút setting trong battle 
function openPopupSetting() {
    const popup = document.getElementById('popupSetting');
    const desc = document.getElementById('descPopupSetting');
    popup.style.display = "flex"

    let descOutGameRound1 = ""
    if (infoStartGame.roundGame <= 1 && infoStartGame.typeGame === "Conquest" && infoStartGame.modeGame === "Rank") {
        descOutGameRound1 = "Nếu đầu hàng ngay tại vòng 1, bạn sẽ bị trừ 10 điểm xếp hạng"
    } else {
        descOutGameRound1 = ""
    }

    //Cập nhật thông tin trận đấu
    desc.innerHTML = `
<span style="display: flex; flex-direction: row;"><a style="font-weight: bold">Vòng đấu hiện tại:</a> <a style="color: rebeccapurple;"> Vòng ${infoStartGame.roundGame} (Thắng: ${typeGameConquest.winBattle} - Thua: ${typeGameConquest.loseBattle})</a></span>
<a>Hiện tại đã thắng ${infoStartGame.winStreak} vòng đấu liên tiếp</a>
<a style="font-weight: bold">Phần thưởng hiện tại có:</a>
<span style="display: flex; flex-direction: row; justify-content: center; gap: 5px; font-weight: bold; color:rebeccapurple;">
<span> <i class="fa-solid fa-medal"></i>: <a>${typeGameConquest.pointBattle}</a> </span>
<span> <i class="fa-solid fa-gem"></i>: <a>0</a> </span>
<span> <i class="fa-solid fa-coins"></i>: <a>0</a> </span>
</span>
<a style="font-weight: bold; color:red; text-align: center;">${descOutGameRound1}</a>
`;

}

//Đóng setting battle
function closePopupSetting() {
    const popup = document.getElementById('popupSetting');
    popup.style.display = "none"
}

//Bảng xếp hạng
function openRankBoard() {
    const rankGameRef = ref(db, 'rankGame');
    get(rankGameRef)
        .then(snapshot => {
            if (snapshot.exists()) {
                const rankGameData = snapshot.val();
                console.log("Dữ liệu rankGame:", rankGameData);

                // TODO: xử lý rankGameData, ví dụ cập nhật UI bảng xếp hạng

            } else {
                console.log("Chưa có dữ liệu rankGame trong Firebase.");
                // TODO: xử lý khi rankGame chưa có, ví dụ hiển thị bảng rỗng hoặc mặc định
            }

            // Sau khi đã đọc hoặc xử lý dữ liệu, chuyển trang và hiện bảng
            changePage(0);
            showOrHiddenDiv("rankBoard");
        })
        .catch(error => {
            console.error("Lỗi khi đọc rankGame từ Firebase:", error);
            // Vẫn mở bảng nhưng có thể hiển thị thông báo lỗi
            changePage(0);
            showOrHiddenDiv("rankBoard");
        });
}

let currentPageRank = 1;
const usersPerPage = 7; // Số người chơi hiển thị mỗi trang

function rankBoard() {
    const leaderboardBody = document.getElementById("leaderboard-body");
    leaderboardBody.innerHTML = "";

    const sortedUsers = Object.entries(rankGame).sort(([, a], [, b]) => b.rankPoint.typeGameConquest - a.rankPoint.typeGameConquest);
    const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

    const start = (currentPageRank - 1) * usersPerPage;
    const end = start + usersPerPage;
    const usersOnPage = sortedUsers.slice(start, end);

    for (let i = 0; i < usersPerPage; i++) {
        const [username, data] = usersOnPage[i] || [];

        let topCheck = "";
        let colorTop = "";

        if (start + i + 1 === 1) {
            topCheck = `<i class="fa-solid fa-crown"></i>`;
            colorTop = `rgb(145 46 99)`;
        } else if (start + i + 1 === 2) {
            topCheck = `<i class="fa-solid fa-chess-queen"></i>`;
            colorTop = `rgb(145 46 99)`;
        } else if (start + i + 1 === 3) {
            topCheck = `<i class="fa-solid fa-chess-knight"></i>`;
            colorTop = `rgb(145 46 99)`;
        } else {
            topCheck = "";
            colorTop = `rgb(46 128 145)`;
        }

        const row = document.createElement("tr");
        row.style = `
          height: 30px; 
          background: ${colorTop}; 
          clip-path: polygon(2% 0%, 98% 0%, 100% 50%, 98% 110%, 2% 110%, 0% 50%);
          box-shadow: rgb(0 0 0 / 30%) 0px 3px 2px 0px;
        `;

        row.innerHTML = `
          <td style="width: 10%; text-align: right;">${topCheck}</td>
          <td style="width: 15%; text-align: center;">${start + i + 1}</td>
          <td style="width: 40%; text-align: center; font-weight: bold;">${username || ""}</td>
          <td style="width: 25%; text-align: center;">${data?.rankPoint?.typeGameConquest ?? "-"}</td>
          <td style="width: 10%; text-align: center;"></td>
        `;

        leaderboardBody.appendChild(row);
    }

    // Lấy thứ hạng người chơi hiện tại
    const myIndex = sortedUsers.findIndex(([user]) => user === username);
    const myTop = myIndex !== -1 ? myIndex + 1 : "-";
    const myData = myIndex !== -1 ? sortedUsers[myIndex][1] : null;

    document.getElementById("myRankTop").innerHTML = myTop;
    document.getElementById("myRankName").innerHTML = username;
    document.getElementById("myRankPoint").innerHTML = myData ? myData.rankPoint.typeGameConquest : "-";

    document.getElementById("prev-page").disabled = currentPageRank === 1;
    document.getElementById("next-page").disabled = currentPageRank === totalPages;
}


// Chuyển trang
function changePage(direction) {
    const sortedUsers = Object.entries(rankGame).sort(([, a], [, b]) => b.rankPoint.typeGameConquest - a.rankPoint.typeGameConquest);
    const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

    currentPageRank += direction;
    if (currentPageRank < 1) currentPageRank = 1;
    if (currentPageRank > totalPages) currentPageRank = totalPages;

    rankBoard();
}

//Shop
function switchTabShop(tab) {
    const tabs = ['shop', 'gacha', 'exchange'];
    tabs.forEach(t => {
        document.getElementById(t).style.display = t === tab ? 'flex' : 'none';
    });

    document.getElementById('tabShop').style.background = tab === 'shop' ? 'rgb(134 154 74)' : 'rgb(201 138 77)';
    document.getElementById('tabGacha').style.background = tab === 'gacha' ? 'rgb(134 154 74)' : 'rgb(201 138 77)';
    document.getElementById('tabExchange').style.background = tab === 'exchange' ? 'rgb(134 154 74)' : 'rgb(201 138 77)';

    if (document.getElementById('gacha').style.display === "flex") {
        for (let i = 1; i <= 5; i++) {
            document.getElementById(`skill${i}S`).innerHTML = "?";
            document.getElementById(`skill${i}S`).style.overflow = "hidden";
            document.getElementById(`skill${i}S`).classList.remove("user");
        }
    }

    if (document.getElementById('shop').style.display === "flex") {
        openShopPage();
    }

    if (document.getElementById('exchange').style.display === "flex") {
        openExchangePage();
    }
}

//Shop page
const itemShop1 = [
    { idItem: "I0001", nameItem: "Gói 10 vàng", effectItem: "addGold10", priceItem: 10, URLitem: "https://res.cloudinary.com/dxgawkr4g/image/upload/v1730731024/0005.png", desc: "Bạn sẽ nhận được 10 vàng" },
    {
        idItem: "I0002", nameItem: "Gói 100 vàng", effectItem: "addGold100", priceItem: 95, URLitem:
            "https://res.cloudinary.com/dxgawkr4g/image/upload/v1730731024/0005.png", desc: "Bạn sẽ nhận được 100 vàng"
    },
    {
        idItem: "I0003", nameItem: "Gói 200 vàng", effectItem: "addGold200", priceItem: 170, URLitem:
            "https://res.cloudinary.com/dxgawkr4g/image/upload/v1730731024/0005.png", desc: "Bạn sẽ nhận được 200 vàng"
    },
    {
        idItem: "I0004", nameItem: "Gói 500 vàng", effectItem: "addGold500", priceItem: 325, URLitem:
            "https://res.cloudinary.com/dxgawkr4g/image/upload/v1730731024/0005.png", desc: "Bạn sẽ nhận được 500 vàng"
    },
    {
        idItem: "I0005", nameItem: "Gói 1000 vàng", effectItem: "addGold1000", priceItem: 450, URLitem:
            "https://res.cloudinary.com/dxgawkr4g/image/upload/v1730731024/0005.png", desc: "Bạn sẽ nhận được 1000 vàng"
    },
    { idItem: "I0001", nameItem: "Gói 10 vàng", effectItem: "addGold10", priceItem: 10, URLitem: "https://res.cloudinary.com/dxgawkr4g/image/upload/v1730731024/0005.png", desc: "Bạn sẽ nhận được 10 vàng" },
    {
        idItem: "I0002", nameItem: "Gói 100 vàng", effectItem: "addGold100", priceItem: 95, URLitem:
            "https://res.cloudinary.com/dxgawkr4g/image/upload/v1730731024/0005.png", desc: "Bạn sẽ nhận được 100 vàng"
    },
    {
        idItem: "I0003", nameItem: "Gói 200 vàng", effectItem: "addGold200", priceItem: 170, URLitem:
            "https://res.cloudinary.com/dxgawkr4g/image/upload/v1730731024/0005.png", desc: "Bạn sẽ nhận được 200 vàng"
    },
    {
        idItem: "I0004", nameItem: "Gói 500 vàng", effectItem: "addGold500", priceItem: 325, URLitem:
            "https://res.cloudinary.com/dxgawkr4g/image/upload/v1730731024/0005.png", desc: "Bạn sẽ nhận được 500 vàng"
    },
    {
        idItem: "I0005", nameItem: "Gói 1000 vàng", effectItem: "addGold1000", priceItem: 450, URLitem:
            "https://res.cloudinary.com/dxgawkr4g/image/upload/v1730731024/0005.png", desc: "Bạn sẽ nhận được 1000 vàng"
    },
];

//Open ShopPage
function openShopPage() {
    addItemForShopPage("shopRow1", itemShop1);
}

function addItemForShopPage(rowId, itemList) {
    const row = document.getElementById(rowId);

    row.innerHTML = ""; // Xóa dữ liệu cũ nếu có

    itemList.forEach(item => {
        // Tạo thẻ chứa item
        const itemDiv = document.createElement("div");
        itemDiv.id = `${item.idItem}`
        itemDiv.style.cssText = `
  min-width: 80px;
  height: 80px;
  padding: 2px;
  background: url('${item.URLitem}');
  border-radius: 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: rgb(106 28 28) 2px 2px 1px 2px;
  justify-content: center;
  border: 4px solid firebrick;
  background-size: cover;
  position: relative;
`;

        // Thêm tên item
        const name = document.createElement("p");
        name.textContent = item.nameItem;
        name.style.cssText = "font-size: 12px; font-weight: bold; margin: 0px; color: white; margin-top: 1px; background:firebrick; border-bottom-right-radius: 6px; border-bottom-left-radius: 6px; width: 90px; pointer-events: none;position: absolute;bottom: -4px; display: flex; align-items: center; justify-content: center;height: 20px;";

        // Gắn tất cả vào itemDiv
        itemDiv.appendChild(name);

        // Thêm vào hàng tương ứng
        row.appendChild(itemDiv);

    });
    //Thêm event click vào các item để hiên popup mua
    setupPopupEvents(itemList);
}

function setupPopupEvents(itemList) {
    const popup = document.getElementById("itemPopupShop");
    const overlay = document.getElementById("popupOverlay");
    const buyButton = document.getElementById("buyItemShop");

    // Thêm sự kiện click cho từng item để mở popup
    itemList.forEach(item => {
        const itemDiv = document.getElementById(item.idItem);
        itemDiv.addEventListener("click", () => {
            document.getElementById("popupImgShop").src = item.URLitem;
            document.getElementById("popupNameShop").textContent = item.nameItem;
            document.getElementById("popupDescShop").textContent = item.desc;
            document.getElementById("popupPriceShop").textContent = `Giá: ${item.priceItem} kim cương`;

            popup.style.display = "block";
            overlay.style.display = "block";
            buyButton.onclick = () => buyItemShop(item.idItem, item.nameItem, item.effectItem, item.priceItem);
        });
    });

    // Đóng popup khi bấm nút đóng hoặc click vào nền mờ
    [overlay].forEach(element => {
        element.addEventListener("click", (event) => {
            if (popup.style.display === "block") {
                popup.style.display = "none";
                overlay.style.display = "none";
            }
        });
    });
}

function buyItemShop(idItem, nameItem, effectItem, priceItem) {
    if (diamondUser < priceItem) {
        messageOpen(`Bạn không có đủ kim cương, bạn có thể nhận kim cương tại <a style="color: firebrick; cursor: pointer;" onclick="openQuestBoard()">nhiệm vụ</a> hoặc <a style="color: firebrick; cursor: pointer;" onclick="openPaymentGateway()">tại đây</a>`);
        return;
    }

    let goldAdd = 0
    if (effectItem === "addGold10") {
        goldAdd = 10
    } else if (effectItem === "addGold100") {
        goldAdd = 100
    } else if (effectItem === "addGold200") {
        goldAdd = 200
    } else if (effectItem === "addGold500") {
        goldAdd = 500
    } else if (effectItem === "addGold1000") {
        goldAdd = 1000
    }
    diamondUser -= priceItem
    goldUser += goldAdd
    messageOpen(`Mua thành công, bạn nhận được ${goldAdd} vàng`);
    resetGoldAndTicket();
} //++++++++++++

//Cổng thanh toán => nạp kim cương
function openPaymentGateway() {
    const popupPayment = document.getElementById("paymentGateway");
    const descPaymentDiv = document.getElementById("descPayment");
    const overlay = document.getElementById("popupOverlay");

    // Hiển thị popup
    if (popupPayment.style.display === "none" || popupPayment.style.display === "") {
        popupPayment.style.display = "flex";
        overlay.style.display = "block"; // Nếu có overlay
    }

    // Thông tin thanh toán
    const descPayment = `
<span style="color: firebrick; ">Với cứ mỗi 1000đ bạn chuyển bạn sẽ nhận được 1 kim cương</span>
<span>Thông tin chuyển khoản</span>
<span>Ngân hàng: <a style="color: royalblue;">MB Bank (Ngân hàng quân đội)</a></span>
<span>Số tài khoản: <a style="color: royalblue;">0398167251</a></span>
<span>Người thụ hưởng: <a style="color: royalblue;">Quàng Văn Việt</a></span>
<span>Nội dung chuyển khoản: <a style="color: royalblue;">${username}</a></span>
<span style="margin-top: -15px;">_____________________</span>
<span style="color: firebrick">Vui lòng điền đúng thông tin nội dung chuyển khoản, nếu không sẽ bị lỗi!</span>
<span>Sau khi thanh toán xong vui lòng chờ xác nhận từ hệ thống</span>
<span>Trường hợp đã quá 15 phút mà vẫn chưa thấy có tin hiệu phản hồi vui lòng liên hệ tới <a style="color: royalblue;">Sđt/Zalo: 0398167251</a> để được hỗ trợ</span>
<span style="margin-top: -15px;">_____________________</span>
<span style="color: royalblue;">Đội ngũ phát triển 5Mon cảm ơn bạn đã ủng hộ trò chơi này!</span>
`;

    descPaymentDiv.innerHTML = descPayment; // Thêm nội dung vào popup
}

function closePaymentGateway() {
    const popupPayment = document.getElementById("paymentGateway");
    const overlay = document.getElementById("popupOverlay");

    popupPayment.style.display = "none";
    overlay.style.display = "none"; // Nếu có overlay
}



//Gacha Page
var randomPet = {
    skill1S: defaultSTT5Mon,
    skill2S: defaultSTT5Mon,
    skill3S: defaultSTT5Mon,
    skill4S: defaultSTT5Mon,
    skill5S: defaultSTT5Mon,
};

//New gacha
function gacha5Mon(isX5) {
    const filteredPets = allPets.filter(pet => pet.LEVEL === 1);
    if (filteredPets.length === 0) {
        messageOpen("Không có pet nào để gacha!");
        return;
    }

    let weightNeed = isX5?5:1
    if (Object.values(userPet).length + weightNeed > weightBagUser) {
        messageOpen('Tủ đồ đã đầy');
        return;
    }

    //Kiểm tra đủ vàng để gacha không
    let goldNeed = isX5?15:5
    if (goldUser < goldNeed) {
        messageOpen(`Không đủ ${goldNeed} vàng`);
        return;
    } else {
        goldUser -= goldNeed;
    }

    document.getElementById("gachax1").disabled = true;
    document.getElementById("gachax1").style.background = "gray";
    document.getElementById("gachax5").disabled = true;
    document.getElementById("gachax5").style.background = "gray";

    let stopTimes = [4000, 6000, 8000, 10000, 12000];
    let chosenPets = [];

    // Làm trống randomPet trước
    randomPet = {
        skill1S: defaultSTT5Mon,
        skill2S: defaultSTT5Mon,
        skill3S: defaultSTT5Mon,
        skill4S: defaultSTT5Mon,
        skill5S: defaultSTT5Mon,
    };

    let lengthRDPet = isX5?5:1;
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`skill${i}S`).innerHTML = "?";
        document.getElementById(`skill${i}S`).classList.remove("comp");
        document.getElementById(`skill${i}S`).style.overflow = "hidden";
    }

    console.log("5mon sau khi random", randomPet);

    // Chạy hiệu ứng quay
    for (let o = 0; o < lengthRDPet; o++) {
        // Chọn pet trước khi quay
        const pet = getRandom5mon();
        randomPet[`skill${o+1}S`] = pet;

        let slotKey = `skill${o + 1}S`
        let slotElement = document.getElementById(slotKey);
        let container = document.createElement("div");
        container.classList.add("slotContainer");
        slotElement.innerHTML = "";
        slotElement.appendChild(container);

        let finalPet = randomPet[slotKey].URLimg['Lv1'];
        chosenPets.push(finalPet);

        // Chứa danh sách ảnh để quay
        let images = [];
        let scrollSpeed = 50; // Tốc độ cuộn ảnh (càng nhỏ càng nhanh)
        let totalImages = 100; // Số ảnh gốc

        // Thêm ảnh 5mon quay trúng
        let finalImg = document.createElement("img");
        finalImg.src = finalPet;
        images.push(finalImg);

        for (let i = 0; i < totalImages; i++) {
            let img = document.createElement("img");
            img.src = filteredPets[Math.floor(Math.random() * filteredPets.length)].URLimg['Lv1'];
            images.push(img);
        }

        // Nhân ba danh sách ảnh để tạo hiệu ứng vòng lặp mượt
        [...images, ...images, ...images, ...images, ...images, ...images].forEach(img => container.appendChild(img));

        // Bắt đầu hiệu ứng quay bằng requestAnimationFrame()
        let position = 0;
        let stopAfter = stopTimes[o]; // Thời gian dừng lại
        let startTime = Date.now();
        let animationFrame;

        function spin() {
            let elapsed = Date.now() - startTime;

            if (elapsed < stopAfter) {
                position += scrollSpeed;

                // Khi cuộn đến giới hạn, đặt lại vị trí về 0 để lặp vô hạn
                if (position >= totalImages * 100) {
                    position = 0;
                }

                container.style.transform = `translateY(-${position}px)`;
                animationFrame = requestAnimationFrame(spin);
            } else {
                cancelAnimationFrame(animationFrame);

                // Khi dừng, hiển thị ảnh trúng thưởng đúng vị trí
                slotElement.innerHTML = "";
                slotElement.style.overflow = "visible";
                createSkillGacha(o);
            }
        }
        requestAnimationFrame(spin);
    }

    setTimeout(() => {
        resetGoldAndTicket();
        document.getElementById("gachax1").disabled = false;
        document.getElementById("gachax1").style.background = "#d9534f";
        document.getElementById("gachax5").disabled = false;
        document.getElementById("gachax5").style.background = "#d9534f";
    }, stopTimes[lengthRDPet-1] + 500)


}

//Random 5mon
var rareStats = {
    D: { min: 60, max: 109 },
    C: { min: 110, max: 149 },
    B: { min: 150, max: 189 },
    A: { min: 190, max: 229 },
    S: { min: 230, max: 269 },
    SS: { min: 270, max: 309 },
    SSR: { min: 310, max: 350 }
};

var rareStats1 = {
    D: { sttMin: 150, sttMax: 200, max: 100 },
    C: { sttMin: 201, sttMax: 250, max: 120 },
    B: { sttMin: 251, sttMax: 300, max: 140 },
    A: { sttMin: 301, sttMax: 350, max: 160 },
    S: { sttMin: 351, sttMax: 400, max: 180 },
    SS: { sttMin: 401, sttMax: 450, max: 200 },
    SSR: { sttMin: 451, sttMax: 500, max: 220 }
};

function randomPet5Mon() {

    //rd pet5Mon
    // Lọc ra các pet cấp độ 1
    let all5mon = allPets.filter(pet => pet.LEVEL === 1);

    // Random 1 pet trong danh sách đó
    const index5mon = Math.floor(Math.random() * all5mon.length);
    const e5mon = all5mon[index5mon];
    console.log("all5mon", all5mon)
    console.log("index5mon", index5mon)
    console.log("e5mon", e5mon)

    //rd chỉ số
    const rand = Math.random() * 100;
    let rare = '';
    if (rand < 0.5) rare = 'SSR';
    else if (rand < 1) rare = 'SS';
    else if (rand < 2) rare = 'S';
    else if (rand < 5) rare = 'A';
    else if (rand < 25) rare = 'B';
    else if (rand < 45) rare = 'C';
    else rare = 'D';

    // const { min: minSTT, max: maxSTT } = rareStats[rare];

    const { sttMin: pointMin, sttMax: pointMax, max: maxPointUp } = rareStats1[rare];

    const randStat = () => Math.floor(Math.random() * (maxPointUp - 10 + 1)) + 10;

    let str, def, int, agi, luk, hp, total;

    let attempts = 0;
    do {
        str = randStat();
        def = randStat();
        int = randStat();
        agi = randStat();
        luk = randStat();
        hp = randStat();
        total = str + def + int + agi + luk + hp;
        attempts++;
    } while (
        (total > pointMax || total < pointMin) &&
        attempts < 1000
    );

    // do {
    //     total = Math.floor(Math.random() * (maxSTT - minSTT + 1)) + minSTT;

    //     str = Math.floor(Math.random() * (total + 1));
    //     def = Math.floor(Math.random() * (total + 1));
    //     int = Math.floor(Math.random() * (total + 1));
    //     agi = Math.floor(Math.random() * (total + 1));
    //     luk = Math.floor(Math.random() * (total + 1));
    //     hp = Math.floor(Math.random() * (total + 1));

    // } while ((str + def + int + agi + luk + hp > total)
    // || str < 10 || def < 10 || int < 10 || agi < 10 || luk < 10 || hp < 10
    // || str > 250 || def > 250 || int > 250 || agi > 250 || luk > 250 || hp > 250
    // || str + def + int + agi + luk + hp > maxSTT
    //     || str + def + int + agi + luk + hp < minSTT
    // );

    return {
        ID: e5mon.ID,
        NAME: e5mon.NAME,
        URLimg: e5mon.URLimg,
        POWER: { STR: str, DEF: def, INT: int, AGI: agi, LUK: luk, HP: hp, SCALE: e5mon.POWER.SCALE },
        TYPE: e5mon.TYPE,
        SELLUP: e5mon.SELLUP,
        INTERNAL: e5mon.INTERNAL,
        EFFECT: e5mon.EFFECT,
        COOLDOWN: e5mon.COOLDOWN,
        RARE: rare,
        PRICE: e5mon.PRICE
    }
}

//Đổi sang 5mon cho user
function getRandom5mon() {
    //Thông tin 5mon
    const infoPetRandom = randomPet5Mon();
    console.log("infoPetRandom", infoPetRandom)

    //Lấy ID5mon mới
    let maxID = 0;
    for (let key in userPet) {
        let numberPart = parseInt(key.slice(-6)); // Lấy 6 số cuối
        if (numberPart > maxID) {
            maxID = numberPart;
        }
    }
    // Tăng lên 1 để dùng làm ID mới
    let newNumber = (maxID + 1).toString().padStart(6, '0'); // Giữ 6 chữ số
    let newID = `${username}ID${newNumber}`;

    //Quy đổi sang DAME HEAL SHIELD BURN POISON COOLDOWN
    let powerINT = scalePower5Mon(infoPetRandom.POWER.INT);

    let dame = 0, heal = 0, shield = 0, burn = 0, poison = 0;

    // Áp dụng scaleSTR vào các phép tính hiệu ứng
    if (infoPetRandom.EFFECT.includes("Attacking")) {
        dame = Math.round(powerINT.dame * infoPetRandom.POWER.SCALE);  // Giảm dần khi STR tăng
    }
    if (infoPetRandom.EFFECT.includes("Healing")) {
        heal = Math.round(powerINT.heal * infoPetRandom.POWER.SCALE);  // Giảm dần khi STR tăng
    }
    if (infoPetRandom.EFFECT.includes("Shield")) {
        shield = Math.round(powerINT.shield * infoPetRandom.POWER.SCALE);  // Giảm dần khi STR tăng
    }
    if (infoPetRandom.EFFECT.includes("Burn")) {
        burn = Math.round(powerINT.burn * infoPetRandom.POWER.SCALE);  // Giảm dần khi STR tăng
    }
    if (infoPetRandom.EFFECT.includes("Poison")) {
        poison = Math.round(powerINT.poison * infoPetRandom.POWER.SCALE);  // Giảm dần khi STR tăng
    }

    //Tính cooldown
    let agi = infoPetRandom.POWER.AGI;
    let minC = 8;
    let maxC = 20;

    let scaleC = Math.max(5, 170 - Math.floor((agi - 200) / 9)); // giảm dần, min là 5

    let valueC = ((maxC - minC) / (1 + agi / scaleC) * 1000) * (2 - infoPetRandom.POWER.SCALE);

    //tính crit
    let luk = infoPetRandom.POWER.LUK;
    let maxCrit = 60;
    let scaleCrit = 1500; // tùy chỉnh
    let valueCrit = maxCrit * luk / (luk + scaleCrit);
    valueCrit = Math.min(maxCrit, Math.max(0, valueCrit));
    valueCrit = Math.round(valueCrit * infoPetRandom.POWER.SCALE);

    //tính def
    let def = infoPetRandom.POWER.DEF;
    let maxDef = 90;
    let scaleDef = 475; // tùy chỉnh
    let valueDef = maxDef * def / (def + scaleDef);
    valueDef = Math.min(maxDef, Math.max(0, valueDef));
    valueDef = Math.round(valueDef * infoPetRandom.POWER.SCALE);

    //Gán info vào 5mon
    let final5mon = {
        IDcreate: newID,
        ID: infoPetRandom.ID,
        LEVEL: 1,
        NAME: infoPetRandom.NAME,
        POWER: infoPetRandom.POWER,
        TYPE: infoPetRandom.TYPE,
        SELLUP: infoPetRandom.SELLUP,
        INTERNAL: infoPetRandom.INTERNAL,
        EFFECT: infoPetRandom.EFFECT,
        URLimg: infoPetRandom.URLimg,
        DAME: [dame, 0, 0, 0, 0, 0],
        DEF: [Math.round(valueDef * 100) / 100, 0, 0, 0, 0, 0],
        HEAL: [heal, 0, 0, 0, 0, 0],
        SHIELD: [shield, 0, 0, 0, 0, 0],
        BURN: [burn, 0, 0, 0, 0, 0],
        POISON: [poison, 0, 0, 0, 0, 0],
        CRIT: [Math.round(valueCrit * 100) / 100, 0, 0, 0, 0, 0],
        COOLDOWN: [Math.ceil(valueC), infoPetRandom.COOLDOWN[1], 0, 0, 0, 0],
        RARE: infoPetRandom.RARE,
        PRICE: infoPetRandom.PRICE
    }

    if (!userPet) {
        userPet = {}; // Nếu chưa có, tạo mới userPet là một đối tượng trống
    }

    userPet[newID] = final5mon;
    return final5mon;
}

function createSkillGacha(i) {
    const skillCompSlot = `skill${i + 1}S`;
    let skillCompDiv = document.querySelector(`#${skillCompSlot}`);
    let URLimg = randomPet[skillCompSlot].URLimg[`Lv${randomPet[skillCompSlot].LEVEL}`] || randomPet[skillCompSlot].URLimg['Lv1'];
    //Tạo 5mon ở slot i
    if ((skillCompDiv && randomPet && randomPet[skillCompSlot].ID)) {
        console.log("Vào đây 2")
        skillCompDiv.innerHTML += `
    <div 
      id="skillGacha${i + 1}" 
      class="skill"
      draggable="true"
      style="background-image: url('${URLimg}')"
      data-skill='{"ID": "${randomPet[skillCompSlot].ID}", "LEVEL": ${randomPet[skillCompSlot].LEVEL}}'>
    </div>`;
        let dameSkillText = ``; // Dùng let có thể thay đổi được biến, còn dùng const không được

        const dameSkillDiv = document.querySelector("#skillGacha" + `${i + 1}`);
        if (dameSkillDiv) {
            if (randomPet[skillCompSlot]?.DAME?.[0] > 0) { // Skill dame
                dameSkillText += `<div class="skill-dame">${Number(randomPet[skillCompSlot].DAME.reduce((a, b) => a + b, 0) || 0)}</div>`;
            }
            if (randomPet[skillCompSlot]?.HEAL?.[0] > 0) { // Skill heal
                dameSkillText += `<div class="skill-heal">${Number(randomPet[skillCompSlot].HEAL.reduce((a, b) => a + b, 0) || 0)}</div>`;
            }
            if (randomPet[skillCompSlot]?.SHIELD?.[0] > 0) { // Skill shield
                dameSkillText += `<div class="skill-shield">${Number(randomPet[skillCompSlot].SHIELD.reduce((a, b) => a + b, 0) || 0)}</div>`;
            }
            if (randomPet[skillCompSlot]?.BURN?.[0] > 0) { // Skill BURN
                dameSkillText += `<div class="skill-burn">${Number(randomPet[skillCompSlot].BURN.reduce((a, b) => a + b, 0) || 0)}</div>`;
            }
            if (randomPet[skillCompSlot]?.POISON?.[0] > 0) { // Skill Poison
                dameSkillText += `<div class="skill-poison">${Number(randomPet[skillCompSlot].POISON.reduce((a, b) => a + b, 0) || 0)}</div>`;
            }
            if (randomPet[skillCompSlot]?.EFFECT?.includes("Freeze")) { // Skill đóng băng freeze
                dameSkillText += `<div class="skill-freeze">${Number(randomPet[skillCompSlot].COOLDOWN?.[0] / 2 / 1000 * randomPet[skillCompSlot].LEVEL)}</div>`;
            }
        }

        // Gắn nội dung vào dameSkillDiv
        dameSkillDiv.innerHTML =
            `<div class="dameSkillText" style="display: flex; flex-direction: row; align-items: center;">
                ${dameSkillText}
            </div>
            <div style="position: absolute;font-size: 25px;font-weight: bold;color: rgb(83, 21, 21);text-shadow: 2px 1px 2px #140a03;top: 0px;right: 0px;">
                <span style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);font-size: 14px;color: #ffd600; font-weight: bold; background: #ff0000;min-width: 25px; border-radius: 5px;">${randomPet[skillCompSlot].RARE}</span>
            </div>`;

        //Gắn cho div cha trạng thái đã lấp đầy
        skillCompDiv.classList.add("comp");

        skillCompDiv.addEventListener("click", () => {

            for (let k = 1; k <= 4; k++) {
                document.getElementById(`popupSTT5MonLV${k}`).style.background = "firebrick";
            }

            document.getElementById(`popupSTT5MonLV${randomPet[skillCompSlot].LEVEL}`).style.background = "rebeccapurple";

            setupClickPopupInfo5MonBag(randomPet[skillCompSlot], "skillGacha", randomPet[skillCompSlot].LEVEL) 


            for (let s = 1; s <= 4; s++) {
                const el = document.getElementById(`popupSTT5MonLV${s}`);
                if (!el) continue;
                el.onclick = () => {
                    setupClickPopupInfo5MonBag(randomPet[skillCompSlot], "skillGacha", s);
                    for (let p = 1; p <= 4; p++) {
                        document.getElementById(`popupSTT5MonLV${p}`).style.background = "firebrick";
                    }
                    
                    el.style.background = "rebeccapurple";

                };
            }


        });
    }
    
}

//Exchange Page => Đổi thẻ lấy pet
var exchangePetShop = [];
function openExchangePage() {
    // tạo mảng mới chứa Pet + giá pet
    exchangePetShop = allPets
        .filter(pet => pet.LEVEL === 1)
        .map(pet => ({
            LEVEL: pet.LEVEL,
            ID: pet.ID,
            NAME: pet.NAME,
            TYPE: pet.TYPE,
            SELLUP: pet.SELLUP,
            INTERNAL: pet.INTERNAL,
            EFFECT: pet.EFFECT,
            URLimg: pet.URLimg,
            POWER: pet.POWER,
            DAME: pet.DAME,
            DEF: pet.DEF,
            HEAL: pet.HEAL,
            SHIELD: pet.SHIELD,
            BURN: pet.BURN,
            POISON: pet.POISON,
            CRIT: pet.CRIT,
            COOLDOWN: pet.COOLDOWN,
            PRICE: pet.PRICE,
            ticketsPRICE: 10 // Giá mặc định
        }));

    console.log("exchangePetShop", exchangePetShop)

    if (exchangePetShop.length > 0) {
        var latestID = Math.max(...exchangePetShop.map(pet => parseInt(pet.ID.slice(1))));

        // Cập nhật giá cho 2 pet mới nhất là 20
        exchangePetShop = exchangePetShop.map(pet => ({
            ...pet,
            ticketsPRICE: parseInt(pet.ID.slice(1)) >= latestID - 1 ? 20 : 10
        }));
        console.log("exchangePetShop2", exchangePetShop)
    } else {
        console.warn("Không có pet nào có LEVEL = 1.");
    }

    addItemForExchangePage("exchangeRow1", exchangePetShop);
}

function addItemForExchangePage(rowId, itemList) {
    const row = document.getElementById(rowId);

    row.innerHTML = ""; // Xóa dữ liệu cũ nếu có

    // Sắp xếp itemList: 
    // 1. Pet chưa sở hữu lên trước
    // 2. Nếu cùng trạng thái sở hữu, pet có ID lớn hơn (mới hơn) lên trước
    itemList.sort((a, b) => {
        const aOwned = userPet.hasOwnProperty(a.ID);
        const bOwned = userPet.hasOwnProperty(b.ID);

        if (aOwned !== bOwned) {
            return aOwned - bOwned; // Chưa sở hữu (0) lên trước, đã sở hữu (1) xuống sau
        }

        return b.ID.localeCompare(a.ID); // ID lớn hơn (mới hơn) lên trước
    });

    itemList.forEach(item => {
        // Tạo thẻ chứa item
        const itemDiv = document.createElement("div");
        itemDiv.id = `${item.ID}`
        itemDiv.style.cssText = `
  min-width: 105px;
  height: 105px;
  padding: 2px;
  background: rgb(255, 243, 220);
  border-radius: 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: rgb(0 0 0 / 20%) 2px 2px 1px 2px;
  justify-content: center;
  position: relative;
  border: 2px solid #d1b792;
`;

        // Thêm hình ảnh
        const img = document.createElement("img");
        let URLimg = item.URLimg[`Lv${item.LEVEL}`] || item.URLimg['Lv1'];
        img.src = URLimg;
        img.style.cssText = "height: 75px; object-fit: cover; pointer-events: none;";

        // Thêm tên item
        const name = document.createElement("p");
        name.textContent = item.NAME;
        name.style.cssText = "font-size: 12px;font-weight: bold;margin: 1px 0px 0px;color: white;background: firebrick;border-bottom-right-radius: 6px;border-bottom-left-radius: 6px; min-width: 100px;pointer-events: none;";

        // Thêm giá item
        const price = document.createElement("p");
        price.textContent = `${item.ticketsPRICE} vé đổi`;
        price.style.cssText = "font-size: 12px; color: gold; background: seagreen; margin: 0px; border-radius: 5px; width: 95px; font-weight: bold; pointer-events: none;";

        // Kiểm tra nếu user đã sở hữu pet này
        if (userPet.hasOwnProperty(item.ID)) {

            const ownedOverlay = document.createElement("div");
            ownedOverlay.textContent = "Đã sở hữu";
            ownedOverlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    color: white;
    font-size: 14px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    pointer-events: none;
  `;
            itemDiv.appendChild(ownedOverlay);
        }

        // Gắn tất cả vào itemDiv
        itemDiv.appendChild(img);
        itemDiv.appendChild(name);
        itemDiv.appendChild(price);
        // itemDiv.appendChild(buyButton);

        // Thêm vào hàng tương ứng
        row.appendChild(itemDiv);

    });
    //Thêm event click vào các item để hiên popup mua
    setupPopupEventsExchangePage(itemList);
}

function setupPopupEventsExchangePage(itemList) {
    const popup = document.getElementById("itemPopupExchange");
    const overlay = document.getElementById("popupOverlay");
    const buttonBuy = document.getElementById("buyItemExchange");

    // Thêm sự kiện click cho từng item để mở popup
    itemList.forEach(item => {
        const itemDiv = document.getElementById(item.ID);
        itemDiv.addEventListener("click", () => {

            let URLimg = item.URLimg[`Lv${item.LEVEL}`] || item.URLimg['Lv1'];
            
            document.getElementById("popupImgExchange").style.backgroundImage = "url('" + URLimg + "')";
            document.getElementById("popupNameExchange").textContent = item.NAME;
            document.getElementById("priceTextItemPopupExchange").textContent = item.PRICE;

            for (let k = 1; k <= 4; k++) {
                document.getElementById(`popupImgExchangeLV${k}`).style.background = "firebrick";
            }

            document.getElementById(`popupImgExchangeLV${item.LEVEL}`).style.background = "rebeccapurple";

            for (let s = 1; s <= 4; s++) {
                const el = document.getElementById(`popupImgExchangeLV${s}`);
                if (!el) continue;
                el.onclick = () => {
                    
                    let URLimg = item.URLimg[`Lv${item.LEVEL}`] || item.URLimg['Lv1'];

                    document.getElementById("popupImgExchange").style.backgroundImage = "url('" + URLimg + "')";

                    for (let k = 1; k <= 4; k++) {
                        document.getElementById(`popupImgExchangeLV${k}`).style.background = "firebrick";
                    }
                    
                    el.style.background = "rebeccapurple";

                };
            }


            let descTextItem = "";
            // Type
            let typeInfo = "";
            item.TYPE.forEach(type => {
                typeInfo += `<a style=" background: rebeccapurple; padding: 2px 4px; border-radius: 4px; color: #ffffff;">${type}</a>`
            });

            // Cập nhật thông tin trong popup
            descTextItem += `
            <div style="display: flex; justify-content: space-between; flex-direction: row; align-items: center; width: 100%">
                <div style="display: flex; justify-content: space-between; flex-direction: row; align-items: center; gap: 3px; width: 100%">
                    <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-hand-fist"></i>: ??</span>
                    <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-shield"></i>: ??</span>
                    <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-brain"></i>: ??</span>
                    <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-bolt"></i></i>: ??</span>
                    <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-clover"></i>: ??</span>
                    <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-heart"></i>: ??</span>
                </div>
            </div>`

            // Cập nhật thông tin trong popup
            descTextItem += `
            <span style="display: flex;font-weight: bold;font-size: 12px;padding: 2px 0px;color: black;gap: 5px;flex-direction: row;align-content: center;
            justify-content: space-between;align-items: center; width: 100%;">
            <span>
                [Máu: <a style="color:red; font-weight: bold;">???</a>]
            </span>
            <span style="display: flex; gap: 5px;">
                <span style="display: flex; gap: 3px; flex-direction: row; align-content: center; justify-content: center; align-items: center;">
                    ${typeInfo}
                </span>
            </span>
            </span>
            <span style="font-weight: bold;margin-top: 5px;">[Đánh thường][Tốc độ: ??? giây][Liên kích: ???]</span>
            <span>Gây <a style="color: red; font-weight: bold">??? sát thương </a> cho 5Mon đối thủ (ưu tiên 5Mon đối diện)</span>
            `

            let descInfo = "";
            let countDescInfo = 1;
            if (item.EFFECT.length === 1) {
                item.EFFECT.forEach((effect) => {
                    if (effectsSkill[effect]) {
                        // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                        const dynamicDescription = new Function("skill", `return \`${effectsSkill[effect].descriptionSkill}\`;`);
                        let rawDescription = dynamicDescription(item);

                        // Thay thế mọi sự xuất hiện của -Infinity bằng dấu ?
                        let hiddenDescription = rawDescription.replace(/-Infinity/g, '?');

                        // Tiếp tục thay thế các số (bao gồm cả số thập phân) thành dấu ?
                        hiddenDescription = hiddenDescription.replace(/\d+(\.\d+)?/g, '?');

                        // Thay thế "mon" bằng "5mon" nếu có
                        hiddenDescription = hiddenDescription.replace(/\?mon/gi, '5mon');

                        // Bây giờ hiddenDescription đã được cập nhật với các thay thế
                        descInfo += hiddenDescription
                    }
                });
            } else {
                item.EFFECT.forEach((effect) => {
                    if (effectsSkill[effect]) {
                        // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                        const dynamicDescription = new Function("skill", `return \`${effectsSkill[effect].descriptionSkill}\`;`);
                        let rawDescription = dynamicDescription(item);
                        // Thay thế mọi sự xuất hiện của -Infinity bằng dấu ?
                        let hiddenDescription = rawDescription.replace(/-Infinity/g, '?');

                        // Tiếp tục thay thế các số (bao gồm cả số thập phân) thành dấu ?
                        hiddenDescription = hiddenDescription.replace(/\d+(\.\d+)?/g, '?');

                        // Thay thế "mon" bằng "5mon" nếu có
                        hiddenDescription = hiddenDescription.replace(/\?mon/gi, '5mon');

                        // Bây giờ hiddenDescription đã được cập nhật với các thay thế

                        descInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countDescInfo})</span> ${hiddenDescription}</span>`;
                        countDescInfo += 1;
                    }
                });
            }

            let internalInfo = "";
            let countInternalInfo = 1;
            if (item.INTERNAL.length === 1) {
                item.INTERNAL.forEach((internal) => {
                    if (effectsInternal[internal]) {
                        // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                        const dynamicDescription = new Function("skill", `return \`${effectsInternal[internal].descriptionInternal}\`;`);
                        let rawDescription = dynamicDescription(item);
                        // Thay mọi số (bao gồm cả số thập phân) thành dấu ?
                        let hiddenDescription = rawDescription.replace(/\d+(\.\d+)?/g, '?');
                        hiddenDescription = hiddenDescription.replace(/\?mon/gi, '5mon');
                        internalInfo += hiddenDescription
                    }
                });
            } else {
                item.INTERNAL.forEach((internal) => {
                    if (effectsInternal[internal]) {
                        // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                        const dynamicDescription = new Function("skill", `return \`${effectsInternal[internal].descriptionInternal}\`;`);
                        let rawDescription = dynamicDescription(item);
                        // Thay mọi số (bao gồm cả số thập phân) thành dấu ?
                        let hiddenDescription = rawDescription.replace(/\d+(\.\d+)?/g, '?');
                        hiddenDescription = hiddenDescription.replace(/\?mon/gi, '5mon');

                        internalInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countInternalInfo})</span> ${hiddenDescription}</span>`;
                        countInternalInfo += 1;
                    }
                });
            }

            //Chí mạng info
            let critInfo = `[Tỷ lệ chí mạng: <span style="color: red; font-weight: bold">???</span>]`;

            // Gán nội dung vào phần tử HTML
            if (descInfo !== "") {
                descTextItem +=
                    `<span style="font-weight: bold;margin-top: 5px;">[Kỹ năng chủ động][+Nộ: ???][Liên kích: ???]</span>
    <span style="display: flex;flex-direction: column; gap: 3px;">${descInfo.trim()}</span>
    <span>${critInfo.trim()}</span>`;
            } else {
                descTextItem += "";
            }

            if (internalInfo !== "") {
                descTextItem +=
                    `<span style="font-weight: bold;margin-top: 5px;">[Kỹ năng bị động]</span>
    <span style="display: flex;flex-direction: column; gap: 3px;">${internalInfo.trim()}</span>`
            } else {
                descTextItem += "";
            }

            //Sellup info
            let sellUpInfo = "";
            let countSellUpInfo = 1;
            if (item.SELLUP.length === 1) {
                item.SELLUP.forEach((sellup) => {
                    if (effectsSellUp[sellup]) {
                        // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                        const dynamicDescription = new Function("skill", `return \`${effectsSellUp[sellup].descriptionSellUp}\`;`);
                        let rawDescription = dynamicDescription(item);
                        // Thay mọi số (bao gồm cả số thập phân) thành dấu ?
                        let hiddenDescription = rawDescription.replace(/\d+(\.\d+)?/g, '?');
                        hiddenDescription = hiddenDescription.replace(/\?mon/gi, '5mon');

                        sellUpInfo += hiddenDescription
                    }
                });
            } else {
                item.SELLUP.forEach((sellup) => {
                    if (effectsSellUp[sellup]) {
                        // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                        const dynamicDescription = new Function("skill", `return \`${effectsSellUp[sellup].descriptionSellUp}\`;`);
                        let rawDescription = dynamicDescription(item);
                        // Thay mọi số (bao gồm cả số thập phân) thành dấu ?
                        let hiddenDescription = rawDescription.replace(/\d+(\.\d+)?/g, '?');
                        hiddenDescription = hiddenDescription.replace(/\?mon/gi, '5mon');

                        sellUpInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countSellUpInfo})</span> ${hiddenDescription}</span>`;
                        countSellUpInfo += 1;
                    }
                });
            }

            if (sellUpInfo !== "") {
                descTextItem += `<span style="font-weight: bold;margin-top: 5px;">[Thả đi nhận được]</span>
    <span style="display: flex;flex-direction: column; gap: 3px;">${sellUpInfo.trim()}</span>`;
            } else {
                descTextItem += "";
            }

            document.getElementById("popupDescExchange").innerHTML = descTextItem;


            document.getElementById("popupPriceExchange").textContent = `${item.ticketsPRICE} vé đổi`;
            // Kiểm tra nếu pet đã sở hữu
            const isOwned = userPet.hasOwnProperty(item.ID)

            if (isOwned) {
                buttonBuy.innerHTML = "Đã sở hữu"
                buttonBuy.style.background = "gray";
                buttonBuy.style.cursor = "not-allowed";
                buttonBuy.disabled = true;
                buttonBuy.onclick = null; // Xóa sự kiện click nếu đã sở hữu
            } else {
                buttonBuy.innerHTML = "Đổi"
                buttonBuy.style.background = "firebrick"; // Reset màu gốc
                buttonBuy.style.cursor = "pointer";
                buttonBuy.disabled = false;

                // Xóa sự kiện cũ (nếu có) rồi thêm sự kiện mới
                buttonBuy.onclick = () => buyItemExchange(item.ID, item.NAME, item.ticketsPRICE);
            }

            popup.style.display = "block";
            overlay.style.display = "block";
        });
    });

    // Đóng popup khi bấm nút đóng hoặc click vào nền mờ
    [overlay].forEach(element => {
        element.addEventListener("click", (event) => {
            if (popup.style.display === "block") {
                popup.style.display = "none";
                overlay.style.display = "none";
            }
        });
    });
}

function buyItemExchange(itemID, itemName, ticketsPrice) {

    if (ticketsUser < ticketsPrice) {
        messageOpen("Không đủ vé đổi");
        return;
    }

    if (Object.values(userPet).length >= weightBagUser) {
        messageOpen('Tủ đồ đã đầy')
        return
    }

    let select5Mon = allPets.find(pet => pet.ID === itemID && pet.LEVEL === 1);

    console.log("select5Mon", select5Mon)
    //rd chỉ số
    const rand = Math.random() * 100;
    let rare = '';
    if (rand < 0.5) rare = 'SSR';
    else if (rand < 1) rare = 'SS';
    else if (rand < 2) rare = 'S';
    else if (rand < 5) rare = 'A';
    else if (rand < 25) rare = 'B';
    else if (rand < 45) rare = 'C';
    else rare = 'D';

    const { sttMin: pointMin, sttMax: pointMax, max: maxPointUp } = rareStats1[rare];
    const randStat = () => Math.floor(Math.random() * (maxPointUp - 10 + 1)) + 10;

    let str, def, int, agi, luk, hp, total;

    let attempts = 0;
    do {
        str = randStat();
        def = randStat();
        int = randStat();
        agi = randStat();
        luk = randStat();
        hp = randStat();
        total = str + def + int + agi + luk + hp;
        attempts++;
    } while (
        (total > pointMax || total < pointMin) &&
        attempts < 1000
    );
    
    // const { min: minSTT, max: maxSTT } = rareStats[rare];

    // let str, def, int, agi, luk, hp, total;

    // do {
    //     total = Math.floor(Math.random() * (maxSTT - minSTT + 1)) + minSTT;

    //     str = Math.floor(Math.random() * (total + 1));
    //     def = Math.floor(Math.random() * (total + 1));
    //     int = Math.floor(Math.random() * (total + 1));
    //     agi = Math.floor(Math.random() * (total + 1));
    //     luk = Math.floor(Math.random() * (total + 1));
    //     hp = Math.floor(Math.random() * (total + 1));

    // } while ((str + def + int + agi + luk + hp > total)
    // || str < 10 || def < 10 || int < 10 || agi < 10 || luk < 10 || hp < 10
    // || str > 250 || def > 250 || int > 250 || agi > 250 || luk > 250 || hp > 250
    // || str + def + int + agi + luk + hp > maxSTT
    //     || str + def + int + agi + luk + hp < minSTT
    // );

    //Lấy ID5mon mới
    let maxID = 0;
    for (let key in userPet) {
        let numberPart = parseInt(key.slice(-6)); // Lấy 6 số cuối
        if (numberPart > maxID) {
            maxID = numberPart;
        }
    }
    // Tăng lên 1 để dùng làm ID mới
    let newNumber = (maxID + 1).toString().padStart(6, '0'); // Giữ 6 chữ số
    let newID = `${username}ID${newNumber}`;

    //Quy đổi sang DAME HEAL SHIELD BURN POISON COOLDOWN
    let powerINT = scalePower5Mon(int);

    let dame = 0, heal = 0, shield = 0, burn = 0, poison = 0;

    // Áp dụng scaleSTR vào các phép tính hiệu ứng
    if (select5Mon.EFFECT.includes("Attacking")) {
        dame = Math.round(powerINT.dame * select5Mon.POWER.SCALE);  // Giảm dần khi STR tăng
    }
    if (select5Mon.EFFECT.includes("Healing")) {
        heal = Math.round(powerINT.heal * select5Mon.POWER.SCALE);  // Giảm dần khi STR tăng
    }
    if (select5Mon.EFFECT.includes("Shield")) {
        shield = Math.round(powerINT.shield * select5Mon.POWER.SCALE);  // Giảm dần khi STR tăng
    }
    if (select5Mon.EFFECT.includes("Burn")) {
        burn = Math.round(powerINT.burn * select5Mon.POWER.SCALE);  // Giảm dần khi STR tăng
    }
    if (select5Mon.EFFECT.includes("Poison")) {
        poison = Math.round(powerINT.poison * select5Mon.POWER.SCALE);  // Giảm dần khi STR tăng
    }

    //Tính cooldown
    let minC = 8;
    let maxC = 20;

    let scaleC = Math.max(5, 170 - Math.floor((agi - 200) / 9)); // giảm dần, min là 5

    let valueC = ((maxC - minC) / (1 + agi / scaleC) * 1000) * (2 - select5Mon.POWER.SCALE);

    //tính crit
    let maxCrit = 60;
    let scaleCrit = 1500; // tùy chỉnh
    let valueCrit = maxCrit * luk / (luk + scaleCrit);
    valueCrit = Math.min(maxCrit, Math.max(0, valueCrit));
    valueCrit = Math.round(valueCrit * select5Mon.POWER.SCALE);

    //tính def
    let maxDef = 90;
    let scaleDef = 475; // tùy chỉnh
    let valueDef = maxDef * def / (def + scaleDef);
    valueDef = Math.min(maxDef, Math.max(0, valueDef));
    valueDef = Math.round(valueDef * select5Mon.POWER.SCALE);

    //Gán info vào 5mon
    let final5mon = {
        IDcreate: newID,
        ID: select5Mon.ID,
        LEVEL: 1,
        NAME: select5Mon.NAME,
        POWER: { STR: str, DEF: def, INT: int, AGI: agi, LUK: luk, HP: hp, SCALE: select5Mon.POWER.SCALE },
        TYPE: select5Mon.TYPE,
        SELLUP: select5Mon.SELLUP,
        INTERNAL: select5Mon.INTERNAL,
        EFFECT: select5Mon.EFFECT,
        URLimg: select5Mon.URLimg,
        DAME: [dame, 0, 0, 0, 0, 0],
        DEF: [Math.round(valueDef * 100) / 100, 0, 0, 0, 0, 0],
        HEAL: [heal, 0, 0, 0, 0, 0],
        SHIELD: [shield, 0, 0, 0, 0, 0],
        BURN: [burn, 0, 0, 0, 0, 0],
        POISON: [poison, 0, 0, 0, 0, 0],
        CRIT: [Math.round(valueCrit * 100) / 100, 0, 0, 0, 0, 0],
        COOLDOWN: [Math.ceil(valueC), select5Mon.COOLDOWN[1], 0, 0, 0, 0],
        RARE: rare,
        PRICE: select5Mon.PRICE
    }

    if (!userPet) {
        userPet = {}; // Nếu chưa có, tạo mới userPet là một đối tượng trống
    }

    userPet[newID] = final5mon;
    console.log("userPet[newID]", userPet[newID])

    ticketsUser -= ticketsPrice
    messageOpen(`Mua thành công pet ${itemName}`);
    //Reset lại shop
    openExchangePage();
    //Reset lại gold + ticket
    resetGoldAndTicket();

}

//Reset gold + ticket + điểm xếp hạng
function resetGoldAndTicket() {
    document.getElementById("goldUser").innerText = `${goldUser}`;
    document.getElementById("ticketUser").innerText = `${ticketsUser}`;
    document.getElementById("pointRank").innerText = `${pointRank.typeGameConquest}`;
    document.getElementById("diamondUser").innerText = `${diamondUser}`;

    //Cập nhật bảng xếp hạng hiện tại:
    const sortedUsers = Object.entries(rankGame).sort(([, a], [, b]) => b.rankPoint.typeGameConquest - a.rankPoint.typeGameConquest);
    const myTop = sortedUsers.findIndex(([user]) => user === username) + 1; // Thứ hạng bắt đầu từ 1
    document.getElementById("isRanking").innerText = `(Hạng: ${myTop})`;

}

//Hướng dẫn người chơi
let guideMode = false; //++++++++
let stepGuide = 0;
//Biến các bước hướng dẫn người chơi
const steps = [
    { element: "#openBag", text: "Bấm nút 'Tủ đồ' để mở ra tủ đồ", event: openBag, nextStep: true },
    { element: "#inventory", text: "Đây là tủ đồ chứa toàn bộ 5mon bạn sỡ hữu", nextStep: true },
    { element: "#bag", text: "Đây là hành lý nơi bạn có thể kéo các 5mon từ tủ đồ vào, 5mon này sẽ được dùng trong trận đấu", nextStep: true },
    { element: "#inventory1", text: "Hãy kéo 5mon từ tủ đồ sang hành lý", nextStep: false },
    { element: "#inventory", text: "Hãy tiếp tục kéo các 5mon khác mà bạn muốn sử dụng từ tủ đồ sang hành lý", nextStep: false },
    { element: "#openGame", text: "Bấm nút 'Bắt đầu' để vào trận đấu!", event: openGame, nextStep: true },
    // { element: "#attackButton", text: "Đây là nút tấn công. Bấm vào để gây sát thương!" },
    // { element: "#hpBar", text: "Đây là thanh máu của bạn. Hãy giữ nó đầy càng lâu càng tốt!" },
];

function showStepGuide(stepIndex) {
    const step = steps[stepIndex];
    const element = document.querySelector(step.element);
    const guideTextPopup = document.getElementById("tutorialPopup");
    const guideText = document.getElementById("tutorialText");
    const highlightDivGuide = document.querySelector(".highlightGuide");
    const overlayDivGuide = document.querySelector(".overlayGuide");

    // Highlight vùng
    const rect = element.getBoundingClientRect();
    highlightDivGuide.style.display = "flex";
    overlayDivGuide.style.display = "flex";

    highlightDivGuide.style.top = `${rect.top - 10}px`;
    highlightDivGuide.style.left = `${rect.left - 10}px`;
    highlightDivGuide.style.width = `${rect.width + 20}px`;
    highlightDivGuide.style.height = `${rect.height + 20}px`;

    const popupGuideRect = element.getBoundingClientRect();
    const effectContainerScreenBattle = document.getElementById("ScreenBattle");
    const screenBattleRect = effectContainerScreenBattle.getBoundingClientRect(); // Tọa độ cố định
    const screenBattleMidpointX = screenBattleRect.left + (screenBattleRect.width / 2); // Tọa độ giữa của ScreenBattle
    const screenBattleMidpointY = screenBattleRect.top + (screenBattleRect.height / 2);
    const highlightDivGuideRect = highlightDivGuide.getBoundingClientRect();

    guideText.innerText = step.text; // Thêm text vào popup
    guideTextPopup.style.display = 'flex'; // Hiển thị tạm để lấy kích thước
    const popupWidth = guideTextPopup.offsetWidth;
    const popupHeight = guideTextPopup.offsetHeight;
    guideTextPopup.style.display = 'none'; // Ẩn lại trước khi định vị

    // Tính toán vị trí cho popup
    let popupLeft = 0;
    let popupTop = 0;

    // Kiểm tra tỷ lệ chiều cao của highlightDivGuide so với chiều cao của ScreenBattle
    const highlightHeightRatio = highlightDivGuideRect.height / screenBattleRect.height;

    // Nếu highlightDivGuide chiếm từ 80% chiều cao của ScreenBattle trở lên, hiển thị guideTextPopup ở dưới cùng của highlightDivGuide
    if (highlightHeightRatio >= 0.8) {
        if (highlightDivGuideRect.left < screenBattleMidpointX) {//Bên trái
            popupLeft = highlightDivGuideRect.left + window.scrollX;
            popupTop = highlightDivGuideRect.bottom + window.scrollY - popupHeight - 10; // Hiển thị ở dưới cùng
        } else { //Bên phải
            popupLeft = popupLeft = highlightDivGuideRect.right + window.scrollX - popupWidth;
            popupTop = highlightDivGuideRect.bottom + window.scrollY - popupHeight - 10; // Hiển thị ở dưới cùng
        }

    } else {
        // Nếu không, tính toán như bình thường
        if (highlightDivGuideRect.left < screenBattleMidpointX) { // Ở bên trái
            popupLeft = highlightDivGuideRect.left + window.scrollX;
        } else { // Ở bên phải
            popupLeft = highlightDivGuideRect.right + window.scrollX - popupWidth;
        }

        if (highlightDivGuideRect.top < screenBattleMidpointY) { // Nằm ở phần trên của ScreenBattle
            popupTop = highlightDivGuideRect.bottom + window.scrollY + 10;
        } else { // Nằm ở phần dưới của ScreenBattle
            popupTop = highlightDivGuideRect.top + window.scrollY - popupHeight - 10;
        }
    }

    guideTextPopup.style.left = `${popupLeft}px`;
    guideTextPopup.style.top = `${popupTop}px`;

    // Hiển thị lời nhắc
    guideTextPopup.style.display = 'flex';
}



function nextStepGuide() {
    const step = steps[stepGuide]; // Lấy step tương ứng
    document.querySelector(".overlayGuide").style.display = "none";
    document.querySelector(".highlightGuide").style.display = "none";
    document.getElementById("tutorialPopup").style.display = "none";
    stepGuide++;
    if (step.event) {
        step.event();
    }

    if (step.nextStep) {
        showStepGuide(stepGuide);
    }
}
function skipGuide() {
    guideMode = false
    stepGuide = 0
    document.querySelector(".overlayGuide").style.display = "none";
    document.querySelector(".highlightGuide").style.display = "none";
    document.getElementById("tutorialPopup").style.display = "none";
}

function openFullscreen() {
    const element = document.documentElement; // Toàn màn hình trang web
    if (element.requestFullscreen) {
        element.requestFullscreen(); // Chrome, Firefox, Edge
    } else if (element.webkitRequestFullscreen) { // Safari
        element.webkitRequestFullscreen();
    }
}

let endTime = 0; // Lưu thời điểm cần đóng thông báo
let intervalId; // Biến lưu setInterval

function messageOpen(message) {
    const divMess = document.getElementById("popupMessage");
    const mess = document.getElementById("popup-message");
    let timeClose = 3000; // 3 giây

    // Hiển thị thông báo
    divMess.style.display = "flex";
    divMess.style.opacity = "1";
    mess.innerHTML = message;

    // Cập nhật thời điểm cần đóng thông báo (hiện tại + timeClose)
    endTime = Date.now() + timeClose;

    // Nếu chưa có interval thì tạo mới
    if (!intervalId) {
        intervalId = setInterval(() => {
            if (Date.now() >= endTime) {
                divMess.style.display = "none";
                divMess.style.opacity = "0";
                mess.innerHTML = "";
                clearInterval(intervalId); // Dừng interval khi ẩn thông báo
                intervalId = null;
            }
        }, 100); // Kiểm tra mỗi 100ms
    }
}


function closeMessagePopup() {
    const divMess = document.getElementById("popupMessage")
    const mess = document.getElementById("popup-message")

    divMess.style.display = "none";
    divMess.style.opacity = "0";
    mess.innerHTML = ""
}

//Nhiệm vụ
//In put nhiệm vụ vào popup
function openQuestBoard() {
    //Check và input điểm danh
    loadCheckin();

    //Input nhiệm vụ vào
    loadQuest("Day");

    showOrHiddenDiv("popupQuestBoard")
}

function loadCheckin() {
    Object.entries(weekCheckin).forEach(([key, days]) => {
        const isDay = document.getElementById(`checkin${key}`);

        // Map ngày từ "t2" -> "t7" và "cn"
        const dayMap = { t2: 1, t3: 2, t4: 3, t5: 4, t6: 5, t7: 6, cn: 0 };
        let day = dayMap[key] ?? 0; // Mặc định là Chủ Nhật nếu key không hợp lệ

        // Lấy ngày hôm nay (0 = Chủ Nhật, 1 = Thứ Hai, ..., 6 = Thứ Bảy)
        let today = new Date().getDay();

        // Nếu hôm nay là ngày đó và chưa check-in thì gán onclick
        if (today === day && todayCheckin === "No") {
            isDay.onclick = () => checkinToday(key);
            isDay.classList.add("gift-animation");
            isDay.innerHTML += `<span id="checkinSignal" style="
  position: absolute;
  color: red;
  font-size: 30px;
  bottom: -2px;
  background: red;
  height: 10px;
  width: 10px;
  border-radius: 15px; 
  border: 1px solid wheat;
  box-shadow: rgb(0 0 0 / 36%) 1px 1px 1px 1px;
  "></span>`;
        } else {
            isDay.classList.remove("gift-animation");
            isDay.onclick = null; // Đảm bảo không có sự kiện click khi không hợp lệ
            isDay.innerHTML += ""
        }

        // Đổi màu nền tùy theo trạng thái check-in
        isDay.style.background = days === 1 ? "#47a0e5" : "gray";
    });

    // Tính phần trăm tiến trình
    let totalDays = Object.keys(weekCheckin).length;
    let checkedDays = Object.values(weekCheckin).filter(value => value === 1).length;
    let percentTimeLine = (checkedDays / totalDays) * 100;

    document.getElementById("timeLine").style.width = `${percentTimeLine}%`;
    document.getElementById("timeLineText").innerHTML = `(${checkedDays}/${totalDays})`;

    // Kiểm tra hoàn thành 100% để kích hoạt hiệu ứng quà tặng
    let giftElement = document.getElementById("timeLineGift");
    if (percentTimeLine === 100 && giftCheckinComplete !== "Yes") {
        giftElement.classList.add("gift-animation");
        giftElement.style.color = "#e455c6"
        giftElement.onclick = () => giftCheckin();
    } else {
        giftElement.classList.remove("gift-animation");
        giftElement.style.color = "white"
        if (giftCheckinComplete === "Yes" && percentTimeLine === 100) {
            giftElement.onclick = () => messageOpen('Tuần này đã nhận thưởng, hãy đợi tuần sau');
        } else {
            giftElement.onclick = () => messageOpen('Chưa điểm danh đủ');
        }
    }
}

function giftCheckin() {
    giftCheckinComplete = "Yes"
    diamondUser += 10;
    ticketsUser += 100;
    resetGoldAndTicket();
    messageOpen("Bạn nhận được 10 kim cương và 100 vé đổi")
    loadCheckin();
}

function checkinToday(key) {
    const checkinSignal = document.getElementById("checkinSignal");
    if (checkinSignal) {
        checkinSignal.style.display = "none";
    }
    todayCheckin = "Yes"
    weekCheckin[key] = 1
    goldUser += 5000;
    ticketsUser += 1;
    resetGoldAndTicket();
    messageOpen("Điểm danh thành công, nhận về 5000 vàng và 1 vé đổi")
    loadCheckin();
}

function loadQuest(time) {
    const divAddQuest = document.getElementById("boardAddQuest")
    const timeQuest = time === "Day" ? allQuestData.questDay :
        time === "Week" ? allQuestData.questWeek :
            allQuestData.questWeekend;
    const checkQuestForTime = time === "Day" ? questDay :
        time === "Week" ? questWeek :
            questWeekend;

    if (time === "Week") {
        document.getElementById("buttonQuestDay").style.background = "rgb(222, 109, 62)";
        document.getElementById("buttonQuestWeek").style.background = "rgb(168, 48, 48)";
    } else {
        document.getElementById("buttonQuestDay").style.background = "rgb(168, 48, 48)";
        document.getElementById("buttonQuestWeek").style.background = "rgb(222, 109, 62)";
    }

    let questContent = "";
    Object.entries(timeQuest).forEach(([key, quest]) => {
        let completeQuest = "none";
        let colorCompleteQuest = "rgb(187, 234, 134)";
        let giftComplete = "";
        let onclickCheckGift = "";

        if (checkQuestForTime[key][0] >= quest.targetQuest) {
            colorCompleteQuest = "rgb(229 209 41)";
            giftComplete = "Đã hoàn thành";
            onclickCheckGift = `checkGiftQuest('${key}', '${time}', '${quest.giftQuest}', '${quest.typeGiftQuest}')`
        } else {
            if (time === "Week") {
                colorCompleteQuest = "rgb(134 234 156)";
            } else {
                colorCompleteQuest = "rgb(187, 234, 134)";
            }
            giftComplete = "";
            onclickCheckGift = `messageOpen('Chưa hoàn thành nhiệm vụ')`;
        }

        if (checkQuestForTime[key][1] === "Yes") {
            completeQuest = "flex";
            onclickCheckGift = ""
        } else {
            completeQuest = "none";
        }

        let percentTargetQuest = Math.min((checkQuestForTime[key][0] / quest.targetQuest) * 100, 100);

        questContent += `
<div style="display: flex; flex-direction: column; width: 96%; background: ${colorCompleteQuest}; padding: 5px; border-radius: 10px; box-shadow: rgb(64, 88, 55) 1px 1px 1px 1px; gap: 2px; position: relative; transform: scale(1); cursor: pointer;" onmouseover="this.style.transform='scale(1.02)';" onmouseout="this.style.transform='scale(1)';" onclick="${onclickCheckGift}">

  <div style="background: #000000ab;position:absolute;width: 100%;height: 100%;top: 0;left: 0;border-radius: 10px;box-shadow: rgb(0 0 0 / 72%) 1px 1px 1px 1px;display: ${completeQuest};justify-content: center;align-items: center;color: white;font-size: 15px;font-weight: bold;">ĐÃ NHẬN THƯỞNG</div>

  <div style="display: flex; justify-content: space-between; width: 100%; font-weight: bold;">
    <span>${quest.nameQuest} <a style="color: red; padding: 5px 5px; border-radius: 10px;">${giftComplete}</a></span>
    <span>${quest.giftQuest} ${quest.typeGiftQuest}</span>
  </div>

  <div style="font-size: 12px; text-align: justify; padding: 5px 0;">
    <span>${quest.descQuest}</span>
  </div>

  <div style="display: flex;flex-direction: row;width: 100%;align-content: center;justify-content: center;align-items: center;">
    <div style="display: flex; flex-direction: column; width: 85%;">
      <div style="width: 100%;height: 8px;background: #00000059;border-radius: 5px;overflow: hidden;">
        <div style="width: ${percentTargetQuest}%;height: 100%;background: #a83030;"></div>
      </div>
    </div>

    <div style="width: 15%">
      (${checkQuestForTime[key][0]}/${quest.targetQuest})
    </div>
  </div>
</div>`;
    });
    divAddQuest.innerHTML = questContent;
}

function checkGiftQuest(key, time, gift, typeGift) {
    //key là qd / qw / qwe - time là Day / Week / Weekend
    const checkQuestForTime = time === "Day" ? questDay :
        time === "Week" ? questWeek :
            questWeekend;

    checkQuestForTime[key][1] = "Yes"

    gift = Number(gift); // Chuyển đổi gift thành số
    if (typeGift === "Kim cương") {
        diamondUser += gift
    } else if (typeGift === "Vé đổi") {
        ticketsUser += gift
    } else { //Vàng
        goldUser += gift
    }

    messageOpen(`Hoàn thành nhiệm vụ, nhận được ${gift} ${typeGift}`)
    resetGoldAndTicket();

    loadQuest(time);
}

function checkQuest(idQuest) {
    const questDays = allQuestData.questDay;
    const questWeeks = allQuestData.questWeek;
    const questWeekends = allQuestData.questWeekend;

    // Duyệt qua questDays
    Object.entries(questDays).forEach(([key, quest]) => {
        if (quest.idQuest === idQuest) {
            questDay[key][0] += 1;
        }
    });

    // Duyệt qua questWeeks
    Object.entries(questWeeks).forEach(([key, quest]) => {
        if (quest.idQuest === idQuest) {
            questWeek[key][0] += 1;
        }
    });

    // Duyệt qua questWeekends
    Object.entries(questWeekends).forEach(([key, quest]) => {
        if (quest.idQuest === idQuest) {
            questWeekend[key][0] += 1;
        }
    });

    console.log({ questDay, questWeek, questWeekend });
}


//////////////////Map hunter 5mon
///////////////////////////////
const map = document.getElementById("mapHunter");
const player = document.getElementById("playerHunter");
const autoButton = document.getElementById("autoButton");
const staminaFill = document.getElementById("staminaFill");
const staminaText = document.getElementById("staminaText");
const screenMain = document.getElementById("mainScreen");
const gameScreen = document.getElementById("gameScreen");
const viewport = document.getElementById("viewport");
const battleScreen = document.getElementById("battleScreen");

let mapWidth = 1024;
let mapHeight = 1536;
let viewWidth = 1024;
let viewHeight = 1536;
let playerX = mapWidth / 2;
let playerY = mapHeight / 2;
let targetX = playerX;
let targetY = playerY;

let canClick = true;
let random5MonByLocalMap = [];
function loadMap(isMap) {
    //random để lấy số 5Mon trong allpets
    let allPetsLv1 = allPets.filter(p => Number(p.LEVEL) === 1);

    for (let i = 1; i <= 100; i++) {
        if (allPetsLv1.length === 0) break; // tránh lỗi nếu không có 5mon level 1
        let rdIndex = Math.floor(Math.random() * allPetsLv1.length);
        random5MonByLocalMap.push(allPetsLv1[rdIndex].ID);
    }

    // Nếu tìm thấy, gán danh sách petMeets vào list5MonMeet
    if (random5MonByLocalMap) {
        list5MonMeet = [...random5MonByLocalMap]; // tạo bản sao mảng
        console.log("Danh sách 5Mon gặp ở", isMap, ":", list5MonMeet);
    } else {
        list5MonMeet = [];
        console.warn("Không tìm thấy địa điểm:", isMap);
    }

    settingMap();
    screenMain.style.display = "flex";
    updateStamina();
    spawnRandomPets();
}

let select5MonInSelectHunt = []; // Đảm bảo là mảng
function openSelectHunt() {
    showOrHiddenDiv('popupSelectHunt');
    
    let userPetSort = Object.values(allPets).sort((a, b) => a.ID.localeCompare(b.ID));
    const boardSelectHunt = document.getElementById("boardSelectHunt");
    const containerId = "selectHuntPages";

    boardSelectHunt.innerHTML = "";

    userPetSort.forEach((item, index) => {
        const skillDiv = document.createElement("div");
        skillDiv.id = `selectHunt${index + 1}`;
        skillDiv.className = "skill5MonInBag";
        skillDiv.style.cssText = `
            width: 65px;
            height: 76px;
            cursor: grab;
            border-radius: 5px;
            text-align: center;
            background: #3b3b56;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            position: relative;
            border: 2px solid rebeccapurple;
            outline: 4px solid #ff973a;
        `;
        skillDiv.onmouseover = () => skillDiv.style.transform = "scale(1.05)";
        skillDiv.onmouseout = () => skillDiv.style.transform = "scale(1)";

        let URLimg = item.URLimg[`Lv${item.LEVEL}`] || item.URLimg['Lv1'];
        skillDiv.style.backgroundImage = `url(${URLimg})`;
        skillDiv.dataset.id = item.ID;
        skillDiv.dataset.idcreate = item.IDcreate;
        skillDiv.dataset.source = containerId;

        const hasEquipped = select5MonInSelectHunt.includes(item.ID);

        if (hasEquipped) {
            const ownedOverlay = document.createElement("div");
            ownedOverlay.textContent = "Đã chọn";
            ownedOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.3);
                color: white;
                font-size: 14px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 10px;
                pointer-events: none;
            `;
            skillDiv.appendChild(ownedOverlay);
        }

        boardSelectHunt.appendChild(skillDiv);
    });

    setupPopupEventsSelectHunt(userPetSort); // Gọi ngoài forEach
}

function setupPopupEventsSelectHunt(itemList) {
    const popup = document.getElementById("itemPopupExchange");
    const overlay = document.getElementById("popupOverlay");
    const buttonBuy = document.getElementById("buyItemExchange");

    // Thêm sự kiện click cho từng item để mở popup
    itemList.forEach(item => {
        const itemDiv = document.getElementById(item.ID);
        itemDiv.addEventListener("click", () => {

            let URLimg = item.URLimg[`Lv${item.LEVEL}`] || item.URLimg['Lv1'];
            
            document.getElementById("popupImgExchange").style.backgroundImage = "url('" + URLimg + "')";
            document.getElementById("popupNameExchange").textContent = item.NAME;
            document.getElementById("priceTextItemPopupExchange").textContent = item.PRICE;

            for (let k = 1; k <= 4; k++) {
                document.getElementById(`popupImgExchangeLV${k}`).style.background = "firebrick";
            }

            document.getElementById(`popupImgExchangeLV${item.LEVEL}`).style.background = "rebeccapurple";

            for (let s = 1; s <= 4; s++) {
                const el = document.getElementById(`popupImgExchangeLV${s}`);
                if (!el) continue;
                el.onclick = () => {
                    
                    let URLimg = item.URLimg[`Lv${item.LEVEL}`] || item.URLimg['Lv1'];

                    document.getElementById("popupImgExchange").style.backgroundImage = "url('" + URLimg + "')";

                    for (let k = 1; k <= 4; k++) {
                        document.getElementById(`popupImgExchangeLV${k}`).style.background = "firebrick";
                    }
                    
                    el.style.background = "rebeccapurple";

                };
            }


            let descTextItem = "";
            // Type
            let typeInfo = "";
            item.TYPE.forEach(type => {
                typeInfo += `<a style=" background: rebeccapurple; padding: 2px 4px; border-radius: 4px; color: #ffffff;">${type}</a>`
            });

            // Cập nhật thông tin trong popup
            descTextItem += `
            <div style="display: flex; justify-content: space-between; flex-direction: row; align-items: center; width: 100%">
                <div style="display: flex; justify-content: space-between; flex-direction: row; align-items: center; gap: 3px; width: 100%">
                    <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-hand-fist"></i>: ??</span>
                    <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-shield"></i>: ??</span>
                    <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-brain"></i>: ??</span>
                    <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-bolt"></i></i>: ??</span>
                    <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-clover"></i>: ??</span>
                    <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-heart"></i>: ??</span>
                </div>
            </div>`

            // Cập nhật thông tin trong popup
            descTextItem += `
            <span style="display: flex;font-weight: bold;font-size: 12px;padding: 2px 0px;color: black;gap: 5px;flex-direction: row;align-content: center;
            justify-content: space-between;align-items: center; width: 100%;">
            <span>
                [Máu: <a style="color:red; font-weight: bold;">???</a>]
            </span>
            <span style="display: flex; gap: 5px;">
                <span style="display: flex; gap: 3px; flex-direction: row; align-content: center; justify-content: center; align-items: center;">
                    ${typeInfo}
                </span>
            </span>
            </span>
            <span style="font-weight: bold;margin-top: 5px;">[Đánh thường][Tốc độ: ??? giây][Liên kích: ???]</span>
            <span>Gây <a style="color: red; font-weight: bold">??? sát thương </a> cho 5Mon đối thủ (ưu tiên 5Mon đối diện)</span>
            `

            let descInfo = "";
            let countDescInfo = 1;
            if (item.EFFECT.length === 1) {
                item.EFFECT.forEach((effect) => {
                    if (effectsSkill[effect]) {
                        // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                        const dynamicDescription = new Function("skill", `return \`${effectsSkill[effect].descriptionSkill}\`;`);
                        let rawDescription = dynamicDescription(item);

                        // Thay thế mọi sự xuất hiện của -Infinity bằng dấu ?
                        let hiddenDescription = rawDescription.replace(/-Infinity/g, '?');

                        // Tiếp tục thay thế các số (bao gồm cả số thập phân) thành dấu ?
                        hiddenDescription = hiddenDescription.replace(/\d+(\.\d+)?/g, '?');

                        // Thay thế "mon" bằng "5mon" nếu có
                        hiddenDescription = hiddenDescription.replace(/\?mon/gi, '5mon');

                        // Bây giờ hiddenDescription đã được cập nhật với các thay thế
                        descInfo += hiddenDescription
                    }
                });
            } else {
                item.EFFECT.forEach((effect) => {
                    if (effectsSkill[effect]) {
                        // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                        const dynamicDescription = new Function("skill", `return \`${effectsSkill[effect].descriptionSkill}\`;`);
                        let rawDescription = dynamicDescription(item);
                        // Thay thế mọi sự xuất hiện của -Infinity bằng dấu ?
                        let hiddenDescription = rawDescription.replace(/-Infinity/g, '?');

                        // Tiếp tục thay thế các số (bao gồm cả số thập phân) thành dấu ?
                        hiddenDescription = hiddenDescription.replace(/\d+(\.\d+)?/g, '?');

                        // Thay thế "mon" bằng "5mon" nếu có
                        hiddenDescription = hiddenDescription.replace(/\?mon/gi, '5mon');

                        // Bây giờ hiddenDescription đã được cập nhật với các thay thế

                        descInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countDescInfo})</span> ${hiddenDescription}</span>`;
                        countDescInfo += 1;
                    }
                });
            }

            let internalInfo = "";
            let countInternalInfo = 1;
            if (item.INTERNAL.length === 1) {
                item.INTERNAL.forEach((internal) => {
                    if (effectsInternal[internal]) {
                        // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                        const dynamicDescription = new Function("skill", `return \`${effectsInternal[internal].descriptionInternal}\`;`);
                        let rawDescription = dynamicDescription(item);
                        // Thay mọi số (bao gồm cả số thập phân) thành dấu ?
                        let hiddenDescription = rawDescription.replace(/\d+(\.\d+)?/g, '?');
                        hiddenDescription = hiddenDescription.replace(/\?mon/gi, '5mon');
                        internalInfo += hiddenDescription
                    }
                });
            } else {
                item.INTERNAL.forEach((internal) => {
                    if (effectsInternal[internal]) {
                        // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                        const dynamicDescription = new Function("skill", `return \`${effectsInternal[internal].descriptionInternal}\`;`);
                        let rawDescription = dynamicDescription(item);
                        // Thay mọi số (bao gồm cả số thập phân) thành dấu ?
                        let hiddenDescription = rawDescription.replace(/\d+(\.\d+)?/g, '?');
                        hiddenDescription = hiddenDescription.replace(/\?mon/gi, '5mon');

                        internalInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countInternalInfo})</span> ${hiddenDescription}</span>`;
                        countInternalInfo += 1;
                    }
                });
            }

            //Chí mạng info
            let critInfo = `[Tỷ lệ chí mạng: <span style="color: red; font-weight: bold">???</span>]`;

            // Gán nội dung vào phần tử HTML
            if (descInfo !== "") {
                descTextItem +=
                    `<span style="font-weight: bold;margin-top: 5px;">[Kỹ năng chủ động][+Nộ: ???][Liên kích: ???]</span>
    <span style="display: flex;flex-direction: column; gap: 3px;">${descInfo.trim()}</span>
    <span>${critInfo.trim()}</span>`;
            } else {
                descTextItem += "";
            }

            if (internalInfo !== "") {
                descTextItem +=
                    `<span style="font-weight: bold;margin-top: 5px;">[Kỹ năng bị động]</span>
    <span style="display: flex;flex-direction: column; gap: 3px;">${internalInfo.trim()}</span>`
            } else {
                descTextItem += "";
            }

            //Sellup info
            let sellUpInfo = "";
            let countSellUpInfo = 1;
            if (item.SELLUP.length === 1) {
                item.SELLUP.forEach((sellup) => {
                    if (effectsSellUp[sellup]) {
                        // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                        const dynamicDescription = new Function("skill", `return \`${effectsSellUp[sellup].descriptionSellUp}\`;`);
                        let rawDescription = dynamicDescription(item);
                        // Thay mọi số (bao gồm cả số thập phân) thành dấu ?
                        let hiddenDescription = rawDescription.replace(/\d+(\.\d+)?/g, '?');
                        hiddenDescription = hiddenDescription.replace(/\?mon/gi, '5mon');

                        sellUpInfo += hiddenDescription
                    }
                });
            } else {
                item.SELLUP.forEach((sellup) => {
                    if (effectsSellUp[sellup]) {
                        // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                        const dynamicDescription = new Function("skill", `return \`${effectsSellUp[sellup].descriptionSellUp}\`;`);
                        let rawDescription = dynamicDescription(item);
                        // Thay mọi số (bao gồm cả số thập phân) thành dấu ?
                        let hiddenDescription = rawDescription.replace(/\d+(\.\d+)?/g, '?');
                        hiddenDescription = hiddenDescription.replace(/\?mon/gi, '5mon');

                        sellUpInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countSellUpInfo})</span> ${hiddenDescription}</span>`;
                        countSellUpInfo += 1;
                    }
                });
            }

            if (sellUpInfo !== "") {
                descTextItem += `<span style="font-weight: bold;margin-top: 5px;">[Thả đi nhận được]</span>
                <span style="display: flex;flex-direction: column; gap: 3px;">${sellUpInfo.trim()}</span>`;
            } else {
                descTextItem += "";
            }

            document.getElementById("popupDescExchange").innerHTML = descTextItem;


            document.getElementById("popupPriceExchange").textContent = `${item.ticketsPRICE} vé đổi`;
            // Kiểm tra nếu pet đã select chưa
            const hasEquipped = select5MonInSelectHunt.includes(item.ID);

            if (hasEquipped) {
                buttonBuy.innerHTML = "Bỏ lựa chọn";
                buttonBuy.style.background = "gray";
                buttonBuy.style.cursor = "not-allowed";
                buttonBuy.disabled = true;
                buttonBuy.onclick = () => {
                    select5MonInSelectHunt = select5MonInSelectHunt.filter(id => id !== item.ID);
                };
            } else {
                buttonBuy.innerHTML = "Lựa chọn";
                buttonBuy.style.background = "firebrick";
                buttonBuy.style.cursor = "pointer";
                buttonBuy.disabled = false;
                buttonBuy.onclick = () => {
                    select5MonInSelectHunt.push(item.ID);
                };
            }

            popup.style.display = "block";
            overlay.style.display = "block";
        });
    });

    // Đóng popup khi bấm nút đóng hoặc click vào nền mờ
    [overlay].forEach(element => {
        element.addEventListener("click", (event) => {
            if (popup.style.display === "block") {
                popup.style.display = "none";
                overlay.style.display = "none";
            }
        });
    });
}

let scaleGameScreen = 0;
function settingMap() {
    // Ghi lại phần trăm vị trí hiện tại của player trước khi map thay đổi
    const percentX = playerX / mapWidth;
    const percentY = playerY / mapHeight;

    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 1000;

    if (isMobile) {
        // Đảm bảo screenMain có kích thước chính xác khi xoay màn hình
        screenMain.style.height = "85vh";
        screenMain.style.width = "99%";

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Reset transform cho gameScreen trước khi tính toán
        gameScreen.style.transform = "scale(1)";
        gameScreen.style.transformOrigin = "left";

        const battleWidth = gameScreen.offsetWidth;
        const battleHeight = gameScreen.offsetHeight;

        let scaleW = screenWidth / battleWidth;
        let scaleH = screenHeight / battleHeight;

        scaleGameScreen = Math.min(scaleW, scaleH) * 0.98; // Tỷ lệ tối đa là 90%
        scaleGameScreen = Math.min(scaleGameScreen, 1); // Đảm bảo tỷ lệ không vượt quá 1

        // Áp dụng tỷ lệ cho gameScreen
        gameScreen.style.transform = `scale(${scaleGameScreen})`;
        gameScreen.style.transformOrigin = "center";

        // const marginLeft = (screenWidth - (battleWidth * scaleGameScreen)) / 2;
        // gameScreen.style.marginLeft = `${marginLeft}px`;
        // const marginTop = (screenHeight - (battleHeight * scaleGameScreen)) / 2;
        // gameScreen.style.marginTop = `${marginTop}px`;

    } else {
        // Nếu không phải trên thiết bị di động, sử dụng kích thước chuẩn
        gameScreen.style.transform = "scale(1)";
        gameScreen.style.transformOrigin = "center";
        gameScreen.style.marginLeft = null;
    }

    // Cập nhật lại các thông số kích thước map và player
    map.style.width = (viewport.offsetWidth * 2.5) + 'px';
    map.style.height = (viewport.offsetWidth * 2.5) + 'px';
    viewWidth = viewport.offsetWidth;
    viewHeight = viewport.offsetHeight;
    mapWidth = viewport.offsetWidth * 2.5;
    mapHeight = viewport.offsetWidth * 2.5;

    // Cập nhật kích thước của player và các yếu tố khác
    player.style.width = (mapWidth / 20) + "px";
    player.style.height = (mapWidth / 20) + "px";

    // Cập nhật lại kích thước của các Wild Pets
    document.querySelectorAll('.wildPet').forEach(el => {
        el.style.width = (mapWidth / 36) + "px";
        el.style.height = (mapWidth / 36) + "px";
    });

    // Cập nhật lại vị trí player dựa trên phần trăm đã lưu
    playerX = percentX * mapWidth;
    playerY = percentY * mapHeight;
    targetX = playerX;
    targetY = playerY;

    updateView();
    settingScreenBattle();
}

let scaleBattleScreen = 0;
function settingScreenBattle() {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 1000;

    if (isMobile) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Tính toán tỷ lệ và căn chỉnh cho battleScreen riêng biệt
        const battleWidth2 = battleScreen.offsetWidth;
        const battleHeight2 = battleScreen.offsetHeight;

        let scaleW2 = screenWidth / battleWidth2;
        let scaleH2 = screenHeight / battleHeight2;

        scaleBattleScreen = Math.min(scaleW2, scaleH2) * 1; // Tỷ lệ tối đa là 90%
        scaleBattleScreen = Math.min(scaleBattleScreen, 1); // Đảm bảo tỷ lệ không vượt quá 1

        // Áp dụng tỷ lệ và căn chỉnh lại battleScreen
        battleScreen.style.transform = `scale(${scaleBattleScreen})`;

        // // Tính toán marginLeft và marginTop để căn giữa
        // const marginLeft2 = (screenWidth - (battleWidth2 * scaleBattleScreen)) / 2;
        // battleScreen.style.marginLeft = `${marginLeft2}px`;

    } else {
        // Cần áp dụng tương tự cho battleScreen nếu cần
        battleScreen.style.transform = "scale(1)";
        battleScreen.style.marginLeft = null;
    }
}

window.onload = function () {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 1000;

    if (isMobile) {
        // Đảm bảo screenMain có kích thước chính xác khi xoay màn hình
        screenMain.style.height = "85vh";
        screenMain.style.width = "99%";

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Reset transform cho gameScreen trước khi tính toán
        gameScreen.style.transform = "scale(1)";
        gameScreen.style.transformOrigin = "left";

        const battleWidth = gameScreen.offsetWidth;
        const battleHeight = gameScreen.offsetHeight;

        let scaleW = screenWidth / battleWidth;
        let scaleH = screenHeight / battleHeight;

        let scale = Math.min(scaleW, scaleH) * 0.98; // Tỷ lệ tối đa là 90%
        scale = Math.min(scale, 1); // Đảm bảo tỷ lệ không vượt quá 1

        // Áp dụng tỷ lệ cho gameScreen
        gameScreen.style.transform = `scale(${scale})`;
        gameScreen.style.transformOrigin = "center";

        // const marginLeft = (screenWidth - (battleWidth * scale)) / 2;
        // gameScreen.style.marginLeft = `${marginLeft}px`;
        // const marginTop = (screenHeight - (battleHeight * scale)) / 2;
        // gameScreen.style.marginTop = `${marginTop}px`;

    } else {
        // Nếu không phải trên thiết bị di động, sử dụng kích thước chuẩn
        gameScreen.style.transform = "scale(1)";
        gameScreen.style.transformOrigin = "center";
        gameScreen.style.marginLeft = null;
    }

};

// Đảm bảo cập nhật kích thước khi thay đổi kích thước màn hình (bao gồm khi xoay màn hình)
let resizeTimeout;
window.addEventListener("resize", function () {
    clearTimeout(resizeTimeout);

    // Thiết lập thời gian chờ 200ms trước khi gọi lại settingMap() để tránh gọi quá nhiều
    resizeTimeout = setTimeout(function () {
        settingMap(); // Gọi lại settingMap để tính toán lại các giá trị kích thước khi xoay màn hình
    }, 200);
});


document.getElementById("toggleMenu").addEventListener("click", () => {
    if (document.getElementById("menuButtons1").style.display === "flex") {
        document.getElementById("menuButtons1").style.display = "none";
        document.getElementById("menuButtons2").style.display = "none";
        document.getElementById("toggleMenu").textContent = "Tính năng";
    } else {
        document.getElementById("menuButtons1").style.display = "flex";
        document.getElementById("menuButtons2").style.display = "flex";
        document.getElementById("toggleMenu").textContent = "Thu gọn";
    }
});

let animationId = null

map.addEventListener("click", function (event) {
    if (isAutoHunter) return;

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        moveStartTime = null;
    }

    const rect = map.getBoundingClientRect();

    // Tính toán tỉ lệ scale ngược lại
    const scaleX = map.offsetWidth / rect.width;
    const scaleY = map.offsetHeight / rect.height;

    // Điều chỉnh tọa độ click theo scale
    targetX = (event.clientX - rect.left) * scaleX;
    targetY = (event.clientY - rect.top) * scaleY;

    targetX = Math.max(0, Math.min(targetX, mapWidth - 20));
    targetY = Math.max(0, Math.min(targetY, mapHeight - 20));

    const marker = document.createElement("div");
    marker.className = "target-x";
    marker.textContent = "x";

    Object.assign(marker.style, {
        position: "absolute",
        color: "firebrick",
        fontWeight: "bold",
        fontSize: "18px",
        transform: "translate(-50%, -50%)",
        zIndex: "2",
        pointerEvents: "none",
        left: `${targetX}px`,
        top: `${targetY}px`
    });

    map.appendChild(marker);
    setTimeout(() => {
        map.removeChild(marker);
    }, timeMove);

    requestAnimationFrame(movePlayer);
});

function closeMap() {

    autoButton.textContent = "Tự động săn";
    autoButton.classList.remove("active");
    autoButton.style.border = "2px solid #ffffff40";
    autoButton.style.boxShadow = "1px 1px 1px 1px #961862";
    clearInterval(autoInterval); // Dừng lại khi tắt auto
    autoInterval = null;
    isAutoHunter = false;

    // Xóa sự kiện visibilitychange khi tắt auto
    document.removeEventListener("visibilitychange", changeTabWhenAutoMove);
}

let staminaDrain = 1; // Mỗi lần di chuyển trừ đi bao nhiêu staminaUser

let isAutoMoving = false;

function updateView() {
    const playerWidth = player.offsetWidth;
    const playerHeight = player.offsetHeight;

    player.style.left = (playerX - playerWidth / 2) + "px";
    player.style.top = (playerY - playerHeight / 2) + "px";

    let offsetX = Math.min(Math.max(0, playerX - viewWidth / 2), mapWidth - viewWidth);
    let offsetY = Math.min(Math.max(0, playerY - viewHeight / 2), mapHeight - viewHeight);

    map.style.left = -offsetX + "px";
    map.style.top = -offsetY + "px";
}

function updateStamina() {
    // Cập nhật thanh staminaUser: tính phần trăm và cập nhật
    let staminaPercentage = Math.max(0, Math.min(100, (staminaUser / 1000) * 100));
    staminaFill.style.width = `${staminaPercentage}%`; // Đảm bảo thanh staminaUser có chiều rộng đúng

    // Cập nhật hiển thị số staminaUser
    staminaText.textContent = `${staminaUser}/1000`;

    if (staminaUser <= 0) {
        staminaUser = 0;
        if (isAutoMoving) {
            toggleAutoMovement(); // Dừng auto di chuyển khi staminaUser hết
        }
    }
}

let startX, startY;
let moveStartTime = null;
let moveDuration = 1000; // ms
let timeMove = 1050;
let meet5Mon = false //Trạng thái gặp 5mon
let movedDistance = 0; //Biến lưu khoảng cách đã di chuyển

function movePlayer(timestamp) {
    if (!moveStartTime) {
        moveStartTime = timestamp;
        startX = playerX;
        startY = playerY;
    }

    if (meet5Mon) {
        // Ngắt animation ngay nếu đã gặp
        moveStartTime = null;
        animationId = null;
        movedDistance = 0;
        return;
    }

    let luckUp = 0
    if (staminaUser <= 0) {
        luckUp = 0.2;
    } else {
        luckUp = 0.4;
    }

    if (Object.values(userPet).length >= weightBagUser) {
        messageOpen('Tủ đồ đã đầy');
        return;
    }

    const elapsed = timestamp - moveStartTime;
    const progress = Math.min(elapsed / moveDuration, 1);

    let newX = startX + (targetX - startX) * progress;
    let newY = startY + (targetY - startY) * progress;

    // Tính khoảng cách đã đi kể từ lần update trước
    let dx = newX - playerX;
    let dy = newY - playerY;
    let distance = Math.sqrt(dx * dx + dy * dy);
    movedDistance += distance;

    // Cập nhật vị trí nhân vật
    playerX = newX;
    playerY = newY;

    // Flip trái/phải
    if (targetX < startX) {
        document.getElementById('playerHunter').style.transform = "scaleX(1)";
    } else if (targetX > startX) {
        document.getElementById('playerHunter').style.transform = "scaleX(-1)";
    }

    updateView();

    // Nếu đã di chuyển > 50px
    if (movedDistance >= 150) {
        movedDistance = 0;

        if (!isMeet5Mon) {
            staminaUser -= staminaDrain;
            updateStamina();
        }

        let rd5MonID = Math.random() * 100;
        if (rd5MonID <= luckyMeet5Mon) {
            meet5Mon = true;
            catch5Mon();
            if (staminaUser <= 0) {
                luckyMeet5Mon = 0;
            } else {
                luckyMeet5Mon = 5;
            }
        } else {
            luckyMeet5Mon += luckUp;
            if (staminaUser <= 0) {
                let rdSpawn5Mon = Math.random() * 100;
                if (rdSpawn5Mon <= 30) {
                    spawnRandomPets();
                }
            } else {
                spawnRandomPets();
            }
        }
    }

    // Tiếp tục animation nếu chưa đến đích
    if (progress < 1 && !meet5Mon) {
        animationId = requestAnimationFrame(movePlayer);
    } else {
        moveStartTime = null;
        animationId = null;
        playerX = targetX;
        playerY = targetY;
        movedDistance = 0;
        updateView();
    }
}

var list5MonMeet = []; //Danh sách sẽ gặp ở bản đồ hiện tại
var is5MonMeet = {};
var percentCatch5MonMeet = 0;
var isMeet5Mon = false
function catch5Mon() {
    if (isMeet5Mon) return;
    isMeet5Mon = true;

    //Dựa vào list5MonMeet để random
    if (list5MonMeet.length === 0) {
        console.warn("Không có 5Mon nào để bắt!");
        return;
    }

    // Random chỉ số ngẫu nhiên từ 0 đến list5MonMeet.length - 1
    const randomIndex = Math.floor(Math.random() * list5MonMeet.length);

    // Lấy ID 5Mon tương ứng
    const random5MonID = list5MonMeet[randomIndex];

    let e5mon = allPets.find(p => p.ID === random5MonID && Number(p.LEVEL) === 1);

    const rand = Math.random() * 100;
    let rare = '';
    if (rand < 0.5) rare = 'SSR';
    else if (rand < 1) rare = 'SS';
    else if (rand < 2) rare = 'S';
    else if (rand < 5) rare = 'A';
    else if (rand < 25) rare = 'B';
    else if (rand < 45) rare = 'C';
    else rare = 'D';

    const { sttMin: pointMin, sttMax: pointMax, max: maxPointUp } = rareStats1[rare];
    const randStat = () => Math.floor(Math.random() * (maxPointUp - 10 + 1)) + 10;

    let str, def, int, agi, luk, hp, total;

    let attempts = 0;
    do {
        str = randStat();
        def = randStat();
        int = randStat();
        agi = randStat();
        luk = randStat();
        hp = randStat();
        total = str + def + int + agi + luk + hp;
        attempts++;
    } while (
        (total > pointMax || total < pointMin) &&
        attempts < 1000
    );

    // const { min: minSTT, max: maxSTT } = rareStats[rare];

    // let str, def, int, agi, luk, hp, total;

    // do {
    //     total = Math.floor(Math.random() * (maxSTT - minSTT + 1)) + minSTT;

    //     str = Math.floor(Math.random() * (total + 1));
    //     def = Math.floor(Math.random() * (total + 1));
    //     int = Math.floor(Math.random() * (total + 1));
    //     agi = Math.floor(Math.random() * (total + 1));
    //     luk = Math.floor(Math.random() * (total + 1));
    //     hp = Math.floor(Math.random() * (total + 1));

    // } while ((str + def + int + agi + luk + hp > total)
    // || str < 10 || def < 10 || int < 10 || agi < 10 || luk < 10 || hp < 30
    // || str > 250 || def > 250 || int > 250 || agi > 250 || luk > 250 || hp > 250
    // || str + def + int + agi + luk + hp > maxSTT
    //     || str + def + int + agi + luk + hp < minSTT
    // );

    //Lấy ID5mon mới
    let maxID = 0;
    for (let key in userPet) {
        let numberPart = parseInt(key.slice(-6)); // Lấy 6 số cuối
        if (numberPart > maxID) {
            maxID = numberPart;
        }
    }
    // Tăng lên 1 để dùng làm ID mới
    let newNumber = (maxID + 1).toString().padStart(6, '0'); // Giữ 6 chữ số
    let newID = `${username}ID${newNumber}`;

    //Quy đổi sang DAME HEAL SHIELD BURN POISON COOLDOWN
    let powerINT = scalePower5Mon(int);

    let dame = 0, heal = 0, shield = 0, burn = 0, poison = 0;

    // Áp dụng scaleSTR vào các phép tính hiệu ứng
    if (e5mon.EFFECT.includes("Attacking")) {
        dame = Math.round(powerINT.dame * e5mon.POWER.SCALE);  // Giảm dần khi STR tăng
    }
    if (e5mon.EFFECT.includes("Healing")) {
        heal = Math.round(powerINT.heal * e5mon.POWER.SCALE);  // Giảm dần khi STR tăng
    }
    if (e5mon.EFFECT.includes("Shield")) {
        shield = Math.round(powerINT.shield * e5mon.POWER.SCALE);  // Giảm dần khi STR tăng
    }
    if (e5mon.EFFECT.includes("Burn")) {
        burn = Math.round(powerINT.burn * e5mon.POWER.SCALE);  // Giảm dần khi STR tăng
    }
    if (e5mon.EFFECT.includes("Poison")) {
        poison = Math.round(powerINT.poison * e5mon.POWER.SCALE);  // Giảm dần khi STR tăng
    }

    //Tính cooldown
    let minC = 8;
    let maxC = 20;

    let scaleC = Math.max(5, 170 - Math.floor((agi - 200) / 9)); // giảm dần, min là 5

    let valueC = ((maxC - minC) / (1 + agi / scaleC) * 1000) * (2 - e5mon.POWER.SCALE);


    //tính crit
    let maxCrit = 60;
    let scaleCrit = 1500; // tùy chỉnh
    let valueCrit = maxCrit * luk / (luk + scaleCrit);
    valueCrit = Math.min(maxCrit, Math.max(0, valueCrit));
    valueCrit = Math.round(valueCrit * e5mon.POWER.SCALE);

    //tính def
    let maxDef = 90;
    let scaleDef = 475; // tùy chỉnh
    let valueDef = maxDef * def / (def + scaleDef);
    valueDef = Math.min(maxDef, Math.max(0, valueDef));
    valueDef = Math.round(valueDef * e5mon.POWER.SCALE);

    //Gán info vào 5mon
    is5MonMeet = {
        IDcreate: newID,
        ID: e5mon.ID,
        LEVEL: 1,
        NAME: e5mon.NAME,
        POWER: { STR: str, DEF: def, INT: int, AGI: agi, LUK: luk, HP: hp, SCALE: e5mon.POWER.SCALE },
        TYPE: e5mon.TYPE,
        SELLUP: e5mon.SELLUP,
        INTERNAL: e5mon.INTERNAL,
        EFFECT: e5mon.EFFECT,
        URLimg: e5mon.URLimg,
        DAME: [dame, 0, 0, 0, 0, 0],
        DEF: [Math.round(valueDef * 100) / 100, 0, 0, 0, 0, 0],
        HEAL: [heal, 0, 0, 0, 0, 0],
        SHIELD: [shield, 0, 0, 0, 0, 0],
        BURN: [burn, 0, 0, 0, 0, 0],
        POISON: [poison, 0, 0, 0, 0, 0],
        CRIT: [Math.round(valueCrit * 100) / 100, 0, 0, 0, 0, 0],
        COOLDOWN: [Math.ceil(valueC), e5mon.COOLDOWN[1], 0, 0, 0, 0],
        RARE: rare,
        PRICE: e5mon.PRICE
    }


    // Hiển thị popup
    let URLimg = is5MonMeet.URLimg[`Lv${is5MonMeet.LEVEL}`] || is5MonMeet.URLimg['Lv1'];
    
    document.getElementById("imgPopupSTT5MonMeet").style.backgroundImage = "url('" + URLimg + "')";
    document.getElementById("namePopupSTT5MonMeet").textContent = is5MonMeet.NAME;
    document.getElementById("allStats5MonMeet").textContent = `⚔️: ${is5MonMeet.POWER.STR + is5MonMeet.POWER.DEF + is5MonMeet.POWER.INT + is5MonMeet.POWER.AGI + is5MonMeet.POWER.LUK + is5MonMeet.POWER.HP}`;
    document.getElementById("rareTextPopupSTT5MonMeet").textContent = `${is5MonMeet.RARE}`;
    document.getElementById("rareTextPopupSTT5MonMeet").textContent = `${is5MonMeet.RARE}`;
    document.getElementById("priceTextPopupMeet5Mon").textContent = `${is5MonMeet.PRICE}`;
    
    for (let k = 1; k <= 4; k++) {
        document.getElementById(`popupMeet5MonLV${k}`).style.background = "firebrick";
    }

    document.getElementById(`popupMeet5MonLV${is5MonMeet.LEVEL}`).style.background = "rebeccapurple";

    for (let s = 1; s <= 4; s++) {
        const el = document.getElementById(`popupMeet5MonLV${s}`);
        if (!el) continue;
        el.onclick = () => {
            
            let URLimg = is5MonMeet.URLimg[`Lv${is5MonMeet.LEVEL}`] || is5MonMeet.URLimg['Lv1'];

            document.getElementById("imgPopupSTT5MonMeet").style.backgroundImage = "url('" + URLimg + "')";

            for (let k = 1; k <= 4; k++) {
                document.getElementById(`popupMeet5MonLV${k}`).style.background = "firebrick";
            }
            
            el.style.background = "rebeccapurple";


            const powerStatsSTR = updateStatWhenLevelUp(is5MonMeet, s, 'str');
            const powerStatsDEF = updateStatWhenLevelUp(is5MonMeet, s, 'def');
            const powerStatsINT = updateStatWhenLevelUp(is5MonMeet, s, 'int');
            const powerStatsAGI = updateStatWhenLevelUp(is5MonMeet, s, 'agi');
            const powerStatsLUK = updateStatWhenLevelUp(is5MonMeet, s, 'luk');
            const powerStatsHP = updateStatWhenLevelUp(is5MonMeet, s, 'hp');
            
            let strA, defA, intA, agiA, lukA, hpA, allStat;
            strA = Math.round(str + powerStatsSTR)
            defA = Math.round(def + powerStatsDEF)
            intA = Math.round(int + powerStatsINT)
            agiA = Math.round(agi + powerStatsAGI)
            lukA = Math.round(luk + powerStatsLUK)
            hpA = Math.round(hp + powerStatsHP)

            allStat = strA + defA + intA + agiA + lukA + hpA

            document.getElementById("allStats5MonMeet").textContent = `⚔️: ${allStat}`
        };
    }

    
    let descTextItem = "";
    // Type
    let typeInfo = "";
    is5MonMeet.TYPE.forEach(type => {
        typeInfo += `<a style=" background: rebeccapurple; padding: 2px 4px; border-radius: 4px; color: #ffffff;">${type}</a>`;
    });

    // Cập nhật thông tin trong popup
    descTextItem += `
<div style="display: flex; justify-content: space-between; flex-direction: row; align-items: center; width: 100%">
<div style="display: flex; justify-content: space-between; flex-direction: row; align-items: center; gap: 3px; width: 100%">
    <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-hand-fist"></i>: ??</span>
    <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-shield"></i>: ??</span>
    <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-brain"></i>: ??</span>
    <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-bolt"></i></i>: ??</span>
    <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-clover"></i>: ??</span>
    <span style="background: #cd9161; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; color: #ffffff; text-shadow: 1px 1px 1px #4f290c;"><i class="fa-solid fa-heart"></i>: ??</span>
</div>
</div>`


    descTextItem += `
    <span style="display: flex;font-weight: bold;font-size: 12px;padding: 2px 0px;color: black;gap: 5px;flex-direction: row;align-content: center;
    justify-content: space-between;align-items: center; width: 100%;">
    <span>
        [Máu: <a style="color:red; font-weight: bold;">???</a>]
    </span>
    <span style="display: flex; gap: 5px;">
        <span style="display: flex; gap: 3px; flex-direction: row; align-content: center; justify-content: center; align-items: center;">
            ${typeInfo}
        </span>
    </span>
    </span>
    <span style="font-weight: bold;margin-top: 5px;">[Đánh thường][Tốc độ: ??? giây][Liên kích: ???]</span>
    <span>Gây <a style="color: red; font-weight: bold">??? sát thương </a> cho 5Mon đối thủ (ưu tiên 5Mon đối diện)</span>
    `

    let descInfo = "";
    let countDescInfo = 1;
    if (is5MonMeet.EFFECT.length === 1) {
        is5MonMeet.EFFECT.forEach((effect) => {
            if (effectsSkill[effect]) {
                // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                const dynamicDescription = new Function("skill", `return \`${effectsSkill[effect].descriptionSkill}\`;`);

                let rawDescription = dynamicDescription(is5MonMeet);

                // Thay thế mọi sự xuất hiện của -Infinity bằng dấu ?
                let hiddenDescription = rawDescription.replace(/-Infinity/g, '?');

                // Tiếp tục thay thế các số (bao gồm cả số thập phân) thành dấu ?
                hiddenDescription = hiddenDescription.replace(/\d+(\.\d+)?/g, '?');

                // Thay thế "mon" bằng "5mon" nếu có
                hiddenDescription = hiddenDescription.replace(/\?mon/gi, '5mon');

                // Bây giờ hiddenDescription đã được cập nhật với các thay thế

                descInfo += hiddenDescription
            }
        });
    } else {
        is5MonMeet.EFFECT.forEach((effect) => {
            if (effectsSkill[effect]) {
                // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                const dynamicDescription = new Function("skill", `return \`${effectsSkill[effect].descriptionSkill}\`;`);
                let rawDescription = dynamicDescription(is5MonMeet);

                // Thay thế mọi sự xuất hiện của -Infinity bằng dấu ?
                let hiddenDescription = rawDescription.replace(/-Infinity/g, '?');

                // Tiếp tục thay thế các số (bao gồm cả số thập phân) thành dấu ?
                hiddenDescription = hiddenDescription.replace(/\d+(\.\d+)?/g, '?');

                // Thay thế "mon" bằng "5mon" nếu có
                hiddenDescription = hiddenDescription.replace(/\?mon/gi, '5mon');

                // Bây giờ hiddenDescription đã được cập nhật với các thay thế

                descInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countDescInfo})</span> ${hiddenDescription}</span>`;
                countDescInfo += 1;
            }
        });
    }

    let internalInfo = "";
    let countInternalInfo = 1;
    if (is5MonMeet.INTERNAL.length === 1) {
        is5MonMeet.INTERNAL.forEach((internal) => {
            if (effectsInternal[internal]) {
                // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                const dynamicDescription = new Function("skill", `return \`${effectsInternal[internal].descriptionInternal}\`;`);

                let rawDescription = dynamicDescription(is5MonMeet);

                // Thay mọi số (bao gồm cả số thập phân) thành dấu ?
                let hiddenDescription = rawDescription.replace(/\d+(\.\d+)?/g, '?');
                hiddenDescription = hiddenDescription.replace(/\?mon/gi, '5mon');

                internalInfo += hiddenDescription
            }
        });
    } else {
        is5MonMeet.INTERNAL.forEach((internal) => {
            if (effectsInternal[internal]) {
                // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                const dynamicDescription = new Function("skill", `return \`${effectsInternal[internal].descriptionInternal}\`;`);
                let rawDescription = dynamicDescription(is5MonMeet);

                // Thay mọi số (bao gồm cả số thập phân) thành dấu ?
                let hiddenDescription = rawDescription.replace(/\d+(\.\d+)?/g, '?');
                hiddenDescription = hiddenDescription.replace(/\?mon/gi, '5mon');

                internalInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countInternalInfo})</span> ${hiddenDescription}</span>`;
                countInternalInfo += 1;
            }
        });
    }

    //Chí mạng info
    let critPercent = is5MonMeet.CRIT.reduce((a, b) => a + b, 0)
    let critInfo = ""
    if (critPercent > 0) {
        critInfo = `[Tỷ lệ chí mạng: <span style="color: red; font-weight: bold"> ??? </span>]`;
    }
    // Gán nội dung vào phần tử HTML
    if (descInfo !== "") {
        descTextItem +=
            `<span style="font-weight: bold; margin-top: 5px;">[Kỹ năng chủ động][+Nộ: ???][Liên kích: ???]</span>
<span style="display: flex;flex-direction: column; gap: 3px;">${descInfo.trim()}</span>
<span>${critInfo.trim()}</span>`;
    } else {
        descTextItem += "";
    }

    if (internalInfo !== "") {
        descTextItem +=
            `<span style="font-weight: bold; margin-top: 5px;">[Kỹ năng bị động]</span>
<span style="display: flex;flex-direction: column; gap: 3px;">${internalInfo.trim()}</span>`
    } else {
        descTextItem += "";
    }

    //Sellup info
    let sellUpInfo = "";
    let countSellUpInfo = 1;
    if (is5MonMeet.SELLUP.length === 1) {
        is5MonMeet.SELLUP.forEach((sellup) => {
            if (effectsSellUp[sellup]) {
                // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                const dynamicDescription = new Function("skill", `return \`${effectsSellUp[sellup].descriptionSellUp}\`;`);
                let rawDescription = dynamicDescription(is5MonMeet);

                // Thay mọi số (bao gồm cả số thập phân) thành dấu ?
                let hiddenDescription = rawDescription.replace(/\d+(\.\d+)?/g, '?');
                hiddenDescription = hiddenDescription.replace(/\?mon/gi, '5mon');

                sellUpInfo += hiddenDescription
            }
        });
    } else {
        is5MonMeet.SELLUP.forEach((sellup) => {
            if (effectsSellUp[sellup]) {
                // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
                const dynamicDescription = new Function("skill", `return \`${effectsSellUp[sellup].descriptionSellUp}\`;`);
                let rawDescription = dynamicDescription(is5MonMeet);

                // Thay mọi số (bao gồm cả số thập phân) thành dấu ?
                let hiddenDescription = rawDescription.replace(/\d+(\.\d+)?/g, '?');
                hiddenDescription = hiddenDescription.replace(/\?mon/gi, '5mon');

                sellUpInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countSellUpInfo})</span> ${hiddenDescription}</span>`;
                countSellUpInfo += 1;
            }
        });
    }

    if (sellUpInfo !== "") {
        descTextItem += `<span style="font-weight: bold; margin-top: 5px;">[Thả đi nhận được]</span>
<span style="display: flex;flex-direction: column; gap: 3px;">${sellUpInfo.trim()}</span>`;
    } else {
        descTextItem += "";
    }

    const ranges = [
        { min: 1, max: 5, weight: 1 },    // nhiều nhất
        { min: 5, max: 10, weight: 1 },
        { min: 10, max: 15, weight: 1 },
        { min: 15, max: 20, weight: 2 },
        { min: 20, max: 25, weight: 8 },
        { min: 25, max: 30, weight: 7 },
        { min: 30, max: 35, weight: 6 },
        { min: 35, max: 40, weight: 5 },
        { min: 40, max: 45, weight: 20 },
        { min: 45, max: 50, weight: 15 },
        { min: 50, max: 55, weight: 12 },
        { min: 55, max: 60, weight: 10 },
        { min: 60, max: 65, weight: 4 },
        { min: 65, max: 70, weight: 3 },
        { min: 70, max: 75, weight: 2 },
        { min: 75, max: 80, weight: 1 },
        { min: 80, max: 85, weight: 1 },
        { min: 85, max: 90, weight: 0.5 },
        { min: 90, max: 95, weight: 0.5 },
        { min: 95, max: 100, weight: 0.5 }
    ];


    const totalWeight = ranges.reduce((sum, r) => sum + r.weight, 0);
    const random = Math.random() * totalWeight;

    let cumulative = 0;
    for (const range of ranges) {
        cumulative += range.weight;
        if (random < cumulative) {
            // Trả ra một số ngẫu nhiên trong khoảng đó
            percentCatch5MonMeet = Math.random() * (range.max - range.min) + range.min;
            break;
        }
    }

    let roundedPercent = percentCatch5MonMeet.toFixed(1); // làm tròn 1 chữ số sau dấu phẩy

    document.getElementById("percentCatch5MonMeet").textContent = `Tỷ lệ bắt: ${roundedPercent}%`;

    document.getElementById("descPopupSTT5MonMeet").innerHTML = descTextItem;
    document.getElementById("popupMeet5Mon").style.display = "block";
    document.getElementById("popupOverlay").style.display = "block";

}

function catch5MonMeet() {

    if (!userPet) {
        userPet = {}; // Nếu chưa có, tạo mới userPet là một đối tượng trống
    }

    let doneCatch = Math.random() * 100;
    console.log("doneCatch", doneCatch, "percentCatch5MonMeet", percentCatch5MonMeet)
    if (doneCatch > percentCatch5MonMeet) {
        messageOpen('Tiếc quá 5Mon đã chạy mất rồi!!!')
    } else {
        userPet[is5MonMeet.IDcreate] = is5MonMeet;
        console.log("5mon catch được", userPet[is5MonMeet.IDcreate])
        messageOpen(`Bắt thành công pet ${is5MonMeet.NAME}`);
    }

    resetGoldAndTicket();
    meet5Mon = false;

    //reset các biến bắt 5mon về rỗng
    is5MonMeet = {};
    percentCatch5MonMeet = 0;
    isMeet5Mon = false;

    document.getElementById("popupMeet5Mon").style.display = "none";
    document.getElementById("popupOverlay").style.display = "none";
}

function closePopupMeet5Mon() {
    if (isAutoHunter) {
        meet5Mon = false
        document.getElementById("popupMeet5Mon").style.display = "none";
        document.getElementById("popupOverlay").style.display = "none";
        messageOpen(`Đã thả ${is5MonMeet.NAME}`);
    } else {
        meet5Mon = false
        document.getElementById("popupMeet5Mon").style.display = "none";
        document.getElementById("popupOverlay").style.display = "none";
        messageOpen(`Đã thả ${is5MonMeet.NAME}`);
    }
    resetGoldAndTicket();

    //reset các biến bắt 5mon về rỗng
    is5MonMeet = {};
    percentCatch5MonMeet = 0;
    isMeet5Mon = false;
}


let isAutoHunter = false; //Trạng thái đang auto
let timeMoveAuto = 2000;
let autoInterval;

//Tự động săn 5Mon
function toggleAutoMovement() {
    if (staminaUser <= 0) {
        messageOpen('Hết thể lực')
        autoButton.textContent = "Tự động săn";
        autoButton.classList.remove("active");
        autoButton.style.border = "2px solid #ffffff40";
        autoButton.style.boxShadow = "1px 1px 1px 1px #961862";

        clearInterval(autoInterval); // Dừng lại khi tắt auto
        autoInterval = null;
        isAutoHunter = false;

        // Xóa sự kiện visibilitychange khi tắt auto
        document.removeEventListener("visibilitychange", changeTabWhenAutoMove);
        return;
    }


    isAutoMoving = !isAutoMoving;
    isAutoHunter = true;
    meet5Mon = false;

    if (isAutoMoving) {
        autoButton.textContent = "Ngừng lại";
        autoButton.classList.add("active");
        autoButton.style.border = "2px solid #ed776f";
        autoButton.style.boxShadow = "1px 1px 1px 1px #7b231d";

        // Lắng nghe sự kiện chuyển tab
        document.addEventListener("visibilitychange", changeTabWhenAutoMove);

        autoInterval = setInterval(() => {
            // Giới hạn mục tiêu trong phạm vi viewport
            let offsetX = Math.min(Math.max(0, playerX - viewWidth / 2), mapWidth - viewWidth);
            let offsetY = Math.min(Math.max(0, playerY - viewHeight / 2), mapHeight - viewHeight);

            let minX = offsetX;
            let maxX = offsetX + viewWidth - 20;
            let minY = offsetY;
            let maxY = offsetY + viewHeight - 20;

            targetX = Math.floor(Math.random() * (maxX - minX) + minX);
            targetY = Math.floor(Math.random() * (maxY - minY) + minY);

            // Nếu gặp 5Mon dừng lại
            if (!canClick || meet5Mon || document.getElementById("popupBag").classList.contains("showDiv")) return; // Nếu không thể click, không di chuyển

            canClick = false; // Đặt canClick = false khi bắt đầu di chuyển
            requestAnimationFrame(movePlayer); // Di chuyển người chơi

            // Sau khi di chuyển, cho phép click lại
            setTimeout(() => {
                canClick = true;
            }, timeMove);
        }, timeMoveAuto); // Mỗi .. giây chọn vị trí mới
    } else {
        autoButton.textContent = "Tự động săn";
        autoButton.classList.remove("active");
        autoButton.style.border = "2px solid #ffffff40";
        autoButton.style.boxShadow = "1px 1px 1px 1px #961862";

        clearInterval(autoInterval); // Dừng lại khi tắt auto
        autoInterval = null;
        isAutoHunter = false;

        // Xóa sự kiện visibilitychange khi tắt auto
        document.removeEventListener("visibilitychange", changeTabWhenAutoMove);
    }
}

// Hàm xử lý khi chuyển tab
function changeTabWhenAutoMove() {
    if (document.hidden) {
        clearInterval(autoInterval); // Dừng lại khi tab không còn hiển thị
        autoInterval = null;
        stopStaminaRegen();
        isAutoMoving = false;
        isAutoHunter = false;
        autoButton.textContent = "Tự động săn"; // Đổi lại trạng thái của nút
        autoButton.classList.remove("active");
        autoButton.style.border = "2px solid #ffffff40";
        autoButton.style.boxShadow = "1px 1px 1px 1px #961862";
    }
}

function showUpStamina() {

    if (staminaUser >= 1000) {
        messageOpen("Bạn đang rất xung mãn rồi!")
        return;
    }

    // Xóa nếu đã tồn tại popup cũ
    const oldPopup = document.getElementById('popupOverlayStamina');
    if (oldPopup) {
        oldPopup.remove();
        oldPopup = null;
    }

    // Tạo lớp nền mờ
    const overlay = document.createElement('div');
    overlay.id = 'popupOverlayStamina';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 9999;
    overlay.style.animation = 'fadeIn 0.3s ease';

    // Tạo hộp popup
    const popup = document.createElement('div');
    popup.style.backgroundColor = '#fff';
    popup.style.padding = '25px 30px';
    popup.style.borderRadius = '12px';
    popup.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
    popup.style.textAlign = 'center';
    popup.style.maxWidth = '300px';
    popup.style.fontFamily = 'sans-serif';
    popup.style.animation = 'slideUp 0.3s ease';

    popup.innerHTML = `
        <p style="font-size: 16px; margin-bottom: 20px;">Dùng <strong>10 kim cương</strong> để nhận <strong>10 thể lực</strong>?</p>
        <div style="display: flex; justify-content: center; gap: 10px;">
            <button id="confirmBtn" style="
                padding: 8px 16px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                transition: background-color 0.2s;
            ">Đồng ý</button>
            <button id="cancelBtn" style="
                padding: 8px 16px;
                background-color: #f44336;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                transition: background-color 0.2s;
            ">Hủy</button>
        </div>
    `;

    // Gắn popup vào overlay
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Hiệu ứng CSS
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        #confirmBtn:hover {
            background-color: #45a049;
        }
        #cancelBtn:hover {
            background-color: #e53935;
        }
    `;
    document.head.appendChild(style);

    // Xử lý sự kiện nút
    document.getElementById('confirmBtn').onclick = function () {
        upStamina();
        document.body.removeChild(overlay);
    };
    document.getElementById('cancelBtn').onclick = function () {
        document.body.removeChild(overlay);
    };
}



function upStamina() {
    if (diamondUser < 10) {
        messageOpen('Không đủ kim cương')
        return;
    } else {
        staminaUser += 100
        if (staminaUser > 1000) staminaUser = 1000;

        updateStamina();
        resetGoldAndTicket();
    }
}

// ---- tạo ra 5Mon random xuất hiện ---- //
let count5MonSpawn = 0;
function spawnRandomPets() {
    const mapWidth = map.offsetWidth;
    const mapHeight = map.offsetHeight;
    let spawn5Mon = Math.random() * 100
    let percentSeen5Mon = 0
    if (staminaUser <= 0) {
        percentSeen5Mon = 5
    } else {
        percentSeen5Mon = 20
    }
    if (spawn5Mon < percentSeen5Mon && count5MonSpawn < 20) {
        count5MonSpawn += 1
        const pet = document.createElement("img");
        pet.src = "https://res.cloudinary.com/dxgawkr4g/image/upload/v1744969937/mt66cdg95hhpgv5uammj.gif";
        pet.className = "wildPet";
        const x = Math.random() * (mapWidth - 32);
        const y = Math.random() * (mapHeight - 32);
        pet.style.left = x + "px";
        pet.style.top = y + "px";
        pet.addEventListener("click", () => click5MonMeet(pet));
        map.appendChild(pet);
        movePetSmoothly(pet, mapWidth, mapHeight);
    }
}

function click5MonMeet(pet) {
    pet.classList.add("pet-catching");
    count5MonSpawn -= 1
    meet5Mon = true;
    catch5Mon();
    setTimeout(() => {
        pet.remove();
        pet = null;
    }, 800);
}

function movePetSmoothly(pet, mapWidth, mapHeight) {
    function move() {
        const currentX = parseFloat(pet.style.left);
        const currentY = parseFloat(pet.style.top);

        const maxDistance = 200;
        let offsetX = (Math.random() - 0.5) * 2 * maxDistance;
        let offsetY = (Math.random() - 0.5) * 2 * maxDistance;

        let targetX = currentX + offsetX;
        let targetY = currentY + offsetY;

        targetX = Math.max(0, Math.min(mapWidth - 32, targetX));
        targetY = Math.max(0, Math.min(mapHeight - 32, targetY));

        // 👉 Flip hình ảnh nếu di chuyển sang trái hoặc phải
        if (targetX < currentX) {
            pet.style.transform = "scaleX(1)";
        } else {
            pet.style.transform = "scaleX(-1)";
        }

        pet.style.left = targetX + "px";
        pet.style.top = targetY + "px";

        setTimeout(move, 2000 + Math.random() * 2000);
    }

    move(); // Bắt đầu lần đầu
}

function scalePower5Mon(INT) {
    const baseScale = 1;
    const scaleINT = baseScale * Math.log10(INT);
    let valuePower = (1 + INT / scaleINT)/Math.log10(INT*2)

    let dame = 0, heal = 0, shield = 0, burn = 0, poison = 0

    dame = Math.round(valuePower * 2)
    heal = Math.round(valuePower * 2)
    shield = Math.round(valuePower * 2)
    burn = Math.round(valuePower * 0.21)
    poison = Math.round(valuePower * 0.18)

    return { dame, heal, shield, burn, poison }
}

function hideOrShowInfoGoldDiamond() {
    if (document.getElementById('infoGoldDiamond').style.display === "none") {
        document.getElementById('infoGoldDiamond').style.display = "flex";
        document.getElementById('hideOrShowInfoGoldDiamond').style.transform = 'scaleY(1)';
    } else {
        document.getElementById('infoGoldDiamond').style.display = "none";
        document.getElementById('hideOrShowInfoGoldDiamond').style.transform = 'scaleY(-1)';
    }
}

//Audio

//Audio background
const musicBGList = [
    "https://res.cloudinary.com/dxgawkr4g/video/upload/v1745397379/c4nt9wtsye3xfxtcy1li.mp3",
    "https://res.cloudinary.com/dxgawkr4g/video/upload/v1745397475/tzum1m4pokm4wzysapnj.mp3",
    "https://res.cloudinary.com/dxgawkr4g/video/upload/v1745397509/ojwtdwrrntlqrohhky4z.mp3",
    "https://res.cloudinary.com/dxgawkr4g/video/upload/v1745398510/dhe1luws4cwzgoxnj2oi.mp3"
];

const audio = document.getElementById("bgMusic");
let lastPlayedIndex = -1;
const volumeTarget = 0.2;
const fadeDuration = 2000;
let musicBGIsPlay = false;

function getRandomIndexExcept(exceptIndex) {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * musicBGList.length);
    } while (musicBGList.length > 1 && newIndex === exceptIndex);
    return newIndex;
}

function fadeVolume(target, duration, callback) {
    const step = 50;
    const diff = (target - audio.volume) / (duration / step);
    let interval = setInterval(() => {
        audio.volume = Math.max(0, Math.min(1, audio.volume + diff));
        if ((diff > 0 && audio.volume >= target) || (diff < 0 && audio.volume <= target)) {
            clearInterval(interval);
            interval = null;
            if (callback) callback();
        }
    }, step);
}

function playRandomMusic() {
    if (musicBGIsPlay) return; // Tránh gọi trùng

    const index = getRandomIndexExcept(lastPlayedIndex);
    lastPlayedIndex = index;
    audio.src = musicBGList[index];
    audio.volume = 0.0;

    audio.play().then(() => {
        fadeVolume(volumeTarget, fadeDuration);
        musicBGIsPlay = true;
    }).catch((err) => {
        console.log("Cần tương tác người dùng:", err);
    });
}

// Khi nhạc kết thúc
audio.addEventListener("ended", () => {
    fadeVolume(0.0, fadeDuration, () => {
        musicBGIsPlay = false;
        playRandomMusic();
    });
});

// Lắng nghe click để kiểm tra và phát nhạc nếu chưa chạy
document.addEventListener("click", () => {
    if (!musicBGIsPlay) {
        playRandomMusic();
    }
});

window.addEventListener("load", playRandomMusic);

// Cập nhật volume khi kéo slider
const volumeControlBG = document.getElementById("volumeControlBG");
const toggleMusicBtnBG = document.getElementById("toggleMusicBG");

volumeControlBG.addEventListener("input", (e) => {
    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    if (newVolume === 0) {
        toggleMusicBtnBG.textContent = "🔇";
    } else {
        toggleMusicBtnBG.textContent = "🔊";
    }
});

// Tắt/bật nhạc khi bấm nút
toggleMusicBtnBG.addEventListener("click", () => {
    if (audio.muted) {
        audio.muted = false;
        toggleMusicBtnBG.textContent = "🔊";
    } else {
        audio.muted = true;
        toggleMusicBtnBG.textContent = "🔇";
    }
});


//Audio click
const clickAudio = document.getElementById("clickSound");
const volumeControlClick = document.getElementById("volumeControlClick");
const toggleMusicClick = document.getElementById("toggleMusicClick");

clickAudio.volume = parseFloat(volumeControlClick.value);
let clickSoundMuted = false;

// Phát âm thanh khi click button
document.addEventListener("click", function (e) {
    const isButton = e.target.tagName.toLowerCase() === "button" || e.target.closest("button");
    if (isButton && !clickSoundMuted) {
        clickAudio.currentTime = 0;
        clickAudio.play().catch(() => { });
    }
});

// Điều chỉnh âm lượng click
volumeControlClick.addEventListener("input", () => {
    const volume = parseFloat(volumeControlClick.value);
    clickAudio.volume = volume;
    clickSoundMuted = volume === 0;
    toggleMusicClick.textContent = volume === 0 ? "🔇" : "🔊";
});

toggleMusicClick.addEventListener("click", () => {
    const audio = document.getElementById("clickSound");
    clickSoundMuted = !clickSoundMuted;
    if (audio.muted) {
        audio.muted = false;
        toggleMusicClick.textContent = "🔊";
    } else {
        audio.muted = true;
        toggleMusicClick.textContent = "🔇";
    }
});

//Chặn người dùng bôi đen, copy, f12
// // Chặn chuột phải
// document.addEventListener("contextmenu", e => e.preventDefault());

// Chặn copy
document.addEventListener("copy", e => e.preventDefault());

// Chặn bôi đen
document.addEventListener("selectstart", e => e.preventDefault());

// Chặn phím F12, Ctrl+Shift+I/J, Ctrl+U
document.addEventListener("keydown", function (e) {
    if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
        (e.ctrlKey && e.key === "U") ||
        (e.ctrlKey && e.key === "S")
    ) {
        e.preventDefault();
    }
});

//Hàm tính scale mỗi khi nâng cấp level
function getScaleLevelUp(power) {
    return 1 + ((power - 10) / (100 - 10));  // nội suy từ 1 → 2
}

// //Hàm load slot lock
// function loadSlotLock() {
//     let slotLock = typeGameConquest.slotLock || {
//         skill1B: false,
//         skill2B: false,
//         skill3B: true,
//         skill4B: true,
//         skill5B: true,
//         skill6B: true,
//         skill7B: true,
//         skill8B: true,
//         skill9B: true
//     };

//     Object.keys(slotLock).forEach(key => {
//         const slot = document.getElementById(`${key}`);
//         if (slotLock[key] === true) {
//             const lock = document.createElement("div");
//             lock.id = `${key}Lock`; // Thêm ID để truy cập dễ dàng
//             lock.className = "slotLock"
//             lock.style.fontSize = "30px";
//             lock.style.color = "rosybrown"
//             lock.style.zIndex = "1";
//             lock.style.textAlign = "center";
//             lock.innerHTML = `<i class="fa-solid fa-lock"></i>`;
//             slot.appendChild(lock); // Thêm vào DOM
//         } else {
//             const existingLock = slot.querySelector(".slotLock");
//             if (existingLock) {
//                 slot.removeChild(existingLock);
//             }
//         }
//     });
// }



// Gán các hàm vào window
window.switchTabWelcomPage = switchTabWelcomPage;
window.register = register;
window.openRankBoard = openRankBoard;
window.loadQuest = loadQuest;
window.showOrHiddenDiv = showOrHiddenDiv;
window.changePage = changePage;
window.gacha5Mon = gacha5Mon;
window.checkButtonTypeGame = checkButtonTypeGame;
window.checkButtonModeGame = checkButtonModeGame;
window.checkButtonDifficultyGame = checkButtonDifficultyGame;
window.startGame = startGame;
window.openQuestBoard = openQuestBoard;
window.openBag = openBag;
window.openMenuStartGame = openMenuStartGame;
window.openPaymentGateway = openPaymentGateway;
window.reRollShop = reRollShop;
window.nextStepGame1 = nextStepGame1;
window.openPopupSetting = openPopupSetting;
window.closePopupContinueGame = closePopupContinueGame;
window.closeMessagePopup = closeMessagePopup;
window.closePaymentGateway = closePaymentGateway;
window.closePopupSetting = closePopupSetting;
window.outGameRank = outGameRank;
window.skipGuide = skipGuide;
window.messageOpen = messageOpen;
window.nextStepGuide = nextStepGuide;
window.selectCharacterForUser = selectCharacterForUser;
window.openPopupSelectCharacter = openPopupSelectCharacter;
window.prevShowCharacterSelect = prevShowCharacterSelect;
window.nextShowCharacterSelect = nextShowCharacterSelect;
window.openFullscreen = openFullscreen;
window.toggleAutoMovement = toggleAutoMovement;
window.showUpStamina = showUpStamina;
window.closePopupMeet5Mon = closePopupMeet5Mon;
window.catch5MonMeet = catch5MonMeet;
window.openBag = openBag;
window.openSelectHunt = openSelectHunt;
window.loadItemBagLeft = loadItemBagLeft;
window.chosenSortBagLeft = chosenSortBagLeft;
window.showUpWeightBag = showUpWeightBag;
window.hideOrShowInfoGoldDiamond = hideOrShowInfoGoldDiamond;
window.openPopupSettingMain = openPopupSettingMain;
window.selectButtonSettingMain = selectButtonSettingMain;
window.switchTabShop = switchTabShop;
window.checkGiftQuest = checkGiftQuest;
window.lock5MonShop = lock5MonShop;
