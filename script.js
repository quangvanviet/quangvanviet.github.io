//Biến cục bộ
  const firebaseUrl = "https://mon-33182-default-rtdb.asia-southeast1.firebasedatabase.app/";
  var allPets = [];
  var allUsers = {};
  var allComps = []; //Mảng toàn bộ Comps
  var allCharacter = []; //Mảng lưu nhân vật
  var allQuestData = {}; //Mảng lưu nhiệm vụ
  
  var effectsSkill = {}; // Tạo đối tượng để lưu các Effect Skill và mô tả tương ứng
  var effectsInternal = {}; // Tạo đối tượng để lưu các Effect Internal và mô tả tương ứng
  var effectsSellUp = {}; // Tạo đối tượng để lưu các Effect SellUp và mô tả tương ứng
 // Load toàn bộ dữ liệu chỉ trong 1 lần gọi

function loadAllData() {
  // Gọi API lấy dữ liệu từ Firebase
  fetch(`${firebaseUrl}.json`)
    .then(response => response.json()) // Chuyển đổi phản hồi thành JSON
    .then(data => {
      allCharacter = data.allCharacter || [];
      allQuestData = data.allQuestData || {};
      allPets = data.allPets || [];
      allUsers = data.allUsers || {};
      defaultHP = data.defaultHP
      allComps = data.allComps.filter(item => item !== null);

      var skillDescriptions = data.skillDescriptions || {};

      var effectsSkillArray = skillDescriptions.effectsSkill;
      var effectsInternalArray = skillDescriptions.effectsInternal;
      var effectsSellUpArray = skillDescriptions.effectsSellUp;
      
      effectsSkill = effectsSkillArray.reduce((acc, item) => {
        acc[item.name] = { dameSkill: item.dameSkill, descriptionSkill: item.descriptionSkill };
        return acc; // ⚠️ Cần return acc để tiếp tục tích lũy giá trị
      }, {});

      effectsInternal = effectsInternalArray.reduce((acc, item) => {
        acc[item.name] = { dameInternal: item.dameInternal, descriptionInternal: item.descriptionInternal };
        return acc;
      }, {});

      effectsSellUp = effectsSellUpArray.reduce((acc, item) => {
        acc[item.name] = { dameSellUp: item.dameSellUp, descriptionSellUp: item.descriptionSellUp };
        return acc;
      }, {});
   
      console.log(effectsSkill, effectsInternal, effectsSellUp);
      console.log("allPets", allPets);
      console.log("allUsers", allUsers);
      console.log("allCharacter", allCharacter);
      console.log("allComps", allComps);
    })
    .catch(error => console.error("Lỗi khi lấy dữ liệu từ Firebase:", error));
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
  var diamondUser = 0;

  var pointRank = 0;
  var characterUser = "";
  var isBan = "";
  var timeOnline = "";
  var newTimeOnline = "";
  var weekOnline = ""
  var newWeekOnline = "";
  var ticketsUser = 0;
  var vipTicket = "Thường";
  var todayCheckin = "";
  var weekCheckin = {cn: 0, t2: 0, t3: 0 ,t4: 0 ,t5: 0 ,t6: 0, t7: 0};
  var giftCheckinComplete = ""
  var questDay = {qd1: [0,"No"], qd2: [0,"No"],qd3: [0,"No"],qd4: [0,"No"],qd5: [0,"No"],qd6: [0,"No"]};;
  var questWeek = {qw1: [0,"No"], qw2: [0,"No"],qw3: [0,"No"],qw4: [0,"No"],qw5: [0,"No"],qw6: [0,"No"]};;
  var questWeekend = {qwe1: [0,"No"], qwe2: [0,"No"],qwe3: [0,"No"],qwe4: [0,"No"],qwe5: [0,"No"],qwe6: [0,"No"]};;

  //Chế độ game
  var onGame = 0;
  var infoStartGame = {typeGame: "Conquest", modeGame: "Normal", difficultyGame: "Easy", roundGame:1, stepGame:0, winStreak:0,} //type game: Conquest (chinh phục), Solo5Mon (đối kháng), Guess (Dự đoán) //modeGame: Guide, Normal, Rank //difficultyGame: Easy, Normal, Hard, Very Hard, Hell


  //Pet mà user có (trong sheet User)
  var userPet = []; //pet để hiển thị ở tủ đồ

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
let isFinalLoadData = false;

var price5MonConquest = 0;
var typeGameGuess = {}
var typeGameSolo5Mon = {}
var typeGameConquest = {
  winBattle: 0,
  loseBattle: 0,
  pointBattle: 0,
  reRoll: 0,
  reRollPrice: 0,
  starUser: 0,
  price5Mon: 0,
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
  battleUserPetRound: [""],
  battlePetUseSlotRound: {
    skill1B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill2B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill3B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill4B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill5B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill6B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill7B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill8B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill9B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
  },
  battlePetInShop: {
    battleShop1: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleShop2: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleShop3: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleShop4: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
  },
  battlePetInInventory: {
    battleInv1: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleInv2: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleInv3: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleInv4: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleInv5: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleInv6: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleInv7: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleInv8: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleInv9: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
  },
  skillBattle: {
    skill1A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill2A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill3A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill4A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill5A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill6A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill7A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill8A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill9A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill1B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill2B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill3B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill4B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill5B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill6B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill7B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill8B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill9B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
  },
};

function loadDataForUser() {
  // Đường dẫn đến dữ liệu của người dùng trên Firebase
  const userDataUrl = `${firebaseUrl}allUsers/${username}.json`; 

  // Sử dụng fetch của JavaScript để gửi yêu cầu GET tới Firebase
  fetch(userDataUrl)
    .then(response => response.json())
    .then(data => {
      if (!data) {
        console.error("Dữ liệu trả về từ Firebase là null hoặc undefined.");
        return;
      }

      typeGameConquest = {...typeGameConquest, ...data.battleData.typeGameConquest};
      typeGameGuess = data.battleData.typeGameGuess
      typeGameSolo5Mon = data.battleData.typeGameSolo5Mon

      // Dữ liệu user lấy từ Firebase
      const userPetIDs = data.userPet; // ID Pet mà user sở hữu

      // Tìm thông tin đầy đủ từ allPets dựa trên ID và LEVEL === 1
      userPet = userPetIDs
        .map(id => allPets.find(pet => pet.ID === id && Number(pet.LEVEL) === 1)) // Lọc Pet theo ID và LEVEL
        .filter(pet => pet); // Loại bỏ undefined nếu không tìm thấy Pet phù hợp
      console.log("userPet", userPet)

      //Thông tin cơ bản user
      goldUser = data.goldUser;
      diamondUser = data.diamondUser || 0;
      infoStartGame = {...infoStartGame, ...data.infoStartGame} || {typeGame: "Conquest", modeGame: "Normal", difficultyGame: "Easy", roundGame:1, stepGame:0, winStreak:0,};
      activateUser = data.activateUser;
      characterUser = data.characterUser;
      onGame = data.onGame;
      idSkillRND = data.idSkillRND;
      pointRank = data.pointRank;
      nameUser = data.nameUser;
      isBan = data.isBan;
      timeOnline = data.timeOnline;
      weekOnline = data.weekOnline && data.weekOnline !== "" ? data.weekOnline : getISOWeek(new Date());

      newWeekOnline = getISOWeek(new Date());

      //Lấy dữ liệu thời gian hôm nay theo giờ Việt Nam để lưu thời gian mỗi khi đăng nhập. 
      let now = new Date();
      now.setHours(now.getHours() + 7); // Cộng thêm 7 giờ
      newTimeOnline = now.toISOString().split('T')[0];


      console.log("timeOnline", timeOnline)
      console.log("newTimeOnline", newTimeOnline)
      console.log("weekOnline", weekOnline)
      console.log("newWeekOnline", newWeekOnline)


      ticketsUser = data.ticketsUser;
      vipTicket = data.vipTicket==="No"?"Thường":data.vipTicket;
      todayCheckin = data.todayCheckin || "No";
      weekCheckin = {...weekCheckin,...data.weekCheckin} || {cn: 0, t2: 0, t3: 0 ,t4: 0 ,t5: 0 ,t6: 0, t7: 0};
      giftCheckinComplete = data.giftCheckinComplete || ""
      questDay = {...questDay,...data.questDay} || {qd1: [0,"No"], qd2: [0,"No"],qd3: [0,"No"],qd4: [0,"No"],qd5: [0,"No"],qd6: [0,"No"]};
      questWeek = {...questWeek,...data.questWeek} || {qw1: [0,"No"], qw2: [0,"No"],qw3: [0,"No"],qw4: [0,"No"],qw5: [0,"No"],qw6: [0,"No"]};
      questWeekend = {...questWeekend,...data.questWeekend} || {qwe1: [0,"No"], qwe2: [0,"No"],qwe3: [0,"No"],qwe4: [0,"No"],qwe5: [0,"No"],qwe6: [0,"No"]};

      //Lấy dữ liệu cho modeGame Conquest ////////////////////////////////////////
      const battlePetIDs = typeGameConquest.battleUserPet; // ID Pet để chiến đấu
      typeGameConquest.battleUserPet = battlePetIDs
        .map(id => allPets.find(pet => pet.ID === id && Number(pet.LEVEL) === 1))
        .filter(pet => pet);
      console.log("battleUserPet", typeGameConquest.battleUserPet)
      
      document.getElementById("textNameComp").innerText = typeGameConquest.nameComp;

      //pointRank cho comp
      Object.keys(allUsers).forEach((key) => {
        if (key === typeGameConquest.usernameComp) {
          pointRankComp = allUsers[key].pointRank;
          console.log("pointRankComp", pointRankComp)
        }
      });

      const battleUserPetRoundIDs = typeGameConquest.battleUserPetRound
      typeGameConquest.battleUserPetRound = battleUserPetRoundIDs
        .map(id => allPets.filter(pet => pet.ID === id)) // Lọc tất cả các pets có ID trùng khớp
        .flat(); // Làm phẳng mảng nếu cần (nếu mỗi ID có nhiều đối tượng)
      console.log("battleUserPetRound", typeGameConquest.battleUserPetRound)



      //Thông tin user
      document.getElementById("nameUser").innerText = `${nameUser} - ${vipTicket}`;
      resetGoldAndTicket();
      isFinalLoadData = true;
      hideLoading();

      //Hiển thị popup chọn nhân vật nếu user mới tạo => chưa có nhân vật
      //+++++++++++
      if (!characterUser || characterUser === "") {
        openPopupSelectCharacter();

        //Step guide 1
        if (guideMode) showStepGuide(0);
      }

      //Reset checkin và reset nhiệm vụ mỗi khi qua ngày và qua tuần
      resetDayorWeek();

    })
  .catch(error => {
    console.error("Lỗi khi tải dữ liệu từ Firebase:", error);
  });
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

//Bắt đầu cooldown và khi cooldown xong thì sử dụng skill
function triggerCooldown(skillId) {
    const skill = document.getElementById(skillId);
    const overlay = skill.querySelector('.skillCooldownOverlay');

    // Lấy thời gian hồi chiêu từ cấu hình
    const cooldownTime = typeGameConquest.skillBattle[skillId].COOLDOWN[0] + typeGameConquest.skillBattle[skillId].COOLDOWN[1] + typeGameConquest.skillBattle[skillId].COOLDOWN[2] + typeGameConquest.skillBattle[skillId].COOLDOWN[3] + typeGameConquest.skillBattle[skillId].COOLDOWN[4];
    const dameSkill = typeGameConquest.skillBattle[skillId].DAME[0] + typeGameConquest.skillBattle[skillId].DAME[1] + typeGameConquest.skillBattle[skillId].DAME[2] + typeGameConquest.skillBattle[skillId].DAME[3];

    if (endGame===true){
      stopSkillGame()
      return;
    }

    // Đặt lại trạng thái overlay ban đầu
    overlay.style.transitionDuration = '0ms'; // Không có hiệu ứng chuyển tiếp ban đầu
    overlay.style.transform = 'scaleY(1)';    // Đặt overlay đầy (hiện full)

    // Khởi tạo thời gian bắt đầu hồi chiêu
    const startTime = Date.now();
    
    function updateCooldown() {
        const elapsedTime = Date.now() - startTime; // Tính thời gian đã trôi qua

        // Tính tỉ lệ hồi chiêu (từ 0 đến 1)
        const progress = Math.min(elapsedTime / cooldownTime, 1);
        
        // Điều chỉnh overlay dựa trên tỉ lệ đã trôi qua
        overlay.style.transform = `scaleY(${1 - progress})`;

        if (elapsedTime < cooldownTime) {
            // Tiếp tục cập nhật khi chưa hết thời gian hồi chiêu
            const frameId = requestAnimationFrame(updateCooldown);
            animationFrameIds.push(frameId); // Lưu ID
        } else {
            //Kiểm tra xem endgame chưa, nếu chưa => Tiếp tục vòng hồi chiêu
            if (endGame===false){
              triggerCooldown(skillId);
              // Khi hết thời gian hồi chiêu, kích hoạt kỹ năng
              skillAttacking(skillId, dameSkill);
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

    const targetRect = target.getBoundingClientRect();  // Lấy vị trí của đối tượng

    // Tạo mũi tên/nắm đấm
    const attackEffect = document.createElement('div');
    if (imgTeam==="TeamB") {
      // attackEffect.classList.add('attackEffectOfA');
      attackEffect.classList.add('attackEffect')
    } else {
      // attackEffect.classList.add('attackEffectOfB');
      attackEffect.classList.add('attackEffect');
      attackEffect.style.transform = "rotate(90deg)";
    }

    document.body.appendChild(attackEffect);

    // Lấy vị trí của skill để tạo mũi tên bắt đầu từ đó
    const skillRect = skill.getBoundingClientRect();

    // Đặt vị trí ban đầu của mũi tên/nắm đấm
    attackEffect.style.position = 'absolute';
    attackEffect.style.left = `${skillRect.left + skillRect.width / 2}px`;
    attackEffect.style.top = `${skillRect.top + skillRect.height / 2}px`;

    // Tính toán độ di chuyển tới mục tiêu
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;

    // Tạo hiệu ứng di chuyển (mũi tên bay tới mục tiêu)
    const moveEffect = () => {
        const duration = 500; // Thời gian di chuyển (ms)
        const deltaX = targetX - (skillRect.left + skillRect.width / 2);
        const deltaY = targetY - (skillRect.top + skillRect.height / 2);

        attackEffect.style.transition = `transform ${duration}ms ease-out`;
        if (imgTeam==="TeamB") {
          attackEffect.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        } else {
        attackEffect.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(90deg)`;
        }

        // Xóa phần tử sau khi hiệu ứng kết thúc
        setTimeout(() => {
          attackEffect.remove();
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

    const targetRect = target.getBoundingClientRect();  // Lấy vị trí của đối tượng

    // Tạo mũi tên/nắm đấm
    const attackEffect = document.createElement('div');
    if (imgTeam==="TeamA") {
      attackEffect.classList.add('healEffect'); // Class CSS để định dạng hiệu ứng
    } else {
      attackEffect.classList.add('healEffect'); // Class CSS để định dạng hiệu ứng
    }

    document.body.appendChild(attackEffect);

    // Lấy vị trí của skill để tạo mũi tên bắt đầu từ đó
    const skillRect = skill.getBoundingClientRect();

    // Đặt vị trí ban đầu của mũi tên/nắm đấm
    attackEffect.style.position = 'absolute';
    attackEffect.style.left = `${skillRect.left + skillRect.width / 2}px`;
    attackEffect.style.top = `${skillRect.top + skillRect.height / 2}px`;

    // Tính toán độ di chuyển tới mục tiêu
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;

    // Tạo hiệu ứng di chuyển (mũi tên bay tới mục tiêu)
    const moveEffect = () => {
        const duration = 500; // Thời gian di chuyển (ms)
        const deltaX = targetX - (skillRect.left + skillRect.width / 2);
        const deltaY = targetY - (skillRect.top + skillRect.height / 2);

        attackEffect.style.transition = `transform ${duration}ms ease-out`;
        attackEffect.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // Xóa phần tử sau khi hiệu ứng kết thúc
        setTimeout(() => {
          attackEffect.remove();
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

    const targetRect = target.getBoundingClientRect();  // Lấy vị trí của đối tượng

    // Tạo mũi tên/nắm đấm
    const attackEffect = document.createElement('div');
    if (imgTeam==="TeamA") {
      attackEffect.classList.add('shieldEffect'); // Class CSS để định dạng hiệu ứng
    } else {
      attackEffect.classList.add('shieldEffect'); // Class CSS để định dạng hiệu ứng
    }

    document.body.appendChild(attackEffect);

    // Lấy vị trí của skill để tạo mũi tên bắt đầu từ đó
    const skillRect = skill.getBoundingClientRect();

    // Đặt vị trí ban đầu của mũi tên/nắm đấm
    attackEffect.style.position = 'absolute';
    attackEffect.style.left = `${skillRect.left + skillRect.width / 2}px`;
    attackEffect.style.top = `${skillRect.top + skillRect.height / 2}px`;

    // Tính toán độ di chuyển tới mục tiêu
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;

    // Tạo hiệu ứng di chuyển (mũi tên bay tới mục tiêu)
    const moveEffect = () => {
        const duration = 500; // Thời gian di chuyển (ms)
        const deltaX = targetX - (skillRect.left + skillRect.width / 2);
        const deltaY = targetY - (skillRect.top + skillRect.height / 2);

        attackEffect.style.transition = `transform ${duration}ms ease-out`;
        attackEffect.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // Xóa phần tử sau khi hiệu ứng kết thúc
        setTimeout(() => {
          attackEffect.remove();
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

    const targetRect = target.getBoundingClientRect();  // Lấy vị trí của đối tượng

    // Tạo mũi tên/nắm đấm
    const attackEffect = document.createElement('div');
    if (imgTeam==="TeamB") {
      attackEffect.classList.add('burnEffect'); // Class CSS để định dạng hiệu ứng
    } else {
      attackEffect.classList.add('burnEffect'); // Class CSS để định dạng hiệu ứng
    }

    document.body.appendChild(attackEffect);

    // Lấy vị trí của skill để tạo mũi tên bắt đầu từ đó
    const skillRect = skill.getBoundingClientRect();

    // Đặt vị trí ban đầu của mũi tên/nắm đấm
    attackEffect.style.position = 'absolute';
    attackEffect.style.left = `${skillRect.left + skillRect.width / 2}px`;
    attackEffect.style.top = `${skillRect.top + skillRect.height / 2}px`;

    // Tính toán độ di chuyển tới mục tiêu
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;

    // Tạo hiệu ứng di chuyển (mũi tên bay tới mục tiêu)
    const moveEffect = () => {
        const duration = 500; // Thời gian di chuyển (ms)
        const deltaX = targetX - (skillRect.left + skillRect.width / 2);
        const deltaY = targetY - (skillRect.top + skillRect.height / 2);

        attackEffect.style.transition = `transform ${duration}ms ease-out`;
        attackEffect.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // Xóa phần tử sau khi hiệu ứng kết thúc
        setTimeout(() => {
          attackEffect.remove();
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

    const targetRect = target.getBoundingClientRect();  // Lấy vị trí của đối tượng

    // Tạo mũi tên/nắm đấm
    const attackEffect = document.createElement('div');
    if (imgTeam==="TeamB") {
      attackEffect.classList.add('poisonEffect'); // Class CSS để định dạng hiệu ứng
    } else {
      attackEffect.classList.add('poisonEffect'); // Class CSS để định dạng hiệu ứng
    }

    document.body.appendChild(attackEffect);

    // Lấy vị trí của skill để tạo mũi tên bắt đầu từ đó
    const skillRect = skill.getBoundingClientRect();

    // Đặt vị trí ban đầu của mũi tên/nắm đấm
    attackEffect.style.position = 'absolute';
    attackEffect.style.left = `${skillRect.left + skillRect.width / 2}px`;
    attackEffect.style.top = `${skillRect.top + skillRect.height / 2}px`;

    // Tính toán độ di chuyển tới mục tiêu
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;

    // Tạo hiệu ứng di chuyển (mũi tên bay tới mục tiêu)
    const moveEffect = () => {
        const duration = 500; // Thời gian di chuyển (ms)
        const deltaX = targetX - (skillRect.left + skillRect.width / 2);
        const deltaY = targetY - (skillRect.top + skillRect.height / 2);

        attackEffect.style.transition = `transform ${duration}ms ease-out`;
        attackEffect.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // Xóa phần tử sau khi hiệu ứng kết thúc
        setTimeout(() => {
          attackEffect.remove();
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


let cooldownQueueComp  = 0; // Mảng để lưu các thời gian kết thúc tạm dừng cooldown của người chơi
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

  const targetRect = target.getBoundingClientRect();  // Lấy vị trí của đối tượng

  // Tạo mũi tên/nắm đấm
  const attackEffect = document.createElement('div');
  if (imgTeam==="TeamB") {
    attackEffect.classList.add('freezeEffect'); // Class CSS để định dạng hiệu ứng
  } else {
    attackEffect.classList.add('freezeEffect'); // Class CSS để định dạng hiệu ứng
  }

  document.body.appendChild(attackEffect);

  // Lấy vị trí của skill để tạo mũi tên bắt đầu từ đó
  const skillRect = skill.getBoundingClientRect();

  // Đặt vị trí ban đầu của mũi tên/nắm đấm
  attackEffect.style.position = 'absolute';
  attackEffect.style.left = `${skillRect.left + skillRect.width / 2}px`;
  attackEffect.style.top = `${skillRect.top + skillRect.height / 2}px`;

  // Tính toán độ di chuyển tới mục tiêu
  const targetX = targetRect.left + targetRect.width / 2;
  const targetY = targetRect.top + targetRect.height / 2;

  // Tạo hiệu ứng di chuyển (mũi tên bay tới mục tiêu)
  const moveEffect = () => {
  const duration = 500; // Thời gian di chuyển (ms)
  const deltaX = targetX - (skillRect.left + skillRect.width / 2);
  const deltaY = targetY - (skillRect.top + skillRect.height / 2);

  attackEffect.style.transition = `transform ${duration}ms ease-out`;
  attackEffect.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

  // Xóa phần tử sau khi hiệu ứng kết thúc
  setTimeout(() => {
    attackEffect.remove();

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

  if (typeSkill === "Left"){
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
      adjacentSlots =[
        'skill1A', 'skill2A', 'skill3A', 'skill4A', 'skill5A', 'skill6A', 'skill7A', 'skill8A', 'skill9A',
      ]
    } else {
      adjacentSlots =[
        'skill1B', 'skill2B', 'skill3B', 'skill4B', 'skill5B', 'skill6B', 'skill7B', 'skill8B', 'skill9B',
      ]
    }
  }

  if (typeSkill === "Type") {
    for (let skill in typeGameConquest.skillBattle) {
      if (isComp===true){
        if (
          skill !== skillKey &&                  // Không trùng skillKey
          skill.endsWith("A") &&                 // Kết thúc bằng "A"
          typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) // TYPE giống nhau
          ){
          adjacentSlots.push(skill)
        }
      } else {
        if (
          skill !== skillKey &&                  // Không trùng skillKey
          skill.endsWith("B") &&                 // Kết thúc bằng "B"
          typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) // TYPE giống nhau
          ){
          adjacentSlots.push(skill)
        }
      } 
    }
  }

  //Loại trừ các skill có trùng EFFECT với skill này
  let myEffect = ['ChargerSkillAll','ChargerSkillLeftRight','ChargerSkillLeft', 'ChargerSkillRight', 'ChargerSkillType']

  // Duyệt qua các slot liền kề và kích hoạt skill tương ứng
  adjacentSlots.forEach(adjacentKey => {
    let skillsSleep = isComp? skillsSleepA: skillsSleepB
    let skillsDelete = isComp? skillsDeleteA: skillsDeleteB
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

      let skillElement = document.getElementById(adjacentKey); 
      let overlayDiv = 0;
      for (let child of skillElement.children) {
        if (child.classList.contains('skillCooldownOverlay') || child.classList.contains('skillCooldownOverlayLV')) {
          overlayDiv = child;
          break; // Dừng vòng lặp khi tìm thấy
        }
      }

      let adjacentEffectSkill = typeGameConquest.skillBattle[adjacentKey].EFFECT;
      for (let effect of adjacentEffectSkill) {
        if (!myEffect.includes(effect)) {
          startSkill(adjacentKey, overlayDiv, isComp);
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
  if (typeEffect==="LeftRight"){
    if (skillIndex - 1 >= 1) {
      adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
    }
    if (skillIndex + 1 <= 9) {
      adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
    }
  } else if (typeEffect==="Left"){
    if (skillIndex - 1 >= 1) {
      adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
    }
  } else if (typeEffect==="Right"){
    if (skillIndex + 1 <= 9) {
      adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
    }
  } else if (typeEffect==="All"){
    for (let s = 1; s<= 9; s++) {
      if (skillIndex !== s) {
        adjacentSlots.push(`skill${s}${isComp ? 'A' : 'B'}`);
      }
    }
  } else if (typeEffect==="Self"){
    adjacentSlots.push(`skill${skillIndex}${isComp ? 'A' : 'B'}`);
  } else if (typeEffect === "Type") {
    for (let skill in typeGameConquest.skillBattle) {
      if (isComp===true){
        if (
          skill !== skillKey &&                  // Không trùng skillKey
          skill.endsWith("A") &&                 // Kết thúc bằng "A"
          typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) && // TYPE giống nhau
          typeGameConquest.skillBattle[skill].EFFECT.includes("Attacking") //Bao gồm attacking
          ){
          adjacentSlots.push(skill)
        }
      } else {
        if (
          skill !== skillKey &&                  // Không trùng skillKey
          skill.endsWith("B") &&                 // Kết thúc bằng "B"
          typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) && // TYPE giống nhau
          typeGameConquest.skillBattle[skill].EFFECT.includes("Attacking") //Bao gồm attacking
          ){
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
  if (typeEffect==="LeftRight"){
    if (skillIndex - 1 >= 1) {
      adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
    }
    if (skillIndex + 1 <= 9) {
      adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
    }
  } else if (typeEffect==="Left"){
    if (skillIndex - 1 >= 1) {
      adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
    }
  } else if (typeEffect==="Right"){
    if (skillIndex + 1 <= 9) {
      adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
    }
  } else if (typeEffect==="All"){
    for (let s = 1; s<= 9; s++) {
      if (skillIndex !== s) {
        adjacentSlots.push(`skill${s}${isComp ? 'A' : 'B'}`);
      }
    }
  } else if (typeEffect==="Self"){
    adjacentSlots.push(`skill${skillIndex}${isComp ? 'A' : 'B'}`);
  } else if (typeEffect === "Type") {
    for (let skill in typeGameConquest.skillBattle) {
      if (isComp===true){
        if (
          skill !== skillKey &&                  // Không trùng skillKey
          skill.endsWith("A") &&                 // Kết thúc bằng "A"
          typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) && // TYPE giống nhau
          typeGameConquest.skillBattle[skill].EFFECT.includes("Healing") //Bao gồm attacking
          ){
          adjacentSlots.push(skill)
        }
      } else {
        if (
          skill !== skillKey &&                  // Không trùng skillKey
          skill.endsWith("B") &&                 // Kết thúc bằng "B"
          typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) && // TYPE giống nhau
          typeGameConquest.skillBattle[skill].EFFECT.includes("Healing") //Bao gồm attacking
          ){
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
  if (typeEffect==="LeftRight"){
    if (skillIndex - 1 >= 1) {
      adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
    }
    if (skillIndex + 1 <= 9) {
      adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
    }
  } else if (typeEffect==="Left"){
    if (skillIndex - 1 >= 1) {
      adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
    }
  } else if (typeEffect==="Right"){
    if (skillIndex + 1 <= 9) {
      adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
    }
  } else if (typeEffect==="All"){
    for (let s = 1; s<= 9; s++) {
      if (skillIndex !== s) {
        adjacentSlots.push(`skill${s}${isComp ? 'A' : 'B'}`);
      }
    }
  } else if (typeEffect==="Self"){
    adjacentSlots.push(`skill${skillIndex}${isComp ? 'A' : 'B'}`);
  } else if (typeEffect === "Type") {
    for (let skill in typeGameConquest.skillBattle) {
      if (isComp===true){
        if (
          skill !== skillKey &&                  // Không trùng skillKey
          skill.endsWith("A") &&                 // Kết thúc bằng "A"
          typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) && // TYPE giống nhau
          typeGameConquest.skillBattle[skill].EFFECT.includes("Shield") //Bao gồm attacking
          ){
          adjacentSlots.push(skill)
        }
      } else {
        if (
          skill !== skillKey &&                  // Không trùng skillKey
          skill.endsWith("B") &&                 // Kết thúc bằng "B"
          typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) && // TYPE giống nhau
          typeGameConquest.skillBattle[skill].EFFECT.includes("Shield") //Bao gồm attacking
          ){
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
  if (typeEffect==="LeftRight"){
    if (skillIndex - 1 >= 1) {
      adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
    }
    if (skillIndex + 1 <= 9) {
      adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
    }
  } else if (typeEffect==="Left"){
    if (skillIndex - 1 >= 1) {
      adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
    }
  } else if (typeEffect==="Right"){
    if (skillIndex + 1 <= 9) {
      adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
    }
  } else if (typeEffect==="All"){
    for (let s = 1; s<= 9; s++) {
      if (skillIndex !== s) {
        adjacentSlots.push(`skill${s}${isComp ? 'A' : 'B'}`);
      }
    }
  } else if (typeEffect==="Self"){
    adjacentSlots.push(`skill${skillIndex}${isComp ? 'A' : 'B'}`);
  } else if (typeEffect === "Type") {
    for (let skill in typeGameConquest.skillBattle) {
      if (isComp===true){
        if (
          skill !== skillKey &&                  // Không trùng skillKey
          skill.endsWith("A") &&                 // Kết thúc bằng "A"
          typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) && // TYPE giống nhau
          typeGameConquest.skillBattle[skill].EFFECT.includes("Burn") //Bao gồm attacking
          ){
          adjacentSlots.push(skill)
        }
      } else {
        if (
          skill !== skillKey &&                  // Không trùng skillKey
          skill.endsWith("B") &&                 // Kết thúc bằng "B"
          typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) && // TYPE giống nhau
          typeGameConquest.skillBattle[skill].EFFECT.includes("Burn") //Bao gồm attacking
          ){
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
  if (typeEffect==="LeftRight"){
    if (skillIndex - 1 >= 1) {
      adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
    }
    if (skillIndex + 1 <= 9) {
      adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
    }
  } else if (typeEffect==="Left"){
    if (skillIndex - 1 >= 1) {
      adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
    }
  } else if (typeEffect==="Right"){
    if (skillIndex + 1 <= 9) {
      adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
    }
  } else if (typeEffect==="All"){
    for (let s = 1; s<= 9; s++) {
      if (skillIndex !== s) {
        adjacentSlots.push(`skill${s}${isComp ? 'A' : 'B'}`);
      }
    }
  } else if (typeEffect==="Self"){
    adjacentSlots.push(`skill${skillIndex}${isComp ? 'A' : 'B'}`);
  } else if (typeEffect === "Type") {
    for (let skill in typeGameConquest.skillBattle) {
      if (isComp===true){
        if (
          skill !== skillKey &&                  // Không trùng skillKey
          skill.endsWith("A") &&                 // Kết thúc bằng "A"
          typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) && // TYPE giống nhau
          typeGameConquest.skillBattle[skill].EFFECT.includes("Poison") //Bao gồm attacking
          ){
          adjacentSlots.push(skill)
        }
      } else {
        if (
          skill !== skillKey &&                  // Không trùng skillKey
          skill.endsWith("B") &&                 // Kết thúc bằng "B"
          typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) && // TYPE giống nhau
          typeGameConquest.skillBattle[skill].EFFECT.includes("Poison") //Bao gồm attacking
          ){
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
  if (typeEffect==="LeftRight"){
    if (skillIndex - 1 >= 1) {
      adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
    }
    if (skillIndex + 1 <= 9) {
      adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
    }
  } else if (typeEffect==="Left"){
    if (skillIndex - 1 >= 1) {
      adjacentSlots.push(`skill${skillIndex - 1}${isComp ? 'A' : 'B'}`);
    }
  } else if (typeEffect==="Right"){
    if (skillIndex + 1 <= 9) {
      adjacentSlots.push(`skill${skillIndex + 1}${isComp ? 'A' : 'B'}`);
    }
  } else if (typeEffect==="All"){
    for (let s = 1; s<= 9; s++) {
      if (skillIndex !== s) {
        adjacentSlots.push(`skill${s}${isComp ? 'A' : 'B'}`);
      }
    }
  } else if (typeEffect==="Self"){
    adjacentSlots.push(`skill${skillIndex}${isComp ? 'A' : 'B'}`);
  } else if (typeEffect === "Type") {
    for (let skill in typeGameConquest.skillBattle) {
      if (isComp===true){
        if (
          skill !== skillKey &&                  // Không trùng skillKey
          skill.endsWith("A") &&                 // Kết thúc bằng "A"
          typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) // TYPE giống nhau
          ){
          adjacentSlots.push(skill)
        }
      } else {
        if (
          skill !== skillKey &&                  // Không trùng skillKey
          skill.endsWith("B") &&                 // Kết thúc bằng "B"
          typeGameConquest.skillBattle[skill].TYPE.some(type => typeGameConquest.skillBattle[skillKey].TYPE.includes(type)) // TYPE giống nhau
          ){
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
let saveNowShieldA = 0;
let saveNowShieldB = 0;
function skillUpShieldWithNowShield(isComp) {
  if (endGame) {
    saveNowShieldA = 0;
    saveNowShieldB = 0;
    saveShieldState = {};
    return;
  }

  let shieldNow = isComp ? nowShieldBattleComp : nowShieldBattleMy
  let saveShield = isComp ? saveNowShieldA : saveNowShieldB
  let newShield = shieldNow - saveShield

  // Tăng shield cho các skill có effect "UpShieldWithNowShield"
  for (const skill in typeGameConquest.skillBattle) {
    const isCorrectSkill = isComp ? skill.endsWith("A") : skill.endsWith("B");
    const hasEffect = typeGameConquest.skillBattle[skill]?.EFFECT.includes("UpShieldWithNowShield");
    if (isCorrectSkill && hasEffect) {
      let dame3 = Math.max(typeGameConquest.skillBattle[skill].SHIELD[3] += newShield, 0);
      typeGameConquest.skillBattle[skill].SHIELD[3] = dame3
    }
  }

  //Lưu nowshield hiện tại
  if (isComp) {
    saveNowShieldA = shieldNow
  } else {
    saveNowShieldB = shieldNow
  }
  skillUpPowerWithShield();
  updateSttForSkillAffter();
}
// Lưu trạng thái shield riêng cho từng kỹ năng
let saveShieldState = {};

function skillUpPowerWithShield() {
  if (endGame) {
    saveShieldState = {};
    return;
  }

  for (const skill in typeGameConquest.skillBattle) {
    const skillData = typeGameConquest.skillBattle[skill];
    const hasEffect = skillData?.EFFECT?.includes("UpPowerWithShield");

    if (hasEffect) {
      // Tổng shield hiện tại
      const shieldNow = skillData.SHIELD.reduce((a, b) => a + b, 0);
      const saveShield = saveShieldState[skill] || 0; // Giá trị trước đó hoặc mặc định là 0
      const newShield = shieldNow - saveShield;

      // Cập nhật sát thương hoặc hồi máu
      if (skillData.EFFECT.includes("Attacking")) {
        let dame3 = Math.max(skillData.DAME[3] += newShield,0);
        skillData.DAME[3] = dame3
      }
      if (skillData.EFFECT.includes("Healing")) {
        let dame3 = Math.max(skillData.HEAL[3] += newShield,0);
        skillData.HEAL[3] = dame3
      }

      // Cập nhật giá trị shield hiện tại cho kỹ năng
      saveShieldState[skill] = shieldNow;
    }
  }
}

//Skill vô hiệu hóa (đóng băng) skill địch
function skillSleepSkills(skillKey, dameSkill, isComp) {
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
  
  // Lặp qua đối tượng skillsSleep để chọn các chỉ số có giá trị 0 (chưa bị sleep)
  for (let skill in skillsSleep) {
    if (skillsSleep[skill] === 0 && typeGameConquest.skillBattle[skill]?.ID && skillsDelete[skill] === 0 && !typeGameConquest.skillBattle[skill].EFFECT.includes("BKBSleep")) { 
      sleepSkills.push(skill);  // Thêm key vào danh sách skill có thể sleep
      console.log(`Skill có thể sleep:`, skill);
    }
  }

  let countDameSkill = 0;
  if (dameSkill >= sleepSkills.length) {
    countDameSkill = sleepSkills.length
  } else {
    countDameSkill = dameSkill
  }

  // Lấy các skill ngẫu nhiên từ sleepSkills để thay đổi giá trị thành 1 (sleep)
  let selectedSkills = [];
  while (selectedSkills.length < countDameSkill && sleepSkills.length > 0) {
    let randIndex = Math.floor(Math.random() * sleepSkills.length); // Chọn một index ngẫu nhiên
    const selectedSkill = sleepSkills[randIndex]; // Lấy key skill từ mảng sleepSkills
    selectedSkills.push(selectedSkill); // Thêm key skill vào danh sách đã chọn
    sleepSkills.splice(randIndex, 1); // Xóa skill đã chọn khỏi mảng
  }

  // In ra các kỹ năng được chọn
  console.log("selectedSkills", selectedSkills);

  // Đổi giá trị trong skillsSleep tại các skill đã chọn từ 0 thành 1
  selectedSkills.forEach(skill => {
    skillsSleep[skill] = 1; // Vô hiệu hóa skill
    console.log("Skill đã Sleep:", skill, skillsSleep); // Kiểm tra skill bị Sleep
  });

  // Tạo hiệu ứng mũi tên/nắm đấm cho các chỉ số SleepSkills bị chọn
  selectedSkills.forEach(skillKeyToSleep => {
    const targetSkill = document.getElementById(skillKeyToSleep); // Lấy id tương ứng của skill đối phương
    if (targetSkill) {
      const targetRect = targetSkill.getBoundingClientRect(); // Lấy vị trí của skill bị Sleep

      // Tạo mũi tên/nắm đấm
      const attackEffect = document.createElement('div');
      if (imgTeam === "TeamB") {
        attackEffect.classList.add('sleepEffect'); // Class CSS để định dạng hiệu ứng
      } else {
        attackEffect.classList.add('sleepEffect'); // Class CSS để định dạng hiệu ứng
      }

      document.body.appendChild(attackEffect);

      // Lấy vị trí của skill tấn công để tạo mũi tên bắt đầu từ đó
      const skillRect = skill.getBoundingClientRect();

      // Đặt vị trí ban đầu của mũi tên/nắm đấm
      attackEffect.style.position = 'absolute';
      attackEffect.style.left = `${skillRect.left + skillRect.width / 2}px`;
      attackEffect.style.top = `${skillRect.top + skillRect.height / 2}px`;

      // Tính toán độ di chuyển tới mục tiêu
      const targetX = targetRect.left + targetRect.width / 2;
      const targetY = targetRect.top + targetRect.height / 2;

      // Tạo hiệu ứng di chuyển (mũi tên bay tới mục tiêu)
      const moveEffect = () => {
        const duration = 500; // Thời gian di chuyển (ms)
        const deltaX = targetX - (skillRect.left + skillRect.width / 2);
        const deltaY = targetY - (skillRect.top + skillRect.height / 2);

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
        }, duration);
      };

      // Bắt đầu hiệu ứng di chuyển
      setTimeout(moveEffect, 100); // Chờ một chút sau khi hiệu ứng skill bắt đầu
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
      const targetRect = targetSkill.getBoundingClientRect(); // Lấy vị trí của skill bị delete

      // Tạo mũi tên/nắm đấm
      const attackEffect = document.createElement('div');
      if (imgTeam === "TeamB") {
        attackEffect.classList.add('deleteEffect'); // Class CSS để định dạng hiệu ứng
      } else {
        attackEffect.classList.add('deleteEffect'); // Class CSS để định dạng hiệu ứng
      }

      document.body.appendChild(attackEffect);

      // Lấy vị trí của skill tấn công để tạo mũi tên bắt đầu từ đó
      const skillRect = skill.getBoundingClientRect();

      // Đặt vị trí ban đầu của mũi tên/nắm đấm
      attackEffect.style.position = 'absolute';
      attackEffect.style.left = `${skillRect.left + skillRect.width / 2}px`;
      attackEffect.style.top = `${skillRect.top + skillRect.height / 2}px`;

      // Tính toán độ di chuyển tới mục tiêu
      const targetX = targetRect.left + targetRect.width / 2;
      const targetY = targetRect.top + targetRect.height / 2;

      // Tạo hiệu ứng di chuyển (mũi tên bay tới mục tiêu)
      const moveEffect = () => {
        const duration = 500; // Thời gian di chuyển (ms)
        const deltaX = targetX - (skillRect.left + skillRect.width / 2);
        const deltaY = targetY - (skillRect.top + skillRect.height / 2);

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
        }, duration);
      };

      // Bắt đầu hiệu ứng di chuyển
      setTimeout(moveEffect, 100); // Chờ một chút sau khi hiệu ứng skill bắt đầu
    }
  });
}

//Skill tăng tốc 
let totalSpeedUpTimeA = 0; // Thời gian tổng cộng hiệu lực tăng tốc cho team A
let totalSpeedUpTimeB = 0; // Thời gian tổng cộng hiệu lực tăng tốc cho team B
function skillSpeedUp(skillKey, dameSkill, isComp) {
  const cooldownBarTime = isComp? document.getElementById("cooldownSkillA"):document.getElementById("cooldownSkillB")
  const targetRect = cooldownBarTime.getBoundingClientRect(); // Lấy vị trí của skill bị delete
  const skill = document.getElementById(skillKey)
  const teamAorB = skillKey.includes('A') ? 'TeamA' : 'TeamB';

  // Hiệu ứng cho thanh skill 
  if (teamAorB == 'TeamA') { //bên A
    skill.classList.add('attackingSkillA');
    setTimeout(() => skill.classList.remove('attackingSkillA'), 500);
  } else { //bên B
    skill.classList.add('attackingSkillB');
    setTimeout(() => skill.classList.remove('attackingSkillB'), 500);
  }

  // Tạo mũi tên/nắm đấm
  const attackEffect = document.createElement('div');
  if (isComp) {
    attackEffect.classList.add('speedUpEffect'); // Class CSS để định dạng hiệu ứng
  } else {
    attackEffect.classList.add('speedUpEffect'); // Class CSS để định dạng hiệu ứng
  }

  document.body.appendChild(attackEffect);

  // Lấy vị trí của skill tấn công để tạo mũi tên bắt đầu từ đó
  const skillRect = skill.getBoundingClientRect();

  // Đặt vị trí ban đầu của mũi tên/nắm đấm
  attackEffect.style.position = 'absolute';
  attackEffect.style.left = `${skillRect.left + skillRect.width / 2}px`;
  attackEffect.style.top = `${skillRect.top + skillRect.height / 2}px`;
  // Tính toán độ di chuyển tới mục tiêu
  const targetX = targetRect.left + targetRect.width / 2;
  const targetY = targetRect.top;

  // Tạo hiệu ứng di chuyển (mũi tên bay tới mục tiêu)
  const moveEffect = () => {
    const duration = 500; // Thời gian di chuyển (ms)
    const deltaX = targetX - (skillRect.left + skillRect.width / 2);
    const deltaY = targetY - (skillRect.top + skillRect.height / 2);

    attackEffect.style.transition = `transform ${duration}ms ease-out`;
    attackEffect.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    // Cập nhật thời gian tăng tốc cho team A hoặc B
    if (isComp) {
      // Tăng thời gian hiệu lực của tăng tốc cho Team A
      if (totalSpeedDownTimeA > 0) {
        const remainingDame = totalSpeedDownTimeA - dameSkill
        if (remainingDame > 0) {
          totalSpeedDownTimeA = remainingDame;
        } else {
          totalSpeedDownTimeA = 0;
          totalSpeedUpTimeA += Math.abs(remainingDame);
        }
      } else {
        totalSpeedUpTimeA += dameSkill;
      }
    } else {
      // Tăng thời gian hiệu lực của tăng tốc cho Team B
      if (totalSpeedDownTimeB > 0) {
        const remainingDame = totalSpeedDownTimeB - dameSkill
        if (remainingDame > 0) {
          totalSpeedDownTimeB = remainingDame;
        } else {
          totalSpeedDownTimeB = 0;
          totalSpeedUpTimeB += Math.abs(remainingDame);
        }
      } else {
        totalSpeedUpTimeB += dameSkill;
      }
    }
      // Xóa phần tử sau khi hiệu ứng kết thúc
    setTimeout(() => {
      attackEffect.remove();
    }, duration);
  };
  // Bắt đầu hiệu ứng di chuyển
  setTimeout(moveEffect, 100); // Chờ một chút sau khi hiệu ứng skill bắt đầu
}

//Skill giảm tốc
let totalSpeedDownTimeA = 0; // Thời gian tổng cộng hiệu lực tăng tốc cho team A
let totalSpeedDownTimeB = 0; // Thời gian tổng cộng hiệu lực tăng tốc cho team B

function skillSpeedDown(skillKey, dameSkill, isComp) {
  const cooldownBarTime = isComp? document.getElementById("cooldownSkillB"):document.getElementById("cooldownSkillA")
  const targetRect = cooldownBarTime.getBoundingClientRect(); // Lấy vị trí của skill bị
  const skill = document.getElementById(skillKey)
  const teamAorB = skillKey.includes('A') ? 'TeamA' : 'TeamB';

  // Hiệu ứng cho thanh skill 
  if (teamAorB == 'TeamA') { //bên A
    skill.classList.add('attackingSkillA');
    setTimeout(() => skill.classList.remove('attackingSkillA'), 500);
  } else { //bên B
    skill.classList.add('attackingSkillB');
    setTimeout(() => skill.classList.remove('attackingSkillB'), 500);
  }

  // Tạo mũi tên/nắm đấm
  const attackEffect = document.createElement('div');
  if (isComp) {
    attackEffect.classList.add('speedDownEffect'); // Class CSS để định dạng hiệu ứng
  } else {
    attackEffect.classList.add('speedDownEffect'); // Class CSS để định dạng hiệu ứng
  }

  document.body.appendChild(attackEffect);

  // Lấy vị trí của skill tấn công để tạo mũi tên bắt đầu từ đó
  const skillRect = skill.getBoundingClientRect();

  // Đặt vị trí ban đầu của mũi tên/nắm đấm
  attackEffect.style.position = 'absolute';
  attackEffect.style.left = `${skillRect.left + skillRect.width / 2}px`;
  attackEffect.style.top = `${skillRect.top + skillRect.height / 2}px`;
  // Tính toán độ di chuyển tới mục tiêu
  const targetX = targetRect.left + targetRect.width / 2;
  const targetY = targetRect.top + targetRect.height / 2;

  // Tạo hiệu ứng di chuyển (mũi tên bay tới mục tiêu)
  const moveEffect = () => {
    const duration = 500; // Thời gian di chuyển (ms)
    const deltaX = targetX - (skillRect.left + skillRect.width / 2);
    const deltaY = targetY - (skillRect.top + skillRect.height / 2);

    attackEffect.style.transition = `transform ${duration}ms ease-out`;
    attackEffect.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    // Cập nhật thời gian tăng tốc cho team A hoặc B
    if (isComp) {
      // Tăng thời gian hiệu lực của tăng tốc hoặc giảm tốc cho Team A
      if (totalSpeedUpTimeB > 0) {
        const remainingDame = totalSpeedUpTimeB - dameSkill;
        if (remainingDame > 0) {
          totalSpeedUpTimeB = remainingDame; // Vẫn còn tăng tốc
        } else {
          totalSpeedUpTimeB = 0; // Hết tăng tốc
          totalSpeedDownTimeB += Math.abs(remainingDame); // Phần dư chuyển sang giảm tốc
        }
      } else {
        totalSpeedDownTimeB += dameSkill;
      }
    } else {
      // Tăng thời gian hiệu lực của tăng tốc hoặc giảm tốc cho Team B
      if (totalSpeedUpTimeA > 0) {
        const remainingDame = totalSpeedUpTimeA - dameSkill;
        if (remainingDame > 0) {
          totalSpeedUpTimeA = remainingDame; // Vẫn còn tăng tốc
        } else {
          totalSpeedUpTimeA = 0; // Hết tăng tốc
          totalSpeedDownTimeA += Math.abs(remainingDame); // Phần dư chuyển sang giảm tốc
        }
      } else {
        totalSpeedDownTimeA += dameSkill;
      }
    }
    
    // Xóa phần tử sau khi hiệu ứng kết thúc
    setTimeout(() => {
      attackEffect.remove();
    }, duration);
  };
  // Bắt đầu hiệu ứng di chuyển
  setTimeout(moveEffect, 100); // Chờ một chút sau khi hiệu ứng skill bắt đầu
}

//Hàm hiển thị số sát thương cộng thêm của burn/poison bay số
function effectNumberAtAttack(skillId, dameSkill, effect, isCrit) {
    const effectNumberDiv = document.createElement('div');
    
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
  if (effect==="Heal") {
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
  } else if (effect==="Poison") {
    // Xử lý khi gây sát thương Poison
    currentHp = Math.max(currentHp - dameSkill, 0);
  } else if (effect==="Shield") {
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
  if (dameSkill<=0) {

  } else {
    effectHpBarUpdate(effectContainer, dameSkill, effect);
  }
}



// Function tạo hiệu ứng trừ máu/cộng máu hiện ra khi bị trừ/cộng ở thanh Hp
function effectHpBarUpdate(effectContainer, dameSkill, effect) {
  const effectDiv = document.createElement('div');
  //Thêm hiệu ứng vào div
  if (effect==="Burn") {
    effectDiv.classList.add('effect','burn')
    effectDiv.innerText = `-${dameSkill}`
  } else if (effect==="overTime") {
    effectDiv.classList.add('effect','damage')
    effectDiv.innerText = `-${dameSkill}`
  } else if (effect==="Poison") {
    effectDiv.classList.add('effect','poison')
    effectDiv.innerText = `-${dameSkill}`
  } else if (effect==="Freeze") {
    effectDiv.classList.add('effect','freeze')
    effectDiv.innerText = `❄${dameSkill/1000}s`
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
  }, 2000);
}


function applyAtkEffect(teamAtk) {
    let teamElement = document.getElementById(teamAtk); // 'TeamA' hoặc 'TeamB'
    let teamHit = teamAtk === 'TeamA' ? 'TeamB' : 'TeamA';

    //Hiệu ứng cho bên bị tấn công
    if (teamHit=='TeamA') {
      document.getElementById(teamHit).classList.add('hit');
    } else {
      document.getElementById(teamHit).classList.add('hit');
    }

    // Sau một khoảng thời gian (ví dụ 0.3s), loại bỏ hiệu ứng
    setTimeout(function() {
      if (teamHit=='TeamA') {
        document.getElementById(teamHit).classList.remove('hit');
      } else {
        document.getElementById(teamHit).classList.remove('hit');
      }
    }, 300);

}

//Tạo popup hiển thị thông tin STT skill =====Dĩ vãng=====
function createInfoSkill() {
  document.querySelectorAll('.skill').forEach(skill => {
    if (!skill.dataset.hasEvent) {
      skill.addEventListener('click', function(event) {
        // Lấy id skill
        //+++++++++++++
        const skillId = skill.parentElement?.id || '';
        const slotSkill = skill.parentElement?.parentElement?.id || '';

        // Ngừng sự kiện click của skill để không kích hoạt sự kiện click toàn bộ trang
        event.stopPropagation();

        const popup = document.getElementById('popupSTT');

        let skillInfo = null;
        console.log("skillId", skillId)
        console.log("slotSkill", slotSkill)

        if (slotSkill === "battleShop" && typeGameConquest.battlePetInShop?.[skillId]) {
          skillInfo = typeGameConquest.battlePetInShop[skillId];
        } else if (slotSkill === "battleInventory" && typeGameConquest.battlePetInInventory?.[skillId]) {
          skillInfo = typeGameConquest.battlePetInInventory[skillId];
        } else if (
          (slotSkill === "skillBarB" || slotSkill === "skillBarA") &&
          typeGameConquest.skillBattle?.[skillId]
        ) {
          skillInfo = typeGameConquest.skillBattle[skillId];
          console.log("vào đây", skillInfo)
        } else if (slotSkill === "skillBarBfn") {
          skillInfo = skillFinalGame[skillId]
        } else if (slotSkill === "slotGacha") {
          skillInfo = randomPet[skillId];
        }
      
        textPopupInfoSkill(skillInfo,"inGame");
        
        // Lấy tọa độ của effectContainerB
        const effectContainerB = document.getElementById(skill.id);
        const effectContainerRect = effectContainerB.getBoundingClientRect();
        const effectContainerScreenBattle = slotSkill === "slotGacha"?document.getElementById("shopScreen"):document.getElementById("ScreenBattle");
        const screenBattleRect = effectContainerScreenBattle.getBoundingClientRect(); // Tọa độ cố định
        const screenBattleMidpoint = screenBattleRect.left + (screenBattleRect.width / 2); // Tọa độ giữa của ScreenBattle

        // Lấy thông tin kích thước của popup
        popup.style.display = 'flex'; // Hiển thị tạm để lấy kích thước
        const popupWidth = popup.offsetWidth;
        const popupHeight = popup.offsetHeight;
        popup.style.display = 'none'; // Ẩn lại trước khi định vị

        // Tính toán vị trí cho popup
        let popupLeft = 0;
        let popupTop = 0;
        if (slotSkill === "battleShop" || slotSkill === "skillBarA") { //Vị trí ở shop
          if (effectContainerRect.left < screenBattleMidpoint){ //Ở bên trái
            popupLeft = effectContainerRect.left + window.scrollX;
          } else {//Ở bên phải
            popupLeft = effectContainerRect.right + window.scrollX - popupWidth;
          }
          popupTop = effectContainerRect.bottom + window.scrollY + 10;
        } else if (slotSkill === "battleInventory") {
          console.log(effectContainerRect.left, screenBattleMidpoint)
          if (effectContainerRect.left < screenBattleMidpoint){ //Ở bên trái
            popupLeft = effectContainerRect.right + window.scrollX;
          } else {//Ở bên phải
            popupLeft = effectContainerRect.left + window.scrollX - popupWidth;
          }
          popupTop = effectContainerRect.bottom + window.scrollY - popupHeight;
        } else if (slotSkill === "skillBarB" || slotSkill === "skillBarBfn"){
          if (effectContainerRect.left < screenBattleMidpoint){ //Ở bên trái
            popupLeft = effectContainerRect.left + window.scrollX;
          } else {//Ở bên phải
            popupLeft = effectContainerRect.right + window.scrollX - popupWidth;
          }
          popupTop = effectContainerRect.top + window.scrollY - popupHeight - 10;
        } else if (slotSkill === "slotGacha") {
          if (effectContainerRect.left < screenBattleMidpoint){ //Ở bên trái
            popupLeft = effectContainerRect.right + window.scrollX;
          } else {//Ở bên phải
            popupLeft = effectContainerRect.left + window.scrollX - popupWidth;
          }
          popupTop = effectContainerRect.bottom + window.scrollY - popupHeight;
        }
        // Dịch chuyển popup sao cho mép dưới của popup trùng với mép dưới của effectContainerB

        // Cập nhật vị trí cho popup
        popup.style.left = `${popupLeft}px`;
        popup.style.top = `${popupTop}px`;

        // Hiển thị popup
        if (slotSkill === "skillBarBfn") {
          popup.style.zIndex = 1500;
        } else {
          popup.style.zIndex = 100;
        }
        popup.style.display = 'flex';

      });
      skill.dataset.hasEvent = "true"; // Đánh dấu đã thêm sự kiện
    }
  });
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

        const popup = document.getElementById("popupSTT5Mon");
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
        setupPopupInfo5MonInBattle(skillInfo);

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

        if (!popup.dataset.hasEvent) {
          popup.addEventListener("click", () => {
            popup.style.display = "none";
            overlay.style.display = "none";
          });
          popup.dataset.hasEvent = "true";
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

      name = `<span style="display: flex; justify-content: space-between; flex-direction: row; align-items: center;">
                  <a>${nameUser}</a>
                  <a style="font-size:11px;">[Điểm xếp hạng: ${pointRank}]<span style="color: red;"> [Top: 1]</span></a>
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
document.getElementById("imageContainerUser").addEventListener("click", function(event) {
  showPopupInfo(this, "user");  // Hiển thị thông tin cho người chơi
  event.stopPropagation(); // Ngừng sự kiện truyền lên parent để tránh đóng popup khi click vào các phần tử con
});

document.getElementById("imageContainerComp").addEventListener("click", function(event) {
  showPopupInfo(this, "comp");  // Hiển thị thông tin cho đối thủ
  event.stopPropagation(); // Ngừng sự kiện truyền lên parent để tránh đóng popup khi click vào các phần tử con
});

// Lắng nghe sự kiện click bất kỳ để đóng popup
document.addEventListener('click', function() {
  const popup = document.getElementById('popupInfoMyOrComp');
  if (popup.style.display === 'flex') {
    popup.style.display = 'none';
  }
});

// Lắng nghe sự kiện click toàn bộ trang để ẩn popup khi click ở bất kỳ đâu ngoài popup
document.addEventListener('click', function() {
  const popup = document.getElementById('popupSTT');
  if (popup.style.display === 'flex') {
    popup.style.display = 'none';
  }
});

//Tạo hiệu ứng skill theo level
function highlightSkillLevel() {
  document.querySelectorAll('.skill').forEach(skillElement => {
    // Parse data-skill JSON
    const skillData = JSON.parse(skillElement.getAttribute('data-skill'));
    
    // Tìm div con có class levelSkillText
    const levelTextDiv = skillElement.querySelector('.levelSkillText');

    if (levelTextDiv) {
      levelTextDiv.innerText = skillData.LEVEL; // Cập nhật số Level vào div con
    }

    // Tìm div con có class levelSkillText
    const levelSkillColorDiv = skillElement.querySelector('.levelSkillColor');

    if (levelSkillColorDiv) {
      if (skillData.LEVEL === 1) {
        levelSkillColorDiv.style.color = "#531515"
      }
      if (skillData.LEVEL === 2) {
        levelSkillColorDiv.style.color = "#8c0b0b"
      }
      if (skillData.LEVEL === 3) {
        levelSkillColorDiv.style.color = "#c00d0d"
      }
      if (skillData.LEVEL === 4) {
        levelSkillColorDiv.style.color = "red"
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
        shopSell.classList.add("shopSellHighLight");
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
      shopSell.classList.remove("shopSellHighLight");
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
      const skill = document.getElementById(skillId);


      const parentSlot = skill.parentElement;
      //Lấy thông tin của skill target để nâng cấp

      // Kiểm tra nếu skill được kéo và thả lại đúng slot cũ
      if (slot === parentSlot) {
          return;
      }

      // Kéo từ shop xuống
      if (parentSlot.parentElement.id == "battleShop") {
        //Kiểm tra nếu không đủ star
        if (typeGameConquest.starUser < price5MonConquest) {
          messageOpen(`Không đủ <i class="fa-solid fa-splotch"></i>, cần có ${price5MonConquest} <i class="fa-solid fa-splotch"></i>`)
          slot.style.backgroundColor = ""
          return;
        }

        if (slot.classList.contains("occupied")) { // Kiểm tra slot có skill chưa
          if (typeGameConquest.battlePetInShop[skill.parentElement.id].ID === typeGameConquest.skillBattle[slot.id].ID && Number(typeGameConquest.battlePetInShop[skill.parentElement.id].LEVEL) === Number(typeGameConquest.skillBattle[slot.id].LEVEL) && Number(typeGameConquest.skillBattle[slot.id].LEVEL) < 4) {


            //Tìm thông tin từ Allpets để gán thông tin vào để nâng cấp
            for (let p = 0; p < allPets.length; p++) {
              const pData = allPets[p];
              if (pData.ID === typeGameConquest.battlePetUseSlotRound[slot.id].ID && Number(pData.LEVEL) === typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL + 1) {
                typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL = pData.LEVEL
                typeGameConquest.battlePetUseSlotRound[slot.id].DAME[0] = pData.DAME[0]
                typeGameConquest.battlePetUseSlotRound[slot.id].HEAL[0] = pData.HEAL[0]
                typeGameConquest.battlePetUseSlotRound[slot.id].SHIELD[0] = pData.SHIELD[0]
                typeGameConquest.battlePetUseSlotRound[slot.id].BURN[0] = pData.BURN[0]
                typeGameConquest.battlePetUseSlotRound[slot.id].POISON[0] = pData.POISON[0]
                typeGameConquest.battlePetUseSlotRound[slot.id].CRIT[0] = pData.CRIT[0]
                typeGameConquest.battlePetUseSlotRound[slot.id].COOLDOWN[0] = pData.COOLDOWN[0]
                typeGameConquest.battlePetUseSlotRound[slot.id].COOLDOWN[1] = pData.COOLDOWN[1]

                typeGameConquest.skillBattle[slot.id].LEVEL = pData.LEVEL
                typeGameConquest.skillBattle[slot.id].DAME[0] = pData.DAME[0]
                typeGameConquest.skillBattle[slot.id].HEAL[0] = pData.HEAL[0]
                typeGameConquest.skillBattle[slot.id].SHIELD[0] = pData.SHIELD[0]
                typeGameConquest.skillBattle[slot.id].BURN[0] = pData.BURN[0]
                typeGameConquest.skillBattle[slot.id].POISON[0] = pData.POISON[0]
                typeGameConquest.skillBattle[slot.id].CRIT[0] = pData.CRIT[0]
                typeGameConquest.skillBattle[slot.id].COOLDOWN[0] = pData.COOLDOWN[0]
                typeGameConquest.skillBattle[slot.id].COOLDOWN[1] = pData.COOLDOWN[1]
                break;
              }
            };
            

            // Xóa kỹ năng khỏi battlePetInShop
            typeGameConquest.battlePetInShop[skill.parentElement.id] = {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]};


            // Xóa kỹ năng html shop (div skill Shop)
            skill.remove();

            //Nâng data-skill LEVEL lên để tạo highlight
            const skillDiv = slot.querySelector(".skill"); // Lấy div skill con
            if (skillDiv) {
              const skillData = JSON.parse(skillDiv.dataset.skill); // Lấy data-skill
              skillData.LEVEL += 1; // Tăng LEVEL lên
              skillDiv.dataset.skill = JSON.stringify(skillData); // Cập nhật lại data-skill

             }
            highlightSkillLevel();
            updateSttForSkillAffter();
            
            typeGameConquest.starUser -= price5MonConquest
            typeGameConquest.selectSkillShop += 1
            price5MonConquest = typeGameConquest.selectSkillShop + typeGameConquest.price5Mon
            document.getElementById("battleShopText").innerText = price5MonConquest;
            document.getElementById("starUser").innerText = typeGameConquest.starUser;
          } else {

          }

        } else {


          //Thêm skill vào battlePetUseSlotRound
          typeGameConquest.battlePetUseSlotRound[slot.id] = typeGameConquest.battlePetInShop[skill.parentElement.id]


          typeGameConquest.skillBattle[slot.id] = typeGameConquest.battlePetInShop[skill.parentElement.id]


          typeGameConquest.battlePetInShop[skill.parentElement.id] = {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]}; // Xóa kỹ năng khỏi battlePetInShop


          //Chuyển slot mới thành đầy    
          slot.prepend(skill);
          slot.classList.add("occupied");
          slot.style.backgroundColor = "";
          highlightSkillLevel();
          updateSttForSkillAffter();

          typeGameConquest.starUser -= price5MonConquest
          typeGameConquest.selectSkillShop += 1
          price5MonConquest = typeGameConquest.selectSkillShop + typeGameConquest.price5Mon
          document.getElementById("battleShopText").innerText = price5MonConquest;
          document.getElementById("starUser").innerText = typeGameConquest.starUser;
        }
      } else if (parentSlot.parentElement.id == "battleInventory") {//Kéo từ tủ đồ xuống
        console.log("Kéo từ tủ đồ 1")
        if (slot.classList.contains("occupied")) { // Kiểm tra slot có skill chưa

          if (typeGameConquest.battlePetInInventory[skill.parentElement.id].ID === typeGameConquest.skillBattle[slot.id].ID && Number(typeGameConquest.battlePetInInventory[skill.parentElement.id].LEVEL) === Number(typeGameConquest.skillBattle[slot.id].LEVEL) && Number(typeGameConquest.skillBattle[slot.id].LEVEL) < 4) {
            console.log("Kéo từ tủ đồ 2 - nâng cấp")

            //Tìm thông tin từ Allpets để gán thông tin vào để nâng cấp
            for (let p = 0; p < allPets.length; p++) {
              const pData = allPets[p];
              if (pData.ID === typeGameConquest.battlePetUseSlotRound[slot.id].ID && Number(pData.LEVEL) === typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL + 1) {
                console.log("Kéo từ tủ đồ 3 - nâng cấp thành công")
                typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL = pData.LEVEL
                typeGameConquest.battlePetUseSlotRound[slot.id].DAME[0] = pData.DAME[0]
                typeGameConquest.battlePetUseSlotRound[slot.id].HEAL[0] = pData.HEAL[0]
                typeGameConquest.battlePetUseSlotRound[slot.id].SHIELD[0] = pData.SHIELD[0]
                typeGameConquest.battlePetUseSlotRound[slot.id].BURN[0] = pData.BURN[0]
                typeGameConquest.battlePetUseSlotRound[slot.id].POISON[0] = pData.POISON[0]
                typeGameConquest.battlePetUseSlotRound[slot.id].CRIT[0] = pData.CRIT[0]
                typeGameConquest.battlePetUseSlotRound[slot.id].COOLDOWN[0] = pData.COOLDOWN[0]
                typeGameConquest.battlePetUseSlotRound[slot.id].COOLDOWN[1] = pData.COOLDOWN[1]

                typeGameConquest.skillBattle[slot.id].LEVEL = pData.LEVEL
                typeGameConquest.skillBattle[slot.id].DAME[0] = pData.DAME[0]
                typeGameConquest.skillBattle[slot.id].HEAL[0] = pData.HEAL[0]
                typeGameConquest.skillBattle[slot.id].SHIELD[0] = pData.SHIELD[0]
                typeGameConquest.skillBattle[slot.id].BURN[0] = pData.BURN[0]
                typeGameConquest.skillBattle[slot.id].POISON[0] = pData.POISON[0]
                typeGameConquest.skillBattle[slot.id].CRIT[0] = pData.CRIT[0]
                typeGameConquest.skillBattle[slot.id].COOLDOWN[0] = pData.COOLDOWN[0]
                typeGameConquest.skillBattle[slot.id].COOLDOWN[1] = pData.COOLDOWN[1]
                break;
              }
            };
            


            // Xóa kỹ năng khỏi battlePetInInventory
            typeGameConquest.battlePetInInventory[skill.parentElement.id] = {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]};


            //Chuyển slot cũ thành trống
            parentSlot.classList.remove("occupied")

            // Xóa kỹ năng html shop (div skill Shop)
            skill.remove();

            const skillDiv = slot.querySelector(".skill"); // Lấy div skill con
            if (skillDiv) {
              const skillData = JSON.parse(skillDiv.dataset.skill); // Lấy data-skill
              skillData.LEVEL += 1; // Tăng LEVEL lên
              skillDiv.dataset.skill = JSON.stringify(skillData); // Cập nhật lại data-skill

             }
            highlightSkillLevel();
            updateSttForSkillAffter()

          } else {
            

            // Đổi chỗ dữ liệu trong typeGameConquest.skillBattle và battlePetInInventory
            const tempSkill = typeGameConquest.battlePetInInventory[skill.parentElement.id];
            typeGameConquest.battlePetInInventory[skill.parentElement.id] = typeGameConquest.skillBattle[slot.id];
            typeGameConquest.skillBattle[slot.id] = tempSkill;

            // Đổi chỗ skill trong HTML
            const currentSkill = slot.querySelector(".skill"); // Skill hiện tại trong slot
            const parentSkill = skill; // Skill từ parentSlot

            if (currentSkill && parentSkill) {
              const parentSlot = parentSkill.parentElement;
              parentSlot.appendChild(currentSkill); // Đưa skill từ slot vào parentSlot
              slot.appendChild(parentSkill); // Đưa skill từ parentSlot vào slot
            }

            console.log("Kéo từ tủ đồ 5 - đổi chỗ", typeGameConquest.battlePetInInventory, typeGameConquest.skillBattle);
          }

        } else {
          console.log("Kéo từ tủ đồ 4")

          //Thêm skill vào battlePetUseSlotRound
          typeGameConquest.battlePetUseSlotRound[slot.id] = typeGameConquest.battlePetInInventory[skill.parentElement.id]


          typeGameConquest.skillBattle[slot.id] = typeGameConquest.battlePetInInventory[skill.parentElement.id]


          typeGameConquest.battlePetInInventory[skill.parentElement.id] = {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]}; // Xóa kỹ năng khỏi battlePetInInventory

          //Chuyển slot cũ thành trống
          parentSlot.classList.remove("occupied")

          //Chuyển slot mới thành đầy
          slot.prepend(skill);
          slot.classList.add("occupied");
          slot.style.backgroundColor = "";
          highlightSkillLevel();
          updateSttForSkillAffter();
        }

      } else if (parentSlot.parentElement.id == "skillBarB") {

        if (slot.classList.contains("occupied")) { // Kiểm tra slot có skill chưa

          if (typeGameConquest.skillBattle[skill.parentElement.id].ID === typeGameConquest.skillBattle[slot.id].ID && Number(typeGameConquest.skillBattle[skill.parentElement.id].LEVEL) === Number(typeGameConquest.skillBattle[slot.id].LEVEL) && Number(typeGameConquest.skillBattle[slot.id].LEVEL) < 4) {


            //Tìm thông tin từ Allpets để gán thông tin vào để nâng cấp
            for (let p = 0; p < allPets.length; p++) {
              const pData = allPets[p];
              if (pData.ID === typeGameConquest.battlePetUseSlotRound[slot.id].ID && Number(pData.LEVEL) === typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL + 1) {
                typeGameConquest.battlePetUseSlotRound[slot.id].LEVEL = pData.LEVEL
                typeGameConquest.battlePetUseSlotRound[slot.id].DAME[0] = pData.DAME[0]
                typeGameConquest.battlePetUseSlotRound[slot.id].HEAL[0] = pData.HEAL[0]
                typeGameConquest.battlePetUseSlotRound[slot.id].SHIELD[0] = pData.SHIELD[0]
                typeGameConquest.battlePetUseSlotRound[slot.id].BURN[0] = pData.BURN[0]
                typeGameConquest.battlePetUseSlotRound[slot.id].POISON[0] = pData.POISON[0]
                typeGameConquest.battlePetUseSlotRound[slot.id].CRIT[0] = pData.CRIT[0]
                typeGameConquest.battlePetUseSlotRound[slot.id].COOLDOWN[0] = pData.COOLDOWN[0]
                typeGameConquest.battlePetUseSlotRound[slot.id].COOLDOWN[1] = pData.COOLDOWN[1]

                typeGameConquest.skillBattle[slot.id].LEVEL = pData.LEVEL
                typeGameConquest.skillBattle[slot.id].DAME[0] = pData.DAME[0]
                typeGameConquest.skillBattle[slot.id].HEAL[0] = pData.HEAL[0]
                typeGameConquest.skillBattle[slot.id].SHIELD[0] = pData.SHIELD[0]
                typeGameConquest.skillBattle[slot.id].BURN[0] = pData.BURN[0]
                typeGameConquest.skillBattle[slot.id].POISON[0] = pData.POISON[0]
                typeGameConquest.skillBattle[slot.id].CRIT[0] = pData.CRIT[0]
                typeGameConquest.skillBattle[slot.id].COOLDOWN[0] = pData.COOLDOWN[0]
                typeGameConquest.skillBattle[slot.id].COOLDOWN[1] = pData.COOLDOWN[1]
                break;
              }
            };

            // Xóa kỹ năng khỏi typeGameConquest.skillBattle
            typeGameConquest.skillBattle[skill.parentElement.id] = {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]};
            typeGameConquest.battlePetUseSlotRound[skill.parentElement.id] = {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]}; // Xóa kỹ năng khỏi battlePetUseSlotRound


            //Chuyển slot cũ thành trống
            parentSlot.classList.remove("occupied")

            // Xóa kỹ năng html shop (div skill Shop)
            skill.remove();

            const skillDiv = slot.querySelector(".skill"); // Lấy div skill con
            if (skillDiv) {
              const skillData = JSON.parse(skillDiv.dataset.skill); // Lấy data-skill
              skillData.LEVEL += 1; // Tăng LEVEL lên
              skillDiv.dataset.skill = JSON.stringify(skillData); // Cập nhật lại data-skill

             }
            highlightSkillLevel();
            updateSttForSkillAffter();

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

            console.log("Kéo từ tủ đồ 5 - đổi chỗ", typeGameConquest.battlePetInInventory, typeGameConquest.skillBattle);

          }

        } else {


          //Thêm skill vào battlePetUseSlotRound
          typeGameConquest.battlePetUseSlotRound[slot.id] = typeGameConquest.skillBattle[skill.parentElement.id]


          typeGameConquest.skillBattle[slot.id] = typeGameConquest.skillBattle[skill.parentElement.id]


          typeGameConquest.skillBattle[skill.parentElement.id] = {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]}; // Xóa kỹ năng khỏi typeGameConquest.skillBattle
          typeGameConquest.battlePetUseSlotRound[skill.parentElement.id] = {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]}; // Xóa kỹ năng khỏi battlePetUseSlotRound


          //Chuyển slot cũ thành trống
          parentSlot.classList.remove("occupied")

          //Chuyển slot mới thành đầy
          slot.prepend(skill);
          slot.classList.add("occupied");
          slot.style.backgroundColor = "";
          highlightSkillLevel();
          updateSttForSkillAffter();
        }
      } else {
        slot.style.backgroundColor = "";
      }
      //Cập nhật chỉ số tăng từ bị động Internal [2]
      internalUp();
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
      const skill = document.getElementById(skillId);
      
      const parentSlot = skill.parentElement;
      //Lấy thông tin của skill target để nâng cấp

      // Kiểm tra nếu skill được kéo và thả lại đúng slot cũ
      if (slot === parentSlot) {
          return;
      }

      // Kéo từ shop xuống
      if (parentSlot.parentElement.id == "battleShop") {
        //Kiểm tra nếu không đủ star
        if (typeGameConquest.starUser < price5MonConquest) {
          messageOpen(`Không đủ <i class="fa-solid fa-splotch"></i>, cần có ${price5MonConquest} <i class="fa-solid fa-splotch"></i>`)
          slot.style.backgroundColor = ""
          return;
        }

        if (slot.classList.contains("occupied")) { // Kiểm tra slot có skill chưa
          if (typeGameConquest.battlePetInShop[skill.parentElement.id].ID == typeGameConquest.battlePetInInventory[slot.id].ID && Number(typeGameConquest.battlePetInShop[skill.parentElement.id].LEVEL) === Number(typeGameConquest.battlePetInInventory[slot.id].LEVEL)) {

            //Tìm thông tin từ Allpets để gán thông tin vào để nâng cấp
            for (let p = 0; p < allPets.length; p++) {
              const pData = allPets[p];
              if (pData.ID === typeGameConquest.battlePetInInventory[slot.id].ID && Number(pData.LEVEL) === typeGameConquest.battlePetInInventory[slot.id].LEVEL + 1) {
                typeGameConquest.battlePetInInventory[slot.id].LEVEL = pData.LEVEL
                typeGameConquest.battlePetInInventory[slot.id].DAME[0] = pData.DAME[0]
                typeGameConquest.battlePetInInventory[slot.id].DAME[0] = pData.DAME[0]
                typeGameConquest.battlePetInInventory[slot.id].HEAL[0] = pData.HEAL[0]
                typeGameConquest.battlePetInInventory[slot.id].SHIELD[0] = pData.SHIELD[0]
                typeGameConquest.battlePetInInventory[slot.id].BURN[0] = pData.BURN[0]
                typeGameConquest.battlePetInInventory[slot.id].POISON[0] = pData.POISON[0]
                typeGameConquest.battlePetInInventory[slot.id].CRIT[0] = pData.CRIT[0]
                typeGameConquest.battlePetInInventory[slot.id].COOLDOWN[0] = pData.COOLDOWN[0]
                typeGameConquest.battlePetInInventory[slot.id].COOLDOWN[1] = pData.COOLDOWN[1]
                break;
              }
            };

            // Xóa kỹ năng khỏi battlePetInShop
            typeGameConquest.battlePetInShop[skill.parentElement.id] = {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]};

            // Xóa kỹ năng html shop (div skill Shop)
            skill.remove();

            const skillDiv = slot.querySelector(".skill"); // Lấy div skill con
            if (skillDiv) {
              const skillData = JSON.parse(skillDiv.dataset.skill); // Lấy data-skill
              skillData.LEVEL += 1; // Tăng LEVEL lên
              skillDiv.dataset.skill = JSON.stringify(skillData); // Cập nhật lại data-skill
             }
            highlightSkillLevel();
            updateSttForSkillAffter();

            typeGameConquest.starUser -= price5MonConquest
            typeGameConquest.selectSkillShop += 1
            price5MonConquest = typeGameConquest.selectSkillShop + typeGameConquest.price5Mon
            document.getElementById("battleShopText").innerText = price5MonConquest;
            document.getElementById("starUser").innerText = typeGameConquest.starUser;
          } else {
          }
          
        } else {

          //Thêm skill vào battlePetUseSlotRound
          typeGameConquest.battlePetInInventory[slot.id] = typeGameConquest.battlePetInShop[skill.parentElement.id]

          typeGameConquest.battlePetInShop[skill.parentElement.id] = {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]}; // Xóa kỹ năng khỏi battlePetInShop

          //Chuyển slot mới thành đầy    
          slot.prepend(skill);
          slot.classList.add("occupied");
          slot.style.backgroundColor = "";
          highlightSkillLevel();
          updateSttForSkillAffter();

          typeGameConquest.starUser -= price5MonConquest
          typeGameConquest.selectSkillShop += 1
          price5MonConquest = typeGameConquest.selectSkillShop + typeGameConquest.price5Mon
          document.getElementById("battleShopText").innerText = price5MonConquest;
          document.getElementById("starUser").innerText = typeGameConquest.starUser;
        }

      } else if (parentSlot.parentElement.id == "battleInventory") {//Kéo từ tủ đồ sang
        if (slot.classList.contains("occupied")) { // Kiểm tra slot có skill chưa
          if (typeGameConquest.battlePetInInventory[skill.parentElement.id].ID == typeGameConquest.battlePetInInventory[slot.id].ID && Number(typeGameConquest.battlePetInInventory[skill.parentElement.id].LEVEL) === Number(typeGameConquest.battlePetInInventory[slot.id].LEVEL)) {

            //Tìm thông tin từ Allpets để gán thông tin vào để nâng cấp
            for (let p = 0; p < allPets.length; p++) {
              const pData = allPets[p];
              if (pData.ID === typeGameConquest.battlePetInInventory[slot.id].ID && Number(pData.LEVEL) === typeGameConquest.battlePetInInventory[slot.id].LEVEL + 1) {
                typeGameConquest.battlePetInInventory[slot.id].LEVEL = pData.LEVEL
                typeGameConquest.battlePetInInventory[slot.id].DAME[0] = pData.DAME[0]
                typeGameConquest.battlePetInInventory[slot.id].DAME[0] = pData.DAME[0]
                typeGameConquest.battlePetInInventory[slot.id].HEAL[0] = pData.HEAL[0]
                typeGameConquest.battlePetInInventory[slot.id].SHIELD[0] = pData.SHIELD[0]
                typeGameConquest.battlePetInInventory[slot.id].BURN[0] = pData.BURN[0]
                typeGameConquest.battlePetInInventory[slot.id].POISON[0] = pData.POISON[0]
                typeGameConquest.battlePetInInventory[slot.id].CRIT[0] = pData.CRIT[0]
                typeGameConquest.battlePetInInventory[slot.id].COOLDOWN[0] = pData.COOLDOWN[0]
                typeGameConquest.battlePetInInventory[slot.id].COOLDOWN[1] = pData.COOLDOWN[1]
                break;
              }
            };

            // Xóa kỹ năng khỏi battlePetInInventory
            typeGameConquest.battlePetInInventory[skill.parentElement.id] = {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]};

            //Chuyển slot cũ thành trống
            parentSlot.classList.remove("occupied")

            // Xóa kỹ năng html shop (div skill Shop)
            skill.remove();

            const skillDiv = slot.querySelector(".skill"); // Lấy div skill con
            if (skillDiv) {
              const skillData = JSON.parse(skillDiv.dataset.skill); // Lấy data-skill
              skillData.LEVEL += 1; // Tăng LEVEL lên
              skillDiv.dataset.skill = JSON.stringify(skillData); // Cập nhật lại data-skill
             }
            highlightSkillLevel();
            updateSttForSkillAffter();

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

            console.log("Kéo từ tủ đồ 5 - đổi chỗ", typeGameConquest.battlePetInInventory, typeGameConquest.skillBattle);
          }

        } else {

          //Thêm skill vào battlePetInInventory
          typeGameConquest.battlePetInInventory[slot.id] = typeGameConquest.battlePetInInventory[skill.parentElement.id]

          typeGameConquest.battlePetInInventory[skill.parentElement.id] = {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]}; // Xóa kỹ năng khỏi battlePetInInventory
          //Chuyển slot cũ thành trống
          parentSlot.classList.remove("occupied")

          //Chuyển slot mới thành đầy
          slot.prepend(skill);
          slot.classList.add("occupied");
          slot.style.backgroundColor = "";
          highlightSkillLevel();
          updateSttForSkillAffter();
        }

      } else if (parentSlot.parentElement.id == "skillBarB") {
        if (slot.classList.contains("occupied")) { // Kiểm tra slot có skill chưa
          if (typeGameConquest.skillBattle[skill.parentElement.id].ID == typeGameConquest.battlePetInInventory[slot.id].ID && Number(typeGameConquest.skillBattle[skill.parentElement.id].LEVEL) === Number(typeGameConquest.battlePetInInventory[slot.id].LEVEL)) {

            //Tìm thông tin từ Allpets để gán thông tin vào để nâng cấp
            for (let p = 0; p < allPets.length; p++) {
              const pData = allPets[p];
              if (pData.ID === typeGameConquest.battlePetInInventory[slot.id].ID && Number(pData.LEVEL) === typeGameConquest.battlePetInInventory[slot.id].LEVEL + 1) {
                typeGameConquest.battlePetInInventory[slot.id].LEVEL = pData.LEVEL
                typeGameConquest.battlePetInInventory[slot.id].DAME[0] = pData.DAME[0]
                typeGameConquest.battlePetInInventory[slot.id].DAME[0] = pData.DAME[0]
                typeGameConquest.battlePetInInventory[slot.id].HEAL[0] = pData.HEAL[0]
                typeGameConquest.battlePetInInventory[slot.id].SHIELD[0] = pData.SHIELD[0]
                typeGameConquest.battlePetInInventory[slot.id].BURN[0] = pData.BURN[0]
                typeGameConquest.battlePetInInventory[slot.id].POISON[0] = pData.POISON[0]
                typeGameConquest.battlePetInInventory[slot.id].CRIT[0] = pData.CRIT[0]
                typeGameConquest.battlePetInInventory[slot.id].COOLDOWN[0] = pData.COOLDOWN[0]
                typeGameConquest.battlePetInInventory[slot.id].COOLDOWN[1] = pData.COOLDOWN[1]
                break;
              }
            };

            // Xóa kỹ năng khỏi typeGameConquest.skillBattle
            typeGameConquest.skillBattle[skill.parentElement.id] = {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]};
            typeGameConquest.battlePetUseSlotRound[skill.parentElement.id] = {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]}; // Xóa kỹ năng khỏi battlePetUseSlotRound

            //Chuyển slot cũ thành trống
            parentSlot.classList.remove("occupied")

            // Xóa kỹ năng html shop (div skill Shop)
            skill.remove();
            
            const skillDiv = slot.querySelector(".skill"); // Lấy div skill con
            if (skillDiv) {
              const skillData = JSON.parse(skillDiv.dataset.skill); // Lấy data-skill
              skillData.LEVEL += 1; // Tăng LEVEL lên
              skillDiv.dataset.skill = JSON.stringify(skillData); // Cập nhật lại data-skill
             }
            highlightSkillLevel();
            updateSttForSkillAffter();

          } else {
            // Đổi chỗ dữ liệu trong typeGameConquest.skillBattle và battlePetInInventory
            const tempSkill = typeGameConquest.skillBattle[skill.parentElement.id];

            typeGameConquest.skillBattle[skill.parentElement.id] = typeGameConquest.battlePetInInventory[slot.id];
            typeGameConquest.battlePetUseSlotRound[skill.parentElement.id] = typeGameConquest.battlePetInInventory[slot.id];
            typeGameConquest.battlePetInInventory[slot.id] = tempSkill;

            // Đổi chỗ skill trong HTML
            const currentSkill = slot.querySelector(".skill"); // Skill hiện tại trong slot
            const parentSkill = skill; // Skill từ parentSlot

            if (currentSkill && parentSkill) {
              const parentSlot = parentSkill.parentElement;
              parentSlot.appendChild(currentSkill); // Đưa skill từ slot vào parentSlot
              slot.appendChild(parentSkill); // Đưa skill từ parentSlot vào slot
            }

            console.log("Kéo từ tủ đồ 5 - đổi chỗ", typeGameConquest.battlePetInInventory, typeGameConquest.skillBattle);
          }
          

        } else {

          //Thêm skill vào battlePetInInventory
          typeGameConquest.battlePetInInventory[slot.id] = typeGameConquest.skillBattle[skill.parentElement.id]

          typeGameConquest.skillBattle[skill.parentElement.id] = {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]}; // Xóa kỹ năng khỏi typeGameConquest.skillBattle
          typeGameConquest.battlePetUseSlotRound[skill.parentElement.id] = {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]}; // Xóa kỹ năng khỏi battlePetUseSlotRound

          //Chuyển slot cũ thành trống
          parentSlot.classList.remove("occupied")

          //Chuyển slot mới thành đầy
          slot.prepend(skill);
          slot.classList.add("occupied");
          slot.style.backgroundColor = "";
          highlightSkillLevel();
          updateSttForSkillAffter();
        }
        internalUp();
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
    const skillElement = document.getElementById(skillId);

    if (skillElement) {
      if (skillElement.parentElement.parentElement.id !== "battleShop") {

      //Xóa ở trong mảng
        //Skill bán ở trong tủ đồ
        if (skillElement.parentElement.parentElement.id === "battleInventory"){
          let skillSell = typeGameConquest.battlePetInInventory[skillElement.parentElement.id]
          typeGameConquest.battlePetInInventory[skillElement.parentElement.id] = {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"", LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
          BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]};
          //Cộng atk/heal/shield/burn/poison khi bán skill
          skillSell.SELLUP.forEach(sellUpEffect => {
            sellUpSkill(skillSell, sellUpEffect);
          });
        }

        //Skill bán ở slot skill
        if (skillElement.parentElement.parentElement.id === "skillBarB"){
          let skillSell = typeGameConquest.battlePetUseSlotRound[skillElement.parentElement.id]
          typeGameConquest.battlePetUseSlotRound[skillElement.parentElement.id] = {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"", LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
          BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]};

          typeGameConquest.skillBattle[skillElement.parentElement.id] = typeGameConquest.battlePetUseSlotRound[skillElement.parentElement.id]
          //Cộng atk/heal/shield/burn/poison khi bán skill

          skillSell.SELLUP.forEach(sellUpEffect => {
            sellUpSkill(skillSell, sellUpEffect);
          });
          internalUp();
        }


        // Xử lý logic bán kỹ năng
        skillElement.parentElement.classList.remove("occupied")
        skillElement.remove(); // Xóa skill khỏi giao diện
      
      }
      slots.forEach(slot => slot.classList.remove("highlight"));
      slots.forEach(slot => slot.classList.remove("updateSkill"));
      shopSell.classList.remove("shopSellHighLight");
    }
  });
};

