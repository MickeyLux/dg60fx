// PWA Service Worker (externe Datei für Android-Kompatibilität)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch((err) => {
            console.warn('Service Worker registration failed:', err);
        });
    });
}

// Tab Navigation Logic
const tabAmpBtn = document.getElementById('tabAmpBtn');
const tabFxBtn = document.getElementById('tabFxBtn');
const tabAmpContent = document.getElementById('tabAmpContent');
const tabFxContent = document.getElementById('tabFxContent');

tabAmpBtn.addEventListener('click', () => {
    tabAmpContent.classList.remove('hidden');
    tabFxContent.classList.add('hidden');
    tabAmpBtn.className = "px-5 py-2.5 font-brand text-sm font-bold tracking-wider rounded-t-lg transition-all border-t-2 border-x border-red-700/60 bg-[#8c1c24] text-amber-100";
    tabFxBtn.className = "px-5 py-2.5 font-brand text-sm font-bold tracking-wider rounded-t-lg transition-all border-t-2 border-x border-transparent bg-neutral-900 text-neutral-400 hover:text-neutral-200";
});

tabFxBtn.addEventListener('click', () => {
    tabFxContent.classList.remove('hidden');
    tabAmpContent.classList.add('hidden');
    tabFxBtn.className = "px-5 py-2.5 font-brand text-sm font-bold tracking-wider rounded-t-lg transition-all border-t-2 border-x border-red-700/60 bg-[#8c1c24] text-amber-100";
    tabAmpBtn.className = "px-5 py-2.5 font-brand text-sm font-bold tracking-wider rounded-t-lg transition-all border-t-2 border-x border-transparent bg-neutral-900 text-neutral-400 hover:text-neutral-200";
});

// Knob Configuration
const knobsData = [
    { id: 'gain', label: 'Gain', initial: 5.0 },
    { id: 'master', label: 'Master', initial: 5.0 },
    { id: 'treble', label: 'Treble', initial: 5.0 },
    { id: 'middle', label: 'Middle', initial: 5.0 },
    { id: 'bass', label: 'Bass', initial: 5.0 },
    { id: 'presence', label: 'Presence', initial: 5.0 }
];

// Amp Select Modes
const ampModes = [
    { name: "Lead 1", angle: -105 },
    { name: "Lead 2", angle: -75 },
    { name: "Drive 1", angle: -45 },
    { name: "Drive 2", angle: -15 },
    { name: "Crunch 1", angle: 15 },
    { name: "Crunch 2", angle: 45 },
    { name: "Clean 1", angle: 75 },
    { name: "Clean 2", angle: 105 }
];

