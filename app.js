/**
 * Yamaha DG60FX-112 Preset Library - Application Logic
 * Handles amp/FX controls, motorized knob animations, preset persistence,
 * searchable dropdown navigation, modal confirmations, and toast notifications.
 */

// ============================================================================
// Constants & Configuration
// ============================================================================

const STORAGE_KEY = 'dg_presets_v5';
const AUTO_HIDE_MS = 3000;
const MIN_KNOB_ANGLE = 210;
const MAX_KNOB_ANGLE = 510;
const KNOB_DRAG_SENSITIVITY = 0.05;
const AMP_DRAG_STEP_PX = 25;
const MOTOR_ANIMATION_DURATION_MS = 650;

const KNOBS_CONFIG = [
    { id: 'gain', label: 'Gain', initial: 5.0 },
    { id: 'master', label: 'Master', initial: 5.0 },
    { id: 'treble', label: 'Treble', initial: 5.0 },
    { id: 'middle', label: 'Middle', initial: 5.0 },
    { id: 'bass', label: 'Bass', initial: 5.0 },
    { id: 'presence', label: 'Presence', initial: 5.0 }
];

const AMP_MODES = [
    { name: 'Lead 1', angle: -105 },
    { name: 'Lead 2', angle: -75 },
    { name: 'Drive 1', angle: -45 },
    { name: 'Drive 2', angle: -15 },
    { name: 'Crunch 1', angle: 15 },
    { name: 'Crunch 2', angle: 45 },
    { name: 'Clean 1', angle: 75 },
    { name: 'Clean 2', angle: 105 }
];

const MOD_PARAMS_CONFIG = {
    Chorus: { p3: 'Delay (Chorus + Speed)', p4: 'Mix (Chorus + Depth)' },
    Flanger: { p3: 'Delay (Flanger + Speed)', p4: 'Feedback Level (Flanger + Depth)' },
    Phaser: { p3: 'Feedback Level (Phaser + Speed)', p4: 'Mix (Phaser + Depth)' },
    Rotary: { p3: 'Angle (Rotary + Speed)', p4: 'Rotor Bal. (Rotary + Depth)' },
    Tremolo: { p3: 'L/R Phase (Tremolo + Speed)', p4: 'Wave Shape (Tremolo + Depth)' }
};

