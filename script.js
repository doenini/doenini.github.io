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
