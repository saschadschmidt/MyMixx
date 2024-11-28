document.addEventListener("DOMContentLoaded", () => {
    fetch('/konfigurator/assets/items.json')
        .then(response => response.json())
        .then(data => {
            const appContainer = document.querySelector('.app');
            data.forEach(item => {
                const appItem = document.createElement('div');
                appItem.classList.add('app-item');
                appItem.innerHTML = `
                    <img src="${item.imageUrl}" alt="${item.name}">
                    <h2>${item.name}</h2>
                    <form>
                        <select name="quantity" class="quantity-select">
                            ${Array.from({ length: 15 }, (_, i) => `<option value="${(i + 1) * 10}">${(i + 1) * 10}g</option>`).join('')}
                        </select>
                    </form>
                    <span class="price">${item.pricePer10g.toFixed(2)}€</span>
                    <button type="button" class="add-to-cart-btn" onclick="addToCart('${item.name}', ${item.pricePer10g}, this)">In den Warenkorb</button>
                `;
                appContainer.appendChild(appItem);

                // Überprüfen, ob das Produkt bereits im Warenkorb ist
                const existingItem = cart.find(cartItem => cartItem.name === item.name);
                if (existingItem) {
                    const button = appItem.querySelector('.add-to-cart-btn');
                    button.textContent = 'Im Warenkorb';
                    button.style.backgroundColor = 'black';
                    button.style.color = 'white';
                    appItem.style.borderColor = 'black';

                    button.onmouseover = () => {
                        button.textContent = 'Entfernen';
                    };
                    button.onmouseout = () => {
                        button.textContent = 'Im Warenkorb';
                    };
                    button.onclick = () => {
                        removeFromCart(item.name, button);
                    };
                }
            });
        });

    updateCartSummary();

    // Set the minimum date for the date input to today
    const dateInput = document.getElementById('datum');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    // Populate the time slots in 15-minute intervals
    const timeSelect = document.getElementById('uhrzeit');
    populateTimeSlots(timeSelect);

    // Update time slots based on selected date
    dateInput.addEventListener('change', () => {
        const selectedDate = new Date(dateInput.value);
        const now = new Date();
        const isToday = selectedDate.toDateString() === now.toDateString();

        populateTimeSlots(timeSelect, isToday ? now : null);
    });
});

let cart = JSON.parse(localStorage.getItem('cart')) || [];
const gesamtElement = document.querySelector('.gesamt');

function addToCart(name, pricePer10g, button) {
    const quantitySelect = button.closest('.app-item').querySelector('.quantity-select');
    const quantity = parseInt(quantitySelect.value);
    const price = (pricePer10g * (quantity / 10)).toFixed(2);

    const existingItemIndex = cart.findIndex(item => item.name === name);
    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity = quantity;
        cart[existingItemIndex].price = price;
    } else {
        cart.push({ name, quantity, price });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartSummary();

    // Ändern des Button-Textes und des Stylings
    button.textContent = 'Im Warenkorb';
    button.style.backgroundColor = 'black';
    button.style.color = 'white';
    button.closest('.app-item').style.borderColor = 'black';

    // Hinzufügen von Hover-Effekt und Entfernen-Funktion
    button.onmouseover = () => {
        button.textContent = 'Entfernen';
    };
    button.onmouseout = () => {
        button.textContent = 'Im Warenkorb';
    };
    button.onclick = () => {
        removeFromCart(name, button);
    };
}

function removeFromCart(name, button) {
    cart = cart.filter(item => item.name !== name);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartSummary();

    // Zurücksetzen des Button-Textes und des Stylings
    button.textContent = 'In den Warenkorb';
    button.style.backgroundColor = '';
    button.style.color = '';
    button.closest('.app-item').style.borderColor = '';
    button.onmouseover = null;
    button.onmouseout = null;
    button.onclick = () => addToCart(name, parseFloat(button.closest('.app-item').querySelector('.price').textContent), button);
}

function updateCartSummary() {
    const warenkorbItemsContainer = document.querySelector('.warenkorb-items-page');
    let gesamtPreis = 0;

    if (warenkorbItemsContainer) {
        warenkorbItemsContainer.innerHTML = '';

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('warenkorb-item-page');
            itemElement.innerHTML = `
                <span class="warenkorb-item-page__itemname">${item.name}</span>
                <span class="warenkorb-item-page__itemqty">${item.quantity}g</span>
                <span class="warenkorb-item-page__itemprice">${item.price}€</span>
            `;
            warenkorbItemsContainer.appendChild(itemElement);
            gesamtPreis += parseFloat(item.price);
        });
    } else {
        cart.forEach(item => {
            gesamtPreis += parseFloat(item.price);
        });
    }

    gesamtElement.textContent = `${gesamtPreis.toFixed(2)}€`;
}

document.querySelector('.cta').addEventListener('click', () => {
    window.location.href = 'warenkorb.html';
});

// Initial update of the cart summary
updateCartSummary();

function checkout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let email;

    const emailBody = cart.map(item => `${item.name}: ${item.quantity}g - ${item.price}€`).join('\n');
    window.location.href = `mailto:${email}?subject=MyMixx Bestellung&body=${encodeURIComponent(emailBody)}`;
}

function populateTimeSlots(timeSelect, now = null) {
    timeSelect.innerHTML = '';
    const currentHours = now ? now.getHours() : 0;
    const currentMinutes = now ? now.getMinutes() : 0;
    const currentTimeSlot = now ? Math.ceil(currentMinutes / 15) : 0;

    for (let i = 0; i < 24 * 4; i++) {
        const hours = Math.floor(i / 4);
        const minutes = (i % 4) * 15;
        const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;

        // Disable past time slots for today
        if (now && (hours < currentHours || (hours === currentHours && minutes <= currentTimeSlot * 15))) {
            option.disabled = true;
        }

        timeSelect.appendChild(option);
    }
}

// Warenkorb-Items laden
const warenkorbItemsContainer = document.querySelector('.warenkorb-items-page');
if (warenkorbItemsContainer) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let gesamtPreis = 0;

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('warenkorb-item-page');
        itemElement.innerHTML = `
            <span class="warenkorb-item-page__itemname">${item.name}</span>
            <span class="warenkorb-item-page__itemqty">${item.quantity}g</span>
            <span class="warenkorb-item-page__itemprice">${item.price}€</span>
        `;
        warenkorbItemsContainer.appendChild(itemElement);
        gesamtPreis += parseFloat(item.price);
    });

    document.querySelector('.gesamt').textContent = `Gesamt: ${gesamtPreis.toFixed(2)}€`;
}

// Formular-Validierung und Bestellungs-Handling
const bestellformular = document.getElementById('bestellformular');
if (bestellformular) {
    bestellformular.addEventListener('submit', function(event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const datum = document.getElementById('datum').value;
        const uhrzeit = document.getElementById('uhrzeit').value;
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        if (cart.length === 0) {
            alert('Ihr Warenkorb ist leer.');
            return;
        }

        const emailBody = cart.map(item => `${item.name}: ${item.quantity}g - ${item.price}€`).join('\n');
        const emailContent = `mailto:${email}?subject=MyMixx Bestellung&body=${encodeURIComponent(emailBody + `\n\nName: ${name}\nDatum: ${datum}\nUhrzeit: ${uhrzeit}`)}`;

        window.location.href = emailContent;
        window.location.href = 'bestaetigung.html';
    });
}