// Yamaha DG Series Classic Factory Presets with Updated Effects Layout
const defaultPresets = {
    "011: MS Drive 2": { 
        ampMode: "Drive 2", gain: 4.9, master: 7.1, treble: 4.0, middle: 4.8, bass: 3.7, presence: 5.0,
        compEnable: false, compVal: 2.0,
        modEnable: false, modType: "Chorus", modSpeed: 0.7, modDepth: 7.9, modParam3: 0.0, modParam4: 10.0,
        delayEnable: false, delayType: "Tape", delayTime: 5.8, delayFeedback: 6.0, delayLevel: 6.1,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 3.0,
        spSimEnable: false, spSimType: "Y12"
    },
    "01: 80s Arena Lead": {
        ampMode: "Lead 2", gain: 8.0, master: 6.0, treble: 7.5, middle: 5.0, bass: 6.5, presence: 7.0,
        compEnable: true, compVal: 5.0, modEnable: true, modType: "Chorus", modSpeed: 2.5, modDepth: 5.0, modParam3: 3.0, modParam4: 4.0,
        delayEnable: true, delayType: "Digital", delayTime: 3.5, delayFeedback: 5.0, delayLevel: 5.0,
        reverbEnable: true, reverbType: "Hall", reverbLevel: 4.5, spSimEnable: true, spSimType: "b42"
    },
    "02: Acoustic Simulation": {
        ampMode: "Clean 1", gain: 1.5, master: 7.0, treble: 8.5, middle: 3.5, bass: 4.0, presence: 6.0,
        compEnable: true, compVal: 7.0, modEnable: false, modType: "Chorus", modSpeed: 1.0, modDepth: 2.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: "Tape", delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 3.5, spSimEnable: true, spSimType: "Y12"
    },
    "03: Ambient Wash": {
        ampMode: "Clean 2", gain: 2.0, master: 5.0, treble: 6.0, middle: 6.0, bass: 6.0, presence: 5.0,
        compEnable: false, compVal: 3.0, modEnable: true, modType: "Chorus", modSpeed: 0.5, modDepth: 9.0, modParam3: 5.0, modParam4: 8.0,
        delayEnable: true, delayType: "Digital", delayTime: 8.0, delayFeedback: 8.5, delayLevel: 7.5,
        reverbEnable: true, reverbType: "Hall", reverbLevel: 8.0, spSimEnable: true, spSimType: "b22"
    },
    "04: Blues Overdrive": {
        ampMode: "Drive 1", gain: 5.5, master: 6.0, treble: 6.0, middle: 7.0, bass: 6.0, presence: 5.0,
        compEnable: false, compVal: 2.0, modEnable: false, modType: "Tremolo", modSpeed: 4.0, modDepth: 4.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: "Tape", delayTime: 3.0, delayFeedback: 3.0, delayLevel: 3.0,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 4.0, spSimEnable: false, spSimType: "Y12"
    },
    "05: British Invasion": {
        ampMode: "Crunch 2", gain: 6.0, master: 6.5, treble: 7.0, middle: 6.5, bass: 5.5, presence: 6.0,
        compEnable: false, compVal: 3.0, modEnable: false, modType: "Phaser", modSpeed: 3.0, modDepth: 4.0, modParam3: 2.0, modParam4: 5.0,
        delayEnable: false, delayType: "Tape", delayTime: 2.5, delayFeedback: 3.0, delayLevel: 3.0,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 3.0, spSimEnable: true, spSimType: "b22"
    },
    "06: Classic Rock Rhythm": {
        ampMode: "Crunch 1", gain: 5.0, master: 7.0, treble: 6.5, middle: 5.5, bass: 6.0, presence: 5.5,
        compEnable: false, compVal: 2.0, modEnable: false, modType: "Chorus", modSpeed: 1.0, modDepth: 3.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: "Tape", delayTime: 3.0, delayFeedback: 3.0, delayLevel: 3.0,
        reverbEnable: true, reverbType: "Plate", reverbLevel: 3.0, spSimEnable: false, spSimType: "Y12"
    },
    "07: Clean Jazz Box": {
        ampMode: "Clean 1", gain: 2.0, master: 7.5, treble: 5.0, middle: 6.0, bass: 7.0, presence: 4.0,
        compEnable: true, compVal: 4.0, modEnable: false, modType: "Chorus", modSpeed: 1.0, modDepth: 2.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: "Digital", delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: "Hall", reverbLevel: 3.5, spSimEnable: true, spSimType: "b22"
    },
    "08: Country Chicken Pickin": {
        ampMode: "Clean 1", gain: 3.0, master: 6.5, treble: 8.0, middle: 4.5, bass: 5.0, presence: 7.0,
        compEnable: true, compVal: 8.0, modEnable: false, modType: "Tremolo", modSpeed: 5.0, modDepth: 5.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: true, delayType: "Digital", delayTime: 1.5, delayFeedback: 2.0, delayLevel: 3.0,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 2.5, spSimEnable: false, spSimType: "Y12"
    },
    "09: Crunch Master": {
        ampMode: "Crunch 2", gain: 7.0, master: 5.5, treble: 7.0, middle: 6.0, bass: 6.5, presence: 6.5,
        compEnable: false, compVal: 4.0, modEnable: false, modType: "Flanger", modSpeed: 4.0, modDepth: 4.0, modParam3: 3.0, modParam4: 4.0,
        delayEnable: false, delayType: "Tape", delayTime: 3.0, delayFeedback: 3.0, delayLevel: 3.0,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 3.0, spSimEnable: true, spSimType: "b42"
    },
    "10: Dark Ambient": {
        ampMode: "Clean 2", gain: 1.8, master: 5.0, treble: 4.0, middle: 5.0, bass: 8.0, presence: 3.0,
        compEnable: true, compVal: 6.0, modEnable: true, modType: "Tremolo", modSpeed: 1.5, modDepth: 7.0, modParam3: 5.0, modParam4: 6.0,
        delayEnable: true, delayType: "Tape", delayTime: 9.0, delayFeedback: 9.0, delayLevel: 8.0,
        reverbEnable: true, reverbType: "Hall", reverbLevel: 9.0, spSimEnable: true, spSimType: "b22"
    },
    "12: Desert Stoner": {
        ampMode: "Drive 1", gain: 7.5, master: 6.0, treble: 6.0, middle: 8.0, bass: 8.5, presence: 5.5,
        compEnable: false, compVal: 2.0, modEnable: false, modType: "Phaser", modSpeed: 2.0, modDepth: 5.0, modParam3: 4.0, modParam4: 5.0,
        delayEnable: false, delayType: "Tape", delayTime: 4.0, delayFeedback: 4.0, delayLevel: 4.0,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 2.0, spSimEnable: false, spSimType: "Y12"
    },
    "13: Djugg Distortion": {
        ampMode: "Lead 2", gain: 9.5, master: 4.5, treble: 8.5, middle: 3.0, bass: 9.0, presence: 8.5,
        compEnable: true, compVal: 5.0, modEnable: false, modType: "Chorus", modSpeed: 1.0, modDepth: 1.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: "Digital", delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: false, reverbType: "Spring", reverbLevel: 0.0, spSimEnable: true, spSimType: "b42"
    },
    "14: Doom Metal": {
        ampMode: "Drive 2", gain: 9.0, master: 5.0, treble: 5.0, middle: 8.5, bass: 9.5, presence: 6.0,
        compEnable: false, compVal: 3.0, modEnable: false, modType: "Tremolo", modSpeed: 3.0, modDepth: 3.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: true, delayType: "Tape", delayTime: 5.0, delayFeedback: 6.0, delayLevel: 5.0,
        reverbEnable: true, reverbType: "Hall", reverbLevel: 5.0, spSimEnable: true, spSimType: "b42"
    },
    "15: Dreamy Chorus": {
        ampMode: "Clean 2", gain: 2.2, master: 6.5, treble: 6.5, middle: 5.5, bass: 5.5, presence: 6.0,
        compEnable: true, compVal: 4.0, modEnable: true, modType: "Chorus", modSpeed: 2.0, modDepth: 7.5, modParam3: 4.0, modParam4: 6.0,
        delayEnable: true, delayType: "Digital", delayTime: 4.0, delayFeedback: 4.0, delayLevel: 4.0,
        reverbEnable: true, reverbType: "Hall", reverbLevel: 5.0, spSimEnable: true, spSimType: "b22"
    },
    "16: Dry Studio Lead": {
        ampMode: "Lead 1", gain: 7.5, master: 5.5, treble: 7.0, middle: 6.0, bass: 6.0, presence: 7.0,
        compEnable: true, compVal: 5.0, modEnable: false, modType: "Chorus", modSpeed: 1.0, modDepth: 1.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: "Digital", delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: false, reverbType: "Plate", reverbLevel: 1.0, spSimEnable: true, spSimType: "Y12"
    },
    "17: Duo Reverb Clean": {
        ampMode: "Clean 1", gain: 3.0, master: 6.0, treble: 7.0, middle: 5.0, bass: 6.0, presence: 6.5,
        compEnable: false, compVal: 2.0, modEnable: false, modType: "Tremolo", modSpeed: 4.0, modDepth: 4.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: "Tape", delayTime: 3.0, delayFeedback: 3.0, delayLevel: 3.0,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 6.0, spSimEnable: true, spSimType: "b22"
    },
    "18: Dynamic Fusion": {
        ampMode: "Lead 1", gain: 6.5, master: 6.0, treble: 6.5, middle: 7.0, bass: 5.5, presence: 6.5,
        compEnable: true, compVal: 4.0, modEnable: false, modType: "Chorus", modSpeed: 3.0, modDepth: 4.0, modParam3: 2.0, modParam4: 3.0,
        delayEnable: true, delayType: "Digital", delayTime: 3.0, delayFeedback: 4.0, delayLevel: 4.0,
        reverbEnable: true, reverbType: "Plate", reverbLevel: 4.0, spSimEnable: true, spSimType: "b42"
    },
    "19: Ethereal Delay": {
        ampMode: "Clean 2", gain: 2.5, master: 6.0, treble: 6.0, middle: 5.0, bass: 6.0, presence: 5.5,
        compEnable: false, compVal: 2.0, modEnable: true, modType: "Chorus", modSpeed: 1.5, modDepth: 5.0, modParam3: 3.0, modParam4: 5.0,
        delayEnable: true, delayType: "Digital", delayTime: 7.5, delayFeedback: 7.5, delayLevel: 7.0,
        reverbEnable: true, reverbType: "Hall", reverbLevel: 7.0, spSimEnable: true, spSimType: "b22"
    },
    "20: Expressive Solo": {
        ampMode: "Lead 2", gain: 8.2, master: 5.0, treble: 7.5, middle: 5.5, bass: 6.5, presence: 7.5,
        compEnable: true, compVal: 5.0, modEnable: false, modType: "Flanger", modSpeed: 2.0, modDepth: 3.0, modParam3: 2.0, modParam4: 3.0,
        delayEnable: true, delayType: "Digital", delayTime: 3.5, delayFeedback: 4.5, delayLevel: 4.5,
        reverbEnable: true, reverbType: "Plate", reverbLevel: 4.5, spSimEnable: true, spSimType: "b42"
    },
    "21: Fat Blues": {
        ampMode: "Drive 1", gain: 5.8, master: 6.2, treble: 5.0, middle: 7.5, bass: 7.0, presence: 4.5,
        compEnable: false, compVal: 3.0, modEnable: false, modType: "Tremolo", modSpeed: 5.0, modDepth: 4.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: "Tape", delayTime: 2.5, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 4.5, spSimEnable: false, spSimType: "Y12"
    },
    "22: Flanger Space": {
        ampMode: "Crunch 2", gain: 6.5, master: 5.5, treble: 7.0, middle: 5.0, bass: 6.0, presence: 6.0,
        compEnable: false, compVal: 2.0, modEnable: true, modType: "Flanger", modSpeed: 3.5, modDepth: 8.0, modParam3: 6.0, modParam4: 7.0,
        delayEnable: true, delayType: "Tape", delayTime: 4.0, delayFeedback: 5.0, delayLevel: 5.0,
        reverbEnable: true, reverbType: "Hall", reverbLevel: 4.0, spSimEnable: true, spSimType: "b42"
    },
    "23: Funk Clean": {
        ampMode: "Clean 1", gain: 2.0, master: 7.0, treble: 7.5, middle: 4.5, bass: 5.0, presence: 7.0,
        compEnable: true, compVal: 7.5, modEnable: false, modType: "Chorus", modSpeed: 1.0, modDepth: 2.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: "Digital", delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: false, reverbType: "Spring", reverbLevel: 1.0, spSimEnable: true, spSimType: "Y12"
    },
    "24: Garage Punk": {
        ampMode: "Crunch 1", gain: 7.0, master: 7.5, treble: 8.0, middle: 4.0, bass: 5.0, presence: 8.0,
        compEnable: false, compVal: 2.0, modEnable: false, modType: "Tremolo", modSpeed: 6.0, modDepth: 3.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: "Tape", delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 2.0, spSimEnable: false, spSimType: "Y12"
    },
    "25: Glassy Clean": {
        ampMode: "Clean 1", gain: 2.2, master: 7.0, treble: 8.0, middle: 5.0, bass: 5.0, presence: 8.0,
        compEnable: true, compVal: 4.0, modEnable: false, modType: "Chorus", modSpeed: 1.0, modDepth: 2.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: "Digital", delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 4.0, spSimEnable: true, spSimType: "b22"
    },
    "26: Grunge Rock": {
        ampMode: "Drive 2", gain: 8.0, master: 6.0, treble: 6.5, middle: 6.0, bass: 7.0, presence: 6.5,
        compEnable: false, compVal: 3.0, modEnable: false, modType: "Chorus", modSpeed: 2.0, modDepth: 3.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: true, delayType: "Tape", delayTime: 3.5, delayFeedback: 4.0, delayLevel: 4.0,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 3.5, spSimEnable: true, spSimType: "b42"
    },
    "27: Heavy Riffing": {
        ampMode: "Lead 1", gain: 8.8, master: 5.5, treble: 7.5, middle: 4.5, bass: 8.0, presence: 7.5,
        compEnable: true, compVal: 5.0, modEnable: false, modType: "Flanger", modSpeed: 1.0, modDepth: 1.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: "Digital", delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: "Plate", reverbLevel: 2.5, spSimEnable: true, spSimType: "b42"
    },
    "28: Indie Rock Chords": {
        ampMode: "Crunch 2", gain: 5.5, master: 6.5, treble: 6.5, middle: 6.0, bass: 6.0, presence: 6.0,
        compEnable: false, compVal: 3.0, modEnable: true, modType: "Chorus", modSpeed: 2.5, modDepth: 4.0, modParam3: 3.0, modParam4: 4.0,
        delayEnable: true, delayType: "Digital", delayTime: 3.0, delayFeedback: 3.5, delayLevel: 3.5,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 3.5, spSimEnable: false, spSimType: "Y12"
    },
    "29: Jam Band Tone": {
        ampMode: "Drive 1", gain: 4.5, master: 6.5, treble: 6.0, middle: 6.5, bass: 6.5, presence: 5.0,
        compEnable: false, compVal: 2.0, modEnable: true, modType: "Tremolo", modSpeed: 4.5, modDepth: 5.0, modParam3: 5.0, modParam4: 5.0,
        delayEnable: false, delayType: "Tape", delayTime: 3.0, delayFeedback: 3.0, delayLevel: 3.0,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 4.0, spSimEnable: false, spSimType: "Y12"
    },
    "30: Jazz Fusion Lead": {
        ampMode: "Lead 1", gain: 6.8, master: 6.0, treble: 6.0, middle: 7.5, bass: 6.0, presence: 5.5,
        compEnable: true, compVal: 5.0, modEnable: false, modType: "Chorus", modSpeed: 2.0, modDepth: 3.0, modParam3: 2.0, modParam4: 3.0,
        delayEnable: true, delayType: "Digital", delayTime: 3.2, delayFeedback: 4.5, delayLevel: 4.0,
        reverbEnable: true, reverbType: "Plate", reverbLevel: 4.0, spSimEnable: true, spSimType: "b42"
    },
    "31: Lo-Fi Tape Delay": {
        ampMode: "Crunch 1", gain: 4.0, master: 6.0, treble: 5.5, middle: 6.0, bass: 5.5, presence: 4.5,
        compEnable: false, compVal: 2.0, modEnable: false, modType: "Chorus", modSpeed: 1.0, modDepth: 2.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: true, delayType: "Tape", delayTime: 5.5, delayFeedback: 6.5, delayLevel: 6.0,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 3.0, spSimEnable: true, spSimType: "b22"
    },
    "32: Massive Wall of Sound": {
        ampMode: "Lead 2", gain: 9.0, master: 5.0, treble: 7.0, middle: 5.0, bass: 8.5, presence: 7.0,
        compEnable: true, compVal: 6.0, modEnable: true, modType: "Chorus", modSpeed: 3.0, modDepth: 6.0, modParam3: 4.0, modParam4: 5.0,
        delayEnable: true, delayType: "Digital", delayTime: 4.5, delayFeedback: 6.0, delayLevel: 6.0,
        reverbEnable: true, reverbType: "Hall", reverbLevel: 6.5, spSimEnable: true, spSimType: "b42"
    },
    "33: Melodic Metal": {
        ampMode: "Lead 1", gain: 8.5, master: 5.5, treble: 8.0, middle: 4.5, bass: 7.5, presence: 8.0,
        compEnable: true, compVal: 4.0, modEnable: false, modType: "Chorus", modSpeed: 1.0, modDepth: 2.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: true, delayType: "Digital", delayTime: 2.8, delayFeedback: 4.0, delayLevel: 4.0,
        reverbEnable: true, reverbType: "Plate", reverbLevel: 3.5, spSimEnable: true, spSimType: "b42"
    },
    "34: Modern High Gain": {
        ampMode: "Lead 2", gain: 9.2, master: 5.0, treble: 8.0, middle: 4.0, bass: 8.5, presence: 8.5,
        compEnable: true, compVal: 5.0, modEnable: false, modType: "Flanger", modSpeed: 1.0, modDepth: 1.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: "Digital", delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: "Plate", reverbLevel: 2.5, spSimEnable: true, spSimType: "b42"
    },
    "35: Neo Soul Chords": {
        ampMode: "Clean 2", gain: 2.5, master: 6.5, treble: 6.0, middle: 6.0, bass: 6.0, presence: 5.5,
        compEnable: true, compVal: 5.0, modEnable: true, modType: "Chorus", modSpeed: 2.0, modDepth: 5.0, modParam3: 3.0, modParam4: 4.0,
        delayEnable: true, delayType: "Digital", delayTime: 3.5, delayFeedback: 3.5, delayLevel: 3.5,
        reverbEnable: true, reverbType: "Plate", reverbLevel: 4.0, spSimEnable: true, spSimType: "b22"
    },
    "36: Overdriven Blues": {
        ampMode: "Drive 2", gain: 6.2, master: 5.8, treble: 6.0, middle: 7.0, bass: 6.0, presence: 5.0,
        compEnable: false, compVal: 3.0, modEnable: false, modType: "Tremolo", modSpeed: 4.0, modDepth: 4.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: "Tape", delayTime: 3.0, delayFeedback: 2.5, delayLevel: 2.5,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 4.0, spSimEnable: false, spSimType: "Y12"
    },
    "37: Pop Ballad Clean": {
        ampMode: "Clean 1", gain: 2.0, master: 6.8, treble: 6.5, middle: 5.5, bass: 5.5, presence: 6.0,
        compEnable: true, compVal: 4.0, modEnable: false, modType: "Chorus", modSpeed: 1.0, modDepth: 2.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: true, delayType: "Digital", delayTime: 4.0, delayFeedback: 4.5, delayLevel: 4.5,
        reverbEnable: true, reverbType: "Hall", reverbLevel: 5.5, spSimEnable: true, spSimType: "b22"
    },
    "38: Power Chord Crunch": {
        ampMode: "Crunch 2", gain: 6.8, master: 6.5, treble: 7.0, middle: 5.5, bass: 6.5, presence: 6.0,
        compEnable: false, compVal: 2.0, modEnable: false, modType: "Chorus", modSpeed: 1.0, modDepth: 1.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: "Tape", delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 3.0, spSimEnable: true, spSimType: "Y12"
    },
    "39: Psychedelic Vibe": {
        ampMode: "Crunch 1", gain: 5.0, master: 6.0, treble: 5.5, middle: 6.5, bass: 6.0, presence: 5.0,
        compEnable: false, compVal: 3.0, modEnable: true, modType: "Rotary", modSpeed: 6.5, modDepth: 7.0, modParam3: 5.0, modParam4: 6.0,
        delayEnable: true, delayType: "Tape", delayTime: 4.5, delayFeedback: 5.0, delayLevel: 4.5,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 5.0, spSimEnable: false, spSimType: "Y12"
    },
    "40: Punchy Drive": {
        ampMode: "Drive 1", gain: 6.0, master: 6.0, treble: 6.5, middle: 6.5, bass: 6.0, presence: 6.0,
        compEnable: true, compVal: 5.0, modEnable: false, modType: "Chorus", modSpeed: 1.0, modDepth: 1.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: "Tape", delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 3.0, spSimEnable: true, spSimType: "Y12"
    },
    "41: Radio Voice Effect": {
        ampMode: "Clean 1", gain: 4.0, master: 5.0, treble: 9.0, middle: 2.0, bass: 2.0, presence: 9.0,
        compEnable: true, compVal: 8.0, modEnable: false, modType: "Chorus", modSpeed: 1.0, modDepth: 1.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: "Digital", delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: false, reverbType: "Spring", reverbLevel: 0.0, spSimEnable: true, spSimType: "Y12"
    },
    "42: Reggae Skank": {
        ampMode: "Clean 1", gain: 2.0, master: 7.0, treble: 7.0, middle: 5.0, bass: 5.5, presence: 6.0,
        compEnable: true, compVal: 5.0, modEnable: false, modType: "Chorus", modSpeed: 1.0, modDepth: 1.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: true, delayType: "Digital", delayTime: 2.5, delayFeedback: 3.0, delayLevel: 3.0,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 3.5, spSimEnable: true, spSimType: "b22"
    },
    "43: Rockabilly Slapback": {
        ampMode: "Crunch 1", gain: 4.5, master: 6.5, treble: 7.0, middle: 6.0, bass: 5.5, presence: 6.5,
        compEnable: false, compVal: 2.0, modEnable: false, modType: "Chorus", modSpeed: 1.0, modDepth: 1.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: true, delayType: "Tape", delayTime: 1.2, delayFeedback: 1.5, delayLevel: 4.0,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 4.5, spSimEnable: false, spSimType: "Y12"
    },
    "44: Rotary Organ Sim": {
        ampMode: "Clean 2", gain: 3.0, master: 6.0, treble: 6.0, middle: 6.0, bass: 6.0, presence: 5.0,
        compEnable: false, compVal: 2.0, modEnable: true, modType: "Rotary", modSpeed: 7.0, modDepth: 8.0, modParam3: 5.0, modParam4: 7.0,
        delayEnable: false, delayType: "Digital", delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 3.0, spSimEnable: true, spSimType: "b22"
    },
    "45: Shoegaze Reverb": {
        ampMode: "Drive 1", gain: 6.5, master: 5.5, treble: 6.0, middle: 6.0, bass: 6.5, presence: 5.5,
        compEnable: true, compVal: 4.0, modEnable: true, modType: "Chorus", modSpeed: 3.0, modDepth: 6.0, modParam3: 4.0, modParam4: 5.0,
        delayEnable: true, delayType: "Digital", delayTime: 5.0, delayFeedback: 6.0, delayLevel: 6.0,
        reverbEnable: true, reverbType: "Hall", reverbLevel: 9.5, spSimEnable: true, spSimType: "b42"
    },
    "46: Smooth Jazz": {
        ampMode: "Clean 1", gain: 2.0, master: 7.0, treble: 5.0, middle: 6.5, bass: 6.5, presence: 4.5,
        compEnable: true, compVal: 4.0, modEnable: false, modType: "Chorus", modSpeed: 1.0, modDepth: 2.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: "Digital", delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: "Hall", reverbLevel: 4.0, spSimEnable: true, spSimType: "b22"
    },
    "47: Sparkle Clean": {
        ampMode: "Clean 1", gain: 2.2, master: 7.0, treble: 8.0, middle: 5.0, bass: 5.0, presence: 7.5,
        compEnable: true, compVal: 4.0, modEnable: false, modType: "Chorus", modSpeed: 1.0, modDepth: 2.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: "Digital", delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 4.0, spSimEnable: true, spSimType: "b22"
    },
    "48: Stadium Rock": {
        ampMode: "Lead 1", gain: 7.8, master: 6.0, treble: 7.0, middle: 5.5, bass: 6.5, presence: 7.0,
        compEnable: true, compVal: 4.0, modEnable: false, modType: "Chorus", modSpeed: 2.0, modDepth: 3.0, modParam3: 2.0, modParam4: 3.0,
        delayEnable: true, delayType: "Digital", delayTime: 4.0, delayFeedback: 5.0, delayLevel: 5.0,
        reverbEnable: true, reverbType: "Hall", reverbLevel: 6.0, spSimEnable: true, spSimType: "b42"
    },
    "49: Thrash Metal": {
        ampMode: "Lead 2", gain: 9.0, master: 5.0, treble: 8.5, middle: 3.5, bass: 8.0, presence: 9.0,
        compEnable: true, compVal: 5.0, modEnable: false, modType: "Chorus", modSpeed: 1.0, modDepth: 1.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: "Digital", delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: "Plate", reverbLevel: 2.0, spSimEnable: true, spSimType: "b42"
    },
    "50: Vintage Tremolo": {
        ampMode: "Drive 1", gain: 5.0, master: 6.0, treble: 6.0, middle: 6.5, bass: 6.0, presence: 5.0,
        compEnable: false, compVal: 2.0, modEnable: true, modType: "Tremolo", modSpeed: 6.5, modDepth: 7.5, modParam3: 6.0, modParam4: 7.0,
        delayEnable: false, delayType: "Tape", delayTime: 3.0, delayFeedback: 2.5, delayLevel: 2.5,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 4.5, spSimEnable: false, spSimType: "Y12"
    },
    "DG Clean Chorus": { 
        ampMode: "Clean 1", gain: 2.5, master: 6.5, treble: 6.5, middle: 5.0, bass: 5.5, presence: 6.0,
        compEnable: true, compVal: 4.0,
        modEnable: true, modType: "Chorus", modSpeed: 3.5, modDepth: 6.5, modParam3: 4.5, modParam4: 3.0,
        delayEnable: true, delayType: "Digital", delayTime: 2.0, delayFeedback: 4.0, delayLevel: 3.0,
        reverbEnable: true, reverbType: "Hall", reverbLevel: 4.0,
        spSimEnable: true, spSimType: "b22"
    },
    "Solo Lead Drive": { 
        ampMode: "Lead 1", gain: 8.5, master: 4.0, treble: 8.0, middle: 4.0, bass: 7.0, presence: 7.5,
        compEnable: true, compVal: 6.0,
        modEnable: false, modType: "Flanger", modSpeed: 4.0, modDepth: 6.0, modParam3: 5.0, modParam4: 4.0,
        delayEnable: true, delayType: "Digital", delayTime: 2.5, delayFeedback: 4.5, delayLevel: 4.0,
        reverbEnable: true, reverbType: "Plate", reverbLevel: 3.5,
        spSimEnable: true, spSimType: "b42"
    },
    "Vintage Blues": { 
        ampMode: "Drive 2", gain: 5.0, master: 5.5, treble: 5.5, middle: 7.5, bass: 6.0, presence: 4.5,
        compEnable: false, compVal: 5.0,
        modEnable: true, modType: "Tremolo", modSpeed: 6.0, modDepth: 5.5, modParam3: 7.0, modParam4: 5.0,
        delayEnable: false, delayType: "Tape", delayTime: 3.0, delayFeedback: 2.5, delayLevel: 2.0,
        reverbEnable: true, reverbType: "Spring", reverbLevel: 4.5,
        spSimEnable: false, spSimType: "Y12"
    }
};

