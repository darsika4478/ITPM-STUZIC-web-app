import React from 'react';
import MoodEmojiOption from './MoodEmojiOption';

const MOOD_VALUES = [1, 2, 3, 4, 5];

const MoodSelector = ({ selectedMood, onMoodSelect }) => {
    return (
        <div className="flex flex-col items-center gap-8">
            <div className="flex items-end justify-center gap-4 px-4 pb-6">
                {MOOD_VALUES.map((value) => (
                    <MoodEmojiOption
                        key={value}
                        mood={value}
                        selected={selectedMood}
                        onSelect={onMoodSelect}
                    />
                ))}
            </div>
        </div>
    );
};

export default MoodSelector;
