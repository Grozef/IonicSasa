/**
 * -----------------------------------------------------------------------------
 * TECHNICAL VOCABULARY FOR SPEECH RECOGNITION (CONTEXTUAL HINTS)
 * -----------------------------------------------------------------------------
 * * Purpose: This list contains domain-specific words (jargon, technical terms, 
 * company names) used during inspections.
 * * How it works: When the Speech Recognition feature is activated in the app, 
 * this list is passed as 'contextualStrings' to the native operating system's 
 * speech engine (Google Speech-to-Text on Android, Apple Speech Recognition 
 * on iOS).
 * * Benefit: The native engine uses these words as "hints" to temporarily 
 * prioritize them over standard vocabulary. This significantly improves the 
 * accuracy when transcribing difficult or easily confused technical terms 
 * (e.g., distinguishing "Lab" from "Love").
 * * Maintenance: This array must be kept up-to-date with common inspection jargon.
 */
export const TECHNICAL_TERMS: string[] = [
    'Lab',
    'Lab Loop',
    'Chromatographie', 
    'Spectrométrie', 
    'Viscosimètre',
    'Échantillon témoin',
    'Analyse microbiologique',
    'Zone blanche',
    'Débitmètre',
];