const minAngle = 210;
const maxAngle = 510;
const container = document.getElementById('controlsContainer');
const knobRefs = {};

// --- Amp Select Switch Handler ---
const ampModeSelect = document.getElementById('ampModeSelect');
const ampPointerGroup = document.getElementById('ampPointerGroup');
const ampSelectText = document.getElementById('ampSelectText');
const ampSelectSvg = document.getElementById('ampSelectSvg');
let currentAmpIndex = 7;

function setAmpModeByIndex(index, animated = false) {
    index = Math.max(0, Math.min(ampModes.length - 1, index));
    currentAmpIndex = index;
    const mode = ampModes[index];

    ampPointerGroup.classList.remove('motorized-moving');
    ampPointerGroup.style.transform = `rotate(${mode.angle}deg)`;
    if (ampSelectText) {
        ampSelectText.textContent = mode.name;
    }
    if (ampModeSelect) ampModeSelect.value = mode.angle;
}

function setAmpModeByName(name, animated = false) {
    const index = ampModes.findIndex(m => m.name.toLowerCase() === (name || '').toLowerCase());
    if (index !== -1) {
        setAmpModeByIndex(index, false);
    }
}

if (ampModeSelect) {
    ampModeSelect.addEventListener('change', () => {
        const selectedAngle = parseInt(ampModeSelect.value);
        const index = ampModes.findIndex(m => m.angle === selectedAngle);
        if (index !== -1) setAmpModeByIndex(index, false);
    });
}

