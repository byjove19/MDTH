// Enhanced API Configuration
const API_BASE_URL = '/api';
let userData = null;
let userCourses = [];
let featuredCourses = [];
let swiper = null;

// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const themeToggle = document.getElementById('themeToggle');
const logoutBtn = document.getElementById('logoutBtn');
const notificationBtn = document.getElementById('notificationBtn');
const searchInput = document.getElementById('searchInput');
const welcomeName = document.getElementById('welcomeName');

// User data elements
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const userRole = document.getElementById('userRole');

// Stats elements
const statCourses = document.getElementById('statCourses');
const statHours = document.getElementById('statHours');
const statProgress = document.getElementById('statProgress');
const statCertificates = document.getElementById('statCertificates');
const overallProgress = document.getElementById('overallProgress');

// Welcome stats
const streakDays = document.getElementById('streakDays');
const weeklyHours = document.getElementById('weeklyHours');
const achievements = document.getElementById('achievements');

// Content elements
const upcomingList = document.getElementById('upcomingList');
const coursesGrid = document.getElementById('coursesGrid');
const featuredCoursesContainer = document.getElementById('featuredCourses');
const activityList = document.getElementById('activityList');
const noCoursesState = document.getElementById('noCoursesState');
const featuredCoursesSection = document.getElementById('featuredCoursesSection');

// Responsive Header Fix
let lastScrollTop = 0;
const header = document.querySelector('.dashboard-header');

// Fix search bar scrolling issue
function fixHeaderScroll() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    if (currentScroll > 100) {
        header.classList.add('header-scrolled');
    } else {
        header.classList.remove('header-scrolled');
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}

// Initialize Swiper with responsive settings
function initSwiper() {
    swiper = new Swiper('#coursesSwiper', {
        slidesPerView: 'auto',
        spaceBetween: 20,
        centeredSlides: false,
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            320: {
                slidesPerView: 1,
                spaceBetween: 15
            },
            480: {
                slidesPerView: 1,
                spaceBetween: 15
            },
            640: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 25
            },
            1200: {
                slidesPerView: 4,
                spaceBetween: 25
            }
        }
    });
}

// Mobile menu toggle with improved UX
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
});

overlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
});

// Enhanced theme toggle with system preference detection
function initTheme() {
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');
    
    // Determine initial theme
    let theme = savedTheme || (prefersDarkScheme.matches ? 'dark' : 'light');
    
    // Apply theme
    document.body.setAttribute('data-theme', theme);
    themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    
    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.body.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            themeToggle.innerHTML = e.matches ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    });
}

themeToggle.addEventListener('click', () => {
    const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
    const newTheme = isDarkMode ? 'light' : 'dark';
    
    document.body.setAttribute('data-theme', newTheme);
    themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', newTheme);
});

