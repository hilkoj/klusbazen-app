# 🏆 KlusBazen
**Samen klussen, samen vieren!**

**KlusBazen** is een vrolijke gezinsapp voor Android die huishoudelijke klusjes leuk maakt voor zowel kinderen als volwassenen. Door samen klusjes af te vinken verdien je punten die optellen tot een gezamenlijk doel. Halen jullie het doel binnen de periode? Dan hebben jullie samen de beloning verdiend — zoals uit eten gaan of een grote spelletjesavond! 🎉

---

## ✨ Functies

* **🧹 Klusjes & Punten:** Kies wie het klusje doet en vink het af. Afhankelijk van de grootte verdien je punten (**Klein** = 10 pnt, **Middel** = 20 pnt, **Groot** = 35 pnt). Voeg eenvoudig eigen klusjes en gezinsleden met leuke avatars toe.
* **🎯 Gezamenlijk Doel & Beloning:** Een duidelijke voortgangsbalk en afteller laten zien hoe dicht jullie bij de beloning zijn. Behaalde beloningen worden bewaard in de trofeeënkast.
* **🥇 Ranglijst & Erepodium:** Een speels erepodium voor de top 3, ieders procentuele bijdrage aan het totaal en een overzicht van de laatst gedane klusjes om iedereen te motiveren.
* **☁️ Live Synchronisatie (Firebase):** Koppel een gratis Firebase Realtime Database zodat alle telefoons in huis direct bijgewerkt blijven.

---

## 📱 Installeren op Android

De nieuwste, gesigneerde Android-app (`.apk`) wordt automatisch gebouwd en klaargezet onder **Releases**:

1. Ga op je Android-telefoon naar het tabblad **[Releases](../../releases)** rechts in deze repository.
2. Download bij de nieuwste versie het bestand `KlusBazen-v1.0.x.apk`.
3. Open het gedownloade bestand en tik op **Installeren** *(sta bij de eerste keer eenmalig "Installeren vanuit onbekende bronnen" toe)*.
4. **Updaten:** Nieuwe versies worden met dezelfde sleutel ondertekend. Je kunt een nieuwe `.apk` dus gewoon over de bestaande app heen installeren zonder dat je instellingen verloren gaan.

---

## ☁️ Firebase Synchronisatie & Rules instellen

De app werkt direct in lokale demomodus, maar om met het hele gezin samen te sparen koppel je eenmalig een gratis Firebase Realtime Database:

1. Maak een gratis project aan op [console.firebase.google.com](https://console.firebase.google.com).
2. Ga naar **Build → Realtime Database**, maak een database aan en kies voor **Test mode**.
3. **Belangrijk (voorkom dat de app na 30 dagen stopt):** Test mode verloopt automatisch na 30 dagen. Ga in Firebase naar het tabblad **Rules**, vervang de inhoud door onderstaande regels en klik op **Publish**:
   ```json
   {
     "rules": {
       "gezin_klusjes": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```
   *(Hiermee blijft alleen het specifieke pad `/gezin_klusjes` dat de app gebruikt blijvend toegankelijk, terwijl de rest van je database op slot staat. Deel je database-URL alleen binnen je eigen gezin.)*
4. Kopieer de database-URL (bijv. `https://jouw-project-default-rtdb.europe-west1.firebasedatabase.app`).
5. Open **KlusBazen** op elke telefoon, ga naar het tabblad **App & Sync**, plak de URL en tik op **Koppelen & Synchroniseren**.

---

## 🛠️ Techniek & Automatisch Bouwen

KlusBazen is gebouwd met:
* **Frontend:** React, Vite, Tailwind CSS & Lucide Icons
* **Android Wrapper:** Capacitor (`@capacitor/android` & `@capacitor/assets`)
* **CI/CD:** GitHub Actions (`.github/workflows/build-apk.yml`)

### Lokaal ontwikkelen
```bash
npm install
npm run dev
```

### Automatische Release Builds (GitHub Actions)
Bij elke push naar `main` bouwt GitHub Actions automatisch een nieuwe, gesigneerde Release APK met een oplopend versienummer en publiceert deze onder **Releases**. Hiervoor zijn de volgende **Repository Secrets** ingesteld onder *Settings → Secrets and variables → Actions*:

* `KEYSTORE_BASE64` – De Base64-gecodeerde `.jks`-keystore
* `KEYSTORE_PASSWORD` – Het wachtwoord van de keystore
* `KEY_ALIAS` – De alias van de sleutel (bijv. `klusbazen`)
* `KEY_PASSWORD` – Het wachtwoord van de sleutel

---

Veel klusplezier samen! 🧽✨