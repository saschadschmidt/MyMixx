document.addEventListener("DOMContentLoaded", () => {
    // Daten aus der items.json Datei laden
    fetch('assets/items.json')
        .then(response => response.json())
        .then(data => {
            const appContainer = document.querySelector('.konfigurator');
            data.forEach(item => {
                const appItem = document.createElement('div');
                appItem.classList.add('item');

                let options = '';
                let priceLabel = '';
                let unit = '';

                // Optionen und Preise für die Artikel festlegen
                if (item.pricePer10g !== undefined) {
                    options = Array.from({ length: 15 }, (_, i) => `<option value="${(i + 1) * 10}">${(i + 1) * 10}g</option>`).join('');
                    priceLabel = `${item.pricePer10g.toFixed(2)}€`;
                    unit = 'g';
                } else if (item.pricePer50ml !== undefined) {
                    options = Array.from({ length: 20 }, (_, i) => `<option value="${(i + 1) * 50}">${(i + 1) * 50}ml</option>`).join('');
                    priceLabel = `${item.pricePer50ml.toFixed(2)}€`;
                    unit = 'ml';
                }

                // HTML für jeden Artikel erstellen
                appItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <h2>${item.name}</h2>
                    <form>
                        <select name="quantity" class="quantity-select">
                            ${options}
                        </select>
                    </form>
                    <span class="price">${priceLabel}</span>
                    <button type="button" class="add-to-cart-btn" onclick="addToCart('${item.name}', ${item.pricePer10g || item.pricePer50ml}, '${unit}', this)"><span class="inline-icon icon-warenkorb"></span>In den Warenkorb</button>
                `;
                appContainer.appendChild(appItem);

                // Event-Listener für die Mengenänderung hinzufügen
                const quantitySelect = appItem.querySelector('.quantity-select');
                quantitySelect.addEventListener('change', () => {
                    updatePrice(quantitySelect, item.pricePer10g || item.pricePer50ml, unit, appItem.querySelector('.price'));
                });

                // Überprüfen, ob das Produkt bereits im Warenkorb ist
                const existingItem = cart.find(cartItem => cartItem.name === item.name);
                if (existingItem) {
                    updateButtonToInCart(appItem.querySelector('.add-to-cart-btn'), item.name, item.pricePer10g || item.pricePer50ml, unit);
                }
            });
        });

    updateCartSummary();

    // Mindestdatum für das Datumseingabefeld auf heute setzen
    const dateInput = document.getElementById('datum');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);

        // Zeitfenster basierend auf dem ausgewählten Datum aktualisieren
        dateInput.addEventListener('change', () => {
            const selectedDate = new Date(dateInput.value);
            const now = new Date();
            const isToday = selectedDate.toDateString() === now.toDateString();

            populateTimeSlots(document.getElementById('uhrzeit'), isToday ? now : null);
        });
    }

    // Zeitfenster in 15-Minuten-Intervallen füllen
    const timeSelect = document.getElementById('uhrzeit');
    if (timeSelect) {
        populateTimeSlots(timeSelect);
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

            if (cart.length >= 1) {
                const orderData = {
                    name: name,
                    email: email,
                    datum: datum,
                    uhrzeit: uhrzeit,
                    cart: cart
                };

                // Speichern der Bestelldaten im LocalStorage
                localStorage.setItem('orderData', JSON.stringify(orderData));

                // Weiterleitung zur Bestätigungsseite
                window.location.href = 'bestaetigung.html';
            } else {
                alert('Ihr Warenkorb ist leer!');
            }
        });
    }
});

let cart = JSON.parse(localStorage.getItem('cart')) || [];
const gesamtElement = document.querySelector('.gesamt');

// Funktion zum Hinzufügen eines Artikels zum Warenkorb
function addToCart(name, pricePerUnit, unit, button) {
    const quantitySelect = button.closest('.item').querySelector('.quantity-select');
    const quantity = parseInt(quantitySelect.value);
    const price = (pricePerUnit * (unit === 'g' ? quantity / 10 : quantity / 50)).toFixed(2);

    const existingItemIndex = cart.findIndex(item => item.name === name);
    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity = quantity;
        cart[existingItemIndex].price = price;
        cart[existingItemIndex].unit = unit;
    } else {
        cart.push({ name, quantity, price, unit });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartSummary();

    // Ändern des Button-Textes und des Stylings
    updateButtonToInCart(button, name, pricePerUnit, unit);
}

// Funktion zum Entfernen eines Artikels aus dem Warenkorb
function removeFromCart(name, button) {
    cart = cart.filter(item => item.name !== name);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartSummary();

    // Zurücksetzen des Button-Textes und des Stylings
    updateButtonToAdd(button, name);
}

// Funktion zum Aktualisieren des Buttons, wenn ein Artikel im Warenkorb ist
function updateButtonToInCart(button, name, pricePerUnit, unit) {
    button.innerHTML = '<span class="inline-icon icon-check"></span>Im Warenkorb';
    button.style.backgroundColor = 'black';
    button.style.color = 'white';
    button.closest('.item').style.borderColor = 'black';

    // Hinzufügen von Hover-Effekt und Entfernen-Funktion
    button.onmouseover = () => {
        button.innerHTML = '<span class="inline-icon icon-trash"></span>Entfernen';
    };
    button.onmouseout = () => {
        button.innerHTML = '<span class="inline-icon icon-check"></span>Im Warenkorb';
    };
    button.onclick = () => {
        removeFromCart(name, button);
    };

    // Speichern der Preis- und Einheit-Informationen im Button
    button.dataset.pricePerUnit = pricePerUnit;
    button.dataset.unit = unit;
}

// Funktion zum Zurücksetzen des Buttons, wenn ein Artikel aus dem Warenkorb entfernt wurde
function updateButtonToAdd(button, name) {
    button.innerHTML = '<span class="inline-icon icon-warenkorb"></span>In den Warenkorb';
    button.style.backgroundColor = '';
    button.style.color = '';
    button.closest('.item').style.borderColor = '';
    button.onmouseover = null;
    button.onmouseout = null;
    button.onclick = () => {
        const pricePerUnit = parseFloat(button.dataset.pricePerUnit);
        const unit = button.dataset.unit;
        addToCart(name, pricePerUnit, unit, button);
    };
}

// Funktion zum Aktualisieren des Preises basierend auf der ausgewählten Menge
function updatePrice(quantitySelect, pricePerUnit, unit, priceElement) {
    const quantity = parseInt(quantitySelect.value);
    const price = (pricePerUnit * (unit === 'g' ? quantity / 10 : quantity / 50)).toFixed(2);
    priceElement.textContent = `${price}€`;
}

// Funktion zum Aktualisieren der Warenkorb-Zusammenfassung
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
                <span class="warenkorb-item-page__itemqty">${item.quantity}${item.unit}</span>
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

    // Überprüfen, ob der Mindestbestellwert erreicht ist
    const ctaWeiterButton = document.querySelector('.cta-weiter');
    if (ctaWeiterButton) {
        if (gesamtPreis >= 5) {
            ctaWeiterButton.disabled = false;
            ctaWeiterButton.textContent = 'Weiter zur Kasse';
            ctaWeiterButton.style.backgroundColor = ''; // Standardfarbe
        } else {
            ctaWeiterButton.disabled = true;
            ctaWeiterButton.textContent = 'Der Mindestbestellwert von 5€ wurde noch nicht erreicht.';
            ctaWeiterButton.style.backgroundColor = 'gray'; // Deaktivierte Farbe
        }
    }
}

// Event-Listener für den "Weiter zur Kasse" Button
document.querySelector('.cta-weiter').addEventListener('click', () => {
    const gesamtPreis = parseFloat(gesamtElement.textContent.replace('€', ''));
    if (gesamtPreis >= 5) {
        window.location.href = 'warenkorb.html';
    } else {
        alert('Der Mindestbestellwert von 5€ wurde nicht erreicht.');
    }
});

// Initial update of the cart summary
updateCartSummary();

function checkout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let email;

    const emailBody = cart.map(item => `${item.name}: ${item.quantity}${item.unit} - ${item.price}€`).join('\n');
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
            <span class="warenkorb-item-page__itemqty">${item.quantity}${item.unit}</span>
            <span class="warenkorb-item-page__itemprice">${item.price}€</span>
        `;
        warenkorbItemsContainer.appendChild(itemElement);
        gesamtPreis += parseFloat(item.price);
    });

    document.querySelector('.gesamt').textContent = `Gesamt: ${gesamtPreis.toFixed(2)}€`;
}