let ampDragging = false;
let ampStartY = 0;
let ampStartIndex = 0;

if (ampSelectSvg) {
    ampSelectSvg.addEventListener('mousedown', (e) => {
        ampDragging = true;
        ampStartY = e.clientY;
        ampStartIndex = currentAmpIndex;
        document.addEventListener('mousemove', onAmpDrag);
        document.addEventListener('mouseup', onAmpDragEnd);
    });

    ampSelectSvg.addEventListener('touchstart', (e) => {
        ampDragging = true;
        ampStartY = e.touches[0].clientY;
        ampStartIndex = currentAmpIndex;
        document.addEventListener('touchmove', onAmpDrag);
        document.addEventListener('touchend', onAmpDragEnd);
    }, { passive: true });
}

function onAmpDrag(e) {
    if (!ampDragging) return;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const deltaY = ampStartY - clientY;
    const stepChange = Math.round(deltaY / 25);
    setAmpModeByIndex(ampStartIndex + stepChange, false);
}

function onAmpDragEnd() {
    ampDragging = false;
    document.removeEventListener('mousemove', onAmpDrag);
    document.removeEventListener('mouseup', onAmpDragEnd);
    document.removeEventListener('touchmove', onAmpDrag);
    document.removeEventListener('touchend', onAmpDragEnd);
}

