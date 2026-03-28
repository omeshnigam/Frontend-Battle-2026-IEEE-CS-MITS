import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'

// ==========================================
// 1. Custom Cursor Logic
// ==========================================
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');

document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0, ease: 'power2.out' });
    gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.3, ease: 'power2.out' });
});

let interactiveElements = document.querySelectorAll('a, button');
interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => follower.classList.add('hover'));
    el.addEventListener('mouseleave', () => follower.classList.remove('hover'));
});


// ==========================================
// 2. Three.js Hero Background (Particles)
// ==========================================
function initThree() {
    const canvas = document.getElementById('hero-canvas');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030014, 0.05);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Core Epic Group
    const epicGroup = new THREE.Group();
    scene.add(epicGroup);

    // 1. Inner Core (Solid Pulsating Icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.3 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    epicGroup.add(core);

    // 2. Outer Wireframe Globe (Icosahedron)
    const globeGeo = new THREE.IcosahedronGeometry(2.5, 2);
    const globeMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true, transparent: true, opacity: 0.15 });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    epicGroup.add(globe);

    // 3. Orbiting Rings (Data Streams)
    const ringGeo = new THREE.TorusGeometry(3.5, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.5 });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2;
    epicGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.y = Math.PI / 3;
    ring2.rotation.x = Math.PI / 4;
    epicGroup.add(ring2);

    // Light Mode Group (Sleek Torus Knot)
    const lightGroup = new THREE.Group();
    scene.add(lightGroup);
    
    const knotGeo = new THREE.TorusKnotGeometry(2.5, 0.4, 256, 32);
    const knotMat = new THREE.MeshBasicMaterial({ color: 0x9333ea, wireframe: true, transparent: true, opacity: 0.4 });
    const knot = new THREE.Mesh(knotGeo, knotMat);
    lightGroup.add(knot);

    // 4. Background Particles (Starfield / Nodes)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 30; // Spread wide
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.04,
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 7;

    // Interactive Raycaster for Hover Effects
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isHovering = false;

    // Mouse Tracking for Rotation Parallax
    let targetX = 0;
    let targetY = 0;

    document.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        targetX = (event.clientX / window.innerWidth) - 0.5;
        targetY = (event.clientY / window.innerHeight) - 0.5;

        // Raycast to check if mouse is over the epicGroup (approximate by checking the globe)
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(globe);
        
        if (intersects.length > 0) {
            if (!isHovering) {
                isHovering = true;
                gsap.to(epicGroup.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.5, ease: 'back.out(1.7)' });
                gsap.to(globeMat, { opacity: 0.4, duration: 0.3 });
                gsap.to(coreMat, { opacity: 0.8, color: 0xa855f7, duration: 0.3 });
            }
        } else {
            if (isHovering) {
                isHovering = false;
                gsap.to(epicGroup.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'power2.out' });
                gsap.to(globeMat, { opacity: 0.15, duration: 0.3 });
                gsap.to(coreMat, { opacity: 0.3, color: 0x3b82f6, duration: 0.3 });
            }
        }
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Theme Visibility Toggle
        const isLight = document.body.getAttribute('data-theme') === 'light';
        epicGroup.visible = !isLight;
        lightGroup.visible = isLight;

        if(!isLight) {
            // Dark Mode Rotations
            core.rotation.y -= 0.005;
            core.rotation.z += 0.003;
            ring1.rotation.z += 0.005;
            ring2.rotation.z -= 0.004;
            
            // Highly Interactive Globe Rotation mapped to cursor
            gsap.to(epicGroup.rotation, {
                y: (elapsedTime * 0.1) + (targetX * 3),
                x: (elapsedTime * 0.05) + (targetY * 2.5),
                duration: 1.2,
                ease: "power2.out"
            });
            
            // Pulse effect for core
            const pulse = Math.sin(elapsedTime * 2) * 0.1 + 1;
            core.scale.set(pulse, pulse, pulse);
        } else {
            // Light Mode Rotations
            // Highly Interactive Torus Knot Rotation mapped to cursor
            gsap.to(knot.rotation, {
                y: (elapsedTime * 0.2) + (targetX * 3),
                x: (elapsedTime * 0.1) + (targetY * 2.5),
                duration: 1.2,
                ease: "power2.out"
            });
            
            // Subtle breathing effect
            const breath = Math.sin(elapsedTime * 1.5) * 0.05 + 1;
            knot.scale.set(breath, breath, breath);
        }

        // Particle field drifting
        particlesMesh.rotation.y = elapsedTime * 0.02;

        // Parallax Mouse Interaction
        gsap.to(scene.rotation, {
            y: targetX * 0.5,
            x: targetY * 0.5,
            duration: 2
        });

        renderer.render(scene, camera);
    }

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
initThree();


