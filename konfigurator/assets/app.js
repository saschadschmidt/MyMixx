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
                    <button type="button" class="add-to-cart-btn" onclick="addToCart('${item.name}', ${item.pricePer10g}, this)">Hinzufügen</button>
                `;
                appContainer.appendChild(appItem);

                // Überprüfen, ob das Produkt bereits im Warenkorb ist
                const existingItem = cart.find(cartItem => cartItem.name === item.name);
                if (existingItem) {
                    const button = appItem.querySelector('.add-to-cart-btn');
                    button.textContent = 'Hinzugefügt';
                    button.style.backgroundColor = 'black';
                    button.style.color = 'white';
                    appItem.style.borderColor = 'black';

                    button.onmouseover = () => {
                        button.textContent = 'Entfernen';
                    };
                    button.onmouseout = () => {
                        button.textContent = 'Hinzugefügt';
                    };
                    button.onclick = () => {
                        removeFromCart(item.name, button);
                    };
                }
            });
        });

    updateCartSummary();
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
    button.textContent = 'Hinzugefügt';
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
    button.textContent = 'Hinzufügen';
    button.style.backgroundColor = '';
    button.style.color = '';
    button.closest('.app-item').style.borderColor = '';
    button.onmouseover = null;
    button.onmouseout = null;
    button.onclick = () => addToCart(name, parseFloat(button.closest('.app-item').querySelector('.price').textContent), button);
}

function updateCartSummary() {
    let gesamtPreis = 0;

    cart.forEach(item => {
        gesamtPreis += parseFloat(item.price);
    });

    gesamtElement.textContent = `Gesamt: ${gesamtPreis.toFixed(2)}€`;
}

document.querySelector('.cta').addEventListener('click', () => {
    window.location.href = 'warenkorb.html';
});

// Initial update of the cart summary
updateCartSummary();

function checkout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const email = "example@example.com"; // Hier die Ziel-E-Mail-Adresse einfügen

    const emailBody = cart.map(item => `${item.name}: ${item.quantity}g - ${item.price}€`).join('\n');
    window.location.href = `mailto:${email}?subject=Warenkorb Bestellung&body=${encodeURIComponent(emailBody)}`;
}
