/** * 🎯 CONFIGURATION ADNOV TOUR - Système Automatisé Master
 * 🧠 LE CERVEAU CENTRAL (100% SÉCURISÉ)
 * Gère : Inscription, Validation, Double-Listing Brevo et Design Dynamique.
 */ 

// 🛡️ TON URL GOOGLE (Gère tout, protège ta clé API Brevo)
const GOOGLE_API_URL = "https://script.google.com/macros/s/AKfycbwr31X28WxX8WBFa3Nf9VufMcjhXs-v-oc0suhZ9488DuH8P_DmwI_oSYxqcMEAcOK2/exec";

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

    // Bloquer si l'événement est inactif
    if (config.actif === false && config.id !== "default") { 
        document.body.innerHTML = `<div style="display:flex; justify-content:center; align-items:center; height:100vh; background:#0f172a; color:white; font-family:sans-serif; text-align:center; padding:20px;"><div><h1 style="color:#fdc533; font-size:40px;">🛡️</h1><h2 style="margin-top:10px;">Accès Suspendu</h2><p style="color:#94a3b8; margin-top:10px;">Le portail ADNOV est temporairement inactif.</p></div></div>`; 
        throw new Error("Événement inactif."); 
    } 

    // Variables CSS
    document.documentElement.style.setProperty('--primary', config.couleur); 
    document.documentElement.style.setProperty('--accent', config.couleurAccent); 
    document.title = config.nom + " | Portail Officiel"; 
    
    // Titres dynamiques
    document.querySelectorAll('.nom-event').forEach(el => el.innerText = config.nom); 
    return config; 
}

/**
 * 🛠️ MODULE 2 : UTILITAIRES
 */
const helpers = {
    formatPhone: (number) => {
        let n = number.trim().replace(/\s/g, '');
        if (n.startsWith('0')) return '+33' + n.substring(1);
        return n;
    }
};

/**
 * 🚀 MODULE 3 : LOGIQUE PRINCIPALE
 */
document.addEventListener('DOMContentLoaded', () => {
    const config = appliquerConfig();

    // =========================================================
    // A. GESTION DE LA LANDING PAGE (Inscription via Google)
    // =========================================================
    const formInscription = document.getElementById('form-inscription');
    if (formInscription) {
        formInscription.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-submit');
            btn.innerHTML = 'Connexion Sécurisée...';
            btn.disabled = true;

            const payload = {
                action: "register", // On précise à Google que c'est une inscription
                email: document.getElementById('email').value.trim(),
                listIds: config.listeInscription,
                attributes: {
                    PRESENCE: document.querySelector('input[name="PRESENCE"]:checked')?.value || "",
                    NOM: document.getElementById('nom').value.trim(),
                    PRENOM: document.getElementById('prenom').value.trim(),
                    VILLE: document.getElementById('ville').value.trim(),
                    ETUDES: document.getElementById('etudes').value.trim(),
                    FONCTION: document.getElementById('fonction').value.trim(),
                    SMS: helpers.formatPhone(document.getElementById('sms').value),
                    COMMERCIAL_REFERENT: document.getElementById('commercial').value.trim(),
                    CENTRES_INTERET: document.querySelector('input[name="INTERETS"]:checked')?.value || "",
                    A_RECONTACTER: document.getElementById('recontacter').checked,
                    OPT_IN: document.getElementById('optin').checked,
                    STATUT_EVENT: config.statutInscription
                }
            };

            try {
                const res = await fetch(GOOGLE_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Format obligatoire pour Google
                    body: JSON.stringify(payload)
                });
                
                if (res.ok) {
                    document.getElementById('summary-name').innerHTML = `<strong>${payload.attributes.PRENOM} ${payload.attributes.NOM}</strong>`;
                    if(document.getElementById('summary-etude')) document.getElementById('summary-etude').innerText = payload.attributes.ETUDES;
                    document.getElementById('form-state').style.display = 'none';
                    document.getElementById('success-state').style.display = 'block';
                } else {
                    alert("Erreur Serveur Google");
                    btn.disabled = false; btn.innerHTML = "S'INSCRIRE";
                }
            } catch (err) { 
                alert("Erreur réseau."); 
                btn.disabled = false; btn.innerHTML = "S'INSCRIRE"; 
            }
        });
    }

    // =========================================================
    // B. GESTION DE LA VALIDATION (Scanner via Google)
    // =========================================================
    const validerContainer = document.getElementById('loading-ui');
    if (validerContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');

        async function processCheckIn() {
            if (!email) {
                validerContainer.innerHTML = "❌ Email manquant dans l'URL.";
                return;
            }

            const payloadCheckin = {
                action: "checkin", // On précise à Google que c'est un check-in (scan)
                email: email,
                listIds: config.listePassage,
                attributes: { STATUT_EVENT: config.statutPresence }
            };

            try {
                // On interroge Google (qui lui va interroger Brevo)
                const res = await fetch(GOOGLE_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payloadCheckin)
                });

                if (res.ok) {
                    const data = await res.json();
                    
                    // Si Brevo a renvoyé une erreur via Google (ex: contact introuvable)
                    if (data.code === "document_not_found" || data.error) {
                        throw new Error("Badge Inconnu");
                    }

                    const attr = data.attributes || {};
                    
                    document.getElementById('loading-ui').style.display = 'none';
                    document.getElementById('result-ui').style.display = 'block';

                    // Mapping des champs
                    const fields = {
                        'res-fullname': `${attr.PRENOM || ""} ${attr.NOM || ""}`,
                        'res-fonction': attr.FONCTION || "Non renseigné",
                        'res-etude': attr.ETUDES || "-",
                        'res-ville': attr.VILLE || "-",
                        'res-commercial': attr.COMMERCIAL_REFERENT || "Aucun",
                        'res-interet': attr.CENTRES_INTERET || "Général",
                        'res-presence': attr.PRESENCE || "Non renseigné",
                        'res-email': data.email || email
                    };

                    Object.keys(fields).forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.innerText = fields[id];
                    });
                    
                    const statusBadge = document.getElementById('res-status');
                    if (statusBadge) {
                        statusBadge.innerHTML = "✅ ENTRÉE VALIDÉE & LISTE DE PASSAGE MISE À JOUR";
                        statusBadge.className = "status-badge status-success";
                    }

                } else {
                    throw new Error("Badge Inconnu");
                }
            } catch (err) { 
                console.error(err);
                document.getElementById('loading-ui').innerHTML = `
                    <div style="font-size:50px; margin-bottom:20px;">❌</div>
                    <h1 style="font-size:24px;">Badge Inconnu</h1>
                    <p style="color:#94a3b8; margin: 15px 0 25px;">Non inscrit dans la base ADNOV.</p>
                    <a href="${config.formPassage}" target="_blank" style="background:#fdc533; color:#0a3f70; padding:18px; border-radius:14px; text-decoration:none; font-weight:800; display:block; margin-bottom:15px; box-shadow: 0 10px 20px rgba(253,197,51,0.2);">INSCRIPTION SUR PLACE</a>
                    <a href="scan.html" style="color:white; opacity:0.6; text-decoration:none; font-size:13px; font-weight:700;">RETOUR SCAN</a>`;
            }
        }
        processCheckIn();
    }
});