//Hàm tăng điểm khi bán skill +++
function sellUpSkill(skill,sellUpEffect) {
  const sellUpDame = eval(effectsSellUp[sellUpEffect].dameSellUp)

  if (sellUpEffect ==="SUpHp") {
    typeGameConquest.maxHpBattle += sellUpDame
    nowHpBattleMy = (typeGameConquest.maxHpBattle + maxHpUp);
    updateHpbar();
  }

  if (sellUpEffect ==="SUpDameAll") {
    for (let i in typeGameConquest.battlePetUseSlotRound) {
      const data = typeGameConquest.battlePetUseSlotRound[i];
      if (data.EFFECT.includes("Attacking")) {
        data.DAME[1] += sellUpDame
        updateSttForSkillAffter();
      }
    }
  }

  if (sellUpEffect ==="SUpDameLeft") {
    for (let i in typeGameConquest.battlePetUseSlotRound) {
      const data = typeGameConquest.battlePetUseSlotRound[i];
      if (data.EFFECT.includes("Attacking") && data.ID !== "") {
        data.DAME[1] += sellUpDame
        updateSttForSkillAffter();
        break;
      }
    }
  }

  if (sellUpEffect ==="SUpHealAll") {
    for (let i in typeGameConquest.battlePetUseSlotRound) {
      const data = typeGameConquest.battlePetUseSlotRound[i];
      if (data.EFFECT.includes("Healing")) {
        data.HEAL[1] += sellUpDame
        updateSttForSkillAffter();
      }
    }
  }

  if (sellUpEffect ==="SUpHealLeft") {
    for (let i in typeGameConquest.battlePetUseSlotRound) {
      const data = typeGameConquest.battlePetUseSlotRound[i];
      if (data.EFFECT.includes("Healing") && data.ID !== "") {
        data.HEAL[1] += sellUpDame
        updateSttForSkillAffter();
        break;
      }
    }
  }
  if (sellUpEffect ==="SUpShieldAll") {
    for (let i in typeGameConquest.battlePetUseSlotRound) {
      const data = typeGameConquest.battlePetUseSlotRound[i];
      if (data.EFFECT.includes("Shield")) {
        data.SHIELD[1] += sellUpDame
        updateSttForSkillAffter();
      }
    }
  }

  if (sellUpEffect ==="SUpShieldLeft") {
    for (let i in typeGameConquest.battlePetUseSlotRound) {
      const data = typeGameConquest.battlePetUseSlotRound[i];
      if (data.EFFECT.includes("Shield") && data.ID !== "") {
        data.SHIELD[1] += sellUpDame
        updateSttForSkillAffter();
        break;
      }
    }
  }
  if (sellUpEffect ==="SUpBurnAll") {
    for (let i in typeGameConquest.battlePetUseSlotRound) {
      const data = typeGameConquest.battlePetUseSlotRound[i];
      if (data.EFFECT.includes("Burn")) {
        data.BURN[1] += sellUpDame
        updateSttForSkillAffter();
      }
    }
  }

  if (sellUpEffect ==="SUpBurnLeft") {
    for (let i in typeGameConquest.battlePetUseSlotRound) {
      const data = typeGameConquest.battlePetUseSlotRound[i];
      if (data.EFFECT.includes("Burn") && data.ID !== "") {
        data.BURN[1] += sellUpDame
        updateSttForSkillAffter();
        break;
      }
    }
  }
  if (sellUpEffect ==="SUpPoisonAll") {
    for (let i in typeGameConquest.battlePetUseSlotRound) {
      const data = typeGameConquest.battlePetUseSlotRound[i];
      if (data.EFFECT.includes("Poison")) {
        data.POISON[1] += sellUpDame
        updateSttForSkillAffter();
      }
    }
  }

  if (sellUpEffect ==="SUpPoisonLeft") {
    for (let i in typeGameConquest.battlePetUseSlotRound) {
      const data = typeGameConquest.battlePetUseSlotRound[i];
      if (data.EFFECT.includes("Poison") && data.ID !== "") {
        data.POISON[1] += sellUpDame
        updateSttForSkillAffter();
        break;
      }
    }
  }
  if (sellUpEffect ==="SUpCritAll") {
    for (let i in typeGameConquest.battlePetUseSlotRound) {
      const data = typeGameConquest.battlePetUseSlotRound[i];
      data.CRIT[1] += sellUpDame
    }
  }

  if (sellUpEffect ==="SUpCritLeft") {
    for (let i in typeGameConquest.battlePetUseSlotRound) {
      const data = typeGameConquest.battlePetUseSlotRound[i];
      if (data.ID !== ""){
        data.CRIT[1] += sellUpDame
        break;
      }
    }
  }
  if (sellUpEffect ==="SUpMutilLeft") {
    for (let i in typeGameConquest.battlePetUseSlotRound) {
      const data = typeGameConquest.battlePetUseSlotRound[i];
      if (data.ID !== ""){
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
            skill.startsWith(`skill${slotKey-1}`) && 
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
            skill.startsWith(`skill${slotKey+1}`) && 
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
            skill.startsWith(`skill${slotKey-1}`) && 
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
            skill.startsWith(`skill${slotKey+1}`) && 
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
            skill.startsWith(`skill${slotKey-1}`) && 
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
            skill.startsWith(`skill${slotKey+1}`) && 
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
            skill.startsWith(`skill${slotKey-1}`) && 
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
            skill.startsWith(`skill${slotKey+1}`) && 
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
            skill.startsWith(`skill${slotKey-1}`) && 
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
            skill.startsWith(`skill${slotKey+1}`) && 
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
            skill.startsWith(`skill${slotKey-1}`) && 
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
            skill.startsWith(`skill${slotKey+1}`) && 
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
            skill.startsWith(`skill${slotKey-1}`) && 
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
            skill.startsWith(`skill${slotKey+1}`) && 
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
    openMenuStartGame: [document.getElementById("openMenuStartGame"), "Right"],
    bagInventory: [document.getElementById("bagInventory"), "Right"],
    rankBoard: [document.getElementById("rankBoard"), "Left"],
    popupQuestBoard: [document.getElementById("popupQuestBoard"), "Right"]
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
    showOrHiddenDiv("openMenuStartGame");
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

  if (infoStartGame.typeGame==="Conquest") {
    document.getElementById("continueGameButton").onclick = () => openGameRank();
    document.getElementById("exitGameButton").onclick = () => outGameRank();
  }

}

function closePopupContinueGame() {
  document.getElementById("popupContinueGame").style.display = "none";
  document.getElementById("popupOverlay").style.display = "none";
}


function changeButtonMenuStartGame(){
    
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
  if (infoStartGame.typeGame === "Conquest") {
    if (infoStartGame.modeGame === "Guide") {
      
    } else if (infoStartGame.modeGame === "Normal") {

    } else if (infoStartGame.modeGame === "Rank") {
      if (infoStartGame.difficultyGame === "No") {
        messageOpen("Vui lòng lựa chọn độ khó")
        return;
      }
      openGameRank();
      showOrHiddenDiv("Close")
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

  if (typeGameConquest.battleUserPet.length < 20 && onGame === 0) {
    messageOpen("5Mon bạn mang theo không đủ, vui lòng chọn đủ 20 5Mon để tiến hành chiến đấu!")
    openBag();
    return;
  }


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
    if (infoStartGame.modeGame==="Normal"){
      modeGamePoint = 1.2;
    } else if (infoStartGame.modeGame==="Hard") {
      modeGamePoint = 1.5;
    } else if (infoStartGame.modeGame==="Very Hard") {
      modeGamePoint = 2;
    } else if (infoStartGame.modeGame==="Hell") {
      modeGamePoint = 3;
    } else {
      modeGamePoint = 1;
    }

    //Trường hợp onGame của người chơi = 0
    if (onGame === 0 && infoStartGame.stepGame === 0){
      
      //Reset Hp 
      typeGameConquest.maxHpBattle = defaultHP;
      typeGameConquest.reRoll = 0;
      typeGameConquest.reRollPrice = 0
      typeGameConquest.starUser = 2;
      typeGameConquest.price5Mon = 0;
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
      let candidates = allComps.filter(comp => comp !== null && comp.roundComp === infoStartGame.roundGame);
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
              typeGameConquest.skillBattle[skillKey] = { ...selectedComp.slotSkillComp[skillKey]};
            }
          } 

          //pointrank cho comp
          Object.keys(allUsers).forEach((key) => {
            if (key === typeGameConquest.usernameComp) {
              pointRankComp = allUsers[key].pointRank;
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

    } else {
      //Trường hợp round của người chơi > 0
      nowHpBattleMy = (typeGameConquest.maxHpBattle + maxHpUp);
      document.querySelector('#hpBarB').querySelector('.hpText').textContent = (typeGameConquest.maxHpBattle + maxHpUp);

      //load thông tin của mình từ battlePetUseSlotRound sang cho typeGameConquest.skillBattle
      for (let skillKey = 0; skillKey < Object.keys(typeGameConquest.battlePetUseSlotRound).length; skillKey++) {
        let key = Object.keys(typeGameConquest.battlePetUseSlotRound)[skillKey]; // Lấy key thực tế từ Object.keys()
        let skill = typeGameConquest.battlePetUseSlotRound[key]; // Lấy giá trị skill dựa trên key
        if (skill.ID){
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

      if (infoStartGame.stepGame === 1){
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
    updateHpbar();

    price5MonConquest = typeGameConquest.price5Mon + typeGameConquest.selectSkillShop
    document.getElementById("battleShopText").innerText = price5MonConquest;
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

  }, 1000);
  endLoading();
}

function nextStepGame1() {
  infoStartGame.stepGame = 2;
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
    if (skill.parentElement.parentElement.id === "skillBarA"){
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
  typeGameConquest.battlePetInShop[skill] = {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]}; // Xóa kỹ năng khỏi battlePetInShop
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

  document.getElementById("battleShopText").innerText = price5MonConquest;

}, 1000);
endLoading();
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

  updateHpbar();
  setTimeout(() => {
    battleStartTime(true);
    cooldownSkillBattleB();
    cooldownSkillBattleA();
  },3000);
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

  //Xóa item trong shop => null

  //chuyển overlay cooldown thành có màu:
  // const overlays = document.querySelectorAll('.skillCooldownOverlay');

  // // Duyệt qua từng phần tử và thay đổi trực tiếp thuộc tính background
  // overlays.forEach((overlay) => {
  //   overlay.style.background = 'linear-gradient(to bottom, #f9ff04,#f9ff0438,#f9ff0438,#f9ff0438,#f9ff0438,#f9ff0438,#f9ff04)';
  // });


  //Bắt đầu vòng lặp cooldown skill
    // for (s = 2; s <= 9; s++) { //8 skill -> tính từ ô thứ 2 trước
      
    //    //skill của mình cooldown trước
    //   if (typeGameConquest.skillBattle[`skill${s}B`].COOLDOWN[0] == 0) { //Lọc các skill cooldown == 0 và có cooldown

    //   } else {
    //     triggerCooldown(`skill${s}B`);
    //   }

    //   //skill của đối thủ cooldown sau
    //   if (typeGameConquest.skillBattle[`skill${s}A`].COOLDOWN[0] == 0) { //Lọc các skill cooldown == 0 và có cooldown

    //   } else {
    //     triggerCooldown(`skill${s}A`);
    //   }
    // }

  //đạt điều kiện thì chiến thắng và gọi endBattle() => dừng tất cả cooldown và trừ máu

  //Đổi nút tiếp tục thành => onclick="startBattle()"
}, 1000);

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


  
  //Tăng round
  infoStartGame.roundGame += 1 //Tăng round sau khi endBattle
  //Reset Battle time

  clearInterval(intervalID)
  document.getElementById('cooldownBarContainer').classList.remove('comp');
  //Reset hiệu ứng trừ máu khi over time
  clearInterval(intervalIdOverTime)
  damageOverTime = 1 //+++++++++

  //Reset thông số shield/burn/poison của 2 team
  nowShieldBattleMy = 0;
  nowBurnBattleMy = 0;
  nowPoisonBattleMy = 0;
  nowShieldBattleComp = 0;
  nowBurnBattleComp = 0;
  nowPoisonBattleComp = 0;

  saveNowShieldA = 0;
  saveNowShieldB = 0;
  saveShieldState = {};
  skillsSleepA = {skill1A: 0,skill2A: 0,skill3A: 0,skill4A: 0,skill5A: 0,skill6A: 0,skill7A: 0,skill8A: 0,skill9A: 0};
  skillsSleepB = {skill1B: 0,skill2B: 0,skill3B: 0,skill4B: 0,skill5B: 0,skill6B: 0,skill7B: 0,skill8B: 0,skill9B: 0};
  skillsDeleteA = {skill1A: 0,skill2A: 0,skill3A: 0,skill4A: 0,skill5A: 0,skill6A: 0,skill7A: 0,skill8A: 0,skill9A: 0};
  skillsDeleteB = {skill1B: 0,skill2B: 0,skill3B: 0,skill4B: 0,skill5B: 0,skill6B: 0,skill7B: 0,skill8B: 0,skill9B: 0};
  // limitSkillsA = {skill1A: 0,skill2A: 0,skill3A: 0,skill4A: 0,skill5A: 0,skill6A: 0,skill7A: 0,skill8A: 0,skill9A: 0};
  // limitSkillsB = {skill1B: 0,skill2B: 0,skill3B: 0,skill4B: 0,skill5B: 0,skill6B: 0,skill7B: 0,skill8B: 0,skill9B: 0};
  skillQueueMirror = {};
  skillQueue = {};
  countSkillQueue = 0;
  countSkillQueueMirror = 0;

  totalSpeedUpTimeA = 0; // Thời gian tổng cộng hiệu lực tăng tốc cho team A
  totalSpeedUpTimeB = 0; // Thời gian tổng cộng hiệu lực tăng tốc cho team B
  totalSpeedDownTimeA = 0;
  totalSpeedDownTimeB = 0;
  speedUpA = 1;
  speedUpB = 1;
  document.getElementById("cooldownSkillA").style.backgroundColor = "rgb(0 0 0 / 25%)";
  document.getElementById("cooldownSkillB").style.backgroundColor = "rgb(0 0 0 / 25%)";

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
  cooldownDuration = 200; //++++++++
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
    if (skill.parentElement.parentElement.id === "skillBarA"){

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
  const overlaysLV = document.querySelectorAll('.skillCooldownOverlayLV');
  overlaysLV.forEach((overlay) => {
    overlay.style.transitionDuration = '0ms'; // Không có hiệu ứng chuyển tiếp ban đầu
    overlay.style.transform = 'scaleY(0)';    // Đặt overlay đầy (hiện full)
  });

  //Random tìm đối thủ mới
  let candidates = allComps.filter(comp => comp.roundComp === infoStartGame.roundGame);
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
        typeGameConquest.skillBattle[skillKey] = { ...selectedComp.slotSkillComp[skillKey]};
      }
    }

    //pointrank cho comp
    Object.keys(allUsers).forEach((key) => {
      if (key === typeGameConquest.usernameComp) {
        pointRankComp = allUsers[key].pointRank;
      }
    });

    console.log("Đối thủ đã chọn:", selectedComp);
    console.log("Kỹ năng đã gán vào typeGameConquest.skillBattle:", typeGameConquest.skillBattle);
  } else {
    console.log("Không tìm thấy đối thủ có cùng roundComp với roundGame.");
  }
 
  for (s = 1; s <= 9 ; s++){
    if (s === 9) {
      document.querySelector(`#skill${s}A`).innerHTML = `<div class="skillCooldownOverlayLV"></div>`
    } else {
      document.querySelector(`#skill${s}A`).innerHTML = `<div class="skillCooldownOverlay"></div>`
    }
  }

  //Khởi tạo skill cho các slot skill1A -> 9A
  createSkill("skillComp");

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

          if (typeGameConquest.skillBattle[key].COOLDOWN[1] > 0 && allCharacter[i].upMulti > 0 && infoStartGame.roundGame % 3 === 0 && addMultiFn === 0) {
              // Lọc danh sách các skill kết thúc bằng "B"
              const skillBKeys = Object.keys(typeGameConquest.skillBattle).filter(key1 => 
                  typeGameConquest.skillBattle[key1].ID !== "" && key1.endsWith("B")
              );

              if (skillBKeys.length > 0) {
                  // Chọn ngẫu nhiên một skill từ danh sách
                  const randomKey = skillBKeys[Math.floor(Math.random() * skillBKeys.length)];

                  // Cập nhật COOLDOWN của skill ngẫu nhiên
                  typeGameConquest.skillBattle[randomKey].COOLDOWN[2] += allCharacter[i].upMulti;
                  addMultiFn = 1;

                  console.log(`Skill "${randomKey}" được random và cập nhật COOLDOWN!`);
              } else {
                  console.log("Không có skill nào kết thúc bằng 'B'.");
              }
          }
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
  overlay.style.background = 'none'; // Thay đổi trực tiếp background
  overlay.style.transitionDuration = '0ms'; // Không có hiệu ứng chuyển tiếp ban đầu
  overlay.style.transform = 'scaleY(0)';    // Đặt overlay đầy (hiện full)
  });

  const overlaysLV = document.querySelectorAll('.skillCooldownOverlayLV');

  // Duyệt qua từng phần tử và thay đổi trực tiếp thuộc tính background
  overlaysLV.forEach((overlay) => {
  overlay.style.background = 'none'; // Thay đổi trực tiếp background
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

    resetOutGame();

    //Cộng điểm rank & reset điểm trong game
    if (infoStartGame.roundGame <= 1) {
      pointRank -= 10; 
    } else {
      pointRank += typeGameConquest.pointBattle; 
    }
    
    typeGameConquest.pointBattle = 0;

    // Xóa hết skill trong slot
    Object.keys(typeGameConquest.skillBattle).forEach((key) => {
      typeGameConquest.skillBattle[key] = {
        ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg: "",
        LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
        BURN: [0, 0, 0, 0], POISON: [0, 0, 0, 0], CRIT: [0, 0, 0, 0], COOLDOWN: [0, 0, 0, 0, 0],
      };
    });

    Object.keys(typeGameConquest.battlePetUseSlotRound).forEach((key) => {
      typeGameConquest.battlePetUseSlotRound[key] = {
        ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg: "",
        LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
        BURN: [0, 0, 0, 0], POISON: [0, 0, 0, 0], CRIT: [0, 0, 0, 0], COOLDOWN: [0, 0, 0, 0, 0],
      };
    });

    // Xóa hết skill trong inventory
    Object.keys(typeGameConquest.battlePetInInventory).forEach((key) => {
      typeGameConquest.battlePetInInventory[key] = {
        ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg: "",
        LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
        BURN: [0, 0, 0, 0], POISON: [0, 0, 0, 0], CRIT: [0, 0, 0, 0], COOLDOWN: [0, 0, 0, 0, 0],
      };
    });

    // Xóa skill trong shop
    Object.keys(typeGameConquest.battlePetInShop).forEach((key) => {
      typeGameConquest.battlePetInShop[key] = {
        ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg: "",
        LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
        BURN: [0, 0, 0, 0], POISON: [0, 0, 0, 0], CRIT: [0, 0, 0, 0], COOLDOWN: [0, 0, 0, 0, 0],
      };
    });

    //Xóa toàn bộ div skill
    for (let i = 1; i <= 9; i++) {
      const skillCompSlot = `skill${i}A`;
      const skillCompDiv = document.querySelector(`#${skillCompSlot}`);
      if (i === 9) {
        skillCompDiv.innerHTML = `<div class="skillCooldownOverlayLV"></div>`
      } else {
        skillCompDiv.innerHTML = `<div class="skillCooldownOverlay"></div>`
      }
    }

    for (let i = 1; i <= 9; i++) {
      const skillCompSlot = `skill${i}B`;
      const skillCompDiv = document.querySelector(`#${skillCompSlot}`);
      if (i === 9) {
        skillCompDiv.innerHTML = `<div class="skillCooldownOverlayLV"></div>`
      } else {
        skillCompDiv.innerHTML = `<div class="skillCooldownOverlay"></div>`
      }
      skillCompDiv.classList.remove("occupied")
    }

    for (let i = 0; i < 9; i++) {
      const skillCompSlot = `battleInv${i + 1}`;
      const skillCompDiv = document.querySelector(`#${skillCompSlot}`);
      skillCompDiv.innerHTML = ""
      skillCompDiv.classList.remove("occupied")
    }

    for (let i = 0; i < 4; i++) {
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
  },1000);
  endLoading();
}

function reRollShop(){ //++++++++++++++
  const resetButton = document.getElementById("resetShop");

  if (typeGameConquest.starUser >= typeGameConquest.reRollPrice){
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
  //Copy tạo ra các skill để random từ battleUserPetRound
  console.log("battleUserPet",typeGameConquest.battleUserPet)
  console.log("battleUserPetRound",typeGameConquest.battleUserPetRound)


  const battleUserPetRound1 = structuredClone(typeGameConquest.battleUserPetRound);
  // var rareLv1 = [95,90,85,80,70,60,45,25,10,5,4,3,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  // var rareLv2 = [5,10,15,20,25,30,40,49,58,59,54,49,38,29,20,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  // var rareLv3 = [0,0,0,0,5,10,15,25,30,33,38,43,50,55,60,65,70,60,50,40,30,20,10,0,0,0,0,0,0,0];
  // var rareLv4 = [0,0,0,0,0,0,0,1,2,3,4,5,10,15,20,25,30,40,50,60,70,80,90,100,100,100,100,100,100,100];
  var rareLv1 = [100, 100, 100, 100, 95, 94, 93, 92, 91, 90, 88, 86, 84, 82, 79.8, 76.5, 72.9, 69.3, 65.7, 62.1, 57.5, 53.0, 48.5, 44, 43.4, 42.8, 42.3, 41.8, 41.3, 40]
  var rareLv2 = [0,0,0,0,5,6,7,8,9,10,12,14,16,18,20,23,26,29,32,35,39,43,47,51,51,51,51,51,51,51];
  var rareLv3 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.1,0.3,0.8,1.3,1.8,2.3,2.8,3.2,3.6,4,4.4,4.8,5.1,5.4,5.7,6];
  var rareLv4 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,1.2,1.4,1.6,1.8,2,3];

  let selectedSkills = [];  // Danh sách lưu trữ các ID kỹ năng đã chọn
  typeGameConquest.battlePetInShop = {
    battleShop1: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleShop2: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleShop3: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleShop4: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
  };

  for (let i = 0; i < 4; i++) {
    // 1. Tính tần suất xuất hiện của ID
    const idFrequency = {};
    [...Object.values(typeGameConquest.battlePetUseSlotRound), ...Object.values(typeGameConquest.battlePetInInventory)].forEach(pet => {
      idFrequency[pet.ID] = (idFrequency[pet.ID] || 0) + 1;
    });
    // 2. Tạo trọng số cho từng Level
    const levelWeights = [
      { level: 1, weight: rareLv1[Number(infoStartGame.roundGame)-1] },
      { level: 2, weight: rareLv2[Number(infoStartGame.roundGame)-1] },
      { level: 3, weight: rareLv3[Number(infoStartGame.roundGame)-1] },
      { level: 4, weight: rareLv4[Number(infoStartGame.roundGame)-1] },
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
    if (shopDiv) {
      shopDiv.innerHTML = `
        <div 
          id="skill${idSkillRND}" 
          class="skill"
          draggable="true"
          style="background-image: url('${selectedSkill.URLimg}')"
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
            dameSkillText += `<div class="skill-freeze">${Number(selectedSkill.COOLDOWN[0]/2/1000*selectedSkill.LEVEL)}</div>`;
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
}

//Hàm tạo comp => tạo skill cho comp skill1A -> 9A
function createSkill(slotDiv) {

  let lengthSlot = 0;
  if (slotDiv === "shop") {
    lengthSlot = 4
  } else {
    lengthSlot = 9
  }

  let skillItem = slotDiv==="shop"?typeGameConquest.battlePetInShop:slotDiv==="inventory"?typeGameConquest.battlePetInInventory:slotDiv==="slotSkillFn"?skillFinalGame:typeGameConquest.skillBattle

  for (let i = 0; i < lengthSlot; i++) {
    console.log("Vào đây 1")
    const skillCompSlot = slotDiv==="shop"?`battleShop${i+1}`:slotDiv==="skillComp"?`skill${i + 1}A`:slotDiv==="inventory"?`battleInv${i + 1}`:slotDiv==="slotSkillFn"?`skill${i + 1}Bfn`:`skill${i + 1}B`;

    let skillCompDiv = document.querySelector(`#${skillCompSlot}`);

    if ((skillCompDiv && skillItem[skillCompSlot] && skillItem[skillCompSlot].ID)) {
      console.log("Vào đây 2")
      skillCompDiv.innerHTML += `
          <div 
            id="skill${idSkillRND}" 
            class="skill"
            draggable="true"
            style="background-image: url('${skillItem[skillCompSlot].URLimg}')"
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

          // Gắn nội dung vào dameSkillDiv
          dameSkillDiv.innerHTML =
          `
          <div class="levelSkillColor" style="position: absolute;font-size: 16px;font-weight: bold;color: #d80789;text-shadow: 0px 1px 2px #0000008a;top: -8px;right: -8px;">
            <i class="fa-solid fa-diamond"></i>
            <span class="levelSkillText" style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);font-size: 12px;color: white;font-weight: bold;">${skillItem[skillCompSlot].LEVEL}</span>
          </div>
          
          <div class="dameSkillText" style="display: flex; flex-direction: row; align-items: center;">
          ${dameSkillText}
          </div>
          `;

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
  // createInfoSkill();
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
          freezeSkill = ((matchingSlot.COOLDOWN[0]/2/1000 || 0) + (matchingSlot.COOLDOWN[4]/1000 || 0))*matchingSlot.LEVEL
          multiSkill = (matchingSlot.COOLDOWN[1] || 0) + (matchingSlot.COOLDOWN[2] || 0) + (matchingSlot.COOLDOWN[3] || 0);
      } else { // Ngoài trận đấu
          dameSkill = (matchingSlot.DAME[0] || 0) + (matchingSlot.DAME[1] || 0) + (matchingSlot.DAME[2] || 0);
          healSkill = (matchingSlot.HEAL[0] || 0) + (matchingSlot.HEAL[1] || 0) + (matchingSlot.HEAL[2] || 0);
          shieldSkill = (matchingSlot.SHIELD[0] || 0) + (matchingSlot.SHIELD[1] || 0) + (matchingSlot.SHIELD[2] || 0);
          burnSkill = (matchingSlot.BURN[0] || 0) + (matchingSlot.BURN[1] || 0) + (matchingSlot.BURN[2] || 0);
          poisonSkill = (matchingSlot.POISON[0] || 0) + (matchingSlot.POISON[1] || 0) + (matchingSlot.POISON[2] || 0);
          freezeSkill = (matchingSlot.COOLDOWN[0]/2/1000 || 0)*matchingSlot.LEVEL
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
      const freezeSkill = (matchingSlot.COOLDOWN[0]/2/1000 || 0)*matchingSlot.LEVEL
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
  // createInfoSkill();
  createInfo5mon();
}



let cooldownDuration = 200; // Số giây thanh sẽ giảm từ đầy đến hết //++++++++++
let decrementPercent = 100;
let cooldownRemaining = cooldownDuration; // Thời gian còn lại
let damageOverTime = 1; // Sát thương ban đầu


// Lấy các thành phần DOM
const cooldownBar = document.getElementById('cooldownBar');
const cooldownTime = document.getElementById('cooldownTime');

// Khởi động thanh cooldown
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

    if (endGame === true) {
      clearInterval(intervalIDBurnOrPoison); // Dừng cập nhật
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
    }
}

var winLoseDefault = 10;
function checkWinOrLose() {
  // Sử dụng setInterval để kiểm tra HP của hai bên mỗi 100ms
    // Kiểm tra nếu HP của máy bằng hoặc dưới 0 (người chơi thắng)
    if (nowHpBattleComp <= 0 && endGame === false) {
      console.log("Người chơi thắng!");
      clearInterval(intervalID)
      clearInterval(intervalIdOverTime)
      clearInterval(intervalIDBurnOrPoison)
      endGame=true; 

      updateHpbar();

      if (typeGameConquest.winBattle < winLoseDefault){
        randomSkillinShop();
        createNewComp(true);
      }
      showResultScreen(true)
    } 
    // Kiểm tra nếu HP của người chơi bằng hoặc dưới 0 (người chơi thua)
    else if (nowHpBattleMy <= 0 && endGame === false) {
      console.log("Người chơi thua!");
      clearInterval(intervalID)
      clearInterval(intervalIdOverTime)
      clearInterval(intervalIDBurnOrPoison)
      endGame=true;
      infoStartGame.winStreak = 0;

      updateHpbar();
      if (typeGameConquest.loseBattle < winLoseDefault){
        randomSkillinShop();
        createNewComp(false);
      }
      showResultScreen(false)
    }
}

//Tạo ra biến cục bộ để kiểm soát skill vô hiệu và loại bỏ
let skillsSleepA = {skill1A: 0,skill2A: 0,skill3A: 0,skill4A: 0,skill5A: 0,skill6A: 0,skill7A: 0,skill8A: 0,skill9A: 0};
let skillsDeleteA = {skill1A: 0,skill2A: 0,skill3A: 0,skill4A: 0,skill5A: 0,skill6A: 0,skill7A: 0,skill8A: 0,skill9A: 0};
// let limitSkillsA = {skill1A: 0,skill2A: 0,skill3A: 0,skill4A: 0,skill5A: 0,skill6A: 0,skill7A: 0,skill8A: 0,skill9A: 0};
let speedUpA = 1;
//useskill with cooldown mới
function cooldownSkillBattleA() {
  let cooldownComp = 0;

  // Tính tổng cooldownComp và cooldownMy
  for (let skill in typeGameConquest.skillBattle) {
    const cooldown = typeGameConquest.skillBattle[skill].COOLDOWN[0] === 0 ? 1000 : typeGameConquest.skillBattle[skill].COOLDOWN[0];
    if (/^skill[1-8]A$/.test(skill)) cooldownComp += cooldown;
  }


  // Cấu hình thanh cooldown
  const cooldownSkillBarA = document.getElementById('cooldownBarSkillA');
  const cooldownSkillTimeA = document.getElementById('cooldownTimeSkillA');
  const cooldownSpeedUpTimeSkillA = document.getElementById('cooldownSpeedUpTimeSkillA');

  const interval = 100;

  // Lưu ID của vòng lặp cooldown cho mỗi bên
  let intervalIdA = null;

  // Hàm cập nhật thanh cooldown và sử dụng skill
  function updateCooldown(skillBar, skillTime, skills, isComp) {
    let cooldownDuration = cooldownComp + typeGameConquest.slowB - typeGameConquest.upCooldownA
    let cooldownRemaining = 0; // Bắt đầu từ 0% (trái qua phải)
    let progress = 0; // Bắt đầu từ trái

    // Xóa vòng lặp cũ nếu có
    if (isComp && intervalIdA !== null) {
      clearInterval(intervalIdA);
    }

    // Tạo vòng lặp mới
    const intervalId = setInterval(() => {
      if (pauseBattle){
        return;
      }

      if (cooldownQueueComp > 0){
        cooldownQueueComp -= 100; // Giảm 0.1 giây mỗi lần
        if (cooldownQueueComp < 0) cooldownQueueComp = 0;
        return;
      }

      if (endGame) {
        clearInterval(intervalId); // Dừng vòng lặp khi endGame = true
        skillBar.style.width = "0%";
        skillTime.textContent = ""
        skillTime.style.backgroundColor = "";
        cooldownSpeedUpTimeSkillA.textContent = "";
        cooldownSpeedUpTimeSkillA.style.backgroundColor = "";
        return;
      } else {
        skillTime.style.backgroundColor = "rgb(150 0 238)";
      }

      cooldownRemaining += (interval / 1000) * speedUpA;
      progress = Math.min((cooldownRemaining / (cooldownDuration / 1000)) * 100, 100);
      skillBar.style.width = `${progress}%`;
      skillTime.textContent = `${Math.ceil(cooldownDuration / 1000 - cooldownRemaining)}`;

      let skillElementLV = document.getElementById("skill9A");  // Lấy phần tử chính
      let overlayDivLV = null;

      // Duyệt qua các phần tử con để tìm phần tử có class là 'skillCooldownOverlay'
      for (let child of skillElementLV.children) {
        if (child.classList.contains('skillCooldownOverlayLV')) {
          overlayDivLV = child;
          break; // Dừng vòng lặp khi tìm thấy
        }
      }
      useSkillLV("skill9A", overlayDivLV, isComp);

      for (let i = 0; i < skills.length; i++) {
        const skillKey = `skill${i + 1}A`;

        if (progress >= i * 12.5 + 6.25 && skills[i]===0 
          // && limitSkillsA[skillKey] <= 10 
          && typeGameConquest.skillBattle[skillKey].ID !== "") {
          // limitSkillsA[skillKey] += 1
          skills[i] = 1; //Tăng lên 1 để không bị lặp sử dụng skill
          
          // Ưu tiên kiểm tra trạng thái Sleep/delete
          if (skillsSleepA[skillKey] === 1) {
            skillsSleepA[skillKey] = 0
            const skillElement = document.getElementById(skillKey);
            if (skillElement) {
                const skillChild = skillElement.querySelector('.skill');
                if (skillChild && skillChild.classList.contains('sleep')) {
                    skillChild.classList.remove('sleep');
                }
            }
            continue; // Bỏ qua skill này
          }

          if (skillsDeleteA[skillKey] === 1) {
            console.log(`Skill ${skillKey} đã bị xóa!`);
            continue; // Bỏ qua skill này
          }

          let skillElement = document.getElementById(skillKey);  // Lấy phần tử chính
          let overlayDiv = null;

          // Duyệt qua các phần tử con để tìm phần tử có class là 'skillCooldownOverlay'
          for (let child of skillElement.children) {
            if (child.classList.contains('skillCooldownOverlay')) {
              overlayDiv = child;
              break; // Dừng vòng lặp khi tìm thấy
            }
          }

          if (i === 9){
            
          } else {
            startSkill(skillKey, overlayDiv, isComp);
          }
        }
      }

      if (cooldownRemaining >= cooldownDuration / 1000) {
        // Reset cooldown về 0 và bắt đầu lại
        cooldownRemaining = 0;
        skills.fill(0); // Reset trạng thái skill đã sử dụng
        // limitSkillsA = {skill1A: 0,skill2A: 0,skill3A: 0,skill4A: 0,skill5A: 0,skill6A: 0,skill7A: 0,skill8A: 0,skill9A: 0}; //Reset litmit 

        // Giảm cooldownComp và cooldownMy mỗi lần kết thúc vòng lặp
        const minCooldown = 1000; // Cooldown tối thiểu không được giảm dưới
        let reductionFactorBase = 0.02; // Tỷ lệ giảm cơ bản (2%)

        // Tính toán hệ số giảm dựa trên cooldown hiện tại
        if (cooldownComp > 24000) { //Lớn hơn 24 giây
          reductionFactorBase = 0.10 //giảm 10%
        } else if (cooldownComp > 21000) {
          reductionFactorBase = 0.09 //giảm 9%
        } else if (cooldownComp > 18000) {
          reductionFactorBase = 0.08 //giảm 8%
        } else if (cooldownComp > 16000) {
          reductionFactorBase = 0.07 //giảm 7%
        } else if (cooldownComp > 14000) {
          reductionFactorBase = 0.06 //giảm 6%
        } else if (cooldownComp > 12000) {
          reductionFactorBase = 0.05 //giảm 5%
        } else if (cooldownComp > 10000) {
          reductionFactorBase = 0.04 //giảm 4%
        } else if (cooldownComp > 8000) {
          reductionFactorBase = 0.03 //giảm 3%
        } else {
          reductionFactorBase = 0.02 //giảm 2%
        }

            let reductionFactor = reductionFactorBase + ((cooldownComp / 1000) * 0.001); // Mỗi 1000ms tăng thêm 0.1%

            // Đảm bảo giới hạn tỷ lệ giảm không vượt quá một mức hợp lý
            reductionFactor = Math.min(reductionFactor, 0.5); // Giới hạn giảm tối đa 50%

            // Giảm cooldown với tỷ lệ đã tính
            cooldownComp = Math.max(cooldownComp - cooldownComp * reductionFactor, minCooldown);
          
        // Thực hiện một lần gọi lại để giảm giá trị cooldown sau mỗi lần chạy xong
        updateCooldown(skillBar, skillTime, skills, true);
      }
      if (totalSpeedDownTimeA > 0) {
        speedUpA = 0.5
        totalSpeedDownTimeA -= 100
      } else if (totalSpeedUpTimeA > 0) {
        speedUpA = 2
        totalSpeedUpTimeA -= 100
      } else {
        speedUpA = 1
      }

      if (speedUpA > 1) {
        document.getElementById("cooldownSkillA").style.backgroundColor = "rgb(255 10 10)";
        cooldownSpeedUpTimeSkillA.textContent = `${Math.ceil(totalSpeedUpTimeA / 1000)}`
        cooldownSpeedUpTimeSkillA.style.backgroundColor = "rgb(255 10 10)";
      } else if (speedUpA < 1) { 
        document.getElementById("cooldownSkillA").style.backgroundColor="rgb(10 128 255)" ; 
        cooldownSpeedUpTimeSkillA.textContent = `${Math.ceil(totalSpeedDownTimeA / 1000)}`
        cooldownSpeedUpTimeSkillA.style.backgroundColor = "rgb(10 128 255)";
      } else {
        document.getElementById("cooldownSkillA").style.backgroundColor="rgb(0 0 0 / 25%)" ;
        cooldownSpeedUpTimeSkillA.textContent = "";
        cooldownSpeedUpTimeSkillA.style.backgroundColor = "";
      }
    }, interval);

    // Lưu lại ID vòng lặp mới
      intervalIdA = intervalId;
  }

  // Tạo mảng kỹ năng và bắt đầu giảm thanh cooldown
  const skillCompStates = new Array(9).fill(0);
  updateCooldown(cooldownSkillBarA, cooldownSkillTimeA, skillCompStates, true);
}


//Tạo ra biến cục bộ để kiểm soát skill vô hiệu và loại bỏ
let skillsSleepB = {skill1B: 0,skill2B: 0,skill3B: 0,skill4B: 0,skill5B: 0,skill6B: 0,skill7B: 0,skill8B: 0,skill9B: 0};
let skillsDeleteB = {skill1B: 0,skill2B: 0,skill3B: 0,skill4B: 0,skill5B: 0,skill6B: 0,skill7B: 0,skill8B: 0,skill9B: 0};
// let limitSkillsB = {skill1B: 0,skill2B: 0,skill3B: 0,skill4B: 0,skill5B: 0,skill6B: 0,skill7B: 0,skill8B: 0,skill9B: 0}; // đếm skill dùng được bao nhiêu trong 1 lần chạy cooldown => dùng để giới hạn skill dùng được
let speedUpB = 1;
function cooldownSkillBattleB() {
  let cooldownMy = 0;

  // Tính tổng cooldownComp và cooldownMy
  for (let skill in typeGameConquest.skillBattle) {
    const cooldown = typeGameConquest.skillBattle[skill].COOLDOWN[0] === 0 ? 1000 : typeGameConquest.skillBattle[skill].COOLDOWN[0];
    if (/^skill[1-8]B$/.test(skill)) cooldownMy += cooldown;
  }

  // Cấu hình thanh cooldown
  const cooldownSkillBarB = document.getElementById('cooldownBarSkillB');
  const cooldownSkillTimeB = document.getElementById('cooldownTimeSkillB');
  const cooldownSpeedUpTimeSkillB = document.getElementById('cooldownSpeedUpTimeSkillB');
  const interval = 100;

  // Lưu ID của vòng lặp cooldown cho mỗi bên
  let intervalIdB = null;

  // Hàm cập nhật thanh cooldown và sử dụng skill
  function updateCooldown(skillBar, skillTime, skills, isComp) {
    let cooldownDuration = cooldownMy + typeGameConquest.slowA - typeGameConquest.upCooldownB
    let cooldownRemaining = 0; // Bắt đầu từ 0% (trái qua phải)
    let progress = 0; // Bắt đầu từ trái

    // Xóa vòng lặp cũ nếu có
    if (!isComp && intervalIdB !== null) {
      clearInterval(intervalIdB);
    }

    // Tạo vòng lặp mới
    const intervalId = setInterval(() => {
      if (pauseBattle){
        return;
      }

      if (cooldownQueueMy > 0){
        cooldownQueueMy -= 100; // Giảm 0.1 giây mỗi lần
        if (cooldownQueueMy < 0) cooldownQueueMy = 0;
        return;
      }

      if (endGame) {
        clearInterval(intervalId); // Dừng vòng lặp khi endGame = true
        skillBar.style.width = "0%";
        skillTime.textContent = ""
        skillTime.style.backgroundColor = "";
        cooldownSpeedUpTimeSkillB.textContent = "";
        cooldownSpeedUpTimeSkillB.style.backgroundColor = "";
        return;
      } else {
        skillTime.style.backgroundColor = "rgb(150 0 238)";
      }

      cooldownRemaining += (interval / 1000) * speedUpB;
      progress = Math.min((cooldownRemaining / (cooldownDuration / 1000)) * 100, 100);
      skillBar.style.width = `${progress}%`;
      skillTime.textContent = `${Math.ceil(cooldownDuration / 1000 - cooldownRemaining)}`;

      let skillElementLV = document.getElementById("skill9B");  // Lấy phần tử chính
      let overlayDivLV = null;

      // Duyệt qua các phần tử con để tìm phần tử có class là 'skillCooldownOverlay'
      for (let child of skillElementLV.children) {
        if (child.classList.contains('skillCooldownOverlayLV')) {
          overlayDivLV = child;
          break; // Dừng vòng lặp khi tìm thấy
        }
      }
      useSkillLV("skill9B", overlayDivLV, isComp);

      for (let i = 0; i < skills.length; i++) {
        const skillKey = `skill${i + 1}B`;
        if (progress >= i * 12.5 + 6.25 && skills[i]===0 
          // && limitSkillsB[skillKey]<=10 
          && typeGameConquest.skillBattle[skillKey].ID !== "") {
          // limitSkillsB[skillKey] += 1
          skills[i] = 1; //Tăng lên 1 để không bị lặp sử dụng skill

          if (skillsSleepB[skillKey] === 1){
            skillsSleepB[skillKey] = 0
            //Xóa hình ảnh bị Sleep
            const skillElement = document.getElementById(skillKey);
            if (skillElement) {
                const skillChild = skillElement.querySelector('.skill');
                if (skillChild && skillChild.classList.contains('sleep')) {
                    skillChild.classList.remove('sleep');
                }
            }
            continue;
          }
          
          if (skillsDeleteB[skillKey] === 1){
            continue;
          }

          let skillElement = document.getElementById(skillKey);  // Lấy phần tử chính
          let overlayDiv = null;

          // Duyệt qua các phần tử con để tìm phần tử có class là 'skillCooldownOverlay'
          for (let child of skillElement.children) {
            if (child.classList.contains('skillCooldownOverlay')) {
              overlayDiv = child;
              break; // Dừng vòng lặp khi tìm thấy
            }
          }

          if (i === 9){
            
          } else {
            startSkill(skillKey, overlayDiv, isComp);
          }
        }
      }

      if (cooldownRemaining >= cooldownDuration / 1000) {
        // Reset cooldown về 0 và bắt đầu lại
        cooldownRemaining = 0;
        skills.fill(0)
        // limitSkillsB = {skill1B: 0,skill2B: 0,skill3B: 0,skill4B: 0,skill5B: 0,skill6B: 0,skill7B: 0,skill8B: 0,skill9B: 0}; //Reset litmit 

        // Giảm cooldownComp và cooldownMy mỗi lần kết thúc vòng lặp
        const minCooldown = 1000; // Cooldown tối thiểu không được giảm dưới
        let reductionFactorBase = 0.02; // Tỷ lệ giảm cơ bản (1%)

          if (cooldownMy > 24000) { //Lớn hơn 24 giây
            reductionFactorBase = 0.10 //giảm 10%
          } else if (cooldownMy > 21000) {
            reductionFactorBase = 0.09 //giảm 9%
          } else if (cooldownMy > 18000) {
            reductionFactorBase = 0.08 //giảm 8%
          } else if (cooldownMy > 16000) {
            reductionFactorBase = 0.07 //giảm 7%
          } else if (cooldownMy > 14000) {
            reductionFactorBase = 0.06 //giảm 6%
          } else if (cooldownMy > 12000) {
            reductionFactorBase = 0.05 //giảm 5%
          } else if (cooldownMy > 10000) {
            reductionFactorBase = 0.04 //giảm 4%
          } else if (cooldownMy > 8000) {
            reductionFactorBase = 0.03 //giảm 3%
          } else {
            reductionFactorBase = 0.02 //giảm 2%
          }

          let reductionFactor = reductionFactorBase + ((cooldownMy / 1000) * 0.001); // Mỗi 1000ms tăng thêm 0.1%

          // Đảm bảo giới hạn tỷ lệ giảm không vượt quá một mức hợp lý
          reductionFactor = Math.min(reductionFactor, 0.3); // Giới hạn giảm tối đa 50%

          // Giảm cooldown với tỷ lệ đã tính
          cooldownMy = Math.max(cooldownMy - cooldownMy * reductionFactor, minCooldown);
          
          

        // Thực hiện một lần gọi lại để giảm giá trị cooldown sau mỗi lần chạy xong
        updateCooldown(skillBar, skillTime, skills, false);
      }
      if (totalSpeedDownTimeB > 0) {
        speedUpB = 0.5
        totalSpeedDownTimeB -= 100
      } else if (totalSpeedUpTimeB > 0) {
        speedUpB = 2
        totalSpeedUpTimeB -= 100
      } else {
        speedUpB = 1
      }

      if (speedUpB > 1) {
        document.getElementById("cooldownSkillB").style.backgroundColor = "rgb(255 10 10)";
        cooldownSpeedUpTimeSkillB.textContent = `${Math.ceil(totalSpeedUpTimeB / 1000)}`
        cooldownSpeedUpTimeSkillB.style.backgroundColor = "rgb(255 10 10)";
      } else if (speedUpB < 1) { document.getElementById("cooldownSkillB").style.backgroundColor="rgb(10 128 255)" ;
        cooldownSpeedUpTimeSkillB.textContent=`${Math.ceil(totalSpeedDownTimeB / 1000)}`
        cooldownSpeedUpTimeSkillB.style.backgroundColor="rgb(10 128 255)" ; 
      } else {
        document.getElementById("cooldownSkillB").style.backgroundColor="rgb(0 0 0 / 25%)" ;
        cooldownSpeedUpTimeSkillB.textContent="" ; cooldownSpeedUpTimeSkillB.style.backgroundColor="" ;
      }

    }, interval);

    // Lưu lại ID vòng lặp mới
    intervalIdB = intervalId;
  }

  // Tạo mảng kỹ năng và bắt đầu giảm thanh cooldown
  const skillMyStates = new Array(9).fill(0);
  updateCooldown(cooldownSkillBarB, cooldownSkillTimeB, skillMyStates, false);
}

function startSkill(skillKey, overlayDiv, isComp) {
  //Tính mutilcast=> đánh liên tiếp
  let doubleSkill = Math.max(typeGameConquest.skillBattle[skillKey].COOLDOWN[1] + typeGameConquest.skillBattle[skillKey].COOLDOWN[2] + typeGameConquest.skillBattle[skillKey].COOLDOWN[3],1)
  console.log("multicast",doubleSkill, skillKey)
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


let skillQueueMirror = {}; // Hàng đợi cho mỗi skill phản đòn
let countSkillQueueMirror = 0;
function startSkillMirror(skillKey, isComp, effect) {

  // let limitSkills = isComp ? limitSkillsB : limitSkillsA;
  let skillsSleep = isComp? skillsSleepB: skillsSleepA
  let skillsDelete = isComp? skillsDeleteB: skillsDeleteA
  let isRound = infoStartGame.roundGame
  const effectPairs = [
    { mirrorEffect: "MirrorAttacking", baseEffect: "Attacking" },
    { mirrorEffect: "MirrorHealing", baseEffect: "Healing" },
    { mirrorEffect: "MirrorShield", baseEffect: "Shield" },
    { mirrorEffect: "MirrorBurn", baseEffect: "Burn" },
    { mirrorEffect: "MirrorPoison", baseEffect: "Poison" },
    { mirrorEffect: "MirrorFreeze", baseEffect: "Freeze" },
    { mirrorEffect: "MirrorSleepSkills", baseEffect: "SleepSkills" },
    { mirrorEffect: "MirrorSpeedUp", baseEffect: "SpeedUp" },
    { mirrorEffect: "MirrorSpeedDown", baseEffect: "SpeedDown" },
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

            const skillElementComp = document.getElementById(key);
            let overlayDivComp = null;

            for (const child of skillElementComp.children) {
              if (child.classList.contains("skillCooldownOverlay") || child.classList.contains("skillCooldownOverlayLV")) {
                overlayDivComp = child;
                break;
              }
            }

            if (isRound === infoStartGame.roundGame && skillsSleep[key] === 0 && skillsDelete[key] === 0 && countSkillQueueMirror <300) {
              isComp
                ? startSkill(key, overlayDivComp, false)
                : startSkill(key, overlayDivComp, true);
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
  let skillsSleep = isComp? skillsSleepA: skillsSleepB
  let skillsDelete = isComp? skillsDeleteA: skillsDeleteB
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
    { reEffect: "ReSpeedUp", baseEffect: "SpeedUp" },
    { reEffect: "ReSpeedDown", baseEffect: "SpeedDown" },
  ];

  Object.keys(typeGameConquest.skillBattle).forEach((key) => {
    if (key !== skillKey && ((isComp ? key.endsWith("A") : key.endsWith("B")))) {
      for (const { reEffect, baseEffect } of effectPairs) {

        const skillElementComp = document.getElementById(key);
        let overlayDivComp = null;
        if (key.startsWith("skill9")) {
          overlayDivComp = skillElementComp.querySelector(".skillCooldownOverlayLV")
        } else {
          overlayDivComp = skillElementComp.querySelector(".skillCooldownOverlay")
        }

        // Logic xử lý nếu hiệu ứng có mặt trong skillKey
        if (reEffect === "ReBeforeSkill" || reEffect === "ReAfterSkill" || reEffect === "ReBeforeAfterSkill" || reEffect === "ReType") {
          let slotSkillKey = parseInt(skillKey.match(/\d+/)[0], 10);  // Chuyển đổi thành số
          let slotKey = parseInt(key.match(/\d+/)[0], 10);  // Chuyển đổi thành số

          // Xử lý hiệu ứng ReBeforeSkill
          if (reEffect === "ReBeforeAfterSkill" && typeGameConquest.skillBattle[key].EFFECT.includes("ReBeforeAfterSkill")) {
            // Kiểm tra nếu slotSkillKey nhỏ hơn slotKey (tức là skill này là trước skill hiện tại)
            if (slotSkillKey === slotKey - 1 || slotSkillKey === slotKey + 1) {
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
                  startSkill(key, overlayDivComp, isComp);
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
                  startSkill(key, overlayDivComp, isComp);
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
                  startSkill(key, overlayDivComp, isComp);
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
                  startSkill(key, overlayDivComp, isComp);
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
                startSkill(key, overlayDivComp, isComp);
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

//Cập nhật nộ Rage và sử dụng skill nộ
function updateRage(skillKey, overlayDiv, isComp) {
    // Kiểm tra typeGameConquest.skillBattle[skillKey]
    if (!typeGameConquest.skillBattle[skillKey]) {
        console.error(`typeGameConquest.skillBattle[${skillKey}] is undefined or null.`);
        return;
    }

    // Kiểm tra overlayDiv
    if (!overlayDiv) {
        console.error("overlayDiv is null or undefined.");
        return;
    }
    
    if (typeGameConquest.skillBattle[skillKey].COOLDOWN[4] >= 100) {  // Kiểm tra nộ đã đạt hoặc vượt 100
      setTimeout(() => {
        for (let s = 0; s < typeGameConquest.skillBattle[skillKey].EFFECT.length; s++) {
          useSkill(skillKey, typeGameConquest.skillBattle[skillKey].EFFECT[s], overlayDiv, isComp);
        }
      }, 350);
       
        overlayDiv.style.transform = 'scaleY(0)';  // Reset thanh nộ

        typeGameConquest.skillBattle[skillKey].COOLDOWN[4] -= 100;  // Trừ 100 nộ
        setTimeout(() => {
            overlayDiv.style.transition = 'transform 1s ease-in-out'; // Hiệu ứng mượt
            overlayDiv.style.transform = `scaleY(${Math.min(typeGameConquest.skillBattle[skillKey].COOLDOWN[4] / 100, 1)})`;  // Cập nhật thanh nộ
        }, 100);

    } else {  // Nếu chưa đạt 100
        let rageIncrease = Math.max(Math.max(Math.min(30000 / typeGameConquest.skillBattle[skillKey].COOLDOWN[0], 200), 10)/(typeGameConquest.skillBattle[skillKey].COOLDOWN[1]+typeGameConquest.skillBattle[skillKey].COOLDOWN[2]+typeGameConquest.skillBattle[skillKey].COOLDOWN[3]),1)/typeGameConquest.skillBattle[skillKey].EFFECT.length || 1; // Tính lượng nộ tăng
        typeGameConquest.skillBattle[skillKey].COOLDOWN[4] += rageIncrease;  // Cộng nộ
        setTimeout(() => {
            overlayDiv.style.transition = 'transform 1s ease-in-out'; // Hiệu ứng mượt
            overlayDiv.style.transform = `scaleY(${Math.min(typeGameConquest.skillBattle[skillKey].COOLDOWN[4] / 100, 1)})`;  // Cập nhật thanh nộ
        }, 100);
    }
}

function useSkillLV(skillKey, overlayDiv, isComp) {
    // Kiểm tra typeGameConquest.skillBattle[skillKey]
    if (!typeGameConquest.skillBattle[skillKey] || !typeGameConquest.skillBattle[skillKey].ID) {
        return;
    }
    // Kiểm tra overlayDiv
    if (!overlayDiv) {
        return;
    }

    // Ưu tiên kiểm tra trạng thái Sleep/delete
    let skillsSleep = isComp? skillsSleepA : skillsSleepB
    let skillsDelete = isComp? skillsDeleteA : skillsDeleteB

    if (skillsDelete[skillKey] === 1) {
      return; // Bỏ qua skill này
    }

    //Tính tốc độ tăng nộ của LV dựa theo công thức cooldown*multi
    let speedLV = 10/(typeGameConquest.skillBattle[skillKey].COOLDOWN[0]/1000)

    if (typeGameConquest.skillBattle[skillKey].COOLDOWN[4] < 100) typeGameConquest.skillBattle[skillKey].COOLDOWN[4] += speedLV

    if (typeGameConquest.skillBattle[skillKey].COOLDOWN[4] >= 100) {  // Kiểm tra nộ đã đạt hoặc vượt 100
      typeGameConquest.skillBattle[skillKey].COOLDOWN[4] -= 100;  // Trừ 100 nộ
      if (skillsSleep[skillKey] === 1) {
        skillsSleep[skillKey] = 0
        const skillElement = document.getElementById(skillKey);
        if (skillElement) {
          const skillChild = skillElement.querySelector('.skill');
          if (skillChild && skillChild.classList.contains('sleep')) {
            skillChild.classList.remove('sleep');
          }
        }
      } else {
        startSkill(skillKey, overlayDiv, isComp); 
      }   
    }
    // overlayDiv.style.transition = 'transform 1s ease-in-out'; // Hiệu ứng mượt
    overlayDiv.style.transform = `scaleY(${Math.min(typeGameConquest.skillBattle[skillKey].COOLDOWN[4] / 100, 1)})`; // Cập nhật thanh nộ
}

//Function useskill
function useSkill(skillKey, effect, overlayDiv, isComp) {
  // Tính tỷ lệ chí mạng
  let critDame = 1;
  let upCritDame = isComp? typeGameConquest.dameCritA : typeGameConquest.dameCritB
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
  if (randomValue <=critPoint) { 
    critDame= dameCritWithEffect + upCritDame/100; 
    isCrit = true;
  } else {
    critDame= 1; 
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
    case "Attacking":      skillAttacking(skillKey, dameSkill, isCrit);
      break;
    case "Healing":      skillHealing(skillKey, dameSkill, isCrit);
      break;
    case "Shield":      skillShield(skillKey, dameSkill, isCrit);
      break;
    case "Burn":      skillBurn(skillKey, dameSkill, isCrit);
      break;
    case "Poison":      skillPoison(skillKey, dameSkill, isCrit);
      break;
    case "Freeze":      skillFreeze(skillKey, dameSkill, isComp);
      break;
    case "Burn":      skillBurn(skillKey, dameSkill, isCrit);
      break;
    case "ChargerSkillAll":      skillchargerSkill(skillKey, isComp, "All");
      break;
    case "ChargerSkillLeftRight":      skillchargerSkill(skillKey, isComp, "LeftRight");
      break;
    case "ChargerSkillLeft":      skillchargerSkill(skillKey, isComp, "Left");
      break;
    case "ChargerSkillRight":      skillchargerSkill(skillKey, isComp, "Right");
      break;
    case "ChargerSkillType":      skillchargerSkill(skillKey, isComp, "Type");
      break;
    case "UpDameAll":      skillUpDame(skillKey, dameSkill, isComp, "All");
      break;
    case "UpDameLeftRight":      skillUpDame(skillKey, dameSkill, isComp, "LeftRight");
      break;
    case "UpDameLeft":      skillUpDame(skillKey, dameSkill, isComp, "Left");
      break;
    case "UpDameRight":      skillUpDame(skillKey, dameSkill, isComp, "Right");
      break;
    case "UpDameSelf":      skillUpDame(skillKey, dameSkill, isComp, "Self");
      break;
    case "UpDameType":      skillUpDame(skillKey, dameSkill, isComp, "Type");
      break;
    case "UpHealAll":      skillUpHeal(skillKey, dameSkill, isComp, "All");
      break;
    case "UpHealLeftRight":      skillUpHeal(skillKey, dameSkill, isComp, "LeftRight");
      break;
    case "UpHealLeft":      skillUpHeal(skillKey, dameSkill, isComp, "Left");
      break;
    case "UpHealRight":      skillUpHeal(skillKey, dameSkill, isComp, "Right");
      break;
    case "UpHealSelf":      skillUpHeal(skillKey, dameSkill, isComp, "Self");
      break;
    case "UpHealType":      skillUpHeal(skillKey, dameSkill, isComp, "Type");
      break;
    case "UpShieldAll":      skillUpShield(skillKey, dameSkill, isComp, "All");
      break;
    case "UpShieldLeftRight":      skillUpShield(skillKey, dameSkill, isComp, "LeftRight");
      break;
    case "UpShieldLeft":      skillUpShield(skillKey, dameSkill, isComp, "Left");
      break;
    case "UpShieldRight":      skillUpShield(skillKey, dameSkill, isComp, "Right");
      break;
    case "UpShieldSelf":      skillUpShield(skillKey, dameSkill, isComp, "Self");
      break;
    case "UpShieldType":      skillUpShield(skillKey, dameSkill, isComp, "Type");
      break;
    case "UpBurnAll":      skillUpBurn(skillKey, dameSkill, isComp, "All");
      break;
    case "UpBurnLeftRight":      skillUpBurn(skillKey, dameSkill, isComp, "LeftRight");
      break;
    case "UpBurnLeft":      skillUpBurn(skillKey, dameSkill, isComp, "Left");
      break;
    case "UpBurnRight":      skillUpBurn(skillKey, dameSkill, isComp, "Right");
      break;
    case "UpBurnSelf":      skillUpBurn(skillKey, dameSkill, isComp, "Self");
      break;
    case "UpBurnType":      skillUpBurn(skillKey, dameSkill, isComp, "Type");
      break;
    case "UpPoisonAll":      skillUpPoison(skillKey, dameSkill, isComp, "All");
      break;
    case "UpPoisonLeftRight":      skillUpPoison(skillKey, dameSkill, isComp, "LeftRight");
      break;
    case "UpPoisonLeft":      skillUpPoison(skillKey, dameSkill, isComp, "Left");
      break;
    case "UpPoisonRight":      skillUpPoison(skillKey, dameSkill, isComp, "Right");
      break;
    case "UpPoisonSelf":      skillUpPoison(skillKey, dameSkill, isComp, "Self");
      break;
    case "UpPoisonType":      skillUpPoison(skillKey, dameSkill, isComp, "Type");
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
    case "SleepSkills":      skillSleepSkills(skillKey, dameSkill, isComp);
      break;
    case "DeleteSkills":      skillDeleteSkills(skillKey, dameSkill, isComp);
      break;
    case "SpeedUp": skillSpeedUp(skillKey, dameSkill, isComp);
      break;
    case "SpeedDown": skillSpeedDown(skillKey, dameSkill, isComp);
      break;
    default:
      console.warn(`Effect skill ${effect} chưa có xử lý cụ thể`);
  }
  // Cập nhật rage (chung cho tất cả các skill)
  if (!skillKey.startsWith("skill9")) {
    updateRage(skillKey, overlayDiv, isComp);
  }
  startSkillMirror(skillKey,isComp, effect);
  startSkillResonance(skillKey, isComp, effect);
}

function showResultScreen(isWin) {
    const resultScreen = document.getElementById('resultScreen');
    const resultText = document.getElementById('resultText');
    const pointResultText = document.getElementById('pointResultText');
    const buttonEndGame = document.getElementById('buttonEndGame');

    typeGameConquest.reRoll = 0;
    typeGameConquest.reRollPrice = 0;
    typeGameConquest.starUser += infoStartGame.roundGame;
    
    if (infoStartGame.roundGame <= 1) {
      typeGameConquest.price5Mon += 1;
    } else {
      if (isWin) {
        typeGameConquest.price5Mon += 1;
      } else {

      }
    }

    typeGameConquest.selectSkillShop = 0;

    price5MonConquest = typeGameConquest.price5Mon + typeGameConquest.selectSkillShop

    document.getElementById("qtyResetShop").innerText = typeGameConquest.reRollPrice;
    document.getElementById("starUser").innerText = typeGameConquest.starUser;
    document.getElementById("battleShopText").innerText = price5MonConquest;

    // Reset các biến toàn cục


    damageOverTime = 1;

    // Biến để tính điểm trong vòng này
    let pointsThisRound;

    // Hiển thị resultScreen
    if (isWin) {
        resultText.innerText = 'Chiến Thắng!';

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
          //Tìm nhân vật để tăng chỉ số mỗi round cho người chơi user
          upSTTRoundWithCharacter();
        }
    } else {
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

          //Tìm nhân vật để tăng chỉ số mỗi round cho người chơi user
          upSTTRoundWithCharacter();
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

  let textWin = winOrLose==="win"?1:0

  winFinalGameText.innerText = `${typeGameConquest.winBattle + textWin}`;
  let textLose = winOrLose==="lose"?1:0
  loseFinalGameText.innerText = `${typeGameConquest.loseBattle + textLose}`;

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
      setUserOffline();
    }
    isLogin = false;
  } else {
    if (isFinalLoadData && !isOut) {
      setUserOnline()
    }
    isLogin = true;
  }

  if (endGame===false) {
    if (document.hidden) {
      console.log("Người dùng đã chuyển tab trong lúc chiến đấu");
      pauseBattle = true;
    } else {
      console.log("Người dùng đã quay lại tab.");
      setTimeout(() => {
        pauseBattle = false;
      }, 1000)
      // Gọi hàm xử lý khi quay lại tab
    }
  }
});

function createNewComp(isWin) {
    var firebaseHadUser = firebaseUrl + "allComps.json";
    var ratioWinCheck = 25
    var firebaseCompUrl = firebaseUrl + "allComps/";
    allComps = allComps.filter(item => item !== null);
    
    fetch(firebaseHadUser)
    .then(response => response.json())
    .then(data => {
        if (!data) {
            data = {}; // Nếu Firebase rỗng, khởi tạo object trống
        }

        // Lọc bỏ các entry có giá trị null
        let dataArray = Object.entries(data)
            .filter(([key, value]) => value !== null) // Giữ lại các entry có giá trị khác null
            .reduce((acc, [key, value]) => {
                acc[key] = value; // Chuyển về object
                return acc;
            }, {});
        
        console.log("dataArray", dataArray)
        console.log("data", data)

        //++++++++++++++++

        let idNewComp = Object.keys(data).length; // Đếm số lượng Comp hiện tại
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
                fullGame = comp.loseUser + comp.winUser
                ratioWinComp = (comp.winUser / (comp.loseUser + comp.winUser)) * 100;

                // Nếu tỷ lệ thắng < 25%, xóa Comp này khỏi Firebase
                if (ratioWinComp < ratioWinCheck) {
                    fetch(firebaseCompUrl + compKey + ".json", {
                      method: "DELETE"
                    })
                    .then(() => {
                      console.log("Đã xóa Comp có ID:", compKey, "vì tỷ lệ thắng < 25%");
                      // Xóa comp khỏi allComps ngay lập tức
                      allComps = allComps.filter(item => item !== null && item.idComp !== typeGameConquest.idComp);
                      console.log("allComps", allComps)
                    })
                    .catch(error => console.error("Lỗi khi xóa Comp:", error));
                } else {
                    // Gửi cập nhật lên Firebase nếu không bị xóa
                    fetch(firebaseCompUrl + compKey + ".json", {
                        method: "PATCH",
                        body: JSON.stringify({
                            winUser: comp.winUser,
                            loseUser: comp.loseUser,
                            ratioWinComp: ratioWinComp
                        }),
                        headers: { "Content-Type": "application/json" }
                    })
                    .then(() => console.log("Cập nhật winUser/loseUser thành công"));
                }
            }
        });

        let newBattlePetUseSlotRound = Object.keys(typeGameConquest.battlePetUseSlotRound).reduce((newObj, key) => {
          // Thay đổi hậu tố 'B' thành 'A'
          let newKey = key.replace(/B$/, 'A');
          newObj[newKey] = typeGameConquest.battlePetUseSlotRound[key];
          return newObj;
        }, {});

        // Tạo Comp mới nếu chưa có idComp này
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

        fetch(firebaseCompUrl + idNewComp + ".json", { // Thêm theo dạng allComps/{idNewComp}
            method: "PUT", // PUT để lưu theo dạng key cố định (id)
            body: JSON.stringify(newCompData),
            headers: { "Content-Type": "application/json" }
        })
        .then(response => response.json())
        .then(data => {
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


//Show trang đăng ký
var showRegisterPageOn = false;
var keyActiveData = {};
function showRegisterPage() {
  if (showRegisterPageOn == false) {
    
    //lấy thông tin keyActive
    var firebaseHadUser = firebaseUrl + "keyActiveData.json";

    fetch(firebaseHadUser)
      .then(response => response.json())
      .then(data => {
        keyActiveData = data
      })
      .catch(error => {
        console.error("Lỗi khi lấy dữ liệu:", error);
      });

    showRegisterPageOn = true;
    showLoading()
    document.getElementById("registerPage").style.display = "flex"    
    setTimeout (() => {
      document.getElementById("registerPage").style.opacity = 1;
      hideLoading()
    }, 500);
  } else { 
    showLoading()
    showRegisterPageOn = false;
    setTimeout (() => {
      document.getElementById("registerPage").style.opacity = 0;
      document.getElementById("registerPage").style.display = "none"  
      hideLoading()
    }, 500);
  }
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

    var firebaseHadUser = firebaseUrl + "allUsers/" + usernameRegister + ".json";

    // Kiểm tra tài khoản có tồn tại không
    fetch(firebaseHadUser)
    .then(response => response.json())
    .then(data => {
      if (data !== null) {
        messageElement.innerText = "Tài khoản đã có người đăng ký, vui lòng sử dụng tài khoản khác!";
        hideLoading();
        return;
      } 

      // if (keyActiveData.some(item => item.key === keyActive)) {

          var battlePetUseSlotRound = { //pet đang dùng tại slotskill
            skill1B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"", 
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill2B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill3B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill4B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill5B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill6B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill7B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill8B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill9B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
          };
          var battlePetInInventory = {
            battleInv1: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            battleInv2: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            battleInv3: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            battleInv4: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            battleInv5: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            battleInv6: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            battleInv7: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            battleInv8: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            battleInv9: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
          }; //pet có trong slot tủ đồ
          var skillBattle = { //Khay Pet sử dụng
            skill1A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill2A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill3A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill4A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill5A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill6A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill7A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill8A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill9A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill1B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill2B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill3B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill4B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill5B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill6B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill7B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill8B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            skill9B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
          };

          var battlePetInShop = {
            battleShop1: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            battleShop2: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            battleShop3: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
            battleShop4: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
                      LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
                      BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
          };
          
          const typeGameConquest = {
            winBattle: 0,
            loseBattle: 0,
            pointBattle: 0,
            reRoll: 0,
            reRollPrice: 0,
            starUser: 0,
            price5Mon: 0,
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
            battleUserPetRound: [""],
            battlePetUseSlotRound: battlePetUseSlotRound,
            battlePetInShop: battlePetInShop,
            battlePetInInventory: battlePetInInventory,
            skillBattle: skillBattle
          }

          const typeGameSolo5Mon = {}
          const typeGameGuess = {}
          const infoStartGame = {typeGame: "No", modeGame: "No", difficultyGame: "No", roundGame:1, stepGame:0, winStreak: 0,}

          const allBattleUsersData = {typeGameConquest, typeGameSolo5Mon, typeGameGuess}

          var userData = {
            passwordUser: passwordRegister,
            nameUser: name,
            telUser: tel,
            activateUser: "Yes",
            isOnlineUser: 0,
            pointRank: 0,
            goldUser: 0,
            diamondUser: 0,
            characterUser: "",
            userPet: [""],
            battleData: allBattleUsersData,
            isBan: "No",
            timeOnline: "",
            weekOnline: "",
            ticketsUser: 0,
            vipTicket: "No",
            onGame: 0,
            infoStartGame: infoStartGame,
            idSkillRND: 0,
            todayCheckin: "No",
            weekCheckin: {t2: 0, t3: 0,t4: 0,t5: 0,t6: 0,t7: 0,cn: 0},
            giftCheckinComplete: "",
            questDay: {qd1: [0,"No"], qd2: [0,"No"],qd3: [0,"No"],qd4: [0,"No"],qd5: [0,"No"],qd6: [0,"No"]},
            questWeek: {qw1: [0,"No"], qw2: [0,"No"],qw3: [0,"No"],qw4: [0,"No"],qw5: [0,"No"],qw6: [0,"No"]},
            questWeekend: {qwe1: [0,"No"], qwe2: [0,"No"],qwe3: [0,"No"],qwe4: [0,"No"],qwe5: [0,"No"],qwe6: [0,"No"]}
          };

          messageElementLogin.innerText = "Đăng ký thành công";
          document.getElementById("loginUsername").value = usernameRegister;
          document.getElementById("loginPassword").value = passwordRegister;
          document.getElementById("registerPage").style.opacity = 0;
          setTimeout(() => {
            document.getElementById("registerPage").style.display = "none";
          }, 1500);
          hideLoading();

          fetch(firebaseHadUser, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
          });

          // keyActiveData = keyActiveData.filter(item => item.key !== keyActive);
          // if (keyActiveData.length === 0) {
          //     keyActiveData = [{ key: "JEAEF!@H%ZXZ", typeKey: "Vàng" }];
          // }

          var firebaseKeyActive = firebaseUrl + ".json";
          
          fetch(firebaseKeyActive, {
            method: "PATCH", // Firebase không hỗ trợ DELETE phần tử mảng, dùng PATCH để cập nhật danh sách mới
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keyActiveData }) // Cập nhật danh sách mới
          }).then(response => response.json())
            .then(data => console.log("Xóa thành công!", data))
            .catch(error => console.error("Lỗi khi xóa:", error));
      // } else {
      //   messageElement.innerText = "Mã kích hoạt đã được sử dụng hoặc không đúng!";
      //   hideLoading();
      // }
    })
    .catch(error => {
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
          usernameLogin = "vanviettest"
          passwordLogin = "123456"
        }
        var firebaseUserUrl = firebaseUrl + "allUsers/" + usernameLogin + ".json"; // URL Firebase của user

        fetch(firebaseUserUrl) // Gửi yêu cầu lấy dữ liệu từ Firebase
        .then(response => response.json()) // Chuyển dữ liệu thành JSON
        .then(userData => {
            var messageElement = document.getElementById("loginMessage");

            if (userData === null) { 
                messageElement.innerText = "Tài khoản chưa được đăng ký!";
                hideLoading();
                return;
            }

            if (userData.passwordUser !== passwordLogin) {
                messageElement.innerText = "Mật khẩu không đúng!";
                hideLoading();
                return;
            }

            if (userData.isOnlineUser > 0) {
                messageElement.innerText = "Tài khoản đang có người sử dụng!";
                hideLoading();
                return;
            }

            if (userData.activateUser === "No") {
                messageElement.innerText = "Tài khoản chưa được kích hoạt, vui lòng đợi hoặc liên hệ hỗ trợ!";
                hideLoading();
                return;
            }

            // ✅ Đăng nhập thành công, cập nhật trạng thái online
            fetch(firebaseUserUrl, {
                method: "PATCH",
                body: JSON.stringify({ isOnlineUser: 1 }), // Cập nhật trạng thái online = 1
                headers: { "Content-Type": "application/json" }
            }).then(() => {
                username = usernameLogin;
                password = passwordLogin;
                
                loadDataForUser(); // Load dữ liệu người dùng

                document.getElementById("welcomePage").style.display = "none";
                document.getElementById("mainScreen").style.display = "flex";
                
                document.getElementById("loginUsername").value = "";
                document.getElementById("loginPassword").value = "";
                openFullscreen();
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

function openPopupSelectCharacter() {
  document.getElementById("popupSelectCharacter").style.display = "flex";
  document.getElementById("popupOverlay").style.display = "block"
}

function selectCharacterForUser(select) {
  if (select === "Male") {
    characterUser = "C0001"
    document.getElementById("popupSelectCharacter").style.display = "none";
    document.getElementById("popupOverlay").style.display = "none"
  } else if (select === "Female") {
    characterUser = "C0001"
    document.getElementById("popupSelectCharacter").style.display = "none";
    document.getElementById("popupOverlay").style.display = "none"
  }
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
//Tủ đồ và hành lý
function openBag() {
  document.getElementById("gacha-container").style.display = "none"

  function createSlots(containerId, rows, cols, prefix) {
    const container = document.getElementById(containerId);
    container.innerHTML = ""; // Xóa tất cả nội dung trước đó
    const totalSlots = rows * cols;

    // Tạo các slot skill dựa trên số dòng và số cột
    for (let row = 0; row < rows; row++) {
        const rowDiv = document.createElement("div");
        rowDiv.style.display = "flex";
        rowDiv.style.justifyContent = "space-between";
        rowDiv.style.gap = "3px";
        rowDiv.style.marginBottom = "3px";

        container.appendChild(rowDiv);

        for (let col = 0; col < cols; col++) {
            const slotDiv = document.createElement("div");
            const slotId = `${prefix}${row * cols + col + 1}`;
            slotDiv.id = slotId;
            slotDiv.className = "slotSkillBag";
            slotDiv.dataset.container = containerId;
            rowDiv.appendChild(slotDiv);
        }
    }
}

function populateSlots(items, containerId, prefix) {
    // Chỉ hiển thị các item còn lại từ index hiện tại
    items.forEach((item, index) => {
        const slotId = `${prefix}${index + 1}`;
        const slotDiv = document.getElementById(slotId);

        if (slotDiv) {
          const skillDiv = document.createElement("div");
          skillDiv.id = `${prefix}Skill${index + 1}`;
          skillDiv.style.width = "100%";
          skillDiv.style.height = "100%";
          skillDiv.style.cursor = "grab"; // Sửa cú pháp
          skillDiv.style.borderRadius = "5px"; // Sửa cú pháp (border-radius => borderRadius)
          skillDiv.style.textAlign = "center"; // Sửa cú pháp (text-align => textAlign)
          skillDiv.style.background = "#3b3b56"; // Dùng đúng cú pháp
          skillDiv.style.backgroundSize = "cover";
          skillDiv.style.backgroundPosition = "center";
          skillDiv.style.backgroundRepeat = "no-repeat";
          skillDiv.style.position = "relative";
          skillDiv.style.backgroundImage = `url(${item.URLimg})`; // Đặt URL hình ảnh
          skillDiv.draggable = true; // Đặt thuộc tính draggable
          skillDiv.dataset.id = item.ID; // Gắn dữ liệu ID
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
            dameSkillText += `<div class="skill-freeze">${Number(item.COOLDOWN[0]/2/1000*item.LEVEL)}</div>`;
          }
        
          // Gắn nội dung vào slotDiv
          slotDiv.innerHTML =
          `<div class="dameSkillText" style="display: flex; flex-direction: row; align-items: center;">
          ${dameSkillText}
          </div>`;
        
          // Thêm sự kiện click để hiển thị thông tin
          

          skillDiv.addEventListener("dragstart", handleDragStart);
          slotDiv.appendChild(skillDiv);
        }
    });

    setupPopupInfo5MonBag(userPet, "inventory")
    setupPopupInfo5MonBag(typeGameConquest.battleUserPet, "bag")
}

  function handleDragStart(event) {
      const skillId = event.target.dataset.id;
      const source = event.target.dataset.source;
      event.dataTransfer.setData("text/plain", JSON.stringify({ skillId, source }));
  }

  function handleDrop(event) {
      event.preventDefault();
      const data = JSON.parse(event.dataTransfer.getData("text/plain"));
      const skillId = data.skillId;
      const source = data.source;
      const targetContainer = event.target.closest(".slotSkillBag").dataset.container;

      if (source === "inventoryPages" && targetContainer === "bagPages") {
          const skill = userPet.find((s) => s.ID === skillId);
          if (skill && !typeGameConquest.battleUserPet.some((s) => s.ID === skillId)) {
            typeGameConquest.battleUserPet.push(skill);
            console.log("battleUserPet", typeGameConquest.battleUserPet)
            updateSlots();
            if (guideMode && stepGuide <= 4) {
              showStepGuide(4);
            }
          } else {
            console.log("Skill đã có trong bag hoặc không tồn tại!");
          }
      } else if (source === "bagPages" && targetContainer === "inventoryPages") {
          const index = typeGameConquest.battleUserPet.findIndex((s) => s.ID === skillId);
          if (index !== -1) {
              typeGameConquest.battleUserPet.splice(index, 1);
              updateSlots();
          }
      }
  }

  function updateSlots() {
    const INVENTORY_COLS = 6;  // Số cột trong inventory

    const BAG_ROWS = 20;  // Số dòng trong bag
    const BAG_COLS = 2;  // Số cột trong bag

    // Tính số dòng INVENTORY_ROWS dựa vào chiều dài của userPet và làm tròn lên
    const INVENTORY_ROWS = Math.max(Math.ceil(userPet.length / INVENTORY_COLS),4);  // Số dòng sẽ là số lượng item chia cho số cột, làm tròn lên
    const BAG_ITEMS_PER_PAGE = BAG_ROWS * BAG_COLS;

    // Cập nhật INVENTORY_ITEMS_PER_PAGE theo số dòng và số cột
    const INVENTORY_ITEMS_PER_PAGE = INVENTORY_ROWS * INVENTORY_COLS;

      createSlots("inventoryPages", INVENTORY_ROWS, INVENTORY_COLS, "inventory");
      createSlots("bagPages", BAG_ROWS, BAG_COLS, "bag");

      // Populate các mục vào các slot trong inventory và bag
      populateSlots(userPet, "inventoryPages", "inventory");
      populateSlots(typeGameConquest.battleUserPet, "bagPages", "bag");

      // Thêm sự kiện drag and drop cho các slot
      document.querySelectorAll(".slotSkillBag").forEach((slot) => {
          slot.addEventListener("dragover", (e) => e.preventDefault()); // Cho phép kéo thả
          slot.addEventListener("drop", handleDrop); // Xử lý thả item
      });
    
    document.getElementById("textInventory").innerHTML = `Tủ đồ của bạn (${userPet.length})`;
    document.getElementById("textBag").innerHTML = `Hành lý (${typeGameConquest.battleUserPet.length}/40)`;
  }

  updateSlots();

  showOrHiddenDiv("bagInventory")
  
  console.log("battleUserPet khi di chuyển slot",typeGameConquest.battleUserPet)
  console.log("battleUserPetRound",typeGameConquest.battleUserPetRound)
}

function setupPopupInfo5MonBag(itemList, prefix) {
    const popup = document.getElementById("popupSTT5Mon");
    const overlay = document.getElementById("popupOverlay");

    // Kiểm tra itemList là mảng hay đối tượng
    let itemsArray = [];

    if (Array.isArray(itemList)) {
        // Nếu là mảng []
        itemsArray = itemList;
    } else if (typeof itemList === "object" && itemList !== null) {
        // Nếu là đối tượng {}
        itemsArray = Object.entries(itemList).map(([key, value]) => ({ key, ...value }));
    } else {
        console.warn("⚠️ itemList không hợp lệ!", itemList);
        return; // Thoát hàm nếu itemList không hợp lệ
    }

    console.log("itemsArray", itemList , itemsArray)

    // Thêm sự kiện click cho từng item để mở popup
    itemsArray.forEach((item,index) => {
        const itemDiv = document.getElementById(`${prefix}${index + 1}`);
        if (!itemDiv) {
          console.warn(`Không tìm thấy phần tử với ID: ${prefix}${index + 1}`);
          return; // Bỏ qua nếu phần tử không tồn tại
        }

        itemDiv.addEventListener("click", () => {
          document.getElementById("imgPopupSTT5Mon").src = item.URLimg;
          document.getElementById("namePopupSTT5Mon").textContent = item.NAME;
          let descTextItem = "";
        // Type
        let typeInfo = "";
        item.TYPE.forEach(type => {
          typeInfo += `[${type}]`;
        });
        
        // Cập nhật thông tin trong popup
        descTextItem += `
          <span style="display: flex; justify-content: space-between; flex-direction: row; align-items: center;">
          <span style="display: flex; gap: 5px;">
            <span style="color: #4504b3; font-weight: bold; font-size: 12px;">${typeInfo}</span>
          </span>
          </span>`
          
        
        descTextItem += `<span style="font-weight: bold;margin-top: 5px;">[Kỹ năng] [Tốc độ: ${item.COOLDOWN[0]/1000 || ''} giây] [Liên kích: x${Math.max(item.COOLDOWN[1] + item.COOLDOWN[2] + item.COOLDOWN[3], 1)}]</span>`

        let descInfo = "";
        let countDescInfo = 1;
        if (item.EFFECT.length === 1) {
          item.EFFECT.forEach((effect) => {
            if (effectsSkill[effect]) {
            // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
              const dynamicDescription = new Function("skill", `return \`${effectsSkill[effect].descriptionSkill}\`;`);
              descInfo += dynamicDescription(item)
            }
          });
        } else {
          item.EFFECT.forEach((effect) => {
            if (effectsSkill[effect]) {
            // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
              const dynamicDescription = new Function("skill", `return \`${effectsSkill[effect].descriptionSkill}\`;`);
              descInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countDescInfo})</span> ${dynamicDescription(item)}</span>`;
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
              internalInfo += dynamicDescription(item)
            }
          });
        } else {
          item.INTERNAL.forEach((internal) => {
            if (effectsInternal[internal]) {
            // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
              const dynamicDescription = new Function("skill", `return \`${effectsInternal[internal].descriptionInternal}\`;`);
              internalInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countInternalInfo})</span> ${dynamicDescription(item)}</span>`;
              countInternalInfo += 1;
            }
          });
        }

        //Chí mạng info
        let critPercent = item.CRIT.reduce((a, b) => a + b, 0)
        let critInfo = ""
        if (critPercent>0) {
          critInfo = `Tỷ lệ chí mạng: <span style="color: red; font-weight: bold">${critPercent}% </span>`;
        }
        // Gán nội dung vào phần tử HTML
        if (descInfo !== ""){
        descTextItem +=
          `<span style="font-weight: bold">[Chủ động][+Nộ mỗi đòn: ${Math.max(Math.max(Math.min(30000 / item.COOLDOWN[0], 200), 10)/(item.COOLDOWN[1]+item.COOLDOWN[2]+item.COOLDOWN[3]),1).toFixed(2)}]</span>
          <span style="display: flex;flex-direction: column; gap: 3px;">${descInfo.trim()}</span>
          <span>${critInfo.trim()}</span>`;
        } else {
          descTextItem += "";
        }

        if (internalInfo !== ""){
        descTextItem +=
          `<span style="font-weight: bold">[Bị động]</span>
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
              sellUpInfo += dynamicDescription(item)
            }
          });
        } else {
          item.SELLUP.forEach((sellup) => {
            if (effectsSellUp[sellup]) {
            // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
              const dynamicDescription = new Function("skill", `return \`${effectsSellUp[sellup].descriptionSellUp}\`;`);
              sellUpInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countSellUpInfo})</span> ${dynamicDescription(item)}</span>`;
              countSellUpInfo += 1;
            }
          });
        }

        if (sellUpInfo !== ""){
          descTextItem += `<span style="font-weight: bold">[Thả đi nhận được]</span>
          <span style="display: flex;flex-direction: column; gap: 3px;">${sellUpInfo.trim()}</span>`;
        } else {
          descTextItem += "";
        }

          document.getElementById("descPopupSTT5Mon").innerHTML = descTextItem;
          
          popup.style.display = "block";
          overlay.style.display = "block";
        });
    });

    // Đóng popup khi bấm nút đóng hoặc click vào nền mờ
    [overlay, popup].forEach(element => {
        element.addEventListener("click", (event) => {
            if (popup.style.display === "block") {
              popup.style.display = "none";
              overlay.style.display = "none";
            }
        });
    });
}





function resetOutGame() {
  //Hp của người chơi (nếu round = 1 thì auto Hp = 300; còn round > 1 thì Hp được lấy từ googleSheet)
  maxHpUp = 0;
  typeGameConquest.maxHpBattle = defaultHP + maxHpUp;
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
  typeGameConquest.price5Mon = 0;
  price5MonConquest = 0;
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

  saveNowShieldA = 0;
  saveNowShieldB = 0;
  saveShieldState = {};
  skillsSleepA = {skill1A: 0,skill2A: 0,skill3A: 0,skill4A: 0,skill5A: 0,skill6A: 0,skill7A: 0,skill8A: 0,skill9A: 0};
  skillsSleepB = {skill1B: 0,skill2B: 0,skill3B: 0,skill4B: 0,skill5B: 0,skill6B: 0,skill7B: 0,skill8B: 0,skill9B: 0};
  skillsDeleteA = {skill1A: 0,skill2A: 0,skill3A: 0,skill4A: 0,skill5A: 0,skill6A: 0,skill7A: 0,skill8A: 0,skill9A: 0};
  skillsDeleteB = {skill1B: 0,skill2B: 0,skill3B: 0,skill4B: 0,skill5B: 0,skill6B: 0,skill7B: 0,skill8B: 0,skill9B: 0};
  // limitSkillsA = {skill1A: 0,skill2A: 0,skill3A: 0,skill4A: 0,skill5A: 0,skill6A: 0,skill7A: 0,skill8A: 0,skill9A: 0};
  // limitSkillsB = {skill1B: 0,skill2B: 0,skill3B: 0,skill4B: 0,skill5B: 0,skill6B: 0,skill7B: 0,skill8B: 0,skill9B: 0};
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
  
  totalSpeedUpTimeA = 0; // Thời gian tổng cộng hiệu lực tăng tốc cho team A
  totalSpeedUpTimeB = 0; // Thời gian tổng cộng hiệu lực tăng tốc cho team B
  totalSpeedDownTimeA = 0;
  totalSpeedDownTimeB = 0;
  speedUpA = 1;
  speedUpB = 1;
  document.getElementById("cooldownSkillA").style.backgroundColor = "rgb(0 0 0 / 25%)";
  document.getElementById("cooldownSkillB").style.backgroundColor = "rgb(0 0 0 / 25%)";
  typeGameConquest.slowB = 0;
  typeGameConquest.dameCritB = 0;
  typeGameConquest.upCooldownB = 0;
  typeGameConquest.slowA = 0;
  typeGameConquest.dameCritA = 0;
  typeGameConquest.upCooldownA = 0;
  typeGameConquest.skillBattle = { //Khay Pet sử dụng
    skill1A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill2A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill3A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill4A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill5A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill6A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill7A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill8A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill9A: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill1B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill2B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill3B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill4B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill5B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill6B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill7B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill8B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill9B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
  };
  
  typeGameConquest.battlePetUseSlotRound = { //pet đang dùng tại slotskill
    skill1B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill2B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill3B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill4B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill5B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill6B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill7B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill8B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill9B: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
  };

  typeGameConquest.battlePetInInventory = {
    battleInv1: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleInv2: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleInv3: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleInv4: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleInv5: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleInv6: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleInv7: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleInv8: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleInv9: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
  }; //pet có trong slot tủ đồ

  typeGameConquest.battlePetInShop = {
    battleShop1: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleShop2: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleShop3: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    battleShop4: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
              LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
              BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
  };
  
  isCooldownPausedComp = false; // Biến theo dõi trạng thái tạm dừng cooldown
  isCooldownPausedMy = false; // Biến theo dõi trạng thái tạm dừng cooldown
}

function textPopupInfoSkill(skill, wherePopup){
  let popupNameLevel = ""
  let popupDesc0 = ""
  let popupDesc1 = ""
  let popupDesc2 = ""
  let popupDesc3 = ""

  if (wherePopup === "Bag") { //popup mở ở Bag, inventory ngoài màn hình chính
    popupNameLevel = document.getElementById('popupNameLevelBag')
    popupDesc0 = document.getElementById('popupDesc0Bag')
    popupDesc1 = document.getElementById('popupDesc1Bag')
    popupDesc2 = document.getElementById('popupDesc2Bag')
    popupDesc3 = document.getElementById('popupDesc3Bag')
  } else if (wherePopup === "inGame") { //popup mở ở trong game, trong trận đấu
    popupNameLevel = document.getElementById('popupNameLevel')
    popupDesc0 = document.getElementById('popupDesc0')
    popupDesc1 = document.getElementById('popupDesc1')
    popupDesc2 = document.getElementById('popupDesc2')
    popupDesc3 = document.getElementById('popupDesc3')
  }

  // Type
  let typeInfo = "";
  skill.TYPE.forEach(type => {
    typeInfo += `[${type}]`;
  });
  
  // Cập nhật thông tin trong popup
  popupNameLevel.innerHTML = `
    <span style="display: flex; justify-content: space-between; flex-direction: row; align-items: center;">
    <a>${skill.NAME || ''}</a>
    <span style="display: flex; gap: 5px;">
      <span style="color: #4504b3; font-weight: bold; font-size: 12px;">${typeInfo}</span>
      <a style="font-size:11px;">[Lv: ${skill.LEVEL || ''}]</a>
    </span>
    </span>`
    
  
  popupDesc0.innerHTML = `[Kỹ năng] <span style="font-weight: bold;">[Tốc độ: ${skill.COOLDOWN[0]/1000 || ''} giây] [Liên kích: x${Math.max(skill.COOLDOWN[1] + skill.COOLDOWN[2] + skill.COOLDOWN[3], 1)}]</span>`

  let descInfo = "";
  let countDescInfo = 1;
  if (skill.EFFECT.length === 1) {
    skill.EFFECT.forEach((effect) => {
      if (effectsSkill[effect]) {
      // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
        const dynamicDescription = new Function("skill", `return \`${effectsSkill[effect].descriptionSkill}\`;`);
        descInfo += dynamicDescription(skill)
      }
    });
  } else {
    skill.EFFECT.forEach((effect) => {
      if (effectsSkill[effect]) {
      // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
        const dynamicDescription = new Function("skill", `return \`${effectsSkill[effect].descriptionSkill}\`;`);
        descInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countDescInfo})</span> ${dynamicDescription(skill)}</span>`;
        countDescInfo += 1;
      }
    });
  }

  let internalInfo = "";
  let countInternalInfo = 1;
  if (skill.INTERNAL.length === 1) {
    skill.INTERNAL.forEach((internal) => {
      if (effectsInternal[internal]) {
      // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
        const dynamicDescription = new Function("skill", `return \`${effectsInternal[internal].descriptionInternal}\`;`);
        internalInfo += dynamicDescription(skill)
      }
    });
  } else {
    skill.INTERNAL.forEach((internal) => {
      if (effectsInternal[internal]) {
      // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
        const dynamicDescription = new Function("skill", `return \`${effectsInternal[internal].descriptionInternal}\`;`);
        internalInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countInternalInfo})</span> ${dynamicDescription(skill)}</span>`;
        countInternalInfo += 1;
      }
    });
  }

  //Chí mạng info
  let critPercent = skill.CRIT.reduce((a, b) => a + b, 0)
  let critInfo = ""
  if (critPercent>0) {
    critInfo = `Tỷ lệ chí mạng: <span style="color: red; font-weight: bold">${critPercent}% </span>`;
  }
  // Gán nội dung vào phần tử HTML
  if (descInfo !== ""){
  popupDesc1.innerHTML =
    `<span style="font-weight: bold">[Chủ động][+Nộ mỗi đòn: ${Math.max(Math.max(Math.min(30000 / skill.COOLDOWN[0], 200), 10)/(skill.COOLDOWN[1]+skill.COOLDOWN[2]+skill.COOLDOWN[3]),1).toFixed(2)}]</span>
    <span style="display: flex;flex-direction: column; gap: 3px;">${descInfo.trim()}</span>
    <span>${critInfo.trim()}</span>`;
  } else {
    popupDesc1.innerHTML = "";
  }

  if (internalInfo !== ""){
  popupDesc2.innerHTML =
    `<span style="font-weight: bold">[Bị động]</span>
    <span style="display: flex;flex-direction: column; gap: 3px;">${internalInfo.trim()}</span>`
  } else {
    popupDesc2.innerHTML = "";
  }

  //Sellup info
  let sellUpInfo = "";
  let countSellUpInfo = 1;
  if (skill.SELLUP.length === 1) {
    skill.SELLUP.forEach((sellup) => {
      if (effectsSellUp[sellup]) {
      // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
        const dynamicDescription = new Function("skill", `return \`${effectsSellUp[sellup].descriptionSellUp}\`;`);
        sellUpInfo += dynamicDescription(skill)
      }
    });
  } else {
    skill.SELLUP.forEach((sellup) => {
      if (effectsSellUp[sellup]) {
      // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
        const dynamicDescription = new Function("skill", `return \`${effectsSellUp[sellup].descriptionSellUp}\`;`);
        sellUpInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countSellUpInfo})</span> ${dynamicDescription(skill)}</span>`;
        countSellUpInfo += 1;
      }
    });
  }

  if (sellUpInfo !== ""){
    popupDesc3.innerHTML = `<span style="font-weight: bold">[Thả đi nhận được]</span>
    <span style="display: flex;flex-direction: column; gap: 3px;">${sellUpInfo.trim()}</span>`;
  } else {
    popupDesc3.innerHTML = "";
  }

}

function setupPopupInfo5MonInBattle(skillInfo) {
  document.getElementById("imgPopupSTT5Mon").src = skillInfo.URLimg;
  document.getElementById("namePopupSTT5Mon").textContent = skillInfo.NAME;
  document.getElementById("levelTextPopupSTT5Mon").innerText = skillInfo.LEVEL;

  if (skillInfo.LEVEL === 1) {
    document.getElementById("levelColorPopupSTT5Mon").style.color = "#531515"
  }
  if (skillInfo.LEVEL === 2) {
    document.getElementById("levelColorPopupSTT5Mon").style.color = "#8c0b0b"
  }
  if (skillInfo.LEVEL === 3) {
    document.getElementById("levelColorPopupSTT5Mon").style,color = "#c00d0d"
  }
  if (skillInfo.LEVEL === 4) {
    document.getElementById("levelColorPopupSTT5Mon").style.color = "red"
  }

  let descTextItem = "";
  // Type
  let typeInfo = "";
  skillInfo.TYPE.forEach(type => {
  typeInfo += `[${type}]`;
  });
    
  // Cập nhật thông tin trong popup
  descTextItem += `
    <span style="display: flex; justify-content: space-between; flex-direction: row; align-items: center;">
              <span style="display: flex; gap: 5px;">
                <span style="color: #4504b3; font-weight: bold; font-size: 12px;">${typeInfo}</span>
    </span>
    </span>`
    
    
  descTextItem +=
    `<span style="font-weight: bold;margin-top: 5px;">[Kỹ năng] [Tốc độ: ${skillInfo.COOLDOWN[0]/1000 || ''} giây] [Liên kích: x${Math.max(skillInfo.COOLDOWN[1] + skillInfo.COOLDOWN[2] + skillInfo.COOLDOWN[3], 1)}]</span>`
    
  let descInfo = "";
  let countDescInfo = 1;
  if (skillInfo.EFFECT.length === 1) {
    skillInfo.EFFECT.forEach((effect) => {
      if (effectsSkill[effect]) {
        // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
        const dynamicDescription = new Function("skill", `return \`${effectsSkill[effect].descriptionSkill}\`;`);
        descInfo += dynamicDescription(skillInfo)
      }
    });
  } else {
    skillInfo.EFFECT.forEach((effect) => {
      if (effectsSkill[effect]) {
        // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
        const dynamicDescription = new Function("skill", `return \`${effectsSkill[effect].descriptionSkill}\`;`);
        descInfo +=
        `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countDescInfo})</span>
        ${dynamicDescription(skillInfo)}</span>`;
        countDescInfo += 1;
      }
    });
  }
    
  let internalInfo = "";
  let countInternalInfo = 1;
  if (skillInfo.INTERNAL.length === 1) {
    skillInfo.INTERNAL.forEach((internal) => {
      if (effectsInternal[internal]) {
        // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
        const dynamicDescription = new Function("skill", `return \`${effectsInternal[internal].descriptionInternal}\`;`);
        internalInfo += dynamicDescription(skillInfo)
      }
    });
  } else {
    skillInfo.INTERNAL.forEach((internal) => {
      if (effectsInternal[internal]) {
        // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
        const dynamicDescription = new Function("skill", `return \`${effectsInternal[internal].descriptionInternal}\`;`);
        internalInfo +=
        `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countInternalInfo})</span>
        ${dynamicDescription(skillInfo)}</span>`;
        countInternalInfo += 1;
      }
    });
  }
    
  //Chí mạng info
  let critPercent = skillInfo.CRIT.reduce((a, b) => a + b, 0)
  let critInfo = ""
  if (critPercent>0) {
    critInfo = `Tỷ lệ chí mạng: <span style="color: red; font-weight: bold">${critPercent}% </span>`;
  }

  // Gán nội dung vào phần tử HTML
  if (descInfo !== ""){
    descTextItem +=
    `<span style="font-weight: bold">[Chủ động][+Nộ mỗi đòn: ${Math.max(Math.max(Math.min(30000 / skillInfo.COOLDOWN[0], 200), 10)/(skillInfo.COOLDOWN[1]+skillInfo.COOLDOWN[2]+skillInfo.COOLDOWN[3]),1).toFixed(2)}]</span>
    <span style="display: flex;flex-direction: column; gap: 3px;">${descInfo.trim()}</span>
    <span>${critInfo.trim()}</span>`;
  } else {
    descTextItem += "";
  }
    
  if (internalInfo !== ""){
    descTextItem +=
    `<span style="font-weight: bold">[Bị động]</span>
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
    
  if (sellUpInfo !== ""){
    descTextItem += `<span style="font-weight: bold">[Thả đi nhận được]</span>
    <span style="display: flex;flex-direction: column; gap: 3px;">${sellUpInfo.trim()}</span>`;
  } else {
    descTextItem += "";
  }
    
  document.getElementById("descPopupSTT5Mon").innerHTML = descTextItem;
}


//Check người dùng offline
window.addEventListener("beforeunload", function (event) {
  if (isFinalLoadData && !isOut) {
    setUserOffline();
  }
});

let isOut = false;
function setUserOnline() {
  if (!username) {
    console.error("Username is required");
    return;
  }

  const firebaseURL = "https://mon-33182-default-rtdb.asia-southeast1.firebasedatabase.app/allUsers/" + username + ".json";

  // 1️⃣ Cập nhật trạng thái online ngay lập tức
  fetch(firebaseURL)
    .then(response => response.json())
    .then(userData => {
      let currentOnline = userData?.isOnlineUser || 0;
      currentOnline += 1;

      return fetch(firebaseURL, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnlineUser: currentOnline }),
      });
    })
    .then(response => response.json())
    .then(data => {
      console.log("User online count updated:", data);

      // 2️⃣ Chờ 5 giây rồi kiểm tra lại
      setTimeout(() => {
        fetch(firebaseURL)
          .then(response => response.json())
          .then(updatedUserData => {
            if (updatedUserData?.isOnlineUser > 1) {
              isOut = true;

              // 3️⃣ Tạo popup đếm ngược
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
              countdownPopup.innerHTML = "Có người đã đăng nhập. Bạn sẽ bị thoát trong <span id='countdown'>10</span> giây.";
              document.body.appendChild(countdownPopup);

              // 4️⃣ Chạy bộ đếm ngược từ 10 → 1
              let countdown = 10;
              const countdownInterval = setInterval(() => {
                const countdownElement = document.getElementById("countdown");
                if (countdownElement) {
                  countdownElement.innerText = countdown;
                }
                
                countdown--;
                if (countdown < 0) {
                  clearInterval(countdownInterval);
                  setUserOffline();
                  window.location.reload();
                }
              }, 1000);
            }
          })
          .catch(error => console.error("Error checking user online status:", error));
      }, 2000);
    })
    .catch(error => console.error("Error updating user online status:", error));
}



//++++++++++++++
function setUserOffline() {
  if (!isFinalLoadData) return;

  const appScriptUrl = "https://script.google.com/macros/s/AKfycbx23Gup4uGO5JlhIk85OrhQcXomBjNBiS5XpzeE3CDEwZOEL_8JybpR53roIdGCoH4/exec";

  const dataOnline = {
    username: username,  // Gửi tên người dùng
  };
  
  if (endGame) {
    // Reset chỉ số trước khi lưu
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

    let userPetIDs = userPet.map(item => item.ID);
    if (userPetIDs.length < 1) {
      userPetIDs = [""]
    }
    let battleUserPetIDs = typeGameConquest.battleUserPet.map(item => item.ID);
    if (battleUserPetIDs.length < 1) {
      battleUserPetIDs = [""]
    }

    let battleUserPetRoundIDs = [...new Set(typeGameConquest.battleUserPetRound.map(item => item.ID))];
    if (battleUserPetRoundIDs.length < 1) {
      battleUserPetRoundIDs = [""]
    }

    
    console.log("battleUserPetRound", typeGameConquest.battleUserPetRound)
    console.log("battleUserPetRoundIDs", typeGameConquest.battleUserPetRoundIDs)
    console.log("battlePetInShop", typeGameConquest.battlePetInShop)

    let allBattleUsersData = {
      typeGameConquest: {
        ...typeGameConquest, // Sao chép dữ liệu Conquest gốc để tránh ảnh hưởng
        battleUserPetRound: battleUserPetRoundIDs, // Cập nhật battleUserPetRound
        battleUserPet: battleUserPetIDs // Cập nhật battleUserPet
      },
      typeGameSolo5Mon, // Giữ nguyên dữ liệu của typeGameSolo5Mon
      typeGameGuess, // Giữ nguyên dữ liệu của typeGameGuess
    };


    const userData = {
      passwordUser: password,
      nameUser: nameUser,
      activateUser: activateUser,
      telUser: telUser,
      pointRank: pointRank,
      goldUser: goldUser,
      diamondUser: diamondUser,
      onGame: onGame,
      infoStartGame: infoStartGame,
      isOnlineUser: 0,
      characterUser: characterUser,
      userPet: userPetIDs,
      battleData: allBattleUsersData,
      isBan: isBan,
      timeOnline: timeOnline,
      weekOnline: weekOnline,
      ticketsUser: ticketsUser,
      vipTicket: vipTicket,
      idSkillRND: idSkillRND,
      todayCheckin: todayCheckin,
      weekCheckin: weekCheckin,
      giftCheckinComplete: giftCheckinComplete,
      questDay: questDay,
      questWeek: questWeek,
      questWeekend: questWeekend,
    };

      const data = { userData, dataOnline };

      // Gửi dữ liệu sau khi lấy được giá trị chính xác từ Firebase
       navigator.sendBeacon(appScriptUrl, JSON.stringify(data));
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

//Đóng setting
function closePopupSetting() {
  const popup = document.getElementById('popupSetting');
  popup.style.display = "none"
}

//Bảng xếp hạng
function openRankBoard() {
  changePage(0)
  showOrHiddenDiv("rankBoard")
}

let currentPageRank = 1;
const usersPerPage = 7; // Số người chơi hiển thị mỗi trang

function rankBoard() {
    const leaderboardBody = document.getElementById("leaderboard-body");
    leaderboardBody.innerHTML = "";

    const sortedUsers = Object.entries(allUsers).sort(([, a], [, b]) => b.pointRank - a.pointRank);
    const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

    const start = (currentPageRank - 1) * usersPerPage;
    const end = start + usersPerPage;
    const usersOnPage = sortedUsers.slice(start, end);

    let topCheck = "";
    let colorTop = "";

    for (let i = 0; i < usersPerPage; i++) {
        const [username, data] = usersOnPage[i] || []; // Tách dữ liệu, tránh lỗi undefined

        if (start + i + 1 === 1) {
          topCheck = `<i class="fa-solid fa-crown"></i>`;
          colorTop = `rgb(145 46 99)`
        } else if (start + i + 1 === 2) {
          topCheck = `<i class="fa-solid fa-chess-queen"></i>`
          colorTop = `rgb(145 46 99)`
        } else if (start + i + 1 === 3) {
          topCheck = `<i class="fa-solid fa-chess-knight"></i>`
          colorTop = `rgb(145 46 99)`
        } else {
          topCheck = ""
          colorTop = `rgb(46 128 145)`
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
            <td style="width: 40%; text-align: center; font-weight: bold;">${data?.nameUser || ""}</td>
            <td style="width: 25%; text-align: center;">${data?.pointRank ?? "-"}</td>
            <td style="width: 10%; text-align: center;"></td>
        `;

        leaderboardBody.appendChild(row);
    }

    const myTop = sortedUsers.findIndex(([user]) => user === username) + 1; // Thứ hạng bắt đầu từ 1



    document.getElementById("myRankTop").innerHTML = `${myTop}`
    document.getElementById("myRankName").innerHTML = `${nameUser}`
    document.getElementById("myRankPoint").innerHTML = `${pointRank}`

    document.getElementById("prev-page").disabled = currentPageRank === 1;
    document.getElementById("next-page").disabled = currentPageRank === totalPages;
}




