// --- CONFIGURATION ---
const API_BASE_URL = 'http://localhost:5000/api'; // Ensure this matches your Express server port

// --- UTILITIES ---
const formatCurrency = (price) => {
    return price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 });
};

// Global cache for packages (loaded once on setup)
let ALL_PACKAGES = []; 

// MOCK DATA (Removed for live data, but need PAGES for navigation)
const PAGES = ['home', 'destinations', 'about', 'gallery', 'register', 'feedback', 'contact'];
let currentSlide = 0;
let slideInterval;

let packageGrid, sortSelect, bookingModal, bookingForm, bookingMessage;

// --- API Functions (New) ---

async function fetchPackages() {
    try {
        const response = await fetch(`${API_BASE_URL}/packages`);
        if (!response.ok) throw new Error('Failed to fetch packages from API');
        const data = await response.json();
        // Cache the packages globally for modal lookup
        ALL_PACKAGES = data; 
        return data;
    } catch (error) {
        console.error("Could not fetch packages:", error);
        showModal("Data Error", "Could not fetch travel packages from the server. Please ensure the backend is running on http://localhost:5000.");
        return [];
    }
}

// --- Modal Functions ---

window.showModal = function(title, message) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('customModal').classList.remove('hidden');
    document.getElementById('customModal').classList.add('flex');
}

window.closeModal = function(event) {
    if (event && event.target.id === 'customModal') {
        document.getElementById('customModal').classList.add('hidden');
        document.getElementById('customModal').classList.remove('flex');
        return;
    }
    if (!event) {
        document.getElementById('customModal').classList.add('hidden');
        document.getElementById('customModal').classList.remove('flex');
    }
}

window.showBookingModal = function(packageId) {
    // Use the cached packages (ALL_PACKAGES) instead of MOCK_PACKAGES
    const pkg = ALL_PACKAGES.find(p => p.id === packageId); 
    if (!pkg) {
        showModal("Error", "Package details not found.");
        return;
    }

    document.getElementById('modal-package-id').value = packageId;
    const detailsContent = document.getElementById('modal-content-details');
    detailsContent.innerHTML = `
        <p class="text-lg font-semibold text-gray-800">${pkg.name}</p>
        <p class="text-base text-gray-600 mb-2">${pkg.destination} | ${pkg.duration} Days</p>
        <p class="text-3xl font-extrabold text-green-600">${formatCurrency(pkg.price)}</p>
    `;
    
    bookingForm.reset();
    bookingMessage.classList.add('hidden');
    bookingModal.classList.remove('hidden');
    bookingModal.classList.add('flex');
}

window.closeBookingModal = function(event) {
    if (event && event.target.id === 'booking-modal') {
        bookingModal.classList.add('hidden');
        bookingModal.classList.remove('flex');
        return;
    }
    if (!event) {
        bookingModal.classList.add('hidden');
        bookingModal.classList.remove('flex');
    }
}


// --- SPA Navigation & Utilities ---

window.navigate = function(pageId) {
    if (!PAGES.includes(pageId)) return;
    
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
    });

    const target = document.getElementById(pageId);
    if (target) {
        target.classList.remove('hidden');
        // This is a small trick to re-trigger CSS transitions
        void target.offsetWidth; 
        target.classList.add('active');
    }

    // Highlight the active navigation link (Desktop)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('font-bold', 'text-sky-600');
        // NOTE: The navigation links in index.html use navigate('pageId'). We fix the check here.
        if (link.onclick && link.onclick.toString().includes(`Maps('${pageId}')`)) { 
            link.classList.add('font-bold', 'text-sky-600');
        }
    });

    window.scrollTo(0, 0);
    lucide.createIcons();
}

window.toggleMobileMenu = function() {
    document.getElementById('mobileMenu').classList.toggle('hidden');
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('currentDateTime').textContent = now.toLocaleDateString(undefined, options);
    document.getElementById('currentYear').textContent = now.getFullYear();
}


// --- Carousel Logic (for Home page) ---

