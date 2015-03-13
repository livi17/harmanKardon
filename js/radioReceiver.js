/*
 * radioReceiver.js - v 1.0
 *
 * Copyright (c) 2014 Michael LaRiviere (leaffan1984@gmail.com)
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
    var presetClicked = false;
    var memory = false;
    var context;
    var source;
    var gainNode;
    var speaker1 = true;
    var speaker2 = false;
    var tapeCopy = false;
    var subSonic = false;

    //Filters
    var bassTurnover = false;
    var bassTurnoverFilter;
    var toneDefeat = false;
    var toneDefeatFilter;
    var trebleTurnover = false;
    var trebleTurnoverFilter;
    var loudness = false;
    var loudnessTrebFilter;
    var loudnessBassFilter;

    var amCallNumbers = []; // all call station numbers
    var amURLs = []; // all URL's for streaming stations
    var amPresets = [false, true, false, false, false, false, false, false]; //which preset lights are on
    var amSelected = []; // the 8 selected presets... randomized on load

    var currAMPreset; // the current selected preset
    var currAMCallNum; // the current am call station number
    var currAMURL; // the current am url

    var fmCallNumbers = []; // all call station numbers
    var fmURLs = []; // all URL's for streaming stations
    var fmPresets = [false, false, false, false, true, false, false, false]; //which preset lights are on
    var fmSelected = []; // the 8 selected presets... randomized on load

    var currFMPreset; // the current selected preset
    var currFMCallNum; // the current fm call station number
    var currFMURL; // the current fm url

   


    var audio = document.getElementById('audio');
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
        "-76px -4px", //6
        "-54px -4px", //7
        "-32px -4px", //8
        "-10px -4px", //9
    ]; // sprite background positions for the digits

    var numbersOff = "-76px -58px"; //off
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
            '640': 'http://live.leanstream.co/CFMJAM-MP3',
            '680': 'http://tor680.akacast.akamaistream.net/7/941/86884/v1/rogers.akacast.akamaistream.net/tor680',
            '820': 'http://icecastsource2.amri.ca/cham-mp3',
            '960': 'http://cal960.akacast.akamaistream.net/7/480/80901/v1/rogers.akacast.akamaistream.net/cal960',
            '1010': 'http://icecastsource2.amri.ca/cfrb-mp3',
            '1060': 'http://icecastsource2.amri.ca/ckmx-mp3',
            '1070': 'http://8283.live.streamtheworld.com/CFXWFMAAC_SC',
            '1380': 'http://ice5.securenetsystems.net/CKPC'
        }
    };

    var fmCallNum = 881;
    var fmUrl = "http://indie.streamon.fm:8000/indie-48k.aac";
    var amCallNum = 540;
    var amUrl = "http://tor680.akacast.akamaistream.net/7/941/86884/v1/rogers.akacast.akamaistream.net/tor680";
    //var url ="http://sc3.spacialnet.com:30430";

    function digitsOff() {
            digit1.style.backgroundPosition = numbersOff;
            digit2.style.backgroundPosition = numbersOff;
            digit3.style.backgroundPosition = numbersOff;
            digit4.style.backgroundPosition = numbersOff;
            document.getElementById("decimal").className = "decimal-off";
            document.getElementById("fm").className = "tuner-blue-sm off";
            document.getElementById("am").className = "tuner-blue-sm off";
            document.getElementById("MHz").className = "tuner-blue-sm off";
            document.getElementById("kHz").className = "tuner-blue-sm off";
        } // end of digitsOff();
    function digitsOn() {
            digit1.style.backgroundPosition = numbersOff;
            digit2.style.backgroundPosition = numbersOff;
            digit3.style.backgroundPosition = numbersOff;
            digit4.style.backgroundPosition = numbersOff;
            if (functions[3] === true) {
                document.getElementById("decimal").className = "decimal-on";
                document.getElementById("MHz").className = "tuner-blue-sm on";
                document.getElementById("fm").className = "tuner-blue-sm on";
            } else {
                document.getElementById("decimal").className = "decimal-off";
                document.getElementById("am").className = "tuner-blue-sm on";
                document.getElementById("kHz").className = "tuner-blue-sm on";
            }
        } // end of digitsOn();

    (function init() {

        digitsOff();

        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
        source = context.createMediaElementSource(document.getElementById('audio'));
        gainNode = context.createGain();

        //gainNode.connect(context.destination);
        bassTurnoverFilter = context.createBiquadFilter();
        trebleTurnoverFilter = context.createBiquadFilter();
        loudnessTrebFilter = context.createBiquadFilter();
        loudnessBassFilter = context.createBiquadFilter();

        document.getElementById("status").innerHTML += "audio API works!<br>";

        //push the FM stations into an array, and make a number
        (function pushFM() {
            for (var key in stations.fmStations) {
                var temp = key;
                var temp1;
                var temp2;
                if (key.length == 4) {
                    temp1 = temp.substr(0, 2);
                    temp2 = temp.substr(3, 1);
                    temp = temp1.concat(temp2);
                } else if (key.length == 5) {
                    temp1 = temp.substr(0, 3);
                    temp2 = temp.substr(4, 1);
                    temp = temp1.concat(temp2);

                }
                fmCallNumbers.push(parseInt(temp, 10));
                fmURLs.push(stations.fmStations[key]);
            }
        }());
        //console.log("fmCallnumbers: " + fmCallNumbers);

        document.getElementById("speaker1").className = "square-button-down";

        //push the inital start FM station to the first station in the array
        fmCallNum = fmCallNumbers[0];
        currFMCallNum = fmCallNum;

        ////console.log("typeof fmCallNumbers[2]: "+ typeof fmCallNumbers[2]);
        ////console.log("fmCallNum "+ fmCallNum);
        ////console.log("fmCallNum "+ typeof fmCallNum);

        //push the AM stations into an array, and make a number
        (function pushAM() {
            for (var key in stations.amStations) {
                amCallNumbers.push(parseInt(key, 10));
                amURLs.push(stations.amStations[key]);
            }
        }());
        //console.log("amCallnumbers: " + amCallNumbers);

        //push the inital start AM station to the first station in the array
        amCallNum = amCallNumbers[0];
        currAMCallNum = amCallNum;

        ////console.log("typeof amCallNumbers[2]: "+ typeof amCallNumbers[2]);
        ////console.log("amCallNum "+ amCallNum);
        ////console.log("amCallNum "+ typeof amCallNum);

        var numOfFMStations = parseInt(fmCallNumbers.length, 10);
        var numOfAMStations = parseInt(amCallNumbers.length, 10);
        ////console.log("numOfFMStations: " + numOfFMStations + "\nnumOfAMStations: " + numOfAMStations);
        ////console.log("fmCallNumbers: " + fmCallNumbers + "\namCallNumbers: " + amCallNumbers);
        ////console.log("fmURLs: " + fmURLs + "\nfmURLs: " + fmURLs);

        var randomnumber = Math.ceil(Math.random() * numOfFMStations - 1);
        ////console.log("randomnumber: " + randomnumber);
        ////console.log("fmSelected.length: " + fmSelected.length);

        /*------ pick 8 random preselected stations for am and fm on first power up ---- */

        while (fmSelected.length < 8) {
            var randomnumber1 = Math.ceil(Math.random() * numOfFMStations - 1);
            found = false;
            for (var i = 0; i < fmSelected.length; i++) {
                if (fmSelected[i] == randomnumber1) {
                    found = true;
                    break;
                }
            }
            if (!found) fmSelected[fmSelected.length] = randomnumber1;
        }
        currFMURL = fmURLs[fmSelected[0]];
        ////console.log("currFMURL: " + currFMURL);

        while (amSelected.length < 8) {
            var randomnumber2 = Math.ceil(Math.random() * numOfAMStations - 1);
            found = false;
            for (var x = 0; x < amSelected.length; x++) {
                if (amSelected[x] == randomnumber2) {
                    found = true;
                    break;
                }
            }
            if (!found) amSelected[amSelected.length] = randomnumber2;
        }
        currAMURL = amURLs[amSelected[0]];
        ////console.log("currAMURL: " + currAMURL);

        ////console.log("fmSelected: " + fmSelected + "\namSelected: " + amSelected);

    })(); // end of init();

    function allPresetLightsOff() {
        for (i = 1; i < 9; i++) {
            var shutOff = document.getElementById("preset" + i);
            shutOff.className = "glass-button-off";
        }
    }

    function radioPresetSwitch(a) {
    //console.log("typeof a: "+ a);

    if(memory){
        //console.log("memory is on");
        if(am){
            ////console.log("amSelected: " + amSelected);
            ////console.log("currAMCallNum:  " + currAMCallNum);
            var AMTemp = amCallNumbers.indexOf(currAMCallNum);
            amSelected[a] = AMTemp;

        } else if(fm){
            ////console.log("fmSelected: " + fmSelected);
            ////console.log("currFMCallNum:  " + currFMCallNum);
            ////console.log("fmCallNum:  " + fmCallNum);
            var FMTemp = fmCallNumbers.indexOf(currFMCallNum);
            ////console.log("FMTemp:  " + FMTemp);
            fmSelected[a] = FMTemp;
            ////console.log("fmSelected: " + fmSelected);
        }
    } else {
            allPresetLightsOff();
            var n = parseInt(n, 10);
            if (power === true && tapeMonitor[2] === true) {
                digitsOn();
                signalLightsOff();
                signalLightsOn();
            }

            function presetPlay() {
                    ////console.log("fm: " + fm + " am: " + am);
                    if (functions[2] === true) {
                        currAMPreset = parseInt(a, 10);
                        ////console.log("currAMPreset: " + currAMPreset);
                        audioPlay(amURLs[amSelected[a]]);
                        currAMCallNum = amCallNumbers[amSelected[a]];
                        currAMURL = amURLs[amSelected[a]];
                        radioDisplay(currAMCallNum, signal);
                    } else if (functions[3] === true) {
                        currFMPreset = parseInt(a, 10);
                        ////console.log("currFMPreset: " + currFMPreset);
                        audioPlay(fmURLs[fmSelected[a]]);
                        currFMCallNum = fmCallNumbers[fmSelected[a]];
                        currFMURL = fmURLs[fmSelected[a]];
                        radioDisplay(currFMCallNum, signal);
                    }
                }
                ////console.log("radioSwitch(a): " + a);
            switch (a) {
                case 0:
                    document.getElementById("preset1").className = "glass-button-on";
                    presetPlay();
                    break;
                case 1:
                    document.getElementById("preset2").className = "glass-button-on";
                    presetPlay();
                    break;
                case 2:
                    document.getElementById("preset3").className = "glass-button-on";
                    presetPlay();
                    break;
                case 3:
                    document.getElementById("preset4").className = "glass-button-on";
                    presetPlay();
                    break;
                case 4:
                    document.getElementById("preset5").className = "glass-button-on";
                    presetPlay();
                    break;
                case 5:
                    document.getElementById("preset6").className = "glass-button-on";
                    presetPlay();
                    break;
                case 6:
                    document.getElementById("preset7").className = "glass-button-on";
                    presetPlay();
                    break;
                case 7:
                    document.getElementById("preset8").className = "glass-button-on";
                    presetPlay();
                    break;
            }
        }
    }

    function presetFunctionality(e) {
        ////console.log("e: " + e.currentTarget.id);
        var string = e.currentTarget.id;
        var num = parseInt(string.substr((string.length - 1), 1), 10);
        radioPresetSwitch(num - 1);
    }

    for (i = 1; i < 9; i++) {
        var presetEl = document.getElementById("preset" + i);
        //funcEl.addEventListener("click", functions(event)); 
        presetEl.addEventListener("click", function(event) {
            presetFunctionality(event);
        }, false);
    } //end of for loop


    function signalLightsOff() {
        ////console.log("no signal tuned or power off");
        document.getElementById("signalstrength1").className = "signal-off";
        document.getElementById("signalstrength2").className = "signal-off";
        document.getElementById("signalstrength3").className = "signal-off";
        document.getElementById("signalstrength4").className = "signal-off";
        document.getElementById("signalstrength5").className = "signal-off";
        document.getElementById("tuned-light").className = "signal-off";
        document.getElementById("stereo-light").className = "signal-off";
    }


    function signalLightsOn(readyState) {
        if (power) {
            audio.oncanplay = function() {
                ////console.log("signal tuned");
                document.getElementById("signalstrength1").className = "signal-yellow";
                document.getElementById("signalstrength2").className = "signal-yellow";
                document.getElementById("signalstrength3").className = "signal-yellow";
                document.getElementById("signalstrength4").className = "signal-yellow";
                document.getElementById("signalstrength5").className = "signal-yellow";
                document.getElementById("tuned-light").className = "signal-yellow";
                if (functions[3] === true) {
                    document.getElementById("stereo-light").className = "signal-red";
                } else {
                    document.getElementById("stereo-light").className = "signal-off";
                }
            };
        }
    }



    function audioPlay(url) {
            audio.src = url;
            audio.load();
            audio.play();
            signalLightsOn();
            source.connect(context.destination);
        } //end of play();¸

    function audioStop(url) {
            audio.pause();
            audio.src = '';
            signalLightsOff();
        } //end of play();¸

    function signal() {
        if (fm) {
            signalType = "fm";
        } else {
            signalType = "am";
        }
        return signal;
    }


    function radioDisplay(callNum, signal) {

            currCallNum = String(callNum);

            if (currCallNum.length == 4) {
                num4 = currCallNum.substr(3, 1);
                num3 = currCallNum.substr(2, 1);
                num2 = currCallNum.substr(1, 1);
                num1 = currCallNum.substr(0, 1);
            } else if (currCallNum.length == 3) {
                num4 = currCallNum.substr(2, 1);
                num3 = currCallNum.substr(1, 1);
                num2 = currCallNum.substr(0, 1);
                num1 = 0;
            }

            ////console.log('num4: ' + num4 + ',\n num3: ' + num3 + ',\n num2: ' + num2 + ',\n num1: ' + num1);

            if (power) {
                digit1.style.backgroundPosition = position[num1];
                digit2.style.backgroundPosition = position[num2];
                digit3.style.backgroundPosition = position[num3];
                digit4.style.backgroundPosition = position[num4];
                if (currCallNum.length == 3) {
                    digit1.style.backgroundPosition = numbersOff;
                }

                for (i = 1; i < 5; i++) {
                    var funcButtonsOff = document.getElementById("function-light" + i);
                    funcButtonsOff.className = "function-light-off";
                }

                for (i = 1; i < 3; i++) {
                    var tmButtonsOff = document.getElementById("tape-light" + i);
                    tmButtonsOff.className = "tape-light-off";
                }

                document.getElementById("auto-button").className = "glass-button-off";
                document.getElementById("manual-button").className = "glass-button-off";

                if (tapeMonitor[0] === true) {
                    document.getElementById("tape-light1").className = "tape-light-on";
                } else if (tapeMonitor[1] === true) {
                    document.getElementById("tape-light2").className = "tape-light-on";
                }

                if (functions[0] === true && tapeMonitor[2] === true) {
                    document.getElementById("function-light1").className = "function-light-on";
                } else if (functions[1] === true && tapeMonitor[2] === true) {
                    document.getElementById("function-light2").className = "function-light-on";
                } else if (functions[2] === true && tapeMonitor[2] === true) {
                    document.getElementById("fm").className = "tuner-blue-sm off";
                    document.getElementById("MHz").className = "tuner-blue-sm off";
                    document.getElementById("decimal").className = "decimal-off";
                    document.getElementById("am").className = "tuner-blue-sm on";
                    document.getElementById("kHz").className = "tuner-blue-sm on";
                    document.getElementById("function-light3").className = "function-light-on";
                    if (autoManual === true) {
                        document.getElementById("manual-button").className = "glass-button-on";
                    } else if (autoManual === false) {
                        document.getElementById("auto-button").className = "glass-button-on";
                    }
                } else if (functions[3] === true && tapeMonitor[2] === true) {
                    document.getElementById("fm").className = "tuner-blue-sm on";
                    document.getElementById("MHz").className = "tuner-blue-sm on";
                    document.getElementById("decimal").className = "decimal-on";
                    document.getElementById("am").className = "tuner-blue-sm off";
                    document.getElementById("kHz").className = "tuner-blue-sm off";
                    document.getElementById("function-light4").className = "function-light-on";
                    if (autoManual === true) {
                        document.getElementById("manual-button").className = "glass-button-on";
                    } else if (autoManual === false) {
                        document.getElementById("auto-button").className = "glass-button-on";
                    }
                } else {
                    document.getElementById("fm").className = "tuner-blue-sm off";
                    document.getElementById("am").className = "tuner-blue-sm off";
                    document.getElementById("MHz").className = "tuner-blue-sm off";
                    document.getElementById("kHz").className = "tuner-blue-sm off";
                    document.getElementById("auto-button").className = "glass-button-off";
                    document.getElementById("manual-button").className = "glass-button-off";
                }
            } else {
                digitsOff();
                document.getElementById("decimal").className = "decimal-off";
                document.getElementById("fm").className = "tuner-blue-sm off";
                document.getElementById("am").className = "tuner-blue-sm off";
                document.getElementById("MHz").className = "tuner-blue-sm off";
                document.getElementById("kHz").className = "tuner-blue-sm off";
                document.getElementById("auto-button").className = "glass-button-off";
                document.getElementById("manual-button").className = "glass-button-off";
            }
        } // end of Radio Display

    function functionButton(e) {
        //////console.log("e.currentTarget.id: "+e.currentTarget.id);
        var buttonOn = document.getElementById(e.currentTarget.id);
        for (i = 1; i < 5; i++) {
            var buttonOff = document.getElementById("func-" + i);
            buttonOff.className = "vertical-button-off";
            functions[(i - 1)] = false;
        }
        buttonOn.className = "vertical-button-on";
        switch (buttonOn.id) {
            case "func-1":

                ////console.log("phono selected");
                functions[0] = true;
                if (power === true && tapeMonitor[2] === true) {
                    radioDisplay(fmCallNum, signal);
                    digitsOff();
                    signalLightsOff();
                    audioStop();
                    allPresetLightsOff();
                }
                break;

            case "func-2":
                ////console.log("aux selected");
                functions[1] = true;
                if (power === true && tapeMonitor[2] === true) {
                    radioDisplay(fmCallNum, signal);
                    digitsOff();
                    signalLightsOff();
                    audioStop();
                    allPresetLightsOff();
                }
                break;

            case "func-3":
                ////console.log("am selected");
                functions[2] = true;
                am = true;
                fm = false;
                if (power === true && tapeMonitor[2] === true) {
                    digitsOn();
                    if (currAMCallNum !== undefined) {
                        radioDisplay(currAMCallNum, signal);
                        audioPlay(currAMURL);
                        allPresetLightsOff();
                        radioPresetSwitch(currAMPreset);
                    } else {
                        radioDisplay(amCallNumbers[0], signal);
                        audioPlay(amURLs[0]);
                        allPresetLightsOff();
                    }
                    signalLightsOff();
                    signalLightsOn();

                }
                break;

            case "func-4":
                ////console.log("fm selected");
                functions[3] = true;
                am = false;
                fm = true;
                if (power === true && tapeMonitor[2] === true) {
                    digitsOn();
                    if (currFMCallNum !== undefined) {
                        radioDisplay(fmCallNum, signal);
                        audioPlay(fmUrl);
                        allPresetLightsOff();
                        radioPresetSwitch(currFMPreset);
                    } else {
                        radioDisplay(fmCallNumbers[0], signal);
                        audioPlay(fmURLs[0]);
                        allPresetLightsOff();
                    }
                    signalLightsOff();
                    signalLightsOn();

                }
                break;
        }

        ////console.log("functions: " + functions);
    }

    function tapemonitorButton(a) {
        var buttonOn = document.getElementById(a.currentTarget.id);
        for (i = 1; i < 4; i++) {
            var buttonOff = document.getElementById("tm-" + i);
            buttonOff.className = "vertical-button-off";
            tapeMonitor[(i - 1)] = false;
        }
        buttonOn.className = "vertical-button-on";

        audioStop();

        switch (buttonOn.id) {
            case "tm-1":
                ////console.log("Tape 1 selected");
                tapeMonitor[0] = true;
                audioStop();
                radioDisplay(fmCallNum, signal);
                digitsOff();
                signalLightsOff();
                allPresetLightsOff();
                break;

            case "tm-2":
                ////console.log("Tape 2 selected");
                tapeMonitor[1] = true;
                audioStop();
                radioDisplay(fmCallNum, signal);
                digitsOff();
                signalLightsOff();
                allPresetLightsOff();
                break;

            case "tm-3":
                ////console.log("Source selected");
                ////console.log("functions: " + functions);
                tapeMonitor[2] = true;
                if (power === true && functions[0] === true) {
                    radioDisplay(amCallNum, signal);
                    digitsOff();
                } else if (power === true && functions[1] === true) {
                    radioDisplay(amCallNum, signal);
                    digitsOff();
                } else if (power === true && functions[2] === true) {
                    digitsOn();
                    if (currAMCallNum !== undefined) {
                        radioDisplay(currAMCallNum, signal);
                        audioPlay(currAMURL);
                        allPresetLightsOff();
                        radioPresetSwitch(currAMPreset);
                    } else {
                        radioDisplay(amCallNumbers[0], signal);
                        audioPlay(amURLs[0]);
                        allPresetLightsOff();
                    }
                    signalLightsOff();
                    signalLightsOn();
                } else if (power === true && functions[3] === true) {
                    ////console.log("power and function3");
                    digitsOn();
                    if (currFMCallNum !== undefined) {
                        radioDisplay(fmCallNum, signal);
                        audioPlay(fmUrl);
                        allPresetLightsOff();
                        radioPresetSwitch(currFMPreset);
                    } else {
                        radioDisplay(fmCallNumbers[0], signal);
                        audioPlay(fmURLs[0]);
                        allPresetLightsOff();
                    }
                    signalLightsOff();
                    signalLightsOn();
                }
                break;
        }
        //////console.log("functions: "+ functions);
    }



    /* ---- FUNCTION BUTTONS ---*/
    for (i = 1; i < 5; i++) {
        var funcEl = document.getElementById("func-" + i);
        //funcEl.addEventListener("click", functions(event)); 
        funcEl.addEventListener("click", function(event) {
            functionButton(event);
        }, false);
    } //end of for loop

    /* ---- TAPE MONITOR BUTTONS ---*/
    for (i = 1; i < 4; i++) {
        var tmEl = document.getElementById("tm-" + i);
        //funcEl.addEventListener("click", functions(event)); 
        tmEl.addEventListener("click", function(event) {
            tapemonitorButton(event);
        }, false);
    } //end of for loop

    /* ---- AUTO AND MANUAL TUNER BUTTONS ---*/

    var autoTuner = document.getElementById("auto-button");
    autoTuner.addEventListener("click", function(event) {
        if (power === true && tapeMonitor[2] === true && functions[2] === true || power === true && tapeMonitor[2] === true && functions[3] === true) {
            ////console.log("autoTuner");
            autoManual = false;
            ////console.log("autoManual: " + autoManual);
            autoTuner.className = "glass-button-on";
            manualTuner.className = "glass-button-off";
        }
    }, false);

    var manualTuner = document.getElementById("manual-button");
    manualTuner.addEventListener("click", function(event) {
        if (power === true && tapeMonitor[2] === true && functions[2] === true || power === true && tapeMonitor[2] === true && functions[3] === true) {
            ////console.log("manualTuner");
            autoManual = true;
            ////console.log("autoManual: " + autoManual);
            autoTuner.className = "glass-button-off";
            manualTuner.className = "glass-button-on";
        }
    }, false);


    function autoUp() {
        audioStop();
        if (functions[2] === true) {
            //console.log("AUTO: its in AM mode");
            if (currAMCallNum !== undefined) {
                //console.log("AUTO: an AM preset HAS been selected");

                //console.log("currAMCallNum: " + typeof currAMCallNum);
                var autoSearchUp = setInterval(function() {
                    currAMCallNum += 10;
                    if (currAMCallNum < 1601) {
                        for (i = 0; i < amCallNumbers.length - 1; i++) {
                            ////console.log("typeof amCallNum: "+ typeof amCallNum);
                            ////console.log("amCallNum: "+ amCallNum);
                            ////console.log("amCallNum.length: "+ amCallNum.length);
                            var stupid = String(currAMCallNum);
                            if (stupid > 999) {
                                ////console.log("more than 999");
                                num4 = stupid.substr(3, 1);
                                num3 = stupid.substr(2, 1);
                                num2 = stupid.substr(1, 1);
                                num1 = stupid.substr(0, 1);
                            } else if (stupid < 1000) {
                                ////console.log("< than 1000");
                                num4 = stupid.substr(2, 1);
                                num3 = stupid.substr(1, 1);
                                num2 = stupid.substr(0, 1);
                                num1 = 0;
                            }
                            digit2.style.backgroundPosition = position[num2];
                            digit3.style.backgroundPosition = position[num3];
                            digit4.style.backgroundPosition = position[num4];
                            if (stupid < 1000) {
                                digit1.style.backgroundPosition = numbersOff;
                            } else {
                                digit1.style.backgroundPosition = position[num1];
                            }
                            ////console.log("amCallNumC: "+ amCallNum + " amCallNumbers[i]: "+ amCallNumbers[i]);
                            if (currAMCallNum == amCallNumbers[i]) {
                                //console.log("there is a match!!!");
                                clearInterval(autoSearchUp);
                                audioPlay(stations.amStations[currAMCallNum]);
                                break;
                            }
                        }
                    } else {
                        clearInterval(autoSearchUp);
                    }
                }, 100);
            } else {
                ////console.log("AUTO: an AM preset HAS NOT been selected");
                var amAutoSearchWOPUp = setInterval(function() {
                    amCallNum += 10;
                    if (amCallNum < 1601) {
                        for (i = 0; i < amCallNumbers.length - 1; i++) {
                            ////console.log("typeof amCallNum: "+ typeof amCallNum);
                            ////console.log("amCallNum: "+ amCallNum);
                            ////console.log("amCallNum.length: "+ amCallNum.length);
                            var stupid = String(amCallNum);
                            if (stupid > 999) {
                                ////console.log("more than 999");
                                num4 = stupid.substr(3, 1);
                                num3 = stupid.substr(2, 1);
                                num2 = stupid.substr(1, 1);
                                num1 = stupid.substr(0, 1);
                            } else if (stupid < 1000) {
                                ////console.log("< than 1000");
                                num4 = stupid.substr(2, 1);
                                num3 = stupid.substr(1, 1);
                                num2 = stupid.substr(0, 1);
                                num1 = 0;
                            }
                            digit2.style.backgroundPosition = position[num2];
                            digit3.style.backgroundPosition = position[num3];
                            digit4.style.backgroundPosition = position[num4];
                            if (stupid < 1000) {
                                digit1.style.backgroundPosition = numbersOff;
                            } else {
                                digit1.style.backgroundPosition = position[num1];
                            }
                            ////console.log("amCallNumC: "+ amCallNum + " amCallNumbers[i]: "+ amCallNumbers[i]);
                            if (amCallNum == amCallNumbers[i]) {
                                ////console.log("there is a match!!!");
                                clearInterval(amAutoSearchWOPUp);
                                audioPlay(stations.amStations[amCallNum]);
                                break;
                            }
                        }
                    } else {
                        clearInterval(amAutoSearchWOPUp);
                    }
                }, 100);
            } //end of if
        } else {
            //console.log("AUTO: its in FM mode");
            if (currFMCallNum !== undefined) {
                //console.log("AUTO: an FM preset HAS been selected");
                ////console.log("currFMCallNum: " + currFMCallNum);
                //console.log("fmCallNum: " + fmCallNum);
                //console.log("currFMCallNum: " + currFMCallNum);
                //a preset HAS NOT been selected, start at the first call number
                var tempFMCallNum;
                var fmAutoSearchUp = setInterval(function() {
                    currFMCallNum += 1;

                    if (currFMCallNum < 1081) {
                        for (i = 0; i < fmCallNumbers.length - 1; i++) {
                            ////console.log("typeof amCallNum: "+ typeof amCallNum);
                            //console.log("currFMCallNum: " + currFMCallNum);
                            ////console.log("amCallNum.length: "+ amCallNum.length);
                            var stupid = String(currFMCallNum);
                            if (stupid > 999) {
                                ////console.log("more than 999");
                                num4 = stupid.substr(3, 1);
                                num3 = stupid.substr(2, 1);
                                num2 = stupid.substr(1, 1);
                                num1 = stupid.substr(0, 1);
                            } else if (stupid < 1000) {
                                ////console.log("< than 1000");
                                num4 = stupid.substr(2, 1);
                                num3 = stupid.substr(1, 1);
                                num2 = stupid.substr(0, 1);
                                num1 = 0;
                            }
                            digit2.style.backgroundPosition = position[num2];
                            digit3.style.backgroundPosition = position[num3];
                            digit4.style.backgroundPosition = position[num4];
                            if (stupid < 1000) {
                                digit1.style.backgroundPosition = numbersOff;
                            } else {
                                digit1.style.backgroundPosition = position[num1];
                            }
                            ////console.log("amCallNumC: "+ amCallNum + " amCallNumbers[i]: "+ amCallNumbers[i]);
                            if (currFMCallNum == fmCallNumbers[i]) {
                                //console.log("there is a match!!!" + currFMCallNum + " + " + fmCallNumbers[i]);
                                tempFMCallNum = (currFMCallNum * 0.1).toFixed(1);
                                //console.log("there is a match!!!" + tempFMCallNum + " + " + fmCallNumbers[i]);
                                clearInterval(fmAutoSearchUp);
                                audioPlay(stations.fmStations[tempFMCallNum]);
                                break;
                            }
                        }
                    } else {
                        clearInterval(fmAutoSearchUp);
                    }
                }, 100);
            } else {
                //console.log("AUTO: an FM preset HAS NOT been selected");
                //console.log("fmCallNum: " + fmCallNum);
                //a preset HAS NOT been selected, start at the first call number
                var fmAutoSearchWOPUp = setInterval(function() {
                    fmCallNum += 1;
                    var tempFMCallNum;
                    if (fmCallNum < 1081) {
                        for (i = 0; i < fmCallNumbers.length - 1; i++) {
                            ////console.log("typeof amCallNum: "+ typeof amCallNum);
                            ////console.log("amCallNum: "+ amCallNum);
                            ////console.log("amCallNum.length: "+ amCallNum.length);
                            var stupid = String(fmCallNum);
                            if (fmCallNum > 999) {
                                ////console.log("more than 999");
                                num4 = stupid.substr(3, 1);
                                num3 = stupid.substr(2, 1);
                                num2 = stupid.substr(1, 1);
                                num1 = stupid.substr(0, 1);
                            } else if (fmCallNum < 1000) {
                                ////console.log("< than 1000");
                                num4 = stupid.substr(2, 1);
                                num3 = stupid.substr(1, 1);
                                num2 = stupid.substr(0, 1);
                                num1 = 0;
                            }
                            digit2.style.backgroundPosition = position[num2];
                            digit3.style.backgroundPosition = position[num3];
                            digit4.style.backgroundPosition = position[num4];
                            if (fmCallNum < 1000) {
                                digit1.style.backgroundPosition = numbersOff;
                            } else {
                                digit1.style.backgroundPosition = position[num1];
                            }
                            ////console.log("amCallNumC: "+ amCallNum + " amCallNumbers[i]: "+ amCallNumbers[i]);
                            if (fmCallNum == fmCallNumbers[i]) {
                                //console.log("there is a match!!!" + fmCallNum + " + " + fmCallNumbers[i]);
                                tempFMCallNum = (fmCallNum * 0.1).toFixed(1);
                                //console.log("there is a match!!!" + tempFMCallNum + " + " + fmCallNumbers[i]);
                                clearInterval(fmAutoSearchWOPUp);
                                audioPlay(stations.fmStations[tempFMCallNum]);
                                break;
                            }
                        }
                    } else {
                        clearInterval(fmAutoSearchWOPUp);
                    }
                }, 100);
            }
        }
    }

    function autoDown() {
            audioStop();
            if (functions[2] === true) {
                ////console.log("AUTO: its in AM mode");
                if (currAMCallNum !== undefined) {
                    ////console.log("AUTO: an AM preset HAS been selected");
                    //console.log("currAMCallNum: " + typeof currAMCallNum);
                    var autoSearchDown = setInterval(function() {
                        currAMCallNum -= 10;
                        if (currAMCallNum > 539) {
                            for (i = 0; i < amCallNumbers.length - 1; i++) {
                                ////console.log("typeof amCallNum: "+ typeof amCallNum);
                                ////console.log("amCallNum: "+ amCallNum);
                                ////console.log("amCallNum.length: "+ amCallNum.length);
                                var stupid = String(currAMCallNum);
                                if (stupid > 999) {
                                    ////console.log("more than 999");
                                    num4 = stupid.substr(3, 1);
                                    num3 = stupid.substr(2, 1);
                                    num2 = stupid.substr(1, 1);
                                    num1 = stupid.substr(0, 1);
                                } else if (stupid < 1000) {
                                    ////console.log("< than 1000");
                                    num4 = stupid.substr(2, 1);
                                    num3 = stupid.substr(1, 1);
                                    num2 = stupid.substr(0, 1);
                                    num1 = 0;
                                }
                                digit2.style.backgroundPosition = position[num2];
                                digit3.style.backgroundPosition = position[num3];
                                digit4.style.backgroundPosition = position[num4];
                                if (stupid < 1000) {
                                    digit1.style.backgroundPosition = numbersOff;
                                } else {
                                    digit1.style.backgroundPosition = position[num1];
                                }
                                ////console.log("amCallNumC: "+ amCallNum + " amCallNumbers[i]: "+ amCallNumbers[i]);
                                if (currAMCallNum == amCallNumbers[i]) {
                                    //console.log("there is a match!!!");
                                    clearInterval(autoSearchDown);
                                    audioPlay(stations.amStations[currAMCallNum]);
                                    break;
                                }
                            }
                        } else {
                            clearInterval(autoSearchDown);
                        }
                    }, 100);
                } else {
                    ////console.log("AUTO: an AM preset HAS NOT been selected");
                    var autoSearchUp = setInterval(function() {
                        amCallNum -= 10;
                        if (amCallNum > 539) {
                            for (i = 0; i < amCallNumbers.length - 1; i++) {
                                ////console.log("typeof amCallNum: "+ typeof amCallNum);
                                ////console.log("amCallNum: "+ amCallNum);
                                ////console.log("amCallNum.length: "+ amCallNum.length);
                                var stupid = String(amCallNum);
                                if (stupid > 999) {
                                    ////console.log("more than 999");
                                    num4 = stupid.substr(3, 1);
                                    num3 = stupid.substr(2, 1);
                                    num2 = stupid.substr(1, 1);
                                    num1 = stupid.substr(0, 1);
                                } else if (stupid < 1000) {
                                    ////console.log("< than 1000");
                                    num4 = stupid.substr(2, 1);
                                    num3 = stupid.substr(1, 1);
                                    num2 = stupid.substr(0, 1);
                                    num1 = 0;
                                }
                                digit2.style.backgroundPosition = position[num2];
                                digit3.style.backgroundPosition = position[num3];
                                digit4.style.backgroundPosition = position[num4];
                                if (stupid < 1000) {
                                    digit1.style.backgroundPosition = numbersOff;
                                } else {
                                    digit1.style.backgroundPosition = position[num1];
                                }
                                ////console.log("amCallNumC: "+ amCallNum + " amCallNumbers[i]: "+ amCallNumbers[i]);
                                if (amCallNum == amCallNumbers[i]) {
                                    ////console.log("there is a match!!!");
                                    clearInterval(autoSearchUp);
                                    audioPlay(stations.amStations[amCallNum]);
                                    break;
                                }
                            }
                        } else {
                            clearInterval(autoSearchUp);
                        }

                    }, 100);
                } //end of if
            } else {
                console.log("AUTO: its in FM mode");
                console.log("currFMCallNum: "+currFMCallNum);
                if (currFMCallNum !== undefined) {
                    console.log("AUTO: an FM preset HAS been selected");
                    //console.log("fmCallNum: " + fmCallNum);
                    //console.log("currFMCallNum: " + currFMCallNum);
                    //a preset HAS NOT been selected, start at the first call number
                    var tempFMCallNum;
                    var fmAutoSearchUp = setInterval(function() {
                        currFMCallNum -= 1;

                        if (currFMCallNum < 1081) {
                            for (i = 0; i < fmCallNumbers.length - 1; i++) {
                                ////console.log("typeof amCallNum: "+ typeof amCallNum);
                                //console.log("currFMCallNum: " + currFMCallNum);
                                ////console.log("amCallNum.length: "+ amCallNum.length);
                                var stupid = String(currFMCallNum);
                                if (stupid > 999) {
                                    ////console.log("more than 999");
                                    num4 = stupid.substr(3, 1);
                                    num3 = stupid.substr(2, 1);
                                    num2 = stupid.substr(1, 1);
                                    num1 = stupid.substr(0, 1);
                                } else if (stupid < 1000) {
                                    ////console.log("less than 1000");
                                    num4 = stupid.substr(2, 1);
                                    num3 = stupid.substr(1, 1);
                                    num2 = stupid.substr(0, 1);
                                    num1 = 0;
                                }
                                digit2.style.backgroundPosition = position[num2];
                                digit3.style.backgroundPosition = position[num3];
                                digit4.style.backgroundPosition = position[num4];
                                if (stupid < 1000) {
                                    //console.log("less than 1000: " + digit1.style.backgroundPosition);
                                    digit1.style.backgroundPosition = numbersOff;
                                    //console.log("less than 1000 b: " + digit1.style.backgroundPosition);
                                } else {
                                    //console.log("more than 999");
                                }
                                ////console.log("amCallNumC: "+ amCallNum + " amCallNumbers[i]: "+ amCallNumbers[i]);
                                if (currFMCallNum == fmCallNumbers[i]) {
                                    //console.log("there is a match!!!" + currFMCallNum + " + " + fmCallNumbers[i]);
                                    tempFMCallNum = (currFMCallNum * 0.1).toFixed(1);
                                    //console.log("there is a match!!!" + tempFMCallNum + " + " + fmCallNumbers[i]);
                                    clearInterval(fmAutoSearchUp);
                                    audioPlay(stations.fmStations[tempFMCallNum]);
                                    break;
                                } else if(currFMCallNum === 880){
                                    clearInterval(fmAutoSearchUp);
                                    break;
                                }
                            }
                        } else {
                            clearInterval(fmAutoSearchUp);
                        }
                    }, 100);
                } else {
                    console.log("AUTO: an FM preset HAS NOT been selected");
                    var fmAutoSearchNPDown = setInterval(function() {
                        fmCallNum -= 1;
                        var tempFMCallNum;
                        if (fmCallNum > 879) {
                            for (i = 0; i < fmCallNumbers.length - 1; i++) {
                                console.log("typeof amCallNum: "+ typeof amCallNum);
                                console.log("amCallNum: "+ amCallNum);
                                console.log("amCallNum.length: "+ amCallNum.length);
                                var stupid = String(fmCallNum);
                                //console.log("stupid: " + stupid);
                                //console.log("stupid.length: " + stupid.length);
                                if (stupid.length === 4) {
                                    //console.log("stupid.length == 4");
                                    num4 = stupid.substr(3, 1);
                                    num3 = stupid.substr(2, 1);
                                    num2 = stupid.substr(1, 1);
                                    num1 = stupid.substr(0, 1);
                                } else if (stupid.length === 3) {
                                    //console.log("stupid.length == 3");
                                    num4 = stupid.substr(2, 1);
                                    num3 = stupid.substr(1, 1);
                                    num2 = stupid.substr(0, 1);
                                    num1 = 0;
                                }

                                digit2.style.backgroundPosition = position[num2];
                                digit3.style.backgroundPosition = position[num3];
                                digit4.style.backgroundPosition = position[num4];
                                if (num1 === 0) {
                                    digit1.style.backgroundPosition = numbersOff;
                                } else {
                                    digit1.style.backgroundPosition = position[num1];
                                }


                                console.log("fmCallNum: "+ fmCallNum);
                                if (fmCallNum == fmCallNumbers[i]) {
                                    tempFMCallNum = (fmCallNum * 0.1).toFixed(1);
                                    clearInterval(fmAutoSearchNPDown);
                                    audioPlay(stations.fmStations[tempFMCallNum]);
                                    break;
                                } else if(fmCallNum === 880){
                                    clearInterval(fmAutoSearchNPDown);
                                    break;
                                }
                            }
                        } else {
                            clearInterval(fmAutoSearchNPDown);
                        }
                    }, 100);
                } //end of if
            } // end of else
        } // end of autoUp();


    /*--- up tuner button functionality --*/
    var tunerUp = document.getElementById("up-button");
    tunerUp.addEventListener("click", function(event) {
        ////console.log("tuner up");

        ////console.log("typeof amCallNum: "+ typeof amCallNum);
        ////console.log("typeof currAMCallNum: "+ typeof currAMCallNum);

        if (autoManual === false) {
            autoUp();
            ////console.log("autoTuner");
        } else {
            //console.log("Manual Tuner");
            // manual tuner selected
            if (functions[2] === true) {
                //console.log("its in AM mode");
                //its in AM mode
                if (currAMCallNum !== undefined) {
                    ////console.log("a preset HAS been selected");
                    ////console.log("currAMCallNum: " + currAMCallNum);
                    //a preset HAS been selected, start at that preset call number
                    if (currAMCallNum > 539 && currAMCallNum < 1601) {
                        audioStop();
                        currAMCallNum = parseInt(currAMCallNum, 10);
                        currAMCallNum = (currAMCallNum + 10);
                        for (i = 0; i < amCallNumbers.length; i++) {
                            if (currAMCallNum == amCallNumbers[i]) {
                                radioDisplay(currAMCallNum, signal);
                                ////console.log("there is a match!!!");
                                radioDisplay(currAMCallNum, signal);
                                audioPlay(stations.amStations[currAMCallNum]);
                                ////console.log("audio.src: " + audio.src);
                                break;
                            }
                        }
                        radioDisplay(currAMCallNum, signal);
                        ////console.log("typeof currAMCallNum: " + typeof currAMCallNum);
                    }

                } else {
                    //a preset HAS NOT been selected, start at the first call number
                    //console.log("a preset HAS NOT been selected");
                    ////console.log("amCallNum: "+amCallNum);
                    if (amCallNum > 539 && amCallNum < 1601) {
                        audioStop();
                        amCallNum += 10;
                        //console.log("amCallNum: " + amCallNum);
                        for (i = 0; i < amCallNumbers.length; i++) {
                            if (amCallNum == amCallNumbers[i]) {
                                ////console.log("there is a match!!!");
                                radioDisplay(amCallNum, signal);
                                audioPlay(stations.amStations[amCallNum]);
                                ////console.log("audio.src: " + audio.src);
                                break;
                            }
                        }
                        ////console.log("amCallNum: " + amCallNum);
                        radioDisplay(amCallNum, signal);
                    }
                }
            } else {
                ////console.log("(this works) typeof currFMCallNum: "+typeof currFMCallNum);
                //its in FM mode
                if (currFMCallNum !== undefined) {
                    //a preset HAS been selected, start at that preset call number
                    //console.log("currFMCallNum: " + currFMCallNum);
                    var tempFMCallNum;
                    if (currFMCallNum > 879 && currFMCallNum < 1081) {
                        audioStop();
                        currFMCallNum = (currFMCallNum + 1);
                        tempFMCallNum = (currFMCallNum * 0.1).toFixed(1);
                        for (i = 0; i < fmCallNumbers.length; i++) {
                            if (currFMCallNum == fmCallNumbers[i]) {
                                //console.log("currFMCallNum: " + currFMCallNum);
                                //console.log("tempFMCallNum: " + tempFMCallNum);
                                //console.log("there is a match!!!");
                                radioDisplay(currFMCallNum, signal);
                                audioPlay(stations.fmStations[tempFMCallNum]);
                                ////console.log("audio.src: " + audio.src);
                                break;
                            }
                        }
                        radioDisplay(currFMCallNum, signal);
                    }
                } else {
                    //console.log("fmCallNum: " + typeof fmCallNum);
                    //console.log("fmCallNum: " + fmCallNum);
                    //a preset HAS NOT been selected, start at the first call number
                    var tempFMCallNum2;
                    if (fmCallNum > 879 && fmCallNum < 1081) {
                        audioStop();
                        fmCallNum += 1;
                        //console.log("fmCallNum: " + typeof fmCallNum);
                        for (i = 0; i < fmCallNumbers.length; i++) {
                            if (fmCallNum === fmCallNumbers[i]) {
                                tempFMCallNum2 = (fmCallNum * 0.1).toFixed(1);
                                //console.log("there is a match!!!");
                                radioDisplay(fmCallNum, signal);
                                audioPlay(stations.fmStations[tempFMCallNum2]);
                                ////console.log("audio.src: " + audio.src);
                                break;
                            }
                        }
                        radioDisplay(fmCallNum, signal);
                    }
                }
            }
        }
    }, false);

    /* --- down tuner button functionality --*/
    var tunerDown = document.getElementById("down-button");
    tunerDown.addEventListener("click", function(event) {
        console.log("tuner down");

        if (autoManual === false) {
            autoDown();
            ////console.log("autoTuner");
        } else {
            ////console.log("Manual Tuner");
            // manual tuner selected
            if (functions[2] === true) {
                ////console.log("its in AM mode");
                //its in AM mode
                if (currAMCallNum !== undefined) {
                    ////console.log("a preset HAS been selected");
                    ////console.log("currAMCallNum: " + currAMCallNum);
                    //a preset HAS been selected, start at that preset call number
                    if (currAMCallNum > 539 && currAMCallNum < 1601) {
                        audioStop();
                        currAMCallNum = parseInt(currAMCallNum, 10);
                        currAMCallNum = (currAMCallNum - 10);
                        for (i = 0; i < amCallNumbers.length; i++) {
                            if (currAMCallNum == amCallNumbers[i]) {
                                ////console.log("there is a match!!!");
                                radioDisplay(currAMCallNum, signal);
                                audioPlay(stations.amStations[currAMCallNum]);
                                ////console.log("audio.src: " + audio.src);
                                break;
                            }
                        }
                        radioDisplay(currAMCallNum, signal);
                    }
                } else {
                    //a preset HAS NOT been selected, start at the first call number
                    ////console.log("a preset HAS NOT been selected");
                    //////console.log("amCallNum: "+amCallNum);
                    if (amCallNum > 539 && amCallNum < 1601) {
                        audioStop();
                        amCallNum = parseFloat(amCallNum);
                        amCallNum = (amCallNum - 10);
                        ////console.log("amCallNum: " + amCallNum);
                        for (i = 0; i < amCallNumbers.length; i++) {
                            if (amCallNum == amCallNumbers[i]) {
                                ////console.log("there is a match!!!");
                                radioDisplay(amCallNum, signal);
                                audioPlay(stations.amStations[amCallNum]);
                                ////console.log("audio.src: " + audio.src);
                                break;
                            }
                        }
                        ////console.log("amCallNum: " + amCallNum);
                        radioDisplay(amCallNum, signal);
                    }
                }
            } else {
                ////console.log("(this works) typeof currFMCallNum: "+typeof currFMCallNum);

                //its in FM mode
                if (currFMCallNum !== undefined) {
                    console.log("fmCallNum: " + typeof fmCallNum);
                    //a preset HAS been selected, start at that preset call number
                    ////console.log("currFMCallNum: " + currFMCallNum);
                    var tempFMCallNum;
                    if (currFMCallNum > 879 && currFMCallNum < 1081) {
                        audioStop();
                        currFMCallNum = (currFMCallNum - 1);
                        tempFMCallNum = (currFMCallNum * 0.1).toFixed(1);
                        for (i = 0; i < fmCallNumbers.length; i++) {
                            if (currFMCallNum == fmCallNumbers[i]) {
                                //console.log("currFMCallNum: " + currFMCallNum);
                                //console.log("tempFMCallNum: " + tempFMCallNum);
                                //console.log("there is a match!!!");
                                radioDisplay(currFMCallNum, signal);
                                audioPlay(stations.fmStations[tempFMCallNum]);
                                ////console.log("audio.src: " + audio.src);
                                break;
                            }
                        }
                        radioDisplay(currFMCallNum, signal);
                    }
                } else {
                    console.log("fmCallNum: " + typeof fmCallNum);
                    //a preset HAS NOT been selected, start at the first call number
                    var tempFMCallNum;
                    if (fmCallNum > 879 && fmCallNum < 1081) {
                        audioStop();
                        fmCallNum -= 1;
                        //console.log("fmCallNum: " + fmCallNum);
                        for (i = 0; i < fmCallNumbers.length; i++) {
                            console.log("fmCallNum: "+ fmCallNum);
                            if (fmCallNum == fmCallNumbers[i]) {
                                tempFMCallNum = (fmCallNum * 0.1).toFixed(1);
                                ////console.log("there is a match!!!");
                                radioDisplay(fmCallNum, signal);
                                audioPlay(stations.fmStations[tempFMCallNum]);
                                ////console.log("audio.src: " + audio.src);
                                break;
                            } else if(fmCallNum === 880){
                                break;
                            }
                        }
                        radioDisplay(fmCallNum, signal);
                    }
                }
            }
        }
    }, false);

    

    var bassTurnoverBut = document.getElementById("bass-turnover-button");
    bassTurnoverBut.addEventListener("click", function(event) {
        bassTurnover = !bassTurnover;
        if(bassTurnover){
            bassTurnoverBut.className = "square-button-down";
            if(bassTurnoverFilter !== undefined){
                bassTurnoverFilter.disconnect();
            }
            source.connect(bassTurnoverFilter); //and of course connect it
            bassTurnoverFilter.type = "lowpass"; //this is a lowshelffilter (try excuting filter1.LOWSHELF in your console)
            bassTurnoverFilter.frequency.value = 200; //as this is a lowshelf filter, it strongens all sounds beneath this frequency
            bassTurnoverFilter.q = 500; //the q
            bassTurnoverFilter.gain.value = 0; //the gain 
            bassTurnoverFilter.connect(context.destination);//now we want to connect that to the output
        } else {
            bassTurnoverBut.className = "square-button-up";
            console.log("bassTurnover off");
            //Now we want to create a filter
            if(bassTurnoverFilter !== undefined){
                bassTurnoverFilter.disconnect();
            }
            source.connect(bassTurnoverFilter); //and of course connect it
            bassTurnoverFilter.type = "lowpass"; //this is a lowshelffilter (try excuting filter1.LOWSHELF in your console)
            bassTurnoverFilter.frequency.value = 400; //as this is a lowshelf filter, it strongens all sounds beneath this frequency
            bassTurnoverFilter.q = 500; //the q
            bassTurnoverFilter.gain.value = 0; //the gain 
            bassTurnoverFilter.connect(context.destination);//now we want to connect that to the output
        }
        //filter.frequency.setValueAtTime(0.0, context.currentTime);
        //filter.frequency.linearRampToValueAtTime(120.0, context.currentTime+10);
    }, false);

    var toneDefeatBut = document.getElementById("tone-defeat-button");
    toneDefeatBut.addEventListener("click", function(event) {
        toneDefeat = !toneDefeat;
        if(toneDefeat){
            toneDefeatBut.className = "square-button-down";
        } else {
            toneDefeatBut.className = "square-button-up";
        }

    }, false);

    var trebleTurnoverBut = document.getElementById("treble-turnover-button");
    trebleTurnoverBut.addEventListener("click", function(event) {
        trebleTurnover = !trebleTurnover;
        if(trebleTurnover){
            trebleTurnoverBut.className = "square-button-down";
            if(trebleTurnoverFilter !== undefined){
                trebleTurnoverFilter.disconnect();
            }
            source.connect(trebleTurnoverFilter); //and of course connect it
            trebleTurnoverFilter.type = "lowpass"; //this is a lowshelffilter (try excuting filter1.LOWSHELF in your console)
            trebleTurnoverFilter.frequency.value = 2000; //as this is a lowshelf filter, it strongens all sounds beneath this frequency
            trebleTurnoverFilter.q = 500; //the q
            trebleTurnoverFilter.gain.value = 0; //the gain 
            trebleTurnoverFilter.connect(context.destination);//now we want to connect that to the output
        } else {
            trebleTurnoverBut.className = "square-button-up";
            //Now we want to create a filter
            if(trebleTurnoverFilter !== undefined){
                trebleTurnoverFilter.disconnect();
            }
            source.connect(trebleTurnoverFilter); //and of course connect it
            trebleTurnoverFilter.type = "lowhpass"; //this is a lowshelffilter (try excuting filter1.LOWSHELF in your console)
            trebleTurnoverFilter.frequency.value = 6000; //as this is a lowshelf filter, it strongens all sounds beneath this frequency
            trebleTurnoverFilter.q = 500; //the q
            trebleTurnoverFilter.gain.value = 0; //the gain 
            trebleTurnoverFilter.connect(context.destination);//now we want to connect that to the output
        }
    }, false);


    var speaker1But = document.getElementById("speaker1");
        speaker1But.addEventListener("click", function(event) {
            speaker1 = !speaker1;
            if(speaker1){
                speaker1But.className = "square-button-down";
                source.connect(context.destination);
            } else {
                speaker1But.className = "square-button-up";
                source.disconnect(context.destination);
            }
    }, false);

    var speaker2But = document.getElementById("speaker2");
        speaker2But.addEventListener("click", function(event) {
            speaker2 = !speaker2;
            if(speaker2){
                speaker2But.className = "square-button-down";
                //source.connect(context.destination);
            } else {
                speaker2But.className = "square-button-up";
                //source.disconnect(context.destination);
            }
    }, false);

    var tapeCopyBut = document.getElementById("tape-copy-button");
        tapeCopyBut.addEventListener("click", function(event) {
            tapeCopy = !tapeCopy;
            if(tapeCopy){
                tapeCopyBut.className = "square-button-down";
                //source.connect(context.destination);
            } else {
                tapeCopyBut.className = "square-button-up";
                //source.disconnect(context.destination);
            }
    }, false);

    var subSonicBut = document.getElementById("supsonic-filter-button");
        subSonicBut.addEventListener("click", function(event) {
            subSonic = !subSonic;
            if(subSonic){
                subSonicBut.className = "square-button-down";
                //source.connect(context.destination);
            } else {
                subSonicBut.className = "square-button-up";
                //source.disconnect(context.destination);
            }
    }, false);

    var loudnessBut = document.getElementById("loudness-button");
        loudnessBut.addEventListener("click", function(event) {
            loudness = !loudness;
            if(loudness){
                loudnessBut.className = "square-button-down";
                if(loudnessTrebFilter !== undefined){
                    loudnessTrebFilter.disconnect();
                }
                source.connect(loudnessTrebFilter); //and of course connect it
                loudnessTrebFilter.type = "highshelf"; //this is a lowshelffilter (try excuting filter1.LOWSHELF in your console)
                loudnessTrebFilter.frequency.value = 6000; //as this is a lowshelf filter, it strongens all sounds beneath this frequency
                loudnessTrebFilter.q = 500; //the q
                loudnessTrebFilter.gain.value = 2; //the gain 
                loudnessTrebFilter.connect(context.destination);//now we want to connect that to the output

                if(loudnessBassFilter !== undefined){
                    loudnessBassFilter.disconnect();
                }
                source.connect(loudnessBassFilter); //and of course connect it
                loudnessBassFilter.type = "lowshelf"; //this is a lowshelffilter (try excuting filter1.LOWSHELF in your console)
                loudnessBassFilter.frequency.value = 6000; //as this is a lowshelf filter, it strongens all sounds beneath this frequency
                loudnessBassFilter.q = 500; //the q
                loudnessBassFilter.gain.value = 2; //the gain 
                loudnessBassFilter.connect(context.destination);//now we want to connect that to the output
            } else {
                loudnessBut.className = "square-button-up";
                //source.disconnect(context.destination);
                if(loudnessTrebFilter !== undefined){
                    loudnessTrebFilter.disconnect();
                }
                if(loudnessBassFilter !== undefined){
                    loudnessBassFilter.disconnect();
                }
                source.connect(context.destination);
            }
    }, false);


 /* --- down tuner button functionality --*/
    var memoryButton = document.getElementById("memory-button");
    memoryButton.addEventListener("click", function(event) {
        memory = !memory;
        if(memory){
            document.getElementById("memory-button").className = "glass-button-on";
        } else {
            document.getElementById("memory-button").className = "glass-button-off";
        }

        setTimeout(function(){
            memory = !memory;
            document.getElementById("memory-button").className = "glass-button-off";
        },3000);

    }, false);

    function powerOnDisplay() {
        document.getElementById("glass-feature").className = "glass-uppercase-on";
        document.getElementById("tape-monitor").className = "glass-uppercase-on";
        document.getElementById("tape1-holder").className = "glass-lowercase-on";
        document.getElementById("tape2-holder").className = "glass-lowercase-on";
        document.getElementById("function-header").className = "glass-uppercase-on";
        document.getElementById("function-header").className = "glass-uppercase-on function-header-on";
        document.getElementById("phono-holder").className = "glass-lowercase-on";
        document.getElementById("aux-holder").className = "glass-lowercase-on";
        document.getElementById("am-holder").className = "glass-lowercase-on";
        document.getElementById("fm-holder").className = "glass-lowercase-on";
        document.getElementById("signal-header").className = "signal-header-on";
        document.getElementById("signal-lights-holder").className = "glass-uppercase-off";
        document.getElementById("signal-footer").className = "signal-footer-on";
    }

    function powerOffDisplay() {
        document.getElementById("glass-feature").className = "glass-uppercase-off";
        document.getElementById("tape-monitor").className = "glass-uppercase-off";
        document.getElementById("tape1-holder").className = "glass-lowercase-off";
        document.getElementById("tape2-holder").className = "glass-lowercase-off";
        document.getElementById("function-header").className = "glass-uppercase-off";
        document.getElementById("function-header").className = "glass-uppercase-off function-header-off";
        document.getElementById("phono-holder").className = "glass-lowercase-off";
        document.getElementById("aux-holder").className = "glass-lowercase-off";
        document.getElementById("am-holder").className = "glass-lowercase-off";
        document.getElementById("fm-holder").className = "glass-lowercase-off";
        document.getElementById("signal-header").className = "signal-header-off";
        document.getElementById("signal-lights-holder").className = "glass-uppercase-off";
        document.getElementById("signal-footer").className = "signal-footer-off";
        for (i = 1; i < 5; i++) {
            var funcButtonsOff = document.getElementById("function-light" + i);
            funcButtonsOff.className = "function-light-off";
        }
        for (i = 1; i < 3; i++) {
            var tapeButtonsOff = document.getElementById("tape-light" + i);
            tapeButtonsOff.className = "tape-light-off";
        }
    }


    /* ---- POWER BUTTON ---*/
    document.getElementById("power-button").addEventListener("click", function() {
        power = !power;

        if (power) {
            if (tapeMonitor[0] === true) {
                radioDisplay(amCallNum, signal);
                digitsOff();
            } else if (tapeMonitor[1] === true) {
                radioDisplay(amCallNum, signal);
                digitsOff();
            }
            if (functions[0] === true) {
                radioDisplay(amCallNum, signal);
                digitsOff();
            } else if (functions[1] === true && tapeMonitor[2] === true) {
                radioDisplay(amCallNum, signal);
                digitsOff();
            } else if (functions[2] === true && tapeMonitor[2] === true) {
                radioDisplay(amCallNum, signal);
                audioPlay(amUrl);
            } else if (functions[3] === true && tapeMonitor[2] === true) {
                radioDisplay(fmCallNum, signal);
                audioPlay(fmUrl);
            }
            ////console.log("power: " + power);
            powerOnDisplay();
            document.getElementById("power-button").className = "vertical-button-on";
        } else {
            powerOffDisplay();
            radioDisplay(fmCallNum, signal);
            audioStop();
            allPresetLightsOff();
            document.getElementById("power-button").className = "vertical-button-off";
        }
    }, false);




    /*for(i = 1; i < 9; i++){
              var el = document.getElementById("preset"+i);
              el.addEventListener("click", presetFunctionality(i));     
    } //end of for loop*/




    ////console.log("currFMCallNum: " + currFMCallNum);

    ////console.dir(audio);

    var bassDial = JogDial(document.getElementById('bass-knob'), {
        debug: false,
        wheelSize: '90%',
        zIndex: '100',
        touchMode: 'wheel',
        knobSize: '10%',
        minDegree: -120,
        maxDegree: 120,
        degreeStartAt: 0
    });
    var trebleDial = JogDial(document.getElementById('treble-knob'), {
        debug: false,
        wheelSize: '90%',
        zIndex: '100',
        touchMode: 'wheel',
        knobSize: '10%',
        minDegree: -120,
        maxDegree: 120,
        degreeStartAt: 0
    });
    var balanceDial = JogDial(document.getElementById('balance-knob'), {
        debug: false,
        wheelSize: '90%',
        zIndex: '100',
        touchMode: 'wheel',
        knobSize: '10%',
        minDegree: -120,
        maxDegree: 120,
        degreeStartAt: 0
    });
    var volumeDial = JogDial(document.getElementById('volume-knob'), {
        debug: false,
        wheelSize: '90%',
        zIndex: '100',
        touchMode: 'wheel',
        knobSize: '3%',
        minDegree: -140,
        maxDegree: 140,
        degreeStartAt: 0
    }).on("mousemove", function(event){
        var volume = (event.target.rotation + 140) / 280;
        gainNode.gain.value = volume;
        source.disconnect();
        source.connect(gainNode);
        gainNode.connect(context.destination);
    }).on("mouseup", function(event){

    });


    //volumeDial.angle(-140);
}); // end of DOMContentLoaded