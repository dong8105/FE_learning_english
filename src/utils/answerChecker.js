/**
 * Comprehensive Answer Checker for English and Japanese study modes
 * Handles:
 * - Full-width characters & IDE space (\u3000)
 * - Hiragana, Katakana, Kanji, and Romaji matching
 * - Parentheses variations: e.g. "親切(な) (しんせつ(な))" matches "しんせつ", "しんせつな", "親切", "親切な", "shinsetsu", "shinsetsuna"
 * - Prefix/suffix markers (e.g. "~じん" vs "じん")
 * - Verb group numerals (e.g. "なきますⅠ" vs "なきます")
 */

export function kanaToRomaji(kana) {
    if (!kana) return '';
    const clean = kana.replace(/[ⅠⅡⅢ「」［］]/g, '').trim();
    const KANA_MAP = {
        'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
        'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
        'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
        'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
        'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
        'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
        'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
        'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
        'じゃ': 'ja',  'じゅ': 'ju',  'じょ': 'jo',
        'ぢゃ': 'ja',  'ぢゅ': 'ju',  'ぢょ': 'jo',
        'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
        'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
        'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
        'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho',
        'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho',
        'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',
        'ヒャ': 'hya', 'ヒュ': 'hyu', 'ヒョ': 'hyo',
        'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo',
        'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',
        'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',
        'ジャ': 'ja',  'ジュ': 'ju',  'ジョ': 'jo',
        'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo',
        'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo',
        'ティ': 'ti',  'ディ': 'di',  'トゥ': 'tu',  'ドゥ': 'du',
        'チェ': 'che', 'シェ': 'she', 'ジェ': 'je',
        'ファ': 'fa',  'フィ': 'fi',  'フェ': 'fe',  'フォ': 'fo',
        'ウィ': 'wi',  'ウェ': 'we',  'ウォ': 'wo',
        'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
        'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
        'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
        'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
        'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
        'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
        'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'mo': 'mo', 'も': 'mo',
        'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
        'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
        'わ': 'wa', 'を': 'o', 'ん': 'n',
        'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
        'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
        'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
        'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
        'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
        'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
        'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
        'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
        'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
        'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
        'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
        'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
        'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
        'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
        'ワ': 'wa', 'ヲ': 'o', 'ン': 'n',
        'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
        'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
        'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
        'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
        'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ぽ': 'po'
    };

    let result = '';
    let i = 0;
    while (i < clean.length) {
        if (clean[i] === 'っ' || clean[i] === 'ッ') {
            const nextPair = clean.slice(i + 1, i + 3);
            const nextSingle = clean.slice(i + 1, i + 2);
            const nextRomaji = KANA_MAP[nextPair] || KANA_MAP[nextSingle] || '';
            if (nextRomaji) result += nextRomaji[0];
            i++;
            continue;
        }
        if (clean[i] === 'ー') {
            if (result.length > 0) {
                const last = result[result.length - 1];
                if (['a', 'i', 'u', 'e', 'o'].includes(last)) result += last;
            }
            i++;
            continue;
        }
        const two = clean.slice(i, i + 2);
        if (KANA_MAP[two]) {
            result += KANA_MAP[two];
            i += 2;
            continue;
        }
        const one = clean[i];
        if (KANA_MAP[one]) {
            result += KANA_MAP[one];
        } else {
            result += one;
        }
        i++;
    }
    return result;
}

export function normalizeInput(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .trim()
        .replace(/[\u3000\s]+/g, ' ')
        .replace(/[（［【「]/g, '(')
        .replace(/[）］】」]/g, ')')
        .replace(/[〜～]/g, '~')
        .replace(/[.,!?;:・]/g, '')
        .trim();
}

/**
 * Checks if the user's input matches the word target
 * Supports English & Japanese flexibly
 */
