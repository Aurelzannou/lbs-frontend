import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <span class="created-by">
      Créé avec ♥ par <b><a href="#" target="_blank">LBS Team</a></b> 2026
    </span>
    <div class="socials">
      <a href="#" target="_blank" class="ion ion-social-github"></a>
      <a href="#" target="_blank" class="ion ion-social-facebook"></a>
      <a href="#" target="_blank" class="ion ion-social-twitter"></a>
      <a href="#" target="_blank" class="ion ion-social-linkedin"></a>
    </div>
  `,
  styles: [`
    @import '../../styles/themes';

    @include nb-install-component() {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .created-by {
        font-size: 0.875rem;
        color: nb-theme(text-hint-color);
        b a {
          text-decoration: none;
          color: nb-theme(text-primary-color);
        }
      }

      .socials {
        font-size: 1.5rem;
        a {
          padding: 0 0.5rem;
          text-decoration: none;
          color: nb-theme(text-hint-color);
          &:hover {
            color: nb-theme(text-primary-color);
          }
        }
      }
    }
  `],
})
export class FooterComponent {}