if (ampSelectSvg) {
    ampSelectSvg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const change = e.deltaY < 0 ? -1 : 1;
        setAmpModeByIndex(currentAmpIndex + change, false);
    }, { passive: false });
}


// SVG Vintage Knob Builder
function createKnobHTML(knob) {
    return `
    <div class="flex flex-col items-center" id="card-${knob.id}">
        <h3 class="text-xs font-black uppercase tracking-widest text-amber-100 mb-1 font-brand">${knob.label}</h3>
        
        <svg class="knob-svg w-32 h-32 select-none" viewBox="110 110 292 292" data-id="${knob.id}">
            <ellipse cx="256" cy="256" rx="70" ry="70" style="fill: #303030; stroke: #202020; stroke-width: 4px;"/>
            <ellipse cx="256" cy="256" rx="45" ry="45" style="fill: #060606; stroke: #000000; stroke-width: 3px;"/>
            
            <g transform="matrix(0.946044, 0, 0, 0.946044, 14.208778, 17.450031)" fill="#fff8e7">
                <text style="white-space: pre; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold;" x="187.077" y="368.902">0</text>
                <text style="white-space: pre; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold;" x="142.441" y="320.985">1</text>
                <text style="white-space: pre; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold;" x="128.000" y="263.746">2</text>
                <text style="white-space: pre; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold;" x="142.441" y="208.082">3</text>
                <text style="white-space: pre; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold;" x="181.826" y="163.446">4</text>
                <text style="white-space: pre; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold;" x="248.210" y="145.723">5</text>
                <text style="white-space: pre; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold;" x="311.795" y="163.446">6</text>
                <text style="white-space: pre; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold;" x="354.461" y="207.425">7</text>
                <text style="white-space: pre; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold;" x="367.589" y="263.746">8</text>
                <text style="white-space: pre; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold;" x="355.118" y="322.297">9</text>
                <text style="white-space: pre; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold;" x="300.636" y="368.902">10</text>
            </g>
            
            <g class="pointerGroup" style="transform: rotate(210deg); transform-origin: 256px 256px;">
                <path d="M 249.387 189.974 Q 256 137.152 262.613 189.974 L 275.84 295.617 Q 282.453 348.438 269.227 348.438 L 242.773 348.438 Q 229.547 348.438 236.16 295.617 Z" style="stroke: #555555; fill: #080808; stroke-width: 3px; stroke-linejoin: bevel; stroke-linecap: round;"/>
                <path style="fill: none; stroke: #fff8e7; stroke-width: 6px; stroke-linecap: round;" d="M 256 162.01 L 256 204.425"/>
            </g>
        </svg>

        <div class="mt-2 flex flex-col items-center">
            <input type="number" class="valueInput w-20 text-center bg-black text-amber-200 font-mono text-sm py-1 px-2 rounded border border-red-800 focus:outline-none focus:border-amber-500" 
                    value="${knob.initial.toFixed(1)}" min="0" max="10" step="0.1">
        </div>
    </div>
    `;
}

if (container) {
    container.innerHTML = knobsData.map(createKnobHTML).join('');
}

