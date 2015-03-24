/********************************************************************
 *                                                                  *
 *   radioReceiver.js - v 1.0                                       *
 *                                                                  *
 *   Copyright (c) 2014 Michael LaRiviere (leaffan1984@gmail.com)   *
 *   Licensed under the MIT license                                 *
 *                                                                  *
 *******************************************************************/

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
    var speaker1 = true;
    var speaker2 = false;
    var tapeCopy = false;
    var subSonic = false;
    var currBassGain = 0;
    var currTrebGain = 0;

    // web audio api related:
    var context;
    var source;
    var bassFilter;
    var trebFilter;
    var panner;
    var listener;
    var gainNode;
    var bassTurnover = false;
    var trebTurnover = false;
    var toneDefeat = false;
    var loudness = false;
    var currVolume = 0.5;
    var lastVolume;
    var mute = false;
    var currTrebFiltGain;
    var currBassFiltGain;
    var stereo = false;

    // radio preset related:
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

    var tempFMCallNum;

    var status = document.getElementById("status-text");

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
            '89.1': 'http://listen.radionomy.com/PortofinoNetwork',
            '89.5': 'http://streaming.radionomy.com/ClassicHits931WNOX',
            '92.5': 'http://50.117.26.26:6959/Live',
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
    currFMCallNum = fmCallNum;
    var fmUrl = "http://indie.streamon.fm:8000/indie-48k.aac";
    var amCallNum = 540;
    currAMCallNum = amCallNum;
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

        // setup the web audio api
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
        source = context.createMediaElementSource(document.getElementById('audio'));
        gainNode = context.createGain();

        bassFilter = context.createBiquadFilter();
        bassFilter.type = "lowshelf";
        trebFilter = context.createBiquadFilter();
        trebFilter.type = "highshelf";
        panner = context.createPanner();
        panner.panningModel = 'equalpower';
        panner.distanceModel = 'inverse';
        panner.refDistance = 1;
        panner.maxDistance = 10000;
        panner.rolloffFactor = 1;
        panner.coneInnerAngle = 360;
        panner.coneOuterAngle = 0;
        panner.coneOuterGain = 0;
        panner.setOrientation(1, 0, 0);
        listener = context.listener;
        listener.setOrientation(0, 0, -1, 0, 1, 0);

        gainNode.gain.value = currVolume;

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

        document.getElementById("speaker1").className = "square-button-down";

        //push the inital start FM station to the first station in the array
        fmCallNum = fmCallNumbers[0];
        currFMCallNum = fmCallNum;

        //push the AM stations into an array, and make a number
        (function pushAM() {
            for (var key in stations.amStations) {
                amCallNumbers.push(parseInt(key, 10));
                amURLs.push(stations.amStations[key]);
            }
        }());

        //push the inital start AM station to the first station in the array
        amCallNum = amCallNumbers[0];
        currAMCallNum = amCallNum;

        var numOfFMStations = parseInt(fmCallNumbers.length, 10);
        var numOfAMStations = parseInt(amCallNumbers.length, 10);

        var randomnumber = Math.ceil(Math.random() * numOfFMStations - 1);

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
    })(); // end of init();

    function allPresetLightsOff() {
        for (i = 1; i < 9; i++) {
            var shutOff = document.getElementById("preset" + i);
            shutOff.className = "glass-button-off";
        }
    }

    function radioPresetSwitch(a) {
        if (memory) {
            if (am) {
                var AMTemp = amCallNumbers.indexOf(currAMCallNum);
                amSelected[a] = AMTemp;
            } else if (fm) {
                var FMTemp = fmCallNumbers.indexOf(currFMCallNum);
                fmSelected[a] = FMTemp;
            }
        } else {
            allPresetLightsOff();
            var n = parseInt(n, 10);
            if (power === true && tapeMonitor[2] === true) {
                digitsOn();
                signalLightsOff();
                signalLightsOn();
            }

            var presetPlay = function(){
                if (functions[2] === true) {
                    currAMPreset = parseInt(a, 10);
                    audioPlay(amURLs[amSelected[a]]);
                    currAMCallNum = amCallNumbers[amSelected[a]];
                    currAMURL = amURLs[amSelected[a]];
                    radioDisplay(currAMCallNum, signal);
                } else if (functions[3] === true) {
                    currFMPreset = parseInt(a, 10);
                    audioPlay(fmURLs[fmSelected[a]]);
                    currFMCallNum = fmCallNumbers[fmSelected[a]];
                    currFMURL = fmURLs[fmSelected[a]];
                    radioDisplay(currFMCallNum, signal);
                }
            };

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
        var string = e;
        var num = parseInt(string.substr((string.length - 1), 1), 10);
        radioPresetSwitch(num - 1);
    }

    /*for (i = 1; i < 9; i++) {
        var presetEl = document.getElementById("preset" + i);
        presetEl.addEventListener("click", function(event) {
            if (power) {
                presetFunctionality(event);
            }
        }, false);
    } //end of for loop*/

    function presetClick(i) {
        "use strict";
        return function () {
            if (power) {
                presetFunctionality("preset"+i);
            }
        };
    }

    for (i = 1; i < 9; i++) {
        var presetEl = document.getElementById("preset" + i);
        presetEl.addEventListener("click", presetClick(i));
    }

    function signalLightsOff() {
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

    function eq() {
        if (toneDefeat) {
            bassFilter.gain.value = 0;
            trebFilter.gain.value = 0;
        } else if (!toneDefeat) {
            if (trebTurnover) {
                trebFilter.frequency.value = 2000;
                if (loudness) {
                    trebFilter.gain.value = 5;
                    currTrebFiltGain = trebFilter.gain.value;
                } else {
                    trebFilter.gain.value = 2;
                    currTrebFiltGain = trebFilter.gain.value;
                }
            } else if (!trebTurnover) {
                trebFilter.frequency.value = 6000;
                if (loudness) {
                    trebFilter.gain.value = 9;
                    currTrebFiltGain = trebFilter.gain.value;
                } else {
                    trebFilter.gain.value = 6;
                    currTrebFiltGain = trebFilter.gain.value;
                }
            }

            if (bassTurnover) {
                bassFilter.frequency.value = 200;
                if (loudness) {
                    bassFilter.gain.value = 5;
                    currBassFiltGain = bassFilter.gain.value;
                } else {
                    bassFilter.gain.value = 2;
                    currBassFiltGain = bassFilter.gain.value;
                }
            } else if (!bassTurnover) {
                bassFilter.frequency.value = 400;
                if (loudness) {
                    bassFilter.gain.value = 9;
                    currBassFiltGain = bassFilter.gain.value;
                } else {
                    bassFilter.gain.value = 6;
                    currBassFiltGain = bassFilter.gain.value;
                }
            }
        }
        if (mute) {
            gainNode.gain.value = 0;
            lastVolume = currVolume;
        } else {
            gainNode.gain.value = lastVolume;
        }
    }

    function audioPlay(url) {
            audio.src = url;
            audio.load();
            audio.play();
            signalLightsOn();
            source.connect(panner);
            panner.connect(gainNode);
            gainNode.connect(bassFilter);
            bassFilter.connect(trebFilter);
            trebFilter.connect(context.destination);
            eq();
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

            //console.log('num4: ' + num4 + ',\nnum3: ' + num3 + ',\nnum2: ' + num2 + ',\nnum1: ' + num1);

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
        var buttonOn = document.getElementById(e);
        for (i = 1; i < 5; i++) {
            var buttonOff = document.getElementById("func-" + i);
            buttonOff.className = "vertical-button-off";
            functions[(i - 1)] = false;
        }
        buttonOn.className = "vertical-button-on";
        switch (buttonOn.id) {
            case "func-1":
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
                functions[2] = true;
                am = true;
                fm = false;
                if (power === true && tapeMonitor[2] === true) {
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
                    digitsOn();
                    signalLightsOff();
                    signalLightsOn();
                }
                break;

            case "func-4":
                functions[3] = true;
                am = false;
                fm = true;
                if (power === true && tapeMonitor[2] === true) {
                    digitsOn();
                    if (currFMCallNum !== undefined) {
                        radioDisplay(currFMCallNum, signal);
                        audioPlay(fmUrl);
                        allPresetLightsOff();
                        radioPresetSwitch(currFMPreset);
                    } else {
                        radioDisplay(fmCallNumbers[0], signal);
                        audioPlay(fmURLs[0]);
                        allPresetLightsOff();
                    }
                    digitsOn();
                    //signalLightsOff();
                    signalLightsOn();
                }
                break;
        }
    }

    function tapemonitorButton(a) {
        var buttonOn = document.getElementById(a);
        for (i = 1; i < 4; i++) {
            var buttonOff = document.getElementById("tm-" + i);
            buttonOff.className = "vertical-button-off";
            tapeMonitor[(i - 1)] = false;
        }
        buttonOn.className = "vertical-button-on";

        audioStop();

        switch (buttonOn.id) {
            case "tm-1":
                tapeMonitor[0] = true;
                audioStop();
                radioDisplay(fmCallNum, signal);
                digitsOff();
                signalLightsOff();
                allPresetLightsOff();
                break;

            case "tm-2":
                tapeMonitor[1] = true;
                audioStop();
                radioDisplay(fmCallNum, signal);
                digitsOff();
                signalLightsOff();
                allPresetLightsOff();
                break;

            case "tm-3":
                tapeMonitor[2] = true;
                if (power === true && functions[0] === true) {
                    radioDisplay(amCallNum, signal);
                    digitsOff();
                } else if (power === true && functions[1] === true) {
                    radioDisplay(amCallNum, signal);
                    digitsOff();
                } else if (power === true && functions[2] === true) {

                    if (currAMCallNum !== undefined) {
                        radioDisplay(currAMCallNum, signal);
                        audioPlay(currAMURL);
                        allPresetLightsOff();
                        radioPresetSwitch(currAMPreset);
                    } else {
                        radioDisplay(amCallNum, signal);
                        audioPlay(amURLs[0]);
                        allPresetLightsOff();
                    }
                    digitsOn();
                    signalLightsOff();
                    signalLightsOn();
                } else if (power === true && functions[3] === true) {
                    if (currFMCallNum !== undefined) {
                        radioDisplay(currFMCallNum, signal);
                        audioPlay(currFMURL);
                        allPresetLightsOff();
                        radioPresetSwitch(currFMPreset);
                    } else {
                        radioDisplay(fmCallNum, signal);
                        audioPlay(fmURLs[0]);
                        allPresetLightsOff();
                    }
                    digitsOn();
                    signalLightsOff();
                    signalLightsOn();
                }
                break;
        }
    }

    /* ---- FUNCTION BUTTONS ---*/
    /*for (i = 1; i < 5; i++) {
        var funcEl = document.getElementById("func-" + i);
        //funcEl.addEventListener("click", functions(event)); 
        funcEl.addEventListener("click", function(event) {
            functionButton(event);
        }, false);
    } //end of for loop*/

    /* ---- FUNCTION BUTTONS ---*/
    function functionClick(i) {
        "use strict";
        return function () {
            if (power) {
                functionButton("func-" + i);
            }
        };
    }

    for (i = 1; i < 5; i++) {
        var funcEl = document.getElementById("func-" + i);
        funcEl.addEventListener("click", functionClick(i));
    }

    /* ---- TAPE MONITOR BUTTONS ---*/
    /*for (i = 1; i < 4; i++) {
        var tmEl = document.getElementById("tm-" + i);
        //funcEl.addEventListener("click", functions(event)); 
        tmEl.addEventListener("click", function(event) {
            tapemonitorButton(event);
        }, false);
    } //end of for loop*/

    /* ---- TAPE MONITOR BUTTONS ---*/
    function tapeClick(i) {
        "use strict";
        return function () {
            if (power) {
                tapemonitorButton("tm-" + i);
            }
        };
    }

    for (i = 1; i < 4; i++) {
        var tmEl = document.getElementById("tm-" + i);
        tmEl.addEventListener("click", tapeClick(i));
    }

    /* ---- AUTO AND MANUAL TUNER BUTTONS ---*/

    var autoTuner = document.getElementById("auto-button");
    autoTuner.addEventListener("click", function(event) {
        if (power === true && tapeMonitor[2] === true && functions[2] === true || power === true && tapeMonitor[2] === true && functions[3] === true) {
            autoManual = false;
            autoTuner.className = "glass-button-on";
            manualTuner.className = "glass-button-off";
        }
    }, false);

    var manualTuner = document.getElementById("manual-button");
    manualTuner.addEventListener("click", function(event) {
        if (power === true && tapeMonitor[2] === true && functions[2] === true || power === true && tapeMonitor[2] === true && functions[3] === true) {
            autoManual = true;
            autoTuner.className = "glass-button-off";
            manualTuner.className = "glass-button-on";
        }
    }, false);


    function autoUp() {
        audioStop();
        if (functions[2] === true) {
            if (currAMCallNum !== undefined) {
                var autoSearchUp = setInterval(function() {
                    currAMCallNum += 10;
                    if (currAMCallNum < 1601) {
                        for (i = 0; i < amCallNumbers.length - 1; i++) {
                            var stupid = String(currAMCallNum);
                            if (stupid > 999) {
                                num4 = stupid.substr(3, 1);
                                num3 = stupid.substr(2, 1);
                                num2 = stupid.substr(1, 1);
                                num1 = stupid.substr(0, 1);
                            } else if (stupid < 1000) {
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
                            if (currAMCallNum == amCallNumbers[i]) {
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
                var amAutoSearchWOPUp = setInterval(function() {
                    amCallNum += 10;
                    if (amCallNum < 1601) {
                        for (i = 0; i < amCallNumbers.length - 1; i++) {
                            var stupid = String(amCallNum);
                            if (stupid > 999) {
                                num4 = stupid.substr(3, 1);
                                num3 = stupid.substr(2, 1);
                                num2 = stupid.substr(1, 1);
                                num1 = stupid.substr(0, 1);
                            } else if (stupid < 1000) {
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
                            if (amCallNum == amCallNumbers[i]) {
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
            if (currFMCallNum !== undefined) {
                var fmAutoSearchUp = setInterval(function() {
                    currFMCallNum += 1;
                    if (currFMCallNum < 1081) {
                        for (i = 0; i < fmCallNumbers.length - 1; i++) {
                            var stupid = String(currFMCallNum);
                            if (stupid > 999) {
                                num4 = stupid.substr(3, 1);
                                num3 = stupid.substr(2, 1);
                                num2 = stupid.substr(1, 1);
                                num1 = stupid.substr(0, 1);
                            } else if (stupid < 1000) {
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
                            if (currFMCallNum == fmCallNumbers[i]) {
                                tempFMCallNum = (currFMCallNum * 0.1).toFixed(1);
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
                var fmAutoSearchWOPUp = setInterval(function() {
                    fmCallNum += 1;
                    if (fmCallNum < 1081) {
                        for (i = 0; i < fmCallNumbers.length - 1; i++) {
                            var stupid = String(fmCallNum);
                            if (fmCallNum > 999) {
                                num4 = stupid.substr(3, 1);
                                num3 = stupid.substr(2, 1);
                                num2 = stupid.substr(1, 1);
                                num1 = stupid.substr(0, 1);
                            } else if (fmCallNum < 1000) {
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
                            if (fmCallNum == fmCallNumbers[i]) {

                                tempFMCallNum = (fmCallNum * 0.1).toFixed(1);

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
                // AUTO: its in AM mode
                if (currAMCallNum !== undefined) {
                    //AUTO: an AM preset HAS been selected
                    var autoSearchDown = setInterval(function() {
                        currAMCallNum -= 10;
                        if (currAMCallNum > 539) {
                            for (i = 0; i < amCallNumbers.length - 1; i++) {
                                var stupid = String(currAMCallNum);
                                if (stupid > 999) {
                                    num4 = stupid.substr(3, 1);
                                    num3 = stupid.substr(2, 1);
                                    num2 = stupid.substr(1, 1);
                                    num1 = stupid.substr(0, 1);
                                } else if (stupid < 1000) {
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
                                if (currAMCallNum == amCallNumbers[i]) {
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
                    //AUTO: an AM preset HAS NOT been selected
                    var autoSearchUp = setInterval(function() {
                        amCallNum -= 10;
                        if (amCallNum > 539) {
                            for (i = 0; i < amCallNumbers.length - 1; i++) {
                                var stupid = String(amCallNum);
                                if (stupid > 999) {
                                    num4 = stupid.substr(3, 1);
                                    num3 = stupid.substr(2, 1);
                                    num2 = stupid.substr(1, 1);
                                    num1 = stupid.substr(0, 1);
                                } else if (stupid < 1000) {
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
                                if (amCallNum == amCallNumbers[i]) {
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
                //AUTO: its in FM mode
                if (currFMCallNum !== undefined) {
                    //AUTO: an FM preset HAS been selected
                    //a preset HAS NOT been selected, start at the first call number
                    var fmAutoSearchUp = setInterval(function() {
                        currFMCallNum -= 1;

                        if (currFMCallNum < 1081) {
                            for (i = 0; i < fmCallNumbers.length - 1; i++) {
                                var stupid = String(currFMCallNum);
                                if (stupid > 999) {
                                    num4 = stupid.substr(3, 1);
                                    num3 = stupid.substr(2, 1);
                                    num2 = stupid.substr(1, 1);
                                    num1 = stupid.substr(0, 1);
                                } else if (stupid < 1000) {
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
                                    //console.log("more than 999");
                                }

                                if (currFMCallNum == fmCallNumbers[i]) {

                                    tempFMCallNum = (currFMCallNum * 0.1).toFixed(1);

                                    clearInterval(fmAutoSearchUp);
                                    audioPlay(stations.fmStations[tempFMCallNum]);
                                    break;
                                } else if (currFMCallNum === 880) {
                                    clearInterval(fmAutoSearchUp);
                                    break;
                                }
                            }
                        } else {
                            clearInterval(fmAutoSearchUp);
                        }
                    }, 100);
                } else {
                    //AUTO: an FM preset HAS NOT been selected
                    var fmAutoSearchNPDown = setInterval(function() {
                        fmCallNum -= 1;
                        if (fmCallNum > 879) {
                            for (i = 0; i < fmCallNumbers.length - 1; i++) {
                                var stupid = String(fmCallNum);
                                if (stupid.length === 4) {
                                    num4 = stupid.substr(3, 1);
                                    num3 = stupid.substr(2, 1);
                                    num2 = stupid.substr(1, 1);
                                    num1 = stupid.substr(0, 1);
                                } else if (stupid.length === 3) {
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
                                if (fmCallNum == fmCallNumbers[i]) {
                                    tempFMCallNum = (fmCallNum * 0.1).toFixed(1);
                                    clearInterval(fmAutoSearchNPDown);
                                    audioPlay(stations.fmStations[tempFMCallNum]);
                                    break;
                                } else if (fmCallNum === 880) {
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
        if (autoManual === false) {
            autoUp();
        } else {
            // manual tuner selected
            if (functions[2] === true) {
                //its in AM mode
                if (currAMCallNum !== undefined) {
                    ////console.log("a preset HAS been selected");
                    //a preset HAS been selected, start at that preset call number
                    if (currAMCallNum > 539 && currAMCallNum < 1601) {
                        audioStop();
                        currAMCallNum = parseInt(currAMCallNum, 10);
                        currAMCallNum = (currAMCallNum + 10);
                        for (i = 0; i < amCallNumbers.length; i++) {
                            if (currAMCallNum == amCallNumbers[i]) {
                                radioDisplay(currAMCallNum, signal);
                                audioPlay(stations.amStations[currAMCallNum]);
                                break;
                            }
                        }
                        radioDisplay(currAMCallNum, signal);
                    }

                } else {
                    //a preset HAS NOT been selected, start at the first call number
                    //console.log("a preset HAS NOT been selected");
                    if (amCallNum > 539 && amCallNum < 1601) {
                        audioStop();
                        amCallNum += 10;
                        for (i = 0; i < amCallNumbers.length; i++) {
                            if (amCallNum == amCallNumbers[i]) {
                                radioDisplay(amCallNum, signal);
                                audioPlay(stations.amStations[amCallNum]);
                                break;
                            }
                        }
                        radioDisplay(amCallNum, signal);
                    }
                }
            } else {
                //its in FM mode
                if (currFMCallNum !== undefined) {
                    //a preset HAS been selected, start at that preset call number
                    //console.log("currFMCallNum: " + currFMCallNum);
                    if (currFMCallNum > 879 && currFMCallNum < 1081) {
                        audioStop();
                        currFMCallNum = (currFMCallNum + 1);
                        tempFMCallNum = (currFMCallNum * 0.1).toFixed(1);
                        for (i = 0; i < fmCallNumbers.length; i++) {
                            if (currFMCallNum == fmCallNumbers[i]) {
                                radioDisplay(currFMCallNum, signal);
                                audioPlay(stations.fmStations[tempFMCallNum]);
                                break;
                            }
                        }
                        radioDisplay(currFMCallNum, signal);
                    }
                } else {
                    //a preset HAS NOT been selected, start at the first call number
                    if (fmCallNum > 879 && fmCallNum < 1081) {
                        audioStop();
                        fmCallNum += 1;
                        for (i = 0; i < fmCallNumbers.length; i++) {
                            if (fmCallNum === fmCallNumbers[i]) {
                                tempFMCallNum = (fmCallNum * 0.1).toFixed(1);
                                radioDisplay(fmCallNum, signal);
                                audioPlay(stations.fmStations[tempFMCallNum]);
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
                    //a preset HAS been selected, start at that preset call number
                    if (currAMCallNum > 539 && currAMCallNum < 1601) {
                        audioStop();
                        currAMCallNum = parseInt(currAMCallNum, 10);
                        currAMCallNum = (currAMCallNum - 10);
                        for (i = 0; i < amCallNumbers.length; i++) {
                            if (currAMCallNum == amCallNumbers[i]) {
                                radioDisplay(currAMCallNum, signal);
                                audioPlay(stations.amStations[currAMCallNum]);
                                break;
                            }
                        }
                        radioDisplay(currAMCallNum, signal);
                    }
                } else {
                    //a preset HAS NOT been selected, start at the first call number
                    ////console.log("a preset HAS NOT been selected");
                    if (amCallNum > 539 && amCallNum < 1601) {
                        audioStop();
                        amCallNum = parseFloat(amCallNum);
                        amCallNum = (amCallNum - 10);
                        for (i = 0; i < amCallNumbers.length; i++) {
                            if (amCallNum == amCallNumbers[i]) {
                                radioDisplay(amCallNum, signal);
                                audioPlay(stations.amStations[amCallNum]);
                                break;
                            }
                        }
                        radioDisplay(amCallNum, signal);
                    }
                }
            } else {
                //its in FM mode
                if (currFMCallNum !== undefined) {
                    //a preset HAS been selected, start at that preset call number
                    if (currFMCallNum > 879 && currFMCallNum < 1081) {
                        audioStop();
                        currFMCallNum = (currFMCallNum - 1);
                        tempFMCallNum = (currFMCallNum * 0.1).toFixed(1);
                        for (i = 0; i < fmCallNumbers.length; i++) {
                            if (currFMCallNum == fmCallNumbers[i]) {
                                radioDisplay(currFMCallNum, signal);
                                audioPlay(stations.fmStations[tempFMCallNum]);
                                break;
                            }
                        }
                        radioDisplay(currFMCallNum, signal);
                    }
                } else {
                    if (fmCallNum > 879 && fmCallNum < 1081) {
                        audioStop();
                        fmCallNum -= 1;
                        for (i = 0; i < fmCallNumbers.length; i++) {
                            if (fmCallNum == fmCallNumbers[i]) {
                                tempFMCallNum = (fmCallNum * 0.1).toFixed(1);
                                radioDisplay(fmCallNum, signal);
                                audioPlay(stations.fmStations[tempFMCallNum]);
                                break;
                            } else if (fmCallNum === 880) {
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
        if (bassTurnover) {
            bassTurnoverBut.className = "square-button-down";
        } else {
            bassTurnoverBut.className = "square-button-up";
        }
        eq();
    }, false);

    var toneDefeatBut = document.getElementById("tone-defeat-button");
    toneDefeatBut.addEventListener("click", function(event) {
        toneDefeat = !toneDefeat;
        if (toneDefeat) {
            toneDefeatBut.className = "square-button-down";
        } else {
            toneDefeatBut.className = "square-button-up";
        }
        eq();
    }, false);

    var trebleTurnoverBut = document.getElementById("treble-turnover-button");
    trebleTurnoverBut.addEventListener("click", function(event) {
        trebTurnover = !trebTurnover;
        if (trebTurnover) {
            trebleTurnoverBut.className = "square-button-down";
        } else {
            trebleTurnoverBut.className = "square-button-up";
        }
        eq();
    }, false);

    var speaker1But = document.getElementById("speaker1");
    speaker1But.addEventListener("click", function(event) {
        speaker1 = !speaker1;
        mute = !mute;
        if (speaker1) {
            speaker1But.className = "square-button-down";
        } else {
            speaker1But.className = "square-button-up";
        }
        eq();
    }, false);

    var speaker2But = document.getElementById("speaker2");
    speaker2But.addEventListener("click", function(event) {
        speaker2 = !speaker2;
        if (speaker2) {
            speaker2But.className = "square-button-down";
        } else {
            speaker2But.className = "square-button-up";
        }
    }, false);

    var tapeCopyBut = document.getElementById("tape-copy-button");
    tapeCopyBut.addEventListener("click", function(event) {
        tapeCopy = !tapeCopy;
        if (tapeCopy) {
            tapeCopyBut.className = "square-button-down";
        } else {
            tapeCopyBut.className = "square-button-up";
        }
    }, false);

    var subSonicBut = document.getElementById("subsonic-filter-button");
    subSonicBut.addEventListener("click", function(event) {
        subSonic = !subSonic;
        if (subSonic) {
            subSonicBut.className = "square-button-down";
        } else {
            subSonicBut.className = "square-button-up";
        }
    }, false);

    var loudnessBut = document.getElementById("loudness-button");
    loudnessBut.addEventListener("click", function(event) {
        loudness = !loudness;
        if (loudness) {
            loudnessBut.className = "square-button-down";

        } else {
            loudnessBut.className = "square-button-up";
        }
        eq();
    }, false);

    var stereoBut = document.getElementById("audio-mode-button");
    stereoBut.addEventListener("click", function(event) {
        stereo = !stereo;
        if (stereo) {
            stereoBut.className = "square-button-down";
            panner.panningModel = 'HRTF';
        } else {
            stereoBut.className = "square-button-up";
            panner.panningModel = 'equalpower';
        }
        eq();
    }, false);

    var muteBut = document.getElementById("muting-button");
    muteBut.addEventListener("click", function(event) {
        mute = !mute;
        if (mute) {
            muteBut.className = "square-button-down";
        } else {
            muteBut.className = "square-button-up";
        }
        eq();
    }, false);


    /* --- down tuner button functionality --*/
    var memoryButton = document.getElementById("memory-button");
    memoryButton.addEventListener("click", function(event) {
        if (power) {
            memory = !memory;
            if (memory) {
                document.getElementById("memory-button").className = "glass-button-on";
            } else {
                document.getElementById("memory-button").className = "glass-button-off";
            }
            setTimeout(function() {
                memory = !memory;
                document.getElementById("memory-button").className = "glass-button-off";
            }, 3000);
        }
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
            powerOnDisplay();
            gainNode.gain.value = volume;
            document.getElementById("power-button").className = "vertical-button-on";
        } else {
            powerOffDisplay();
            radioDisplay(fmCallNum, signal);
            audioStop();
            allPresetLightsOff();
            document.getElementById("power-button").className = "vertical-button-off";
        }
    }, false);

    // pan function for balance dial
    function pan(range) {
        var xDeg = parseInt(range, 10);
        var zDeg = xDeg + 280;
        if (zDeg > 280) {
            zDeg = 540 - zDeg;
        }
        var x = Math.sin(xDeg * (Math.PI / 540));
        var z = Math.sin(zDeg * (Math.PI / 540));
        panner.setPosition(x, 0, z);
    }

    var balanceDial = JogDial(document.getElementById('balance-knob'), {
        debug: false,
        wheelSize: '90%',
        zIndex: '100',
        touchMode: 'wheel',
        knobSize: '10%',
        minDegree: -140,
        maxDegree: 140,
        degreeStartAt: 0
    }).on("mousemove", function(event) {
        var balance = Math.round(event.target.rotation);
        pan(balance);
    });

    var bassDial = JogDial(document.getElementById('bass-knob'), {
        debug: false,
        wheelSize: '90%',
        zIndex: '100',
        touchMode: 'wheel',
        knobSize: '10%',
        minDegree: -140,
        maxDegree: 140,
        degreeStartAt: 0
    }).on("mousemove", function(event) {
        var bass = currBassFiltGain + (event.target.rotation + 140) / 280 * 10;
        if (!toneDefeat) {
            bassFilter.gain.value = bass;
        }
    });

    var trebleDial = JogDial(document.getElementById('treble-knob'), {
        debug: false,
        wheelSize: '90%',
        zIndex: '100',
        touchMode: 'wheel',
        knobSize: '10%',
        minDegree: -140,
        maxDegree: 140,
        degreeStartAt: 0
    }).on("mousemove", function(event) {
        var treble = currTrebFiltGain + (event.target.rotation + 140) / 280 * 10;
        if (!toneDefeat) {
            trebFilter.gain.value = treble;
        }
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
    }).on("mousemove", function(event) {
        var volume = (event.target.rotation + 140) / 280;
        gainNode.gain.value = volume;
    }).on("mouseup", function(event) {
        currVolume = volume;
    });

    // tooltip messages

    document.getElementById("power-button").addEventListener("mouseover", function() {
        status.innerHTML = "Power Switch: Pressing this switch will turn on the power and the front panel will illuminate. Press the switch again to turn the power off";
    }, false);
    document.getElementById("power-button").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("bass-turnover-button").addEventListener("mouseover", function() {
        status.innerHTML = "Bass Turnover: This feature alters the range of adjustment provided by the bass control. The user can more precisely contour the tone controls to match their speaker system and room acoustics.";
    }, false);
    document.getElementById("bass-turnover-button").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("tone-defeat-button").addEventListener("mouseover", function() {
        status.innerHTML = "Tone Defeat: The tone defeat switch provides the ability to bypass the bass and treble circuitry. This assures flat frequency response and also simplifies the audio signal path, providing the best possible sound quality.";
    }, false);
    document.getElementById("tone-defeat-button").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("treble-turnover-button").addEventListener("mouseover", function() {
        status.innerHTML = "Treble Turnover: This feature alters the range of adjustment provided by the treble control. The user can more precisely contour the tone controls to match their speaker system and room acoustics.";
    }, false);
    document.getElementById("bass-turnover-button").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("speaker1").addEventListener("mouseover", function() {
        status.innerHTML = "One or two speaker systems can be conected to this unit. Depress the selector switch (1 or 2) corresponding to which system you want to listen to. (Currently only selector 1 works with this app)";
    }, false);
    document.getElementById("speaker1").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("speaker2").addEventListener("mouseover", function() {
        status.innerHTML = "Speaker 2: <font color='#FEC436'>This function is not applicable in this web app.</font>";
    }, false);
    document.getElementById("speaker2").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("tape-copy-button").addEventListener("mouseover", function() {
        status.innerHTML = "Tape Copy: <font color='#FEC436'>This function is not applicable in this web app.</font>";
    }, false);
    document.getElementById("tape-copy-button").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("subsonic-filter-button").addEventListener("mouseover", function() {
        status.innerHTML = "Subsonic Filter: <font color='#FEC436'>This function is not applicable in this web app.</font>";
    }, false);
    document.getElementById("subsonic-filter-button").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("loudness-button").addEventListener("mouseover", function() {
        status.innerHTML = "Loudness: When listening at a low level, the loudness switch will create<br> a more natural sound by emphasizing the low and high frequency ranges.";
    }, false);
    document.getElementById("loudness-button").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("audio-mode-button").addEventListener("mouseover", function() {
        status.innerHTML = "Audio Mode: This selector is used to combine the left and right channel music signals. Usually it is set in the stereo position. If the FM stereo broadcast station you are listening to is weak, set this mono.";
    }, false);
    document.getElementById("audio-mode-button").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("muting-button").addEventListener("mouseover", function() {
        status.innerHTML = "Muting: This switch eliminates irritating interstation noise when scanning for a station.";
    }, false);
    document.getElementById("muting-button").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("down-button").addEventListener("mouseover", function() {
        status.innerHTML = "Tuning Buttons: These buttons are used for tuning to the desired broadcast station.<br>When this button is pressed, the frequency will change to a lower frequency.";
    }, false);
    document.getElementById("down-button").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("up-button").addEventListener("mouseover", function() {
        status.innerHTML = "Tuning Buttons: These buttons are used for tuning to the desired broadcast station.<br>When this button is pressed, the frequency will change to a higher frequency.";
    }, false);
    document.getElementById("up-button").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("auto-button").addEventListener("mouseover", function() {
        status.innerHTML = "Auto Tuning Mode: When this button is illuminated, the unit will scan<br>up or down to the next station automatically.";
    }, false);
    document.getElementById("auto-button").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("manual-button").addEventListener("mouseover", function() {
        status.innerHTML = "Manual Tuning Mode: When this button is illuminated, the unit will scan<br>up or down to the next station in small steps incrementally.";
    }, false);
    document.getElementById("manual-button").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("memory-button").addEventListener("mouseover", function() {
        status.innerHTML = "Memory Button: This button is used to enter or change the preset broadcast stations. When this switch is pressed, it will illuminate in green for 5 seconds. This indicates the preset memory standby state.";
    }, false);
    document.getElementById("memory-button").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("volume-knob").addEventListener("mouseover", function() {
        status.innerHTML = "Volume Control Knob: This knob controls the sound level. Turning clockwise increases<br>the sound volume, and turning counterclockwise decreases it.";
    }, false);
    document.getElementById("volume-knob").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    function presetOver(i) {
        "use strict";
        return function () {
                status.innerHTML = "Preset Memory Button: Press any one of the eight PRESET MEMORY buttons while the MEMORY button is illuminated in green, and the frequency indicated by the STATION DISPLAY is memorized.<br><font color='#FEC436'>NOTE: Some internet stations only broadcast between certain hours an may appear not to play.<br>Also, depending on internet traffic some stations may take a moment to begin playing.</font>";
        };
    }

    function presetOut(i) {
        "use strict";
        return function () {
                status.innerHTML = "";
        };
    }

    for (i = 1; i < 9; i++) {
        var presetEle = document.getElementById("preset" + i);
        presetEle.addEventListener("mouseover", presetOver(i));
        presetEle.addEventListener("mouseout", presetOut(i));
    }

    document.getElementById("func-4").addEventListener("mouseover", function() {
        status.innerHTML = "FM Function Selector: Press this switch to listen to an FM broadcast";
    }, false);
    document.getElementById("func-4").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("func-3").addEventListener("mouseover", function() {
        status.innerHTML = "AM Function Selector: Press this switch to listen to an AM broadcast";
    }, false);
    document.getElementById("func-3").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("func-2").addEventListener("mouseover", function() {
        status.innerHTML = "AUX/CD Function Selector: <font color='#FEC436'>This function is not applicable in this application.</font>";
    }, false);
    document.getElementById("func-2").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("func-1").addEventListener("mouseover", function() {
        status.innerHTML = "Phono Function Selector: <font color='#FEC436'>This function is not applicable in this application.</font>";
    }, false);
    document.getElementById("func-1").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("tm-1").addEventListener("mouseover", function() {
        status.innerHTML = "Tape 1 Monitor Selector: <font color='#FEC436'>This function is not applicable in this application.</font>";
    }, false);
    document.getElementById("tm-1").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("tm-2").addEventListener("mouseover", function() {
        status.innerHTML = "Tape 2 Monitor Selector: <font color='#FEC436'>This function is not applicable in this application.</font>";
    }, false);
    document.getElementById("tm-2").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("tm-3").addEventListener("mouseover", function() {
        status.innerHTML = "Source Monitor Selector: Press this to listen to a program source other than a tape.";
    }, false);
    document.getElementById("tm-3").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("balance-knob").addEventListener("mouseover", function() {
        status.innerHTML = "Balance Control Knob: This knob is used to balance the left and right channels. Usually it is set to the center. Turn it to the left or right if it seems unbalanced from the speakers or headphones.";
    }, false);
    document.getElementById("balance-knob").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("treble-knob").addEventListener("mouseover", function() {
        status.innerHTML = "Treble Control Knob: This knob controls the high frequency sound level. Turn it clockwise to boost, or counterclockwise to reduce the high frequency level.";
    }, false);
    document.getElementById("treble-knob").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);

    document.getElementById("bass-knob").addEventListener("mouseover", function() {
        status.innerHTML = "Bass Control Knob: This knob controls the low frequency sound level. Turn it clockwise to boost, or counterclockwise to reduce the low frequency level.";
    }, false);
    document.getElementById("bass-knob").addEventListener("mouseout", function() {
        status.innerHTML = "";
    }, false);


}); // end of DOMContentLoaded