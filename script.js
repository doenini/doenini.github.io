// Initialize Lucide icons
lucide.createIcons();

// Intersection Observer for scroll animations (fade-in)
document.addEventListener("DOMContentLoaded", () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((el, index) => {
        // slight cascade effect
        el.style.transitionDelay = `${(index % 3) * 0.1}s`;
        observer.observe(el);
    });

    // 실시간 GitHub API 데이터 불러오기 실행
    // 도연 님의 깃허브 아이디 입력
    fetchGitHubRepos('doenini');
});

// GitHub API 실시간 통신 함수
async function fetchGitHubRepos(username) {
    const repoContainer = document.getElementById('github-repos');
    
    try {
        // 최근에 업데이트된 레포지토리 4개만 가져옴
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=4`);
        
        if (!response.ok) {
            throw new Error('GitHub API 요청에 실패했습니다.');
        }
        
        const repos = await response.json();
        
        repoContainer.innerHTML = ''; // 로딩 텍스트 제거
        
        if (repos.length === 0) {
            repoContainer.innerHTML = '<p class="no-repos">아직 공개된 프로젝트가 없습니다.</p>';
            return;
        }

        // 받아온 데이터를 HTML 카드로 변환
        repos.forEach(repo => {
            const repoElement = document.createElement('a');
            repoElement.href = repo.html_url; // 클릭 시 해당 레포지토리로 이동
            repoElement.target = '_blank';
            repoElement.className = 'repo-card';
            
            // 프로그래밍 언어 표시 (있는 경우만)
            const languageLabel = repo.language ? `<span class="repo-lang"><span class="lang-dot"></span>${repo.language}</span>` : '<span></span>';
            const description = repo.description ? repo.description : '데이터/개발 프로젝트 저장소입니다.';
            
            repoElement.innerHTML = `
                <div class="repo-header">
                    <i data-lucide="book-marked"></i>
                    <h4>${repo.name}</h4>
                </div>
                <p class="repo-desc">${description}</p>
                <div class="repo-footer">
                    ${languageLabel}
                    <span class="repo-stars"><i data-lucide="star"></i> ${repo.stargazers_count}</span>
                </div>
            `;
            
            repoContainer.appendChild(repoElement);
        });
        
        // 새로 생성된 카드의 아이콘 렌더링
        lucide.createIcons();
        
    } catch (error) {
        console.error('Error fetching repos:', error);
        repoContainer.innerHTML = '<p class="error-text">데이터를 불러오는데 실패했습니다. 깃허브 아이디를 확인해 주세요.</p>';
    }
}

// ==========================================
// AI Mock Search Logic
// ==========================================
const aiSearchInput = document.getElementById('aiSearchInput');
const aiSearchBtn = document.getElementById('aiSearchBtn');
const aiResponseContainer = document.getElementById('aiResponseContainer');
const aiLoading = document.getElementById('aiLoading');
const aiResponseText = document.getElementById('aiResponseText');

// Q&A Database based on intro.md
const qaDatabase = [
    {
        keywords: ['장점', '강점', '잘하는', '성격', '특장점'],
        answer: "제 장점은 문제의 본질을 파고드는 <strong>'원인 분석력'</strong>과 사소한 에지 케이스(Edge Case)도 놓치지 않는 <strong>'꼼꼼한 검증력'</strong>입니다. 임시방편이 아닌 근본 원인을 파악하여 데이터의 100% 신뢰도를 보장합니다!"
    },
    {
        keywords: ['단점', '약점', '부족한'],
        answer: "문제를 너무 깊게 파고들다 보니 가끔 작업 시간이 늘어나는 경향(예민함)이 있습니다. 하지만 이를 인지하고, 최근에는 <strong>우선순위를 설정하고 타협점을 찾는 연습</strong>을 통해 단점을 완벽한 디테일로 승화시키고 있습니다."
    },
    {
        keywords: ['프로젝트', '경험', '포트폴리오', '공모전', 'msa', '배송', '주문'],
        answer: "저는 <strong>데이터 분석 공모전 우수상(전처리 고도화)</strong> 경험과 더불어, Java Spring 기반의 <strong>MSA 구조 및 RabbitMQ 비동기 통신 시스템</strong>을 직접 구축하여 백엔드 인프라에 대한 깊은 이해도를 갖추고 있습니다."
    },
    {
        keywords: ['자격증', '스펙', '역량', '기술', '파이썬', 'sql', 'python', 'java'],
        answer: "저는 <strong>Python, SQL, Java</strong> 핵심 역량을 보유하고 있으며, <strong>ADsP, SQLD, ERP 2급</strong> 자격증을 취득했습니다. 또한 졸업유예 기간 내에 <strong>빅데이터분석기사</strong> 취득을 앞두고 있습니다."
    },
    {
        keywords: ['목표', '로드맵', '미래', '비전', '꿈', '앞으로'],
        answer: "제 목표는 단순히 분석 모델을 돌리는 것을 넘어, <strong>클라우드 환경(AWS/GCP) 데이터 웨어하우스 설계</strong>와 <strong>AI/ML 딥러닝 기술</strong>을 접목하여 전사적 데이터 프로덕트를 주도하는 리더가 되는 것입니다."
    },
    {
        keywords: ['소통', '협업', '갈등', '팀워크', '크루'],
        answer: "단순한 의견 교환을 넘어 <strong>데이터 기반의 논리적 소통</strong>을 지향합니다. 아르바이트 및 팀 프로젝트 경험을 통해, 무조건적인 양보보다는 열린 대화로 '건강한 타협점'을 찾아내는 소통 역량을 길렀습니다."
    },
    {
        keywords: ['안녕', '반가워', '누구', '도연', '이름', '자기소개'],
        answer: "안녕하세요! 저는 데이터 흐름 전체를 이해하고 비즈니스 인사이트를 도출하는 <strong>데이터 분석가 김도연</strong>입니다. 저에 대해 궁금한 점을 검색해 보세요! 😊"
    }
];

function handleAiSearch() {
    const query = aiSearchInput.value.trim().toLowerCase();
    if (!query) return;

    // Show loading UI
    aiResponseContainer.classList.remove('hidden');
    aiLoading.classList.remove('hidden');
    aiResponseText.classList.add('hidden');
    aiResponseText.innerHTML = '';

    // Simulate AI thinking delay (1.2s)
    setTimeout(() => {
        aiLoading.classList.add('hidden');
        aiResponseText.classList.remove('hidden');
        
        let foundAnswer = "앗, 그 질문에 대해서는 아직 학습하지 못했어요! 😅 아래 스크롤을 내려 제 상세한 포트폴리오를 직접 확인해 주시면 감사하겠습니다!";
        
        // Match keywords
        for (const item of qaDatabase) {
            if (item.keywords.some(kw => query.includes(kw))) {
                foundAnswer = item.answer;
                break;
            }
        }
        
        // Show answer with fade effect
        aiResponseText.innerHTML = foundAnswer;
        aiResponseText.style.opacity = 0;
        aiResponseText.style.transition = "opacity 0.5s ease-in-out";
        setTimeout(() => {
            aiResponseText.style.opacity = 1;
        }, 50);
        
    }, 1200);
}

// Event Listeners
if(aiSearchBtn) {
    aiSearchBtn.addEventListener('click', handleAiSearch);
}
if(aiSearchInput) {
    aiSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAiSearch();
        }
    });
}