export function isAnswerCorrect(userInput, word) {
    if (!userInput || !word) return false;

    const u = normalizeInput(userInput);
    if (!u) return false;

    const candidateSet = new Set();
    const candidateNoSpaces = new Set();

    const addCandidate = (text) => {
        if (!text) return;
        const n = normalizeInput(text);
        if (!n) return;

        candidateSet.add(n);
        candidateNoSpaces.add(n.replace(/\s+/g, ''));

        // Without parentheses: "親切(な)" -> "親切"
        const noParen = normalizeInput(n.replace(/\(.*?\)/g, ''));
        if (noParen) {
            candidateSet.add(noParen);
            candidateNoSpaces.add(noParen.replace(/\s+/g, ''));
        }

        // Parentheses stripped: "親切(な)" -> "親切な"
        const stripParenOnly = normalizeInput(n.replace(/[()]/g, ''));
        if (stripParenOnly) {
            candidateSet.add(stripParenOnly);
            candidateNoSpaces.add(stripParenOnly.replace(/\s+/g, ''));
        }

        // Strip prefix / suffix tildes: "~じん" -> "じん"
        const noTilde = normalizeInput(n.replace(/^[~〜\-]+|[~〜\-]+$/g, ''));
        if (noTilde) {
            candidateSet.add(noTilde);
            candidateNoSpaces.add(noTilde.replace(/\s+/g, ''));
        }

        // Strip verb group indicators: "なきますⅠ" -> "なきます"
        const noGroup = normalizeInput(n.replace(/[ⅠⅡⅢivx123]+$/i, ''));
        if (noGroup) {
            candidateSet.add(noGroup);
            candidateNoSpaces.add(noGroup.replace(/\s+/g, ''));
        }

        // If text contains Kana, also generate Romaji candidate
        if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
            const romajiGen = kanaToRomaji(noParen || n);
            if (romajiGen) {
                candidateSet.add(romajiGen);
                candidateNoSpaces.add(romajiGen.replace(/\s+/g, ''));
            }
        }
    };

    if (Array.isArray(word.acceptedAnswers)) {
        word.acceptedAnswers.forEach(addCandidate);
    }

    addCandidate(word.en);
    addCandidate(word.kanji);
    addCandidate(word.hiragana);
    addCandidate(word.romaji);
    addCandidate(word.displayWord);

    // If word.en is like "親切(な) (しんせつ(な))" or "私 (わたし)"
    if (word.en && (word.en.includes('(') || word.en.includes('（'))) {
        const raw = word.en.trim();
        if (raw.endsWith(')') || raw.endsWith('）')) {
            let depth = 0;
            let splitIdx = -1;
            for (let i = raw.length - 1; i >= 0; i--) {
                if (raw[i] === ')' || raw[i] === '）') depth++;
                else if (raw[i] === '(' || raw[i] === '（') {
                    depth--;
                    if (depth === 0) {
                        splitIdx = i;
                        break;
                    }
                }
            }
            if (splitIdx > 0) {
                const part1 = raw.slice(0, splitIdx).trim();
                const part2 = raw.slice(splitIdx + 1, -1).trim();
                addCandidate(part1);
                addCandidate(part2);
            }
        }
        raw.split(/\s+/).forEach(addCandidate);
    }

    // Direct match
    if (candidateSet.has(u)) return true;

    // Check with spaces stripped: e.g. "shinsetsu na" vs "shinsetsuna"
    const uNoSpace = u.replace(/\s+/g, '');
    if (candidateNoSpaces.has(uNoSpace)) return true;

    // Check without parentheses or tildes
    const uClean = normalizeInput(u.replace(/[()~〜\-]/g, ''));
    if (uClean && (candidateSet.has(uClean) || candidateNoSpaces.has(uClean.replace(/\s+/g, '')))) return true;

    // Check for na-adjectives with or without 'な'
    if (candidateSet.has(u + 'な') || candidateNoSpaces.has(uNoSpace + 'な')) return true;
    if (u.endsWith('な')) {
        const base = u.slice(0, -1).trim();
        if (candidateSet.has(base) || candidateNoSpaces.has(base.replace(/\s+/g, ''))) return true;
    }

    // Check for na-adjectives with Romaji: "shinsetsu na" or "shinsetsuna"
    if (u.endsWith(' na')) {
        const base = u.slice(0, -3).trim();
        if (candidateSet.has(base) || candidateNoSpaces.has(base.replace(/\s+/g, ''))) return true;
    }
    if (u.endsWith('na')) {
        const base = u.slice(0, -2).trim();
        if (candidateSet.has(base) || candidateNoSpaces.has(base.replace(/\s+/g, ''))) return true;
    }

    return false;
}