const DEFAULT_PRESETS = {
    '011: MS Drive 2': {
        ampMode: 'Drive 2', gain: 4.9, master: 7.1, treble: 4.0, middle: 4.8, bass: 3.7, presence: 5.0,
        compEnable: false, compVal: 2.0,
        modEnable: false, modType: 'Chorus', modSpeed: 0.7, modDepth: 7.9, modParam3: 0.0, modParam4: 10.0,
        delayEnable: false, delayType: 'Tape', delayTime: 5.8, delayFeedback: 6.0, delayLevel: 6.1,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 3.0,
        spSimEnable: false, spSimType: 'Y12'
    },
    '01: 80s Arena Lead': {
        ampMode: 'Lead 2', gain: 8.0, master: 6.0, treble: 7.5, middle: 5.0, bass: 6.5, presence: 7.0,
        compEnable: true, compVal: 5.0, modEnable: true, modType: 'Chorus', modSpeed: 2.5, modDepth: 5.0, modParam3: 3.0, modParam4: 4.0,
        delayEnable: true, delayType: 'Digital', delayTime: 3.5, delayFeedback: 5.0, delayLevel: 5.0,
        reverbEnable: true, reverbType: 'Hall', reverbLevel: 4.5, spSimEnable: true, spSimType: 'b42'
    },
    '02: Acoustic Simulation': {
        ampMode: 'Clean 1', gain: 1.5, master: 7.0, treble: 8.5, middle: 3.5, bass: 4.0, presence: 6.0,
        compEnable: true, compVal: 7.0, modEnable: false, modType: 'Chorus', modSpeed: 1.0, modDepth: 2.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: 'Tape', delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 3.5, spSimEnable: true, spSimType: 'Y12'
    },
    '03: Ambient Wash': {
        ampMode: 'Clean 2', gain: 2.0, master: 5.0, treble: 6.0, middle: 6.0, bass: 6.0, presence: 5.0,
        compEnable: false, compVal: 3.0, modEnable: true, modType: 'Chorus', modSpeed: 0.5, modDepth: 9.0, modParam3: 5.0, modParam4: 8.0,
        delayEnable: true, delayType: 'Digital', delayTime: 8.0, delayFeedback: 8.5, delayLevel: 7.5,
        reverbEnable: true, reverbType: 'Hall', reverbLevel: 8.0, spSimEnable: true, spSimType: 'b22'
    },
    '04: Blues Overdrive': {
        ampMode: 'Drive 1', gain: 5.5, master: 6.0, treble: 6.0, middle: 7.0, bass: 6.0, presence: 5.0,
        compEnable: false, compVal: 2.0, modEnable: false, modType: 'Tremolo', modSpeed: 4.0, modDepth: 4.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: 'Tape', delayTime: 3.0, delayFeedback: 3.0, delayLevel: 3.0,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 4.0, spSimEnable: false, spSimType: 'Y12'
    },
    '05: British Invasion': {
        ampMode: 'Crunch 2', gain: 6.0, master: 6.5, treble: 7.0, middle: 6.5, bass: 5.5, presence: 6.0,
        compEnable: false, compVal: 3.0, modEnable: false, modType: 'Phaser', modSpeed: 3.0, modDepth: 4.0, modParam3: 2.0, modParam4: 5.0,
        delayEnable: false, delayType: 'Tape', delayTime: 2.5, delayFeedback: 3.0, delayLevel: 3.0,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 3.0, spSimEnable: true, spSimType: 'b22'
    },
    '06: Classic Rock Rhythm': {
        ampMode: 'Crunch 1', gain: 5.0, master: 7.0, treble: 6.5, middle: 5.5, bass: 6.0, presence: 5.5,
        compEnable: false, compVal: 2.0, modEnable: false, modType: 'Chorus', modSpeed: 1.0, modDepth: 3.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: 'Tape', delayTime: 3.0, delayFeedback: 3.0, delayLevel: 3.0,
        reverbEnable: true, reverbType: 'Plate', reverbLevel: 3.0, spSimEnable: false, spSimType: 'Y12'
    },
    '07: Clean Jazz Box': {
        ampMode: 'Clean 1', gain: 2.0, master: 7.5, treble: 5.0, middle: 6.0, bass: 7.0, presence: 4.0,
        compEnable: true, compVal: 4.0, modEnable: false, modType: 'Chorus', modSpeed: 1.0, modDepth: 2.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: 'Digital', delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: 'Hall', reverbLevel: 3.5, spSimEnable: true, spSimType: 'b22'
    },
    '08: Country Chicken Pickin': {
        ampMode: 'Clean 1', gain: 3.0, master: 6.5, treble: 8.0, middle: 4.5, bass: 5.0, presence: 7.0,
        compEnable: true, compVal: 8.0, modEnable: false, modType: 'Tremolo', modSpeed: 5.0, modDepth: 5.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: true, delayType: 'Digital', delayTime: 1.5, delayFeedback: 2.0, delayLevel: 3.0,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 2.5, spSimEnable: false, spSimType: 'Y12'
    },
    '09: Crunch Master': {
        ampMode: 'Crunch 2', gain: 7.0, master: 5.5, treble: 7.0, middle: 6.0, bass: 6.5, presence: 6.5,
        compEnable: false, compVal: 4.0, modEnable: false, modType: 'Flanger', modSpeed: 4.0, modDepth: 4.0, modParam3: 3.0, modParam4: 4.0,
        delayEnable: false, delayType: 'Tape', delayTime: 3.0, delayFeedback: 3.0, delayLevel: 3.0,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 3.0, spSimEnable: true, spSimType: 'b42'
    },
    '10: Dark Ambient': {
        ampMode: 'Clean 2', gain: 1.8, master: 5.0, treble: 4.0, middle: 5.0, bass: 8.0, presence: 3.0,
        compEnable: true, compVal: 6.0, modEnable: true, modType: 'Tremolo', modSpeed: 1.5, modDepth: 7.0, modParam3: 5.0, modParam4: 6.0,
        delayEnable: true, delayType: 'Tape', delayTime: 9.0, delayFeedback: 9.0, delayLevel: 8.0,
        reverbEnable: true, reverbType: 'Hall', reverbLevel: 9.0, spSimEnable: true, spSimType: 'b22'
    },
    '12: Desert Stoner': {
        ampMode: 'Drive 1', gain: 7.5, master: 6.0, treble: 6.0, middle: 8.0, bass: 8.5, presence: 5.5,
        compEnable: false, compVal: 2.0, modEnable: false, modType: 'Phaser', modSpeed: 2.0, modDepth: 5.0, modParam3: 4.0, modParam4: 5.0,
        delayEnable: false, delayType: 'Tape', delayTime: 4.0, delayFeedback: 4.0, delayLevel: 4.0,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 2.0, spSimEnable: false, spSimType: 'Y12'
    },
    '13: Djugg Distortion': {
        ampMode: 'Lead 2', gain: 9.5, master: 4.5, treble: 8.5, middle: 3.0, bass: 9.0, presence: 8.5,
        compEnable: true, compVal: 5.0, modEnable: false, modType: 'Chorus', modSpeed: 1.0, modDepth: 1.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: 'Digital', delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: false, reverbType: 'Spring', reverbLevel: 0.0, spSimEnable: true, spSimType: 'b42'
    },
    '14: Doom Metal': {
        ampMode: 'Drive 2', gain: 9.0, master: 5.0, treble: 5.0, middle: 8.5, bass: 9.5, presence: 6.0,
        compEnable: false, compVal: 3.0, modEnable: false, modType: 'Tremolo', modSpeed: 3.0, modDepth: 3.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: true, delayType: 'Tape', delayTime: 5.0, delayFeedback: 6.0, delayLevel: 5.0,
        reverbEnable: true, reverbType: 'Hall', reverbLevel: 5.0, spSimEnable: true, spSimType: 'b42'
    },
    '15: Dreamy Chorus': {
        ampMode: 'Clean 2', gain: 2.2, master: 6.5, treble: 6.5, middle: 5.5, bass: 5.5, presence: 6.0,
        compEnable: true, compVal: 4.0, modEnable: true, modType: 'Chorus', modSpeed: 2.0, modDepth: 7.5, modParam3: 4.0, modParam4: 6.0,
        delayEnable: true, delayType: 'Digital', delayTime: 4.0, delayFeedback: 4.0, delayLevel: 4.0,
        reverbEnable: true, reverbType: 'Hall', reverbLevel: 5.0, spSimEnable: true, spSimType: 'b22'
    },
    '16: Dry Studio Lead': {
        ampMode: 'Lead 1', gain: 7.5, master: 5.5, treble: 7.0, middle: 6.0, bass: 6.0, presence: 7.0,
        compEnable: true, compVal: 5.0, modEnable: false, modType: 'Chorus', modSpeed: 1.0, modDepth: 1.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: 'Digital', delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: false, reverbType: 'Plate', reverbLevel: 1.0, spSimEnable: true, spSimType: 'Y12'
    },
    '17: Duo Reverb Clean': {
        ampMode: 'Clean 1', gain: 3.0, master: 6.0, treble: 7.0, middle: 5.0, bass: 6.0, presence: 6.5,
        compEnable: false, compVal: 2.0, modEnable: false, modType: 'Tremolo', modSpeed: 4.0, modDepth: 4.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: 'Tape', delayTime: 3.0, delayFeedback: 3.0, delayLevel: 3.0,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 6.0, spSimEnable: true, spSimType: 'b22'
    },
    '18: Dynamic Fusion': {
        ampMode: 'Lead 1', gain: 6.5, master: 6.0, treble: 6.5, middle: 7.0, bass: 5.5, presence: 6.5,
        compEnable: true, compVal: 4.0, modEnable: false, modType: 'Chorus', modSpeed: 3.0, modDepth: 4.0, modParam3: 2.0, modParam4: 3.0,
        delayEnable: true, delayType: 'Digital', delayTime: 3.0, delayFeedback: 4.0, delayLevel: 4.0,
        reverbEnable: true, reverbType: 'Plate', reverbLevel: 4.0, spSimEnable: true, spSimType: 'b42'
    },
    '19: Ethereal Delay': {
        ampMode: 'Clean 2', gain: 2.5, master: 6.0, treble: 6.0, middle: 5.0, bass: 6.0, presence: 5.5,
        compEnable: false, compVal: 2.0, modEnable: true, modType: 'Chorus', modSpeed: 1.5, modDepth: 5.0, modParam3: 3.0, modParam4: 5.0,
        delayEnable: true, delayType: 'Digital', delayTime: 7.5, delayFeedback: 7.5, delayLevel: 7.0,
        reverbEnable: true, reverbType: 'Hall', reverbLevel: 7.0, spSimEnable: true, spSimType: 'b22'
    },
    '20: Expressive Solo': {
        ampMode: 'Lead 2', gain: 8.2, master: 5.0, treble: 7.5, middle: 5.5, bass: 6.5, presence: 7.5,
        compEnable: true, compVal: 5.0, modEnable: false, modType: 'Flanger', modSpeed: 2.0, modDepth: 3.0, modParam3: 2.0, modParam4: 3.0,
        delayEnable: true, delayType: 'Digital', delayTime: 3.5, delayFeedback: 4.5, delayLevel: 4.5,
        reverbEnable: true, reverbType: 'Plate', reverbLevel: 4.5, spSimEnable: true, spSimType: 'b42'
    },
    '21: Fat Blues': {
        ampMode: 'Drive 1', gain: 5.8, master: 6.2, treble: 5.0, middle: 7.5, bass: 7.0, presence: 4.5,
        compEnable: false, compVal: 3.0, modEnable: false, modType: 'Tremolo', modSpeed: 5.0, modDepth: 4.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: 'Tape', delayTime: 2.5, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 4.5, spSimEnable: false, spSimType: 'Y12'
    },
    '22: Flanger Space': {
        ampMode: 'Crunch 2', gain: 6.5, master: 5.5, treble: 7.0, middle: 5.0, bass: 6.0, presence: 6.0,
        compEnable: false, compVal: 2.0, modEnable: true, modType: 'Flanger', modSpeed: 3.5, modDepth: 8.0, modParam3: 6.0, modParam4: 7.0,
        delayEnable: true, delayType: 'Tape', delayTime: 4.0, delayFeedback: 5.0, delayLevel: 5.0,
        reverbEnable: true, reverbType: 'Hall', reverbLevel: 4.0, spSimEnable: true, spSimType: 'b42'
    },
    '23: Funk Clean': {
        ampMode: 'Clean 1', gain: 2.0, master: 7.0, treble: 7.5, middle: 4.5, bass: 5.0, presence: 7.0,
        compEnable: true, compVal: 7.5, modEnable: false, modType: 'Chorus', modSpeed: 1.0, modDepth: 2.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: 'Digital', delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: false, reverbType: 'Spring', reverbLevel: 1.0, spSimEnable: true, spSimType: 'Y12'
    },
    '24: Garage Punk': {
        ampMode: 'Crunch 1', gain: 7.0, master: 7.5, treble: 8.0, middle: 4.0, bass: 5.0, presence: 8.0,
        compEnable: false, compVal: 2.0, modEnable: false, modType: 'Tremolo', modSpeed: 6.0, modDepth: 3.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: 'Tape', delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 2.0, spSimEnable: false, spSimType: 'Y12'
    },
    '25: Glassy Clean': {
        ampMode: 'Clean 1', gain: 2.2, master: 7.0, treble: 8.0, middle: 5.0, bass: 5.0, presence: 8.0,
        compEnable: true, compVal: 4.0, modEnable: false, modType: 'Chorus', modSpeed: 1.0, modDepth: 2.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: 'Digital', delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 4.0, spSimEnable: true, spSimType: 'b22'
    },
    '26: Grunge Rock': {
        ampMode: 'Drive 2', gain: 8.0, master: 6.0, treble: 6.5, middle: 6.0, bass: 7.0, presence: 6.5,
        compEnable: false, compVal: 3.0, modEnable: false, modType: 'Chorus', modSpeed: 2.0, modDepth: 3.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: true, delayType: 'Tape', delayTime: 3.5, delayFeedback: 4.0, delayLevel: 4.0,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 3.5, spSimEnable: true, spSimType: 'b42'
    },
    '27: Heavy Riffing': {
        ampMode: 'Lead 1', gain: 8.8, master: 5.5, treble: 7.5, middle: 4.5, bass: 8.0, presence: 7.5,
        compEnable: true, compVal: 5.0, modEnable: false, modType: 'Flanger', modSpeed: 1.0, modDepth: 1.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: 'Digital', delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: 'Plate', reverbLevel: 2.5, spSimEnable: true, spSimType: 'b42'
    },
    '28: Indie Rock Chords': {
        ampMode: 'Crunch 2', gain: 5.5, master: 6.5, treble: 6.5, middle: 6.0, bass: 6.0, presence: 6.0,
        compEnable: false, compVal: 3.0, modEnable: true, modType: 'Chorus', modSpeed: 2.5, modDepth: 4.0, modParam3: 3.0, modParam4: 4.0,
        delayEnable: true, delayType: 'Digital', delayTime: 3.0, delayFeedback: 3.5, delayLevel: 3.5,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 3.5, spSimEnable: false, spSimType: 'Y12'
    },
    '29: Jam Band Tone': {
        ampMode: 'Drive 1', gain: 4.5, master: 6.5, treble: 6.0, middle: 6.5, bass: 6.5, presence: 5.0,
        compEnable: false, compVal: 2.0, modEnable: true, modType: 'Tremolo', modSpeed: 4.5, modDepth: 5.0, modParam3: 5.0, modParam4: 5.0,
        delayEnable: false, delayType: 'Tape', delayTime: 3.0, delayFeedback: 3.0, delayLevel: 3.0,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 4.0, spSimEnable: false, spSimType: 'Y12'
    },
    '30: Jazz Fusion Lead': {
        ampMode: 'Lead 1', gain: 6.8, master: 6.0, treble: 6.0, middle: 7.5, bass: 6.0, presence: 5.5,
        compEnable: true, compVal: 5.0, modEnable: false, modType: 'Chorus', modSpeed: 2.0, modDepth: 3.0, modParam3: 2.0, modParam4: 3.0,
        delayEnable: true, delayType: 'Digital', delayTime: 3.2, delayFeedback: 4.5, delayLevel: 4.0,
        reverbEnable: true, reverbType: 'Plate', reverbLevel: 4.0, spSimEnable: true, spSimType: 'b42'
    },
    '31: Lo-Fi Tape Delay': {
        ampMode: 'Crunch 1', gain: 4.0, master: 6.0, treble: 5.5, middle: 6.0, bass: 5.5, presence: 4.5,
        compEnable: false, compVal: 2.0, modEnable: false, modType: 'Chorus', modSpeed: 1.0, modDepth: 2.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: true, delayType: 'Tape', delayTime: 5.5, delayFeedback: 6.5, delayLevel: 6.0,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 3.0, spSimEnable: true, spSimType: 'b22'
    },
    '32: Massive Wall of Sound': {
        ampMode: 'Lead 2', gain: 9.0, master: 5.0, treble: 7.0, middle: 5.0, bass: 8.5, presence: 7.0,
        compEnable: true, compVal: 6.0, modEnable: true, modType: 'Chorus', modSpeed: 3.0, modDepth: 6.0, modParam3: 4.0, modParam4: 5.0,
        delayEnable: true, delayType: 'Digital', delayTime: 4.5, delayFeedback: 6.0, delayLevel: 6.0,
        reverbEnable: true, reverbType: 'Hall', reverbLevel: 6.5, spSimEnable: true, spSimType: 'b42'
    },
    '33: Melodic Metal': {
        ampMode: 'Lead 1', gain: 8.5, master: 5.5, treble: 8.0, middle: 4.5, bass: 7.5, presence: 8.0,
        compEnable: true, compVal: 4.0, modEnable: false, modType: 'Chorus', modSpeed: 1.0, modDepth: 2.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: true, delayType: 'Digital', delayTime: 2.8, delayFeedback: 4.0, delayLevel: 4.0,
        reverbEnable: true, reverbType: 'Plate', reverbLevel: 3.5, spSimEnable: true, spSimType: 'b42'
    },
    '34: Modern High Gain': {
        ampMode: 'Lead 2', gain: 9.2, master: 5.0, treble: 8.0, middle: 4.0, bass: 8.5, presence: 8.5,
        compEnable: true, compVal: 5.0, modEnable: false, modType: 'Flanger', modSpeed: 1.0, modDepth: 1.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: 'Digital', delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: 'Plate', reverbLevel: 2.5, spSimEnable: true, spSimType: 'b42'
    },
    '35: Neo Soul Chords': {
        ampMode: 'Clean 2', gain: 2.5, master: 6.5, treble: 6.0, middle: 6.0, bass: 6.0, presence: 5.5,
        compEnable: true, compVal: 5.0, modEnable: true, modType: 'Chorus', modSpeed: 2.0, modDepth: 5.0, modParam3: 3.0, modParam4: 4.0,
        delayEnable: true, delayType: 'Digital', delayTime: 3.5, delayFeedback: 3.5, delayLevel: 3.5,
        reverbEnable: true, reverbType: 'Plate', reverbLevel: 4.0, spSimEnable: true, spSimType: 'b22'
    },
    '36: Overdriven Blues': {
        ampMode: 'Drive 2', gain: 6.2, master: 5.8, treble: 6.0, middle: 7.0, bass: 6.0, presence: 5.0,
        compEnable: false, compVal: 3.0, modEnable: false, modType: 'Tremolo', modSpeed: 4.0, modDepth: 4.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: 'Tape', delayTime: 3.0, delayFeedback: 2.5, delayLevel: 2.5,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 4.0, spSimEnable: false, spSimType: 'Y12'
    },
    '37: Pop Ballad Clean': {
        ampMode: 'Clean 1', gain: 2.0, master: 6.8, treble: 6.5, middle: 5.5, bass: 5.5, presence: 6.0,
        compEnable: true, compVal: 4.0, modEnable: false, modType: 'Chorus', modSpeed: 1.0, modDepth: 2.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: true, delayType: 'Digital', delayTime: 4.0, delayFeedback: 4.5, delayLevel: 4.5,
        reverbEnable: true, reverbType: 'Hall', reverbLevel: 5.5, spSimEnable: true, spSimType: 'b22'
    },
    '38: Power Chord Crunch': {
        ampMode: 'Crunch 2', gain: 6.8, master: 6.5, treble: 7.0, middle: 5.5, bass: 6.5, presence: 6.0,
        compEnable: false, compVal: 2.0, modEnable: false, modType: 'Chorus', modSpeed: 1.0, modDepth: 1.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: 'Tape', delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 3.0, spSimEnable: true, spSimType: 'Y12'
    },
    '39: Psychedelic Vibe': {
        ampMode: 'Crunch 1', gain: 5.0, master: 6.0, treble: 5.5, middle: 6.5, bass: 6.0, presence: 5.0,
        compEnable: false, compVal: 3.0, modEnable: true, modType: 'Rotary', modSpeed: 6.5, modDepth: 7.0, modParam3: 5.0, modParam4: 6.0,
        delayEnable: true, delayType: 'Tape', delayTime: 4.5, delayFeedback: 5.0, delayLevel: 4.5,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 5.0, spSimEnable: false, spSimType: 'Y12'
    },
    '40: Punchy Drive': {
        ampMode: 'Drive 1', gain: 6.0, master: 6.0, treble: 6.5, middle: 6.5, bass: 6.0, presence: 6.0,
        compEnable: true, compVal: 5.0, modEnable: false, modType: 'Chorus', modSpeed: 1.0, modDepth: 1.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: 'Tape', delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 3.0, spSimEnable: true, spSimType: 'Y12'
    },
    '41: Radio Voice Effect': {
        ampMode: 'Clean 1', gain: 4.0, master: 5.0, treble: 9.0, middle: 2.0, bass: 2.0, presence: 9.0,
        compEnable: true, compVal: 8.0, modEnable: false, modType: 'Chorus', modSpeed: 1.0, modDepth: 1.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: 'Digital', delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: false, reverbType: 'Spring', reverbLevel: 0.0, spSimEnable: true, spSimType: 'Y12'
    },
    '42: Reggae Skank': {
        ampMode: 'Clean 1', gain: 2.0, master: 7.0, treble: 7.0, middle: 5.0, bass: 5.5, presence: 6.0,
        compEnable: true, compVal: 5.0, modEnable: false, modType: 'Chorus', modSpeed: 1.0, modDepth: 1.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: true, delayType: 'Digital', delayTime: 2.5, delayFeedback: 3.0, delayLevel: 3.0,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 3.5, spSimEnable: true, spSimType: 'b22'
    },
    '43: Rockabilly Slapback': {
        ampMode: 'Crunch 1', gain: 4.5, master: 6.5, treble: 7.0, middle: 6.0, bass: 5.5, presence: 6.5,
        compEnable: false, compVal: 2.0, modEnable: false, modType: 'Chorus', modSpeed: 1.0, modDepth: 1.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: true, delayType: 'Tape', delayTime: 1.2, delayFeedback: 1.5, delayLevel: 4.0,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 4.5, spSimEnable: false, spSimType: 'Y12'
    },
    '44: Rotary Organ Sim': {
        ampMode: 'Clean 2', gain: 3.0, master: 6.0, treble: 6.0, middle: 6.0, bass: 6.0, presence: 5.0,
        compEnable: false, compVal: 2.0, modEnable: true, modType: 'Rotary', modSpeed: 7.0, modDepth: 8.0, modParam3: 5.0, modParam4: 7.0,
        delayEnable: false, delayType: 'Digital', delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 3.0, spSimEnable: true, spSimType: 'b22'
    },
    '45: Shoegaze Reverb': {
        ampMode: 'Drive 1', gain: 6.5, master: 5.5, treble: 6.0, middle: 6.0, bass: 6.5, presence: 5.5,
        compEnable: true, compVal: 4.0, modEnable: true, modType: 'Chorus', modSpeed: 3.0, modDepth: 6.0, modParam3: 4.0, modParam4: 5.0,
        delayEnable: true, delayType: 'Digital', delayTime: 5.0, delayFeedback: 6.0, delayLevel: 6.0,
        reverbEnable: true, reverbType: 'Hall', reverbLevel: 9.5, spSimEnable: true, spSimType: 'b42'
    },
    '46: Smooth Jazz': {
        ampMode: 'Clean 1', gain: 2.0, master: 7.0, treble: 5.0, middle: 6.5, bass: 6.5, presence: 4.5,
        compEnable: true, compVal: 4.0, modEnable: false, modType: 'Chorus', modSpeed: 1.0, modDepth: 2.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: 'Digital', delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: 'Hall', reverbLevel: 4.0, spSimEnable: true, spSimType: 'b22'
    },
    '47: Sparkle Clean': {
        ampMode: 'Clean 1', gain: 2.2, master: 7.0, treble: 8.0, middle: 5.0, bass: 5.0, presence: 7.5,
        compEnable: true, compVal: 4.0, modEnable: false, modType: 'Chorus', modSpeed: 1.0, modDepth: 2.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: 'Digital', delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 4.0, spSimEnable: true, spSimType: 'b22'
    },
    '48: Stadium Rock': {
        ampMode: 'Lead 1', gain: 7.8, master: 6.0, treble: 7.0, middle: 5.5, bass: 6.5, presence: 7.0,
        compEnable: true, compVal: 4.0, modEnable: false, modType: 'Chorus', modSpeed: 2.0, modDepth: 3.0, modParam3: 2.0, modParam4: 3.0,
        delayEnable: true, delayType: 'Digital', delayTime: 4.0, delayFeedback: 5.0, delayLevel: 5.0,
        reverbEnable: true, reverbType: 'Hall', reverbLevel: 6.0, spSimEnable: true, spSimType: 'b42'
    },
    '49: Thrash Metal': {
        ampMode: 'Lead 2', gain: 9.0, master: 5.0, treble: 8.5, middle: 3.5, bass: 8.0, presence: 9.0,
        compEnable: true, compVal: 5.0, modEnable: false, modType: 'Chorus', modSpeed: 1.0, modDepth: 1.0, modParam3: 0.0, modParam4: 0.0,
        delayEnable: false, delayType: 'Digital', delayTime: 2.0, delayFeedback: 2.0, delayLevel: 2.0,
        reverbEnable: true, reverbType: 'Plate', reverbLevel: 2.0, spSimEnable: true, spSimType: 'b42'
    },
    '50: Vintage Tremolo': {
        ampMode: 'Drive 1', gain: 5.0, master: 6.0, treble: 6.0, middle: 6.5, bass: 6.0, presence: 5.0,
        compEnable: false, compVal: 2.0, modEnable: true, modType: 'Tremolo', modSpeed: 6.5, modDepth: 7.5, modParam3: 6.0, modParam4: 7.0,
        delayEnable: false, delayType: 'Tape', delayTime: 3.0, delayFeedback: 2.5, delayLevel: 2.5,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 4.5, spSimEnable: false, spSimType: 'Y12'
    },
    'DG Clean Chorus': {
        ampMode: 'Clean 1', gain: 2.5, master: 6.5, treble: 6.5, middle: 5.0, bass: 5.5, presence: 6.0,
        compEnable: true, compVal: 4.0,
        modEnable: true, modType: 'Chorus', modSpeed: 3.5, modDepth: 6.5, modParam3: 4.5, modParam4: 3.0,
        delayEnable: true, delayType: 'Digital', delayTime: 2.0, delayFeedback: 4.0, delayLevel: 3.0,
        reverbEnable: true, reverbType: 'Hall', reverbLevel: 4.0,
        spSimEnable: true, spSimType: 'b22'
    },
    'Solo Lead Drive': {
        ampMode: 'Lead 1', gain: 8.5, master: 4.0, treble: 8.0, middle: 4.0, bass: 7.0, presence: 7.5,
        compEnable: true, compVal: 6.0,
        modEnable: false, modType: 'Flanger', modSpeed: 4.0, modDepth: 6.0, modParam3: 5.0, modParam4: 4.0,
        delayEnable: true, delayType: 'Digital', delayTime: 2.5, delayFeedback: 4.5, delayLevel: 4.0,
        reverbEnable: true, reverbType: 'Plate', reverbLevel: 3.5,
        spSimEnable: true, spSimType: 'b42'
    },
    'Vintage Blues': {
        ampMode: 'Drive 2', gain: 5.0, master: 5.5, treble: 5.5, middle: 7.5, bass: 6.0, presence: 4.5,
        compEnable: false, compVal: 5.0,
        modEnable: true, modType: 'Tremolo', modSpeed: 6.0, modDepth: 5.5, modParam3: 7.0, modParam4: 5.0,
        delayEnable: false, delayType: 'Tape', delayTime: 3.0, delayFeedback: 2.5, delayLevel: 2.0,
        reverbEnable: true, reverbType: 'Spring', reverbLevel: 4.5,
        spSimEnable: false, spSimType: 'Y12'
    }
};