// Chuyển trang
function changePage(direction) {
    const sortedUsers = Object.entries(allUsers).sort(([, a], [, b]) => b.pointRank - a.pointRank);
    const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

    currentPageRank += direction;
    if (currentPageRank < 1) currentPageRank = 1;
    if (currentPageRank > totalPages) currentPageRank = totalPages;

    rankBoard();
}

//Mở shop
function openShop() {
  //Ẩn trang chủ
  startLoading();
  setTimeout(() => {
    for (let i = 0; i < 5; i++) {
      document.getElementById(`skill${i + 1}S`).innerHTML = "?";
      document.getElementById(`skill${i + 1}SText`).innerHTML = "";
      document.getElementById(`skill${i + 1}S`).style.overflow = "hidden";
      document.getElementById(`skill${i + 1}S`).classList.remove("user");
    }

    resetGoldAndTicket();
    document.getElementById('mainScreen').style.display = "none";
    document.getElementById('shopScreen').style.display = "flex";
    changePageShop("gachaPage")
  }, 1000)
  endLoading();
}

//Đóng shop
function closeShop() {
  startLoading();
  setTimeout(() => {
    resetGoldAndTicket();
    document.getElementById('mainScreen').style.display = "flex";
    document.getElementById('shopScreen').style.display = "none";
  }, 1000);
  endLoading();
}