// Enhanced API Functions with better error handling
const api = {
    async getDashboardData() {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            throw new Error('No authentication token found. Please login again.');
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/users/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });
            
            if (response.status === 401) {
                this.clearAuth();
                throw new Error('Session expired. Please login again.');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch dashboard data`);
            }
            
            return await response.json();
            
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout. Please check your connection.');
            }
            throw error;
        }
    },
    
    async getAllCourses() {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${API_BASE_URL}/courses`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Courses fetch error:', error);
            throw error;
        }
    },
    
    async enrollInCourse(courseId) {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}/enroll`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to enroll in course');
        }
        
        return await response.json();
    },
    
    async getRecommendedCourses(userId) {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${API_BASE_URL}/courses/recommended/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) return null;
            
            return await response.json();
        } catch (error) {
            console.error('Recommended courses error:', error);
            return null;
        }
    },
    
    async getUpcomingDeadlines() {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${API_BASE_URL}/users/upcoming-deadlines`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) return [];
            
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Deadlines fetch error:', error);
            return [];
        }
    },
    
    async getRecentActivity() {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${API_BASE_URL}/users/activity`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) return [];
            
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Activity fetch error:', error);
            return [];
        }
    },
    
    async logout() {
        const token = localStorage.getItem('authToken');
        
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            this.clearAuth();
        }
    },
    
    clearAuth() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
    }
};

// Enhanced logout functionality
logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
        try {
            await api.logout();
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
            api.clearAuth();
            window.location.href = '/login';
        }
    }
});

// Enhanced search functionality
searchInput.addEventListener('input', debounce((e) => {
    const searchTerm = e.target.value.trim().toLowerCase();
    if (searchTerm.length > 2) {
        searchCourses(searchTerm);
    } else if (searchTerm.length === 0) {
        // Reset to original courses
        if (featuredCourses.length > 0) {
            renderFeaturedCourses(featuredCourses);
        }
    }
}, 500));

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Enhanced activity icon mapping
function getActivityIcon(type) {
    const iconMap = {
        'quiz_result': 'fas fa-check-circle',
        'quiz': 'fas fa-check-circle',
        'assignment': 'fas fa-tasks',
        'assignment_submitted': 'fas fa-paper-plane',
        'assignment_graded': 'fas fa-graduation-cap',
        'announcement': 'fas fa-bullhorn',
        'certificate': 'fas fa-certificate',
        'certificate_earned': 'fas fa-award',
        'video': 'fas fa-play-circle',
        'enrollment': 'fas fa-user-plus',
        'progress': 'fas fa-chart-line',
        'comment': 'fas fa-comment',
        'like': 'fas fa-thumbs-up',
        'badge': 'fas fa-medal',
        'login': 'fas fa-sign-in-alt',
        'course_completed': 'fas fa-flag-checkered',
        'module_completed': 'fas fa-check-square',
        'resource_added': 'fas fa-file-download'
    };
    
    return iconMap[type] || 'fas fa-circle';
}

// Enhanced progress circles with animation
function initProgressCircles() {
    const progressCircle = document.querySelector('.progress-circle-value');
    if (progressCircle) {
        const percent = parseInt(overallProgress.textContent) || 0;
        const circumference = 2 * Math.PI * 70;
        const offset = circumference - (percent / 100) * circumference;
        
        // Animate the progress
        progressCircle.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
        setTimeout(() => {
            progressCircle.style.strokeDashoffset = offset;
        }, 300);
    }
}

// Enhanced featured courses rendering with dynamic data
function renderFeaturedCourses(courses) {
    if (!courses || courses.length === 0) {
        featuredCoursesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <h3>No featured courses available</h3>
                <p>Check back later for new courses!</p>
            </div>
        `;
        return;
    }
    
    featuredCoursesContainer.innerHTML = '';
    
    courses.slice(0, 8).forEach(course => {
        const rating = course.rating || 4.5;
        const filledStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - filledStars - (hasHalfStar ? 1 : 0);
        
        let starsHTML = '';
        for (let i = 0; i < filledStars; i++) starsHTML += '<i class="fas fa-star"></i>';
        if (hasHalfStar) starsHTML += '<i class="fas fa-star-half-alt"></i>';
        for (let i = 0; i < emptyStars; i++) starsHTML += '<i class="far fa-star"></i>';
        
        // Determine badge color based on difficulty
        let badgeClass = 'beginner-badge';
        if (course.difficulty === 'Intermediate') badgeClass = 'intermediate-badge';
        if (course.difficulty === 'Advanced') badgeClass = 'advanced-badge';
        
        featuredCoursesContainer.innerHTML += `
            <div class="swiper-slide">
                <div class="course-card">
                    <div class="course-badge ${badgeClass}">
                        ${course.difficulty || 'Beginner'}
                    </div>
                    <div class="course-image">
                        <img src="${course.thumbnail || '/images/course-placeholder.jpg'}" 
                             alt="${course.title}"
                             loading="lazy">
                        <div class="course-overlay">
                            <i class="fas fa-eye"></i> Preview
                        </div>
                    </div>
                    <div class="course-content">
                        <div class="course-category">${course.category || 'Technology'}</div>
                        <h3 class="course-title" title="${course.title}">${course.title}</h3>
                        <div class="course-instructor">
                            <i class="fas fa-user"></i>
                            ${course.instructor?.name || 'Expert Instructor'}
                        </div>
                        <div class="course-meta">
                            <span><i class="fas fa-clock"></i> ${course.duration || '4'} weeks</span>
                            <span><i class="fas fa-users"></i> ${course.totalStudents?.toLocaleString() || '100+'}</span>
                        </div>
                        <div class="course-rating">
                            ${starsHTML}
                            <span class="rating-number">${rating.toFixed(1)}</span>
                            <span class="rating-count">(${course.ratingCount || '100'})</span>
                        </div>
                        <div class="course-price">
                            ₦${(course.price || 30000).toLocaleString()}
                            ${course.originalPrice ? 
                                `<span class="original-price">₦${course.originalPrice.toLocaleString()}</span>` : 
                                ''}
                        </div>
                        <button class="course-action" onclick="viewCourse('${course._id}')" 
                                data-course-id="${course._id}">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    if (swiper) {
        swiper.update();
    }
}

// Enhanced user courses rendering
function renderUserCourses(courses) {
    if (!courses || courses.length === 0) {
        coursesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <h3>No courses enrolled yet</h3>
                <p>Start your learning journey by exploring our featured courses above.</p>
                <button class="btn btn-primary" onclick="viewAllCourses()">
                    <i class="fas fa-search"></i> Browse Courses
                </button>
            </div>
        `;
        return;
    }
    
    coursesGrid.innerHTML = '';
    
    courses.forEach(course => {
        const progress = course.progress?.overallProgress || 0;
        const completedModules = course.progress?.completedModules || 0;
        const totalModules = course.progress?.totalModules || 10;
        const lastActivity = course.progress?.lastActivity || new Date().toISOString();
        
        // Calculate progress bar color
        let progressColor = 'var(--primary-color)';
        if (progress < 30) progressColor = 'var(--error-color)';
        else if (progress < 70) progressColor = 'var(--warning-color)';
        
        coursesGrid.innerHTML += `
            <div class="course-card enrolled">
                <div class="course-header">
                    <div class="course-badge enrolled-badge">
                        <i class="fas fa-user-graduate"></i> Enrolled
                    </div>
                    <div class="course-progress-indicator" style="color: ${progressColor}">
                        ${progress}%
                    </div>
                </div>
                <div class="course-image">
                    <img src="${course.thumbnail || '/images/course-placeholder.jpg'}" 
                         alt="${course.title}"
                         loading="lazy">
                </div>
                <div class="course-content">
                    <h3 class="course-title" title="${course.title}">${course.title}</h3>
                    <div class="course-instructor">
                        <i class="fas fa-chalkboard-teacher"></i>
                        ${course.instructor?.name || 'Expert Instructor'}
                    </div>
                    
                    <!-- Progress Section -->
                    <div class="progress-section">
                        <div class="progress-header">
                            <span>Your Progress</span>
                            <span>${completedModules}/${totalModules} modules</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%; background: ${progressColor};"></div>
                        </div>
                        <div class="progress-stats">
                            <span><i class="fas fa-clock"></i> Last active: ${formatRelativeTime(lastActivity)}</span>
                        </div>
                    </div>
                    
                    <!-- Course Actions -->
                    <div class="course-actions">
                        <button class="btn-continue" onclick="continueCourse('${course._id}')">
                            <i class="fas fa-play-circle"></i> Continue
                        </button>
                        <button class="btn-outline" onclick="viewCourseDetails('${course._id}')">
                            <i class="fas fa-info-circle"></i> Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

// Enhanced dashboard data rendering
async function renderUserData(data) {
    if (!data.success) {
        throw new Error(data.error || 'Failed to load dashboard data');
    }

    const dashboardData = data.data;
    userData = dashboardData.user;
    
    // Update user profile
    if (userData) {
        userName.textContent = userData.name || 'User';
        welcomeName.textContent = userData.name?.split(' ')[0] || 'Student';
        userRole.textContent = userData.role || 'Student';
        userAvatar.src = userData.avatar || '/images/default-avatar.png';
        userAvatar.onerror = () => {
            userAvatar.src = '/images/default-avatar.png';
        };
        
        // Store in localStorage for offline access
        localStorage.setItem('user', JSON.stringify(userData));
    }
    
    // Update stats with real calculations
    if (dashboardData.stats) {
        const stats = dashboardData.stats;
        
        statCourses.textContent = stats.enrolledCourses || 0;
        statHours.textContent = calculateTotalHours(stats.learningHours) || '0';
        statProgress.textContent = `${stats.avgProgress || 0}%`;
        statCertificates.textContent = stats.completedCourses || 0;
        overallProgress.textContent = `${stats.avgProgress || 0}%`;
        
        // Update welcome stats with real data
        streakDays.textContent = stats.streakDays || 0;
        weeklyHours.textContent = stats.weeklyHours || 0;
        achievements.textContent = stats.achievements || 0;
    }
    
    // Load all data in parallel for better performance
    try {
        const [coursesResponse, deadlines, activities] = await Promise.allSettled([
            api.getAllCourses(),
            api.getUpcomingDeadlines(),
            api.getRecentActivity()
        ]);
        
        // Handle courses
        if (coursesResponse.status === 'fulfilled' && coursesResponse.value.success) {
            featuredCourses = coursesResponse.value.data || [];
            userCourses = dashboardData.courses || [];
            
            // Get recommended courses for this user
            if (userData?._id) {
                const recommended = await api.getRecommendedCourses(userData._id);
                if (recommended?.success) {
                    featuredCourses = recommended.data || featuredCourses;
                }
            }
            
            // Filter out courses user is already enrolled in
            const userCourseIds = userCourses.map(c => c._id);
            const availableCourses = featuredCourses.filter(c => !userCourseIds.includes(c._id));
            
            renderFeaturedCourses(availableCourses);
            renderUserCourses(userCourses);
        }
        
        // Handle deadlines
        if (deadlines.status === 'fulfilled' && deadlines.value.length > 0) {
            renderUpcomingDeadlines(deadlines.value);
        } else {
            renderNoDeadlines();
        }
        
        // Handle activities
        if (activities.status === 'fulfilled' && activities.value.length > 0) {
            renderRecentActivities(activities.value);
        } else {
            renderNoActivities();
        }
        
    } catch (error) {
        console.error('Error loading dashboard components:', error);
        // Fallback to static data if API fails
        renderFallbackData();
    }
    
    initProgressCircles();
}

// Helper functions
function calculateTotalHours(learningData) {
    if (!learningData || !Array.isArray(learningData)) return '0';
    const totalMinutes = learningData.reduce((sum, session) => sum + (session.duration || 0), 0);
    return Math.round(totalMinutes / 60);
}

function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function renderUpcomingDeadlines(deadlines) {
    upcomingList.innerHTML = '';
    
    deadlines.slice(0, 3).forEach(deadline => {
        const dueDate = new Date(deadline.dueDate);
        const daysUntil = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
        
        let urgencyClass = '';
        if (daysUntil <= 1) urgencyClass = 'urgent';
        else if (daysUntil <= 3) urgencyClass = 'warning';
        
        upcomingList.innerHTML += `
            <div class="activity-item ${urgencyClass}">
                <div class="activity-icon ${urgencyClass}">
                    <i class="fas fa-calendar-day"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${deadline.title}</div>
                    <div class="activity-desc">${deadline.courseName || 'Course Assignment'}</div>
                    <div class="activity-time ${urgencyClass}">
                        <i class="fas fa-clock"></i>
                        Due: ${dueDate.toLocaleDateString()} 
                        ${daysUntil > 0 ? `(${daysUntil} ${daysUntil === 1 ? 'day' : 'days'} left)` : 'OVERDUE'}
                    </div>
                </div>
                <button class="btn-small" onclick="viewAssignment('${deadline._id}')">
                    <i class="fas fa-external-link-alt"></i>
                </button>
            </div>
        `;
    });
    
    if (deadlines.length > 3) {
        upcomingList.innerHTML += `
            <div class="view-more">
                <button onclick="viewAllDeadlines()">View ${deadlines.length - 3} more deadlines</button>
            </div>
        `;
    }
}

function renderRecentActivities(activities) {
    activityList.innerHTML = '';
    
    activities.slice(0, 5).forEach(activity => {
        activityList.innerHTML += `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-desc">${activity.description || activity.message}</div>
                    <div class="activity-time">
                        <i class="fas fa-clock"></i> ${formatRelativeTime(activity.timestamp)}
                    </div>
                </div>
                ${activity.link ? `
                    <button class="btn-small" onclick="window.location.href='${activity.link}'">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                ` : ''}
            </div>
        `;
    });
}

function renderNoDeadlines() {
    upcomingList.innerHTML = `
        <div class="activity-item success">
            <div class="activity-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">No upcoming deadlines</div>
                <div class="activity-desc">You're all caught up with your assignments!</div>
                <div class="activity-time"><i class="fas fa-clock"></i> Great job!</div>
            </div>
        </div>
    `;
}

function renderNoActivities() {
    activityList.innerHTML = `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-info-circle"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">No recent activity</div>
                <div class="activity-desc">Start learning to see your activity here!</div>
                <div class="activity-time"><i class="fas fa-clock"></i> Get started</div>
            </div>
        </div>
    `;
}

// Search courses with highlight
function searchCourses(searchTerm) {
    if (!featuredCourses.length) return;
    
    const filtered = featuredCourses.filter(course => 
        course.title.toLowerCase().includes(searchTerm) ||
        (course.description && course.description.toLowerCase().includes(searchTerm)) ||
        (course.category && course.category.toLowerCase().includes(searchTerm)) ||
        (course.tags && course.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
    
    if (filtered.length === 0) {
        featuredCoursesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No courses found</h3>
                <p>Try different search terms</p>
            </div>
        `;
    } else {
        renderFeaturedCourses(filtered);
    }
}

// Enhanced course actions
window.viewCourse = function(courseId) {
    window.location.href = `/course/${courseId}`;
}

window.continueCourse = function(courseId) {
    const course = userCourses.find(c => c._id === courseId);
    if (course?.progress?.lastModule) {
        window.location.href = `/course/${courseId}/module/${course.progress.lastModule}`;
    } else {
        window.location.href = `/course/${courseId}`;
    }
}

window.enrollCourse = async function(courseId) {
    try {
        const result = await api.enrollInCourse(courseId);
        if (result.success) {
            showNotification('Successfully enrolled in course!', 'success');
            loadDashboardData();
        }
    } catch (error) {
        showNotification(error.message || 'Failed to enroll', 'error');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Initialize dashboard
async function initializeDashboard() {
    try {
        // Check authentication first
        if (!checkAuth()) return;
        
        // Initialize theme
        initTheme();
        
        // Initialize Swiper
        initSwiper();
        
        // Load dashboard data
        await loadDashboardData();
        
        // Set up scroll handler for header
        window.addEventListener('scroll', fixHeaderScroll);
        
        // Add responsive event listeners
        setupResponsiveEvents();
        
        // Add animation classes
        setTimeout(() => {
            document.querySelectorAll('.widget, .course-card').forEach((el, index) => {
                el.style.animationDelay = `${index * 0.1}s`;
                el.classList.add('animate-in');
            });
        }, 100);
        
    } catch (error) {
        console.error('Dashboard initialization failed:', error);
        showNotification('Failed to load dashboard. Please refresh the page.', 'error');
    }
}

// Setup responsive events
function setupResponsiveEvents() {
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (swiper) swiper.update();
            fixHeaderScroll();
        }, 250);
    });
    
    // Handle search bar focus on mobile
    searchInput.addEventListener('focus', () => {
        if (window.innerWidth < 768) {
            searchInput.parentElement.classList.add('search-focused');
        }
    });
    
    searchInput.addEventListener('blur', () => {
        searchInput.parentElement.classList.remove('search-focused');
    });
}

// Check authentication with token validation
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!token) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        return false;
    }
    
    // Check token expiration (simple check)
    try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const isExpired = Date.now() >= tokenData.exp * 1000;
        
        if (isExpired) {
            api.clearAuth();
            window.location.href = '/login?expired=true';
            return false;
        }
    } catch (e) {
        console.error('Token validation error:', e);
    }
    
    return true;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initializeDashboard);