// firestore
// ===================================================================
// Initialize Firebase
// Insert your own Firebase config (found at firebase console => authentication => web setup => 
// insert code between the second script tag)
var config = {
	apiKey: "AIzaSyCvpA372tjk1E7lOAks4STgllDxwPdQy1Y",
	authDomain: "whereindhs.firebaseapp.com",
	databaseURL: "https://whereindhs.firebaseio.com",
	projectId: "whereindhs",
	storageBucket: "whereindhs.appspot.com",
	messagingSenderId: "642970983978"
};
firebase.initializeApp(config);

var AUTH = firebase.auth();
var provider = new firebase.auth.GoogleAuthProvider();
// choice of accounts so the one logged in account will not be forced to be used
provider.setCustomParameters({
  prompt: 'select_account'
});
var USER;
function signin() {
	document.getElementById('signinbutton').innerHTML = 'Loading...';
	AUTH.signInWithRedirect(provider).then((result) => {
		console.log('[APP, Firebase] User Sign In Sucessful');
		console.log(result);
	}).catch((error) => {
		console.error('[App, Firebase] User Sign In Error', error);
		document.getElementById('signinbutton').innerHTML = 'Error... Sign In Again';
	})
}
function signout() {
	firebase.auth().signOut().then(function() {
	  // Sign-out successful.
	  console.log('User signed out');
	}).catch(function(error) {
	  // An error happened.
	  console.log('Error signing out:' + error);
	});
}
// observer that listens for changes of authentication state i.e. when user signs in or signs out
AUTH.onAuthStateChanged(function(user) {
	if (user) {
	USER = user;
	// User is signed in.
	var displayName = user.displayName;
	var email = user.email;
	var emailVerified = user.emailVerified;
	var photoURL = user.photoURL;
	var isAnonymous = user.isAnonymous;
	var uid = user.uid;
	var providerData = user.providerData;
	// ...
	if (document.getElementById('signinbutton')) {
		document.getElementById('signinbutton').style.display = 'none';
		document.getElementById('greeting').innerHTML = 'Hello, <br />' + displayName;
		document.getElementById('greeting').style.display = 'block';
		document.getElementById('signoutbutton').style.display = 'block';
		document.getElementById('start').style.display = 'block';
		document.getElementById('qn').style.display = 'block';
	}
	} else {
	// User is signed out.
	// ...
	if (document.getElementById('signinbutton')) {
		document.getElementById('greeting').style.display = 'none';
		document.getElementById('signoutbutton').style.display = 'none';
		document.getElementById('start').style.display = 'none';
		document.getElementById('qn').style.display = 'none';
		document.getElementById('signinbutton').style.display = 'block';
		document.getElementById('signinbutton').disabled = false;
		document.getElementById('signinbutton').innerHTML = 'Sign in with Google!';
	}
	}
	});