//Chuyển trang trong shop
function changePageShop(isPage) {
  const pages = [
    { page: "gachaPage"},
    { page: "shopPage"},
    { page: "exchangePage"}
  ];

  pages.forEach(({page}) => {
    const pageElement = document.getElementById(page);
    pageElement.style.display = "none";
  });

  if (isPage === "gachaPage") {
    const pageElement = document.getElementById(isPage);
    pageElement.style.display = "flex"
  }
  if (isPage === "shopPage") {
    const pageElement = document.getElementById(isPage);
    openShopPage();
    pageElement.style.display = "flex"
  }
  if (isPage === "exchangePage") {
    const pageElement = document.getElementById(isPage);
    openExchangePage();
    pageElement.style.display = "flex"
  }

  changePageShopButton();
}

//Đổi hiệu ứng button
function changePageShopButton() {
  const pages = [
    { page: "gachaPage", button: "gachaPageButton" },
    { page: "shopPage", button: "shopPageButton" },
    { page: "exchangePage", button: "exchangePageButton" }
  ];

  pages.forEach(({ page, button }) => {
    const pageElement = document.getElementById(page);
    const buttonElement = document.getElementById(button);

    buttonElement.style.background = pageElement.style.display === "flex"
      ? "#3c7fec"
      : "firebrick";
  });
}