// ============================================================================
// DOM References & Application State
// ============================================================================

const dom = {
    // Tabs
    tabAmpBtn: document.getElementById('tabAmpBtn'),
    tabFxBtn: document.getElementById('tabFxBtn'),
    tabAmpContent: document.getElementById('tabAmpContent'),
    tabFxContent: document.getElementById('tabFxContent'),

    // Amp mode rotary switch
    controlsContainer: document.getElementById('controlsContainer'),
    ampModeSelect: document.getElementById('ampModeSelect'),
    ampPointerGroup: document.getElementById('ampPointerGroup'),
    ampSelectText: document.getElementById('ampSelectText'),
    ampSelectSvg: document.getElementById('ampSelectSvg'),

    // FX controls
    fxCompEnable: document.getElementById('fxCompEnable'),
    fxComp: document.getElementById('fxComp'),
    fxCompVal: document.getElementById('fxCompVal'),

    fxModEnable: document.getElementById('fxModEnable'),
    fxModType: document.getElementById('fxModType'),
    fxModSpeed: document.getElementById('fxModSpeed'),
    fxModSpeedVal: document.getElementById('fxModSpeedVal'),
    fxModDepth: document.getElementById('fxModDepth'),
    fxModDepthVal: document.getElementById('fxModDepthVal'),
    fxModParam3: document.getElementById('fxModParam3'),
    fxModParam3Val: document.getElementById('fxModParam3Val'),
    fxModParam3Label: document.getElementById('fxModParam3Label'),
    fxModParam4: document.getElementById('fxModParam4'),
    fxModParam4Val: document.getElementById('fxModParam4Val'),
    fxModParam4Label: document.getElementById('fxModParam4Label'),

    fxDelayEnable: document.getElementById('fxDelayEnable'),
    fxDelayType: document.getElementById('fxDelayType'),
    fxDelayTime: document.getElementById('fxDelayTime'),
    fxDelayTimeVal: document.getElementById('fxDelayTimeVal'),
    fxDelayFeedback: document.getElementById('fxDelayFeedback'),
    fxDelayFeedbackVal: document.getElementById('fxDelayFeedbackVal'),
    fxDelayLevel: document.getElementById('fxDelayLevel'),
    fxDelayLevelVal: document.getElementById('fxDelayLevelVal'),

    fxReverbEnable: document.getElementById('fxReverbEnable'),
    fxReverbType: document.getElementById('fxReverbType'),
    fxReverbLevel: document.getElementById('fxReverbLevel'),
    fxReverbLevelVal: document.getElementById('fxReverbLevelVal'),

    spSimEnable: document.getElementById('spSimEnable'),
    spSimType: document.getElementById('spSimType'),

    // Preset library & search dropdown
    presetNameInput: document.getElementById('presetNameInput'),
    presetDropdownMenu: document.getElementById('presetDropdownMenu'),
    toggleDropdownBtn: document.getElementById('toggleDropdownBtn'),
    savePresetBtn: document.getElementById('savePresetBtn'),
    loadPresetBtn: document.getElementById('loadPresetBtn'),
    deletePresetBtn: document.getElementById('deletePresetBtn'),
    exportBtn: document.getElementById('exportBtn'),
    importInput: document.getElementById('importInput'),

    // Floating alert toast
    floatingAlert: document.getElementById('floatingAlert'),
    floatingAlertIcon: document.getElementById('floatingAlertIcon'),
    floatingAlertText: document.getElementById('floatingAlertText'),
    floatingAlertClose: document.getElementById('floatingAlertClose'),

    // Confirmation modal
    confirmModal: document.getElementById('confirmModal'),
    confirmModalCard: document.getElementById('confirmModalCard'),
    confirmModalTitle: document.getElementById('confirmModalTitle'),
    confirmModalMessage: document.getElementById('confirmModalMessage'),
    confirmModalActions: document.getElementById('confirmModalActions')
};

