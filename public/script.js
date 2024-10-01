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
    // Functie om de juiste icon voor de marker te kiezen op basis van het type of duration
    function getCustomIcon(type, duration) {
        let iconUrl = '/images/default-marker.png'; // Fallback als geen type bekend is

        // Controleer eerst op de duration
    if (duration === 0) {
        iconUrl = '/images/not-marker.png';  // Speciale marker voor locaties zonder duration
    } else if (type === 'beach') {
        iconUrl = '/images/beach-marker.png';
    } else if (type === 'sports') {
        iconUrl = '/images/sports-marker.png';
    } else if (type === 'adventure') {
        iconUrl = '/images/adventure-marker.png';
    } else if (type === 'nature') {
        iconUrl = '/images/nature-marker.png';
    } else if (type === 'city') {
        iconUrl = '/images/city-marker.png';
    }

    return L.icon({
        iconUrl: iconUrl,
        iconSize: [40, 40], // Pas grootte aan zoals gewenst
        iconAnchor: [20, 40], // Punt van het icoon dat op de locatie komt te staan
        popupAnchor: [0, -40] // Waar de popup opent t.o.v. het icoon
        });
    }


    // 5 functie om markers en list items toe te voegen aan kaart resp. DOM
    // Voeg markers en list items toe aan de kaart en DOM
    function displayLocations(map, locations) {
        const locationsList = document.getElementById("locationsList");
        const latlngs = [];
        let previousLatLng = null;

        locations.forEach((location) => {
            const currentLatLng = L.latLng(location.latitude, location.longitude);
            latlngs.push(currentLatLng);

            // Kies het juiste icoon op basis van het type
            const customIcon = getCustomIcon(location.type, location.duration);

            // Voeg marker toe aan kaart
            const marker = L.marker(currentLatLng, { icon: customIcon }).addTo(map);
            marker.bindPopup(`<b>${location.name} • ${location.duration} dagen</b><br>${location.description}`);

            // Voeg locatie toe aan lijst
            const listItem = document.createElement("div");
            listItem.classList.add("location-item");

            function getRandomColor() {
                const r = Math.ceil(Math.random() * 70);
                const g = Math.ceil(Math.random() * 150);
                const b = Math.ceil(Math.random() * 120);
                return `rgba(${r},${g},${b}, .7)`;
            }

            listItem.style.backgroundColor = getRandomColor();
            listItem.style.color = "beige";
            listItem.style.boxShadow = "0.1rem 0.1rem 0.5rem rgba(0, 0, 0, 0.3)";

            // Zet de type en naam in een grotere tekst
            const nameDiv = document.createElement("div");
            nameDiv.classList.add("location-name");
            nameDiv.innerHTML = `${location.type} ${location.name}`;

            // Voeg de afstand toe in een kleinere tekst
            const distanceDiv = document.createElement("div");
            distanceDiv.classList.add("location-distance");

            if (previousLatLng) {
                const distance = calculateDistance(previousLatLng, currentLatLng).toFixed(0);
                distanceDiv.innerHTML = `Afstand: ${distance} km`;
            }

            listItem.appendChild(nameDiv);
            listItem.appendChild(distanceDiv);
            locationsList.appendChild(listItem);

            // Inzoomen op locatie bij klikken
            listItem.addEventListener("click", () => {
                map.setView(currentLatLng, 10);
                marker.openPopup();
            });

            previousLatLng = currentLatLng;
        });
        
        // teken de lijn
        const polyline = L.polyline(latlngs, { color: '#c62fab' }).addTo(map);
        map.fitBounds(polyline.getBounds());
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