// Wire Continuous Potentiometers
knobsData.forEach(knob => {
    const card = document.getElementById(`card-${knob.id}`);
    if (!card) return;
    const input = card.querySelector('.valueInput');
    const pointer = card.querySelector('.pointerGroup');
    const svgText = card.querySelector('.svgValueText');
    const svg = card.querySelector('.knob-svg');
    let motorAnimationTimer = null;

    function updateGauge(val) {
        val = Math.max(0, Math.min(10, val));
        const angle = minAngle + (val / 10) * (maxAngle - minAngle);
        pointer.style.transform = `rotate(${angle}deg)`;
    }

    function setValue(val) {
        val = Math.max(0, Math.min(10, val));
        pointer.classList.remove('motorized-moving');
        input.value = val.toFixed(1);
        updateGauge(val);
    }

    function setMotorizedValue(targetVal, duration = 650) {
        targetVal = Math.max(0, Math.min(10, targetVal));
        const startVal = parseFloat(input.value) || 0;
        const startTime = performance.now();

        pointer.classList.add('motorized-moving');
        const targetAngle = minAngle + (targetVal / 10) * (maxAngle - minAngle);
        pointer.style.transform = `rotate(${targetAngle}deg)`;

        if (motorAnimationTimer) cancelAnimationFrame(motorAnimationTimer);

        function animateMotorStep(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = startVal + (targetVal - startVal) * easeProgress;

            input.value = currentVal.toFixed(1);
            if (svgText) {
                svgText.textContent = currentVal.toFixed(1);
            }

            if (progress < 1) {
                motorAnimationTimer = requestAnimationFrame(animateMotorStep);
            } else {
                pointer.classList.remove('motorized-moving');
                setValue(targetVal);
            }
        }

        motorAnimationTimer = requestAnimationFrame(animateMotorStep);
    }

    function getValue() {
        return parseFloat(input.value) || 0;
    }

    knobRefs[knob.id] = { setValue, setMotorizedValue, getValue };

    input.addEventListener('input', () => {
        let val = parseFloat(input.value);
        if (!isNaN(val)) updateGauge(val);
    });

    input.addEventListener('blur', () => {
        let val = parseFloat(input.value);
        if (isNaN(val)) val = 0;
        setValue(val);
    });

    let isDragging = false;
    let startY = 0;
    let startVal = 0;

    function onStart(e) {
        isDragging = true;
        startY = e.clientY || (e.touches && e.touches[0].clientY);
        startVal = getValue();
        pointer.classList.remove('motorized-moving');
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchmove', onMove);
        document.addEventListener('touchend', onEnd);
    }

    function onMove(e) {
        if (!isDragging) return;
        const currentY = e.clientY || (e.touches && e.touches[0].clientY);
        const deltaY = startY - currentY;
        const sensitivity = 0.05;
        let newVal = startVal + (deltaY * sensitivity);
        setValue(newVal);
    }

    function onEnd() {
        isDragging = false;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
    }

    svg.addEventListener('mousedown', onStart);
    svg.addEventListener('touchstart', onStart, { passive: true });

    svg.addEventListener('wheel', (e) => {
        e.preventDefault();
        let currentVal = getValue();
        let change = e.deltaY < 0 ? 0.1 : -0.1;
        setValue(currentVal + change);
    }, { passive: false });

    setValue(knob.initial);
});

// FX Tab UI Elements Bindings
const fxCompEnable = document.getElementById('fxCompEnable');
const fxComp = document.getElementById('fxComp');
const fxCompVal = document.getElementById('fxCompVal');

const fxModEnable = document.getElementById('fxModEnable');
const fxModType = document.getElementById('fxModType');
const fxModSpeed = document.getElementById('fxModSpeed');
const fxModSpeedVal = document.getElementById('fxModSpeedVal');
const fxModDepth = document.getElementById('fxModDepth');
const fxModDepthVal = document.getElementById('fxModDepthVal');
const fxModParam3 = document.getElementById('fxModParam3');
const fxModParam3Val = document.getElementById('fxModParam3Val');
const fxModParam3Label = document.getElementById('fxModParam3Label');
const fxModParam4 = document.getElementById('fxModParam4');
const fxModParam4Val = document.getElementById('fxModParam4Val');
const fxModParam4Label = document.getElementById('fxModParam4Label');

const modParamsConfig = {
    "Chorus":  { p3: "Delay (Chorus + Speed)", p4: "Mix (Chorus + Depth)" },
    "Flanger": { p3: "Delay (Flanger + Speed)", p4: "Feedback Level (Flanger + Depth)" },
    "Phaser":  { p3: "Feedback Level (Phaser + Speed)", p4: "Mix (Phaser + Depth)" },
    "Rotary":  { p3: "Angle (Rotary + Speed)",    p4: "Rotor Bal. (Rotary + Depth)" },
    "Tremolo": { p3: "L/R Phase (Tremolo + Speed)", p4: "Wave Shape (Tremolo + Depth)" }
};

function updateModLabels() {
    if (!fxModType || !fxModParam3Label || !fxModParam4Label) return;
    const cfg = modParamsConfig[fxModType.value] || { p3: "Param 3", p4: "Param 4" };
    fxModParam3Label.textContent = cfg.p3;
    fxModParam4Label.textContent = cfg.p4;
}
if (fxModType) fxModType.addEventListener('change', updateModLabels);

const fxDelayEnable = document.getElementById('fxDelayEnable');
const fxDelayType = document.getElementById('fxDelayType');
const fxDelayTime = document.getElementById('fxDelayTime');
const fxDelayTimeVal = document.getElementById('fxDelayTimeVal');
const fxDelayFeedback = document.getElementById('fxDelayFeedback');
const fxDelayFeedbackVal = document.getElementById('fxDelayFeedbackVal');
const fxDelayLevel = document.getElementById('fxDelayLevel');
const fxDelayLevelVal = document.getElementById('fxDelayLevelVal');

const fxReverbEnable = document.getElementById('fxReverbEnable');
const fxReverbType = document.getElementById('fxReverbType');
const fxReverbLevel = document.getElementById('fxReverbLevel');
const fxReverbLevelVal = document.getElementById('fxReverbLevelVal');

const spSimEnable = document.getElementById('spSimEnable');
const spSimType = document.getElementById('spSimType');

if (fxComp) fxComp.addEventListener('input', () => fxCompVal.textContent = parseFloat(fxComp.value).toFixed(1));

if (fxModSpeed) fxModSpeed.addEventListener('input', () => fxModSpeedVal.textContent = parseFloat(fxModSpeed.value).toFixed(1));
if (fxModDepth) fxModDepth.addEventListener('input', () => fxModDepthVal.textContent = parseFloat(fxModDepth.value).toFixed(1));
if (fxModParam3) fxModParam3.addEventListener('input', () => fxModParam3Val.textContent = parseFloat(fxModParam3.value).toFixed(1));
if (fxModParam4) fxModParam4.addEventListener('input', () => fxModParam4Val.textContent = parseFloat(fxModParam4.value).toFixed(1));

if (fxDelayTime) fxDelayTime.addEventListener('input', () => fxDelayTimeVal.textContent = parseFloat(fxDelayTime.value).toFixed(1));
if (fxDelayFeedback) fxDelayFeedback.addEventListener('input', () => fxDelayFeedbackVal.textContent = parseFloat(fxDelayFeedback.value).toFixed(1));
if (fxDelayLevel) fxDelayLevel.addEventListener('input', () => fxDelayLevelVal.textContent = parseFloat(fxDelayLevel.value).toFixed(1));