const state = {
    currentAmpIndex: 7,
    currentFocusIndex: -1,
    alertHideTimer: null,
    knobRefs: {}
};

// ============================================================================
// Service Worker Registration
// ============================================================================

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').catch((err) => {
                console.warn('Service Worker registration failed:', err);
            });
        });
    }
}

// ============================================================================
// UI Feedback: Floating Alert & Confirmation Modal
// ============================================================================

function hideAlert() {
    if (state.alertHideTimer) {
        clearTimeout(state.alertHideTimer);
        state.alertHideTimer = null;
    }
    if (dom.floatingAlert) {
        dom.floatingAlert.classList.remove('is-visible');
    }
}

function showStatus(message, type = 'success', duration = AUTO_HIDE_MS) {
    if (state.alertHideTimer) {
        clearTimeout(state.alertHideTimer);
    }
    if (!dom.floatingAlert || !dom.floatingAlertIcon || !dom.floatingAlertText) return;

    const isError = type === 'error';
    dom.floatingAlertIcon.textContent = isError ? '!' : 'i';
    dom.floatingAlertText.textContent = message;
    dom.floatingAlert.className = `px-4 py-3 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.85)] text-xs font-mono flex items-center gap-3 border is-visible ${
        isError
            ? 'bg-red-950/95 text-red-200 border-red-700/80'
            : 'bg-teal-950/90 text-teal-300 border border-teal-800'
    }`;

    if (duration > 0) {
        state.alertHideTimer = setTimeout(hideAlert, duration);
    }
}

