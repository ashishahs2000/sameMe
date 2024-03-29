
/*
*	loaded() starts everything.
*/

function loaded(){
	//Set up access to canvas (also required)
	canvas = $("playField");
	context = canvas.getContext("2d");
	
	//prepareSounds();
	
	//Scale the canvas to the size of the window.
	//Normally this makes scrollbars appear (??) but the canvas
	//is inside a div the size of the screen and hides overflow.
	fWidth = canvas.width = window.innerWidth;
	fHeight = canvas.height = window.innerHeight;
	
	//Fixes the first appearance of the pause screen being instant,
	//rather than a fade-in.
	$('pauseScreen').fade('hide');
		
//	updateObjects();
	
	spawn();
	updateScreen();
}


var canvas;
var context;

var fpsTime = 0;
var fpsRunTime = 33;
var fpsLastFrame = 0;
var fpsCount = 0;
var fpsCountTo = 5;

//The play field size.
var fWidth = 0;
var fHeight = 0;

cheatToTier = 0;
gradientLasers = true;

startTime = 0;
accumulatedTime = 0;

/*
Anything that is changed during gameplay that affects gameplay should be set here.
*/

function spawn(){
	$('help').fade('hide');
	$('help').style.display = "none";
	
	player = new Guy(fWidth/2,fHeight/2);
	playerPausedGame = false;
	gamePausedGame = false;

	enemies = new Array();
	ordinance = new Array();
	
	//AND THEN GOD SAID LET THERE BE HELL, AND LET IT CRUMBLE AND FALL FROM THE HEAVENS.
	//enemies.push(new MeteorStorm());
	//player.health = player.maximumHealth = 9000
	
	healthy = new HealthCapsule(0,-1);
	healthy.xPos += fWidth*2;
	
	var timeyTheTimer = new Date();
	startTime = timeyTheTimer.getTime();
	accumulatedTime = 0;
	maxTierStartTime = 0;
	maxTierAccumulatedTime = 0;
	
	
	tier = 1;
	tierAt = 600;
	tierIn = tierAt;
	tierMax = 18;
	$('tierNumber').innerHTML = tier;
	
	enemySpawnCounter = new Array();
	enemySpawnCounter.push(0); //Tank
	enemySpawnCounter.push(0); //Plane

	enemySpawnAt = new Array();
	enemySpawnAt.push(100);
	enemySpawnAt.push(145);
}

