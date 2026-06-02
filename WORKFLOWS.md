# LBS Education — Workflows de numérisation
> École privée : Primaire + Collège enseignement général

---

## 1. WORKFLOW INSCRIPTION

```
Parent crée compte (portail)
        ↓
Remplit dossier enfant
(nom, prénom, date naissance, école d'origine, documents)
        ↓
Choisit la classe souhaitée + année scolaire
        ↓
Dossier soumis → statut "EN ATTENTE"
        ↓
Administration examine le dossier
        ↓
    ┌───────────┬──────────────┐
Accepté      Refusé       En attente
    ↓            ↓          docs manquants
Affectation   Notif parent      ↓
en classe                  Notif parent
    ↓
Génération de la fiche d'inscription
        ↓
Paiement des frais d'inscription (étape 1)
```

---

## 2. WORKFLOW PAIEMENTS / FRAIS SCOLAIRES

```
Frais définis par année scolaire
(inscription, scolarité tranche 1/2/3, fournitures…)
        ↓
Parent consulte les frais dus (portail)
        ↓
Effectue un paiement (Mobile Money / Caisse)
        ↓
Caissier enregistre l'opération
        ↓
Génération quittance automatique
        ↓
Solde mis à jour en temps réel
        ↓
Relance automatique si impayé
```

---

## 3. WORKFLOW ANNÉE SCOLAIRE

```
Ouverture nouvelle année scolaire
        ↓
Configuration des classes + niveaux
        ↓
Affectation professeurs → matières → classes
        ↓
Définition des périodes (trimestres)
        ↓
Réinscription des élèves existants
        ↓
        [Année en cours]
        ↓
Saisie notes → Calcul moyennes → Bulletins
        ↓
Clôture de l'année → Passage en classe supérieure
        ↓
Archivage
```

---

## 4. WORKFLOW NOTES & BULLETINS

```
Professeur se connecte
        ↓
Sélectionne matière + classe + période
        ↓
Saisit les notes (devoir, composition)
        ↓
Système calcule moyenne pondérée (coefficient)
        ↓
Validation par le prof
        ↓
Génération bulletin par élève
(moyenne générale, rang, appréciation)
        ↓
Bulletin disponible pour les parents (portail)
        ↓
Impression PDF possible
```

---

## 5. WORKFLOW ABSENCES & DISCIPLINE

```
Professeur signale absence en classe
        ↓
Système enregistre (matière, date, durée)
        ↓
Notification automatique au parent
        ↓
Parent justifie ou non
        ↓
Seuil d'absences dépassé → alerte direction
        ↓
Conseil de discipline si nécessaire
        ↓
Sanction enregistrée dans le dossier élève
```

---

## 6. WORKFLOW EMPLOI DU TEMPS

```
Admin définit les créneaux horaires
        ↓
Affecte professeur + matière + salle + classe
        ↓
Vérification conflits automatique
        ↓
Publication de l'emploi du temps
        ↓
Visible par : profs / élèves / parents
        ↓
Modification possible avec notification
```

---

## 7. WORKFLOW TABLEAU DE BORD (Direction)

```
Vue temps réel :
├── Effectifs par classe
├── Taux de paiement des frais
├── Absences du jour
├── Élèves en situation difficile (notes faibles)
├── Recettes / dépenses du mois
└── Inscriptions en attente
```

---

## Roadmap par phases

| Phase | Modules | Priorité | Statut |
|-------|---------|----------|--------|
| **Phase 1** | Inscription + Paiements + Dossier élève | Critique | 🔄 En cours |
| **Phase 2** | Notes + Bulletins + Emploi du temps | Haute | ⏳ À faire |
| **Phase 3** | Absences + Discipline + Dashboard stats | Moyenne | ⏳ À faire |
| **Phase 4** | Notifications push + Archives + Rapports PDF | Complément | ⏳ À faire |

---

## Base technique existante

### Frontend (Angular)
- ✅ Authentification unifiée (Admin + Parent)
- ✅ Administration : Utilisateurs, Profils, Menus
- ✅ Référentiel : Niveaux, Classes, Matières, Professeurs, Frais, Caisses, Coefficients, Périodes, Étapes, Types…
- ✅ Scolarité : Élèves, Dossiers d'inscription
- ✅ Portail Parents : Dashboard, Inscription
- ✅ UI cohérente (système rfm-*)

### Backend (Spring Boot)
- ✅ Keycloak (Auth + Rôles : ADMIN, LECTEUR, TUTEUR)
- ✅ Gestion utilisateurs + profils + menus
- ✅ Entités référentiel complètes
- ✅ Entités scolarité (Élève, Tuteur, Dossier)
- ✅ Inscription unifiée (Administrateur / Parent)