if (fxReverbLevel) fxReverbLevel.addEventListener('input', () => fxReverbLevelVal.textContent = parseFloat(fxReverbLevel.value).toFixed(1));

// Preset & Sound Library Logic (Updated for Datalist & Sorted Object)
const STORAGE_KEY = 'dg_presets_v5';
const presetSuggestions = document.getElementById('presetSuggestions');
const presetNameInput = document.getElementById('presetNameInput');
const presetDropdownMenu = document.getElementById('presetDropdownMenu');
const toggleDropdownBtn = document.getElementById('toggleDropdownBtn');
const savePresetBtn = document.getElementById('savePresetBtn');
const loadPresetBtn = document.getElementById('loadPresetBtn');
const deletePresetBtn = document.getElementById('deletePresetBtn');
const exportBtn = document.getElementById('exportBtn');
const importInput = document.getElementById('importInput');
const statusBanner = document.getElementById('statusBanner');

let currentFocusIndex = -1;

function showStatus(message, type = 'success') {
    if (!statusBanner) return;
    statusBanner.textContent = message;
    statusBanner.className = `mt-4 p-2.5 rounded-lg text-center text-xs font-mono transition-all ${
        type === 'error' 
            ? 'bg-red-950/90 text-red-300 border border-red-800' 
            : 'bg-teal-950/90 text-teal-300 border border-teal-800'
    }`;
    statusBanner.classList.remove('hidden');
}

function loadLibraryFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.error(e);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPresets));
    return { ...defaultPresets };
}

function saveLibraryToStorage(library) {
    try {
        // Sortiert das Objekt alphabetisch nach Schlüsseln (Preset-Namen) vor dem Speichern
        const sortedLibrary = Object.fromEntries(
            Object.entries(library).sort(([a], [b]) => a.localeCompare(b))
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedLibrary));
    } catch (e) {
        showStatus('Error saving preset.', 'error');
    }
}

// Markiert das aktuell mit den Pfeiltasten angesteuerte Element optisch
function updateItemHighlight() {
    const items = presetDropdownMenu.querySelectorAll('.dropdown-item');
    items.forEach((item, index) => {
        if (index === currentFocusIndex) {
            item.classList.add('bg-neutral-800', 'text-amber-300');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('bg-neutral-800', 'text-amber-300');
        }
    });
}

// Angepasste Render-Funktion mit optionalem selectName zum Vorselektieren
function renderPresetDropdown(filter = '', selectName = null) {
    const library = loadLibraryFromStorage();
    if (!presetDropdownMenu) return;

    presetDropdownMenu.innerHTML = '';
    currentFocusIndex = -1; 
    const lowerFilter = filter.toLowerCase();
    
    const matchingKeys = Object.keys(library).filter(name => 
        name.toLowerCase().includes(lowerFilter)
    );

    if (matchingKeys.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'px-3 py-2 text-neutral-500 text-xs italic';
        emptyDiv.textContent = 'No Presets found';
        presetDropdownMenu.appendChild(emptyDiv);
        return;
    }

    matchingKeys.forEach((name, index) => {
        const item = document.createElement('div');
        item.className = 'dropdown-item px-3 py-2 text-slate-200 hover:bg-neutral-800 hover:text-amber-300 cursor-pointer transition-colors border-b border-neutral-800/50 last:border-none';
        item.textContent = name;
        
        // Wenn der Name exakt dem im TextInput entspricht, direkt als aktiv markieren
        if (selectName && name.toLowerCase() === selectName.toLowerCase()) {
            currentFocusIndex = index;
        }
        
        item.addEventListener('click', () => {
            presetNameInput.value = name;
            loadSelectedPreset();
            presetDropdownMenu.classList.add('hidden');
            currentFocusIndex = -1;
        });
        
        presetDropdownMenu.appendChild(item);
    });

    // Direkt das Highlight auf das gefundene Element setzen
    updateItemHighlight();
}

// Globale Tastatur-Steuerung, solange das Dropdown geöffnet ist
document.addEventListener('keydown', (e) => {
    if (!presetDropdownMenu || presetDropdownMenu.classList.contains('hidden')) return;

    const items = presetDropdownMenu.querySelectorAll('.dropdown-item');

    if (e.key === 'ArrowDown') {
        e.preventDefault(); // Verhindert das Standard-Scrollen der Seite/Liste
        if (items.length > 0) {
            currentFocusIndex = (currentFocusIndex + 1) % items.length;
            updateItemHighlight();
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (items.length > 0) {
            currentFocusIndex = (currentFocusIndex - 1 + items.length) % items.length;
            updateItemHighlight();
        }
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentFocusIndex >= 0 && items[currentFocusIndex]) {
            items[currentFocusIndex].click();
        } else {
            loadSelectedPreset();
        }
        presetDropdownMenu.classList.add('hidden');
        currentFocusIndex = -1;
    } else if (e.key === 'Escape') {
        e.preventDefault();
        presetDropdownMenu.classList.add('hidden');
        currentFocusIndex = -1;
    }
});

// Input-spezifische Events (Tippen, Fokus, Öffnen via Pfeiltaste)
if (presetNameInput) {
    presetNameInput.addEventListener('keydown', (e) => {
        // Wenn Dropdown zu ist und Pfeiltaste gedrückt wird -> öffnen
        if (presetDropdownMenu.classList.contains('hidden')) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                renderPresetDropdown('', presetNameInput.value);
                presetDropdownMenu.classList.remove('hidden');
            }
        }
    });

    // Live-Filter beim Tippen
    presetNameInput.addEventListener('input', (e) => {
        const val = e.target.value;
        renderPresetDropdown(val, val);
        presetDropdownMenu.classList.remove('hidden');
    });

    presetNameInput.addEventListener('focus', () => {
        renderPresetDropdown(presetNameInput.value, presetNameInput.value);
        presetDropdownMenu.classList.remove('hidden');
    });
}

// Toggle-Button öffnet die volle Liste und markiert das aktuelle Preset
if (toggleDropdownBtn) {
    toggleDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (presetDropdownMenu.classList.contains('hidden')) {
            renderPresetDropdown('', presetNameInput.value); 
            presetDropdownMenu.classList.remove('hidden');
        } else {
            presetDropdownMenu.classList.add('hidden');
        }
    });
}

// Schließen bei Klick außerhalb
document.addEventListener('click', (e) => {
    if (!e.target.closest('#presetNameInput') && !e.target.closest('#toggleDropdownBtn') && !e.target.closest('#presetDropdownMenu')) {
        if (presetDropdownMenu) presetDropdownMenu.classList.add('hidden');
    }
});

// Zentrale Funktion zum Aktualisieren der Vorschläge (keine Duplikate mehr)
function refreshPresetSuggestions(selectedName = null) {
    if (selectedName && presetNameInput) {
        presetNameInput.value = selectedName;
    }
    renderPresetDropdown('', presetNameInput ? presetNameInput.value : null);
}

