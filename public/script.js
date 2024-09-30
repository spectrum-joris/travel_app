document.addEventListener('DOMContentLoaded', async () => {
    // 2 async functie om locaties uit JSON te halen
    async function fetchLocations() {
        try {
            const response = await fetch("/locations");
            if (!response.ok) throw new Error("kan locaties niet ophalen");
            const locations = await response.json();
            console.log("locaties: ", locations);
            return locations;
        } catch (error) {
            console.error("fout bij laden van locaties: ", error);
            return [];
        }
    }

    // 3 functie om de map te initialiseren
    function initializeMap() {
        const map = L.map("map").setView([51.046057818355756, 3.7117692727752516], 3);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors"
        }).addTo(map);   
        console.log("map geïnitialiseerd: ", map);     
        return map;
    }

    // Functie om de afstand te berekenen tussen twee coördinaten
    function calculateDistance(latlng1, latlng2) {
        return latlng1.distanceTo(latlng2) / 1000; // Afstand in kilometers
    }

    // 4 Pas het eigen icoon aan met de juiste grootte
    const customIcon = L.icon({
        iconUrl: '/images/marker-icon.png', // Zorg ervoor dat het pad naar je eigen icon klopt
        iconSize: [64, 64], // Pas deze waarden aan om het icoon te schalen
        iconAnchor: [32, 64], // Punt van het icoon dat op de locatie komt te staan (midden-onder)
        popupAnchor: [0, -64] // De plek waar de popup opent, t.o.v. het icoon
    });

    // 5 functie om markers en list items toe te voegen aan kaart resp. DOM
    function displayLocations(map, locations) {
        const locationsList = document.getElementById("locationsList");
        const latlngs = []; // Array om de coördinaten op te slaan voor de polyline
        let previousLatLng = null; // Houd de vorige locatie bij voor afstandsberekening

        locations.forEach((location) => {
            const currentLatLng = L.latLng(location.latitude, location.longitude); // Coördinaten voor deze locatie
            latlngs.push(currentLatLng); // Voeg de locatie toe aan de array voor de polyline

            // Voeg marker toe aan kaart
            const marker = L.marker(currentLatLng, { icon: customIcon }).addTo(map);
            marker.bindPopup(`<b>${location.name}</b><br>${location.description}`);

            // Voeg locatie toe aan lijst
            const listItem = document.createElement("div");
            listItem.classList.add("location-item");
            listItem.textContent = location.name;

            // Voeg de afstand toe als dit niet de eerste locatie is
            if (previousLatLng) {
                const distance = calculateDistance(previousLatLng, currentLatLng).toFixed(2);
                listItem.textContent += ` (Afstand vanaf vorige stop: ${distance} km)`;
            }

            locationsList.appendChild(listItem);

            // Inzoomen op locatie bij klikken
            listItem.addEventListener("click", () => {
                map.setView(currentLatLng, 10);
                marker.openPopup();
            });

            // Sla de huidige locatie op als de vorige voor de volgende iteratie
            previousLatLng = currentLatLng;
        });

        // Teken de polyline die de locaties verbindt
        const polyline = L.polyline(latlngs, { color: 'blue' }).addTo(map);
        map.fitBounds(polyline.getBounds()); // Zorg ervoor dat de kaart op alle locaties inzoomt
    }

    // 1 de "main" async functie om de kaart en locaties te laden
    async function main() {
        try {
            const map = initializeMap();
            const locations = await fetchLocations();
            if (locations.length > 0) {
                displayLocations(map, locations);
            } else {
                console.error("Er werden geen locaties geladen.");
            }
        } catch (error) {
            console.error("Er deed zich een probleem voor bij het laden van de app:", error);
        }
    }

    // Initialiseer de kaart
    main();
});
