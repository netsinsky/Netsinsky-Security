document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const transition = document.querySelector('.page-transition');
    
    // Remove the first navLinks event listener and replace with this single one
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the href before adding active class
            const href = this.getAttribute('href');
            if (!href || href === '#') return;

            // Add active class
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Start transition
            if (transition) {
                transition.classList.add('active');
                
                // Navigate after transition
                setTimeout(() => {
                    window.location.href = href;
                }, 500);
            } else {
                // If transition element not found, navigate immediately
                window.location.href = href;
            }
        });
    });

    // Slogan cycling effect
    const mainSlogan = document.getElementById('main-slogan');
    const slogans = ["Providing your Safety!", "Securing Your Future!"];
    let currentSloganIndex = 0;

    const cycleSlogan = () => {
        mainSlogan.style.animation = 'fadeOut 1s ease-out';
        setTimeout(() => {
            currentSloganIndex = (currentSloganIndex + 1) % slogans.length;
            mainSlogan.textContent = slogans[currentSloganIndex];
            mainSlogan.style.animation = 'fadeIn 2s ease-in forwards';
        }, 1000); // Wait for fade-out to complete
    };

    // Cycle the slogan every 7 seconds
    setInterval(cycleSlogan, 7000); // Adjust the interval time as needed

    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    const scrollThreshold = 100; // Amount of scroll before navbar changes

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add/remove scrolled class based on scroll position
        if (currentScroll > scrollThreshold) {
            navbar.classList.add('navbar--scrolled');
        } else {
            navbar.classList.remove('navbar--scrolled');
        }
        
        // Hide/show navbar based on scroll direction
        if (currentScroll > lastScroll && currentScroll > 200) { // Scrolling down & past threshold
            navbar.classList.add('navbar--hidden');
        } else { // Scrolling up
            navbar.classList.remove('navbar--hidden');
        }
        
        lastScroll = currentScroll;
    });

    // Smoke effect speed control
    document.addEventListener('scroll', () => {
        const scrollSpeed = Math.abs(window.scrollY - lastScroll) / 20; // Reduced sensitivity
        const smokeOverlay = document.querySelector('.smoke-overlay');
        const baseSpeed = 40;  // Slower base speed
        const minSpeed = 30;   // Slower minimum speed
        
        if (smokeOverlay) {
            const newDuration = Math.max(minSpeed, baseSpeed - scrollSpeed);
            smokeOverlay.style.animationDuration = `${newDuration}s`;
        }
    });

    // Add smooth scroll functionality for solution items
    document.querySelectorAll('.solution-item').forEach(item => {
        item.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetCard = document.querySelector(`.category-card[data-category="${targetId}"]`);
            
            if (targetCard) {
                // Add highlight effect
                targetCard.classList.add('highlight');
                
                // Smooth scroll
                targetCard.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center'
                });
                
                // Remove highlight after animation
                setTimeout(() => {
                    targetCard.classList.remove('highlight');
                }, 2000);
            }
        });
    });

    // Handle page load transition for solutions page
    if (window.location.pathname.includes('solutions')) {
        const radar = document.querySelector('.security-radar');
        if (radar) {
            radar.style.animation = 'radarAppear 1s ease-out 0.5s forwards';
            radar.style.opacity = '0';
        }
    }

    const VIRUSTOTAL_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API key

    async function scanUrl() {
        const urlInput = document.getElementById('urlInput').value;
        const resultsDiv = document.getElementById('scanResults');
        
        if (!urlInput) {
            alert('Please enter a URL');
            return;
        }

        resultsDiv.innerHTML = '<div class="loading">Scanning URL...</div>';

        try {
            // First, submit the URL
            const submitResponse = await fetch('https://www.virustotal.com/vtapi/v2/url/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `apikey=${VIRUSTOTAL_API_KEY}&url=${encodeURIComponent(urlInput)}`
            });

            const submitData = await submitResponse.json();

            // Wait a few seconds for analysis
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Get the results
            const resultResponse = await fetch(`https://www.virustotal.com/vtapi/v2/url/report?apikey=${VIRUSTOTAL_API_KEY}&resource=${encodeURIComponent(urlInput)}`);
            const resultData = await resultResponse.json();

            displayResults(resultData);
        } catch (error) {
            resultsDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }

    async function handleFileSelect() {
        const fileInput = document.getElementById('fileInput');
        const resultsDiv = document.getElementById('scanResults');
        const file = fileInput.files[0];

        if (!file) return;

        resultsDiv.innerHTML = '<div class="loading">Preparing file scan...</div>';

        try {
            // Get file hash (SHA-256)
            const fileHash = await calculateSHA256(file);

            // Check if file has been scanned before
            const response = await fetch(`https://www.virustotal.com/vtapi/v2/file/report?apikey=${VIRUSTOTAL_API_KEY}&resource=${fileHash}`);
            const data = await response.json();

            displayResults(data);
        } catch (error) {
            resultsDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }

    async function calculateSHA256(file) {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function displayResults(data) {
        const resultsDiv = document.getElementById('scanResults');
        
        if (data.response_code === 0) {
            resultsDiv.innerHTML = '<div class="no-results">No results found for this scan.</div>';
            return;
        }

        const positives = data.positives || 0;
        const total = data.total || 0;
        
        let resultsHTML = `
            <div class="scan-summary">
                <h4>Scan Results</h4>
                <p>Detections: ${positives}/${total}</p>
                <div class="progress-bar">
                    <div class="progress" style="width: ${(positives/total) * 100}%"></div>
                </div>
            </div>
        `;

        resultsDiv.innerHTML = resultsHTML;
    }
});
