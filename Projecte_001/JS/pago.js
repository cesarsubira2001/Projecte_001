// Validación del formulario de pago
document.addEventListener('DOMContentLoaded', function() {
    const paymentForm = document.getElementById('paymentForm');
    const cardPaymentBtn = document.getElementById('cardPaymentBtn');
    const btnText = cardPaymentBtn.querySelector('.btn-text');
    const btnLoading = cardPaymentBtn.querySelector('.btn-loading');
    
    // Elementos del formulario
    const nombreInput = document.getElementById('nombre');
    const emailInput = document.getElementById('email');
    const cardNumberInput = document.getElementById('cardNumber');
    const cardNameInput = document.getElementById('cardName');
    const expiryDateInput = document.getElementById('expiryDate');
    const cvvInput = document.getElementById('cvv');
    const termsInput = document.getElementById('terms');
    
    // Elementos de error
    const nombreError = document.getElementById('nombreError');
    const emailError = document.getElementById('emailError');
    const cardNumberError = document.getElementById('cardNumberError');
    const cardNameError = document.getElementById('cardNameError');
    const expiryDateError = document.getElementById('expiryDateError');
    const cvvError = document.getElementById('cvvError');
    const termsError = document.getElementById('termsError');
    const formFeedback = document.getElementById('formFeedback');
    
    // Métodos de pago
    const paymentMethods = document.querySelectorAll('.payment-method');
    const cardForm = document.getElementById('cardForm');
    const paypalForm = document.getElementById('paypalForm');
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    
    // Variables para PayPal
    let paypalButtons = null;
    let currentPaymentMethod = 'card';
    
    // Inicializar PayPal
    initializePayPal();
    
    // Cambiar método de pago
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            const methodType = this.getAttribute('data-method');
            
            // Remover clase active de todos
            paymentMethods.forEach(m => m.classList.remove('active'));
            // Agregar clase active al seleccionado
            this.classList.add('active');
            
            // Actualizar método de pago actual
            currentPaymentMethod = methodType;
            
            // Mostrar formulario correspondiente
            if (methodType === 'card') {
                cardForm.style.display = 'block';
                paypalForm.style.display = 'none';
                cardPaymentBtn.style.display = 'block';
            } else if (methodType === 'paypal') {
                cardForm.style.display = 'none';
                paypalForm.style.display = 'block';
                cardPaymentBtn.style.display = 'none';
            }
        });
    });
    
    // Validación en tiempo real
    nombreInput.addEventListener('blur', validateNombre);
    emailInput.addEventListener('blur', validateEmail);
    cardNumberInput.addEventListener('blur', validateCardNumber);
    cardNameInput.addEventListener('blur', validateCardName);
    expiryDateInput.addEventListener('blur', validateExpiryDate);
    cvvInput.addEventListener('blur', validateCVV);
    termsInput.addEventListener('change', validateTerms);
    
    // Formateo de inputs
    cardNumberInput.addEventListener('input', formatCardNumber);
    expiryDateInput.addEventListener('input', formatExpiryDate);
    cvvInput.addEventListener('input', formatCVV);
    
    // Envío del formulario para tarjeta
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (currentPaymentMethod === 'card' && validateForm()) {
            processCardPayment();
        }
    });
    
    function initializePayPal() {
        // En un entorno real, usarías tu Client ID de PayPal
        // paypal.Buttons({
        //     style: {
        //         layout: 'vertical',
        //         color: 'blue',
        //         shape: 'rect',
        //         label: 'paypal'
        //     },
        //     createOrder: function(data, actions) {
        //         return actions.order.create({
        //             purchase_units: [{
        //                 amount: {
        //                     value: '34.79'
        //                 },
        //                 description: 'Plan Pro - GeneradorIA'
        //             }]
        //         });
        //     },
        //     onApprove: function(data, actions) {
        //         return actions.order.capture().then(function(details) {
        //             // Pago exitoso
        //             showFeedback('¡Pago con PayPal exitoso! Redirigiendo...', 'success');
        //             
        //             // Redirigir después de 2 segundos
        //             setTimeout(function() {
        //                 window.location.href = '../Dashboard/dashboard.html?payment=success&method=paypal';
        //             }, 2000);
        //         });
        //     },
        //     onError: function(err) {
        //         showFeedback('Error en el pago con PayPal. Intenta nuevamente.', 'error');
        //     }
        // }).render('#paypal-button-container');

        // Para demostración, simulamos el botón de PayPal
        paypalButtonContainer.innerHTML = `
            <button type="button" class="btn btn-paypal" id="simulatePayPalBtn">
                <span style="background: #003087; color: white; padding: 10px 20px; border-radius: 5px; display: flex; align-items: center; gap: 10px; font-weight: bold;">
                    <span>P</span>
                    Pagar con PayPal
                </span>
            </button>
        `;
        
        document.getElementById('simulatePayPalBtn').addEventListener('click', function() {
            if (validatePersonalInfo()) {
                processPayPalPayment();
            }
        });
    }
    
    function validatePersonalInfo() {
        const isNombreValid = validateNombre();
        const isEmailValid = validateEmail();
        const isTermsValid = validateTerms();
        
        return isNombreValid && isEmailValid && isTermsValid;
    }
    
    function validateNombre() {
        const nombre = nombreInput.value.trim();
        if (nombre === '') {
            showError(nombreError, 'El nombre completo es obligatorio');
            return false;
        } else if (nombre.length < 2) {
            showError(nombreError, 'El nombre debe tener al menos 2 caracteres');
            return false;
        } else {
            hideError(nombreError);
            return true;
        }
    }
    
    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email === '') {
            showError(emailError, 'El correo electrónico es obligatorio');
            return false;
        } else if (!emailRegex.test(email)) {
            showError(emailError, 'Por favor ingresa un correo electrónico válido');
            return false;
        } else {
            hideError(emailError);
            return true;
        }
    }
    
    function validateCardNumber() {
        const cardNumber = cardNumberInput.value.replace(/\s/g, '');
        if (cardNumber === '') {
            showError(cardNumberError, 'El número de tarjeta es obligatorio');
            return false;
        } else if (!/^\d{16}$/.test(cardNumber)) {
            showError(cardNumberError, 'El número de tarjeta debe tener 16 dígitos');
            return false;
        } else if (!luhnCheck(cardNumber)) {
            showError(cardNumberError, 'El número de tarjeta no es válido');
            return false;
        } else {
            hideError(cardNumberError);
            return true;
        }
    }
    
    function validateCardName() {
        const cardName = cardNameInput.value.trim();
        if (cardName === '') {
            showError(cardNameError, 'El nombre en la tarjeta es obligatorio');
            return false;
        } else if (cardName.length < 2) {
            showError(cardNameError, 'El nombre debe tener al menos 2 caracteres');
            return false;
        } else {
            hideError(cardNameError);
            return true;
        }
    }
    
    function validateExpiryDate() {
        const expiryDate = expiryDateInput.value;
        if (expiryDate === '') {
            showError(expiryDateError, 'La fecha de expiración es obligatoria');
            return false;
        } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
            showError(expiryDateError, 'Formato inválido (MM/AA)');
            return false;
        } else {
            const [month, year] = expiryDate.split('/');
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear() % 100;
            const currentMonth = currentDate.getMonth() + 1;
            
            if (month < 1 || month > 12) {
                showError(expiryDateError, 'Mes inválido');
                return false;
            }
            
            if (year < currentYear || (year == currentYear && month < currentMonth)) {
                showError(expiryDateError, 'La tarjeta ha expirado');
                return false;
            }
            
            hideError(expiryDateError);
            return true;
        }
    }
    
    function validateCVV() {
        const cvv = cvvInput.value;
        if (cvv === '') {
            showError(cvvError, 'El CVV es obligatorio');
            return false;
        } else if (!/^\d{3,4}$/.test(cvv)) {
            showError(cvvError, 'El CVV debe tener 3 o 4 dígitos');
            return false;
        } else {
            hideError(cvvError);
            return true;
        }
    }
    
    function validateTerms() {
        if (!termsInput.checked) {
            showError(termsError, 'Debes aceptar los términos y condiciones');
            return false;
        } else {
            hideError(termsError);
            return true;
        }
    }
    
    function validateForm() {
        const isPersonalValid = validatePersonalInfo();
        
        let isCardValid = true;
        if (currentPaymentMethod === 'card') {
            isCardValid = validateCardNumber() && validateCardName() && validateExpiryDate() && validateCVV();
        }
        
        return isPersonalValid && isCardValid;
    }
    
    function formatCardNumber() {
        let value = cardNumberInput.value.replace(/\s/g, '');
        if (value.length > 16) value = value.substr(0, 16);
        
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        
        cardNumberInput.value = formattedValue;
    }
    
    function formatExpiryDate() {
        let value = expiryDateInput.value.replace(/\D/g, '');
        if (value.length > 4) value = value.substr(0, 4);
        
        if (value.length >= 2) {
            value = value.substr(0, 2) + '/' + value.substr(2);
        }
        
        expiryDateInput.value = value;
    }
    
    function formatCVV() {
        let value = cvvInput.value.replace(/\D/g, '');
        if (value.length > 4) value = value.substr(0, 4);
        cvvInput.value = value;
    }
    
    function luhnCheck(cardNumber) {
        let sum = 0;
        let isEven = false;
        
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber[i]);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    }
    
    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
    }
    
    function hideError(element) {
        element.textContent = '';
        element.style.display = 'none';
    }
    
    function processCardPayment() {
        // Mostrar estado de carga
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        cardPaymentBtn.disabled = true;
        
        // Simular procesamiento de pago con tarjeta
        setTimeout(function() {
            // Mostrar mensaje de éxito
            showFeedback('¡Pago procesado exitosamente! Redirigiendo a tu cuenta...', 'success');
            
            // Redirigir después de 2 segundos
            setTimeout(function() {
                window.location.href = '../Dashboard/dashboard.html?payment=success&method=card';
            }, 2000);
        }, 3000);
    }
    
    function processPayPalPayment() {
        // Simular redirección a PayPal
        showFeedback('Redirigiendo a PayPal...', 'success');
        
        // En un entorno real, aquí se redirigiría a PayPal
        // Para esta demostración, simulamos el proceso
        setTimeout(function() {
            showFeedback('¡Pago con PayPal exitoso! Redirigiendo a tu cuenta...', 'success');
            
            // Redirigir después de 2 segundos
            setTimeout(function() {
                window.location.href = '../Dashboard/dashboard.html?payment=success&method=paypal';
            }, 2000);
        }, 2000);
    }
    
    function showFeedback(message, type) {
        formFeedback.textContent = message;
        formFeedback.className = 'form-feedback ' + type;
        formFeedback.style.display = 'block';
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(function() {
            formFeedback.style.display = 'none';
        }, 5000);
    }
});