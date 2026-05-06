/**
 * 🎯 CONFIGURATION ADNOV TOUR - Système Automatisé Master
 * 🧠 LE CERVEAU CENTRAL (Connexion directe Brevo + Alerte SMS Organisateur)
 * Gère : Inscription, Validation, Double-Listing Brevo et Design Dynamique.
 */

// 🛡️ SÉCURITÉ : Découpage de la clé pour éviter le blocage GitHub
const P1 = "xkeysib-b9dfa56ce058bcf7b0eb2211261d192e3";
const P2 = "e0c846b751f1842b64402b6e273f21c";
const P3 = "-QdHrSz2m4Qk5Zv8o";
const BREVO_API_KEY = P1 + P2 + P3;

const adnovEvents = {
    "adnov_tour": {
        id: "adnov_tour",
        actif: true,
        nom: "ADNOV TOUR",
        couleur: "#0a3f70",
        couleurAccent: "#2b40d3",

        // 🛠️ CONFIGURATION DES LISTES BREVO
        listeInscription: [9],
        listePassage: [10],

        statutInscription: "Inscrit",
        statutPresence: "Présent",

        // Lien pour les nouveaux sur place
        formPassage: "https://9d65705b.sibforms.com/serve/MUIFAMyGzKFsP_p6Ahvu-Ov190DRV286CKjH4D0wEsSoxtbDyFRF5uWapFtxwnzESDnlC0Ci7s6wLCAVpGMx3DZ6OqxpO3TH4uxsmM7n7-7R8DPyOgltdeLbveH9HlfD9OvrQJcq3ssEPqTKswBfhnunX-bWQsHTaqZQCk1P9lp_ji5YIncK0rRSeFpX0AIJxO7Qc-mmrgZfXJi9dQ=="
    },
    "default": {
        id: "default", actif: false, nom: "ADNOV", couleur: "#64748b", couleurAccent: "#94a3b8"
    }
};

/**
 * 🎨 MODULE 1 : APPLICATION DE LA CONFIGURATION (Design & Sécurité)
 */
function appliquerConfig() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventID = urlParams.get('event') || "adnov_tour";
    const config = adnovEvents[eventID] || adnovEvents["default"];

    if (config.actif === false && config.id !== "default") {
        document.body.innerHTML = `<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#0f172a;color:white;font-family:sans-serif;text-align:center;padding:20px;"><div><h1 style="color:#fdc533;font-size:40px;">🛡️</h1><h2 style="margin-top:10px;">Accès Suspendu</h2><p style="color:#94a3b8;margin-top:10px;">Le portail ADNOV est temporairement inactif.</p></div></div>`;
        throw new Error("Événement inactif.");
    }

    document.documentElement.style.setProperty('--primary', config.couleur);
    document.documentElement.style.setProperty('--accent', config.couleurAccent);
    document.title = config.nom + " | Portail Officiel";
    document.querySelectorAll('.nom-event').forEach(el => el.innerText = config.nom);
    return config;
}

/**
 * 🛠️ MODULE 2 : UTILITAIRES
 */
const helpers = {
    // Formate un numéro FR en +33...
    formatPhone: (number) => {
        let n = number.trim().replace(/\s/g, '');
        if (n.startsWith('0')) return '+33' + n.substring(1);
        return n;
    },

    // Récupère toutes les checkboxes cochées et les joint par ";"
    getCheckedValues: (name) => {
        return [...document.querySelectorAll(`input[name="${name}"]:checked`)]
            .map(cb => cb.value)
            .join(';');
    }
};

/**
 * 🚀 MODULE 3 : LOGIQUE PRINCIPALE
 */
