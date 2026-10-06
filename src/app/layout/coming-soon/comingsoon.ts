import { Component, inject } from "@angular/core";
import { AuthService } from "../../core/auth/auth.service";

@Component({
  imports: [],
  selector: 'app-coming-son',
  styleUrl: './comingsoon.scss',
  template: `
    <main>
        <h1>Coming Soon</h1>
    </main>
  `
})
export class ComingSoon {
  protected readonly auth = inject(AuthService);
}