//firestore
var db = firebase.firestore();
function storeresults() {
	var userRef = db.collection('users').doc(USER.email);
	var d = new Date();
	var dd = d.getDate();
	var mm = d.getMonth()+1;
	var yyyy = d.getFullYear();
	var today = dd + '-' + mm + '-' + yyyy;
	var docRef = userRef.collection('games');
	docRef.add({
		day: today,
		time: d.getTime(),
		score: totalscore
	})
	.then(function() {
		console.log("Document successfully written!");
	})
	.catch(function(error) {
		console.error("Error writing document: ", error);
	});
}
function updateleaderboard() {
	var ref = db.collection('leaderboard').doc('leaderboard');
	ref.get()
	.then(function(doc) {
		if (doc.exists) {
			// object with properties position 1-5 as array [name, score]
			var leaderboard = doc.data().scores;
			// leaderboard not full
			if (leaderboard.length != 10) {
				sessionStorage.setItem('highscore', true)
				var i;
				// find position to append info
				for (i=0; i<((leaderboard.length/2)+1); i++) {
					if (totalscore >= leaderboard[(i*2)+1]) {
						break;
					}
				}
				if (i*2 == leaderboard.length) {
					leaderboard.push(USER.displayName, totalscore);
				}
				else {
					leaderboard.splice(i*2, 0, USER.displayName, totalscore);
				}
				//update leaderboard
				ref.set({
					scores: leaderboard
				})
				.then(function() {
					console.log("Document successfully written!");
				})
				.catch(function(error) {
					console.log(error);
				});
			}
			// leaderboard full
			else {
				// player score higher than or equal last player on leaderboard
				if (totalscore >= leaderboard[9]) {
					sessionStorage.setItem('highscore', true)
					leaderboard.splice(8, 2);
					var i;
					// find position
					for (i=0; i<5; i++) {
						if (totalscore >= leaderboard[(i*2)+1]) {
							break;					
						}
					}
					leaderboard.splice(i*2, 0, USER.displayName, totalscore);
					//update leaderboard
					ref.set({
						scores: leaderboard
					})
					.then(function() {
						console.log("Document successfully written!");
					})
					.catch(function(error) {
						console.log(error);
					});
				}
				else {
					sessionStorage.setItem('highscore', false);
				}
			}
		}
	}).catch(function(error) {
		console.log(error);
		});
}
function showleaderboard() {
	var ref = db.collection('leaderboard').doc('leaderboard');
	ref.get().then(function(doc) {
		var leaderboard = doc.data().scores;
		for (var i = 0; i<10; i++) {
			if (!leaderboard[i]) {
				leaderboard[i] = null;
			}
		}
		document.getElementById('1posname').innerHTML = leaderboard[0];
		document.getElementById('1posscore').innerHTML = leaderboard[1];
		document.getElementById('2posname').innerHTML = leaderboard[2];
		document.getElementById('2posscore').innerHTML = leaderboard[3];
		document.getElementById('3posname').innerHTML = leaderboard[4];
		document.getElementById('3posscore').innerHTML = leaderboard[5];
		document.getElementById('4posname').innerHTML = leaderboard[6];
		document.getElementById('4posscore').innerHTML = leaderboard[7];
		document.getElementById('5posname').innerHTML = leaderboard[8];
		document.getElementById('5posscore').innerHTML = leaderboard[9];
		document.getElementById('spin').style.display = 'none';
		document.getElementById('leaderboard').style.display = 'block';
		document.getElementById('playagain').style.display = 'block';
	})
	.catch(function(error){ 
		console.log(error);
	})
}
// ===============================================================	

// Number of questions in quiz
const MAX = 10;
var countqn = 0;
var currqn;
//button id
var buttid = ['first','second','third','fourth'];
// init correct ans
var correctans;
var totalscore=0;
var timetaken = 0;
var questions = [];

