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

    // Navbar Scroll Effect with Blur & Hide/Show
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        let currentScroll = window.scrollY;

        // Add blur effect
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hide/Show logic
        if (currentScroll > lastScrollTop && currentScroll > 100) {
            // Scrolling down
            navbar.classList.add('navbar-hidden');
        } else {
            // Scrolling up
            navbar.classList.remove('navbar-hidden');
        }

        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // For Mobile or negative scrolling
    });

    // Scroll Reveal Animation
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    }); const revealElements = document.querySelectorAll('.project-card, .section h2, .hero-content > *, img');
    revealElements.forEach(el => {
        el.classList.add('reveal-on-scroll');
        observer.observe(el);
    });


    // Carousel Functionality
    const track = document.querySelector('.carousel-track');

    if (track) {
        const slides = Array.from(track.children);
        const nextButton = document.querySelector('.carousel-button.next');
        const prevButton = document.querySelector('.carousel-button.prev');
        const dotsNav = document.querySelector('.carousel-nav');
        const dots = Array.from(dotsNav.children);

        const slideWidth = slides[0].getBoundingClientRect().width;

        // Arrange the slides next to one another
        // actually we can just use flexbox (which is set in CSS), but let's be safe and let CSS handle the flow.
        // Wait, for a transform based slider, we usually need to know the width to translate.
        // Or we can just use percentage based translation: 0, -100%, -200% etc.
        // Let's use percentage based translation for responsiveness.

        const moveToSlide = (track, currentSlide, targetSlide) => {
            const targetIndex = slides.findIndex(slide => slide === targetSlide);
            const slideWidth = track.offsetWidth;
            currentTranslate = -targetIndex * slideWidth;
            prevTranslate = currentTranslate;
            track.style.transform = `translateX(${currentTranslate}px)`;
            currentSlide.classList.remove('current-slide');
            targetSlide.classList.add('current-slide');
        }

        const updateDots = (currentDot, targetDot) => {
            currentDot.classList.remove('current-slide');
            targetDot.classList.add('current-slide');
        }

        // Initial setup classes
        slides[0].classList.add('current-slide');

        // Initialize position variables
        let currentTranslate = 0;
        let prevTranslate = 0;
        let currentIndex = 0;

        // Dots
        dotsNav.addEventListener('click', e => {
            const targetDot = e.target.closest('button');

            if (!targetDot) return;

            const currentSlide = track.querySelector('.current-slide') || slides[0];
            const currentDot = dotsNav.querySelector('.current-slide') || dots[0];
            const targetIndex = dots.findIndex(dot => dot === targetDot);
            const targetSlide = slides[targetIndex];

            moveToSlide(track, currentSlide, targetSlide);
            updateDots(currentDot, targetDot);
        });

        // Swipe Functionality with drag-to-follow animation
        let touchStartX = 0;
        let touchCurrentX = 0;
        let isDragging = false;
        let animationID = 0;

        track.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            isDragging = true;
            animationID = requestAnimationFrame(animation);
            track.style.transition = 'none'; // Disable transition during drag
        });

        track.addEventListener('touchmove', e => {
            if (isDragging) {
                touchCurrentX = e.touches[0].clientX;
                currentTranslate = prevTranslate + touchCurrentX - touchStartX;
            }
        });

        track.addEventListener('touchend', () => {
            isDragging = false;
            cancelAnimationFrame(animationID);

            const movedBy = touchCurrentX - touchStartX;
            const threshold = 50;

            // Re-enable transition for snap animation
            track.style.transition = 'transform 0.5s ease-in-out';

            if (movedBy < -threshold && currentIndex < slides.length - 1) {
                // Swipe Left - Next
                currentIndex++;
                goToNextSlide();
            } else if (movedBy > threshold && currentIndex > 0) {
                // Swipe Right - Prev
                currentIndex--;
                goToPrevSlide();
            } else {
                // Snap back to current slide
                currentTranslate = prevTranslate;
                setSliderPosition();
            }
        });

        function animation() {
            setSliderPosition();
            if (isDragging) requestAnimationFrame(animation);
        }

        function setSliderPosition() {
            track.style.transform = `translateX(${currentTranslate}px)`;
        }

        const handleSwipe = () => {
            const threshold = 50;
            if (touchEndX < touchStartX - threshold) {
                goToNextSlide();
            } else if (touchEndX > touchStartX + threshold) {
                goToPrevSlide();
            }
        }

        const goToNextSlide = () => {
            const currentSlide = track.querySelector('.current-slide') || slides[0];
            let nextSlide = currentSlide.nextElementSibling;
            const currentDot = dotsNav.querySelector('.current-slide') || dots[0];
            let nextDot = currentDot.nextElementSibling;

            // Loop back to start
            if (!nextSlide) {
                nextSlide = slides[0];
                nextDot = dots[0];
            }

            moveToSlide(track, currentSlide, nextSlide);
            updateDots(currentDot, nextDot);
        };

        const goToPrevSlide = () => {
            const currentSlide = track.querySelector('.current-slide') || slides[0];
            let prevSlide = currentSlide.previousElementSibling;
            const currentDot = dotsNav.querySelector('.current-slide') || dots[0];
            let prevDot = currentDot.previousElementSibling;

            // Loop to end
            if (!prevSlide) {
                prevSlide = slides[slides.length - 1];
                prevDot = dots[dots.length - 1];
            }

            moveToSlide(track, currentSlide, prevSlide);
            updateDots(currentDot, prevDot);
        };

        // Next Button
        nextButton.addEventListener('click', goToNextSlide);

        // Prev Button
        prevButton.addEventListener('click', goToPrevSlide);
    }
});
