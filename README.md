# Kasbah Sahara Services – Spa & Massages

Page web mobile de présentation et de réservation des massages de la Kasbah Sahara Services (M'hamid El Ghizlane).
Les clients y arrivent en scannant le QR Code placé dans leur chambre.

- **Langues :** anglais (par défaut), français, arabe (affichage de droite à gauche).
- **Réservation :** formulaire → message WhatsApp pré-rempli envoyé à l'hôtel. Le client voit clairement que sa demande reste **« en attente de confirmation »** tant que l'équipe n'a pas répondu.
- **Bouton WhatsApp** flottant, visible partout sur la page.
- **Technologie :** React 19 + TypeScript + Vite + Tailwind CSS. Le site est entièrement statique : il n'y a ni serveur ni base de données, donc rien à pirater côté serveur, l'hébergement est gratuit ou presque, et les pages chargent très vite.

---

## 1. Modifier le contenu (sans être développeur)

| Je veux modifier… | Fichier |
|---|---|
| **Les prix, durées, descriptions des massages** | [`src/data/massages.ts`](src/data/massages.ts) |
| Le **numéro WhatsApp qui reçoit les réservations**, les contacts, les horaires du spa | [`src/config/site.ts`](src/config/site.ts) |
| Les textes de la page | [`src/i18n/en.ts`](src/i18n/en.ts), [`fr.ts`](src/i18n/fr.ts), [`ar.ts`](src/i18n/ar.ts) |
| Les photos | `public/images/` (format `.webp`, versions 800 px et 1400 px) |
| Le logo | `public/brand/` |

**Exemple : changer le prix du massage oriental 60 min de 60 € à 65 €.** Dans `src/data/massages.ts`, remplacez :

```ts
{ id: '60', minutes: 60, price: 60, area: AREA.fullBody },
```

par :

```ts
{ id: '60', minutes: 60, price: 65, area: AREA.fullBody },
```

Enregistrez, puis remettez le site en ligne (voir [DEPLOIEMENT.md](DEPLOIEMENT.md)). Avec Netlify relié à GitHub, la mise en ligne est automatique.

- Pour masquer temporairement une durée ou un massage, ajoutez `available: false`.
- Chaque texte existe en `en`, `fr` et `ar` : modifiez les trois.
- Le prix affiché dans le formulaire, le message WhatsApp et les données Google (SEO) se mettent à jour automatiquement.

**Horaires du spa :** dans `src/config/site.ts`, remplacez `spaHours: null` par `spaHours: { open: '09:00', close: '20:00' }`. Le formulaire refusera alors les heures en dehors de cette plage.

---

## 2. Lancer le projet sur un ordinateur

Prérequis : [Node.js](https://nodejs.org) 20 ou plus récent.

```bash
npm install          # une seule fois
npm run dev          # aperçu local sur http://localhost:5173
npm run build        # génère le site final dans le dossier dist/
npm test             # tests automatiques (iPhone, Android, iPad, ordinateur)
```

Pour tester sur votre téléphone pendant le développement, lancez `npm run dev -- --host`, puis ouvrez l'adresse « Network » affichée, avec le téléphone sur le même Wi-Fi.

---

## 3. QR Code et affiche pour les chambres

```bash
npm run qr -- --url https://spa.kasbahsaharaservices.com
```

Cette commande crée, dans le dossier `qr/` :

| Fichier | Usage |
|---|---|
| `qr-code-logo.png` / `.svg` | QR Code avec le logo au centre (2048 px / vectoriel) |
| `qr-code.png` / `.svg` | QR Code sans logo, la compatibilité la plus large |
| `poster-A5.pdf` | **Affiche à imprimer** (A5, 148 × 210 mm, QR vectoriel) |
| `poster-A5.png` | La même affiche en image, 300 dpi |

Chaque QR Code est relu automatiquement après sa création. Le script s'arrête si le code ne renvoie pas exactement vers la bonne adresse.

**Une affiche par chambre (facultatif) :**

```bash
npm run qr -- --url https://spa.kasbahsaharaservices.com --rooms 1-24
# ou une liste précise :  --rooms 1,2,3,101,102,Suite-A
```

Chaque affiche porte alors « ROOM 12 », et le formulaire s'ouvre avec le numéro de chambre déjà rempli.

> ⚠️ **Générez et imprimez le QR Code seulement après avoir mis le site en ligne à son adresse définitive, puis testé cette adresse sur un téléphone.** Le QR Code actuel du dossier `qr/` pointe vers l'adresse proposée `https://spa.kasbahsaharaservices.com/`, qui n'existe pas encore.

**Conseils d'impression :** papier mat 250–300 g, impression à 100 % (sans « ajuster à la page »). Le QR Code mesure 5,2 cm, ce qui permet de le scanner facilement jusqu'à environ 50 cm. N'imprimez pas le QR Code en plus petit que 3 cm. Testez avec un iPhone et un Android avant l'impression en série.

---

## 4. Comment fonctionne la réservation

1. Le client remplit le formulaire : nom, chambre, massage, style (relaxant ou revitalisant), durée, date, heure et message.
2. Le formulaire vérifie la saisie : champs obligatoires, date passée, heure déjà passée aujourd'hui (selon l'heure du Maroc, quel que soit le fuseau du téléphone).
3. Au clic sur **CONFIRM MY BOOKING**, WhatsApp s'ouvre avec un message prêt à envoyer, rédigé dans la langue du client, à destination du numéro défini dans `site.ts` (par défaut l'hôtel, +212 661 776 766).
4. La page affiche **« En attente de confirmation »** avec le récapitulatif, et indique que le massage n'est pas réservé tant que l'hôtel n'a pas répondu.
5. L'équipe répond au client sur WhatsApp pour confirmer ou proposer un autre horaire.

Aucune donnée personnelle n'est stockée par le site : tout passe directement par WhatsApp.

---

## 5. Évolution : espace administrateur

L'architecture le prévoit déjà :

- [`src/lib/booking.ts`](src/lib/booking.ts) contient toutes les règles de réservation, sans aucune interface. Une API ou un back-office pourra les réutiliser.
- [`src/services/bookingService.ts`](src/services/bookingService.ts) est le seul point de sortie d'une demande. Il suffit de définir la variable `VITE_BOOKING_API_URL` pour que chaque demande soit aussi envoyée à une base de données (Supabase, Firebase ou petite API Node), avec le statut `requested`.
- Un espace admin, par exemple `admin.kasbahsaharaservices.com` protégé par mot de passe, pourra alors lister les demandes et les passer en « confirmée » ou « refusée ».

---

## 6. Structure du projet

```
src/
  config/site.ts        ← contacts, numéro WhatsApp, horaires
  data/massages.ts      ← carte des massages et prix
  i18n/                 ← traductions EN / FR / AR
  lib/booking.ts        ← validation et message WhatsApp
  services/             ← envoi de la demande (WhatsApp, puis API admin)
  components/           ← sections de la page
public/                 ← images, logo, icônes, .htaccess
scripts/generate-qr.mjs ← QR Code et affiches
tests/spa.spec.ts       ← tests automatiques
qr/                     ← QR Codes et affiches générés
```

## Crédits photos

Les photos de l'hôtel (piscine) proviennent du site kasbahsaharaservices.com. Les photos de massage, d'huiles, de pierres chaudes et des dunes viennent d'[Unsplash](https://unsplash.com/license), libres d'utilisation commerciale. Pour un rendu 100 % authentique, remplacez-les par des photos de votre propre espace massage, en gardant les mêmes noms de fichiers.
