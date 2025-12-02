document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');

            // Animate links
            const links = document.querySelectorAll('.nav-links a');
            links.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });
        });
    }

    // Navbar Scroll Effect with Blur
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Purple and cyan blobs with liquid effect
    const parallaxShapes = document.querySelectorAll('.parallax-shape');

    // Better mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

    // Blob states
    const blobs = Array.from(parallaxShapes).map((shape, index) => ({
        element: shape,
        targetX: window.innerWidth / 2,
        targetY: window.innerHeight / 2,
        currentX: window.innerWidth / 2,
        currentY: window.innerHeight / 2,
        velocityX: 0,
        velocityY: 0,
        autonomousAngle: Math.random() * Math.PI * 2,
        autonomousSpeed: 0.3 + Math.random() * 0.2,
        index: index
    }));

    let time = 0;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    // Track mouse position (desktop only)
    if (!isMobile) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
    }

    // Smooth animation loop with liquid morphing
    function animate() {
        time += 0.03;

        blobs.forEach((blob, index) => {
            const oldX = blob.currentX;
            const oldY = blob.currentY;

            if (isMobile) {
                // Mobile: Autonomous movement
                blob.autonomousAngle += (Math.random() - 0.5) * 0.15;
                blob.targetX += Math.cos(blob.autonomousAngle) * blob.autonomousSpeed;
                blob.targetY += Math.sin(blob.autonomousAngle) * blob.autonomousSpeed;

                // Bounce off edges
                const margin = 150;
                if (blob.targetX < margin) {
                    blob.targetX = margin;
                    blob.autonomousAngle = Math.PI - blob.autonomousAngle;
                }
                if (blob.targetX > window.innerWidth - margin) {
                    blob.targetX = window.innerWidth - margin;
                    blob.autonomousAngle = Math.PI - blob.autonomousAngle;
                }
                if (blob.targetY < margin) {
                    blob.targetY = margin;
                    blob.autonomousAngle = -blob.autonomousAngle;
                }
                if (blob.targetY > window.innerHeight - margin) {
                    blob.targetY = window.innerHeight - margin;
                    blob.autonomousAngle = -blob.autonomousAngle;
                }

                // Attraction/repulsion between blobs
                blobs.forEach((otherBlob, otherIndex) => {
                    if (index !== otherIndex) {
                        const dx = otherBlob.currentX - blob.currentX;
                        const dy = otherBlob.currentY - blob.currentY;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        // Mix when close, separate when too close
                        if (distance > 100 && distance < 250) {
                            // Attract
                            blob.targetX += dx * 0.008;
                            blob.targetY += dy * 0.008;
                        } else if (distance < 100) {
                            // Repel
                            blob.targetX -= dx * 0.015;
                            blob.targetY -= dy * 0.015;
                        }
                    }
                });
            } else {
                // Desktop: Follow mouse
                blob.targetX = mouseX;
                blob.targetY = mouseY;
            }

            // Smooth easing towards target position
            blob.currentX += (blob.targetX - blob.currentX) * 0.08;
            blob.currentY += (blob.targetY - blob.currentY) * 0.08;

            blob.velocityX = blob.currentX - oldX;
            blob.velocityY = blob.currentY - oldY;

            // Center the shape on position
            const offsetX = blob.currentX - window.innerWidth / 2;
            const offsetY = blob.currentY - window.innerHeight / 2;

            // More organic morphing - multiple sine waves for complex shapes
            const morph1 = 25 + Math.sin(time * 2.3 + index * 0.5) * 25 + Math.cos(time * 0.7) * 10;
            const morph2 = 25 + Math.cos(time * 1.8 + index * 0.5) * 25 + Math.sin(time * 1.1) * 10;
            const morph3 = 25 + Math.sin(time * 2.7 + 1 + index * 0.5) * 25 + Math.cos(time * 0.9) * 10;
            const morph4 = 25 + Math.cos(time * 2.1 + 2 + index * 0.5) * 25 + Math.sin(time * 1.3) * 10;

            // Increased stretch based on velocity
            const speed = Math.sqrt(blob.velocityX * blob.velocityX + blob.velocityY * blob.velocityY);
            const stretchX = 1 + Math.abs(blob.velocityX) * 0.08;
            const stretchY = 1 + Math.abs(blob.velocityY) * 0.08;

            // Add rotation based on movement direction
            const angle = Math.atan2(blob.velocityY, blob.velocityX) * (180 / Math.PI);
            const rotation = speed > 0.5 ? angle * 0.1 : 0;

            // Apply transform with liquid deformation
            blob.element.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${stretchX}, ${stretchY}) rotate(${rotation}deg)`;

            // Apply organic border radius for blob-like movement
            const inner = blob.element.querySelector('.shape-inner');
            if (inner) {
                inner.style.borderRadius = `${morph1}% ${morph2}% ${morph3}% ${morph4}% / ${morph4}% ${morph3}% ${morph2}% ${morph1}%`;
            }
        });

        requestAnimationFrame(animate);
    }

    // Start animation
    animate();

    // Scroll Reveal Animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.project-card, .section h2, .hero-content > *');
    revealElements.forEach(el => {
        el.classList.add('reveal-on-scroll');
        observer.observe(el);
    });
});
