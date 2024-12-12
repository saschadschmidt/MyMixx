document.addEventListener("DOMContentLoaded", () => {
    const orderData = JSON.parse(localStorage.getItem('orderData'));
    if (orderData && orderData.cart.length > 0) {
        const bestellungsItemsContainer = document.getElementById('bestellungs-items');
        const bestellungsDatenContainer = document.getElementById('bestellungs-daten');

        let gesamtPreis = 0;
        orderData.cart.forEach(item => {
            const itemElement = document.createElement('li');
            itemElement.innerHTML = `<div class="item-container"><div class="item-name">${item.quantity}${item.unit} ${item.name}</div> <div class="item-price"> ${item.price}€</div></div>`;
            bestellungsItemsContainer.appendChild(itemElement);
            gesamtPreis += parseFloat(item.price);
        });

        const gesamtPreisElement = document.createElement('li');
        gesamtPreisElement.classList.add('gesamtPreis');
        gesamtPreisElement.innerHTML = `<strong>Gesamtpreis:</strong> <div class="price">${gesamtPreis.toFixed(2)}€</div>`;
        bestellungsItemsContainer.appendChild(gesamtPreisElement);

        bestellungsDatenContainer.innerHTML = `
            <li class="item-container"><strong>Name:</strong> ${orderData.name}</li>
            <li class="item-container"><strong>E-Mail:</strong> ${orderData.email}</li>
            <li class="item-container"><strong>Datum:</strong> ${orderData.datum}</li>
            <li class="item-container"><strong>Uhrzeit:</strong> ${orderData.uhrzeit} Uhr</li>
        `;

        // Löschen der Bestelldaten und des Warenkorbs aus dem LocalStorage || auskommentieren falls dies nicht gewünscht ist wie in DOKUMENTATION.md beschrieben.
        localStorage.removeItem('orderData');
        localStorage.removeItem('cart');
    } else {
        // Weiterleitung zur Startseite, wenn der Warenkorb leer ist
        window.location.href = 'index.html';
    }
});