function openConfirmModal({ title, message, buttons }) {
    return new Promise((resolve) => {
        if (!dom.confirmModal || !dom.confirmModalCard || !dom.confirmModalTitle || !dom.confirmModalMessage || !dom.confirmModalActions) {
            resolve(null);
            return;
        }

        let settled = false;
        const finish = (value) => {
            if (settled) return;
            settled = true;
            dom.confirmModal.classList.add('hidden');
            document.removeEventListener('keydown', onKeyDown);
            dom.confirmModal.removeEventListener('click', onBackdropClick);
            resolve(value);
        };

        const resolveCancelValue = () => {
            const cancelBtn = buttons.find((btn) => btn.cancel) || buttons[buttons.length - 1];
            return cancelBtn ? cancelBtn.value : null;
        };

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                finish(resolveCancelValue());
            }
        };

        const onBackdropClick = (e) => {
            if (e.target === dom.confirmModal) {
                finish(resolveCancelValue());
            }
        };

        dom.confirmModalTitle.textContent = title;
        dom.confirmModalMessage.textContent = message;
        dom.confirmModalActions.innerHTML = '';

        buttons.forEach((btn) => {
            const buttonEl = document.createElement('button');
            buttonEl.type = 'button';
            buttonEl.textContent = btn.label;
            buttonEl.className = btn.className || 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-mono text-xs px-3.5 py-2 rounded transition-all';
            buttonEl.addEventListener('click', () => finish(btn.value));
            dom.confirmModalActions.appendChild(buttonEl);
        });

        dom.confirmModalCard.addEventListener('click', (e) => e.stopPropagation());
        dom.confirmModal.addEventListener('click', onBackdropClick);
        document.addEventListener('keydown', onKeyDown);
        dom.confirmModal.classList.remove('hidden');
    });
}

// ============================================================================
// Tab Navigation
// ============================================================================

function activateTab(activeTab) {
    const isAmp = activeTab === 'amp';
    const activeClasses = 'px-5 py-2.5 font-brand text-sm font-bold tracking-wider rounded-t-lg transition-all border-t-2 border-x border-red-700/60 bg-[#8c1c24] text-amber-100';
    const inactiveClasses = 'px-5 py-2.5 font-brand text-sm font-bold tracking-wider rounded-t-lg transition-all border-t-2 border-x border-transparent bg-neutral-900 text-neutral-400 hover:text-neutral-200';

    if (dom.tabAmpContent) dom.tabAmpContent.classList.toggle('hidden', !isAmp);
    if (dom.tabFxContent) dom.tabFxContent.classList.toggle('hidden', isAmp);
    if (dom.tabAmpBtn) dom.tabAmpBtn.className = isAmp ? activeClasses : inactiveClasses;
    if (dom.tabFxBtn) dom.tabFxBtn.className = isAmp ? inactiveClasses : activeClasses;
}

function initTabs() {
    if (dom.tabAmpBtn) {
        dom.tabAmpBtn.addEventListener('click', () => activateTab('amp'));
    }
    if (dom.tabFxBtn) {
        dom.tabFxBtn.addEventListener('click', () => activateTab('fx'));
    }
}

// ============================================================================
// Amp Mode Selector & Continuous Knobs
// ============================================================================

function setAmpModeByIndex(index) {
    const clampedIndex = Math.max(0, Math.min(AMP_MODES.length - 1, index));
    state.currentAmpIndex = clampedIndex;
    const mode = AMP_MODES[clampedIndex];

    if (dom.ampPointerGroup) {
        dom.ampPointerGroup.classList.remove('motorized-moving');
        dom.ampPointerGroup.style.transform = `rotate(${mode.angle}deg)`;
    }
    if (dom.ampSelectText) {
        dom.ampSelectText.textContent = mode.name;
    }
    if (dom.ampModeSelect) {
        dom.ampModeSelect.value = mode.angle;
    }
}

function setAmpModeByName(name) {
    const normalized = (name || '').toLowerCase();
    const index = AMP_MODES.findIndex((m) => m.name.toLowerCase() === normalized);
    if (index !== -1) {
        setAmpModeByIndex(index);
    }
}