function setupCarousel() {
    const slidesContainer = document.getElementById('carouselSlides');
    const slides = document.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;

    const updateCarousel = () => {
        const offset = -currentSlide * 100;
        slidesContainer.style.transform = `translateX(${offset}%)`;
    };

    const nextSlide = () => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
    };

    const prevSlide = () => {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateCarousel();
    };

    document.getElementById('nextBtn').addEventListener('click', prevSlide);
    document.getElementById('prevBtn').addEventListener('click', nextSlide); // NOTE: Swapped to match button positions

    slideInterval = setInterval(nextSlide, 5000); // Auto-advance

    // Pause on hover
    const container = document.getElementById('carouselContainer');
    container.addEventListener('mouseenter', () => clearInterval(slideInterval));
    container.addEventListener('mouseleave', () => slideInterval = setInterval(nextSlide, 5000));
}


// --- Package Rendering & Sorting (for Destinations page) ---

function renderPackages(packagesToRender) {
    if (!packageGrid) return;

    packageGrid.innerHTML = '';
    
    const noResultsElement = document.getElementById('no-results');
    if (packagesToRender.length === 0) {
        noResultsElement.classList.remove('hidden');
    } else {
        noResultsElement.classList.add('hidden');
    }

    packagesToRender.forEach(pkg => {
        const cardHtml = `
            <div class="bg-white rounded-xl overflow-hidden shadow-lg card-hover transition duration-300">
                <img src="${pkg.imgUrl}" onerror="this.onerror=null;this.src='https://placehold.co/400x300/94a3b8/ffffff?text=Image+Error';" alt="${pkg.name}" class="w-full h-48 object-cover">
                <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-800 truncate mb-2">${pkg.name}</h3>
                    <p class="text-sm text-gray-500 flex items-center mb-3">
                        <i data-lucide="map-pin" class="w-4 h-4 mr-2 text-sky-500"></i> ${pkg.destination}
                    </p>
                    
                    <div class="flex justify-between items-center text-sm mb-4">
                        <span class="flex items-center text-yellow-500 font-semibold">
                            <i data-lucide="star" class="w-4 h-4 fill-yellow-500 mr-1"></i> ${pkg.rating}
                        </span>
                        <span class="text-gray-600 flex items-center">
                            <i data-lucide="clock" class="w-4 h-4 mr-1 text-gray-400"></i> ${pkg.duration} days
                        </span>
                    </div>

                    <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                        <span class="text-2xl font-extrabold text-sky-600">
                            ${formatCurrency(pkg.price)}
                        </span>
                        <button onclick="showBookingModal(${pkg.id})" class="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition duration-200 shadow-md">
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        `;
        packageGrid.insertAdjacentHTML('beforeend', cardHtml);
    });
    lucide.createIcons();
}

// Function updated to use ALL_PACKAGES (the cached data)
window.handleSort = function() {
    const sortBy = sortSelect.value;
    let packagesToRender = [...ALL_PACKAGES]; 

    if (sortBy === 'price-low') {
        packagesToRender.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
        packagesToRender.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'duration') {
        packagesToRender.sort((a, b) => b.duration - a.duration);
    }

    renderPackages(packagesToRender);
}


// --- Form Handlers (Integrated with API) ---

window.handleBookingSubmit = async function(event) {
    event.preventDefault();
    
    const packageId = document.getElementById('modal-package-id').value;
    const fullName = document.getElementById('full-name').value;
    const travelers = document.getElementById('travelers').value;
    const email = document.getElementById('email').value;

    // Use the cached package data
    const pkg = ALL_PACKAGES.find(p => p.id == packageId); 

    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ packageId, fullName, travelers, email })
        });
        
        if (!response.ok) throw new Error('Booking submission failed on server.');

        bookingMessage.innerHTML = `
            <i data-lucide="check-circle" class="w-5 h-5 mr-2"></i>
            Success! Booking for **${pkg ? pkg.name : 'Package ID: ' + packageId}** confirmed. Confirmation email sent to **${email}**. (Logged on backend console).
        `;
        
        event.target.querySelector('button[type="submit"]').disabled = true;

    } catch (error) {
        console.error("Booking Error:", error);
        bookingMessage.innerHTML = `<i data-lucide="x-circle" class="w-5 h-5 mr-2"></i> Error: Could not complete booking. Please check server status.`;
    }
    
    lucide.createIcons();
    bookingMessage.classList.remove('hidden');

    setTimeout(() => {
        closeBookingModal();
        event.target.querySelector('button[type="submit"]').disabled = false;
    }, 3000);
}

