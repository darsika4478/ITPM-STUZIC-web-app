// Backend Recommendation Service API
// This file contains functions for server-side recommendation logic

/**
 * Backend Algorithm: Calculate recommendation score
 * Factors: Mood intensity, Activity type, Genre preference, Vocal preference
 * Returns: Ranked list of recommendations
 */

export const recommendationAlgorithm = {
  /**
   * Mood intensity factor (1-5 scale)
   */
  getMoodIntensity: (moodValue) => {
    const intensities = {
      1: 0.2,  // Sad - very low energy
      2: 0.4,  // Low - low energy
      3: 0.5,  // Neutral - medium energy
      4: 0.7,  // Good - higher energy
      5: 0.9   // Happy - very high energy
    };
    return intensities[moodValue] || 0.5;
  },

  /**
   * Activity intensity factor
   */
  getActivityIntensity: (activity) => {
    const intensities = {
      studying: 0.6,
      relaxing: 0.3,
      commuting: 0.5,
      workingout: 0.8
    };
    return intensities[activity] || 0.5;
  },

  /**
   * BPM recommendation based on mood and activity
   */
  getRecommendedBPM: (moodValue, activity) => {
    const moodIntensity = recommendationAlgorithm.getMoodIntensity(moodValue);
    const activityIntensity = recommendationAlgorithm.getActivityIntensity(activity);
    const combinedIntensity = (moodIntensity + activityIntensity) / 2;
    
    return Math.round(60 + combinedIntensity * 120); // 60-180 BPM range
  },

  /**
   * Genre compatibility scoring
   */
  scoreGenreCompatibility: (userGenre, trackGenre) => {
    if (!userGenre || !trackGenre) return 0.5;
    if (userGenre.toLowerCase() === trackGenre.toLowerCase()) return 1.0;
    
    // Define genre compatibility
    const compatibility = {
      lofi: ['ambient', 'electronic', 'classical'],
      ambient: ['lofi', 'jazz', 'classical'],
      jazz: ['ambient', 'classical'],
      classical: ['ambient', 'jazz'],
      electronic: ['lofi', 'pop'],
      pop: ['electronic', 'indie'],
      rock: ['indie', 'pop'],
      indie: ['rock', 'pop'],
      tamil: ['classical', 'ambient'] // Tamil music works well with classical/ambient
    };
    
    const compatibleGenres = compatibility[userGenre.toLowerCase()] || [];
    return compatibleGenres.includes(trackGenre.toLowerCase()) ? 0.8 : 0.3;
  },

  /**
   * Vocal preference scoring
   */
  scoreVocalPreference: (userVocal, trackVocal) => {
    if (!userVocal || !trackVocal) return 0.5;
    if (userVocal.toLowerCase() === trackVocal.toLowerCase()) return 1.0;
    if (userVocal.toLowerCase() === 'mixed') return 0.9; // Accept all if mixed
    return 0.3;
  },

  /**
   * Combined recommendation score (0-100)
   */
  calculateRecommendationScore: (track, userPreferences, mood) => {
    let score = 50; // Base score

    // Genre scoring (weight: 25%)
    const genreScore = recommendationAlgorithm.scoreGenreCompatibility(
      userPreferences.genre,
      track.genre
    );
    score += genreScore * 25;

    // Vocal preference scoring (weight: 25%)
    const vocalScore = recommendationAlgorithm.scoreVocalPreference(
      userPreferences.vocals,
      track.vocals
    );
    score += vocalScore * 25;

    // Activity matching (weight: 20%)
    if (track.activity === userPreferences.activity) {
      score += 20;
    } else if (track.activity === 'studying' && userPreferences.activity !== 'workingout') {
      score += 15;
    }

    // Mood matching (weight: 30%) - This is crucial
    if (track.mood === mood.label.toLowerCase()) {
      score += 30;
    }

    return Math.min(100, score);
  }
};

/**
 * Export for server-side use or API integration
 */
export default recommendationAlgorithm;
