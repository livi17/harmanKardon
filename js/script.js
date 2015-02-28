/*
* radioReceiver.js - v 1.0
*
* Copyright (c) 2014 Michael Lariviere (leaffan1984@gmail.com)
* Licensed under the MIT license 
*/

document.addEventListener("DOMContentLoaded", function(event) {
	console.log("DOM fully loaded and parsed");

    var power = false;
    var bassTurnover = false;
    var trebleDefeat = false;
    var trebleTurnover = false;
    var speakers1 = true;
    var speakers2 = false;
    var tapeCopy = false;
    var subsonicFilter = false;
    var loudness = false;
    var audioMode = true; //true = stereo
    var muting = false;
    var tuning = true; //true = auto, false = manual
    var bassLevel = 50;
    var trebleLevel = 50;
    var balance = 50;
    var tape1 = false;
    var tape2 = false;
    var source = true;
    var phono = false;
    var aux = false;
    var am = false;
    var fm = true;
    var auto = false;
    var manual = false;
    var memory = false;
    var firstTime = true;

    var amCallNumbers = [];// all call station numbers
    var amURLs = []; // all URL's for streaming stations
    var amPresets = [false, true, false, false, false, false, false, false]; //which preset lights are on
    var amSelected = []; // the 8 selected presets... randomized on load
    
    var currAMPreset; // the current selected preset
    var currAMCallNum; // the current am call stayion number
    var currAMURL; // the current am url

    var fmCallNumbers = []; // all call station numbers
    var fmURLs = [];  // all URL's for streaming stations
    var fmPresets = [false, false, false, false, true, false, false, false]; //which preset lights are on
    var fmSelected=[]; // the 8 selected presets... randomized on load
    
    var currFMPreset; // the current selected preset
    var currFMCallNum; // the current am call stayion number
    var currFMURL; // the current am url

    var num4, num3, num2, num1; // store the numbers for each digit

    var digit1 = document.getElementById('digit1');
    var digit2 = document.getElementById('digit2');
    var digit3 = document.getElementById('digit3');
    var digit4 = document.getElementById('digit4');

    var position = [
      "-32px -59px", //0
      "-10px -59px", //1
      "-76px -32px", //2
      "-54px -32px", //3
      "-32px -32px", //4
      "-10px -32px", //5
      "-76px -4px" , //6
      "-54px -4px" , //7
      "-32px -4px" , //8
      "-10px -4px" , //9
    ]; // sprite background positions for the digits

    var numbersOff = "-76px -58px";  //off

    var stations = {
        fmStations: {
            '88.1': 'http://indie.streamon.fm:8000/indie-48k.aac',
            '88.6': 'http://listen.radionomy.com/frequence-terre',
            '92.5': 'http://sc3.spacialnet.com:30430',
            '93.1': 'http://live.leanstream.co/CHAYFM-MP3',
            '93.9': 'http://listen.radionomy.com/indie-rock-radio.m3u',
            '94.1': 'http://8653.live.streamtheworld.com/CBC_R2_IET_H_SC',
            '95.5': 'http://cal959.akacast.akamaistream.net/7/300/80900/v1/rogers.akacast.akamaistream.net/cal959',
            '95.7': 'http://cfjb.streamon.fm:8000/CFJB-48k.aac',
            '97.3': 'http://2893.live.streamtheworld.com/CHBMFMAAC_SC',
            '97.9': 'http://7659.live.streamtheworld.com:80/977_80AAC_SC',
            '98.1': 'http://tor981.akacast.akamaistream.net/7/550/80872/v1/rogers.akacast.akamaistream.net/tor981',
            '98.7': 'http://listen.radionomy.com/metal-invasion-radio',   
            '99.1': 'http://4293.live.streamtheworld.com:80/CBC_R1_TOR_H_SC',
            '99.3': 'http://live.leanstream.co/CFOXFM-MP3',
            '101.5': 'http://live.leanstream.co/CKWFFM-MP3',
            '101.9': 'http://cast.iplayradio.net:8061/',
            '102.1': 'http://live.leanstream.co/CFNYFM-MP3',
            '104.1': 'http://ice7.securenetsystems.net/KSOPFM',
            '104.5': 'http://daemondef.ic.llnwd.net/stream/daemondef_ddmp3_11',
            '106.1': 'http://ott1061.akacast.akamaistream.net/7/549/80883/v1/rogers.akacast.akamaistream.net/ott1061',
            '106.9': 'http://live.leanstream.co/CKQBFM-MP3',
            '107.1': 'http://live.leanstream.co/CILQFM-MP3',
            '107.5': 'http://mp4.somafm.com:8002',
            '108.0': 'http://8653.live.streamtheworld.com/CBC_R3_WEB_H_SC'

        },
        amStations: {
            '540': 'http://1671.live.streamtheworld.com:80/CBC_R1_REG_H_SC',
            '560': 'http://3153.live.streamtheworld.com/CFOSAMAAC_SC',
            '630': 'http://live.leanstream.co/CHEDAM-MP3',
            '680': 'http://tor680.akacast.akamaistream.net/7/941/86884/v1/rogers.akacast.akamaistream.net/tor680',
            '640': 'http://live.leanstream.co/CFMJAM-MP3',
            '820': 'http://icecastsource2.amri.ca/cham-mp3',
            '960': 'http://cal960.akacast.akamaistream.net/7/480/80901/v1/rogers.akacast.akamaistream.net/cal960',
            '1010': 'http://icecastsource2.amri.ca/cfrb-mp3',
            '1060': 'http://icecastsource2.amri.ca/ckmx-mp3',
            '1070': 'http://8283.live.streamtheworld.com/CFXWFMAAC_SC',
            '1380': 'http://ice5.securenetsystems.net/CKPC'
        }
    };

    /* ------- create arrays for all stations and call numbers ---- */
    var init = function(){
        for (var key in stations.fmStations){
            fmCallNumbers.push(key);
            fmURLs.push(stations.fmStations[key]);
        }
        for (var key in stations.amStations){
            amCallNumbers.push(key);
            amURLs.push(stations.amStations[key]);
        }

        var numOfFMStations = parseInt(fmCallNumbers.length);
        var numOfAMStations = parseInt(amCallNumbers.length);
        console.log("numOfFMStations: "+ numOfFMStations + "\nnumOfAMStations: " + numOfAMStations);
        console.log("fmCallNumbers: "+ fmCallNumbers +"\namCallNumbers: "+ amCallNumbers);
        console.log("fmURLs: "+ fmURLs +"\nfmURLs: "+ fmURLs);



/*------ pick 8 random preselected stations for am and fm on first power up ---- */
        while(fmSelected.length < 8){
             var randomnumber=Math.ceil(Math.random()*numOfFMStations-1);
            found=false;
            for(var i=0;i<fmSelected.length;i++){
                if(fmSelected[i]==randomnumber){
                    found=true;
                    break;
                }
            }
            if(!found)fmSelected[fmSelected.length]=randomnumber;
        }
        currFMURL = fmURLs[fmSelected[0]];
        console.log("currFMURL: "+ currFMURL);

        while(amSelected.length < 8){
             var randomnumber=Math.ceil(Math.random()*numOfAMStations-1);
            found=false;
            for(var i=0;i<amSelected.length;i++){
                if(amSelected[i]==randomnumber){
                    found=true;
                    break;
                }
            }
            if(!found)amSelected[amSelected.length]=randomnumber;
        }
        currAMURL = amURLs[amSelected[0]];
        console.log("currAMURL: "+ currAMURL);

        console.log("fmSelected: "+ fmSelected +"\namSelected: "+ amSelected);

            /*for (var key in stations.fmStations) {
              console.log(key);
            }
            for (var key in stations.amStations) {
              console.log(key);
          }*/

    };
 

    /*var number1 = 1;
    var number2 = 0;
    var number3 = 8;
    var number4 = 0;*/



  /*  function play(callNum, url){
        if(power){
            if(firstTime){
                radioSwitch(currentPreset-1);//call radioSwitch() to illuminate the proper button
            }
            if(fm === true){
                audio.src = currFMURL;
            } else if(am === true) {
                audio.src = currAMURL;
            }
            audio.play();
            audio.volume = 0.2;
            console.log("audio.src: "+audio.src);
        }
    }*/

    function radioSwitch(a){
        //console.log("typeof a: "+typeof a);
        console.log("radioSwitch(a): "+ a);
        switch (a) {
            case 0:
            document.getElementById("preset1").className  = "glass-button-on";
            break; 
            case 1:
            document.getElementById("preset2").className  = "glass-button-on";
            break; 
            case 2:
            document.getElementById("preset3").className  = "glass-button-on";
            break; 
            case 3:
            document.getElementById("preset4").className  = "glass-button-on";
            break; 
            case 4:
            document.getElementById("preset5").className  = "glass-button-on";
            break; 
            case 5:
            document.getElementById("preset6").className  = "glass-button-on";
            break; 
            case 6:
            document.getElementById("preset7").className  = "glass-button-on";
            break; 
            case 7:
            document.getElementById("preset8").className  = "glass-button-on";
            break; 
        }
    }
    var audio = document.getElementById("audio");


    var presets = function(){

        function presetFunctionality(e){
            console.log("e: "+e);
            var currentPreset = parseInt(e.currentTarget.id.substr(6,6)); //get the number of the preset       
            if(fm === true){
                    console.log("FM current preset station: "+fmCallNumbers[fmSelected[currentPreset-1]]);

                    var currCallNum = fmCallNumbers[fmSelected[currentPreset-1]];

                    currCallNum  = currCallNum.split('.').join("");

                    console.log("currCallNum.length: "+ currCallNum.length);
                    
                    if(currCallNum.length==4){
                        num4 = currCallNum.substr(3,1);
                        num3 = currCallNum.substr(2,1);
                        num2 = currCallNum.substr(1,1);
                        num1 = currCallNum.substr(0,1);
                    } else if(currCallNum.length==3){
                        num4 = currCallNum.substr(2,1);
                        num3 = currCallNum.substr(1,1);
                        num2 = currCallNum.substr(0,1);
                        num1 = 0;
                    }

                    console.log('num4: '+num4+ ',\n num3: ' +num3+ ',\n num2: ' + num2+ ',\n num1: ' + num1);

                    digit1.style.backgroundPosition = position[num1];
                    digit2.style.backgroundPosition = position[num2];
                    digit3.style.backgroundPosition = position[num3];
                    digit4.style.backgroundPosition = position[num4];
                    if(currCallNum.length==3){
                        digit1.style.backgroundPosition = numbersOff;
                    }
                } else if(am === true){
                    console.log("AM current preset station: "+amCallNumbers[amSelected[currentPreset-1]]);
                }

                if(am === true){
                    currAMPreset = currentPreset;
                } else if(fm === true){
                    currFMPreset = currentPreset;
                }

                for(e = 1; e < 9; e++ ){ 
                   // turn off all preset lights before turning on the one that is clicked.
                   var ele = document.getElementById("preset"+e);
                   ele.className  = "glass-button-off";
                }

               if(power){
                    radioSwitch(currentPreset-1);//call radioSwitch() to illuminate the proper button

                    if(fm === true){
                        audio.src = fmURLs[fmSelected[currentPreset-1]];
                    } else if(am === true) {
                        audio.src = amURLs[amSelected[currentPreset-1]];
                    }
                    audio.play();
                    audio.volume = 0.2;
                    console.log("audio.src: "+audio.src);
                }
        }


        for(i = 1; i < 9; i++){
            var el = document.getElementById("preset"+i);
            el.addEventListener("click", presetFunctionality(i));     
        } //end of for loop
}();

/*--- FM Button funtionality --*/
document.getElementById("fm-button").addEventListener("click", function(e){
    fm = true;
    am = false;
    if(power){
        for(l = 1; l < 9; l++ ){ 
               // turn off all preset lights before turning on the preset that was last.
               var ele = document.getElementById("preset"+l);
               ele.className  = "glass-button-off";
           }
           if(firstTime){
               radioSwitch(currFMPreset-1);
           }
           document.getElementById("fm-button").className  = "vertical-button-on";
           document.getElementById("am-button").className  = "vertical-button-off";
           document.getElementById("fm").className  = "tuner-blue-sm on";
           document.getElementById("am").className  = "tuner-blue-sm off";
           document.getElementById("MHz").className  = "tuner-blue-sm on";
           document.getElementById("kHz").className  = "tuner-blue-sm off";
           document.getElementById("decimal").className  = "decimal-on";
           document.getElementById("function-light3").className  = "function-light-off";
           document.getElementById("function-light4").className  = "function-light-on";
           //fmPreset(3,e);
           play();
        } else {
           document.getElementById("fm-button").className  = "vertical-button-on";
           document.getElementById("am-button").className  = "vertical-button-off";
        }

    }, false);

/*--- AM Button funtionality --*/
document.getElementById("am-button").addEventListener("click", function(e){
    fm = false;
    am = true;
    if(power){
        for(l = 1; l < 9; l++ ){ 
               // turn off all preset lights before turning on the one that is clicked.
               var ele = document.getElementById("preset"+l);
               ele.className  = "glass-button-off";
           }
           if(firstTime){
               radioSwitch(currAMPreset-1);
           }
           document.getElementById("fm-button").className  = "vertical-button-off";
           document.getElementById("am-button").className  = "vertical-button-on";
           document.getElementById("fm").className  = "tuner-blue-sm off";
           document.getElementById("am").className  = "tuner-blue-sm on";
           document.getElementById("MHz").className  = "tuner-blue-sm off";
           document.getElementById("kHz").className  = "tuner-blue-sm on";
           document.getElementById("decimal").className  = "decimal-off";
           document.getElementById("function-light3").className  = "function-light-on";
           document.getElementById("function-light4").className  = "function-light-off";
            //amPreset(6,e)
            play();
        } else {
           document.getElementById("fm-button").className  = "vertical-button-off";
           document.getElementById("am-button").className  = "vertical-button-on";
        }
    }, false);


/*-- initialize the digits in off position -- */
digit1.style.backgroundPosition = numbersOff;
digit2.style.backgroundPosition = numbersOff;
digit3.style.backgroundPosition = numbersOff;
digit4.style.backgroundPosition = numbersOff;

/* -- power on/off the digit display --*/
function off(){
    digit1.style.backgroundPosition = numbersOff;
    digit2.style.backgroundPosition = numbersOff;
    digit3.style.backgroundPosition = numbersOff;
    digit4.style.backgroundPosition = numbersOff;
}

function on(){
    digit1.style.backgroundPosition = position[1];
    digit2.style.backgroundPosition = position[0];
    digit3.style.backgroundPosition = position[8];
    digit4.style.backgroundPosition = position[0];
}

/* --- the play function ---*/
function play(){
    if(power){
        var currentPreset=1;
        radioSwitch(currentPreset-1);//call radioSwitch() to illuminate the proper button

        if(fm === true){
            audio.src = currFMURL;
        } else if(am === true) {
            audio.src = currAMURL;
        }
        audio.play();
        console.log("audio.src: "+audio.src);
    }
}


/*-- the power button function --*/
document.getElementById("power-button").addEventListener("click", function(){
    power = !power;
    console.log("power: "+power);
    firstTime = false;

    if(power === true){
            //power on
            document.getElementById("power-button").className = "vertical-button-on";
            if(tape1 === true){
                document.getElementById("tape-light1").className = "tape-light-on";
            } else if (tape2 === true){
                document.getElementById("tape-light2").className = "tape-light-on";
            }
            document.getElementById("glass-feature").className = "glass-uppercase-on";
            document.getElementById("tape-monitor").className  = "glass-uppercase-on";
            document.getElementById("tape1-holder").className  = "glass-uppercase-on";
            document.getElementById("tape2-holder").className  = "glass-uppercase-on";
            document.getElementById("function-header").className  = "glass-uppercase-on function-header-on";
            document.getElementById("phono-holder").className  = "glass-uppercase-on";
            document.getElementById("aux-holder").className  = "glass-uppercase-on";
            document.getElementById("am-holder").className  = "glass-uppercase-on";
            document.getElementById("fm-holder").className  = "glass-uppercase-on";

            if(phono === true){
                document.getElementById("function-light1").className  = "function-light-on";
            } else if(aux === true){    
                document.getElementById("function-light2").className  = "function-light-on";
            } else if(am === true){
                document.getElementById("function-light3").className  = "function-light-on";
            } else if(fm === true){
                document.getElementById("function-light4").className  = "function-light-on";
            }

            var radioLightsOn = function(){
                document.getElementById("signalstrength1").className  = "signal-yellow";
                document.getElementById("signalstrength2").className  = "signal-yellow";
                document.getElementById("signalstrength3").className  = "signal-yellow";
                document.getElementById("signalstrength4").className  = "signal-yellow";
                document.getElementById("signalstrength5").className  = "signal-yellow";
                document.getElementById("tuned-light").className  = "signal-yellow";
                document.getElementById("stereo-light").className  = "signal-red";
            };
            var radioLightsOff = function(){
                document.getElementById("signalstrength1").className  = "signal-off";
                document.getElementById("signalstrength2").className  = "signal-off";
                document.getElementById("signalstrength3").className  = "signal-off";
                document.getElementById("signalstrength4").className  = "signal-off";
                document.getElementById("signalstrength5").className  = "signal-off";
                document.getElementById("tuned-light").className  = "signal-off";
                document.getElementById("stereo-light").className  = "signal-off";
            };

            if(fm === true){
                on(); // digits on
                //fmPreset(3);
                radioLightsOn(); // signal strength and stero lights
                document.getElementById("fm").className  = "tuner-blue-sm on";
                document.getElementById("MHz").className  = "tuner-blue-sm on";
                document.getElementById("decimal").className  = "decimal-on";
            } else if(am === true){
                on(); // digits on
                radioLightsOn(); // signal strength and stero lights
                document.getElementById("am").className  = "tuner-blue-sm on";
                document.getElementById("kHz").className  = "tuner-blue-sm on";
            } else {
                document.getElementById("fm").className  = "tuner-blue-sm off";
                document.getElementById("am").className  = "tuner-blue-sm off";
                off(); // digits
                radioLightsOff(); // signal strength and stero lights
                document.getElementById("MHz").className  = "tuner-blue-sm off";
                document.getElementById("kHz").className  = "tuner-blue-sm off";
            }
            document.getElementById("signal-header").className  = "signal-header-on";
            document.getElementById("signal-footer").className  = "signal-footer-on";

            if(auto === true){
                document.getElementById("auto-button").className  = "glass-button-on";
            } else {
                document.getElementById("auto-button").className  = "glass-button-off";
            }

            if(manual === true){
                document.getElementById("manual-button").className  = "glass-button-on";
            } else {
                document.getElementById("manual-button").className  = "glass-button-off";
            }

            play();

        } else {
            //power off
            document.getElementById("power-button").className  = "vertical-button-off";
            document.getElementById("glass-feature").className = "glass-uppercase-off";
            document.getElementById("tape-monitor").className  = "glass-uppercase-off";
            document.getElementById("tape-light1").className   = "tape-light-off";
            document.getElementById("tape-light2").className   = "tape-light-off";
            document.getElementById("tape1-holder").className  = "glass-uppercase-off";
            document.getElementById("tape2-holder").className  = "glass-uppercase-off";
            document.getElementById("function-header").className  = "glass-uppercase-off function-header-off";
            document.getElementById("phono-holder").className  = "glass-uppercase-off";
            document.getElementById("aux-holder").className  = "glass-uppercase-off";
            document.getElementById("am-holder").className  = "glass-uppercase-off";
            document.getElementById("fm-holder").className  = "glass-uppercase-off";
            document.getElementById("function-light1").className  = "function-light-off";
            document.getElementById("function-light2").className  = "function-light-off";
            document.getElementById("function-light3").className  = "function-light-off";
            document.getElementById("function-light4").className  = "function-light-off";
            document.getElementById("fm").className  = "tuner-blue-sm off";
            document.getElementById("am").className  = "tuner-blue-sm off";
            off(); // digits
            radioLightsOff(); // signal strength and stero lights
            document.getElementById("MHz").className  = "tuner-blue-sm off";
            document.getElementById("kHz").className  = "tuner-blue-sm off";
            document.getElementById("decimal").className  = "decimal-off";
            document.getElementById("signal-header").className  = "signal-header-off";
            document.getElementById("signal-footer").className  = "signal-footer-off";
            document.getElementById("auto-button").className  = "glass-button-off";
            document.getElementById("manual-button").className  = "glass-button-off";


            for(e = 1; e < 9; e++ ){ 
                   // turn off all preset lights
                   var ele = document.getElementById("preset"+e);
                   ele.className  = "glass-button-off";
                }
            audio.pause();
        }

    }, false);











/* --- AUTO SEARCH 
   var autoSearchUp = setInterval(function(){ 
    	number4 ++; 
    	console.log("number1: "+ number1);
    	console.log("number2: "+ number2);
    	console.log("number3: "+ number3);
    	console.log("number4: "+ number4);
    	digit4.style.backgroundPosition = position[number4];
    	
    	if(number4 == 10){
    		number3++;
    		digit3.style.backgroundPosition = position[number3];
    		digit4.style.backgroundPosition = position[0];
    		number4 = 0;
    	}
    	if(number3 == 10){
    		number2++;
    		digit2.style.backgroundPosition = position[number2];
    		digit3.style.backgroundPosition = position[0];
    		number3 = 0;
    		
    	}
    	if(number2 == 10){
    		number1++;
    		digit1.style.backgroundPosition = position[number1];
    		digit2.style.backgroundPosition = position[0];
    		number2 = 0;
    		
    	}
    	if(number1 == 1 && number2 == 0 && number3 == 8 && number4 == 0){
    		console.log("startover");
    		number1 = 1;
    		number2 = 0;
    		number3 = 8;
    		number4 = 0;
    		digit1.style.backgroundPosition = position[10];
    		digit2.style.backgroundPosition = position[number2];
    		digit3.style.backgroundPosition = position[number3];
    		digit4.style.backgroundPosition = position[number4];
		clearInterval(autoSearchUp); //remove later
	}
	
	}, 100);

var number1 = 1;
var number2 = 0;
var number3 = 8;
var number4 = 0;
digit1.style.backgroundPosition = position[number1];
digit2.style.backgroundPosition = position[number2];
digit3.style.backgroundPosition = position[number3];
digit4.style.backgroundPosition = position[number4];

var autoSearchDown = setInterval(function(){
	console.log("number1: "+ number1);
	console.log("number2: "+ number2);
	console.log("number3: "+ number3);
	console.log("number4: "+ number4);
	digit4.style.backgroundPosition = position[number4];

	if(number4 == 0){
		number3--;
		number4 = 10;
		digit3.style.backgroundPosition = position[number3];
	}
	if(number3 == 0){
		if(number2 == 0){
			number2=10;
		}
		number2--;
		number3 = 10;
		digit1.style.backgroundPosition = numbersOff;
		number1=10;
		digit2.style.backgroundPosition = position[number2];
	}
	if(number1 == 10 && number2 == 8 && number3 == 7 && number4 == 5){
    		//if 87.5, its the lower end of the dial
    		console.log("startover");
    		number1 = 10;
    		number2 = 8;
    		number3 = 7;
    		number4 = 5;
    		digit1.style.backgroundPosition = position[10];
    		digit2.style.backgroundPosition = position[number2];
    		digit3.style.backgroundPosition = position[number3];
    		digit4.style.backgroundPosition = position[number4];
		clearInterval(autoSearchDown); //remove later
	}
	number4 --; 
}, 100);
*/


/*--- SCRIPT FOR DIAL --- */
	/*var el = document.getElementById('bass-knob');
	var options = {
		debug: true, 
		wheelSize: '90%', 
		knobSize: '50%',
		zIndex: '100', 
		touchMode: 'wheel',
		knobSize: '40%',
		degreeStartAt: '230',
		minDegree: 0
	};
	var dial = JogDial(el, options)
	.on("mousemove", function(event){ console.log(event.target.rotation); })
    .on("mouseup", function(event){ console.log(event.target.rotation); });*/


    var bassDial = JogDial(document.getElementById('bass-knob'), 
    {
      debug: false, 
      wheelSize: '90%', 
      zIndex: '100', 
      touchMode: 'wheel',
      knobSize: '10%',
      minDegree: -120,
      maxDegree: 120,
      degreeStartAt: 0
  });
    var trebleDial = JogDial(document.getElementById('treble-knob'), 
    {
        debug: false, 
        wheelSize: '90%', 
        zIndex: '100', 
        touchMode: 'wheel',
        knobSize: '10%',
        minDegree: -120,
        maxDegree: 120,
        degreeStartAt: 0
    });
    var balanceDial = JogDial(document.getElementById('balance-knob'), 
    {
        debug: false, 
        wheelSize: '90%', 
        zIndex: '100', 
        touchMode: 'wheel',
        knobSize: '10%',
        minDegree: -120,
        maxDegree: 120,
        degreeStartAt: 0
    });
    var volumeDial = JogDial(document.getElementById('volume-knob'), 
    {
        debug: false, 
        wheelSize: '90%', 
        zIndex: '100', 
        touchMode: 'wheel',
        knobSize: '3%',
        minDegree: -140,
        maxDegree: 140,
        degreeStartAt: 0
    });


});// end of DOMContentLoaded 