// ==========================================
// 3. Fake Live Stats Logic
// ==========================================
function initLiveStats() {
    const submissionCounter = document.getElementById('submission-counter');
    let count = 320;
    
    // Simulate real-time submission count rising randomly
    setInterval(() => {
        if(Math.random() > 0.6) {
            count += Math.floor(Math.random() * 3) + 1;
            submissionCounter.innerText = count;
            gsap.fromTo(submissionCounter, { scale: 1.2, color: "#fff" }, { scale: 1, color: "var(--accent-secondary)", duration: 0.5 });
        }
    }, 4000);

    // Simple Countdown logic targetting 48 hours
    const countdownEl = document.getElementById('countdown-timer');
    let secondsLeft = 48 * 3600;

    setInterval(() => {
        secondsLeft--;
        const h = Math.floor(secondsLeft / 3600);
        const m = Math.floor((secondsLeft % 3600) / 60);
        const s = secondsLeft % 60;
        countdownEl.innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }, 1000);
}
initLiveStats();


// ==========================================
// 4. Smart Recommender Logic
// ==========================================
function initRecommender() {
    const skillOptions = document.querySelectorAll('.choice-btn[data-type="skill"]');
    const interestOptions = document.querySelectorAll('.choice-btn[data-type="interest"]');
    const stepInterest = document.getElementById('step-interest');
    const resultBox = document.getElementById('recommender-result');
    const trackNameEl = document.getElementById('rec-track-name');
    const trackDescEl = document.getElementById('rec-track-desc');

    let selections = {
        skill: null,
        interest: null
    };

    // Matrix for recommendations
    const recommendations = {
        "beginner-ai": { title: "API Integrations Hack", desc: "Use OpenAI/Gemini APIs to build cool wrapper apps without needing to train models." },
        "intermediate-ai": { title: "RAG & Agents", desc: "Build advanced RAG pipelines with Langchain and custom UI." },
        "pro-ai": { title: "Custom LLM Finetuning", desc: "Fine-tune small language models (SLM) for hyper-specific tasks." },

        "beginner-web3": { title: "DApp Starter", desc: "Build a simple decentralized voting app using scaffold-eth or thirdweb." },
        "intermediate-web3": { title: "DeFi Protocol", desc: "Build a staking pool with custom smart contracts." },
        "pro-web3": { title: "Zero Knowledge Proofs", desc: "Implement circuit-based ZK apps or rollups." },

        "beginner-fintech": { title: "Budget Tracker UI", desc: "Create a beautiful visual personal finance dashboard using mock Plaid APIs." },
        "intermediate-fintech": { title: "Micro-loans App", desc: "Develop a peer-to-peer lending system with automated risk scoring." },
        "pro-fintech": { title: "Algorithmic Trading Engine", desc: "Build a high-frequency trading simulator using live WebSocket feeds." },

        "beginner-health": { title: "Symptom Checker UI", desc: "Design an accessible frontend for medical diagnosis questionnaires." },
        "intermediate-health": { title: "Telemed Dashboard", desc: "Build a WebRTC video consulting platform for remote doctors." },
        "pro-health": { title: "AI Diagnostics", desc: "Implement edge-AI models to analyze X-ray or MRI data securely in the browser." },

        "beginner-sustain": { title: "Carbon Footprint Tracker", desc: "A simple gamified app to track daily carbon emissions based on user habits." },
        "intermediate-sustain": { title: "IoT Eco Dashboard", desc: "Hook up simulated IoT sensor data to a real-time energy tracking dashboard." },
        "pro-sustain": { title: "Grid Optimization", desc: "Develop predictive algorithms to optimize smart grid power distribution." },

        "beginner-open": { title: "Pomodoro Universe", desc: "Build a highly polished productivity app with intense visual feedback." },
        "intermediate-open": { title: "Collaboration Hub", desc: "Real-time cursor tracking and interactive whiteboard using WebSockets." },
        "pro-open": { title: "Custom Physics Engine", desc: "Build a high-performance WASM based 3D engine physics playground." }
    };

    function checkResult() {
        if(selections.skill && selections.interest) {
            const key = `${selections.skill}-${selections.interest}`;
            const rec = recommendations[key];
            if(rec) {
                trackNameEl.innerText = rec.title;
                trackDescEl.innerHTML = `${rec.desc}
                <div style="margin-top: 1.5rem; padding: 1rem; border-radius: 8px; background: rgba(168,85,247,0.1); border-left: 3px solid var(--accent-primary);">
                    <h5 style="margin-bottom: 0.5rem; color: #fff;">📚 Curated Learning Path</h4>
                    <ul style="list-style:none; font-size: 0.9rem;">
                        <li style="margin-bottom: 0.3rem;"><a href="#" style="color:var(--text-secondary); text-decoration:none; transition: color 0.3s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='var(--text-secondary)'">▶ Watch: Foundation Course into ${selections.interest.toUpperCase()}</a></li>
                        <li><a href="#" style="color:var(--text-secondary); text-decoration:none; transition: color 0.3s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='var(--text-secondary)'">📄 Read: Official Documentation Hub</a></li>
                    </ul>
                </div>`;
                resultBox.classList.remove('hidden');
                
                // gsap enter animation
                gsap.fromTo(resultBox, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "bounce.out" });
                
                // Refresh cursor elements
                interactiveElements = document.querySelectorAll('a, button');
                interactiveElements.forEach((el) => {
                    el.addEventListener('mouseenter', () => follower.classList.add('hover'));
                    el.addEventListener('mouseleave', () => follower.classList.remove('hover'));
                });
            }
        }
    }

    skillOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            skillOptions.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selections.skill = btn.dataset.val;
            
            // Enable next step
            stepInterest.classList.remove('disabled');
            gsap.fromTo(stepInterest, { opacity: 0.5, y: -10 }, { opacity: 1, y: 0, duration: 0.5 });
            checkResult();
        });
    });

    interestOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            interestOptions.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selections.interest = btn.dataset.val;
            checkResult();
        });
    });
}
initRecommender();