//Shop page
const itemShop1 = [
    { idItem: "I0001", nameItem: "Gói 10 vàng", effectItem: "addGold10", priceItem: 10, URLitem: "https://res.cloudinary.com/dxgawkr4g/image/upload/v1730731024/0005.png", desc: "Bạn sẽ nhận được 10 vàng"},
    { idItem: "I0002", nameItem: "Gói 100 vàng", effectItem: "addGold100", priceItem: 95, URLitem:
    "https://res.cloudinary.com/dxgawkr4g/image/upload/v1730731024/0005.png", desc: "Bạn sẽ nhận được 100 vàng"},
    { idItem: "I0003", nameItem: "Gói 200 vàng", effectItem: "addGold200", priceItem: 170, URLitem:
    "https://res.cloudinary.com/dxgawkr4g/image/upload/v1730731024/0005.png", desc: "Bạn sẽ nhận được 200 vàng"},
    { idItem: "I0004", nameItem: "Gói 500 vàng", effectItem: "addGold500", priceItem: 325, URLitem:
    "https://res.cloudinary.com/dxgawkr4g/image/upload/v1730731024/0005.png", desc: "Bạn sẽ nhận được 500 vàng"},
    { idItem: "I0005", nameItem: "Gói 1000 vàng", effectItem: "addGold1000", priceItem: 450, URLitem:
    "https://res.cloudinary.com/dxgawkr4g/image/upload/v1730731024/0005.png", desc: "Bạn sẽ nhận được 1000 vàng"},
        { idItem: "I0001", nameItem: "Gói 10 vàng", effectItem: "addGold10", priceItem: 10, URLitem: "https://res.cloudinary.com/dxgawkr4g/image/upload/v1730731024/0005.png", desc: "Bạn sẽ nhận được 10 vàng"},
    { idItem: "I0002", nameItem: "Gói 100 vàng", effectItem: "addGold100", priceItem: 95, URLitem:
    "https://res.cloudinary.com/dxgawkr4g/image/upload/v1730731024/0005.png", desc: "Bạn sẽ nhận được 100 vàng"},
    { idItem: "I0003", nameItem: "Gói 200 vàng", effectItem: "addGold200", priceItem: 170, URLitem:
    "https://res.cloudinary.com/dxgawkr4g/image/upload/v1730731024/0005.png", desc: "Bạn sẽ nhận được 200 vàng"},
    { idItem: "I0004", nameItem: "Gói 500 vàng", effectItem: "addGold500", priceItem: 325, URLitem:
    "https://res.cloudinary.com/dxgawkr4g/image/upload/v1730731024/0005.png", desc: "Bạn sẽ nhận được 500 vàng"},
    { idItem: "I0005", nameItem: "Gói 1000 vàng", effectItem: "addGold1000", priceItem: 450, URLitem:
    "https://res.cloudinary.com/dxgawkr4g/image/upload/v1730731024/0005.png", desc: "Bạn sẽ nhận được 1000 vàng"},
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
        min-width: 145px;
        height: 145px;
        padding: 2px;
        background: url('${item.URLitem}');
        border-radius: 10px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-shadow: #bf823f 1px 2px 3px 2px;
        justify-content: center;
        border: 4px solid firebrick;
        background-size: cover;
        position: relative;
      `;

      // Thêm tên item
      const name = document.createElement("p");
      name.textContent = item.nameItem;
      name.style.cssText = "font-size: 12px; font-weight: bold; margin: 0px; color: white; margin-top: 1px; background:firebrick; border-bottom-right-radius: 6px; border-bottom-left-radius: 6px; width: 155px; pointer-events: none;position: absolute;bottom: -4px; display: flex; align-items: center; justify-content: center;height: 20px;";

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
    [overlay, popup].forEach(element => {
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
    skill1S: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill2S: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill3S: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill4S: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill5S: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
  };

function gacha(isX5) {
  const filteredPets = allPets.filter(pet => pet.LEVEL === 1);
  if (filteredPets.length === 0) {
    messageOpen("Không có pet nào để gacha!");
    return;
  }

  // Kiểm tra userPet có đủ các pet trong filteredPets chưa
  if (userPet) {
    const hasAllPets = filteredPets.every(pet => userPet.some(uPet => uPet.ID === pet.ID));

    if (hasAllPets) {
      messageOpen("Không còn 5Mon nào để săn, hãy chờ phát hành 5Mon mới");
      return;
    }
  }

  //Kiểm tra đủ vàng để gacha không
  if (isX5) {
    if (goldUser <5 ) {
      messageOpen("Không đủ vàng");
      return;
    } else {
      goldUser -= 5;
    }
  } else {
    if (goldUser < 1 ) {
      messageOpen("Không đủ vàng");
      return;
    } else {
      goldUser -= 1;
    }
  }

  document.getElementById("gachax1").disabled = true;
  document.getElementById("gachax5").disabled = true;
  document.getElementById("gachax1").style.background = "gray";
  document.getElementById("gachax5").style.background = "gray";

  let stopTimes = [4000, 6000, 8000, 10000, 12000];
  let chosenPets = [];

  // Làm trống randomPet trước
  randomPet = {
    skill1S: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill2S: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill3S: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill4S: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
    skill5S: {ID: "", NAME: "", TYPE: [""], SELLUP: [""], INTERNAL: [""], EFFECT: [""], URLimg:"",
    LEVEL: 0, DAME: [0, 0, 0, 0], HEAL: [0, 0, 0, 0], SHIELD: [0, 0, 0, 0],
    BURN: [0, 0, 0, 0], POISON:[0, 0, 0, 0], CRIT: [0, 0, 0, 0],COOLDOWN: [0, 0, 0, 0, 0]},
  };

  for (let i = 0; i < 5; i++) {
    document.getElementById(`skill${i + 1}S`).innerHTML = "?";
    document.getElementById(`skill${i + 1}S`).classList.remove("comp");
    document.getElementById(`skill${i + 1}SText`).innerHTML = "";
    document.getElementById(`skill${i + 1}S`).style.overflow = "hidden";
  }

  // Chọn pet trước khi quay
  if (isX5) { 
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * filteredPets.length);
      let pet = filteredPets[randomIndex];

      // Kiểm tra pet trùng trước khi quay
      if (userPet.some(existingPet => existingPet.ID === pet.ID)) {
        ticketsUser += 1; // Nếu đã có pet, đổi thành vé
        setTimeout(()=>{
          document.getElementById(`skill${i + 1}SText`).innerHTML = "Đã có";
        }, stopTimes[i])
        
      } else {
        userPet.push(pet); // Nếu chưa có, thêm vào userPet
        setTimeout(()=>{
          document.getElementById(`skill${i + 1}SText`).innerHTML = "Mới";
        }, stopTimes[i])
      }

      randomPet[`skill${i + 1}S`] = pet;
    }
  } else { 
    const pet = filteredPets[Math.floor(Math.random() * filteredPets.length)];

    if (userPet.some(existingPet => existingPet.ID === pet.ID)) {
      ticketsUser += 1; 
        setTimeout(()=>{
          document.getElementById(`skill${1}SText`).innerHTML = "Đã có";
        }, stopTimes[0])
    } else {
      userPet.push(pet);
      setTimeout(()=>{
        document.getElementById(`skill${1}SText`).innerHTML = "Mới";
      }, stopTimes[0])
    }
    randomPet.skill1S = pet;
  }

  console.log("5mon sau khi random", randomPet);
  let lengthRD = isX5?5:1
  // Chạy hiệu ứng quay
  for (let o = 0; o < lengthRD; o++) {
    let slotKey = `skill${o+1}S`
    let slotElement = document.getElementById(slotKey);
    let container = document.createElement("div");
    container.classList.add("slotContainer");
    slotElement.innerHTML = "";
    slotElement.appendChild(container);

    let finalPet = randomPet[slotKey].URLimg;
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
        img.src = filteredPets[Math.floor(Math.random() * filteredPets.length)].URLimg;
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

  if (isX5) {
    setTimeout(()=>{
      resetGoldAndTicket();
      document.getElementById("gachax1").disabled = false;
      document.getElementById("gachax5").disabled = false;
      document.getElementById("gachax1").style.background = "#d9534f";
      document.getElementById("gachax5").style.background = "#d9534f";
    }, stopTimes[4])
  } else {
    setTimeout(()=>{
      resetGoldAndTicket();
      document.getElementById("gachax1").disabled = false;
      document.getElementById("gachax5").disabled = false;
      document.getElementById("gachax1").style.background = "#d9534f";
      document.getElementById("gachax5").style.background = "#d9534f";
    }, stopTimes[0])
  }
}

function createSkillGacha(i) {
  const skillCompSlot = `skill${i+1}S`;
  let skillCompDiv = document.querySelector(`#${skillCompSlot}`);

  //Tạo 5mon ở slot i
  if ((skillCompDiv && randomPet && randomPet[skillCompSlot].ID)) {
    console.log("Vào đây 2")
    skillCompDiv.innerHTML += `
          <div 
            id="skill${idSkillRND}" 
            class="skill"
            draggable="true"
            style="background-image: url('${randomPet[skillCompSlot].URLimg}')"
            data-skill='{"ID": "${randomPet[skillCompSlot].ID}", "LEVEL": ${randomPet[skillCompSlot].LEVEL}}'>
          </div>`;
          let dameSkillText = ``; // Dùng let có thể thay đổi được biến, còn dùng const không được

          const dameSkillDiv = document.querySelector("#skill" + idSkillRND);
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
          </div>`;

        //Gắn cho div cha trạng thái đã lấp đầy
        skillCompDiv.classList.add("comp");
  }
  // Tăng idSkillRND để tạo ID duy nhất cho mỗi skill
  idSkillRND += 1;

  //Load event click hiện info cho các skill
  // createInfoSkill();
  createInfo5mon();
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
    DAME: pet.DAME,
    HEAL: pet.HEAL,
    SHIELD: pet.SHIELD,
    BURN: pet.BURN,
    POISON: pet.POISON,
    CRIT: pet.CRIT,
    COOLDOWN: pet.COOLDOWN,
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
    const aOwned = userPet.some(userItem => userItem.ID === a.ID);
    const bOwned = userPet.some(userItem => userItem.ID === b.ID);

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
        min-width: 125px;
        height: 125px;
        padding: 2px;
        background: rgb(255, 243, 220);
        border-radius: 10px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-shadow: rgb(0 0 0 / 20%) 0px 2px 5px;
        justify-content: center;
        position: relative;
      `;

      // Thêm hình ảnh
      const img = document.createElement("img");
      img.src = item.URLimg;
      img.style.cssText = "height: 95px; object-fit: cover; pointer-events: none;";

      // Thêm tên item
      const name = document.createElement("p");
      name.textContent = item.NAME;
      name.style.cssText = "font-size: 12px;font-weight: bold;margin: 1px 0px 0px;color: white;background: firebrick;border-bottom-right-radius: 6px;border-bottom-left-radius: 6px; min-width: 100px;pointer-events: none;";

      // Thêm giá item
      const price = document.createElement("p");
      price.textContent = `${item.ticketsPRICE} vé đổi`;
      price.style.cssText = "font-size: 12px; color: gold; background: seagreen; margin: 0px; border-radius: 5px; width: 95px; font-weight: bold; pointer-events: none;";

      // Kiểm tra nếu user đã sở hữu pet này
      if (userPet.some(userItem => userItem.ID === item.ID)) {
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
          document.getElementById("popupImgExchange").src = item.URLimg;
          document.getElementById("popupNameExchange").textContent = item.NAME;
          let descTextItem = "";
        // Type
        let typeInfo = "";
        item.TYPE.forEach(type => {
          typeInfo += `[${type}]`;
        });
        
        // Cập nhật thông tin trong popup
        descTextItem += `
          <span style="display: flex; justify-content: space-between; flex-direction: row; align-items: center;">
          <span style="display: flex; gap: 5px;">
            <span style="color: #4504b3; font-weight: bold; font-size: 12px;">${typeInfo}</span>
          </span>
          </span>`
          
        
        descTextItem += `<span style="font-weight: bold;margin-top: 5px;">[Kỹ năng] [Tốc độ: ${item.COOLDOWN[0]/1000 || ''} giây] [Liên kích: x${Math.max(item.COOLDOWN[1] + item.COOLDOWN[2] + item.COOLDOWN[3], 1)}]</span>`

        let descInfo = "";
        let countDescInfo = 1;
        if (item.EFFECT.length === 1) {
          item.EFFECT.forEach((effect) => {
            if (effectsSkill[effect]) {
            // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
              const dynamicDescription = new Function("skill", `return \`${effectsSkill[effect].descriptionSkill}\`;`);
              descInfo += dynamicDescription(item)
            }
          });
        } else {
          item.EFFECT.forEach((effect) => {
            if (effectsSkill[effect]) {
            // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
              const dynamicDescription = new Function("skill", `return \`${effectsSkill[effect].descriptionSkill}\`;`);
              descInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countDescInfo})</span> ${dynamicDescription(item)}</span>`;
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
              internalInfo += dynamicDescription(item)
            }
          });
        } else {
          item.INTERNAL.forEach((internal) => {
            if (effectsInternal[internal]) {
            // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
              const dynamicDescription = new Function("skill", `return \`${effectsInternal[internal].descriptionInternal}\`;`);
              internalInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countInternalInfo})</span> ${dynamicDescription(item)}</span>`;
              countInternalInfo += 1;
            }
          });
        }

        //Chí mạng info
        let critPercent = item.CRIT.reduce((a, b) => a + b, 0)
        let critInfo = ""
        if (critPercent>0) {
          critInfo = `Tỷ lệ chí mạng: <span style="color: red; font-weight: bold">${critPercent}% </span>`;
        }
        // Gán nội dung vào phần tử HTML
        if (descInfo !== ""){
        descTextItem +=
          `<span style="font-weight: bold">[Chủ động][+Nộ mỗi đòn: ${Math.max(Math.max(Math.min(30000 / item.COOLDOWN[0], 200), 10)/(item.COOLDOWN[1]+item.COOLDOWN[2]+item.COOLDOWN[3]),1).toFixed(2)}]</span>
          <span style="display: flex;flex-direction: column; gap: 3px;">${descInfo.trim()}</span>
          <span>${critInfo.trim()}</span>`;
        } else {
          descTextItem += "";
        }

        if (internalInfo !== ""){
        descTextItem +=
          `<span style="font-weight: bold">[Bị động]</span>
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
              sellUpInfo += dynamicDescription(item)
            }
          });
        } else {
          item.SELLUP.forEach((sellup) => {
            if (effectsSellUp[sellup]) {
            // Tạo hàm từ chuỗi động và thực thi với `skill` làm tham số
              const dynamicDescription = new Function("skill", `return \`${effectsSellUp[sellup].descriptionSellUp}\`;`);
              sellUpInfo += `<span style="display: flex;flex-direction: row; gap: 3px;"><span style="font-weight: bold">(${countSellUpInfo})</span> ${dynamicDescription(item)}</span>`;
              countSellUpInfo += 1;
            }
          });
        }

        if (sellUpInfo !== ""){
          descTextItem += `<span style="font-weight: bold">[Thả đi nhận được]</span>
          <span style="display: flex;flex-direction: column; gap: 3px;">${sellUpInfo.trim()}</span>`;
        } else {
          descTextItem += "";
        }

          document.getElementById("popupDescExchange").innerHTML = descTextItem;


          document.getElementById("popupPriceExchange").textContent = `${item.ticketsPRICE} vé đổi`;
          // Kiểm tra nếu pet đã sở hữu
          const isOwned = userPet.some(userItem => userItem.ID === item.ID);
            
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
    [overlay, popup].forEach(element => {
        element.addEventListener("click", (event) => {
            if (popup.style.display === "block") {
              popup.style.display = "none";
              overlay.style.display = "none";
            }
        });
    });
}