// initialize questions, store in sessionStorage when users are signing in 
//change the link in the 'if' line to the starting page of your app where user will be prompted to sign in
if (window.location.href == "https://shaunlxw.github.io/whereindhs/") {
	function getdata([qn, type]) {
		db.collection('questions').doc(qn).get()
		.then(function(doc) {
		if (doc.exists) {
			if (type == 'ans') {
				this[qn].ans = doc.data().ans;
				this[qn].correct = doc.data().ans[0];
			}
			else if (type == 'desc') {
				this[qn].desc = doc.data().desc;
			}
		if (this[qn].ans && this[qn].desc) {
			questions.push(this[qn])
			sessionStorage.setItem('questions', JSON.stringify(questions));
			console.log('Questions stored');
		}
		}	
		else {
			// doc.data() will be undefined in this case
			console.log("No such document!");		
		}
		});
	}
	// object Question(questionpicture, array of ans from firestore, answerpicture, description of place/answer)
	var q1 = new Question('pics/canteen.JPG', ['q1', 'ans'],
	'pics/canteenAns.JPG', ['q1', 'desc']);
	var q2 = new Question('pics/paradesq.JPG', ['q2', 'ans'],
	'pics/paradesqAns.JPG', ['q2', 'desc']);
	var q3 = new Question('pics/platform.JPG', ['q3', 'ans'],
	'pics/platformAns.JPG', ['q3', 'desc']);
	var q4 = new Question('pics/zxy.JPG', ['q4', 'ans'],
	'pics/zxyAns.JPG', ['q4', 'desc']);
	var q5 = new Question('pics/bell.JPG', ['q5', 'ans'],
	'pics/bellAns.JPG', ['q5', 'desc']);
	var q6 = new Question('pics/gslswing.JPG', ['q6', 'ans'],
	'pics/gslswingAns.JPG', ['q6', 'desc']);
	var q7 = new Question('pics/bamboo.JPG', ['q7', 'ans'],
	'pics/bambooAns.JPG', ['q7', 'desc']);
	var q8 = new Question('pics/canteenswing.JPG', ['q8', 'ans'],
	'pics/canteenswingAns.JPG', ['q8', 'desc']);
	var q9 = new Question('pics/zxyshelter.JPG', ['q9', 'ans'],
	'pics/zxyshelterAns.JPG', ['q9', 'desc']);
	var q10 = new Question('pics/track.JPG', ['q10', 'ans'],
	'pics/trackAns.JPG', ['q10', 'desc']);
	var q11 = new Question('pics/bball.JPG', ['q11', 'ans'],
	'pics/bballAns.JPG', ['q11', 'desc']);
	var q12 = new Question('pics/podium.JPG', ['q12', 'ans'],
	'pics/podiumAns.JPG', ['q12', 'desc']);
	var q13 = new Question('pics/hostellocker.JPG', ['q13', 'ans'],
	'pics/hostellockerAns.JPG', ['q13', 'desc']);
	var q14 = new Question('pics/scoutswing.JPG', ['q14', 'ans'],
	'pics/scoutswingAns.JPG', ['q14', 'desc']);
	var q15 = new Question('pics/pac.JPG', ['q15', 'ans'],
	'pics/pacAns.JPG', ['q15', 'desc']);
	var q16 = new Question('pics/blockg.JPG', ['q16', 'ans'],
	'pics/blockgAns.JPG', ['q16', 'desc']);
	var q17 = new Question('pics/lt.JPG', ['q17', 'ans'],
	'pics/ltAns.JPG', ['q17', 'desc']);
	var q18 = new Question('pics/mrl.JPG', ['q18', 'ans'],
	'pics/mrlAns.JPG', ['q18', 'desc']);
	var q19 = new Question('pics/cafe.JPG', ['q19', 'ans'],
	'pics/cafeAns.JPG', ['q19', 'desc']);
	var q20 = new Question('pics/heritage.JPG', ['q20', 'ans'],
	'pics/heritageAns.JPG', ['q20', 'desc']);
	var q21 = new Question('pics/ssc.JPG', ['q21', 'ans'],
	'pics/sscAns.JPG', ['q21', 'desc']);
	//obj with properties pic, ans, anspic, desc, correct
	function Question(pic, ans, anspic, desc) {
		this.pic = pic;
		getdata(ans);
		this.anspic = anspic;
		getdata(desc);
	}
}

if (window.location.href == "https://shaunlxw.github.io/whereindhs/game.html") {
	questions = JSON.parse(sessionStorage.getItem('questions'));
	window.onload = animatestart();
}