// ==========================================
// 5. AI Teammate Matchmaker (Simulated)
// ==========================================
function initMatchmaker() {
    const roleSelect = document.getElementById('user-role');
    const findBtn = document.getElementById('find-team-btn');
    const matchResults = document.getElementById('match-results');
    const squadContainer = document.getElementById('squad-container');

    const db = {
        frontend: [
            { icon: '⚙️', role: 'Backend / Smart Contract Dev', desc: 'To power your UI.' },
            { icon: '🎨', role: 'UI/UX Designer', desc: 'To perfect the visual hierarchy.' }
        ],
        backend: [
            { icon: '🖥️', role: 'React/Vue Frontend Dev', desc: 'To consume your APIs.' },
            { icon: '🧠', role: 'ML Ops Engineer', desc: 'To scale your infra.' }
        ],
        ml: [
            { icon: '📱', role: 'Fullstack Dev', desc: 'To wrap your models in a usable app.' },
            { icon: '📊', role: 'Data Engineer', desc: 'To pipeline the datasets.' }
        ],
        uiux: [
            { icon: '💻', role: 'Frontend Engineer', desc: 'To implement your Figma.' },
            { icon: '🔧', role: 'Backend Engineer', desc: 'To wire up the database.' }
        ]
    };

    findBtn.addEventListener('click', () => {
        const val = roleSelect.value;
        if(!val) return;
        
        // Button animation
        gsap.to(findBtn, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });

        squadContainer.innerHTML = '';
        const squadList = db[val];

        squadList.forEach((member, i) => {
            const card = document.createElement('div');
            card.className = 'squad-member';
            card.innerHTML = `
                <div style="font-size:2rem; margin-bottom:0.5rem;">${member.icon}</div>
                <h4 style="margin-bottom:0.3rem;">${member.role}</h4>
                <p style="font-size:0.85rem; color:#94a3b8;">${member.desc}</p>
            `;
            // Staggered entry animation
            gsap.fromTo(card, 
                { opacity: 0, scale: 0.8 }, 
                { opacity: 1, scale: 1, duration: 0.5, delay: i * 0.1, ease: 'back.out(1.7)' }
            );
            squadContainer.appendChild(card);
        });

        matchResults.classList.remove('hidden');
    });
}
initMatchmaker();