function initAmpModeSwitch() {
    if (dom.ampModeSelect) {
        dom.ampModeSelect.addEventListener('change', () => {
            const selectedAngle = parseInt(dom.ampModeSelect.value, 10);
            const index = AMP_MODES.findIndex((m) => m.angle === selectedAngle);
            if (index !== -1) {
                setAmpModeByIndex(index);
            }
        });
    }

    if (!dom.ampSelectSvg) return;

    let isDragging = false;
    let startY = 0;
    let startIndex = 0;

    const onDragMove = (e) => {
        if (!isDragging) return;
        const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY);
        const deltaY = startY - clientY;
        const stepChange = Math.round(deltaY / AMP_DRAG_STEP_PX);
        setAmpModeByIndex(startIndex + stepChange);
    };

    const onDragEnd = () => {
        isDragging = false;
        document.removeEventListener('mousemove', onDragMove);
        document.removeEventListener('mouseup', onDragEnd);
        document.removeEventListener('touchmove', onDragMove);
        document.removeEventListener('touchend', onDragEnd);
    };

    dom.ampSelectSvg.addEventListener('mousedown', (e) => {
        isDragging = true;
        startY = e.clientY;
        startIndex = state.currentAmpIndex;
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
    });

    dom.ampSelectSvg.addEventListener('touchstart', (e) => {
        isDragging = true;
        startY = e.touches[0].clientY;
        startIndex = state.currentAmpIndex;
        document.addEventListener('touchmove', onDragMove);
        document.addEventListener('touchend', onDragEnd);
    }, { passive: true });

    dom.ampSelectSvg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const change = e.deltaY < 0 ? -1 : 1;
        setAmpModeByIndex(state.currentAmpIndex + change);
    }, { passive: false });
}

function createKnobHTML(knob) {
    return `
    <div class="flex flex-col items-center" id="card-${knob.id}">
        <h3 class="text-xs font-black uppercase tracking-widest text-amber-100 -mb-2 lg:mb-1 font-brand">${knob.label}</h3>
        
        <svg class="knob-svg w-32 h-32 select-none" viewBox="110 110 292 292" data-id="${knob.id}">
            <ellipse class="knobShadow" cx="256" cy="256" rx="70" ry="70" style="fill: #303030; stroke: #202020; stroke-width: 4px;"/>
            <ellipse cx="256" cy="256" rx="45" ry="45" style="fill: #060606; stroke: #000000; stroke-width: 3px;"/>
            
            <g class="fill-amber-100 stroke-[3.5] stroke-amber-100" stroke-linecap="round">
                <text class="stroke-none" style="white-space: pre; font-family: Arial, sans-serif; font-size: 26.49px; font-weight: bold;" text-anchor="middle" dominant-baseline="central" x="204.00" y="346.07">0</text>
                <line x1="169.40" y1="306.00" x2="160.74" y2="311.00"/>
                <line x1="156.00" y1="256.00" x2="146.00" y2="256.00"/>
                <line x1="169.40" y1="206.00" x2="160.74" y2="201.00"/>
                <line x1="206.00" y1="169.40" x2="201.00" y2="160.74"/>
                <line class="stroke-7" x1="256.00" y1="156.00" x2="256.00" y2="146.00"/>
                <line x1="306.00" y1="169.40" x2="311.00" y2="160.74"/>
                <line x1="342.60" y1="206.00" x2="351.26" y2="201.00"/>
                <line x1="356.00" y1="256.00" x2="366.00" y2="256.00"/>
                <line x1="342.60" y1="306.00" x2="351.26" y2="311.00"/>
                <text class="stroke-none" style="white-space: pre; font-family: Arial, sans-serif; font-size: 26.49px; font-weight: bold;" text-anchor="middle" dominant-baseline="central" x="308.00" y="346.07">10</text>
            </g>

            <g class="pointerGroup" style="transform: rotate(210deg); transform-origin: 256px 256px;">
                <path d="M 249.387 189.974 Q 256 137.152 262.613 189.974 L 275.84 295.617 Q 282.453 348.438 269.227 348.438 L 242.773 348.438 Q 229.547 348.438 236.16 295.617 Z" style="stroke: #555555; fill: #080808; stroke-width: 3px; stroke-linejoin: bevel; stroke-linecap: round;"/>
                <path style="fill: none; stroke: #fff8e7; stroke-width: 6px; stroke-linecap: round;" d="M 256 162.01 L 256 204.425"/>
            </g>
        </svg>

        <div class="-mt-2 lg:mt-2 flex flex-col items-center">
            <input type="number" class="valueInput w-20 text-center bg-black text-amber-200 font-mono text-sm py-1 px-2 rounded border border-red-800 focus:outline-none focus:border-amber-500" value="${knob.initial.toFixed(1)}" min="0" max="10" step="0.1">
        </div>
    </div>
    `;
}

function clampKnobValue(val) {
    return Math.max(0, Math.min(10, val));
}

function valueToAngle(val) {
    return MIN_KNOB_ANGLE + (clampKnobValue(val) / 10) * (MAX_KNOB_ANGLE - MIN_KNOB_ANGLE);
}

function initKnobs() {
    if (dom.controlsContainer) {
        dom.controlsContainer.innerHTML = KNOBS_CONFIG.map(createKnobHTML).join('');
    }

    KNOBS_CONFIG.forEach((knob) => {
        const card = document.getElementById(`card-${knob.id}`);
        if (!card) return;

        const input = card.querySelector('.valueInput');
        const pointer = card.querySelector('.pointerGroup');
        const svgText = card.querySelector('.svgValueText');
        const svg = card.querySelector('.knob-svg');
        let motorAnimationTimer = null;

        const updateGauge = (val) => {
            pointer.style.transform = `rotate(${valueToAngle(val)}deg)`;
        };

        const setValue = (val) => {
            const clamped = clampKnobValue(val);
            pointer.classList.remove('motorized-moving');
            input.value = clamped.toFixed(1);
            updateGauge(clamped);
        };

        const setMotorizedValue = (targetVal, duration = MOTOR_ANIMATION_DURATION_MS) => {
            const clampedTarget = clampKnobValue(targetVal);
            const startVal = parseFloat(input.value) || 0;
            const startTime = performance.now();

            pointer.classList.add('motorized-moving');
            pointer.style.transform = `rotate(${valueToAngle(clampedTarget)}deg)`;

            if (motorAnimationTimer) {
                cancelAnimationFrame(motorAnimationTimer);
            }

            const animateMotorStep = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const currentVal = startVal + (clampedTarget - startVal) * easeProgress;

                input.value = currentVal.toFixed(1);
                if (svgText) {
                    svgText.textContent = currentVal.toFixed(1);
                }

                if (progress < 1) {
                    motorAnimationTimer = requestAnimationFrame(animateMotorStep);
                } else {
                    pointer.classList.remove('motorized-moving');
                    setValue(clampedTarget);
                }
            };

            motorAnimationTimer = requestAnimationFrame(animateMotorStep);
        };

        const getValue = () => parseFloat(input.value) || 0;

        state.knobRefs[knob.id] = { setValue, setMotorizedValue, getValue };

        input.addEventListener('input', () => {
            const val = parseFloat(input.value);
            if (!isNaN(val)) {
                updateGauge(val);
            }
        });

        input.addEventListener('blur', () => {
            const val = parseFloat(input.value);
            setValue(isNaN(val) ? 0 : val);
        });

        let isDragging = false;
        let startY = 0;
        let startVal = 0;

        const onMove = (e) => {
            if (!isDragging) return;
            const currentY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY);
            const deltaY = startY - currentY;
            setValue(startVal + (deltaY * KNOB_DRAG_SENSITIVITY));
        };

        const onEnd = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
        };

        const onStart = (e) => {
            isDragging = true;
            startY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY);
            startVal = getValue();
            pointer.classList.remove('motorized-moving');
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onEnd);
            document.addEventListener('touchmove', onMove);
            document.addEventListener('touchend', onEnd);
        };

        svg.addEventListener('mousedown', onStart);
        svg.addEventListener('touchstart', onStart, { passive: true });

        svg.addEventListener('wheel', (e) => {
            e.preventDefault();
            const change = e.deltaY < 0 ? 0.1 : -0.1;
            setValue(getValue() + change);
        }, { passive: false });

        setValue(knob.initial);
    });
}

// ============================================================================
// Effects & Speaker Simulation Controls
// ============================================================================