function buyItemExchange(itemID, itemName, ticketsPrice) {
    // Kiểm tra nếu user đã sở hữu pet này
    const isOwned = userPet.some(userItem => userItem.ID === itemID);
    
    if (isOwned) {
      messageOpen(`Bạn đã sở hữu pet ${itemName}, không thể mua lại.`);
      return; // Thoát khỏi function nếu đã sở hữu
    }

    if (ticketsUser < ticketsPrice) {
      messageOpen("Không đủ vé đổi");
      return;
    }

    // Tìm pet trong allPets có ID trùng và LEVEL = 1
    const petToAdd = allPets.find(pet => pet.ID === itemID && pet.LEVEL === 1);
    
    if (petToAdd) {
        // Thêm pet mới vào danh sách userPet
        userPet.push(petToAdd);
        ticketsUser -= ticketsPrice
        messageOpen(`Mua thành công pet ${itemName}`);
        //Reset lại shop
        openExchangePage();
        //Reset lại gold + ticket
        resetGoldAndTicket();
    } else {
        console.log(`Không thể mua pet ${itemID}, chỉ có thể mua pet LEVEL 1.`, userPet);
    }
}

//Reset gold + ticket + điểm xếp hạng
function resetGoldAndTicket() {
  document.getElementById("goldUserShop").innerText = `${goldUser}`;
  document.getElementById("ticketUserShop").innerText = `${ticketsUser}`;
  document.getElementById("diamondUserShop").innerText = `${diamondUser}`;

  document.getElementById("goldUser").innerText = `${goldUser}`;
  document.getElementById("ticketUser").innerText = `${ticketsUser}`;
  document.getElementById("pointRank").innerText = `${pointRank}`;
  document.getElementById("diamondUser").innerText = `${diamondUser}`;

  //Cập nhật bảng xếp hạng hiện tại:
  const sortedUsers = Object.entries(allUsers).sort(([, a], [, b]) => b.pointRank - a.pointRank);
  const myTop = sortedUsers.findIndex(([user]) => user === username) + 1; // Thứ hạng bắt đầu từ 1
  document.getElementById("isRanking").innerText = `(Top: ${myTop})`;
  // document.getElementById("isRanking").innerText = `${newRank}`;
  
}

