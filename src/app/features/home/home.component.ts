import { Component, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface Atout {
  icon: string;
  titre: string;
  description: string;
}

interface Cycle {
  icon: string;
  titre: string;
  tranche: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private document = inject(DOCUMENT);

  readonly annee = new Date().getFullYear();

  /** Coordonnées de l'école. */
  readonly ecole = {
    nom: 'La Bonne Semence',
    sigle: 'LBS',
    lieu: 'Djeffa',
    telephoneAffiche: '01 97 07 91 64',
    // Format international pour les liens tel: / WhatsApp (Bénin, +229)
    telephoneLien: '+22997079164',
    whatsapp: 'https://wa.me/22997079164'
  };

  // TODO (à confirmer avec l'école) : remplacer par les vrais chiffres
  // (année de création, nombre d'élèves, taux de réussite aux examens…).
  readonly reperes = [
    { valeur: 'Maternelle → Lycée', label: 'Tous les cycles sur un même site' },
    { valeur: 'Effectifs réduits', label: 'Un suivi vraiment personnalisé' },
    { valeur: 'Djeffa', label: 'Un cadre calme et sécurisé' }
  ];

  readonly raisons: Atout[] = [
    {
      icon: 'workspace_premium',
      titre: 'De vrais résultats',
      description:
        "Un programme rigoureux et une préparation sérieuse aux examens officiels (CEP, BEPC, BAC). Nous visons la réussite de chaque élève, pas seulement de la classe."
    },
    {
      icon: 'groups',
      titre: 'Un encadrement de proximité',
      description:
        "Des enseignants qualifiés et des classes à effectif réduit : votre enfant est connu, écouté et accompagné individuellement tout au long de l'année."
    },
    {
      icon: 'volunteer_activism',
      titre: 'Des valeurs qui portent du fruit',
      description:
        "Discipline, respect, honnêteté et goût de l'effort. « La bonne semence » donne de bons fruits : nous formons des élèves solides, sur le plan scolaire comme humain."
    },
    {
      icon: 'verified_user',
      titre: 'Un environnement rassurant',
      description:
        "Une cour clôturée et surveillée, un accès contrôlé et une communication régulière avec les parents. Vous confiez votre enfant à un cadre sûr, à Djeffa."
    }
  ];

  // TODO (à confirmer) : cycles réellement ouverts + tranches d'âge exactes.
  readonly cycles: Cycle[] = [
    {
      icon: 'child_care',
      titre: 'Maternelle',
      tranche: '3 – 5 ans',
      description:
        "L'éveil, le langage et la socialisation dans un cadre bienveillant, pour donner à votre enfant le goût d'apprendre."
    },
    {
      icon: 'menu_book',
      titre: 'Primaire',
      tranche: 'CI – CM2',
      description:
        "Les bases solides : lecture, écriture, calcul et méthodes de travail, avec une initiation à l'anglais dès les premières classes."
    },
    {
      icon: 'school',
      titre: 'Collège & Lycée',
      tranche: '6ᵉ – Tˡᵉ',
      description:
        "Un accompagnement structuré de la 6ᵉ à la Terminale : cours de soutien, suivi rapproché des résultats et préparation exigeante au BEPC puis au Baccalauréat."
    }
  ];

  get isLoggedIn() {
    return this.authService.isLoggedIn;
  }

  navigate() {
    if (this.authService.isLoggedIn) {
      const roles = this.authService.getBusinessRoles();
      this.authService.redirectAfterLogin(roles);
    } else {
      this.router.navigate(['/login']);
    }
  }

  /** Va vers une route (création de compte parent, connexion…). */
  goTo(path: string) {
    this.router.navigate([path]);
  }

  scrollTo(id: string) {
    this.document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