function updateModLabels() {
    if (!dom.fxModType || !dom.fxModParam3Label || !dom.fxModParam4Label) return;
    const config = MOD_PARAMS_CONFIG[dom.fxModType.value] || { p3: 'Param 3', p4: 'Param 4' };
    dom.fxModParam3Label.textContent = config.p3;
    dom.fxModParam4Label.textContent = config.p4;
}

function bindSliderDisplay(slider, display) {
    if (!slider || !display) return;
    slider.addEventListener('input', () => {
        display.textContent = parseFloat(slider.value).toFixed(1);
    });
}

function initEffectsControls() {
    if (dom.fxModType) {
        dom.fxModType.addEventListener('change', updateModLabels);
    }

    bindSliderDisplay(dom.fxComp, dom.fxCompVal);
    bindSliderDisplay(dom.fxModSpeed, dom.fxModSpeedVal);
    bindSliderDisplay(dom.fxModDepth, dom.fxModDepthVal);
    bindSliderDisplay(dom.fxModParam3, dom.fxModParam3Val);
    bindSliderDisplay(dom.fxModParam4, dom.fxModParam4Val);
    bindSliderDisplay(dom.fxDelayTime, dom.fxDelayTimeVal);
    bindSliderDisplay(dom.fxDelayFeedback, dom.fxDelayFeedbackVal);
    bindSliderDisplay(dom.fxDelayLevel, dom.fxDelayLevelVal);
    bindSliderDisplay(dom.fxReverbLevel, dom.fxReverbLevelVal);
}

// ============================================================================
// Storage & Preset Serialization
// ============================================================================

function loadLibraryFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (err) {
        console.error('Failed to load presets from storage:', err);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRESETS));
    return { ...DEFAULT_PRESETS };
}

function saveLibraryToStorage(library) {
    try {
        const sortedLibrary = Object.fromEntries(
            Object.entries(library).sort(([a], [b]) => a.localeCompare(b))
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedLibrary));
    } catch (err) {
        showStatus('Error saving preset.', 'error');
    }
}

function getCurrentSettings() {
    const settings = {
        ampMode: AMP_MODES[state.currentAmpIndex].name,
        compEnable: dom.fxCompEnable ? dom.fxCompEnable.checked : false,
        compVal: dom.fxComp ? parseFloat(dom.fxComp.value) : 0,
        modEnable: dom.fxModEnable ? dom.fxModEnable.checked : false,
        modType: dom.fxModType ? dom.fxModType.value : '',
        modSpeed: dom.fxModSpeed ? parseFloat(dom.fxModSpeed.value) : 0,
        modDepth: dom.fxModDepth ? parseFloat(dom.fxModDepth.value) : 0,
        modParam3: dom.fxModParam3 ? parseFloat(dom.fxModParam3.value) : 0,
        modParam4: dom.fxModParam4 ? parseFloat(dom.fxModParam4.value) : 0,
        delayEnable: dom.fxDelayEnable ? dom.fxDelayEnable.checked : false,
        delayType: dom.fxDelayType ? dom.fxDelayType.value : '',
        delayTime: dom.fxDelayTime ? parseFloat(dom.fxDelayTime.value) : 0,
        delayFeedback: dom.fxDelayFeedback ? parseFloat(dom.fxDelayFeedback.value) : 0,
        delayLevel: dom.fxDelayLevel ? parseFloat(dom.fxDelayLevel.value) : 0,
        reverbEnable: dom.fxReverbEnable ? dom.fxReverbEnable.checked : false,
        reverbType: dom.fxReverbType ? dom.fxReverbType.value : '',
        reverbLevel: dom.fxReverbLevel ? parseFloat(dom.fxReverbLevel.value) : 0,
        spSimEnable: dom.spSimEnable ? dom.spSimEnable.checked : false,
        spSimType: dom.spSimType ? dom.spSimType.value : ''
    };

    KNOBS_CONFIG.forEach((knob) => {
        if (state.knobRefs[knob.id]) {
            settings[knob.id] = state.knobRefs[knob.id].getValue();
        }
    });

    return settings;
}

function setSliderAndLabel(slider, label, value) {
    if (value !== undefined && slider && label) {
        slider.value = value;
        label.textContent = parseFloat(value).toFixed(1);
    }
}

function applyMotorizedSettings(settings) {
    if (settings.ampMode) {
        setAmpModeByName(settings.ampMode);
    }

    KNOBS_CONFIG.forEach((knob) => {
        if (settings[knob.id] !== undefined && state.knobRefs[knob.id]) {
            state.knobRefs[knob.id].setMotorizedValue(settings[knob.id], MOTOR_ANIMATION_DURATION_MS);
        }
    });

    if (dom.fxCompEnable) dom.fxCompEnable.checked = !!settings.compEnable;
    setSliderAndLabel(dom.fxComp, dom.fxCompVal, settings.compVal);

    if (dom.fxModEnable) dom.fxModEnable.checked = !!settings.modEnable;
    if (settings.modType !== undefined && dom.fxModType) dom.fxModType.value = settings.modType;
    updateModLabels();
    setSliderAndLabel(dom.fxModSpeed, dom.fxModSpeedVal, settings.modSpeed);
    setSliderAndLabel(dom.fxModDepth, dom.fxModDepthVal, settings.modDepth);
    setSliderAndLabel(dom.fxModParam3, dom.fxModParam3Val, settings.modParam3);
    setSliderAndLabel(dom.fxModParam4, dom.fxModParam4Val, settings.modParam4);

    if (dom.fxDelayEnable) {
        dom.fxDelayEnable.checked = settings.delayEnable !== undefined ? !!settings.delayEnable : (settings.delayType !== 'Off');
    }
    if (settings.delayType && settings.delayType !== 'Off' && dom.fxDelayType) {
        dom.fxDelayType.value = settings.delayType;
    }
    setSliderAndLabel(dom.fxDelayTime, dom.fxDelayTimeVal, settings.delayTime);
    setSliderAndLabel(dom.fxDelayFeedback, dom.fxDelayFeedbackVal, settings.delayFeedback);
    setSliderAndLabel(dom.fxDelayLevel, dom.fxDelayLevelVal, settings.delayLevel);

    if (dom.fxReverbEnable) {
        dom.fxReverbEnable.checked = settings.reverbEnable !== undefined ? !!settings.reverbEnable : (settings.reverbType !== 'Off');
    }
    if (settings.reverbType && settings.reverbType !== 'Off' && dom.fxReverbType) {
        dom.fxReverbType.value = settings.reverbType;
    }
    setSliderAndLabel(dom.fxReverbLevel, dom.fxReverbLevelVal, settings.reverbLevel);

    if (dom.spSimEnable) {
        dom.spSimEnable.checked = settings.spSimEnable !== undefined ? !!settings.spSimEnable : (settings.spSimType !== 'Off');
    }
    if (settings.spSimType && settings.spSimType !== 'Off' && dom.spSimType) {
        dom.spSimType.value = settings.spSimType;
    }
}

// ============================================================================
// Searchable Preset Dropdown & CRUD Actions
// ============================================================================

function updateItemHighlight() {
    if (!dom.presetDropdownMenu) return;
    const items = dom.presetDropdownMenu.querySelectorAll('.dropdown-item');
    items.forEach((item, index) => {
        if (index === state.currentFocusIndex) {
            item.classList.add('bg-neutral-800', 'text-amber-300');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('bg-neutral-800', 'text-amber-300');
        }
    });
}

function closeDropdown() {
    if (dom.presetDropdownMenu) {
        dom.presetDropdownMenu.classList.add('hidden');
    }
    state.currentFocusIndex = -1;
}

function renderPresetDropdown(filter = '', selectName = null) {
    if (!dom.presetDropdownMenu) return;
    const library = loadLibraryFromStorage();

    dom.presetDropdownMenu.innerHTML = '';
    state.currentFocusIndex = -1;

    const lowerFilter = filter.toLowerCase();
    const matchingKeys = Object.keys(library).filter((name) =>
        name.toLowerCase().includes(lowerFilter)
    );

    if (matchingKeys.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'px-3 py-2 text-neutral-500 text-xs italic';
        emptyDiv.textContent = 'No Presets found';
        dom.presetDropdownMenu.appendChild(emptyDiv);
        return;
    }

    matchingKeys.forEach((name, index) => {
        const item = document.createElement('div');
        item.className = 'dropdown-item px-3 py-2 text-slate-200 hover:bg-neutral-800 hover:text-amber-300 cursor-pointer transition-colors border-b border-neutral-800/50 last:border-none';
        item.textContent = name;

        if (selectName && name.toLowerCase() === selectName.toLowerCase()) {
            state.currentFocusIndex = index;
        }

        item.addEventListener('click', () => {
            if (dom.presetNameInput) {
                dom.presetNameInput.value = name;
            }
            loadSelectedPreset();
            closeDropdown();
        });

        dom.presetDropdownMenu.appendChild(item);
    });

    updateItemHighlight();
}

