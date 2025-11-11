// ===================================
// THREE.JS SETUP - SOFT 3D BACKGROUND
// ===================================
let scene, camera, renderer, logoMeshes, particlesMesh;

function initThreeJS() {
    const canvas = document.getElementById('threejs-canvas');
    if (!canvas) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x1a1d29, 1);
    camera.position.z = 30;

    camera.position.z = 30;

    // Soft Lighting
    const ambientLight = new THREE.AmbientLight(0x9bb0d8, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6c7fd8, 0.8);
    pointLight1.position.set(15, 15, 15);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x7f95d1, 0.6);
    pointLight2.position.set(-15, -15, 10);
    scene.add(pointLight2);

    // Create floating 3D tech logos
    createLogoMeshes();
    
    // Create particles
    createParticles();
    
    // Start animation
    animate();
}

function createLogoMeshes() {
    const logos = [
        { name: 'HTML', color: 0xd86c6c, text: 'HTML' },
        { name: 'CSS', color: 0x6c8fd8, text: 'CSS' },
        { name: 'JS', color: 0xd8c86c, text: 'JS' },
        { name: 'PHP', color: 0x9c7fb8, text: 'PHP' },
        { name: 'MySQL', color: 0x6c9fb8, text: 'MySQL' },
        { name: 'Python', color: 0x6ca5d8, text: 'Python' },
    ];

    logoMeshes = [];

    logos.forEach((logo, index) => {
        // Create canvas for text
        const textCanvas = document.createElement('canvas');
        textCanvas.width = 512;
        textCanvas.height = 512;
        const ctx = textCanvas.getContext('2d');
        
        // Draw soft gradient background
        const gradient = ctx.createLinearGradient(0, 0, 512, 512);
        const colorHex = '#' + logo.color.toString(16).padStart(6, '0');
        gradient.addColorStop(0, colorHex);
        gradient.addColorStop(1, colorHex + 'cc');
        ctx.fillStyle = gradient;
        
        // Draw rounded rectangle
        ctx.beginPath();
        ctx.roundRect(0, 0, 512, 512, 60);
        ctx.fill();
        
        // Draw text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 120px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(logo.text, 256, 256);
        
        const texture = new THREE.CanvasTexture(textCanvas);
        
        // Create 3D card geometry
        const geometry = new THREE.BoxGeometry(5, 5, 0.8);
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 50,
            specular: 0x6c7fd8,
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Position in circle
        const angle = (Math.PI * 2 * index) / logos.length;
        const radius = 25;
        mesh.position.x = Math.cos(angle) * radius;
        mesh.position.y = Math.sin(angle) * radius;
        mesh.position.z = (Math.random() - 0.5) * 10;
        
        // Random rotation
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        
        // Store animation data
        mesh.userData = {
            velocityX: (Math.random() - 0.5) * 0.01,
            velocityY: (Math.random() - 0.5) * 0.01,
            velocityZ: (Math.random() - 0.5) * 0.005,
            rotationSpeedX: (Math.random() - 0.5) * 0.005,
            rotationSpeedY: (Math.random() - 0.5) * 0.005,
            floatOffset: Math.random() * Math.PI * 2,
        };
        
        scene.add(mesh);
        logoMeshes.push(mesh);
    });
}

function createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 80;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.12,
        color: 0x9bb0d8,
        transparent: true,
        opacity: 0.5,
    });

    particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
}

// Mouse interaction
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

