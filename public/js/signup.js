 // Backend API Configuration
        const API_BASE_URL = '/api'; // Change to your server URL
        
        // DOM Elements
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        const body = document.body;
        const togglePassword = document.getElementById('togglePassword');
        const password = document.getElementById('password');
        const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        const signupForm = document.getElementById('signupForm');
        const successModal = document.getElementById('successModal');
        const modalCloseBtn = document.getElementById('modalCloseBtn');
        const submitBtn = document.querySelector('.btn-submit');
        const fullnameInput = document.getElementById('fullname');
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const strengthMeter = document.getElementById('strengthMeter');
        const termsCheckbox = document.getElementById('terms');

        // Theme Toggle Functionality
        const savedTheme = localStorage.getItem('theme') || 
                         (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

        if (savedTheme === 'dark') {
            body.setAttribute('data-theme', 'dark');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        }

        themeToggle.addEventListener('click', () => {
            if (body.getAttribute('data-theme') === 'dark') {
                body.setAttribute('data-theme', 'light');
                themeIcon.classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('theme', 'light');
            } else {
                body.setAttribute('data-theme', 'dark');
                themeIcon.classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('theme', 'dark');
            }
        });

        // Password Toggle Functionality
        togglePassword.addEventListener('click', function() {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });

        toggleConfirmPassword.addEventListener('click', function() {
            const type = confirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPassword.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });

        // Password Strength Indicator
        password.addEventListener('input', function() {
            const passwordValue = this.value;
            let strength = 0;
            
            // Check for length
            if (passwordValue.length >= 6) strength += 1;
            if (passwordValue.length >= 8) strength += 1;
            if (passwordValue.length >= 12) strength += 1;
            
            // Check for uppercase letters
            if (/[A-Z]/.test(passwordValue)) strength += 1;
            
            // Check for numbers
            if (/[0-9]/.test(passwordValue)) strength += 1;
            
            // Check for special characters
            if (/[^A-Za-z0-9]/.test(passwordValue)) strength += 1;
            
            // Update strength meter
            const width = (strength / 6) * 100;
            strengthMeter.style.width = `${width}%`;
            
            // Update color based on strength
            if (strength <= 2) {
                strengthMeter.style.backgroundColor = 'var(--error-color)';
            } else if (strength <= 4) {
                strengthMeter.style.backgroundColor = 'var(--warning-color)';
            } else {
                strengthMeter.style.backgroundColor = 'var(--success-color)';
            }
        });

        // Toast Notification Function
        function showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;
            
            const container = document.getElementById('toastContainer');
            container.appendChild(toast);
            
            setTimeout(() => toast.classList.add('show'), 10);
            
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // Show/Hide Modal Functions
        function showModal(modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }

        function hideModal(modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }

        // Check if already logged in
        const token = localStorage.getItem('authToken');
        if (token) {
            window.location.href = '/dashboard';
        }

        // Signup Form Submission
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form values
            const fullName = fullnameInput.value.trim();
            const username = usernameInput.value.trim();
            const email = emailInput.value.trim();
            const passwordValue = password.value;
            const confirmPasswordValue = confirmPassword.value;
            
            // Client-side validation
            if (!fullName || !username || !email || !passwordValue || !confirmPasswordValue) {
                showToast('Please fill in all required fields', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            
            // Username validation (alphanumeric, underscores, 3-20 chars)
            const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
            if (!usernameRegex.test(username)) {
                showToast('Username must be 3-20 characters and contain only letters, numbers, and underscores', 'error');
                return;
            }
            
            // Password validation
            if (passwordValue.length < 6) {
                showToast('Password must be at least 6 characters long', 'error');
                return;
            }
            
            // Password match validation
            if (passwordValue !== confirmPasswordValue) {
                showToast('Passwords do not match', 'error');
                return;
            }
            
            // Terms validation
            if (!termsCheckbox.checked) {
                showToast('You must agree to the terms and conditions', 'error');
                return;
            }
            
            // Disable submit button and show loading state
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Creating Account...';
            submitBtn.disabled = true;
            
            try {
                // Prepare user data for registration
                const userData = {
                    name: fullName, // Your backend expects 'name' not 'fullName'
                    email: email,
                    password: passwordValue,
                    username: username,
                    role: 'student' // Default role
                };
                
                // Call backend registration API
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData)
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || data.message || 'Registration failed');
                }
                
                // Store token and user data if returned
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                }
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                
                // Show success modal
                showModal(successModal);
                
                // Reset form
                signupForm.reset();
                strengthMeter.style.width = '0%';
                
            } catch (error) {
                console.error('Registration error:', error);
                
                // User-friendly error messages
                let errorMsg = error.message;
                if (errorMsg.includes('already exists') || errorMsg.includes('duplicate')) {
                    errorMsg = 'An account with this email or username already exists';
                } else if (errorMsg.includes('validation failed')) {
                    errorMsg = 'Please check your input values and try again';
                } else if (errorMsg.includes('Network')) {
                    errorMsg = 'Network error. Please check your connection.';
                }
                
                showToast(errorMsg, 'error');
                
            } finally {
                // Re-enable submit button
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        });

        // Close modal and redirect to login
        modalCloseBtn.addEventListener('click', function() {
            hideModal(successModal);
            setTimeout(() => {
                window.location.href = '/login';
            }, 300);
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === successModal) {
                hideModal(successModal);
            }
        });

        // Social login buttons (placeholder)
        document.querySelectorAll('.social-icon').forEach(icon => {
            icon.addEventListener('click', function(e) {
                e.preventDefault();
                const platform = this.querySelector('i').className.split(' ')[1].split('-')[1];
                showToast(`${platform.charAt(0).toUpperCase() + platform.slice(1)} signup coming soon!`, 'info');
            });
        });

        // Real-time validation
        emailInput.addEventListener('blur', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailRegex.test(this.value)) {
                this.style.borderColor = 'var(--error-color)';
                showToast('Please enter a valid email address', 'error');
            } else {
                this.style.borderColor = 'var(--border-color)';
            }
        });

        confirmPassword.addEventListener('input', function() {
            if (password.value && this.value && password.value !== this.value) {
                this.style.borderColor = 'var(--error-color)';
            } else {
                this.style.borderColor = 'var(--border-color)';
            }
        });

        // Floating elements hover effect (keeping your animation)
        const floatingElements = document.querySelectorAll('.floating-element');
        floatingElements.forEach(element => {
            element.addEventListener('mouseenter', function() {
                const currentTransform = this.style.transform;
                if (!currentTransform.includes('scale(1.05)')) {
                    this.style.transform = currentTransform + ' scale(1.05)';
                }
                this.style.zIndex = '10';
                this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.2)';
            });
            
            element.addEventListener('mouseleave', function() {
                this.style.transform = this.style.transform.replace(' scale(1.05)', '');
                const className = this.className.split(' ')[1];
                this.style.zIndex = className === 'element-1' ? '3' : 
                                    className === 'element-2' ? '2' : 
                                    className === 'element-3' ? '1' : '4';
                this.style.boxShadow = 'var(--shadow)';
            });
        });

        // Enter key support
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && document.activeElement.id === 'confirmPassword') {
                signupForm.requestSubmit();
            }
        });

        // Page loaded
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Signup page loaded successfully');
        });