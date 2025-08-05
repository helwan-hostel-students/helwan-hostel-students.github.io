document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const details = document.getElementsByTagName('details');

    const charMap = {
        'q': 'ض', 'w': 'ص', 'e': 'ث', 'r': 'ق', 't': 'ف',
        'y': 'غ', 'u': 'ع', 'i': 'ه', 'o': 'خ', 'p': 'ح',
        '[': 'ج', ']': 'د', 'a': 'ش', 's': 'س', 'd': 'ي',
        'f': 'ب', 'g': 'ل', 'h': 'ا', 'j': 'ت', 'k': 'ن',
        'l': 'م', ';': 'ك', "'": 'ط', 'z': 'ئ', 'x': 'ء',
        'c': 'ؤ', 'v': 'ر', 'b': 'لا', 'n': 'ى', 'm': 'ة',
        ',': 'و', '.': 'ز', '/': 'ظ'
    };

    function convertToArabic(text) {
        return text.toLowerCase().split('').map(char => charMap[char] || char).join('');
    }

    function searchFAQ() {
        const searchTerm = searchInput.value.trim();

        if (searchTerm === '') {
            searchResults.style.display = 'none';
            resetVisibility();
            return;
        }

        const arabicSearchTerm = convertToArabic(searchTerm);
        const questions = getAllQuestions();
        const matches = questions.filter(q => {
            const questionText = q.text.toLowerCase();
            return questionText.includes(arabicSearchTerm);
        });

        displaySearchResults(matches);
    }

    function getAllQuestions() {
        const questions = [];
        Array.from(details).forEach(detail => {
            const summary = detail.querySelector('summary');
            if (summary && !summary.classList.contains('main-summary')) {
                questions.push({
                    text: summary.textContent,
                    element: detail
                });
            }
        });
        return questions;
    }

    function displaySearchResults(matches) {
        searchResults.innerHTML = '';

        if (matches.length > 0) {
            matches.forEach(match => {
                const div = document.createElement('div');
                div.className = 'search-result-item';
                div.textContent = match.text;
                div.addEventListener('click', () => {
                    navigateToQuestion(match.element);
                });
                searchResults.appendChild(div);
            });
            searchResults.style.display = 'block';
        } else {
            searchResults.style.display = 'none';
        }
    }

    function navigateToQuestion(element) {
        resetVisibility();

        const overlay = document.getElementById('overlay');
        overlay.classList.add('active');

        let parent = element.parentElement;
        while (parent) {
            if (parent.tagName.toLowerCase() === 'details') {
                parent.open = true;
            }
            parent = parent.parentElement;
        }

        element.open = true;
        element.classList.add('highlight-question');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        searchInput.value = '';
        searchResults.style.display = 'none';

        setTimeout(() => {
            overlay.classList.remove('active');
            element.classList.remove('highlight-question');
        }, 2000);
    }

    function resetVisibility() {
        Array.from(details).forEach(detail => {
            detail.classList.remove('hidden');
            detail.open = false;
        });
    }

    document.addEventListener('click', (e) => {
        if (!searchResults.contains(e.target) && e.target !== searchInput) {
            searchResults.style.display = 'none';
        }
    });

    searchInput.addEventListener('input', searchFAQ);
    searchInput.addEventListener('focus', searchFAQ);
});
