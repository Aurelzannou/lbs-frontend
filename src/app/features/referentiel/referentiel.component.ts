import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NbIconModule } from '@nebular/theme';

@Component({
  selector: 'app-referentiel',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NbIconModule],
  templateUrl: './referentiel.component.html',
  styleUrl: './referentiel.component.scss'
})
export class ReferentielComponent {}
