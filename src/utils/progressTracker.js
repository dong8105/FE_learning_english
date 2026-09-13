const getProgressKey = () => {
    try {
        const savedUser = localStorage.getItem('engmaster_user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            if (user?.id) return `u_${user.id}_vocab_app_progress`;
        }
    } catch {}
    return 'guest_vocab_app_progress';
};

export const getProgress = () => {
    const key = getProgressKey();
    const data = localStorage.getItem(key);
    const parsed = data ? JSON.parse(data) : {};
    if (!parsed.words) parsed.words = {};
    if (!parsed.grammar) parsed.grammar = {};
    if (!parsed.srs) parsed.srs = {};
    return parsed;
};

export const saveProgress = (progress) => {
    const key = getProgressKey();
    localStorage.setItem(key, JSON.stringify(progress));

    try {
        const token = localStorage.getItem('engmaster_token');
        if (token) {
            fetch('http://localhost:5000/api/progress/vocab', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ data: progress })
            }).catch(() => {});
        }
    } catch {}
};

export const recordWordResult = (wordId, isCorrect) => {
    if (!wordId) return;
    const progress = getProgress();
    if (!progress.words[wordId]) {
        progress.words[wordId] = { correct: 0, total: 0 };
    }
    progress.words[wordId].total += 1;
    if (isCorrect) {
        progress.words[wordId].correct += 1;
        incrementStudyPlanProgress(progress);
    }
    saveProgress(progress);
};

export const getStudyPlan = () => {
    const progress = getProgress();
    if (!progress.studyPlan) {
        progress.studyPlan = {
            targetGroup: { type: 'all' },
            targetCount: 20,
            completedCount: 0,
            lastUpdated: new Date().toISOString().split('T')[0]
        };
        saveProgress(progress);
    } else {
        const today = new Date().toISOString().split('T')[0];
        if (progress.studyPlan.lastUpdated !== today) {
            progress.studyPlan.completedCount = 0;
            progress.studyPlan.lastUpdated = today;
            saveProgress(progress);
        }
    }
    return progress.studyPlan;
};

export const updateStudyPlan = (plan) => {
    const progress = getProgress();
    progress.studyPlan = { ...progress.studyPlan, ...plan, lastUpdated: new Date().toISOString().split('T')[0] };
    saveProgress(progress);
};

const incrementStudyPlanProgress = (progressObj) => {
    // Check if we need to reset first
    const today = new Date().toISOString().split('T')[0];
    if (!progressObj.studyPlan) {
        progressObj.studyPlan = { targetGroup: { type: 'all' }, targetCount: 20, completedCount: 0, lastUpdated: today };
    }
    if (progressObj.studyPlan.lastUpdated !== today) {
        progressObj.studyPlan.completedCount = 0;
        progressObj.studyPlan.lastUpdated = today;
    }
    
    // We increment count when user gets a word correct.
    // For simplicity, we just increment it. The exact group filtering during the session ensures they are studying the right group.
    progressObj.studyPlan.completedCount += 1;
};

export const recordGrammarResult = (topic, score, total) => {
    if (!topic) return;
    const progress = getProgress();
    if (!progress.grammar[topic]) {
        progress.grammar[topic] = { score: 0, total: 0, attempts: 0 };
    }
    progress.grammar[topic].score += score;
    progress.grammar[topic].total += total;
    progress.grammar[topic].attempts += 1;
    saveProgress(progress);
};

export const getRecommendations = (allWords) => {
    const progress = getProgress();
    
    // 1. Words to review (lowest accuracy)
    const wordStats = Object.keys(progress.words).map(id => {
        const stat = progress.words[id];
        return {
            id,
            accuracy: stat.correct / stat.total,
            total: stat.total
        };
    }).filter(stat => stat.total >= 1);
    
    wordStats.sort((a, b) => a.accuracy - b.accuracy);
    
    const weakWordIds = wordStats.filter(stat => stat.accuracy < 0.8).slice(0, 15).map(stat => stat.id);
    const weakWords = allWords.filter(w => weakWordIds.includes(w.id));

    // 2. Units to review (aggregate word accuracy by unit)
    const unitStats = {};
    allWords.forEach(word => {
        const stat = progress.words[word.id];
        if (stat) {
            if (!unitStats[word.unit]) {
                unitStats[word.unit] = { correct: 0, total: 0 };
            }
            unitStats[word.unit].correct += stat.correct;
            unitStats[word.unit].total += stat.total;
        }
    });

    const weakUnits = Object.keys(unitStats).map(unit => ({
        unit,
        accuracy: unitStats[unit].correct / unitStats[unit].total
    })).filter(u => u.accuracy < 0.75).sort((a, b) => a.accuracy - b.accuracy);

    // 3. Grammar topics to review
    const weakGrammar = Object.keys(progress.grammar).map(topic => {
        const stat = progress.grammar[topic];
        return {
            topic,
            accuracy: stat.score / stat.total
        };
    }).filter(g => g.accuracy < 0.8).sort((a, b) => a.accuracy - b.accuracy);

    return {
        weakWords,
        weakUnits,
        weakGrammar
    };
};

// --- SRS (Spaced Repetition System) using SM-2 Algorithm ---

export const getDueSrsWords = (allWords) => {
    const progress = getProgress();
    const now = Date.now();
    
    // Find words that have passed their nextReviewDate
    const dueWordIds = Object.keys(progress.srs).filter(id => {
        return progress.srs[id].nextReviewDate <= now;
    });

    const dueWords = allWords.filter(w => dueWordIds.includes(w.id));
    
    // Optionally mix in some completely new words if due words are low
    const maxNewWords = Math.max(0, 10 - dueWords.length);
    if (maxNewWords > 0) {
        const newWords = allWords
            .filter(w => !progress.srs[w.id])
            .sort(() => 0.5 - Math.random())
            .slice(0, maxNewWords);
        dueWords.push(...newWords);
    }
    
    return dueWords.sort(() => 0.5 - Math.random());
};

export const updateSrsWord = (wordId, quality) => {
    // quality: 0-5 scale
    // 5 - perfect response
    // 4 - correct response after a hesitation
    // 3 - correct response recalled with serious difficulty
    // 2 - incorrect response; where the correct one seemed easy to recall
    // 1 - incorrect response; the correct one remembered
    // 0 - complete blackout

    const progress = getProgress();
    let srsData = progress.srs[wordId];

    if (!srsData) {
        srsData = {
            repetition: 0,
            interval: 0,
            easeFactor: 2.5,
            nextReviewDate: Date.now()
        };
    }

    if (quality >= 3) {
        if (srsData.repetition === 0) {
            srsData.interval = 1;
        } else if (srsData.repetition === 1) {
            srsData.interval = 6;
        } else {
            srsData.interval = Math.round(srsData.interval * srsData.easeFactor);
        }
        srsData.repetition += 1;
    } else {
        srsData.repetition = 0;
        srsData.interval = 1;
    }

    srsData.easeFactor = srsData.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (srsData.easeFactor < 1.3) srsData.easeFactor = 1.3;

    // Convert interval (days) to milliseconds
    srsData.nextReviewDate = Date.now() + (srsData.interval * 24 * 60 * 60 * 1000);

    progress.srs[wordId] = srsData;
    saveProgress(progress);
};