document.addEventListener('mousemove', (event) => {
    targetX = (event.clientX / window.innerWidth) * 2 - 1;
    targetY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Animation loop
let time = 0;

function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    // Smooth mouse follow
    mouseX += (targetX - mouseX) * 0.05;
    mouseY += (targetY - mouseY) * 0.05;

    // Animate logos
    if (logoMeshes) {
        logoMeshes.forEach((mesh) => {
            // Floating motion
            mesh.position.y += Math.sin(time * 0.5 + mesh.userData.floatOffset) * 0.01;
            
            // Gentle movement
            mesh.position.x += mesh.userData.velocityX;
            mesh.position.z += mesh.userData.velocityZ;

            // Bounce back
            if (Math.abs(mesh.position.x) > 30) {
                mesh.userData.velocityX *= -1;
            }
            if (Math.abs(mesh.position.y) > 20) {
                mesh.userData.velocityY *= -1;
            }
            if (Math.abs(mesh.position.z) > 15) {
                mesh.userData.velocityZ *= -1;
            }

            // Rotation
            mesh.rotation.x += mesh.userData.rotationSpeedX;
            mesh.rotation.y += mesh.userData.rotationSpeedY;
        });
    }

    // Rotate particles
    if (particlesMesh) {
        particlesMesh.rotation.y += 0.0003;
    }

    // Camera follow mouse
    if (camera) {
        camera.position.x += (mouseX * 3 - camera.position.x) * 0.03;
        camera.position.y += (mouseY * 3 - camera.position.y) * 0.03;
        camera.lookAt(scene.position);
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Handle resize
window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

// Initialize Three.js when DOM is loaded
if (typeof THREE !== 'undefined') {
    window.addEventListener('load', initThreeJS);
} else {
    console.warn('Three.js not loaded');
}

// ===================================
// NAVIGATION FUNCTIONALITY
// ===================================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle mobile menu
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Active navigation link based on scroll position
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

// ===================================
// TYPING ANIMATION
// ===================================
const typingText = document.querySelector('.typing-text');
const texts = [
    'Full Stack Developer',
    'Web Developer',
    'Problem Solver',
    'Tech Enthusiast'
];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function typeText() {
    const currentText = texts[textIndex];
    
    if (isDeleting) {
        typingText.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
    } else {
        typingText.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
    }
    
    if (!isDeleting && charIndex === currentText.length) {
        isDeleting = true;
        typingSpeed = 2000;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        typingSpeed = 500;
    }
    
    setTimeout(typeText, typingSpeed);
}

// Start typing animation
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(typeText, 1000);
});

// ===================================
// SKILL BARS ANIMATION
// ===================================
const skillBars = document.querySelectorAll('.skill-progress');

function animateSkillBars() {
    skillBars.forEach(bar => {
        const progress = bar.getAttribute('data-progress');
        const barPosition = bar.getBoundingClientRect().top;
        const screenPosition = window.innerHeight;
        
        if (barPosition < screenPosition) {
            bar.style.width = progress + '%';
        }
    });
}

window.addEventListener('scroll', animateSkillBars);
window.addEventListener('load', animateSkillBars);

// ===================================
// FADE-IN ANIMATION ON SCROLL
// ===================================
const fadeElements = document.querySelectorAll('.skill-card, .project-card, .info-item, .about-text, .contact-info, .contact-form');

fadeElements.forEach(element => {
    element.classList.add('fade-in');
});

function checkFadeIn() {
    fadeElements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight - 100;
        
        if (elementPosition < screenPosition) {
            element.classList.add('visible');
        }
    });
}

window.addEventListener('scroll', checkFadeIn);
window.addEventListener('load', checkFadeIn);

// ===================================
// BACK TO TOP BUTTON
// ===================================
const backToTopButton = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===================================
// CONTACT FORM HANDLING
// ===================================
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    if (name && email && subject && message) {
        alert('Thank you for your message! I will get back to you soon.');
        contactForm.reset();
    } else {
        alert('Please fill in all fields.');
    }
});

// ===================================
// SMOOTH SCROLLING
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// PARALLAX EFFECT ON HERO
// ===================================
window.addEventListener('scroll', () => {
    const heroContent = document.querySelector('.hero-content');
    const scrolled = window.pageYOffset;
    
    if (heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroContent.style.opacity = 1 - (scrolled / 700);
    }
});

// ===================================
// 3D TILT EFFECT ON CARDS
// ===================================
const projectCards = document.querySelectorAll('.project-card');
const skillCards = document.querySelectorAll('.skill-card');
const infoItems = document.querySelectorAll('.info-item');

function add3DTiltEffect(cards) {
    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
}

add3DTiltEffect(projectCards);
add3DTiltEffect(skillCards);
add3DTiltEffect(infoItems);

// ===================================
// FORM INPUT ANIMATIONS
// ===================================
const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');

formInputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        if (this.value === '') {
            this.parentElement.classList.remove('focused');
        }
    });
});

// ===================================
// LOADING ANIMATION
// ===================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

console.log('🚀 3D Portfolio loaded successfully with soft colors!');