// ==========================================
// 6. Problem Explorer Interactions
// ==========================================
function initThemes() {
    const cards = document.querySelectorAll('.theme-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            // Toggle active state
            const isActive = card.classList.contains('active');
            
            // Close all
            cards.forEach(c => c.classList.remove('active'));
            
            // Open clicked
            if(!isActive) {
                card.classList.add('active');
            }
        });
    });
}
initThemes();

// ==========================================
// 7. Gamified Timeline (Scroll Animations)
// ==========================================
function initTimeline() {
    // We will use IntersectionObserver instead of GSAP ScrollTrigger to keep bundles small,
    // though GSAP is great, bounding rectangles work beautifully natively.
    const milestones = document.querySelectorAll('.milestone');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.5 });

    milestones.forEach(m => observer.observe(m));
}
initTimeline();

// ==========================================
// 8. Fake Login Dashboard Modal
// ==========================================
function initDashboard() {
    const loginBtn = document.getElementById('login-btn');
    const modal = document.getElementById('dashboard-modal');
    const closeBtn = document.getElementById('close-modal');

    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if(e.target === modal) {
            modal.classList.remove('active');
        }
    });
}
initDashboard();

// Refresh cursors for newly inserted DOM items potentially
interactiveElements = document.querySelectorAll('a, button, select');
interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => follower.classList.add('hover'));
    el.addEventListener('mouseleave', () => follower.classList.remove('hover'));
});

// ==========================================
// 9. FAQ Accordion Logic
// ==========================================
function initFaq() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all
            faqItems.forEach(f => {
                f.classList.remove('active');
                f.querySelector('.faq-icon').innerText = '+';
                f.querySelector('.faq-answer').style.display = 'none';
            });
            
            // Open clicked if it wasn't already open
            if(!isActive) {
                item.classList.add('active');
                item.querySelector('.faq-icon').innerText = '-';
                
                // GSAP slide down effect (simulated via display block and opacity)
                const answer = item.querySelector('.faq-answer');
                answer.style.display = 'block';
                gsap.fromTo(answer, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 });
            }
        });
    });
}
initFaq();

// ==========================================
// 10. Phase 3: UI Globals (Theme, Notifs, Tilt)
// ==========================================

// Theme Toggle
const themeBtn = document.getElementById('theme-toggle');
if(themeBtn) {
    let isDark = true;
    themeBtn.addEventListener('click', () => {
        isDark = !isDark;
        if(!isDark) {
            document.body.setAttribute('data-theme', 'light');
            themeBtn.innerText = '🌙';
        } else {
            document.body.removeAttribute('data-theme');
            themeBtn.innerText = '🌓';
        }
    });
}

// Notifications
const notifBtn = document.getElementById('notif-toggle');
const notifDropdown = document.getElementById('notif-dropdown');
if(notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('hidden');
        const badge = notifBtn.querySelector('.notif-badge');
        if(badge) badge.style.display = 'none'; // mark read
    });
    document.addEventListener('click', (e) => {
        if(!notifDropdown.contains(e.target) && !notifDropdown.classList.contains('hidden')) {
            notifDropdown.classList.add('hidden');
        }
    });
}

// 3D Tilt Micro-interactions
const tiltCards = document.querySelectorAll('.glass-card, .theme-card, .prize-card');
tiltCards.forEach(card => {
    // We overwrite transform slightly on mouse move, but transition smooths it
    card.style.transition = 'transform 0.1s ease-out, box-shadow 0.1s ease-out';
    
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -10; // max 10 deg
        const rotateY = ((x - centerX) / centerX) * 10;
        
        // Add subtle pop
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
        // Reset to original state (CSS takes over)
        card.style.transform = '';
    });
});

// ==========================================
// 11. Phase 3: Builder Assistant Wizard & Validator
// ==========================================

const guideFab = document.getElementById('guide-fab');
const guideModal = document.getElementById('guide-modal');
const closeGuide = document.getElementById('close-guide');
const steps = [document.getElementById('wizard-step-1'), document.getElementById('wizard-step-2'), document.getElementById('wizard-step-3')];
const progressSteps = document.querySelectorAll('.wizard-progress .progress-step');
const progressLines = document.querySelectorAll('.wizard-progress .progress-line');