/*
*	This loop handles most object updates, most importantly the player.
*/
function increaseTier(){
	if(tier < tierMax && !player.isDead){
		if(tierIn <= 0 || tier < cheatToTier){
			healthy = new HealthCapsule(0,-1);
			tier++;
			/*
			if(tier == 2){
				enemySpawnCounter[2] = enemySpawnAt[2];
			}*/
			if(tier >= 3 && tier <= 6){
				enemySpawnAt[1] -= 8;
			}
			if(tier == 14 || tier == 16 || tier == 18){
				enemies.push(new Satellite(-1));
			}
			tierIn = tierAt;
			$('tierNumber').innerHTML = tier;
			if(tier == tierMax){
				var timeyTheTimer = new Date();
				maxTierStartTime = timeyTheTimer.getTime();
				
				$('tierNumber').innerHTML += " - max";
			}
		}
		tierIn--;
	}
}
function updateObjects(){
	if(player.isDead && $('help').style.display == "none" && player.yPos == 0){
		$('help').style.display = "block";
		$('help').fade(1);
		
		// <p>You lasted <span id="timeBeforeDeath"></span> before dying, and <span id="timeBeforeFirstBlood"></span> before taking any damage.
		//<span id="maxTierInsult">You suck and didn't even make it to the max tier.</span><span id="maxTierNormal">You lasted <span id="timeOnMaxTier"></span> in the max tier.</span></p>
	
	
		if(maxTierAccumulatedTime > 0){
			maxTierAccumulatedTime = maxTierAccumulatedTime/1000
			seconds = Math.round(maxTierAccumulatedTime%60);
			minutes = Math.floor(maxTierAccumulatedTime/60);
		
			$('timeOnMaxTier').innerHTML = minutes + "m " + seconds + "s ";
		
			$('maxTierInsult').style.display = "none";
			$("maxTierNormal").style.display = "inline";
		} else {
			$('maxTierInsult').style.display = "inline";
			$("maxTierNormal").style.display = "none";
		}
	
		accumulatedTime = accumulatedTime/1000
		seconds = Math.round(accumulatedTime%60);
		minutes = Math.floor(accumulatedTime/60);
	
		$('timeBeforeDeath').innerHTML = minutes + "m " + seconds + "s ";
	
		player.timeBeforeFirstBlood = player.timeBeforeFirstBlood/1000
		seconds = Math.round(player.timeBeforeFirstBlood%60);
		minutes = Math.floor(player.timeBeforeFirstBlood/60);
	
		$('timeBeforeFirstBlood').innerHTML = minutes + "m " + seconds + "s ";
	
		$('bulletsSpawned').innerHTML = player.stats["bulletsSpawned"];
		$('bulletsContacted').innerHTML = player.stats["bulletsContacted"];
		$('damageTaken').innerHTML = player.stats["damageTaken"];
		$('damagePossible').innerHTML = player.stats["damagePossible"];
	
		$('killTanks').innerHTML = player.stats["killTanks"];
		$('spawnTanks').innerHTML = player.stats["spawnTanks"];
		$('killPlanes').innerHTML = player.stats["killPlanes"];
		$('spawnPlanes').innerHTML = player.stats["spawnPlanes"];
		$('planeCrashes').innerHTML = player.stats["planeCrashes"];
	
		$('depthChargesDropped').innerHTML = player.stats["depthChargesDropped"];
		$('depthChargesDisarmed').innerHTML = player.stats["depthChargesDisarmed"];
	
		$('healedTotal').innerHTML = Math.abs(player.stats["healedTotal"]); //A positive point about Math is that he always has nice abs. Hah! A joke. I'm so damn bored.
		$('healsWasted').innerHTML = player.stats["healsWasted"];

		$('orbitalStrikes').innerHTML = player.stats["orbitalStrikes"];
		$('orbitalKillTanks').innerHTML = player.stats["orbitalKillTanks"];
		$('orbitalKillPlanes').innerHTML = player.stats["orbitalKillPlanes"];
		$('orbitalKillBullets').innerHTML = player.stats["orbitalKillBullets"];
	}
	increaseTier();
//	if(!gameIsPaused()){updateObjects.delay(33,this);}
	context.clearRect(0,0,fWidth,fHeight)
	
	
	healthy.drawSelf();
	
	//Spawn tanks
	if(enemySpawnCounter[0]++ >= enemySpawnAt[0]){
		var temp = Math.random();
		if(temp < .5){temp = 1;}else{temp=-1;}
		enemies.push(new Tank(tier,temp));
		enemySpawnCounter[0] = Math.random()*75-25;
	}
	//Spawn planes
	if(enemySpawnCounter[1]++ >= enemySpawnAt[1] && tier > 1){
		var temp = Math.random();
		if(temp < .5){temp = 1;}else{temp=-1;}
		enemies.push(new Plane(tier,temp));
		enemySpawnCounter[1] = Math.random()*75-25;
	}
	
	//Handle enemies
	for(var i = 0; i < enemies.length; i++){
		if(enemies[i].shouldExist){
			enemies[i].drawSelf();
		} else {
			enemies.splice(i,1); //Don't fear the reaper.
			i--;
		}
	}
	
	//Handle weapons (Ordinance, ordnance)
	if(ordinance.length > 0){
		for(var i = 0; i < ordinance.length; i++){
			if(ordinance[i].shouldExist){
				ordinance[i].drawSelf();
			} else {
				ordinance.splice(i,1);
				i--;
			//ordinance[i].drawSelf();
			}
		}
	}
	
	//Handle player
	player.drawSelf();
	
}
/*
*	This loop draws the screen, this one should be the slow half.
*/
function updateScreen(){
	if(!gameIsPaused()){updateScreen.delay(33,this);}
	
	updateObjects()
	
	//Figure out the FPS. Eventually will auto-adjust all numbers so that while
	//the game is running slower/faster, actions will occur at the intended speed.
	if(fpsCount > fpsCountTo){
		if(fpsCountTo == 5){fpsCountTo = 20;}
		//if(fpsCountTo == 1){fpsCountTo = 5;}
		
		var fpsD = new Date();
		fpsTime = fpsD.getTime() - fpsLastFrame;
		
		fpsRunTime = (fpsTime / (fpsCount));
		$('fps').innerHTML = Math.round( fpsRunTime);
		
		fpsLastFrame = fpsCount = 0;
	} else {
		if(fpsLastFrame == 0){
			var fpsD = new Date();
			fpsLastFrame = fpsD.getTime();			
		}
		fpsCount++;
	}
	
}