function getCurrentSettings() {
    const settings = {
        ampMode: ampModes[currentAmpIndex].name,
        compEnable: fxCompEnable ? fxCompEnable.checked : false,
        compVal: fxComp ? parseFloat(fxComp.value) : 0,
        modEnable: fxModEnable ? fxModEnable.checked : false,
        modType: fxModType ? fxModType.value : '',
        modSpeed: fxModSpeed ? parseFloat(fxModSpeed.value) : 0,
        modDepth: fxModDepth ? parseFloat(fxModDepth.value) : 0,
        modParam3: fxModParam3 ? parseFloat(fxModParam3.value) : 0,
        modParam4: fxModParam4 ? parseFloat(fxModParam4.value) : 0,
        delayEnable: fxDelayEnable ? fxDelayEnable.checked : false,
        delayType: fxDelayType ? fxDelayType.value : '',
        delayTime: fxDelayTime ? parseFloat(fxDelayTime.value) : 0,
        delayFeedback: fxDelayFeedback ? parseFloat(fxDelayFeedback.value) : 0,
        delayLevel: fxDelayLevel ? parseFloat(fxDelayLevel.value) : 0,
        reverbEnable: fxReverbEnable ? fxReverbEnable.checked : false,
        reverbType: fxReverbType ? fxReverbType.value : '',
        reverbLevel: fxReverbLevel ? parseFloat(fxReverbLevel.value) : 0,
        spSimEnable: spSimEnable ? spSimEnable.checked : false,
        spSimType: spSimType ? spSimType.value : ''
    };
    knobsData.forEach(k => {
        if (knobRefs[k.id]) {
            settings[k.id] = knobRefs[k.id].getValue();
        }
    });
    return settings;
}

function applyMotorizedSettings(settings) {
    if (settings.ampMode) {
        setAmpModeByName(settings.ampMode, false);
    }
    knobsData.forEach(k => {
        if (settings[k.id] !== undefined && knobRefs[k.id]) {
            knobRefs[k.id].setMotorizedValue(settings[k.id], 650);
        }
    });

    if (fxCompEnable) fxCompEnable.checked = !!settings.compEnable;
    if (settings.compVal !== undefined && fxComp && fxCompVal) { fxComp.value = settings.compVal; fxCompVal.textContent = parseFloat(settings.compVal).toFixed(1); }

    if (fxModEnable) fxModEnable.checked = !!settings.modEnable;
    if (settings.modType !== undefined && fxModType) fxModType.value = settings.modType;
    updateModLabels();
    if (settings.modSpeed !== undefined && fxModSpeed && fxModSpeedVal) { fxModSpeed.value = settings.modSpeed; fxModSpeedVal.textContent = parseFloat(settings.modSpeed).toFixed(1); }
    if (settings.modDepth !== undefined && fxModDepth && fxModDepthVal) { fxModDepth.value = settings.modDepth; fxModDepthVal.textContent = parseFloat(settings.modDepth).toFixed(1); }
    if (settings.modParam3 !== undefined && fxModParam3 && fxModParam3Val) { fxModParam3.value = settings.modParam3; fxModParam3Val.textContent = parseFloat(settings.modParam3).toFixed(1); }
    if (settings.modParam4 !== undefined && fxModParam4 && fxModParam4Val) { fxModParam4.value = settings.modParam4; fxModParam4Val.textContent = parseFloat(settings.modParam4).toFixed(1); }

    if (fxDelayEnable) fxDelayEnable.checked = settings.delayEnable !== undefined ? !!settings.delayEnable : (settings.delayType !== 'Off');
    if (settings.delayType && settings.delayType !== 'Off' && fxDelayType) fxDelayType.value = settings.delayType;
    if (settings.delayTime !== undefined && fxDelayTime && fxDelayTimeVal) { fxDelayTime.value = settings.delayTime; fxDelayTimeVal.textContent = parseFloat(settings.delayTime).toFixed(1); }
    if (settings.delayFeedback !== undefined && fxDelayFeedback && fxDelayFeedbackVal) { fxDelayFeedback.value = settings.delayFeedback; fxDelayFeedbackVal.textContent = parseFloat(settings.delayFeedback).toFixed(1); }
    if (settings.delayLevel !== undefined && fxDelayLevel && fxDelayLevelVal) { fxDelayLevel.value = settings.delayLevel; fxDelayLevelVal.textContent = parseFloat(settings.delayLevel).toFixed(1); }

    if (fxReverbEnable) fxReverbEnable.checked = settings.reverbEnable !== undefined ? !!settings.reverbEnable : (settings.reverbType !== 'Off');
    if (settings.reverbType && settings.reverbType !== 'Off' && fxReverbType) fxReverbType.value = settings.reverbType;
    if (settings.reverbLevel !== undefined && fxReverbLevel && fxReverbLevelVal) { fxReverbLevel.value = settings.reverbLevel; fxReverbLevelVal.textContent = parseFloat(settings.reverbLevel).toFixed(1); }

    if (spSimEnable) spSimEnable.checked = settings.spSimEnable !== undefined ? !!settings.spSimEnable : (settings.spSimType !== 'Off');
    if (settings.spSimType && settings.spSimType !== 'Off' && spSimType) spSimType.value = settings.spSimType;
}

if (savePresetBtn) {
    savePresetBtn.addEventListener('click', () => {
        let name = presetNameInput.value.trim();
        if (!name) {
            showStatus('Please enter a preset name!', 'error');
            return;
        }

        const library = loadLibraryFromStorage();
        library[name] = getCurrentSettings();
        saveLibraryToStorage(library);
        refreshPresetSuggestions(name);
        showStatus(`Preset "${name}" saved!`);
    });
}

function loadSelectedPreset() {
    const selectedName = presetNameInput.value.trim();
    if (!selectedName) return;

    const library = loadLibraryFromStorage();
    if (library[selectedName]) {
        applyMotorizedSettings(library[selectedName]);
        showStatus(`Preset "${selectedName}" loaded.`);
    } else {
        showStatus(`Preset "${selectedName}" not found.`, 'error');
    }
}

if (loadPresetBtn) {
    loadPresetBtn.addEventListener('click', loadSelectedPreset);
}

// Wenn der Nutzer ein Preset in der Datalist anklickt/auswählt
if (presetNameInput) {
    presetNameInput.addEventListener('change', loadSelectedPreset);
}

if (deletePresetBtn) {
    deletePresetBtn.addEventListener('click', () => {
        const selectedName = presetNameInput.value.trim();
        if (!selectedName) return;

        const library = loadLibraryFromStorage();
        if (library[selectedName]) {
            delete library[selectedName];
            saveLibraryToStorage(library);
            refreshPresetSuggestions();
            presetNameInput.value = '';
            showStatus(`Preset "${selectedName}" deleted.`);
        } else {
            showStatus(`Preset not found.`, 'error');
        }
    });
}

if (exportBtn) {
    exportBtn.addEventListener('click', () => {
        const library = loadLibraryFromStorage();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(library, null, 2));
        const anchor = document.createElement('a');
        anchor.setAttribute("href", dataStr);
        anchor.setAttribute("download", "dg60fx_presets.json");
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        showStatus("Presets exported to JSON.");
    });
}

if (importInput) {
    importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedLibrary = JSON.parse(event.target.result);
                if (typeof importedLibrary === 'object' && importedLibrary !== null) {
                    const library = loadLibraryFromStorage();
                    Object.assign(library, importedLibrary);
                    saveLibraryToStorage(library);
                    refreshPresetSuggestions();
                    showStatus("Presets imported successfully!");
                } else {
                    showStatus("Invalid JSON format.", 'error');
                }
            } catch (err) {
                showStatus("Error reading file.", 'error');
            }
        };
        reader.readAsText(file);
    });
}

// Initial setup
updateModLabels();
refreshPresetSuggestions();

// Lade standardmäßig das erste Preset, falls vorhanden
const initialKeys = Object.keys(loadLibraryFromStorage());
if (initialKeys.length > 0 && presetNameInput) {
    presetNameInput.value = initialKeys[0];
    loadSelectedPreset();
}