let currentStep = 0;

if(guideFab && guideModal) {
    guideFab.addEventListener('click', () => {
        guideModal.classList.remove('hidden');
    });
    
    closeGuide.addEventListener('click', () => {
        guideModal.classList.add('hidden');
    });

    const nextBtns = document.querySelectorAll('.wizard-next');
    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if(currentStep < 2) {
                steps[currentStep].classList.add('hidden');
                currentStep++;
                steps[currentStep].classList.remove('hidden');
                
                progressSteps[currentStep].classList.add('active');
                if(currentStep > 0) progressLines[currentStep-1].classList.add('active');
            }
        });
    });
}

// Idea Validator Logic (Feature 2)
const validateBtn = document.getElementById('validate-idea-btn');
const ideaInput = document.getElementById('idea-input');
const ideaFeedback = document.getElementById('idea-feedback');
const fbFeas = document.getElementById('fb-feas');
const fbInno = document.getElementById('fb-inno');
const fbSug = document.getElementById('fb-sug');
const step2Next = document.getElementById('step-2-next');

if(validateBtn && ideaInput) {
    validateBtn.addEventListener('click', () => {
        const text = ideaInput.value.toLowerCase();
        if(text.length < 10) {
            alert('Please describe your idea in more detail! Use at least a few words.');
            return;
        }
        
        const originalText = validateBtn.innerText;
        validateBtn.querySelector('.btn-content').innerText = 'Validating AI Models...';
        
        setTimeout(() => {
            // Fake keyword heuristic logic
            if(text.includes('ai') || text.includes('machine learning') || text.includes('predict')) {
                fbFeas.innerHTML = 'High ✅';
                fbInno.innerHTML = 'High 🚀';
                fbSug.innerText = 'Excellent concept! Ensure you use a lightweight edge AI model for swift API responses.';
            } else if(text.includes('blockchain') || text.includes('web3') || text.includes('crypto')) {
                fbFeas.innerHTML = 'Medium ⚡';
                fbInno.innerHTML = 'High 🚀';
                fbSug.innerText = 'Great idea. Consider Layer-2 gas optimization and zero-knowledge proofs.';
            } else if(text.includes('health') || text.includes('medical') || text.includes('doctor')) {
                fbFeas.innerHTML = 'High ✅';
                fbInno.innerHTML = 'High 🚀';
                fbSug.innerText = 'Always needed. Secure the data stream to ensure HIPAA compliance and user trust.';
            } else {
                fbFeas.innerHTML = 'High ✅';
                fbInno.innerHTML = 'Medium ⚡';
                fbSug.innerText = 'Solid foundation. Try adding real-time WebSocket data or Gamification loops to boost innovation scores.';
            }
            
            ideaFeedback.classList.remove('hidden');
            validateBtn.style.display = 'none';
            step2Next.classList.remove('hidden');
        }, 1500);
    });
}

// Dashboard Modal Logic (Feature 3)
const loginBtn = document.getElementById('login-btn');
const dashboardModal = document.getElementById('dashboard-modal');
const closeDashboard = document.getElementById('close-dashboard');

if(loginBtn && dashboardModal) {
    loginBtn.addEventListener('click', () => {
        dashboardModal.classList.remove('hidden');
    });
    if(closeDashboard) {
        closeDashboard.addEventListener('click', () => {
            dashboardModal.classList.add('hidden');
        });
    }
}

// ==========================================
// 12. Mobile Hamburger Menu
// ==========================================
function initMobileMenu() {
    const hamburger = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');
    const navActions = document.getElementById('nav-actions');
    const glassNav = document.querySelector('.glass-nav');

    if (hamburger && navLinks && navActions) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            navActions.classList.toggle('active');
            
            // Add darker background when menu is open for better readability
            if (hamburger.classList.contains('active')) {
                glassNav.style.background = 'rgba(3, 0, 20, 0.95)';
            } else {
                glassNav.style.background = '';
            }
        });

        // Close menu when a link is clicked
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                navActions.classList.remove('active');
                glassNav.style.background = '';
            });
        });
    }
}
initMobileMenu();
