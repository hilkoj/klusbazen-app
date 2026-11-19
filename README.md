🏆 KlusBazen

Samen klussen, samen vieren!

KlusBazen is een vrolijke gezinsapp voor Android die huishoudelijke klusjes leuk maakt voor zowel kinderen als volwassenen. Door samen klusjes af te vinken verdien je punten die optellen tot een gezamenlijk doel. Halen jullie het doel binnen de periode? Dan hebben jullie samen de beloning verdiend — zoals uit eten gaan of een grote spelletjesavond! 🎉

✨ Functies

🧹 Klusjes & Punten: Kies wie het klusje doet en vink het af. Afhankelijk van de grootte verdien je punten (Klein = 10 pnt, Middel = 20 pnt, Groot = 35 pnt). Voeg eenvoudig eigen klusjes en gezinsleden met leuke avatars toe.

🎯 Gezamenlijk Doel & Beloning: Een duidelijke voortgangsbalk en afteller laten zien hoe dicht jullie bij de beloning zijn. Behaalde beloningen worden bewaard in de trofeeënkast.

🥇 Ranglijst & Erepodium: Een speels erepodium voor de top 3, ieders procentuele bijdrage aan het totaal en een overzicht van de laatst gedane klusjes om iedereen te motiveren.

☁️ Live Synchronisatie (Firebase): Koppel een gratis Firebase Realtime Database zodat alle telefoons in huis direct bijgewerkt blijven.

📱 Installeren op Android

De nieuwste, gesigneerde Android-app (.apk) wordt automatisch gebouwd en klaargezet onder Releases:

Ga op je Android-telefoon naar het tabblad Releases rechts in deze repository.

Download bij de nieuwste versie het bestand KlusBazen-v1.0.x.apk.

Open het gedownloade bestand en tik op Installeren (sta bij de eerste keer eenmalig "Installeren vanuit onbekende bronnen" toe).

Updaten: Nieuwe versies worden met dezelfde sleutel ondertekend. Je kunt een nieuwe .apk dus gewoon over de bestaande app heen installeren zonder dat je instellingen verloren gaan.

☁️ Firebase Synchronisatie instellen

De app werkt direct in lokale demomodus, maar om met het hele gezin samen te sparen koppel je eenmalig een gratis Firebase Realtime Database:

Maak een gratis project aan op console.firebase.google.com.

Ga naar Build → Realtime Database, maak een database aan en kies voor Test mode.

Kopieer de database-URL (bijv. https://jouw-project-default-rtdb.europe-west1.firebasedatabase.app).

Open KlusBazen op elke telefoon, ga naar het tabblad App & Sync, plak de URL en tik op Koppelen & Synchroniseren.

🛠️ Techniek & Automatisch Bouwen

KlusBazen is gebouwd met:

Frontend: React, Vite, Tailwind CSS & Lucide Icons

Android Wrapper: Capacitor (@capacitor/android & @capacitor/assets)

CI/CD: GitHub Actions (.github/workflows/build-apk.yml)