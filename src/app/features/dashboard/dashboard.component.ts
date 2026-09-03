import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import {
  DashboardService,
  DashboardStats,
  PointMensuel,
  Repartition
} from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  template: `
    <div class="dash">
      <!-- Bannière -->
      <div class="banner">
        <div>
          <h1>Tableau de Bord</h1>
          <p>
            Vue d'ensemble de l'établissement
            <span *ngIf="stats"> · Année scolaire {{ stats.anneeScolaireLibelle }}</span>
          </p>
        </div>
        <button mat-button class="refresh" (click)="charger()" [disabled]="loading">
          <mat-icon>refresh</mat-icon> Actualiser
        </button>
      </div>

      <div class="loading" *ngIf="loading">
        <mat-spinner diameter="34"></mat-spinner>
      </div>

      <ng-container *ngIf="stats && !loading">
        <!-- KPI -->
        <div class="kpis">
          <div class="kpi">
            <div class="kpi-ic students"><mat-icon>people</mat-icon></div>
            <div><span class="kpi-lbl">Élèves</span><span class="kpi-val">{{ stats.nbEleves | number }}</span></div>
          </div>
          <div class="kpi">
            <div class="kpi-ic teachers"><mat-icon>school</mat-icon></div>
            <div><span class="kpi-lbl">Professeurs</span><span class="kpi-val">{{ stats.nbProfesseurs | number }}</span></div>
          </div>
          <div class="kpi">
            <div class="kpi-ic classes"><mat-icon>meeting_room</mat-icon></div>
            <div><span class="kpi-lbl">Classes</span><span class="kpi-val">{{ stats.nbClasses | number }}</span></div>
          </div>
          <div class="kpi">
            <div class="kpi-ic files"><mat-icon>folder_open</mat-icon></div>
            <div>
              <span class="kpi-lbl">Dossiers d'inscription</span>
              <span class="kpi-val">{{ stats.totalDossiers | number }}</span>
              <span class="kpi-sub">
                {{ stats.dossiersAcceptes + stats.dossiersInscrits }} acceptés · {{ stats.dossiersDeposes }} en attente
              </span>
            </div>
          </div>
        </div>

        <!-- Finances -->
        <div class="kpis finance">
          <div class="kpi money">
            <div class="kpi-ic in"><mat-icon>trending_up</mat-icon></div>
            <div><span class="kpi-lbl">Encaissé</span><span class="kpi-val">{{ stats.totalEncaisse | number: '1.0-0' }} FCFA</span></div>
          </div>
          <div class="kpi money">
            <div class="kpi-ic out"><mat-icon>trending_down</mat-icon></div>
            <div><span class="kpi-lbl">Dépenses</span><span class="kpi-val">{{ stats.totalDepenses | number: '1.0-0' }} FCFA</span></div>
          </div>
          <div class="kpi money">
            <div class="kpi-ic bank"><mat-icon>account_balance</mat-icon></div>
            <div><span class="kpi-lbl">Solde des caisses</span><span class="kpi-val">{{ stats.soldeCaisses | number: '1.0-0' }} FCFA</span></div>
          </div>
          <div class="kpi money">
            <div class="kpi-ic due"><mat-icon>schedule</mat-icon></div>
            <div><span class="kpi-lbl">Reste à recouvrer</span><span class="kpi-val">{{ stats.resteAPayerTotal | number: '1.0-0' }} FCFA</span></div>
          </div>
        </div>

        <!-- Graphiques -->
        <div class="charts">
          <div class="chart-card">
            <h3>Inscriptions — 6 derniers mois</h3>
            <div class="bars" *ngIf="totalSerie(stats.inscriptionsParMois) > 0; else vide">
              <div class="bar-col" *ngFor="let p of stats.inscriptionsParMois">
                <span class="bar-num">{{ p.valeur | number: '1.0-0' }}</span>
                <div class="bar amber" [style.height.%]="hauteur(p.valeur, maxSerie(stats.inscriptionsParMois))"></div>
                <span class="bar-lbl">{{ moisCourt(p.mois) }}</span>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <h3>Encaissements — 6 derniers mois</h3>
            <div class="bars" *ngIf="totalSerie(stats.encaissementsParMois) > 0; else vide">
              <div class="bar-col" *ngFor="let p of stats.encaissementsParMois">
                <span class="bar-num">{{ compact(p.valeur) }}</span>
                <div class="bar green" [style.height.%]="hauteur(p.valeur, maxSerie(stats.encaissementsParMois))"></div>
                <span class="bar-lbl">{{ moisCourt(p.mois) }}</span>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <h3>Dossiers par statut</h3>
            <div class="hbars" *ngIf="totalRep(stats.dossiersParStatut) > 0; else vide">
              <div class="hbar-row" *ngFor="let r of stats.dossiersParStatut">
                <span class="hbar-lbl">{{ r.libelle }}</span>
                <div class="hbar-track">
                  <div class="hbar-fill" [class]="classeStatut(r.libelle)"
                       [style.width.%]="hauteur(r.valeur, maxRep(stats.dossiersParStatut))"></div>
                </div>
                <span class="hbar-num">{{ r.valeur }}</span>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <h3>Effectif par classe</h3>
            <div class="hbars" *ngIf="stats.effectifParClasse.length; else vide">
              <div class="hbar-row" *ngFor="let r of stats.effectifParClasse | slice: 0:8">
                <span class="hbar-lbl">{{ r.libelle }}</span>
                <div class="hbar-track">
                  <div class="hbar-fill amber"
                       [style.width.%]="hauteur(r.valeur, maxRep(stats.effectifParClasse))"></div>
                </div>
                <span class="hbar-num">{{ r.valeur }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes & Bulletins -->
        <ng-container *ngIf="stats.notesBulletins as nb">
          <h2 class="sec-title">
            Notes &amp; bulletins
            <span *ngIf="nb.periodeLibelle"> · {{ nb.periodeLibelle }}</span>
          </h2>

          <!-- À traiter -->
          <div class="chart-card wide atraiter"
               *ngIf="nb.matieresATraiter.length"
               style="margin-top:0; margin-bottom:1.25rem;">
            <h3>
              À traiter — {{ nb.periodeLibelle }}
              <span class="wide-sub">
                {{ nb.matieresAValider }} à approuver · {{ nb.matieresEnSaisie }} en saisie
              </span>
            </h3>
            <div class="tt-list">
              <div class="tt-row" *ngFor="let m of nb.matieresATraiter"
                   [class.clickable]="m.etat === 'A_VALIDER'"
                   (click)="m.etat === 'A_VALIDER' && allerValidation()">
                <span class="tt-badge" [class.b-val]="m.etat === 'A_VALIDER'" [class.b-sai]="m.etat === 'EN_SAISIE'">
                  {{ m.etat === 'A_VALIDER' ? 'À approuver' : 'En saisie' }}
                </span>
                <span class="tt-txt">
                  <strong>{{ m.classeLibelle }}</strong> · {{ m.matiereLibelle }}
                  <span class="tt-hint" *ngIf="m.etat === 'A_VALIDER'">
                    — l'enseignant a envoyé ses notes, l'administration doit les approuver
                  </span>
                </span>
                <mat-icon *ngIf="m.etat === 'A_VALIDER'" class="tt-go">chevron_right</mat-icon>
              </div>
            </div>
          </div>

          <div class="charts">
            <div class="chart-card">
              <h3>Saisie des notes · {{ nb.periodeLibelle }}</h3>
              <div class="prog">
                <div class="prog-track">
                  <div class="prog-fill amber"
                       [style.width.%]="pct(nb.feuillesSoumises, nb.feuillesAttendues)"></div>
                </div>
                <span class="prog-txt">
                  <strong>{{ nb.feuillesSoumises }}</strong> / {{ nb.feuillesAttendues }} feuilles
                  soumises par les professeurs ({{ pct(nb.feuillesSoumises, nb.feuillesAttendues) }} %)
                </span>
              </div>
            </div>

            <div class="chart-card">
              <h3>Bulletins validés · {{ nb.periodeLibelle }}</h3>
              <div class="prog">
                <div class="prog-track">
                  <div class="prog-fill green"
                       [style.width.%]="pct(nb.classesBulletinValide, nb.classesTotal)"></div>
                </div>
                <span class="prog-txt">
                  <strong>{{ nb.classesBulletinValide }}</strong> / {{ nb.classesTotal }} classes
                  ({{ pct(nb.classesBulletinValide, nb.classesTotal) }} %)
                </span>
              </div>
            </div>

            <div class="chart-card">
              <h3>Résultats de l'établissement</h3>
              <div *ngIf="nb.moyenneEtablissement != null; else pasDeBulletin" class="resultats">
                <div class="res-big">
                  <span class="res-val">{{ nb.moyenneEtablissement | number: '1.2-2' }}</span>
                  <span class="res-lbl">Moyenne générale</span>
                </div>
                <div class="res-big">
                  <span class="res-val">{{ nb.tauxReussite | number: '1.0-0' }} %</span>
                  <span class="res-lbl">Taux de réussite (≥ 10)</span>
                </div>
              </div>
              <ng-template #pasDeBulletin>
                <div class="chart-vide">Aucun bulletin validé pour cette période.</div>
              </ng-template>
            </div>

            <div class="chart-card" *ngIf="nb.moyenneEtablissement != null">
              <h3>Répartition des moyennes</h3>
              <div class="hbars">
                <div class="hbar-row" *ngFor="let r of nb.repartitionMoyennes">
                  <span class="hbar-lbl">{{ r.libelle }}</span>
                  <div class="hbar-track">
                    <div class="hbar-fill" [class]="classeTranche(r.libelle)"
                         [style.width.%]="hauteur(r.valeur, maxRep(nb.repartitionMoyennes))"></div>
                  </div>
                  <span class="hbar-num">{{ r.valeur }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Validation des matières par classe (année entière) -->
          <div class="chart-card wide" *ngIf="nb.validationParClasse.length">
            <h3>
              Validation des matières par classe — année entière
              <span class="wide-sub">
                {{ nb.matieresValideesAnnee }} / {{ nb.matieresAttenduesAnnee }} validées
                · {{ nb.nbPeriodesAnnee }} période(s)
              </span>
            </h3>
            <div class="cls-grid">
              <div class="cls-row" *ngFor="let c of nb.validationParClasse">
                <span class="cls-name">{{ c.classeLibelle }}</span>
                <div class="hbar-track">
                  <div class="hbar-fill green"
                       [style.width.%]="pct(c.matieresValidees, c.matieresAttendues)"></div>
                </div>
                <span class="cls-num">
                  {{ c.matieresValidees }} / {{ c.matieresAttendues }}
                  <span class="cls-rest" *ngIf="c.matieresAttendues - c.matieresValidees > 0">
                    · {{ c.matieresAttendues - c.matieresValidees }} à valider
                  </span>
                  <span class="cls-ok" *ngIf="c.matieresAttendues > 0 && c.matieresValidees >= c.matieresAttendues">
                    · complet
                  </span>
                </span>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- Actions -->
        <div class="actions">
          <button mat-flat-button class="act primary" routerLink="/scolarite/inscriptions">
            <mat-icon>person_add</mat-icon> Nouvelle inscription
          </button>
          <button mat-flat-button class="act" routerLink="/comptabilite/paiements">
            <mat-icon>payments</mat-icon> Encaisser un frais
          </button>
          <button mat-flat-button class="act" routerLink="/comptabilite/suivi">
            <mat-icon>pie_chart</mat-icon> Suivi des paiements
          </button>
        </div>
      </ng-container>

      <ng-template #vide><div class="chart-vide">Aucune donnée sur la période.</div></ng-template>
    </div>
  `,
  styles: `
    .dash { max-width: 1400px; margin: 0 auto; padding: 1.5rem; }

    .banner {
      background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
      border-radius: 1.5rem; padding: 1.75rem 2rem; margin-bottom: 1.75rem;
      color: #451a03; display: flex; justify-content: space-between; align-items: center; gap: 1rem;
      h1 { font-size: 1.9rem; font-weight: 900; margin: 0 0 .3rem; }
      p { margin: 0; font-weight: 600; opacity: .9; }
      .refresh { background: rgba(255,255,255,.25); color: #451a03; font-weight: 700; border-radius: .75rem; }
    }

    .loading { display: flex; justify-content: center; padding: 3rem; }

    .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
    .kpis.finance { margin-bottom: 1.75rem; }

    .kpi {
      display: flex; align-items: center; gap: .9rem;
      background: white; border: 1px solid #f1f5f9; border-radius: 1rem; padding: 1rem 1.1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,.04);
      div:last-child { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
    }
    .kpi-ic {
      width: 46px; height: 46px; border-radius: .8rem; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      mat-icon { color: white; font-size: 24px; width: 24px; height: 24px; }
    }
    .kpi-ic.students { background: linear-gradient(135deg,#fbbf24,#f59e0b); }
    .kpi-ic.teachers { background: linear-gradient(135deg,#78350f,#451a03); }
    .kpi-ic.classes  { background: linear-gradient(135deg,#d97706,#b45309); }
    .kpi-ic.files    { background: linear-gradient(135deg,#2563eb,#1d4ed8); }
    .kpi-ic.in    { background: linear-gradient(135deg,#059669,#047857); }
    .kpi-ic.out   { background: linear-gradient(135deg,#dc2626,#b91c1c); }
    .kpi-ic.bank  { background: linear-gradient(135deg,#2563eb,#1d4ed8); }
    .kpi-ic.due   { background: linear-gradient(135deg,#d97706,#b45309); }

    .kpi-lbl { font-size: .68rem; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; color: #64748b; }
    .kpi-val { font-size: 1.3rem; font-weight: 800; color: #1e293b; white-space: nowrap; }
    .kpi.money .kpi-val { font-size: 1.1rem; }
    .kpi-sub { font-size: .72rem; color: #94a3b8; }

    .charts { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.25rem; margin-bottom: 1.75rem; }
    .chart-card {
      background: white; border: 1px solid #f1f5f9; border-radius: 1rem; padding: 1.1rem 1.25rem;
      box-shadow: 0 2px 8px rgba(0,0,0,.04);
      h3 { margin: 0 0 1rem; font-size: .95rem; font-weight: 800; color: #334155; }
    }

    .bars { display: flex; align-items: flex-end; gap: .6rem; height: 170px; }
    .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; }
    .bar-num { font-size: .68rem; font-weight: 700; color: #64748b; margin-bottom: .25rem; }
    .bar {
      width: 100%; max-width: 42px; min-height: 3px; border-radius: 6px 6px 0 0;
      margin-top: auto; transition: height .4s ease;
    }
    .bar.amber { background: linear-gradient(180deg,#fbbf24,#f59e0b); }
    .bar.green { background: linear-gradient(180deg,#34d399,#059669); }
    .bar-lbl { font-size: .68rem; color: #94a3b8; margin-top: .35rem; font-weight: 600; }

    .hbars { display: flex; flex-direction: column; gap: .55rem; }
    .hbar-row { display: grid; grid-template-columns: 92px 1fr 38px; align-items: center; gap: .6rem; }
    .hbar-lbl { font-size: .78rem; color: #475569; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .hbar-track { background: #f1f5f9; border-radius: 20px; height: 12px; overflow: hidden; }
    .hbar-fill { height: 100%; border-radius: 20px; transition: width .4s ease; background: #94a3b8; }
    .hbar-fill.amber { background: linear-gradient(90deg,#fbbf24,#f59e0b); }
    .hbar-fill.st-depose { background: #f59e0b; }
    .hbar-fill.st-accepte, .hbar-fill.st-inscrit { background: #059669; }
    .hbar-fill.st-refuse { background: #dc2626; }
    .hbar-num { font-size: .78rem; font-weight: 800; color: #1e293b; text-align: right; }

    .chart-vide { color: #94a3b8; font-size: .85rem; padding: 2rem 0; text-align: center; }

    .sec-title { font-size: 1.1rem; font-weight: 800; color: #334155; margin: .5rem 0 1rem;
      span { color: #94a3b8; font-weight: 600; } }

    .atraiter .tt-list { display: flex; flex-direction: column; gap: .4rem; }
    .tt-row {
      display: grid; grid-template-columns: 92px 1fr auto; align-items: center; gap: .7rem;
      padding: .5rem .6rem; border-radius: .6rem; background: #f8fafc;
      &.clickable { cursor: pointer; &:hover { background: #fef3c7; } }
    }
    .tt-badge {
      font-size: .68rem; font-weight: 800; text-align: center; padding: .18rem .3rem;
      border-radius: 20px; white-space: nowrap;
      &.b-val { background: #fde68a; color: #92400e; }
      &.b-sai { background: #dbeafe; color: #1d4ed8; }
    }
    .tt-txt { font-size: .82rem; color: #334155; }
    .tt-hint { color: #d97706; font-weight: 600; font-size: .76rem; }
    .tt-go { opacity: .5; }

    .prog { display: flex; flex-direction: column; gap: .6rem; }
    .prog-track { background: #f1f5f9; border-radius: 20px; height: 16px; overflow: hidden; }
    .prog-fill { height: 100%; border-radius: 20px; transition: width .4s ease; }
    .prog-fill.amber { background: linear-gradient(90deg,#fbbf24,#f59e0b); }
    .prog-fill.green { background: linear-gradient(90deg,#34d399,#059669); }
    .prog-txt { font-size: .82rem; color: #475569; }

    .resultats { display: flex; gap: 1.5rem; flex-wrap: wrap; }
    .res-big { display: flex; flex-direction: column; }
    .res-val { font-size: 1.7rem; font-weight: 900; color: #1e293b; }
    .res-lbl { font-size: .72rem; color: #94a3b8; font-weight: 600; }

    .hbar-fill.tr-a { background: #059669; }
    .hbar-fill.tr-b { background: #10b981; }
    .hbar-fill.tr-c { background: #fbbf24; }
    .hbar-fill.tr-d { background: #f59e0b; }
    .hbar-fill.tr-e { background: #dc2626; }

    .chart-card.wide { grid-column: 1 / -1; margin-top: 1.25rem; }
    .wide-sub { font-size: .78rem; font-weight: 600; color: #94a3b8; margin-left: .5rem; }
    .cls-grid { display: flex; flex-direction: column; gap: .5rem; }
    .cls-row { display: grid; grid-template-columns: 110px 1fr auto; align-items: center; gap: .75rem; }
    .cls-name { font-size: .82rem; font-weight: 700; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cls-num { font-size: .78rem; font-weight: 700; color: #1e293b; white-space: nowrap; }
    .cls-rest { color: #d97706; font-weight: 600; }
    .cls-ok { color: #059669; font-weight: 700; }

    .actions { display: flex; flex-wrap: wrap; gap: .75rem; }
    .act {
      height: 2.9rem; border-radius: .8rem; font-weight: 700; display: inline-flex; align-items: center; gap: .5rem;
      background: #f1f5f9; color: #334155;
      &.primary { background: #fbbf24; color: #451a03; }
    }

    @media (max-width: 640px) {
      .banner { flex-direction: column; align-items: flex-start; }
      .hbar-row { grid-template-columns: 80px 1fr 32px; }
    }
  `
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  stats: DashboardStats | null = null;
  loading = true;

  allerValidation(): void {
    // L'approbation des notes reçues se fait sur l'écran "Saisie des notes".
    this.router.navigate(['/notes/saisie']);
  }

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.dashboardService.getStats().subscribe({
      next: (s) => {
        this.stats = s;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  maxSerie(serie: PointMensuel[]): number {
    return Math.max(1, ...serie.map((p) => p.valeur));
  }
  totalSerie(serie: PointMensuel[]): number {
    return serie.reduce((a, p) => a + p.valeur, 0);
  }
  maxRep(rep: Repartition[]): number {
    return Math.max(1, ...rep.map((r) => r.valeur));
  }
  totalRep(rep: Repartition[]): number {
    return rep.reduce((a, r) => a + r.valeur, 0);
  }

  hauteur(valeur: number, max: number): number {
    if (max <= 0) return 0;
    return Math.round((valeur / max) * 100);
  }

  pct(a: number, b: number): number {
    if (!b) return 0;
    return Math.round((a / b) * 100);
  }

  classeTranche(libelle: string): string {
    const map: Record<string, string> = {
      '≥ 16': 'tr-a',
      '14 – 16': 'tr-b',
      '12 – 14': 'tr-c',
      '10 – 12': 'tr-d',
      '< 10': 'tr-e'
    };
    return map[libelle] || 'amber';
  }

  moisCourt(mois: string): string {
    const [y, m] = mois.split('-');
    const noms = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
    return `${noms[Number(m) - 1]} ${y.slice(2)}`;
  }

  compact(v: number): string {
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace('.0', '') + 'M';
    if (v >= 1_000) return Math.round(v / 1_000) + 'k';
    return String(Math.round(v));
  }

  classeStatut(libelle: string): string {
    const map: Record<string, string> = {
      Déposé: 'st-depose',
      Accepté: 'st-accepte',
      Inscrit: 'st-inscrit',
      Refusé: 'st-refuse'
    };
    return map[libelle] || '';
  }
}
