(function() {
    var audioData = {};

// Performs fingerprint as found in https://client.a.pxi.pub/PXmssU3ZQ0/main.min.js
//Sum of buffer values
    var p1 = new Promise(function (resolve, reject) {
        try {
            if (context = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 44100, 44100), !context) {
                audioData.pxi_output = 0;
            }

            // Create oscillator
            pxi_oscillator = context.createOscillator();
            pxi_oscillator.type = "triangle";
            pxi_oscillator.frequency.value = 1e4;

            // Create and configure compressor
            pxi_compressor = context.createDynamicsCompressor();
            pxi_compressor.threshold && (pxi_compressor.threshold.value = -50);
            pxi_compressor.knee && (pxi_compressor.knee.value = 40);
            pxi_compressor.ratio && (pxi_compressor.ratio.value = 12);
            pxi_compressor.reduction && (pxi_compressor.reduction.value = -20);
            pxi_compressor.attack && (pxi_compressor.attack.value = 0);
            pxi_compressor.release && (pxi_compressor.release.value = .25);

            // Connect nodes
            pxi_oscillator.connect(pxi_compressor);
            pxi_compressor.connect(context.destination);

            // Start audio processing
            pxi_oscillator.start(0);
            context.startRendering();
            context.oncomplete = function (evnt) {
                try {
                    audioData.pxi_output = 0;
                    var sha1 = CryptoJS.algo.SHA1.create();
                    for (var i = 0; i < evnt.renderedBuffer.length; i++) {
                        sha1.update(evnt.renderedBuffer.getChannelData(0)[i].toString());
                    }
                    hash = sha1.finalize();
                    audioData.pxi_full_buffer_hash = hash.toString(CryptoJS.enc.Hex);
                    for (var i = 4500; 5e3 > i; i++) {
                        audioData.pxi_output += Math.abs(evnt.renderedBuffer.getChannelData(0)[i]);
                    }
                    pxi_compressor.disconnect();
                    resolve();
                } catch(u){
                    audioData.pxi_output = 0;
                    resolve();
                }
            }
        } catch (u) {
            audioData.pxi_output = 0;
            resolve();
        }
    });

// End PXI fingerprint

// Performs fingerprint as found in some versions of http://metrics.nt.vc/metrics.js
    function a(a, b, c) {
        for (var d in b) "dopplerFactor" === d || "speedOfSound" === d || "currentTime" ===
        d || "number" !== typeof b[d] && "string" !== typeof b[d] || (a[(c ? c : "") + d] = b[d]);
        return a
    }

    var p2 = new Promise(function (resolve, reject) {
        try {
            var nt_vc_context = window.AudioContext || window.webkitAudioContext;
            if ("function" !== typeof nt_vc_context) {
                audioData.nt_vc_output = {
                    "ac-sampleRate": 0,
                    "ac-state": 0,
                    "ac-maxChannelCount": 0,
                    "ac-numberOfInputs": 0,
                    "ac-numberOfOutputs": 0,
                    "ac-channelCount": 0,
                    "ac-channelCountMode": 0,
                    "ac-channelInterpretation": 0,
                    "an-fftSize": 0,
                    "an-frequencyBinCount": 0,
                    "an-minDecibels": 0,
                    "an-maxDecibels": 0,
                    "an-smoothingTimeConstant": 0,
                    "an-numberOfInputs": 0,
                    "an-numberOfOutputs": 0,
                    "an-channelCount": 0,
                    "an-channelCountMode": 0,
                    "an-channelInterpretation": 0
                };
            } else {
                var f = new nt_vc_context,
                    d = f.createAnalyser();
                audioData.nt_vc_output = a({}, f, "ac-");
                audioData.nt_vc_output = a(audioData.nt_vc_output, f.destination, "ac-");
                audioData.nt_vc_output = a(audioData.nt_vc_output, f.listener, "ac-");
                audioData.nt_vc_output = a(audioData.nt_vc_output, d, "an-");
            }
        } catch (g) {
            audioData.nt_vc_output = 0
        }
        resolve();
    });

// Performs fingerprint as found in https://www.cdn-net.com/cc.js
    var cc_output = [];

    var p3 = new Promise(function (resolve, reject) {
        var audioCtxFunc = window.AudioContext || window.webkitAudioContext;
        if ("function" !== typeof audioCtxFunc) {
            cc_output = 0;
            resolve();
            return;
        }

        var audioCtx = new audioCtxFunc,
            oscillator = audioCtx.createOscillator(),
            analyser = audioCtx.createAnalyser(),
            gain = audioCtx.createGain(),
            scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);


        gain.gain.value = 0; // Disable volume
        oscillator.type = "triangle"; // Set oscillator to output triangle wave
        oscillator.connect(analyser); // Connect oscillator output to analyser input
        analyser.connect(scriptProcessor); // Connect analyser output to scriptProcessor input
        scriptProcessor.connect(gain); // Connect scriptProcessor output to gain input
        gain.connect(audioCtx.destination); // Connect gain output to audiocontext destination

        scriptProcessor.onaudioprocess = function (bins) {
            bins = new Float32Array(analyser.frequencyBinCount);
            analyser.getFloatFrequencyData(bins);
            for (var i = 0; i < bins.length; i = i + 1) {
                cc_output.push(bins[i]);
            }
            analyser.disconnect();
            scriptProcessor.disconnect();
            gain.disconnect();
            audioData.cc_output = cc_output.slice(0, 30);
            resolve();
        };

        oscillator.start(0);
    });

// Performs a hybrid of cc/pxi methods found above
    var hybrid_output = [];

    var p4 = new Promise(function (resolve, reject) {
        var audioCtxFunc = window.AudioContext || window.webkitAudioContext;
        if ("function" !== typeof audioCtxFunc) {
            hybrid_output = 0;
            resolve();
            return;
        }
        var audioCtx = new audioCtxFunc,
            oscillator = audioCtx.createOscillator(),
            analyser = audioCtx.createAnalyser(),
            gain = audioCtx.createGain(),
            scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);

        // Create and configure compressor
        compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold && (compressor.threshold.value = -50);
        compressor.knee && (compressor.knee.value = 40);
        compressor.ratio && (compressor.ratio.value = 12);
        compressor.reduction && (compressor.reduction.value = -20);
        compressor.attack && (compressor.attack.value = 0);
        compressor.release && (compressor.release.value = .25);

        gain.gain.value = 0; // Disable volume
        oscillator.type = "triangle"; // Set oscillator to output triangle wave
        oscillator.connect(compressor); // Connect oscillator output to dynamic compressor
        compressor.connect(analyser); // Connect compressor to analyser
        analyser.connect(scriptProcessor); // Connect analyser output to scriptProcessor input
        scriptProcessor.connect(gain); // Connect scriptProcessor output to gain input
        gain.connect(audioCtx.destination); // Connect gain output to audiocontext destination

        scriptProcessor.onaudioprocess = function (bins) {
            bins = new Float32Array(analyser.frequencyBinCount);
            analyser.getFloatFrequencyData(bins);
            for (var i = 0; i < bins.length; i = i + 1) {
                hybrid_output.push(bins[i]);
            }
            analyser.disconnect();
            scriptProcessor.disconnect();
            gain.disconnect();

            audioData.hybrid_output = hybrid_output.slice(0, 30);
            resolve();
        };

        oscillator.start(0);
    });


    api.register("audio", function () {

        return Promise.all([p1, p2, p3, p4]).then(function () {
            return {name: "audio", data: audioData};
        });

    });
})();