// Handler remains frontend-only (as no registration endpoint was defined)
// Replaced mock registration with API submission
window.handleRegistration = async function(event) {
    event.preventDefault();
    const form = event.target;
    
    // Get values directly from the form inputs
    const regName = form.regName.value;
    const regEmail = form.regEmail.value;
    const regPref = form.regPref.value;

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ regName, regEmail, regPref }) // Send data payload
        });

        const data = await response.json();

        if (!response.ok) {
            // Use the error message sent from the backend
            throw new Error(data.message || 'Registration failed.');
        }

        form.reset();
        showModal("Registration Success", `Welcome, ${regName}! Your profile has been saved and stored in the database.`);

    } catch (error) {
        console.error("Registration Error:", error);
        showModal("Registration Failed", error.message);
    }
}

// Load live feedback from the backend
window.loadFeedback = async () => {
    const feedbackList = document.getElementById('feedbackList');
    feedbackList.innerHTML = '<p class="text-gray-500 text-center py-4">Fetching recent traveler reviews...</p>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/feedback`);
        if (!response.ok) throw new Error('Failed to fetch feedback');
        const liveFeedback = await response.json(); // Use fetched data

        let html = '';
        if (liveFeedback.length === 0) {
            html = '<p class="text-gray-500 text-center py-4">No reviews yet. Be the first!</p>';
        } else {
            liveFeedback.forEach(feedback => {
                const stars = '⭐'.repeat(feedback.rating);
                // Use the backend's date field (feedback.date)
                const date = new Date(feedback.date).toLocaleDateString(); 
                
                html += `
                    <div class="bg-white p-4 rounded-lg shadow-md border border-gray-100 transition duration-200">
                        <div class="flex justify-between items-center mb-2">
                            <p class="font-semibold text-gray-800">${feedback.name}</p>
                            <p class="text-lg text-yellow-500">${stars}</p>
                        </div>
                        <p class="text-gray-600 text-sm italic">${feedback.comment}</p>
                        <p class="text-xs text-gray-400 mt-2 text-right">Date: ${date}</p>
                    </div>
                `;
            });
        }
        feedbackList.innerHTML = html;
        
    } catch (error) {
        console.error("Error fetching feedback:", error);
        feedbackList.innerHTML = '<p class="text-red-500 text-center py-4">Error loading feedback from server.</p>';
    }
};

// Submit feedback to the backend
window.handleFeedback = async function(event) {
    event.preventDefault();
    const form = event.target;
    
    const name = form.fbName.value || 'Anonymous Traveler';
    const rating = parseInt(form.fbRating.value, 10);
    const comment = form.fbComment.value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, rating, comment })
        });

        if (!response.ok) throw new Error('Failed to submit feedback to server');

        form.reset();
        await loadFeedback(); // Reload the list to show the new review
        showModal("Feedback Submitted", `Thank you for the ${rating}-star feedback! Your review has been successfully submitted and saved.`);

    } catch (error) {
        console.error("Error submitting feedback:", error);
        showModal("Submission Failed", "There was an error connecting to the server. Please check your network and try again.");
    }
}


// --- Initialization ---

window.setupSPA = async function() { // Made setupSPA async
    packageGrid = document.getElementById('package-grid');
    sortSelect = document.getElementById('sort-select');
    bookingModal = document.getElementById('booking-modal');
    bookingForm = document.getElementById('booking-form');
    bookingMessage = document.getElementById('booking-message');

    document.getElementById('mobileMenuButton').addEventListener('click', toggleMobileMenu);
    setInterval(updateDateTime, 1000);
    
    updateDateTime();
    navigate('home');
    setupCarousel();
    
    // Fetch and render packages from the API
    const initialPackages = await fetchPackages();
    renderPackages(initialPackages);
    
    loadFeedback(); // Load live feedback from the API
}