function refreshPresetSuggestions(selectedName = null) {
    if (selectedName && dom.presetNameInput) {
        dom.presetNameInput.value = selectedName;
    }
    renderPresetDropdown('', dom.presetNameInput ? dom.presetNameInput.value : null);
}

function handleSavePreset() {
    if (!dom.presetNameInput) return;
    const name = dom.presetNameInput.value.trim();
    if (!name) {
        showStatus('Please enter a preset name!', 'error');
        return;
    }

    const library = loadLibraryFromStorage();
    library[name] = getCurrentSettings();
    saveLibraryToStorage(library);
    refreshPresetSuggestions(name);
    showStatus(`Preset "${name}" saved!`);
}

function loadSelectedPreset() {
    if (!dom.presetNameInput) return;
    const selectedName = dom.presetNameInput.value.trim();
    if (!selectedName) return;

    const library = loadLibraryFromStorage();
    if (library[selectedName]) {
        applyMotorizedSettings(library[selectedName]);
        showStatus(`Preset "${selectedName}" loaded.`);
    } else {
        showStatus(`Preset "${selectedName}" not found.`, 'error');
    }
}

async function handleDeletePreset() {
    if (!dom.presetNameInput) return;
    const selectedName = dom.presetNameInput.value.trim();
    if (!selectedName) return;

    const decision = await openConfirmModal({
        title: 'Delete Preset',
        message: `Are you sure to delete preset "${selectedName}"?`,
        buttons: [
            {
                label: 'Cancel',
                value: 'cancel',
                cancel: true,
                className: 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 font-mono text-xs px-3.5 py-2 rounded transition-all'
            },
            {
                label: 'Delete',
                value: 'delete',
                className: 'bg-red-900/80 hover:bg-red-800 text-red-200 border border-red-700 font-mono text-xs font-semibold px-3.5 py-2 rounded transition-all'
            }
        ]
    });

    if (decision !== 'delete') return;

    const library = loadLibraryFromStorage();
    if (library[selectedName]) {
        delete library[selectedName];
        saveLibraryToStorage(library);
        dom.presetNameInput.value = '';
        refreshPresetSuggestions();
        showStatus(`Preset "${selectedName}" deleted.`);
    }
}

function handleExportPresets() {
    const library = loadLibraryFromStorage();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(library, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', 'dg60fx_presets.json');
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    showStatus('Presets exported to JSON.');
}

async function handleImportPresets(e) {
    const file = e.target.files[0];
    if (!file) return;

    const mode = await openConfirmModal({
        title: 'Import Presets',
        message: 'How to handle local presets? Note, that presets with the same name will always overwrite existing ones.',
        buttons: [
            {
                label: 'Cancel',
                value: 'cancel',
                cancel: true,
                className: 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 font-mono text-xs px-3.5 py-2 rounded transition-all'
            },
            {
                label: 'Merge',
                value: 'merge',
                className: 'bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-600/40 font-mono text-xs font-semibold px-3.5 py-2 rounded transition-all'
            },
            {
                label: 'Overwrite',
                value: 'overwrite',
                className: 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono text-xs font-bold px-3.5 py-2 rounded transition-all'
            }
        ]
    });

    if (!mode || mode === 'cancel') {
        e.target.value = '';
        return;
    }

    const overwriteAll = mode === 'overwrite';
    const reader = new FileReader();

    reader.onload = (event) => {
        try {
            const importedLibrary = JSON.parse(event.target.result);
            if (typeof importedLibrary === 'object' && importedLibrary !== null && !Array.isArray(importedLibrary)) {
                const nextLibrary = overwriteAll
                    ? { ...importedLibrary }
                    : Object.assign(loadLibraryFromStorage(), importedLibrary);

                saveLibraryToStorage(nextLibrary);
                refreshPresetSuggestions();
                showStatus(
                    overwriteAll
                        ? 'Local presets replaced with imported presets!'
                        : 'Presets imported successfully!'
                );
            } else {
                showStatus('Invalid JSON format.', 'error');
            }
        } catch (err) {
            showStatus('Error reading file.', 'error');
        } finally {
            e.target.value = '';
        }
    };

    reader.readAsText(file);
}

function initDropdownAndPresets() {
    document.addEventListener('keydown', (e) => {
        if (!dom.presetDropdownMenu || dom.presetDropdownMenu.classList.contains('hidden')) return;

        const items = dom.presetDropdownMenu.querySelectorAll('.dropdown-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (items.length > 0) {
                state.currentFocusIndex = (state.currentFocusIndex + 1) % items.length;
                updateItemHighlight();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (items.length > 0) {
                state.currentFocusIndex = (state.currentFocusIndex - 1 + items.length) % items.length;
                updateItemHighlight();
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (state.currentFocusIndex >= 0 && items[state.currentFocusIndex]) {
                items[state.currentFocusIndex].click();
            } else {
                loadSelectedPreset();
            }
            closeDropdown();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            closeDropdown();
        }
    });

    if (dom.presetNameInput) {
        dom.presetNameInput.addEventListener('keydown', (e) => {
            if (dom.presetDropdownMenu && dom.presetDropdownMenu.classList.contains('hidden')) {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    renderPresetDropdown('', dom.presetNameInput.value);
                    dom.presetDropdownMenu.classList.remove('hidden');
                }
            }
        });

        dom.presetNameInput.addEventListener('input', (e) => {
            const val = e.target.value;
            renderPresetDropdown(val, val);
            if (dom.presetDropdownMenu) {
                dom.presetDropdownMenu.classList.remove('hidden');
            }
        });

        dom.presetNameInput.addEventListener('focus', () => {
            renderPresetDropdown(dom.presetNameInput.value, dom.presetNameInput.value);
            if (dom.presetDropdownMenu) {
                dom.presetDropdownMenu.classList.remove('hidden');
            }
        });

        dom.presetNameInput.addEventListener('change', loadSelectedPreset);
    }

    if (dom.toggleDropdownBtn) {
        dom.toggleDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!dom.presetDropdownMenu) return;
            if (dom.presetDropdownMenu.classList.contains('hidden')) {
                renderPresetDropdown('', dom.presetNameInput ? dom.presetNameInput.value : null);
                dom.presetDropdownMenu.classList.remove('hidden');
            } else {
                closeDropdown();
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#presetNameInput') && !e.target.closest('#toggleDropdownBtn') && !e.target.closest('#presetDropdownMenu')) {
            closeDropdown();
        }
    });

    if (dom.floatingAlertClose) {
        dom.floatingAlertClose.addEventListener('click', hideAlert);
    }
    if (dom.savePresetBtn) {
        dom.savePresetBtn.addEventListener('click', handleSavePreset);
    }
    if (dom.loadPresetBtn) {
        dom.loadPresetBtn.addEventListener('click', loadSelectedPreset);
    }
    if (dom.deletePresetBtn) {
        dom.deletePresetBtn.addEventListener('click', handleDeletePreset);
    }
    if (dom.exportBtn) {
        dom.exportBtn.addEventListener('click', handleExportPresets);
    }
    if (dom.importInput) {
        dom.importInput.addEventListener('change', handleImportPresets);
    }
}

// ============================================================================
// Application Bootstrap
// ============================================================================

function initApp() {
    registerServiceWorker();
    initTabs();
    initAmpModeSwitch();
    initKnobs();
    initEffectsControls();
    initDropdownAndPresets();

    updateModLabels();
    refreshPresetSuggestions();

    const initialKeys = Object.keys(loadLibraryFromStorage());
    if (initialKeys.length > 0 && dom.presetNameInput) {
        dom.presetNameInput.value = initialKeys[0];
        loadSelectedPreset();
    }
}

initApp();