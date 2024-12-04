document.addEventListener("DOMContentLoaded", () => {
    const orderData = JSON.parse(localStorage.getItem('orderData'));
    if (orderData) {
        const bestellungsItemsContainer = document.getElementById('bestellungs-items');
        const bestellungsDatenContainer = document.getElementById('bestellungs-daten');

        let gesamtPreis = 0;
        orderData.cart.forEach(item => {
            const itemElement = document.createElement('li');
            itemElement.textContent = `${item.name}: ${item.quantity}${item.unit} - ${item.price}€`;
            bestellungsItemsContainer.appendChild(itemElement);
            gesamtPreis += parseFloat(item.price);
        });

        const gesamtPreisElement = document.createElement('li');
        gesamtPreisElement.classList.add('gesamtPreis');
        gesamtPreisElement.innerHTML = `<strong>Gesamtpreis:</strong> <div class="price">${gesamtPreis.toFixed(2)}€</div>`;
        bestellungsItemsContainer.appendChild(gesamtPreisElement);

        bestellungsDatenContainer.innerHTML = `
            <li><strong>Name:</strong> ${orderData.name}</li>
            <li><strong>E-Mail:</strong> ${orderData.email}</li>
            <li><strong>Datum:</strong> ${orderData.datum}</li>
            <li><strong>Uhrzeit:</strong> ab ${orderData.uhrzeit} Uhr</li>
        `;

        // Löschen der Bestelldaten und des Warenkorbs aus dem LocalStorage
        localStorage.removeItem('orderData');
        localStorage.removeItem('cart');
    }
});