# Mise en ligne avec votre nom de domaine

Adresse recommandée : **`https://spa.kasbahsaharaservices.com`**

Il s'agit d'un sous-domaine de votre domaine actuel. Votre site WordPress principal n'est pas touché, et le spa reste à une adresse courte et claire, bien adaptée à un QR Code.

> ℹ️ Le site doit être publié **à la racine** d'un domaine ou d'un sous-domaine (`spa.kasbahsaharaservices.com`), et non dans un sous-dossier (`kasbahsaharaservices.com/spa/`). Un sous-dossier demanderait une petite adaptation du code.

Deux options sont possibles. **L'option A est recommandée.**

---

## Option A – Netlify (gratuit, HTTPS automatique, recommandé)

### Étape 1 – Créer le site sur Netlify

**Méthode simple (glisser-déposer) :**

1. Sur l'ordinateur, dans le dossier du projet, lancez :
   ```bash
   npm install
   npm run build
   ```
   (Sous Windows PowerShell : `$env:VITE_PUBLIC_SITE_URL="https://spa.kasbahsaharaservices.com"; npm run build` pour inclure l'adresse dans les balises SEO et le sitemap.)
2. Créez un compte gratuit sur <https://app.netlify.com>.
3. Ouvrez **Add new site → Deploy manually**, puis glissez-déposez le dossier **`dist`**.
4. Netlify donne une adresse provisoire du type `https://nom-aleatoire.netlify.app`. Ouvrez-la sur votre téléphone pour vérifier.

**Méthode automatique (recommandée pour les mises à jour) :**

1. Mettez le projet sur GitHub (dépôt privé).
2. Sur Netlify : **Add new site → Import an existing project → GitHub**, puis choisissez le dépôt.
3. Les réglages sont lus automatiquement depuis `netlify.toml` (commande `npm run build`, dossier `dist`).
4. Dans **Site configuration → Environment variables**, ajoutez :
   `VITE_PUBLIC_SITE_URL` = `https://spa.kasbahsaharaservices.com`
5. Chaque modification enregistrée sur GitHub (un prix, par exemple) est mise en ligne en environ une minute.

### Étape 2 – Brancher le sous-domaine

1. Sur Netlify : **Domain management → Add a domain**, puis saisissez `spa.kasbahsaharaservices.com` et validez.
2. Netlify affiche l'enregistrement DNS à créer. Connectez-vous chez **le fournisseur où est géré le DNS de kasbahsaharaservices.com** (OVH, Hostinger, GoDaddy, o2switch, Cloudflare…).
3. Dans la zone DNS, ajoutez :

   | Type | Nom / Hôte | Valeur / Cible | TTL |
   |---|---|---|---|
   | `CNAME` | `spa` | `nom-de-votre-site.netlify.app` | par défaut |

   ⚠️ Ne modifiez **pas** les enregistrements existants (`@`, `www`, `MX` pour les e-mails) : le site WordPress et vos e-mails continuent de fonctionner normalement.
4. La propagation prend de quelques minutes à quelques heures. Netlify active ensuite **automatiquement le certificat HTTPS** (Let's Encrypt).
5. Vérifiez que `https://spa.kasbahsaharaservices.com` s'ouvre, avec le cadenas, sur votre téléphone.

---

## Option B – Votre hébergement actuel (cPanel, etc.)

À utiliser si vous préférez tout garder chez votre hébergeur WordPress.

1. Dans cPanel (ou équivalent) : **Domaines → Sous-domaines**, puis créez `spa`. Le dossier associé sera par exemple `public_html/spa` ou `spa.kasbahsaharaservices.com/`.
2. Activez **SSL / Let's Encrypt** pour ce sous-domaine (menu « SSL/TLS Status » ou « Let's Encrypt »).
3. Sur l'ordinateur, construisez le site avec l'adresse :
   ```powershell
   $env:VITE_PUBLIC_SITE_URL="https://spa.kasbahsaharaservices.com"; npm run build
   ```
4. Envoyez **tout le contenu** du dossier `dist/`, y compris le fichier caché `.htaccess`, dans le dossier du sous-domaine. Utilisez le gestionnaire de fichiers de cPanel ou un client FTP comme FileZilla.
5. Le fichier `.htaccess` fourni force le HTTPS, ajoute les en-têtes de sécurité et règle le cache.

Pour chaque mise à jour : relancez `npm run build`, puis renvoyez le contenu de `dist/`.

---

## Étape finale – QR Code et affiches

Une fois l'adresse définitive en ligne et testée :

```bash
npm run qr -- --url https://spa.kasbahsaharaservices.com
```

Puis imprimez `qr/poster-A5.pdf`. Pour une affiche personnalisée par chambre, voir le README (`--rooms`).

---

## Liste de vérification avant d'imprimer les affiches

- [ ] Le site s'ouvre en **https://** sur iPhone et sur Android (4G et Wi-Fi de l'hôtel).
- [ ] Le QR Code imprimé ouvre bien la page (test avec l'appareil photo de l'iPhone et avec Google Lens sur Android).
- [ ] Une réservation test arrive bien sur le WhatsApp de l'hôtel avec toutes les informations.
- [ ] Les boutons « Appeler » composent le bon numéro.
- [ ] Les trois langues s'affichent correctement.
- [ ] Les prix correspondent à la carte papier.

## Sécurité

- Le site est statique : pas de base de données, pas de mot de passe, pas de serveur à maintenir.
- Les en-têtes de sécurité (Content-Security-Policy, anti-iframe, HSTS…) sont configurés dans `netlify.toml` (option A) et `public/.htaccess` (option B).
- Les saisies du formulaire sont nettoyées et limitées en longueur. Elles ne sont jamais exécutées ni stockées, seulement transmises dans le message WhatsApp.