wilhelmCounter = 0;
wilhelmCounterMax = 100;

function prepareSounds(){
	for(var i = 0; i < wilhelmCounterMax; i++){
		audio.push(new Audio("./sounds/achievement.mp3"));
	}
}

var audio = new Array();


function playSound(){

	(function(){
		if(wilhelmCounter >= wilhelmCounterMax){
			wilhelmCounter = 0;
		}
		audio[wilhelmCounter++].play();
	}).delay(0);
}

/*
*	Key down / up for moving around n stuff.
*/
window.onkeydown = function(whatHappen){
	key = whatHappen.keyCode;
	
	if(key == 87 || key == 38){ player.goVertical(1);} //Up
	//if(key == 87 || key == 40){ player.initiateLightningCharge();} //Down
	if(key == 65 || key == 37){ player.goHorizontal(-1);} //Left
	if(key == 68 || key == 39){ player.goHorizontal(1);} //Right
	
	if(key == 32){ player.initiateLightningCharge();} //Space
};

window.onkeyup = function(whatHappen){
	key = whatHappen.keyCode;
	//document.title = key;
	
	if((key == 87 || key == 38)&& player.goingVertical == 1){ player.goVertical(0);} //Up
	//if((key == 87 || key == 40)){ } //Down
	if((key == 65 || key == 37)&& player.goingHorizontal == -1){ player.goHorizontal(0);} //Left
	if((key == 68 || key == 39)&& player.goingHorizontal == 1){ player.goHorizontal(0);} //Right
	
	if((key == 32)){player.lightningStrike();} //Space
	if((key == 80)){playerTogglePause();} //P
	if((key == 82) && player.isDead){spawn();} //R
};

function gameIsPaused(){
	if(playerPausedGame || gamePausedGame){
		return true;
	}
	return false;
}

function playerTogglePause(){
	if(gamePausedGame){return;}
	if(playerPausedGame){
		if($('pauseScreen').style.opacity == 1){
			playerPausedGame = false;
			resumeGame();
		}
	} else {
		playerPausedGame = true;
		pauseGame();
	}
}

function gameTogglePause(){
	if(playerPausedGame){return;}
	if(gamePausedGame){
		gamePausedGame = false;
		resumeGame();
	} else {
		gamePausedGame = true;
		pauseGame();
	}
}

function resumeGame(){
	$('pauseScreen').fade('hide');
	$('pauseScreen').style.display = "none";
	
	if(!gameIsPaused()){updateScreen.delay(33,this);}
	
	var timeyTheTimer = new Date();
	startTime = timeyTheTimer.getTime();
	
	if(tier >= tierMax){
		maxTierStartTime = timeyTheTimer.getTime();
	}
}

function pauseGame(){
	if(gameIsPaused()){
		$('pauseScreen').style.display = "block";
		$('pauseScreen').fade(1);

		if(!player.isDead){
			var timeyTheTimer = new Date();
			accumulatedTime += timeyTheTimer.getTime() - startTime;
			
			if(tier >= tierMax){
				maxTierAccumulatedTime += timeyTheTimer.getTime() - maxTierStartTime;
			}
		}
	}
}