//Hướng dẫn người chơi
  let guideMode = false; //++++++++
  let stepGuide = 0;
  //Biến các bước hướng dẫn người chơi
  const steps = [
    { element: "#openBag", text: "Bấm nút 'Tủ đồ' để mở ra tủ đồ", event: openBag , nextStep: true},
    { element: "#inventory", text: "Đây là tủ đồ chứa toàn bộ 5mon bạn sỡ hữu", nextStep: true},
    { element: "#bag", text: "Đây là hành lý nơi bạn có thể kéo các 5mon từ tủ đồ vào, 5mon này sẽ được dùng trong trận đấu", nextStep: true},
    { element: "#inventory1", text: "Hãy kéo 5mon từ tủ đồ sang hành lý", nextStep: false},
    { element: "#inventory", text: "Hãy tiếp tục kéo các 5mon khác mà bạn muốn sử dụng từ tủ đồ sang hành lý", nextStep: false},
    { element: "#openGame", text: "Bấm nút 'Bắt đầu' để vào trận đấu!", event: openGame, nextStep: true},
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
    isDay.style.background = days === 1 ? "#47a0e5":"gray";
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
  diamondUser += 3000;
  ticketsUser += 10;
  resetGoldAndTicket();
  messageOpen("Bạn nhận được 3000 kim cương và 10 vé đổi")
  loadCheckin();
}

function checkinToday(key) {
  const checkinSignal = document.getElementById("checkinSignal");
  if (checkinSignal) {
    checkinSignal.style.display = "none";
  }
  todayCheckin = "Yes"
  weekCheckin[key] = 1
  goldUser += 1000;
  resetGoldAndTicket();
  messageOpen("Điểm danh thành công, nhận về 1000 vàng")
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

    if (checkQuestForTime[key][1] ==="Yes") {
      completeQuest = "flex";
      onclickCheckGift = ""
    } else {
      completeQuest = "none";
    }

    let percentTargetQuest = Math.min((checkQuestForTime[key][0]/quest.targetQuest)*100,100);

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

  const timeQuest = time === "Day" ? allQuestData.questDay : 
                    time === "Week" ? allQuestData.questWeek : 
                    allQuestData.questWeekend;
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
