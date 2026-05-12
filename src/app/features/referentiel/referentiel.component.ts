import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NbIconModule } from '@nebular/theme';
@Component({
  selector: 'app-referentiel',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatIconModule, NbIconModule],
  templateUrl: './referentiel.component.html',
  styleUrl: './referentiel.component.scss'
})
export class ReferentielComponent {}