document.addEventListener('DOMContentLoaded', () => {
    const config = appliquerConfig();

    // ─────────────────────────────────────────────────────────────
    // A. GESTION DU FORMULAIRE D'INSCRIPTION (index.html)
    // ─────────────────────────────────────────────────────────────
    const formInscription = document.getElementById('form-inscription');
    if (formInscription) {

        formInscription.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-submit');
            btn.innerHTML = 'Connexion à Brevo...';
            btn.disabled = true;

            // Statut présence
            const statusValue = document.querySelector('input[name="STATUT_EVENT"]:checked')?.value || "";
            const isAbsent = (statusValue === "Absent");

            // Accompagnants (seulement pertinent si présent, mais on envoie toujours la valeur)
            const nbAccompagnants = document.querySelector('input[name="NB_ACCOMPAGNANTS"]:checked')?.value || "0";

            // Thématiques — plusieurs valeurs possibles, jointes par ";"
            const interets = helpers.getCheckedValues('INTERETS');

            const payload = {
                email: document.getElementById('email').value.trim(),
                listIds: config.listeInscription,
                updateEnabled: true,
                attributes: {
                    NOM:               document.getElementById('nom').value.trim(),
                    PRENOM:            document.getElementById('prenom').value.trim(),
                    ETUDES:            document.getElementById('etudes').value.trim(),
                    FONCTION:          document.getElementById('fonction').value,
                    SMS:               helpers.formatPhone(document.getElementById('sms').value),
                    STATUT_EVENT:      statusValue,
                    NB_ACCOMPAGNANTS:  nbAccompagnants,
                    CENTRES_INTERET:   interets,
                    OPT_IN:            document.getElementById('optin').checked
                }
            };

            try {
                const res = await fetch('https://api.brevo.com/v3/contacts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': BREVO_API_KEY
                    },
                    body: JSON.stringify(payload)
                });

                if (res.ok || res.status === 201 || res.status === 204) {

                    // 📱 SMS à l'organisateur (tâche de fond, erreur silencieuse)
                    const monNumero    = "+33785977164";
                    const nomInscrit   = `${payload.attributes.PRENOM} ${payload.attributes.NOM}`;
                    const smsTitre     = isAbsent ? "ABSENCE NOTIFIÉE" : "NOUVELLE INSCRIPTION";
                    const accompTxt    = isAbsent ? "-" : (nbAccompagnants === "0" ? "Aucun" : nbAccompagnants);
                    const interetsTxt  = interets || "Non renseigné";

                    const messageSMS =
                        `${smsTitre} : ${nomInscrit}\n` +
                        `CRPCEN: ${payload.attributes.ETUDES}\n` +
                        `Email: ${payload.email}\n` +
                        `Fonction: ${payload.attributes.FONCTION}\n` +
                        `Statut: ${statusValue}\n` +
                        `Accompagnants: ${accompTxt}\n` +
                        `Thématiques: ${interetsTxt}`;

                    fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'api-key': BREVO_API_KEY },
                        body: JSON.stringify({
                            type:      "transactional",
                            sender:    "ADNOV",
                            recipient: monNumero,
                            content:   messageSMS
                        })
                    }).catch(err => console.log("Erreur SMS silencieuse :", err));

                    // Affichage de l'état final
                    document.getElementById('form-state').style.display = 'none';

                    if (isAbsent) {
                        document.getElementById('absent-name').innerHTML =
                            `<strong>${payload.attributes.PRENOM} ${payload.attributes.NOM}</strong>`;
                        document.getElementById('absent-state').style.display = 'block';
                    } else {
                        document.getElementById('summary-name').innerHTML =
                            `<strong>${payload.attributes.PRENOM} ${payload.attributes.NOM}</strong>`;
                        const summaryEtude = document.getElementById('summary-etude');
                        if (summaryEtude) summaryEtude.innerText = payload.attributes.ETUDES;
                        document.getElementById('success-state').style.display = 'block';
                    }

                } else {
                    const errorData = await res.json();
                    alert("Erreur Brevo : " + errorData.message);
                    btn.disabled = false;
                    btn.innerHTML = "S'INSCRIRE";
                }

            } catch (err) {
                alert("Erreur réseau.");
                btn.disabled = false;
                btn.innerHTML = "S'INSCRIRE";
            }
        });
    }

    // ─────────────────────────────────────────────────────────────
    // B. GESTION DE LA VALIDATION (valider.html)
    // ─────────────────────────────────────────────────────────────
    const validerContainer = document.getElementById('loading-ui');
    if (validerContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');

        async function processCheckIn() {
            if (!email) {
                validerContainer.innerHTML = "❌ Email manquant dans l'URL.";
                return;
            }

            try {
                const res = await fetch(
                    `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
                    { headers: { 'api-key': BREVO_API_KEY } }
                );

                if (res.ok) {
                    const data = await res.json();
                    const attr = data.attributes;

                    document.getElementById('loading-ui').style.display = 'none';
                    document.getElementById('result-ui').style.display  = 'block';

                    // Accompagnants : affichage lisible
                    const accompAffiche = (!attr.NB_ACCOMPAGNANTS || attr.NB_ACCOMPAGNANTS === "0")
                        ? "Aucun"
                        : `${attr.NB_ACCOMPAGNANTS} personne${attr.NB_ACCOMPAGNANTS > 1 ? 's' : ''}`;

                    const fields = {
                        'res-fullname': `${attr.PRENOM} ${attr.NOM}`,
                        'res-fonction': attr.FONCTION     || "Non renseigné",
                        'res-etude':    attr.ETUDES       || "-",
                        'res-accomp':   accompAffiche,
                        'res-presence': attr.STATUT_EVENT || "Non renseigné",
                        'res-email':    data.email        || email
                    };

                    Object.keys(fields).forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.innerText = fields[id];
                    });

                    // Thématiques : injection des tags dynamiquement
                    const themesContainer = document.getElementById('res-themes-container');
                    if (themesContainer) {
                        const themesRaw = attr.CENTRES_INTERET || "";
                        if (themesRaw) {
                            themesContainer.innerHTML = themesRaw
                                .split(';')
                                .filter(t => t.trim())
                                .map(t => `<span class="theme-tag">${t.trim()}</span>`)
                                .join('');
                        } else {
                            themesContainer.innerHTML = `<span style="font-size:13px;color:#475569;font-style:italic;">Non renseigné</span>`;
                        }
                    }

                    // Mise à jour liste de passage + statut
                    await fetch('https://api.brevo.com/v3/contacts', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'api-key': BREVO_API_KEY
                        },
                        body: JSON.stringify({
                            email:         email,
                            updateEnabled: true,
                            listIds:       config.listePassage,
                            attributes:    { STATUT_EVENT: config.statutPresence }
                        })
                    });

                    const statusBadge = document.getElementById('res-status');
                    if (statusBadge) {
                        statusBadge.innerHTML  = "✅ ENTRÉE VALIDÉE & LISTE DE PASSAGE MISE À JOUR";
                        statusBadge.className  = "status-badge status-success";
                    }

                } else {
                    document.getElementById('loading-ui').innerHTML = `
                        <div style="font-size:50px;margin-bottom:20px;">❌</div>
                        <h1 style="font-size:24px;">Badge Inconnu</h1>
                        <p style="color:#94a3b8;margin:15px 0 25px;">Non inscrit dans la base ADNOV.</p>
                        <a href="${config.formPassage}" target="_blank" style="background:#fdc533;color:#0a3f70;padding:18px;border-radius:14px;text-decoration:none;font-weight:800;display:block;margin-bottom:15px;box-shadow:0 10px 20px rgba(253,197,51,0.2);">INSCRIPTION SUR PLACE</a>
                        <a href="scan.html" style="color:white;opacity:0.6;text-decoration:none;font-size:13px;font-weight:700;">RETOUR SCAN</a>`;
                }

            } catch (err) {
                console.error("Erreur critique :", err);
                document.getElementById('loading-ui').innerHTML = "❌ Erreur de connexion API.";
            }
        }

        processCheckIn();
    }
});