function animatestart() {
	var pickqn = Math.floor(Math.random()*questions.length);
	currqn = questions[pickqn];
	document.getElementById('picture').src = currqn.pic;
	// Animate start
	var animate = document.getElementById('animate');
	var size = 5;
	on();
	var go = setInterval(grow, 5);
	function grow() {
		if (size > 19) {
			clearInterval(go);
			start();
		} else {
			size += 0.1;
			animate.style.fontSize = size+'vw';
		}
	}
}
function start() {
	setTimeout(function() {
		document.getElementById('animate').parentNode.removeChild(animate);
		document.getElementById('answers').style.zIndex = 3;
		document.getElementById('prompt').style.display = 'block';
		document.getElementById('desc').style.display = 'block';
		document.getElementById('anspic').style.display = 'block';
		document.getElementById('overlay').onclick = randQ;
		randQ();
	}, 1000);
}
function endgame() {
	document.getElementById('answers').style.zIndex = 0;
	document.getElementById('anspic').src = '';
	document.getElementById('desc').innerHTML = 'End of game. Total score: ' + totalscore;
	document.getElementById('score').innerHTML = '';
	document.getElementById('overlay').onclick = function() {window.location.href = 'results.html'};
	on();
	storeresults();
	updateleaderboard();
}
function randQ() {
	// startqn
	for (var i=0; i < 4; i++) {
		var butt = document.getElementById(buttid[i]);
		butt.style.backgroundColor = 'white';
		butt.className = 'button';
	}
	for (var i=0; i < 4; i++) {
		document.getElementById(buttid[i]).disabled = false;
	}
	// check end game
	if (countqn == MAX) {
		endgame();
	}
	// get qn
	else {
		countqn++;
		off();
		randA(currqn.ans);
		document.getElementById('desc').innerHTML = currqn.desc;
		document.getElementById('anspic').src = currqn.anspic;
		correctans = currqn.correct;
		// remove from array so there is no repetition of qn
		questions.splice(questions.indexOf(currqn), 1);
		countdown(10);
	}
}
function randA(ans) {
	var i;
	for (i = 4; i > 0; i--) {
		number = Math.floor(Math.random()*i);
		document.getElementById(buttid[i-1]).innerHTML = ans[number];
		ans.splice(number,1);
	}
}
function endqn() {
	// disable buttons
	for (var i=0; i < 4; i++) {
		document.getElementById(buttid[i]).disabled = true;
		document.getElementById(buttid[i]).className = '';
	}
	//highlight right ans in green
	for (var i=0; i < 4; i++) {
		if (correctans.includes(document.getElementById(buttid[i]).innerHTML)){
			document.getElementById(buttid[i]).style.backgroundColor = '#00e600';
		}
	}
	// pick next qn to change qn pic to prevent delay
	if (countqn != MAX) {
		var pickqn = Math.floor(Math.random()*questions.length);
		currqn = questions[pickqn];
		document.getElementById('picture').src = currqn.pic;
	}
}

// when answer button in html clicked, function called with the button(element) passed as parameter
function checkans(ans) {
	clearInterval(count);
	endqn();
	var time = document.getElementById('timer').innerHTML;
	var score = document.getElementById('score');
	if (ans.innerHTML == correctans) {
		//handles score
		if (time > 7) {
			score.innerHTML = 'Correct Answer! +1pt <br/> Time bonus! +2pt';
			totalscore += 3;
		} 
		else if (time > 3 && time < 8) {
			score.innerHTML = 'Correct Answer! +1pt <br/> Time bonus! +1pt';
			totalscore += 2;
		}
		else {
			score.innerHTML = 'Correct Answer! +1pt';
			totalscore++;
		}
		on();
	}
	else {
		ans.style.backgroundColor = 'red';
		score.innerHTML = 'Wrong Answer! -1pt';
		totalscore--
		on();
	}
}
function countdown(time) {
	document.getElementById('timer').innerHTML = time;
	time--;
	count = setInterval(function() {
			if (time > -1) {
				document.getElementById('timer').innerHTML = time;
				time--;
			}
			else {
				clearInterval(count);
				endqn();
				document.getElementById('score').innerHTML = "Time's up! +0pt";
				on();
			}
	}, 1000, time);
}
// overlay
function on() {
  document.getElementById("overlay").style.display = "block";
}
function off() {
  document.getElementById("overlay").style.display = "none";
}

if (window.location.href == "https://shaunlxw.github.io/whereindhs/results.html") {
	showleaderboard();
	if (sessionStorage.getItem('highscore') == 'true') {
		document.getElementById('notice').innerHTML = 'Congratulations! You have gotten into the leaderboard!';
	}
	else {
		document.getElementById('notice').innerHTML = 'Sorry, you did not get into the leaderboard this time :(';
	}
}
