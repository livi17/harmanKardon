/*
* radioReceiver.js - v 1.0
*
* Copyright (c) 2014 Michael Lariviere (leaffan1984@gmail.com)
* Licensed under the MIT license 
*/

document.addEventListener("DOMContentLoaded", function(event) {

  var power = false;
  var phono = false;
  var aux = false;
	var am = false;
  var fm = true;
  var signalType = signal();
  var tapeMonitor = [false, false, true]; // tape1, tape2, source
  var functions = [false, false, false, true]; // phonp, aux, am, fm
  var autoManual = false; // false is auto, true is manual

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


  var audio  = document.getElementById('audio');
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
  var num4, num3, num2, num1; // store the numbers for each digit

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

  var fmCallNum = "88.1";
  var fmUrl = "http://indie.streamon.fm:8000/indie-48k.aac"; 
  var amCallNum = "680";
  var amUrl = "http://tor680.akacast.akamaistream.net/7/941/86884/v1/rogers.akacast.akamaistream.net/tor680";
  //var url ="http://sc3.spacialnet.com:30430";

  function digitsOff(){
    digit1.style.backgroundPosition = numbersOff;
    digit2.style.backgroundPosition = numbersOff;
    digit3.style.backgroundPosition = numbersOff;
    digit4.style.backgroundPosition = numbersOff;
    document.getElementById("decimal").className  = "decimal-off";
    document.getElementById("fm").className  = "tuner-blue-sm off";
    document.getElementById("am").className  = "tuner-blue-sm off";
    document.getElementById("MHz").className  = "tuner-blue-sm off";
    document.getElementById("kHz").className  = "tuner-blue-sm off";
  }// end of digitsOff();
  function digitsOn(){
    digit1.style.backgroundPosition = numbersOff;
    digit2.style.backgroundPosition = numbersOff;
    digit3.style.backgroundPosition = numbersOff;
    digit4.style.backgroundPosition = numbersOff;
    if(functions[3] === true){
      document.getElementById("decimal").className  = "decimal-on";
      document.getElementById("MHz").className  = "tuner-blue-sm on";
      document.getElementById("fm").className  = "tuner-blue-sm on";
    } else {
      document.getElementById("decimal").className  = "decimal-off";
      document.getElementById("am").className  = "tuner-blue-sm on";
      document.getElementById("kHz").className  = "tuner-blue-sm on";
    }
  }// end of digitsOn();

  (function init(){
    digitsOff();

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

    var randomnumber=Math.ceil(Math.random()*numOfFMStations-1);
    console.log("randomnumber: "+randomnumber);
    console.log("fmSelected.length: "+fmSelected.length);

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

  })(); // end of init();

  function radioSwitch(a){
        //console.log("typeof a: "+typeof a);
        console.log("radioSwitch(a): "+ a);
        for(i = 1; i < 9; i++){
          var shutOff = document.getElementById("preset"+i);
          shutOff.className  = "glass-button-off";
        }
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

    function presetFunctionality(e){
        console.log("e: "+e.currentTarget.id);
        var string = e.currentTarget.id;
        var num = parseInt(string.substr((string.length-1), 1));
        radioSwitch(num-1);    
    }

    for(i = 1; i < 9; i++){
      var presetEl = document.getElementById("preset"+i);
      //funcEl.addEventListener("click", functions(event)); 
      presetEl.addEventListener("click", function(event){
        presetFunctionality(event);
      }, false);   
    } //end of for loop


  function signalLightsOff(){
    console.log("no signal tuned or power off");
      document.getElementById("signalstrength1").className  = "signal-off";
      document.getElementById("signalstrength2").className  = "signal-off";
      document.getElementById("signalstrength3").className  = "signal-off";
      document.getElementById("signalstrength4").className  = "signal-off";
      document.getElementById("signalstrength5").className  = "signal-off";
      document.getElementById("tuned-light").className      = "signal-off";
      document.getElementById("stereo-light").className     = "signal-off";
  }


  function signalLightsOn(readyState){
    if(power){
      audio.oncanplay = function() {
        console.log("signal tuned");
        document.getElementById("signalstrength1").className  = "signal-yellow";
        document.getElementById("signalstrength2").className  = "signal-yellow";
        document.getElementById("signalstrength3").className  = "signal-yellow";
        document.getElementById("signalstrength4").className  = "signal-yellow";
        document.getElementById("signalstrength5").className  = "signal-yellow";
        document.getElementById("tuned-light").className      = "signal-yellow";
        if(functions[3] === true){
          document.getElementById("stereo-light").className     = "signal-red";
        } else {
          document.getElementById("stereo-light").className     = "signal-off";
        }
      };
    }
  }


  function audioPlay(url){
    audio.src = url;
    audio.load();
    audio.play();
    signalLightsOn();
  }//end of play();¸

  function audioStop(url){
    audio.pause();
    audio.src = '';
    signalLightsOff();
  }//end of play();¸

  function signal(){
  	if(fm){
  		signalType = "fm";
  	} else{
  		signalType = "am";
  	}
  	return signal;
  }
    

  function radioDisplay(callNum, signal){
    console.log("signal: "+ signal);
  	currCallNum  = callNum.split('.').join("");
  	console.log("currCallNum: "+ currCallNum);

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

    if(power){
      digit1.style.backgroundPosition = position[num1];
      digit2.style.backgroundPosition = position[num2];
      digit3.style.backgroundPosition = position[num3];
      digit4.style.backgroundPosition = position[num4];
      if(currCallNum.length==3){
        digit1.style.backgroundPosition = numbersOff;
      }

      for(i=1; i<5; i++){
        var funcButtonsOff =  document.getElementById("function-light"+i);
        funcButtonsOff.className  = "function-light-off";
      }

      for(i=1; i<3; i++){
        var tmButtonsOff =  document.getElementById("tape-light"+i);
        tmButtonsOff.className  = "tape-light-off";
      }

      document.getElementById("auto-button").className = "glass-button-off";
      document.getElementById("manual-button").className = "glass-button-off";

      if(tapeMonitor[0] === true){
        document.getElementById("tape-light1").className  = "tape-light-on";
      } else if(tapeMonitor[1] === true){
        document.getElementById("tape-light2").className  = "tape-light-on";
      }

      if(functions[0] === true && tapeMonitor[2] === true){
          document.getElementById("function-light1").className  = "function-light-on";
      } else if(functions[1] === true && tapeMonitor[2] === true){
          document.getElementById("function-light2").className  = "function-light-on";
      } else if(functions[2] === true && tapeMonitor[2] === true){
          document.getElementById("fm").className  = "tuner-blue-sm off";
          document.getElementById("MHz").className  = "tuner-blue-sm off";
          document.getElementById("decimal").className  = "decimal-off";
          document.getElementById("am").className  = "tuner-blue-sm on";
          document.getElementById("kHz").className  = "tuner-blue-sm on";
          document.getElementById("function-light3").className  = "function-light-on";
          if(autoManual === true){
            document.getElementById("manual-button").className = "glass-button-on";
          } else if(autoManual === false){
            document.getElementById("auto-button").className = "glass-button-on";
          }
      } else if(functions[3] === true && tapeMonitor[2] === true){
          document.getElementById("fm").className  = "tuner-blue-sm on";
          document.getElementById("MHz").className  = "tuner-blue-sm on";
          document.getElementById("decimal").className  = "decimal-on";
          document.getElementById("am").className  = "tuner-blue-sm off";
          document.getElementById("kHz").className  = "tuner-blue-sm off";
          document.getElementById("function-light4").className  = "function-light-on";
          if(autoManual === true){
            document.getElementById("manual-button").className = "glass-button-on";
          } else if(autoManual === false){
            document.getElementById("auto-button").className = "glass-button-on";
          }
      } else {
          document.getElementById("fm").className  = "tuner-blue-sm off";
          document.getElementById("am").className  = "tuner-blue-sm off";
          document.getElementById("MHz").className  = "tuner-blue-sm off";
          document.getElementById("kHz").className  = "tuner-blue-sm off";
          document.getElementById("auto-button").className = "glass-button-off";
          document.getElementById("manual-button").className = "glass-button-off";
      }
    } else {
      digitsOff();
      document.getElementById("decimal").className  = "decimal-off";
      document.getElementById("fm").className  = "tuner-blue-sm off";
      document.getElementById("am").className  = "tuner-blue-sm off";
      document.getElementById("MHz").className  = "tuner-blue-sm off";
      document.getElementById("kHz").className  = "tuner-blue-sm off";
      document.getElementById("auto-button").className = "glass-button-off";
      document.getElementById("manual-button").className = "glass-button-off";
    }
  } // end of Radio Display

  function functionButton(e){
    //console.log("e.currentTarget.id: "+e.currentTarget.id);
    var buttonOn = document.getElementById(e.currentTarget.id);
    for(i = 1; i < 5; i++){
      var buttonOff =  document.getElementById("func-"+i);
      buttonOff.className  = "vertical-button-off";
      functions[(i-1)] = false;
    }
    buttonOn.className  = "vertical-button-on";
    switch (buttonOn.id) {
            case "func-1":
            
            console.log("phono selected");
            functions[0] = true;
            if(power === true && tapeMonitor[2] === true){
              radioDisplay(fmCallNum, signal);
              digitsOff();
              signalLightsOff();
              audioStop();
            }
            break; 

            case "func-2":
            console.log("aux selected");
            functions[1] = true;
            if(power === true && tapeMonitor[2] === true){
              radioDisplay(fmCallNum, signal);
              digitsOff();
              signalLightsOff();
              audioStop();
            }
            break; 

            case "func-3":
            console.log("am selected");
            functions[2] = true;
            if(power === true && tapeMonitor[2] === true){
              digitsOn();
              radioDisplay(amCallNum, signal);
              audioPlay(amUrl);
              signalLightsOff();
              signalLightsOn();
            }
            break; 

            case "func-4":
            console.log("fm selected");
            functions[3] = true;
            if(power === true && tapeMonitor[2] === true){
              digitsOn();
              radioDisplay(fmCallNum, signal);
              audioPlay(fmUrl);
              signalLightsOff();
              signalLightsOn();
            }
            break; 
          }
        
  console.log("functions: "+ functions);
  }

  function tapemonitorButton(a){
    var buttonOn = document.getElementById(a.currentTarget.id);
    for(i = 1; i < 4; i++){
      var buttonOff =  document.getElementById("tm-"+i);
      buttonOff.className  = "vertical-button-off";
      tapeMonitor[(i-1)] = false;
    }
    buttonOn.className  = "vertical-button-on";

    audioStop();

    switch (buttonOn.id) {
            case "tm-1":
            console.log("Tape 1 selected");
            tapeMonitor[0] = true;
            audioStop();
            radioDisplay(fmCallNum, signal);
            digitsOff();
            signalLightsOff();
            break;

            case "tm-2":
            console.log("Tape 2 selected");
            tapeMonitor[1] = true;
            audioStop();
            radioDisplay(fmCallNum, signal);
            digitsOff();
            signalLightsOff();
            break;

            case "tm-3":
            console.log("Source selected");
            console.log("functions: "+ functions);
            tapeMonitor[2] = true;
            if(power===true && functions[0] === true){
              radioDisplay(amCallNum, signal);
              digitsOff();
            } else if(power===true && functions[1] === true){
              radioDisplay(amCallNum, signal);
              digitsOff();
            } else if(power===true && functions[2] === true){
              digitsOn();
              radioDisplay(amCallNum, signal);
              audioPlay(amUrl);
              signalLightsOff();
              signalLightsOn();
            } else if(power === true && functions[3] === true){
              console.log("power and function3");
              digitsOn();
              radioDisplay(fmCallNum, signal);
              audioPlay(fmUrl);
              signalLightsOff();
              signalLightsOn();
            }
            break; 
          }
        //console.log("functions: "+ functions);
  }



/* ---- FUNCTION BUTTONS ---*/
  for(i = 1; i < 5; i++){
    var funcEl = document.getElementById("func-"+i);
    //funcEl.addEventListener("click", functions(event)); 
    funcEl.addEventListener("click", function(event){
      functionButton(event);
    }, false);   
  } //end of for loop

/* ---- TAPE MONITOR BUTTONS ---*/
  for(i = 1; i < 4; i++){
    var tmEl = document.getElementById("tm-"+i);
    //funcEl.addEventListener("click", functions(event)); 
    tmEl.addEventListener("click", function(event){
      tapemonitorButton(event);
    }, false);   
  } //end of for loop

/* ---- TUNER BUTTONS ---*/

  var autoTuner = document.getElementById("auto-button");
  autoTuner.addEventListener("click", function(event){
      if(power === true && tapeMonitor[2] === true && functions[2] === true || power === true && tapeMonitor[2] === true && functions[3] === true){
        console.log("autoTuner");
        autoManual = false;
        console.log("autoManual: "+autoManual);
        autoTuner.className = "glass-button-on";
        manualTuner.className = "glass-button-off";
      }
  }, false);

  var manualTuner = document.getElementById("manual-button");
  manualTuner.addEventListener("click", function(event){
      if(power === true && tapeMonitor[2] === true && functions[2] === true || power === true && tapeMonitor[2] === true && functions[3] === true){
        console.log("manualTuner");
        autoManual = true;
        console.log("autoManual: "+autoManual);
        autoTuner.className = "glass-button-off";
        manualTuner.className = "glass-button-on";
      }
  }, false);


  var tunerUp = document.getElementById("up-button"); 
  tunerUp.addEventListener("click", function(event){
      console.log("tuner up");
  }, false);

  var tunerDown = document.getElementById("down-button"); 
  tunerDown.addEventListener("click", function(event){
      console.log("tuner down");
  }, false);

  function powerOnDisplay(){
    document.getElementById("glass-feature").className  = "glass-uppercase-on";
    document.getElementById("tape-monitor").className  = "glass-uppercase-on";
    document.getElementById("tape1-holder").className  = "glass-lowercase-on";
    document.getElementById("tape2-holder").className  = "glass-lowercase-on";
    document.getElementById("function-header").className  = "glass-uppercase-on";
    document.getElementById("function-header").className  = "glass-uppercase-on function-header-on";
    document.getElementById("phono-holder").className  = "glass-lowercase-on";
    document.getElementById("aux-holder").className  = "glass-lowercase-on";
    document.getElementById("am-holder").className  = "glass-lowercase-on";
    document.getElementById("fm-holder").className  = "glass-lowercase-on";
    document.getElementById("signal-header").className  = "signal-header-on";
    document.getElementById("signal-lights-holder").className  = "glass-uppercase-off";
    document.getElementById("signal-footer").className  = "signal-footer-on";
  }
  function powerOffDisplay(){
    document.getElementById("glass-feature").className  = "glass-uppercase-off";
    document.getElementById("tape-monitor").className  = "glass-uppercase-off";
    document.getElementById("tape1-holder").className  = "glass-lowercase-off";
    document.getElementById("tape2-holder").className  = "glass-lowercase-off";
    document.getElementById("function-header").className  = "glass-uppercase-off";
    document.getElementById("function-header").className  = "glass-uppercase-off function-header-off";
    document.getElementById("phono-holder").className  = "glass-lowercase-off";
    document.getElementById("aux-holder").className  = "glass-lowercase-off";
    document.getElementById("am-holder").className  = "glass-lowercase-off";
    document.getElementById("fm-holder").className  = "glass-lowercase-off";
    document.getElementById("signal-header").className  = "signal-header-off";
    document.getElementById("signal-lights-holder").className  = "glass-uppercase-off";
    document.getElementById("signal-footer").className  = "signal-footer-off";
    for(i=1; i<5; i++){
        var funcButtonsOff =  document.getElementById("function-light"+i);
        funcButtonsOff.className  = "function-light-off";
    }
    for(i=1; i<3; i++){
        var tapeButtonsOff =  document.getElementById("tape-light"+i);
        tapeButtonsOff.className  = "tape-light-off";
    }
  }


/* ---- POWER BUTTON ---*/
  document.getElementById("power-button").addEventListener("click", function(){
    power = !power;

    if(power){
      if(tapeMonitor[0] === true){
        radioDisplay(amCallNum, signal);
        digitsOff();
      } else if(tapeMonitor[1] === true){
        radioDisplay(amCallNum, signal);
        digitsOff();
      } 
      if(functions[0] === true){
        radioDisplay(amCallNum, signal);
        digitsOff();
      } else if(functions[1] === true  && tapeMonitor[2] === true){
        radioDisplay(amCallNum, signal);
        digitsOff();
      } else if(functions[2] === true && tapeMonitor[2] === true){
        radioDisplay(amCallNum, signal);
        audioPlay(amUrl);
      } else if (functions[3] === true  && tapeMonitor[2] === true){
        radioDisplay(fmCallNum, signal);
        audioPlay(fmUrl);
      }
      console.log("power: "+power);
      powerOnDisplay();
      document.getElementById("power-button").className  = "vertical-button-on";
    } else {
      powerOffDisplay();
      radioDisplay(fmCallNum, signal);
      audioStop();
      document.getElementById("power-button").className  = "vertical-button-off";
    }
  }, false);
  

  

  /*for(i = 1; i < 9; i++){
            var el = document.getElementById("preset"+i);
            el.addEventListener("click", presetFunctionality(i));     
  } //end of for loop*/


  





  console.dir(audio);
	

}); // end of DOMContentLoaded
